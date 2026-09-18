const { Op } = require('sequelize');
const { ServiceArea, ServiceAreaService, Service } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');
const { getPagination, getPaginationMeta } = require('../utils/pagination');
const { findServiceArea } = require('../utils/distance');

exports.getAll = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { search, is_active } = req.query;

    const where = {};
    if (search) where.name = { [Op.like]: `%${search}%` };
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const { count, rows } = await ServiceArea.findAndCountAll({
      where,
      include: [{
        model: Service,
        as: 'services',
        through: { attributes: ['is_active'], where: { is_active: true } },
        attributes: ['id', 'name'],
      }],
      limit,
      offset,
      order: [['created_at', 'DESC']],
      distinct: true,
    });

    sendSuccess(res, 200, 'Service areas retrieved', {
      serviceAreas: rows,
      pagination: getPaginationMeta(count, page, limit),
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.getById = async (req, res) => {
  try {
    const area = await ServiceArea.findByPk(req.params.id, {
      include: [{
        model: Service,
        as: 'services',
        through: { attributes: ['is_active'] },
        attributes: ['id', 'name'],
      }],
    });
    if (!area) return sendError(res, 404, 'Service area not found');
    sendSuccess(res, 200, 'Service area retrieved', { serviceArea: area });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.create = async (req, res) => {
  try {
    const { name, center_lat, center_lng, radius_km, service_ids } = req.body;

    if (!name || center_lat == null || center_lng == null) {
      return sendError(res, 400, 'Name, center_lat, and center_lng are required');
    }

    const area = await ServiceArea.create({
      name,
      center_lat,
      center_lng,
      radius_km: radius_km || 10,
      is_active: true,
    });

    if (service_ids && service_ids.length > 0) {
      const junctionRecords = service_ids.map((sid) => ({
        service_area_id: area.id,
        service_id: sid,
        is_active: true,
      }));
      await ServiceAreaService.bulkCreate(junctionRecords);
    }

    const result = await ServiceArea.findByPk(area.id, {
      include: [{ model: Service, as: 'services', through: { attributes: ['is_active'] }, attributes: ['id', 'name'] }],
    });

    sendSuccess(res, 201, 'Service area created', { serviceArea: result });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.update = async (req, res) => {
  try {
    const area = await ServiceArea.findByPk(req.params.id);
    if (!area) return sendError(res, 404, 'Service area not found');

    const { name, center_lat, center_lng, radius_km, is_active, service_ids } = req.body;

    await area.update({
      ...(name !== undefined && { name }),
      ...(center_lat !== undefined && { center_lat }),
      ...(center_lng !== undefined && { center_lng }),
      ...(radius_km !== undefined && { radius_km }),
      ...(is_active !== undefined && { is_active }),
    });

    if (service_ids !== undefined) {
      await ServiceAreaService.destroy({ where: { service_area_id: area.id } });
      if (service_ids.length > 0) {
        const junctionRecords = service_ids.map((sid) => ({
          service_area_id: area.id,
          service_id: sid,
          is_active: true,
        }));
        await ServiceAreaService.bulkCreate(junctionRecords);
      }
    }

    const result = await ServiceArea.findByPk(area.id, {
      include: [{ model: Service, as: 'services', through: { attributes: ['is_active'] }, attributes: ['id', 'name'] }],
    });

    sendSuccess(res, 200, 'Service area updated', { serviceArea: result });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.remove = async (req, res) => {
  try {
    const area = await ServiceArea.findByPk(req.params.id);
    if (!area) return sendError(res, 404, 'Service area not found');

    await ServiceAreaService.destroy({ where: { service_area_id: area.id } });
    await area.destroy();
    sendSuccess(res, 200, 'Service area deleted');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.checkAvailability = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return sendError(res, 400, 'lat and lng are required');

    const result = await findServiceArea(parseFloat(lat), parseFloat(lng), ServiceArea);
    if (!result) {
      const areas = await ServiceArea.findAll({
        where: { is_active: true },
        attributes: ['id', 'name'],
      });
      return sendSuccess(res, 200, 'Service not available in your area', {
        available: false,
        serviceAreas: areas,
      });
    }

    const serviceAreaServices = await ServiceAreaService.findAll({
      where: { service_area_id: result.serviceArea.id, is_active: true },
      attributes: ['service_id'],
    });
    const enabledServiceIds = serviceAreaServices.map((s) => s.service_id);

    sendSuccess(res, 200, 'Service available', {
      available: true,
      serviceArea: {
        id: result.serviceArea.id,
        name: result.serviceArea.name,
        radius_km: result.serviceArea.radius_km,
      },
      distance_km: result.distance,
      enabledServiceIds,
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
