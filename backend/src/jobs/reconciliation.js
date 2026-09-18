const { Op } = require('sequelize');
const { sequelize, Payment, Booking, BookingStatusHistory, User, Service } = require('../models');
const { PAYMENT_STATUS, BOOKING_STATUS } = require('../config/constants');
const cashfreeService = require('../services/cashfree');
const emailService = require('../services/email');

const STALE_MINUTES = 5;
const POLL_INTERVAL_MS = 2 * 60 * 1000;

async function reconcile() {
  try {
    const cutoff = new Date(Date.now() - STALE_MINUTES * 60 * 1000);

    const stalePayments = await Payment.findAll({
      where: {
        status: { [Op.in]: [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.PROCESSING] },
        created_at: { [Op.lt]: cutoff },
      },
      include: [{ model: Booking, as: 'booking' }],
    });

    if (stalePayments.length === 0) return;

    for (const payment of stalePayments) {
      try {
        const cfResult = await cashfreeService.fetchOrder(payment.order_id);
        if (!cfResult.success) continue;

        const cfStatus = cfResult.data.orderStatus;

        if (cfStatus === 'PAID') {
          if (payment.status !== PAYMENT_STATUS.COMPLETED) {
            const transaction = await sequelize.transaction();
            try {
              await payment.update({
                status: PAYMENT_STATUS.COMPLETED,
                cf_order_id: cfResult.data.cfOrderId,
                raw_response: cfResult.data,
              }, { transaction });
              if (payment.booking.status === BOOKING_STATUS.PENDING_PAYMENT) {
                await payment.booking.update({ status: BOOKING_STATUS.PENDING }, { transaction });
                await BookingStatusHistory.create({
                  booking_id: payment.booking_id,
                  old_status: BOOKING_STATUS.PENDING_PAYMENT,
                  new_status: BOOKING_STATUS.PENDING,
                  changed_by: payment.customer_id,
                  remarks: 'Booking created',
                }, { transaction });
              }
              await transaction.commit();

              // Send reconciled payment success emails
              const [reconBooking, reconCustomer] = await Promise.all([
                Booking.findByPk(payment.booking_id, {
                  include: [
                    { model: Service, as: 'service', include: [{ model: require('../models').ServiceCategory, as: 'category' }] },
                    { model: require('../models').SubCategory, as: 'subcategories', through: { attributes: [] }, attributes: ['id', 'name', 'price'] },
                  ],
                }),
                User.findByPk(payment.customer_id, { attributes: ['id', 'name', 'email'] }),
              ]);
              if (reconCustomer && reconBooking) {
                emailService.sendPaymentSuccessful(payment, reconBooking, reconCustomer).catch(console.error);
                emailService.sendAdminNewBooking(reconBooking, reconCustomer).catch(console.error);
              }
            } catch (err) {
              await transaction.rollback();
              throw err;
            }
          }
        } else if (cfStatus === 'EXPIRED' || cfStatus === 'TERMINATED' || cfStatus === 'FAILED') {
          if (payment.status !== PAYMENT_STATUS.FAILED && payment.status !== PAYMENT_STATUS.EXPIRED) {
            const failureReason = cfStatus === 'FAILED' ? 'Payment failed' : cfStatus === 'TERMINATED' ? 'Terminated (reconciliation)' : 'Payment expired';
            await payment.update({ status: PAYMENT_STATUS.FAILED, failure_reason: failureReason });
            if (payment.booking.status === BOOKING_STATUS.PENDING_PAYMENT) {
              await payment.booking.update({ status: BOOKING_STATUS.CANCELLED });
            }

            // Send reconciled payment failed emails
            const [failBooking, failCustomer] = await Promise.all([
              Booking.findByPk(payment.booking_id, { include: [{ model: Service, as: 'service' }] }),
              User.findByPk(payment.customer_id, { attributes: ['id', 'name', 'email'] }),
            ]);
            if (failCustomer && failBooking) {
              emailService.sendPaymentFailed(payment, failBooking, failCustomer).catch(console.error);
              emailService.sendAdminPaymentFailure(payment, failBooking, failCustomer).catch(console.error);
            }
          }
        }
      } catch (err) {
        // Skip this payment, continue with others
      }
    }
  } catch (error) {
    // Reconciliation error - silent fail
  }
}

let intervalId = null;

module.exports = {
  start() {
    if (intervalId) return;
    intervalId = setInterval(reconcile, POLL_INTERVAL_MS);
    reconcile();
  },
  stop() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  },
  reconcile,
};
