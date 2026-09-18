'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const categories = [
      { name: 'Housekeeping Services', description: 'Professional cleaning and housekeeping', status: 'active', created_at: new Date(), updated_at: new Date() },
      { name: 'Technical Services', description: 'Technical maintenance and repairs', status: 'active', created_at: new Date(), updated_at: new Date() },
      { name: 'Security Services', description: 'Security and surveillance services', status: 'active', created_at: new Date(), updated_at: new Date() },
      { name: 'Landscaping Services', description: 'Garden and outdoor maintenance', status: 'active', created_at: new Date(), updated_at: new Date() },
      { name: 'Pest Control', description: 'Pest inspection and elimination', status: 'active', created_at: new Date(), updated_at: new Date() },
      { name: 'Deep Cleaning', description: 'Thorough deep cleaning services', status: 'active', created_at: new Date(), updated_at: new Date() },
      { name: 'Plumbing', description: 'Plumbing installation and repair', status: 'active', created_at: new Date(), updated_at: new Date() },
      { name: 'Other / Customized Services', description: 'Custom facility services', status: 'active', created_at: new Date(), updated_at: new Date() },
    ];

    await queryInterface.bulkInsert('service_categories', categories);

    const services = [
      { category_id: 1, name: 'Regular Home Cleaning', description: 'Standard home cleaning service including dusting, vacuuming, and mopping.', price: 50.00, duration: 120, status: 'active', created_at: new Date(), updated_at: new Date() },
      { category_id: 1, name: 'Office Cleaning', description: 'Professional office space cleaning and sanitization.', price: 80.00, duration: 180, status: 'active', created_at: new Date(), updated_at: new Date() },
      { category_id: 2, name: 'AC Maintenance', description: 'Air conditioning system inspection and maintenance.', price: 65.00, duration: 90, status: 'active', created_at: new Date(), updated_at: new Date() },
      { category_id: 2, name: 'Electrical Repairs', description: 'Electrical wiring and fixture repair services.', price: 70.00, duration: 60, status: 'active', created_at: new Date(), updated_at: new Date() },
      { category_id: 3, name: 'Security Guard Service', description: 'Professional security personnel for your premises.', price: 120.00, duration: 480, status: 'active', created_at: new Date(), updated_at: new Date() },
      { category_id: 4, name: 'Lawn Mowing', description: 'Regular lawn mowing and garden upkeep.', price: 40.00, duration: 60, status: 'active', created_at: new Date(), updated_at: new Date() },
      { category_id: 5, name: 'General Pest Control', description: 'Comprehensive pest treatment for homes and offices.', price: 90.00, duration: 120, status: 'active', created_at: new Date(), updated_at: new Date() },
      { category_id: 6, name: 'Full Home Deep Clean', description: 'Intensive deep cleaning covering all areas.', price: 150.00, duration: 300, status: 'active', created_at: new Date(), updated_at: new Date() },
      { category_id: 7, name: 'Pipe Leak Repair', description: 'Quick repair for leaking pipes and faucets.', price: 55.00, duration: 60, status: 'active', created_at: new Date(), updated_at: new Date() },
      { category_id: 8, name: 'Custom Service Request', description: 'Describe your custom facility service needs.', price: 100.00, duration: 120, status: 'active', created_at: new Date(), updated_at: new Date() },
    ];

    await queryInterface.bulkInsert('services', services);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('services', null, {});
    await queryInterface.bulkDelete('service_categories', null, {});
  },
};
