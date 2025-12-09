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

// @desc    Get district by ID
// @route   GET /api/districts/:id
// @access  Private/Admin
const getDistrictById = async (req, res) => {
    try {
        const district = await District.findById(req.params.id);

        if (!district) {
            return res.status(404).json({ success: false, message: 'District not found' });
        }

        res.json({ success: true, data: district });
    } catch (error) {
        console.error('Error fetching district:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update a district
// @route   PUT /api/districts/:id
// @access  Private/Admin
const updateDistrict = async (req, res) => {
    try {
        const { name, headName, headPhone, headEmail, assemblyCount } = req.body;

        const district = await District.findById(req.params.id);

        if (!district) {
            return res.status(404).json({ success: false, message: 'District not found' });
        }

        // Update fields
        district.name = name || district.name;
        district.headName = headName || district.headName;
        district.headPhone = headPhone || district.headPhone;
        district.headEmail = headEmail || district.headEmail;
        district.assemblyCount = assemblyCount !== undefined ? parseInt(assemblyCount) : district.assemblyCount;

        const updatedDistrict = await district.save();

        res.json({
            success: true,
            message: 'District updated successfully',
            data: updatedDistrict
        });
    } catch (error) {
        console.error('Error updating district:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a district
// @route   DELETE /api/districts/:id
// @access  Private/Admin
const deleteDistrict = async (req, res) => {
    try {
        const district = await District.findById(req.params.id);

        if (!district) {
            return res.status(404).json({ success: false, message: 'District not found' });
        }

        await District.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: 'District deleted successfully' });
    } catch (error) {
        console.error('Error deleting district:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getDistricts, createDistrict, getDistrictById, updateDistrict, deleteDistrict };

