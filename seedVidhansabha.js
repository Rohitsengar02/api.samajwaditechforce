const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const Vidhansabha = require('./models/Vidhansabha');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

const seedVidhansabha = async () => {
    try {
        const dataPath = path.join(__dirname, 'vidhansabha_data.json');
        let rawData = fs.readFileSync(dataPath, 'utf-8').trim();

        // Fix: The file contains comma-separated objects but is not an array.
        // We wrap it in brackets to make it a valid JSON array.
        if (!rawData.startsWith('[')) {
            rawData = `[${rawData}]`;
        }

        const jsonData = JSON.parse(rawData);

        console.log(`Read ${jsonData.length} records from JSON file.`);

        await Vidhansabha.deleteMany({});
        console.log('Cleared existing Vidhansabha collection.');

        const vidhansabhas = [];
        let currentDistrict = '';

        for (const item of jsonData) {
            // Handle District fill-down logic
            if (item['District[7]']) {
                currentDistrict = item['District[7]'];
            }

            const vidhansabha = {
                constituencyNumber: item['Constituency\nnumber'],
                constituencyName: item['Constituency\nname'],
                reservedFor: item['Reserved for\n(SC\/STNone)'],
                electors: item['Electors\n[6]'],
                district: currentDistrict, // Use the current (or filled-down) district
                lokSabhaConstituency: item['Lok Sabha\nconstituency']
            };

            vidhansabhas.push(vidhansabha);
        }

        await Vidhansabha.insertMany(vidhansabhas);
        console.log(`Successfully seeded ${vidhansabhas.length} Vidhansabha records.`);

        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedVidhansabha();
