const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const testLogin = async (email, password) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log(`\n🔐 Testing login for: ${email}`);
        console.log(`🔐 Password entered: ${password}`);

        const user = await User.findOne({ email });

        if (!user) {
            console.log('❌ User not found in database');
            process.exit(1);
        }

        console.log('✅ User found in database');
        console.log(`   Name: ${user.name}`);
        console.log(`   Hashed password: ${user.password.substring(0, 30)}...`);

        const isMatch = await user.matchPassword(password);

        if (isMatch) {
            console.log('✅ Password matches! Login should work.');
        } else {
            console.log('❌ Password does NOT match!');
            console.log('   This password is incorrect for this user.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

// Test with the email from the screenshot
// Replace 'YOUR_PASSWORD_HERE' with the actual password you're trying
const email = process.argv[2] || 'pawan@gmail.com';
const password = process.argv[3] || 'test123';

testLogin(email, password);
