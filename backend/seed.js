require('dotenv').config();
const { sequelize, User, ServiceCategory, SubCategory, Service, ServiceSubCategory, ServiceArea, ServiceAreaService } = require('./src/models');
const { ROLES } = require('./src/config/constants');

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    await sequelize.sync({ force: true });
    console.log('Tables synced');

    // Seed Admin
    const [admin] = await User.findOrCreate({
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
    console.log('Admin: admin@tsn.com / admin123');

    // Seed Customer
    const [customer] = await User.findOrCreate({
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
    console.log('Customer: customer@tsn.com / customer123');

    // Seed Categories
    const categoryNames = [
      { name: 'Housekeeping Services', description: 'Professional cleaning and housekeeping' },
      { name: 'Technical Services', description: 'Technical maintenance and repairs' },
      { name: 'Security Services', description: 'Security and surveillance services' },
      { name: 'Landscaping Services', description: 'Garden and outdoor maintenance' },
      { name: 'Pest Control', description: 'Pest inspection and elimination' },
      { name: 'Deep Cleaning', description: 'Thorough deep cleaning services' },
      { name: 'Plumbing', description: 'Plumbing installation and repair' },
      { name: 'Other / Customized Services', description: 'Custom facility services' },
    ];

    const categories = [];
    for (const cat of categoryNames) {
      const [created] = await ServiceCategory.findOrCreate({
        where: { name: cat.name },
        defaults: cat,
      });
      categories.push(created);
    }
    console.log(`${categories.length} categories seeded`);

    // Seed SubCategories with prices
    const subcategoryData = [
      { catIdx: 0, name: 'Bathroom Cleaning', description: 'Professional bathroom cleaning and sanitization', price: 50 },
      { catIdx: 0, name: 'Kitchen Cleaning', description: 'Deep kitchen cleaning and degreasing', price: 65 },
      { catIdx: 0, name: 'Living & Bedroom Cleaning', description: 'Living room and bedroom cleaning services', price: 45 },
      { catIdx: 1, name: 'AC Repair & Service', description: 'AC installation, repair, and maintenance', price: 80 },
      { catIdx: 1, name: 'Electrical Work', description: 'Electrical wiring, fixtures, and repairs', price: 60 },
      { catIdx: 1, name: 'Appliance Repair', description: 'Home appliance repair and maintenance', price: 70 },
      { catIdx: 4, name: 'Cockroach Control', description: 'Cockroach elimination and prevention', price: 45 },
      { catIdx: 4, name: 'Termite Control', description: 'Termite inspection and treatment', price: 120 },
      { catIdx: 4, name: 'Ants & Bed Bugs Control', description: 'Ant and bed bug treatment services', price: 90 },
      { catIdx: 5, name: 'Full Home Deep Clean', description: 'Complete home deep cleaning service', price: 200 },
      { catIdx: 5, name: 'Office Deep Clean', description: 'Office space deep cleaning', price: 250 },
      { catIdx: 6, name: 'Pipe Leak Repair', description: 'Leak detection and pipe repair', price: 55 },
      { catIdx: 6, name: 'Fixture Installation', description: 'Bathroom and kitchen fixture installation', price: 75 },
    ];

    const subcategories = [];
    for (const sub of subcategoryData) {
      const [created] = await SubCategory.findOrCreate({
        where: { name: sub.name, category_id: categories[sub.catIdx].id },
        defaults: {
          name: sub.name,
          description: sub.description,
          price: sub.price,
          category_id: categories[sub.catIdx].id,
        },
      });
      subcategories.push(created);
    }
    console.log(`${subcategories.length} subcategories seeded`);

    // Seed Services (no price on service — price is on subcategories)
    const servicesData = [
      { catIdx: 0, name: 'Regular Home Cleaning', description: 'Standard home cleaning including dusting, vacuuming, and mopping.', duration: 120, subs: [0, 1, 2] },
      { catIdx: 0, name: 'Deep Bathroom Sanitization', description: 'Intensive bathroom deep cleaning with anti-bacterial treatment.', duration: 75, subs: [0] },
      { catIdx: 0, name: 'Kitchen Deep Degreasing', description: 'Heavy-duty kitchen degreasing and deep clean.', duration: 90, subs: [1] },
      { catIdx: 1, name: 'AC Gas Refill & Repair', description: 'AC gas checking, refilling, and minor repairs.', duration: 60, subs: [3] },
      { catIdx: 1, name: 'Split AC Installation', description: 'Split AC installation with bracket and wiring.', duration: 120, subs: [3] },
      { catIdx: 1, name: 'Fan & Light Installation', description: 'Ceiling fan, wall fan, and light fixture installation.', duration: 45, subs: [4] },
      { catIdx: 1, name: 'Switchboard Repair', description: 'Switchboard and wiring repair service.', duration: 30, subs: [4] },
      { catIdx: 1, name: 'Washing Machine Repair', description: 'Washing machine diagnosis and repair.', duration: 60, subs: [5] },
      { catIdx: 4, name: 'Cockroach Gel Treatment', description: 'Gel-based cockroach treatment for kitchen and bathroom.', duration: 45, subs: [6] },
      { catIdx: 4, name: 'Termite Wall Treatment', description: 'Full termite treatment for wooden furniture and walls.', duration: 120, subs: [7] },
      { catIdx: 4, name: 'Bed Bug Heat Treatment', description: 'Heat and chemical treatment for bed bugs.', duration: 90, subs: [8] },
      { catIdx: 5, name: '2 BHK Deep Clean', description: 'Complete deep cleaning for 2 BHK apartment.', duration: 240, subs: [9] },
      { catIdx: 5, name: '3 BHK Deep Clean', description: 'Complete deep cleaning for 3 BHK apartment.', duration: 360, subs: [9, 10] },
      { catIdx: 6, name: 'Pipe Leak Repair', description: 'Quick repair for leaking pipes and faucets.', duration: 60, subs: [11] },
      { catIdx: 2, name: 'Security Guard Service', description: 'Professional security personnel for your premises.', duration: 480, subs: [] },
      { catIdx: 3, name: 'Lawn Mowing', description: 'Regular lawn mowing and garden upkeep.', duration: 60, subs: [] },
    ];

    let serviceCount = 0;
    for (const s of servicesData) {
      const [service] = await Service.findOrCreate({
        where: { name: s.name },
        defaults: {
          category_id: categories[s.catIdx].id,
          name: s.name,
          description: s.description,
          duration: s.duration,
          status: 'active',
        },
      });

      if (s.subs && s.subs.length > 0) {
        for (const subIdx of s.subs) {
          const sub = subcategories[subIdx];
          if (sub) {
            await ServiceSubCategory.findOrCreate({
              where: { service_id: service.id, subcategory_id: sub.id },
              defaults: { service_id: service.id, subcategory_id: sub.id },
            });
          }
        }
      }
      serviceCount++;
    }
    console.log(`${serviceCount} services seeded with junction records`);

    // Seed Service Area — Yelahanka, Bangalore
    const [yelahanka] = await ServiceArea.findOrCreate({
      where: { name: 'Yelahanka' },
      defaults: {
        name: 'Yelahanka',
        center_lat: 13.0639,
        center_lng: 77.5760,
        radius_km: 10,
        is_active: true,
      },
    });
    console.log(`Service area: ${yelahanka.name} (${yelahanka.center_lat}, ${yelahanka.center_lng}) — ${yelahanka.radius_km} km radius`);

    // Associate all services with Yelahanka service area
    const allServices = await Service.findAll();
    for (const svc of allServices) {
      await ServiceAreaService.findOrCreate({
        where: { service_area_id: yelahanka.id, service_id: svc.id },
        defaults: { service_area_id: yelahanka.id, service_id: svc.id, is_active: true },
      });
    }
    console.log(`${allServices.length} services linked to Yelahanka service area`);

    console.log('\n--- Seed Complete ---');
    console.log('Admin Login:    admin@tsn.com / admin123');
    console.log('Customer Login: customer@tsn.com / customer123');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
