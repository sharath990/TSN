const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');
const { USER_STATUS, ROLES } = require('../config/constants');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: { notEmpty: true, len: [2, 100] },
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
    lowercase: true,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  googleId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
  },
  provider: {
    type: DataTypes.ENUM('email', 'google'),
    allowNull: false,
    defaultValue: 'email',
  },
  role: {
    type: DataTypes.ENUM(ROLES.CUSTOMER, ROLES.ADMIN),
    allowNull: false,
    defaultValue: ROLES.CUSTOMER,
  },
  status: {
    type: DataTypes.ENUM(USER_STATUS.ACTIVE, USER_STATUS.INACTIVE),
    allowNull: false,
    defaultValue: USER_STATUS.ACTIVE,
  },
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password') && user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
  },
});

User.prototype.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  delete values.password;
  return values;
};

module.exports = User;
