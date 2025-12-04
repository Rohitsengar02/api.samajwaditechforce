const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const readline = require('readline');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected\n');

        rl.question('Enter email address: ', async (email) => {
            rl.question('Enter new password: ', async (newPassword) => {

                const user = await User.findOne({ email });

                if (!user) {
                    console.log('❌ User not found with email:', email);
                    process.exit(1);
                }

                console.log('\n✅ User found:', user.name);
                console.log('Resetting password...\n');

                // Update password (will be hashed by pre-save hook)
                user.password = newPassword;
                await user.save();

                console.log('✅ Password reset successfully!');
                console.log('\nYou can now login with:');
                console.log('Email:', email);
                console.log('Password:', newPassword);

                process.exit(0);
            });
        });

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

resetPassword();
