const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const seedMasterAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const masterAdminData = {
            name: 'Master Admin',
            email: 'samajwadi332@gmail.com',
            password: 'SAmajWAdi5544',
            role: 'master-admin',
            phone: '0000000000', // Dummy phone
            adminVerification: true,
            verificationStatus: 'Verified'
        };

        const userExists = await User.findOne({ email: masterAdminData.email });

        if (userExists) {
            console.log('Master Admin already exists');
            userExists.role = 'master-admin';
            userExists.adminVerification = true;
            userExists.password = masterAdminData.password; // Will be hashed by pre-save hook
            await userExists.save();
            console.log('Master Admin updated');
        } else {
            await User.create(masterAdminData);
            console.log('Master Admin created');
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

seedMasterAdmin();
