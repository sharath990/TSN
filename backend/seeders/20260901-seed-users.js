'use strict';

const { User } = require('../src/models');
const { ROLES } = require('../src/config/constants');

module.exports = {
  async up(queryInterface, Sequelize) {
    await User.findOrCreate({
      where: { email: 'admin@tsn.com' },
      defaults: {
        name: 'Admin',
        email: 'admin@tsn.com',
        phone: '0771234567',
        password: 'admin123',
        role: ROLES.ADMIN,
        status: 'active',
      },
    });

    await User.findOrCreate({
      where: { email: 'customer@tsn.com' },
      defaults: {
        name: 'Test Customer',
        email: 'customer@tsn.com',
        phone: '0779876543',
        password: 'customer123',
        role: ROLES.CUSTOMER,
        status: 'active',
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  },
};
