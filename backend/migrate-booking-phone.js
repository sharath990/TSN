require('dotenv').config();
const { sequelize } = require('./src/models');
const { QueryTypes } = require('sequelize');

async function migrate() {
  await sequelize.authenticate();

  try {
    await sequelize.query("ALTER TABLE bookings ADD COLUMN phone VARCHAR(20) NULL", { type: QueryTypes.RAW });
    console.log('Added phone column');
  } catch(e) { console.log('phone:', e.message); }

  try {
    await sequelize.query("ALTER TABLE bookings ADD COLUMN house_flat VARCHAR(100) NULL", { type: QueryTypes.RAW });
    console.log('Added house_flat column');
  } catch(e) { console.log('house_flat:', e.message); }

  try {
    await sequelize.query("ALTER TABLE bookings ADD COLUMN floor VARCHAR(50) NULL", { type: QueryTypes.RAW });
    console.log('Added floor column');
  } catch(e) { console.log('floor:', e.message); }

  try {
    await sequelize.query("ALTER TABLE bookings ADD COLUMN landmark VARCHAR(200) NULL", { type: QueryTypes.RAW });
    console.log('Added landmark column');
  } catch(e) { console.log('landmark:', e.message); }

  try {
    await sequelize.query("ALTER TABLE bookings ADD COLUMN pincode VARCHAR(10) NULL", { type: QueryTypes.RAW });
    console.log('Added pincode column');
  } catch(e) { console.log('pincode:', e.message); }

  await sequelize.close();
  console.log('Migration complete');
}
migrate();
