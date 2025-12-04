const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const checkMasterAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected\n');

        const masterAdmin = await User.findOne({ email: 'samajwadi332@gmail.com' });

        if (masterAdmin) {
            console.log('=== MASTER ADMIN DETAILS ===');
            console.log('Name:', masterAdmin.name);
            console.log('Email:', masterAdmin.email);
            console.log('Role:', masterAdmin.role);
            console.log('adminVerification:', masterAdmin.adminVerification);
            console.log('verificationStatus:', masterAdmin.verificationStatus);
            console.log('Phone:', masterAdmin.phone);
            console.log('\n=== PASSWORD CHECK ===');
            const testPassword = 'SAmajWAdi5544';
            const isMatch = await masterAdmin.matchPassword(testPassword);
            console.log('Password "SAmajWAdi5544" matches:', isMatch);

            if (!isMatch) {
                console.log('\n⚠️  PASSWORD DOES NOT MATCH!');
                console.log('Resetting password to: SAmajWAdi5544');
                masterAdmin.password = testPassword;
                masterAdmin.verificationStatus = 'Verified';
                masterAdmin.adminVerification = true;
                await masterAdmin.save();
                console.log('✅ Password reset successfully!');
            }

            if (masterAdmin.verificationStatus !== 'Verified') {
                console.log('\n⚠️  verificationStatus is not "Verified"!');
                console.log('Updating...');
                masterAdmin.verificationStatus = 'Verified';
                await masterAdmin.save();
                console.log('✅ verificationStatus updated to "Verified"');
            }
        } else {
            console.log('❌ Master Admin not found!');
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkMasterAdmin();
