const { Op } = require('sequelize');
const { ServiceCategory, SubCategory, Service, ServiceSubCategory } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');
const { getPagination, getPaginationMeta } = require('../utils/pagination');
const { getSortClause } = require('../utils/sort');
const emailService = require('../services/email');

const ALLOWED_SORT_COLUMNS = ['name', 'created_at'];

exports.getAll = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { search, status, category_id } = req.query;

    const where = {};
    if (search) where.name = { [Op.like]: `%${search}%` };
    if (status) where.status = status;
    if (category_id) where.category_id = category_id;

    const order = getSortClause(req.query, ALLOWED_SORT_COLUMNS, 'name', 'ASC');

    const { count, rows } = await SubCategory.findAndCountAll({
      where,
      include: [{ model: ServiceCategory, as: 'category', attributes: ['id', 'name'] }],
      limit,
      offset,
      order,
    });

    const subcategoryIds = rows.map((s) => s.id);
    const serviceCounts = await ServiceSubCategory.findAll({
      attributes: ['subcategory_id', [require('sequelize').fn('COUNT', require('sequelize').col('service_id')), 'count']],
      where: { subcategory_id: { [Op.in]: subcategoryIds } },
      group: ['subcategory_id'],
      raw: true,
    });

    const countMap = {};
    serviceCounts.forEach((s) => { countMap[s.subcategory_id] = parseInt(s.count, 10); });

    const serviceNames = await ServiceSubCategory.findAll({
      attributes: ['subcategory_id', 'service_id'],
      where: { subcategory_id: { [Op.in]: subcategoryIds } },
      include: [{ model: Service, as: 'service', attributes: ['id', 'name'] }],
      raw: true,
      nest: true,
    });

    const serviceNameMap = {};
    serviceNames.forEach((s) => {
      if (!serviceNameMap[s.subcategory_id]) serviceNameMap[s.subcategory_id] = [];
      serviceNameMap[s.subcategory_id].push(s.service);
    });

    const subcategories = rows.map((s) => ({
      ...s.toJSON(),
      serviceCount: countMap[s.id] || 0,
      linkedServices: serviceNameMap[s.id] || [],
    }));

    sendSuccess(res, 200, 'Subcategories retrieved', {
      subcategories,
      pagination: getPaginationMeta(count, page, limit),
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.getById = async (req, res) => {
  try {
    const subcategory = await SubCategory.findByPk(req.params.id, {
      include: [
        { model: ServiceCategory, as: 'category', attributes: ['id', 'name'] },
        { model: Service, as: 'services', through: { attributes: [] } },
      ],
    });

    if (!subcategory) {
      return sendError(res, 404, 'Subcategory not found');
    }

    sendSuccess(res, 200, 'Subcategory retrieved', { subcategory });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description, image, category_id, price } = req.body;

    const category = await ServiceCategory.findByPk(category_id);
    if (!category) {
      return sendError(res, 404, 'Category not found');
    }

    const existing = await SubCategory.findOne({ where: { name, category_id } });
    if (existing) {
      return sendError(res, 400, 'Subcategory name already exists in this category');
    }

    const subcategory = await SubCategory.create({ name, description, image, category_id, price });
    sendSuccess(res, 201, 'Subcategory created', { subcategory });
    emailService.sendSubcategoryCreated(subcategory, category.name).catch(console.error);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.update = async (req, res) => {
  try {
    const subcategory = await SubCategory.findByPk(req.params.id);
    if (!subcategory) {
      return sendError(res, 404, 'Subcategory not found');
    }

    const { name, description, image, status, category_id, price } = req.body;

    if (category_id) {
      const category = await ServiceCategory.findByPk(category_id);
      if (!category) {
        return sendError(res, 404, 'Category not found');
      }
    }

    if (name) {
      const targetCategoryId = category_id || subcategory.category_id;
      const exists = await SubCategory.findOne({
        where: {
          name,
          category_id: targetCategoryId,
          id: { [Op.ne]: subcategory.id },
        },
      });
      if (exists) {
        return sendError(res, 400, 'Subcategory name already exists in this category');
      }
    }

    await subcategory.update({ name, description, image, status, category_id, price });
    sendSuccess(res, 200, 'Subcategory updated', { subcategory });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.remove = async (req, res) => {
  try {
    const subcategory = await SubCategory.findByPk(req.params.id);
    if (!subcategory) {
      return sendError(res, 404, 'Subcategory not found');
    }

    const serviceCount = await ServiceSubCategory.count({ where: { subcategory_id: subcategory.id } });
    if (serviceCount > 0) {
      return sendError(res, 400, 'Cannot delete subcategory with associated services');
    }

    await subcategory.destroy();
    sendSuccess(res, 200, 'Subcategory deleted');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
