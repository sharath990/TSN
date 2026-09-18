const { sequelize } = require('../models');
const { User, Service, ServiceCategory, Booking } = require('../models');
const { ROLES, BOOKING_STATUS } = require('../config/constants');
const { sendSuccess, sendError } = require('../utils/response');

exports.getDashboard = async (_req, res) => {
  try {
    const [
      totalCustomers,
      totalServices,
      totalCategories,
      totalBookings,
      pendingPaymentBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
    ] = await Promise.all([
      User.count({ where: { role: ROLES.CUSTOMER } }),
      Service.count(),
      ServiceCategory.count(),
      Booking.count(),
      Booking.count({ where: { status: BOOKING_STATUS.PENDING_PAYMENT } }),
      Booking.count({ where: { status: BOOKING_STATUS.PENDING } }),
      Booking.count({ where: { status: BOOKING_STATUS.CONFIRMED } }),
      Booking.count({ where: { status: BOOKING_STATUS.COMPLETED } }),
      Booking.count({ where: { status: BOOKING_STATUS.CANCELLED } }),
    ]);

    const recentBookings = await Booking.findAll({
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { model: Service, as: 'service', attributes: ['id', 'name'] },
      ],
      order: [['created_at', 'DESC']],
      limit: 10,
    });

    sendSuccess(res, 200, 'Dashboard data retrieved', {
      stats: {
        totalCustomers,
        totalServices,
        totalCategories,
        totalBookings,
        pendingPaymentBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
      },
      recentBookings,
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
