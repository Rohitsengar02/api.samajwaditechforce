const Vidhansabha = require('../models/Vidhansabha');

// @desc    Get all vidhansabhas or filter by district
// @route   GET /api/vidhansabha
// @access  Public
const getVidhansabhas = async (req, res) => {
    try {
        const { district } = req.query;

        let query = {};
        if (district) {
            // Case-insensitive search
            query.district = { $regex: district, $options: 'i' };
        }

        const vidhansabhas = await Vidhansabha.find(query).sort({ constituencyNumber: 1 });

        res.json({
            success: true,
            count: vidhansabhas.length,
            data: vidhansabhas
        });
    } catch (error) {
        console.error('Get Vidhansabhas Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get all unique districts
// @route   GET /api/vidhansabha/districts
// @access  Public
const getDistricts = async (req, res) => {
    try {
        const districts = await Vidhansabha.distinct('district');

        // Filter out null/empty and sort
        const filteredDistricts = districts
            .filter(d => d && d.trim().length > 0)
            .sort();

        res.json({
            success: true,
            count: filteredDistricts.length,
            data: filteredDistricts
        });
    } catch (error) {
        console.error('Get Districts Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Search vidhansabhas by name or constituency number
// @route   GET /api/vidhansabha/search
// @access  Public
const searchVidhansabhas = async (req, res) => {
    try {
        const { q, district } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query required'
            });
        }

        let query = {
            $or: [
                { constituencyName: { $regex: q, $options: 'i' } },
                { constituencyNumber: parseInt(q) || -1 }
            ]
        };

        if (district) {
            query.district = { $regex: district, $options: 'i' };
        }

        const results = await Vidhansabha.find(query)
            .limit(20)
            .sort({ constituencyNumber: 1 });

        res.json({
            success: true,
            count: results.length,
            data: results
        });
    } catch (error) {
        console.error('Search Vidhansabhas Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

module.exports = {
    getVidhansabhas,
    getDistricts,
    searchVidhansabhas
};
