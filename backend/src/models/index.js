const sequelize = require('../config/database');
const User = require('./User');
const ServiceCategory = require('./ServiceCategory');
const SubCategory = require('./SubCategory');
const Service = require('./Service');
const ServiceSubCategory = require('./ServiceSubCategory');
const Booking = require('./Booking');
const BookingSubCategory = require('./BookingSubCategory');
const BookingStatusHistory = require('./BookingStatusHistory');
const Payment = require('./Payment');
const ServiceArea = require('./ServiceArea');
const ServiceAreaService = require('./ServiceAreaService');

// Associations

// ServiceCategory -> SubCategories
ServiceCategory.hasMany(SubCategory, { foreignKey: 'category_id', as: 'subcategories' });
SubCategory.belongsTo(ServiceCategory, { foreignKey: 'category_id', as: 'category' });

// Service <-> SubCategory (many-to-many)
Service.belongsToMany(SubCategory, { through: ServiceSubCategory, foreignKey: 'service_id', as: 'subcategories' });
SubCategory.belongsToMany(Service, { through: ServiceSubCategory, foreignKey: 'subcategory_id', as: 'services' });

// Explicit through model associations
ServiceSubCategory.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });
ServiceSubCategory.belongsTo(SubCategory, { foreignKey: 'subcategory_id', as: 'subcategory' });

// ServiceCategory -> Services
ServiceCategory.hasMany(Service, { foreignKey: 'category_id', as: 'services' });
Service.belongsTo(ServiceCategory, { foreignKey: 'category_id', as: 'category' });

// User -> Bookings (Customer)
User.hasMany(Booking, { foreignKey: 'customer_id', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });

// Service -> Bookings
Service.hasMany(Booking, { foreignKey: 'service_id', as: 'bookings' });
Booking.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });

// Booking <-> SubCategory (many-to-many)
Booking.belongsToMany(SubCategory, { through: BookingSubCategory, foreignKey: 'booking_id', as: 'subcategories' });
SubCategory.belongsToMany(Booking, { through: BookingSubCategory, foreignKey: 'subcategory_id', as: 'bookings' });

// Booking -> Status History
Booking.hasMany(BookingStatusHistory, { foreignKey: 'booking_id', as: 'statusHistory' });
BookingStatusHistory.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

// User -> Status History (changed_by)
User.hasMany(BookingStatusHistory, { foreignKey: 'changed_by', as: 'statusChanges' });
BookingStatusHistory.belongsTo(User, { foreignKey: 'changed_by', as: 'changedByUser' });

// Booking -> Payment (one-to-one)
Booking.hasOne(Payment, { foreignKey: 'booking_id', as: 'payment' });
Payment.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

// User -> Payments
User.hasMany(Payment, { foreignKey: 'customer_id', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });

// ServiceArea -> ServiceAreaServices
ServiceArea.hasMany(ServiceAreaService, { foreignKey: 'service_area_id', as: 'areaServices' });
ServiceAreaService.belongsTo(ServiceArea, { foreignKey: 'service_area_id', as: 'serviceArea' });

// Service -> ServiceAreaServices
Service.hasMany(ServiceAreaService, { foreignKey: 'service_id', as: 'areaServices' });
ServiceAreaService.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });

// ServiceArea <-> Service (many-to-many through ServiceAreaService)
ServiceArea.belongsToMany(Service, { through: ServiceAreaService, foreignKey: 'service_area_id', as: 'services' });
Service.belongsToMany(ServiceArea, { through: ServiceAreaService, foreignKey: 'service_id', as: 'serviceAreas' });

// Booking -> ServiceArea
ServiceArea.hasMany(Booking, { foreignKey: 'service_area_id', as: 'bookings' });
Booking.belongsTo(ServiceArea, { foreignKey: 'service_area_id', as: 'serviceArea' });

module.exports = {
  sequelize,
  User,
  ServiceCategory,
  SubCategory,
  Service,
  ServiceSubCategory,
  Booking,
  BookingSubCategory,
  BookingStatusHistory,
  Payment,
  ServiceArea,
  ServiceAreaService,
};
