require('dotenv').config(); // Load .env file
const bcrypt = require('bcryptjs');
const { connectDB, User, Shipment } = require('../config/database');

const initDatabase = async () => {
  try {
    const connected = await connectDB();
    
    if (!connected) {
      console.error('❌ Failed to connect to MongoDB');
      process.exit(1);
    }

    // Check if default coordinator exists
    let user = await User.findOne({ username: 'coordinator' });
    if (!user) {
      // Hash the default password
      const hashedPassword = await bcrypt.hash('shipment123', 10);
      
      user = new User({
        username: 'coordinator',
        email: 'coordinator@shipsy.com',
        password: hashedPassword,
        full_name: 'Logistics Coordinator',
        role: 'coordinator'
      });
      await user.save();
      console.log('✅ Default user created: coordinator / shipment123');
    } else {
      console.log('✅ Default user already exists: coordinator');
    }

    // Sample shipments
    const sampleShipments = [
      ['TRK001', '123 Main St, New York, NY 10001', 'IN_TRANSIT', true, '2024-01-15', '2024-01-20', 'Handle with care - fragile electronics'],
      ['TRK002', '456 Oak Ave, Los Angeles, CA 90210', 'DELIVERED', false, '2024-01-10', '2024-01-18', 'Standard delivery completed'],
      ['TRK003', '789 Pine Rd, Chicago, IL 60601', 'PENDING', false, '2024-01-20', '2024-01-25', 'Awaiting pickup'],
      ['TRK004', '321 Elm St, Houston, TX 77001', 'OUT_FOR_DELIVERY', true, '2024-01-12', '2024-01-19', 'Fragile - glass items'],
      ['TRK005', '654 Maple Dr, Phoenix, AZ 85001', 'DELAYED', false, '2024-01-08', '2024-01-16', 'Weather delay']
    ];

    let insertedCount = 0;
    for (const [tracking_number, address, status, is_fragile, ship_date, est_delivery, notes] of sampleShipments) {
      const exists = await Shipment.findOne({ tracking_number });
      if (!exists) {
        await Shipment.create({
          user_id: user._id,
          tracking_number,
          destination_address: address,
          status,
          is_fragile,
          ship_date: new Date(ship_date),
          estimated_delivery_date: new Date(est_delivery),
          notes
        });
        insertedCount++;
      }
    }
    
    if (insertedCount > 0) {
      console.log(`✅ ${insertedCount} sample shipments inserted`);
    } else {
      console.log('✅ Sample shipments already exist');
    }

    console.log('🎉 MongoDB initialization completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ MongoDB initialization failed:', error.message);
    process.exit(1);
  }
};

initDatabase();
