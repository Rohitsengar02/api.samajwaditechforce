const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/samajwadi-party', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function checkPoints() {
    const User = require('./models/User');
    const PointActivity = require('./models/PointActivity');
    
    const user = await User.findOne({ name: 'Rohit Sangar' });
    console.log('\n=== USER POINTS ===');
    console.log('Name:', user.name);
    console.log('Total Points in DB:', user.points);
    
    const activities = await PointActivity.find({ username: 'Rohit Sangar' }).sort({ timestamp: -1 });
    console.log('\n=== POINT ACTIVITIES ===');
    console.log('Total Activities:', activities.length);
    
    let calculatedTotal = 0;
    activities.forEach((activity, index) => {
        console.log(`${index + 1}. ${activity.activityType}: ${activity.points} points - ${activity.description}`);
        calculatedTotal += activity.points;
    });
    
    console.log('\n=== SUMMARY ===');
    console.log('Points in User model:', user.points);
    console.log('Calculated from activities:', calculatedTotal);
    console.log('Difference:', user.points - calculatedTotal);
    
    process.exit(0);
}

checkPoints().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
