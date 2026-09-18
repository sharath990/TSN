const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const { Service, ServiceCategory, SubCategory, ServiceSubCategory } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');
const { getPagination, getPaginationMeta } = require('../utils/pagination');
const { getSortClause } = require('../utils/sort');
const emailService = require('../services/email');

const ALLOWED_SORT_COLUMNS = ['name', 'duration', 'created_at'];

const deleteFile = (filePath) => {
  if (filePath) {
    const fullPath = path.join(__dirname, '../../uploads/services', filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
};

exports.getAll = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { search, status, category_id, subcategory_id } = req.query;

    const where = {};
    if (search) where.name = { [Op.like]: `%${search}%` };
    if (status) where.status = status;
    if (category_id) where.category_id = category_id;

    const order = getSortClause(req.query, ALLOWED_SORT_COLUMNS, 'name', 'ASC');

    const include = [
      { model: ServiceCategory, as: 'category', attributes: ['id', 'name'] },
      { model: SubCategory, as: 'subcategories', attributes: ['id', 'name', 'price'], through: { attributes: [] } },
    ];

    // If filtering by subcategory, use a subquery to find matching service IDs
    if (subcategory_id) {
      const junctionEntries = await ServiceSubCategory.findAll({
        where: { subcategory_id },
        attributes: ['service_id'],
        raw: true,
      });
      const serviceIds = junctionEntries.map((e) => e.service_id);
      where.id = { [Op.in]: serviceIds };
    }

    const { count, rows } = await Service.findAndCountAll({
      where,
      include,
      limit,
      offset,
      order,
      distinct: true,
      col: 'id',
    });

    sendSuccess(res, 200, 'Services retrieved', {
      services: rows,
      pagination: getPaginationMeta(count, page, limit),
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.getById = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id, {
      include: [
        { model: ServiceCategory, as: 'category' },
        { model: SubCategory, as: 'subcategories', through: { attributes: [] } },
      ],
    });

    if (!service) {
      return sendError(res, 404, 'Service not found');
    }

    sendSuccess(res, 200, 'Service retrieved', { service });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.create = async (req, res) => {
  try {
    const { name, category_id, subcategory_ids, description, duration } = req.body;
    const image = req.file ? req.file.filename : null;

    const category = await ServiceCategory.findByPk(category_id);
    if (!category) {
      if (image) deleteFile(image);
      return sendError(res, 404, 'Category not found');
    }

    const service = await Service.create({
      name, category_id, description, image, duration,
    });

    // Handle many-to-many subcategory assignments
    if (subcategory_ids) {
      const ids = Array.isArray(subcategory_ids) ? subcategory_ids.map(Number) : [Number(subcategory_ids)];
      if (ids.length > 0) {
        // Validate all subcategories belong to the selected category
        const validSubs = await SubCategory.findAll({
          where: { id: { [Op.in]: ids }, category_id },
          attributes: ['id'],
        });
        const validIds = validSubs.map((s) => s.id);
        if (validIds.length > 0) {
          const junctionRecords = validIds.map((subId) => ({
            service_id: service.id,
            subcategory_id: subId,
          }));
          await ServiceSubCategory.bulkCreate(junctionRecords);
        }
      }
    }

    // Fetch service with associations
    const result = await Service.findByPk(service.id, {
      include: [
        { model: ServiceCategory, as: 'category', attributes: ['id', 'name'] },
        { model: SubCategory, as: 'subcategories', attributes: ['id', 'name', 'price'], through: { attributes: [] } },
      ],
    });

    sendSuccess(res, 201, 'Service created', { service: result });
    emailService.sendServiceCreated(result).catch(console.error);
  } catch (error) {
    if (req.file) deleteFile(req.file.filename);
    sendError(res, 500, error.message);
  }
};

exports.update = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      if (req.file) deleteFile(req.file.filename);
      return sendError(res, 404, 'Service not found');
    }

    const { name, category_id, subcategory_ids, description, duration, status } = req.body;

    if (category_id) {
      const category = await ServiceCategory.findByPk(category_id);
      if (!category) {
        if (req.file) deleteFile(req.file.filename);
        return sendError(res, 404, 'Category not found');
      }
    }

    let image = service.image;
    if (req.file) {
      if (service.image) {
        deleteFile(service.image);
      }
      image = req.file.filename;
    }

    const updateData = { name, description, image, duration, status };
    if (category_id !== undefined) updateData.category_id = category_id;

    await service.update(updateData);

    // Handle many-to-many subcategory assignments (only if explicitly provided)
    if (subcategory_ids !== undefined) {
      const targetCategoryId = category_id || service.category_id;
      // Remove existing associations
      await ServiceSubCategory.destroy({ where: { service_id: service.id } });

      // Add new associations
      const ids = Array.isArray(subcategory_ids) ? subcategory_ids.map(Number) : [Number(subcategory_ids)];
      const validIds = ids.filter((id) => !isNaN(id) && id > 0);
      if (validIds.length > 0) {
        const validSubs = await SubCategory.findAll({
          where: { id: { [Op.in]: validIds }, category_id: targetCategoryId },
          attributes: ['id'],
        });
        const confirmedIds = validSubs.map((s) => s.id);
        if (confirmedIds.length > 0) {
          const junctionRecords = confirmedIds.map((subId) => ({
            service_id: service.id,
            subcategory_id: subId,
          }));
          await ServiceSubCategory.bulkCreate(junctionRecords);
        }
      }
    }

    // Fetch updated service with associations
    const result = await Service.findByPk(service.id, {
      include: [
        { model: ServiceCategory, as: 'category', attributes: ['id', 'name'] },
        { model: SubCategory, as: 'subcategories', attributes: ['id', 'name', 'price'], through: { attributes: [] } },
      ],
    });

    sendSuccess(res, 200, 'Service updated', { service: result });
    emailService.sendServiceUpdated(result).catch(console.error);
  } catch (error) {
    if (req.file) deleteFile(req.file.filename);
    sendError(res, 500, error.message);
  }
};

exports.remove = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return sendError(res, 404, 'Service not found');
    }

    // Remove junction records
    await ServiceSubCategory.destroy({ where: { service_id: service.id } });

    const serviceName = service.name;

    if (service.image) {
      deleteFile(service.image);
    }

    await service.destroy();
    sendSuccess(res, 200, 'Service deleted');
    emailService.sendServiceDeleted(serviceName).catch(console.error);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
