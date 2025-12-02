const Member = require('../models/Member');

// @desc    Get all members
// @route   GET /api/members
// @access  Private/Admin
const getMembers = async (req, res) => {
    try {
        const pageSize = 10;
        const page = Number(req.query.pageNumber) || 1;

        const keyword = req.query.keyword
            ? {
                fullName: {
                    $regex: req.query.keyword,
                    $options: 'i',
                },
            }
            : {};

        const count = await Member.countDocuments({ ...keyword });
        const members = await Member.find({ ...keyword })
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({ members, page, pages: Math.ceil(count / pageSize) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get member by ID
// @route   GET /api/members/:id
// @access  Private/Admin
const getMemberById = async (req, res) => {
    const member = await Member.findById(req.params.id);

    if (member) {
        res.json(member);
    } else {
        res.status(404).json({ message: 'Member not found' });
    }
};

// @desc    Create a member
// @route   POST /api/members
// @access  Private/Admin
const createMember = async (req, res) => {
    const { fullName, mobileNumber, district, assembly } = req.body;

    const memberExists = await Member.findOne({ mobileNumber });

    if (memberExists) {
        res.status(400).json({ message: 'Member already exists' });
        return;
    }

    const member = await Member.create({
        fullName,
        mobileNumber,
        district,
        assembly,
    });

    if (member) {
        res.status(201).json(member);
    } else {
        res.status(400).json({ message: 'Invalid member data' });
    }
};

// @desc    Update member
// @route   PUT /api/members/:id
// @access  Private/Admin
const updateMember = async (req, res) => {
    const member = await Member.findById(req.params.id);

    if (member) {
        member.fullName = req.body.fullName || member.fullName;
        member.mobileNumber = req.body.mobileNumber || member.mobileNumber;
        member.status = req.body.status || member.status;
        member.role = req.body.role || member.role;

        const updatedMember = await member.save();
        res.json(updatedMember);
    } else {
        res.status(404).json({ message: 'Member not found' });
    }
};

module.exports = { getMembers, getMemberById, createMember, updateMember };
