const { Op } = require('sequelize');
const { User, Booking, Service, ServiceCategory } = require('../models');
const { ROLES, USER_STATUS } = require('../config/constants');
const { sendSuccess, sendError } = require('../utils/response');
const { getPagination, getPaginationMeta } = require('../utils/pagination');
const { getSortClause } = require('../utils/sort');
const emailService = require('../services/email');

const ALLOWED_SORT_COLUMNS = ['name', 'email', 'created_at'];

exports.getAll = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { search, status } = req.query;

    const where = { role: ROLES.CUSTOMER };
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }
    if (status) where.status = status;

    const order = getSortClause(req.query, ALLOWED_SORT_COLUMNS, 'created_at', 'DESC');

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit,
      offset,
      order,
    });

    const customerIds = rows.map((c) => c.id);
    const bookingCounts = await Booking.findAll({
      attributes: ['customer_id', [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']],
      where: { customer_id: { [Op.in]: customerIds } },
      group: ['customer_id'],
      raw: true,
    });

    const countMap = {};
    bookingCounts.forEach((b) => { countMap[b.customer_id] = parseInt(b.count, 10); });

    const customers = rows.map((c) => ({
      ...c.toJSON(),
      bookingCount: countMap[c.id] || 0,
    }));

    sendSuccess(res, 200, 'Customers retrieved', {
      customers,
      pagination: getPaginationMeta(count, page, limit),
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.getById = async (req, res) => {
  try {
    const customer = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Booking,
        as: 'bookings',
        include: [{ model: Service, as: 'service', attributes: ['id', 'name', 'price'] }],
      }],
    });

    if (!customer || customer.role !== ROLES.CUSTOMER) {
      return sendError(res, 404, 'Customer not found');
    }

    sendSuccess(res, 200, 'Customer retrieved', { customer });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const customer = await User.findByPk(req.params.id);

    if (!customer || customer.role !== ROLES.CUSTOMER) {
      return sendError(res, 404, 'Customer not found');
    }

    await customer.update({ status });
    sendSuccess(res, 200, 'Customer status updated', { customer });

    if (status === 'inactive') {
      emailService.sendAccountDeactivated(customer).catch(console.error);
    } else if (status === 'active') {
      emailService.sendAccountReactivated(customer).catch(console.error);
    }
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.getStats = async (_req, res) => {
  try {
    const totalCustomers = await User.count({ where: { role: ROLES.CUSTOMER } });
    const activeCustomers = await User.count({ where: { role: ROLES.CUSTOMER, status: USER_STATUS.ACTIVE } });
    const totalBookings = await Booking.count();
    const pendingBookings = await Booking.count({ where: { status: 'pending' } });

    sendSuccess(res, 200, 'Stats retrieved', {
      stats: { totalCustomers, activeCustomers, totalBookings, pendingBookings },
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
