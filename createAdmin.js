const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const createAdmin = async () => {
    try {
        const adminEmail = 'admin@stf.com';
        const userExists = await User.findOne({ email: adminEmail });

        if (userExists) {
            console.log('Admin user already exists');
            // If exists, ensure role is admin
            if (userExists.role !== 'admin') {
                userExists.role = 'admin';
                await userExists.save();
                console.log('Updated existing user to admin role');
            }
            process.exit();
        }

        const user = await User.create({
            name: 'Admin User',
            email: adminEmail,
            phone: '9999999999',
            password: 'adminpassword',
            role: 'admin',
            isPartyMember: 'Yes',
            partyRole: 'Admin'
        });

        console.log('Admin user created successfully');
        console.log('Email: admin@stf.com');
        console.log('Password: adminpassword');
        process.exit();
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
