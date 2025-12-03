const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const AdminApproval = require('./models/AdminApproval');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const checkAdmins = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected\n');

        // Check User collection
        const users = await User.find({}).select('name email phone role adminVerification');
        console.log('=== USERS IN DATABASE ===');
        console.log('Total users:', users.length);
        users.forEach(user => {
            console.log(`- ${user.name} | ${user.email} | ${user.phone} | ${user.role} | Verified: ${user.adminVerification}`);
        });

        console.log('\n=== ADMIN APPROVAL REQUESTS ===');
        const approvals = await AdminApproval.find({});
        console.log('Total pending requests:', approvals.length);
        approvals.forEach(approval => {
            console.log(`- ${approval.name} | ${approval.email} | ${approval.phone} | ${approval.role}`);
        });

        console.log('\n=== INSTRUCTIONS ===');
        console.log('If you want to test registration with existing email/phone, you need to:');
        console.log('1. Delete the user from User collection, OR');
        console.log('2. Delete the request from AdminApproval collection, OR');
        console.log('3. Use completely NEW email and phone numbers');

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkAdmins();
