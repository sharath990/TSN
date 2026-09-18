const crypto = require('crypto');
const { Op } = require('sequelize');
const { sequelize, Booking, Payment, Service, ServiceCategory, SubCategory, BookingSubCategory, BookingStatusHistory, ServiceArea, ServiceAreaService } = require('../models');
const { BOOKING_STATUS, PAYMENT_STATUS } = require('../config/constants');
const cashfreeService = require('../services/cashfree');
const paymentStream = require('../services/paymentStream');
const config = require('../config');
const { sendSuccess, sendError } = require('../utils/response');
const { generateBookingNumber } = require('../utils/helpers');
const { findServiceArea } = require('../utils/distance');
const emailService = require('../services/email');

const generateOrderId = () => {
  const ts = Date.now().toString(36);
  const rand = crypto.randomBytes(4).toString('hex');
  return `TSN_PAY_${ts}_${rand}`;
};

const generateRefundId = () => {
  const ts = Date.now().toString(36);
  const rand = crypto.randomBytes(3).toString('hex');
  return `TSN_REF_${ts}_${rand}`;
};

async function processSuccessfulPayment(payment, data) {
  const transaction = await sequelize.transaction();
  try {
    await payment.update({
      status: PAYMENT_STATUS.COMPLETED,
      cf_payment_id: data.paymentId || data.cf_payment_id,
      payment_method: data.paymentMethod || data.payment_method,
      raw_response: data,
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

    // Send emails after transaction commits
    const [bookingWithDetails, customer] = await Promise.all([
      Booking.findByPk(payment.booking_id, {
        include: [
          { model: Service, as: 'service', include: [{ model: ServiceCategory, as: 'category' }] },
          { model: SubCategory, as: 'subcategories', through: { attributes: [] }, attributes: ['id', 'name', 'price'] },
        ],
      }),
      User.findByPk(payment.customer_id, { attributes: ['id', 'name', 'email'] }),
    ]);

    if (customer && bookingWithDetails) {
      payment.booking = bookingWithDetails;
      emailService.sendPaymentSuccessful(payment, bookingWithDetails, customer).catch(console.error);
      emailService.sendAdminNewBooking(bookingWithDetails, customer).catch(console.error);
    }
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

exports.createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { service_id, booking_date, booking_time, address, notes, subcategory_ids, latitude, longitude, phone, house_flat, floor, landmark, pincode } = req.body;

    const service = await Service.findByPk(service_id, { transaction });
    if (!service) {
      await transaction.rollback();
      return sendError(res, 404, 'Service not found');
    }
    if (service.status === 'inactive') {
      await transaction.rollback();
      return sendError(res, 400, 'This service is currently unavailable');
    }

    const subIds = Array.isArray(subcategory_ids)
      ? subcategory_ids.map(Number)
      : subcategory_ids ? [Number(subcategory_ids)] : [];
    if (subIds.length === 0) {
      await transaction.rollback();
      return sendError(res, 400, 'Please select at least one subcategory');
    }

    const validSubs = await SubCategory.findAll({
      where: { id: { [Op.in]: subIds }, category_id: service.category_id, status: 'active' },
      transaction,
    });
    if (validSubs.length !== subIds.length) {
      await transaction.rollback();
      return sendError(res, 400, 'One or more selected subcategories are invalid');
    }

    const totalPrice = validSubs.reduce((sum, sub) => sum + parseFloat(sub.price), 0);

    const existingActive = await Booking.findOne({
      where: {
        customer_id: req.user.id,
        service_id,
        booking_date,
        status: { [Op.in]: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.RESCHEDULED] },
      },
      transaction,
    });

    if (existingActive) {
      const existingPayment = await Payment.findOne({
        where: { booking_id: existingActive.id, status: PAYMENT_STATUS.COMPLETED },
        transaction,
      });
      if (existingPayment) {
        await transaction.rollback();
        return sendError(res, 400, 'You already have an active booking for this service on this date');
      }
    }

    const stalePending = await Booking.findOne({
      where: {
        customer_id: req.user.id,
        service_id,
        booking_date,
        status: BOOKING_STATUS.PENDING_PAYMENT,
      },
      transaction,
    });

    if (stalePending) {
      await Payment.update(
        { status: PAYMENT_STATUS.FAILED, failure_reason: 'Superseded by new booking' },
        { where: { booking_id: stalePending.id, status: { [Op.in]: [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.PROCESSING] } }, transaction }
      );
      await stalePending.update({ status: BOOKING_STATUS.CANCELLED }, { transaction });
      await BookingStatusHistory.create({
        booking_id: stalePending.id,
        old_status: BOOKING_STATUS.PENDING_PAYMENT,
        new_status: BOOKING_STATUS.CANCELLED,
        changed_by: req.user.id,
        remarks: 'Superseded — customer rebooked after payment failure',
      }, { transaction });
    }

    let serviceAreaId = null;
    if (latitude && longitude) {
      const result = await findServiceArea(parseFloat(latitude), parseFloat(longitude), ServiceArea);
      if (!result) {
        await transaction.rollback();
        return sendError(res, 400, 'Service is not available in your area. We currently serve Yelahanka and nearby areas within 10 km.');
      }
      const serviceEnabled = await ServiceAreaService.findOne({
        where: { service_area_id: result.serviceArea.id, service_id, is_active: true },
        transaction,
      });
      if (!serviceEnabled) {
        await transaction.rollback();
        return sendError(res, 400, 'This service is not available in your area');
      }
      serviceAreaId = result.serviceArea.id;
    }

    const bookingNumber = generateBookingNumber();
    const orderId = generateOrderId();

    const booking = await Booking.create({
      booking_number: bookingNumber, customer_id: req.user.id, service_id,
      service_area_id: serviceAreaId,
      booking_date, booking_time, address, notes, total_price: totalPrice,
      latitude: latitude || null, longitude: longitude || null,
      phone: phone || req.user.phone || null,
      house_flat: house_flat || null,
      floor: floor || null,
      landmark: landmark || null,
      pincode: pincode || null,
      status: BOOKING_STATUS.PENDING_PAYMENT,
    }, { transaction });

    const junctionRecords = validSubs.map((sub) => ({ booking_id: booking.id, subcategory_id: sub.id }));
    await BookingSubCategory.bulkCreate(junctionRecords, { transaction });

    const payment = await Payment.create({
      order_id: orderId, booking_id: booking.id, customer_id: req.user.id,
      amount: totalPrice, currency: 'INR', status: PAYMENT_STATUS.PENDING,
    }, { transaction });

    await transaction.commit();

    const cfResult = await cashfreeService.createOrder({
      orderId, orderAmount: totalPrice,
      customerDetails: { customerId: `customer_${req.user.id}`, email: req.user.email, phone: req.user.phone || '9999999999' },
      orderMeta: { returnUrl: config.cashfree.returnUrl.replace('{order_id}', orderId), notifyUrl: config.cashfree.webhookUrl },
    });

    if (!cfResult.success) {
      await booking.update({ status: BOOKING_STATUS.CANCELLED });
      await payment.update({ status: PAYMENT_STATUS.FAILED, failure_reason: cfResult.message });
      return sendError(res, 500, cfResult.message);
    }

    await payment.update({ payment_session_id: cfResult.data.paymentSessionId, cf_order_id: cfResult.data.cfOrderId });

    const fullBooking = await Booking.findByPk(booking.id, {
      include: [
        { model: Service, as: 'service', include: [{ model: ServiceCategory, as: 'category' }] },
        { model: SubCategory, as: 'subcategories', through: { attributes: [] }, attributes: ['id', 'name', 'price'] },
      ],
    });

    sendSuccess(res, 201, 'Booking created, proceed to payment', {
      booking: fullBooking,
      payment: { orderId, paymentSessionId: cfResult.data.paymentSessionId, amount: totalPrice },
    });

    emailService.sendBookingCreated(fullBooking, req.user).catch(console.error);
  } catch (error) {
    await transaction.rollback();
    sendError(res, 500, error.message);
  }
};

exports.getStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const payment = await Payment.findOne({
      where: { order_id: orderId },
      include: [{
        model: Booking, as: 'booking',
        include: [
          { model: Service, as: 'service', include: [{ model: ServiceCategory, as: 'category' }] },
          { model: SubCategory, as: 'subcategories', through: { attributes: [] }, attributes: ['id', 'name', 'price'] },
        ],
      }],
    });
    if (!payment) return sendError(res, 404, 'Payment not found');
    if (req.user.role === 'customer' && payment.customer_id !== req.user.id) return sendError(res, 403, 'Not authorized');

    if (payment.status === PAYMENT_STATUS.PENDING || payment.status === PAYMENT_STATUS.PROCESSING) {
      const cfResult = await cashfreeService.fetchOrder(orderId);
      if (cfResult.success) {
        const cfStatus = cfResult.data.orderStatus;
        if (cfStatus === 'PAID') await processSuccessfulPayment(payment, cfResult.data);
        else if (cfStatus === 'EXPIRED' || cfStatus === 'TERMINATED' || cfStatus === 'FAILED') {
          const failureReason = cfStatus === 'FAILED' ? 'Payment failed' : cfStatus === 'TERMINATED' ? 'Payment terminated' : 'Payment expired';
          await payment.update({ status: PAYMENT_STATUS.FAILED, failure_reason: failureReason });
          if (payment.booking.status === BOOKING_STATUS.PENDING_PAYMENT) {
            await payment.booking.update({ status: BOOKING_STATUS.CANCELLED });
            await BookingStatusHistory.create({
              booking_id: payment.booking_id,
              old_status: BOOKING_STATUS.PENDING_PAYMENT,
              new_status: BOOKING_STATUS.CANCELLED,
              changed_by: payment.customer_id,
              remarks: failureReason,
            });
          }
        }
        await payment.reload({ include: [{ model: Booking, as: 'booking' }] });
      }
    }

    sendSuccess(res, 200, 'Payment status retrieved', {
      payment: { orderId: payment.order_id, status: payment.status, amount: payment.amount, paymentMethod: payment.payment_method, failureReason: payment.failure_reason, createdAt: payment.created_at, updatedAt: payment.updated_at },
      booking: payment.booking,
    });
  } catch (error) { sendError(res, 500, error.message); }
};

exports.webhookHandler = async (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    if (!signature || !timestamp || !req.rawBody) return res.status(400).json({ message: 'Missing webhook headers or body' });

    const verification = cashfreeService.verifyWebhookSignature(signature, req.rawBody, timestamp);
    if (!verification.success) return res.status(401).json({ message: 'Invalid webhook signature' });

    const event = req.body;
    const eventType = event.type;
    const orderData = event.data?.order;
    const paymentData = event.data?.payment;
    if (!orderData?.order_id) return res.status(400).json({ message: 'Missing order_id' });

    const payment = await Payment.findOne({ where: { order_id: orderData.order_id } });
    if (!payment) return res.status(200).json({ message: 'Payment not found, skipping' });
    if (payment.status === PAYMENT_STATUS.COMPLETED) return res.status(200).json({ message: 'Already processed' });

    await payment.update({ webhook_received_at: new Date() });

    if (eventType === 'PAYMENT_SUCCESS_WEBHOOK' && paymentData) {
      await processSuccessfulPayment(payment, {
        cfOrderId: orderData.cf_order_id, orderId: orderData.order_id, orderStatus: orderData.order_status,
        orderAmount: orderData.order_amount, paymentId: paymentData.cf_payment_id,
        paymentMethod: paymentData.payment_method, paymentStatus: paymentData.payment_status,
      });
      await payment.reload({ include: [{ model: Booking, as: 'booking' }] });
      paymentStream.push(orderData.order_id, {
        type: 'PAYMENT_SUCCESS',
        payment: { orderId: payment.order_id, status: 'completed', amount: payment.amount, paymentMethod: payment.payment_method },
        booking: payment.booking,
      });
    } else if (eventType === 'PAYMENT_FAILED_WEBHOOK') {
      await payment.update({ status: PAYMENT_STATUS.FAILED, failure_reason: paymentData?.payment_error_description || 'Payment failed', cf_payment_id: paymentData?.cf_payment_id, payment_method: paymentData?.payment_method, raw_response: event });
      await payment.booking.update({ status: BOOKING_STATUS.CANCELLED });
      await BookingStatusHistory.create({ booking_id: payment.booking_id, old_status: BOOKING_STATUS.PENDING_PAYMENT, new_status: BOOKING_STATUS.CANCELLED, changed_by: payment.customer_id, remarks: 'Payment failed' });
      paymentStream.push(orderData.order_id, {
        type: 'PAYMENT_FAILED',
        payment: { orderId: payment.order_id, status: 'failed', amount: payment.amount },
        booking: payment.booking,
      });

      // Send payment failed emails
      const failedBooking = await Booking.findByPk(payment.booking_id, { include: [{ model: Service, as: 'service' }] });
      const failedCustomer = await User.findByPk(payment.customer_id, { attributes: ['id', 'name', 'email'] });
      if (failedCustomer && failedBooking) {
        emailService.sendPaymentFailed(payment, failedBooking, failedCustomer).catch(console.error);
        emailService.sendAdminPaymentFailure(payment, failedBooking, failedCustomer).catch(console.error);
      }
    } else if (eventType === 'PAYMENT_EXPIRED_WEBHOOK') {
      await payment.update({ status: PAYMENT_STATUS.EXPIRED, raw_response: event });
      await payment.booking.update({ status: BOOKING_STATUS.CANCELLED });
      paymentStream.push(orderData.order_id, {
        type: 'PAYMENT_EXPIRED',
        payment: { orderId: payment.order_id, status: 'expired', amount: payment.amount },
        booking: payment.booking,
      });

      // Send payment expired email
      const expiredBooking = await Booking.findByPk(payment.booking_id, { include: [{ model: Service, as: 'service' }] });
      const expiredCustomer = await User.findByPk(payment.customer_id, { attributes: ['id', 'name', 'email'] });
      if (expiredCustomer && expiredBooking) {
        emailService.sendPaymentExpired(payment, expiredBooking, expiredCustomer).catch(console.error);
      }
    }
    res.status(200).json({ message: 'Webhook processed' });
  } catch (error) { res.status(500).json({ message: 'Webhook processing error' }); }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const payment = await Payment.findOne({
      where: { order_id: orderId },
      include: [{ model: Booking, as: 'booking', include: [
        { model: Service, as: 'service', include: [{ model: ServiceCategory, as: 'category' }] },
        { model: SubCategory, as: 'subcategories', through: { attributes: [] }, attributes: ['id', 'name', 'price'] },
      ] }],
    });
    if (!payment) return sendError(res, 404, 'Payment not found');

    if (payment.status === PAYMENT_STATUS.PENDING || payment.status === PAYMENT_STATUS.PROCESSING) {
      const cfResult = await cashfreeService.fetchOrder(orderId);
      if (cfResult.success) {
        const cfStatus = cfResult.data.orderStatus;
        if (cfStatus === 'PAID') {
          await processSuccessfulPayment(payment, cfResult.data);
          await payment.reload({ include: [{ model: Booking, as: 'booking' }] });
          paymentStream.push(orderId, {
            type: 'PAYMENT_SUCCESS',
            payment: { orderId: payment.order_id, status: 'completed', amount: payment.amount, paymentMethod: payment.payment_method },
            booking: payment.booking,
          });
        } else if (cfStatus === 'EXPIRED' || cfStatus === 'TERMINATED' || cfStatus === 'FAILED') {
          const failureReason = cfStatus === 'FAILED' ? 'Payment failed' : cfStatus === 'TERMINATED' ? 'Payment terminated' : 'Payment expired';
          await payment.update({ status: PAYMENT_STATUS.FAILED, failure_reason: failureReason });
          if (payment.booking.status === BOOKING_STATUS.PENDING_PAYMENT) {
            await payment.booking.update({ status: BOOKING_STATUS.CANCELLED });
            await BookingStatusHistory.create({
              booking_id: payment.booking_id,
              old_status: BOOKING_STATUS.PENDING_PAYMENT,
              new_status: BOOKING_STATUS.CANCELLED,
              changed_by: payment.customer_id,
              remarks: failureReason,
            });
          }
          await payment.reload();
          paymentStream.push(orderId, {
            type: 'PAYMENT_FAILED',
            payment: { orderId: payment.order_id, status: 'failed', amount: payment.amount },
            booking: payment.booking,
          });
        }
      }
    }

    sendSuccess(res, 200, 'Payment status', {
      payment: { orderId: payment.order_id, status: payment.status, amount: payment.amount, paymentMethod: payment.payment_method, failureReason: payment.failure_reason },
      booking: payment.booking,
    });
  } catch (error) { sendError(res, 500, error.message); }
};

exports.initiateRefund = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { refund_amount, refund_reason } = req.body;
    const payment = await Payment.findOne({ where: { order_id: orderId }, include: [{ model: Booking, as: 'booking' }] });
    if (!payment) return sendError(res, 404, 'Payment not found');
    if (payment.status !== PAYMENT_STATUS.COMPLETED) return sendError(res, 400, 'Can only refund completed payments');
    if (payment.refund_id) return sendError(res, 400, 'Refund already initiated');

    const refundAmount = refund_amount || payment.amount;
    if (parseFloat(refundAmount) > parseFloat(payment.amount)) return sendError(res, 400, 'Refund amount cannot exceed payment amount');

    const refundId = generateRefundId();
    const cfResult = await cashfreeService.initiateRefund({ orderId: payment.order_id, refundAmount: parseFloat(refundAmount), refundId, refundNote: refund_reason || 'Refund by admin' });
    if (!cfResult.success) return sendError(res, 500, cfResult.message);

    await payment.update({ status: PAYMENT_STATUS.REFUNDED, refund_amount: refundAmount, refund_id: refundId, refund_reason: refund_reason || 'Refund by admin' });
    await payment.booking.update({ status: BOOKING_STATUS.CANCELLED });
    await BookingStatusHistory.create({ booking_id: payment.booking_id, old_status: payment.booking.status, new_status: BOOKING_STATUS.CANCELLED, changed_by: req.user.id, remarks: `Refund initiated: ${refund_reason || 'Admin refund'}` });

    sendSuccess(res, 200, 'Refund initiated', { refund: { refundId, refundAmount, status: cfResult.data.refundStatus } });

    // Send refund emails
    const [refundBooking, refundCustomer] = await Promise.all([
      Booking.findByPk(payment.booking_id, { include: [{ model: Service, as: 'service' }] }),
      User.findByPk(payment.customer_id, { attributes: ['id', 'name', 'email'] }),
    ]);
    if (refundCustomer && refundBooking) {
      emailService.sendRefundInitiated(payment, refundBooking, refundCustomer).catch(console.error);
      emailService.sendAdminRefundRequest(payment, refundBooking, refundCustomer, refund_reason).catch(console.error);
    }
  } catch (error) { sendError(res, 500, error.message); }
};
