const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const listValidLogins = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected\n');

        console.log('=== VALID LOGIN CREDENTIALS ===\n');

        // Get all admins who can login
        const validAdmins = await User.find({
            $or: [
                { role: 'master-admin' },
                {
                    role: 'admin',
                    adminVerification: true,
                    verificationStatus: 'Verified'
                }
            ]
        }).select('name email role');

        if (validAdmins.length === 0) {
            console.log('❌ No valid admins found!');
        } else {
            validAdmins.forEach((admin, index) => {
                console.log(`${index + 1}. ${admin.role === 'master-admin' ? '👑 MASTER ADMIN' : '👤 ADMIN'}`);
                console.log(`   Email: ${admin.email}`);
                console.log(`   Name: ${admin.name}`);
                console.log(`   Password: (You need to know this)`);
                console.log('');
            });
        }

        console.log('\n💡 TIP: The default Master Admin password is: SAmajWAdi5544');
        console.log('💡 Try logging in with one of the emails above\n');

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

listValidLogins();
