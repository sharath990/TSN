const auth = require('./auth');
const booking = require('./booking');
const payment = require('./payment');
const customer = require('./customer');
const admin = require('./admin');
const service = require('./service');

module.exports = {
  ...auth,
  ...booking,
  ...payment,
  ...customer,
  ...admin,
  ...service,
};
