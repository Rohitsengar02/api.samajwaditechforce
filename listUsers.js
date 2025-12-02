const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('\n📋 Users in database:\n');

        const users = await User.find({}).select('name email role phone');

        if (users.length === 0) {
            console.log('  ⚠️  No users found in database!');
        } else {
            users.forEach(user => {
                console.log(`  ✓ Email: ${user.email}`);
                console.log(`    Name: ${user.name}`);
                console.log(`    Role: ${user.role}`);
                console.log(`    Phone: ${user.phone}`);
                console.log('    ---');
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

listUsers();
