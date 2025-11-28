const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Banner = require('./models/Banner');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const banners = [
    {
        title: 'Samajwadi Party Default',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Samajwadi_Party_Flag.svg/2560px-Samajwadi_Party_Flag.svg.png'
    },
    {
        title: 'Akhilesh Yadav Banner',
        imageUrl: 'https://pbs.twimg.com/profile_images/1614623366367760385/2M34yqf__400x400.jpg'
    },
    {
        title: 'Cycle Symbol',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Samajwadi_Party_Symbol.svg/1200px-Samajwadi_Party_Symbol.svg.png'
    }
];

const importData = async () => {
    try {
        await Banner.deleteMany();
        await Banner.insertMany(banners);
        console.log('Banners Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
