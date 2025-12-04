const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const diagnoseLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected\n');

        console.log('=== CHECKING ALL ADMINS ===\n');

        const admins = await User.find({
            $or: [
                { role: 'admin' },
                { role: 'master-admin' }
            ]
        }).select('name email role adminVerification verificationStatus');

        admins.forEach(admin => {
            console.log(`📧 ${admin.email}`);
            console.log(`   Name: ${admin.name}`);
            console.log(`   Role: ${admin.role}`);
            console.log(`   adminVerification: ${admin.adminVerification}`);
            console.log(`   verificationStatus: ${admin.verificationStatus}`);

            // Check if can login
            const canLogin = admin.role === 'master-admin' ||
                (admin.role === 'admin' && admin.verificationStatus === 'Verified' && admin.adminVerification === true);
            console.log(`   ✅ Can Login: ${canLogin ? 'YES' : 'NO'}`);
            console.log('');
        });

        console.log('\n=== RECOMMENDATION ===');
        console.log('For admins to login successfully:');
        console.log('1. role must be "admin"');
        console.log('2. verificationStatus must be "Verified"');
        console.log('3. adminVerification must be true');
        console.log('\nMaster Admin can always login.');

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

diagnoseLogin();
