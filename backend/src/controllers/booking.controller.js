const { Op } = require('sequelize');
const { Booking, Payment, Service, ServiceCategory, SubCategory, BookingSubCategory, User, BookingStatusHistory } = require('../models');
const { BOOKING_STATUS } = require('../config/constants');
const { sendSuccess, sendError } = require('../utils/response');
const { getPagination, getPaginationMeta } = require('../utils/pagination');
const { getSortClause } = require('../utils/sort');
const emailService = require('../services/email');

const ALLOWED_SORT_COLUMNS = ['created_at', 'booking_date', 'status'];

const paymentInclude = {
  model: Payment,
  as: 'payment',
  attributes: ['id', 'order_id', 'amount', 'status', 'payment_method', 'refund_amount', 'refund_id'],
};

exports.getAll = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { status, service_id, category_id, customer_id, date_from, date_to, search } = req.query;

    const where = {};

    if (req.user.role === 'customer') {
      where.customer_id = req.user.id;
    }

    if (status) where.status = status;
    else if (req.user.role === 'customer') where.status = { [Op.ne]: BOOKING_STATUS.PENDING_PAYMENT };
    if (service_id) where.service_id = service_id;
    if (customer_id) where.customer_id = customer_id;
    if (date_from || date_to) {
      where.booking_date = {};
      if (date_from) where.booking_date[Op.gte] = date_from;
      if (date_to) where.booking_date[Op.lte] = date_to;
    }

    if (search) {
      where[Op.or] = [
        { booking_number: { [Op.like]: `%${search}%` } },
        { '$service.name$': { [Op.like]: `%${search}%` } },
        { '$customer.name$': { [Op.like]: `%${search}%` } },
      ];
    }

    const include = [
      {
        model: Service,
        as: 'service',
        include: [{ model: ServiceCategory, as: 'category', where: category_id ? { id: category_id } : undefined }],
      },
      {
        model: User,
        as: 'customer',
        attributes: ['id', 'name', 'email', 'phone'],
      },
      {
        model: SubCategory,
        as: 'subcategories',
        through: { attributes: [] },
        attributes: ['id', 'name', 'price'],
      },
      paymentInclude,
    ];

    const order = getSortClause(req.query, ALLOWED_SORT_COLUMNS, 'created_at', 'DESC');

    const { count, rows } = await Booking.findAndCountAll({
      where,
      include,
      limit,
      offset,
      order,
      distinct: true,
      col: 'id',
      subQuery: false,
    });

    sendSuccess(res, 200, 'Bookings retrieved', {
      bookings: rows,
      pagination: getPaginationMeta(count, page, limit),
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.getById = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        {
          model: Service,
          as: 'service',
          include: [
            { model: ServiceCategory, as: 'category' },
            { model: SubCategory, as: 'subcategories', through: { attributes: [] } },
          ],
        },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone'] },
        {
          model: SubCategory,
          as: 'subcategories',
          through: { attributes: [] },
          attributes: ['id', 'name', 'price'],
        },
        { model: BookingStatusHistory, as: 'statusHistory', include: [{ model: User, as: 'changedByUser', attributes: ['id', 'name'] }] },
        paymentInclude,
      ],
    });

    if (!booking) {
      return sendError(res, 404, 'Booking not found');
    }

    if (req.user.role === 'customer' && booking.customer_id !== req.user.id) {
      return sendError(res, 403, 'Not authorized to view this booking');
    }

    sendSuccess(res, 200, 'Booking retrieved', { booking });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, remarks, new_date, new_time } = req.body;

    const booking = await Booking.findByPk(req.params.id);
    if (!booking) {
      return sendError(res, 404, 'Booking not found');
    }

    const validTransitions = {
      [BOOKING_STATUS.PENDING_PAYMENT]: [BOOKING_STATUS.CANCELLED],
      [BOOKING_STATUS.PENDING]: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CANCELLED],
      [BOOKING_STATUS.CONFIRMED]: [BOOKING_STATUS.RESCHEDULED, BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CANCELLED],
      [BOOKING_STATUS.RESCHEDULED]: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CANCELLED],
    };

    const allowed = validTransitions[booking.status];
    if (!allowed || !allowed.includes(status)) {
      return sendError(res, 400, `Cannot change status from '${booking.status}' to '${status}'`);
    }

    const oldStatus = booking.status;
    const updateData = { status };

    if (status === BOOKING_STATUS.RESCHEDULED && new_date && new_time) {
      updateData.booking_date = new_date;
      updateData.booking_time = new_time;
    }

    await booking.update(updateData);

    await BookingStatusHistory.create({
      booking_id: booking.id,
      old_status: oldStatus,
      new_status: status,
      changed_by: req.user.id,
      remarks,
    });

    const updatedBooking = await Booking.findByPk(booking.id, {
      include: [
        {
          model: Service,
          as: 'service',
          include: [{ model: ServiceCategory, as: 'category' }],
        },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone'] },
        {
          model: SubCategory,
          as: 'subcategories',
          through: { attributes: [] },
          attributes: ['id', 'name', 'price'],
        },
        paymentInclude,
      ],
    });

    sendSuccess(res, 200, 'Booking status updated', { booking: updatedBooking });

    // Send status-specific emails
    const customer = updatedBooking.customer;
    if (customer) {
      switch (status) {
        case BOOKING_STATUS.CONFIRMED:
          emailService.sendBookingConfirmed(updatedBooking, customer).catch(console.error);
          break;
        case BOOKING_STATUS.RESCHEDULED: {
          const oldBooking = await Booking.findByPk(booking.id);
          emailService.sendBookingRescheduled(updatedBooking, customer, oldBooking.booking_date, oldBooking.booking_time).catch(console.error);
          break;
        }
        case BOOKING_STATUS.COMPLETED:
          emailService.sendBookingCompleted(updatedBooking, customer).catch(console.error);
          break;
        case BOOKING_STATUS.CANCELLED:
          emailService.sendBookingCancelled(updatedBooking, customer, remarks, 'admin').catch(console.error);
          emailService.sendAdminBookingCancelled(updatedBooking, customer, remarks).catch(console.error);
          break;
        default:
          break;
      }
    }
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.cancel = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        { model: Payment, as: 'payment' },
        { model: Service, as: 'service' },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
      ],
    });

    if (!booking) {
      return sendError(res, 404, 'Booking not found');
    }

    if (req.user.role === 'customer' && booking.customer_id !== req.user.id) {
      return sendError(res, 403, 'Not authorized to cancel this booking');
    }

    const allowedStatuses = [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.RESCHEDULED];
    if (!allowedStatuses.includes(booking.status)) {
      return sendError(res, 400, 'Booking cannot be cancelled in current status');
    }

    if (req.user.role === 'customer') {
      const bookingDateTime = new Date(`${booking.booking_date}T${booking.booking_time}`);
      const now = new Date();
      const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);
      if (hoursUntilBooking <= 24) {
        return sendError(res, 400, 'Bookings cannot be cancelled less than 24 hours before the scheduled service. Please contact support for assistance.');
      }
    }

    const oldStatus = booking.status;
    await booking.update({ status: BOOKING_STATUS.CANCELLED });

    await BookingStatusHistory.create({
      booking_id: booking.id,
      old_status: oldStatus,
      new_status: BOOKING_STATUS.CANCELLED,
      changed_by: req.user.id,
      remarks: req.body.reason || 'Cancelled',
    });

    sendSuccess(res, 200, 'Booking cancelled');

    // Send cancellation emails
    if (booking.customer) {
      emailService.sendBookingCancelled(booking, booking.customer, req.body.reason, req.user.role).catch(console.error);
      if (req.user.role === 'customer') {
        emailService.sendAdminBookingCancelled(booking, booking.customer, req.body.reason).catch(console.error);
      }
    }
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
