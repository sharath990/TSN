require('dotenv').config();
const { sequelize } = require('./src/models');
const { QueryTypes } = require('sequelize');

async function migrate() {
  await sequelize.authenticate();
  
  try {
    await sequelize.query("ALTER TABLE users ADD COLUMN googleId VARCHAR(100) NULL", { type: QueryTypes.RAW });
    console.log('Added googleId column');
  } catch(e) { console.log('googleId:', e.message); }

  try {
    await sequelize.query("ALTER TABLE users ADD COLUMN provider ENUM('email','google') DEFAULT 'email' NOT NULL", { type: QueryTypes.RAW });
    console.log('Added provider column');
  } catch(e) { console.log('provider:', e.message); }

  try {
    await sequelize.query("ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL", { type: QueryTypes.RAW });
    console.log('Made password nullable');
  } catch(e) { console.log('password nullable:', e.message); }

  await sequelize.close();
  console.log('Migration complete');
}
migrate();
