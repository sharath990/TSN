const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const { ServiceCategory, SubCategory, Service } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');
const { getPagination, getPaginationMeta } = require('../utils/pagination');
const { getSortClause } = require('../utils/sort');
const emailService = require('../services/email');

const ALLOWED_SORT_COLUMNS = ['name', 'created_at'];
const UPLOAD_DIR = path.join(__dirname, '../../uploads/categories');

const deleteImage = (filename) => {
  if (!filename) return;
  const filePath = path.join(UPLOAD_DIR, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

exports.getAll = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { search, status } = req.query;

    const where = {};
    if (search) where.name = { [Op.like]: `%${search}%` };
    if (status) where.status = status;

    const order = getSortClause(req.query, ALLOWED_SORT_COLUMNS, 'name', 'ASC');

    const { count, rows } = await ServiceCategory.findAndCountAll({
      where,
      limit,
      offset,
      order,
    });

    const categoryIds = rows.map((c) => c.id);

    const subcategoryCounts = await SubCategory.findAll({
      attributes: ['category_id', [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']],
      where: { category_id: { [Op.in]: categoryIds } },
      group: ['category_id'],
      raw: true,
    });

    const subcategoryCountMap = {};
    subcategoryCounts.forEach((s) => { subcategoryCountMap[s.category_id] = parseInt(s.count, 10); });

    const serviceCounts = await Service.findAll({
      attributes: ['category_id', [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']],
      where: { category_id: { [Op.in]: categoryIds } },
      group: ['category_id'],
      raw: true,
    });

    const serviceCountMap = {};
    serviceCounts.forEach((s) => { serviceCountMap[s.category_id] = parseInt(s.count, 10); });

    const categories = rows.map((c) => ({
      ...c.toJSON(),
      subcategoryCount: subcategoryCountMap[c.id] || 0,
      serviceCount: serviceCountMap[c.id] || 0,
    }));

    sendSuccess(res, 200, 'Categories retrieved', {
      categories,
      pagination: getPaginationMeta(count, page, limit),
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.getById = async (req, res) => {
  try {
    const category = await ServiceCategory.findByPk(req.params.id, {
      include: [
        {
          model: SubCategory,
          as: 'subcategories',
          include: [{ model: Service, as: 'services', attributes: ['id', 'name', 'duration', 'status', 'image'] }],
        },
        { model: Service, as: 'services', attributes: ['id', 'name', 'duration', 'status', 'image'] },
      ],
    });

    if (!category) {
      return sendError(res, 404, 'Category not found');
    }

    sendSuccess(res, 200, 'Category retrieved', { category });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description } = req.body;
    const image = req.file ? req.file.filename : null;

    const existing = await ServiceCategory.findOne({ where: { name } });
    if (existing) {
      if (image) deleteImage(image);
      return sendError(res, 400, 'Category name already exists');
    }

    const category = await ServiceCategory.create({ name, description, image });
    sendSuccess(res, 201, 'Category created', { category });
    emailService.sendCategoryCreated(category).catch(console.error);
  } catch (error) {
    if (req.file) deleteImage(req.file.filename);
    sendError(res, 500, error.message);
  }
};

exports.update = async (req, res) => {
  try {
    const category = await ServiceCategory.findByPk(req.params.id);
    if (!category) {
      if (req.file) deleteImage(req.file.filename);
      return sendError(res, 404, 'Category not found');
    }

    const { name, description, status } = req.body;

    if (name && name !== category.name) {
      const exists = await ServiceCategory.findOne({
        where: { name, id: { [Op.ne]: category.id } },
      });
      if (exists) {
        if (req.file) deleteImage(req.file.filename);
        return sendError(res, 400, 'Category name already exists');
      }
    }

    const updateData = { name, description, status };
    if (req.file) {
      deleteImage(category.image);
      updateData.image = req.file.filename;
    }

    await category.update(updateData);
    sendSuccess(res, 200, 'Category updated', { category });
  } catch (error) {
    if (req.file) deleteImage(req.file.filename);
    sendError(res, 500, error.message);
  }
};

exports.remove = async (req, res) => {
  try {
    const category = await ServiceCategory.findByPk(req.params.id);
    if (!category) {
      return sendError(res, 404, 'Category not found');
    }

    const subcategoryCount = await SubCategory.count({ where: { category_id: category.id } });
    if (subcategoryCount > 0) {
      return sendError(res, 400, 'Cannot delete category with associated subcategories');
    }

    const serviceCount = await Service.count({ where: { category_id: category.id } });
    if (serviceCount > 0) {
      return sendError(res, 400, 'Cannot delete category with associated services');
    }

    deleteImage(category.image);
    await category.destroy();
    sendSuccess(res, 200, 'Category deleted');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
