require('dotenv').config();
const app = require('./app');
const config = require('./config');
const { sequelize } = require('./models');
const reconciliation = require('./jobs/reconciliation');

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    await sequelize.sync();
    console.log('Models synchronized');

    reconciliation.start();
    console.log('Reconciliation job started');

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
    });
  } catch (error) {
    console.error('Unable to start server:', error.message);
    process.exit(1);
  }
};

startServer();
