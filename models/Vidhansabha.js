const mongoose = require('mongoose');

const vidhansabhaSchema = new mongoose.Schema({
    constituencyNumber: {
        type: Number,
        required: true,
        unique: true
    },
    constituencyName: {
        type: String,
        required: true
    },
    reservedFor: {
        type: String,
        required: false
    },
    electors: {
        type: Number,
        required: false
    },
    district: {
        type: String,
        required: false
    },
    lokSabhaConstituency: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Vidhansabha', vidhansabhaSchema);
