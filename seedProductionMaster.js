const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const seedProductionMaster = async () => {
    try {
        console.log('Connecting to MongoDB...');
        console.log('URI:', process.env.MONGO_URI);

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected\n');

        const masterAdminData = {
            name: 'Master Admin',
            email: 'samajwadi332@gmail.com',
            password: 'SAmajWAdi5544',
            role: 'master-admin',
            phone: '0000000000',
            adminVerification: true,
            verificationStatus: 'Verified'
        };

        // Check if Master Admin already exists
        const userExists = await User.findOne({ email: masterAdminData.email });

        if (userExists) {
            console.log('⚠️  Master Admin already exists');
            console.log('📧 Email:', userExists.email);
            console.log('👤 Name:', userExists.name);
            console.log('🔑 Role:', userExists.role);

            // Update to ensure it's master-admin
            userExists.role = 'master-admin';
            userExists.adminVerification = true;
            userExists.password = masterAdminData.password; // Will be hashed by pre-save hook
            await userExists.save();
            console.log('✅ Master Admin role and password updated');
        } else {
            await User.create(masterAdminData);
            console.log('✅ Master Admin created successfully!');
            console.log('\n📋 Login Credentials:');
            console.log('📧 Email: samajwadi332@gmail.com');
            console.log('🔑 Password: SAmajWAdi5544');
        }

        console.log('\n🎉 You can now login to your admin panel!');

        process.exit();
    } catch (error) {
        console.error('❌ Error:', error);
        console.error('Full error:', error.stack);
        process.exit(1);
    }
};

seedProductionMaster();
