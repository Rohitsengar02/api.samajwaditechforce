const District = require('../models/District');

// @desc    Get all districts
// @route   GET /api/districts
// @access  Private/Admin
const getDistricts = async (req, res) => {
    try {
        const districts = await District.find({}).populate('head', 'fullName mobileNumber');
        res.json(districts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a district
// @route   POST /api/districts
// @access  Private/Admin
const createDistrict = async (req, res) => {
    try {
        const { name, headName, headPhone, headEmail, assemblies, assemblyCount } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'District name is required' });
        }

        const districtExists = await District.findOne({ name });
        if (districtExists) {
            return res.status(400).json({ success: false, message: 'District already exists' });
        }

        const district = await District.create({
            name,
            headName,
            headPhone,
            headEmail,
            assemblies: assemblies || [],
            assemblyCount: parseInt(assemblyCount) || 0,
        });

        if (district) {
            res.status(201).json({
                success: true,
                message: 'District created successfully',
                data: district
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid district data' });
        }
    } catch (error) {
        console.error('Error creating district:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getDistricts, createDistrict };
