const Footer = require('../models/Footer');

const getDefaultFooter = () => ({
    columns: [
        {
            id: 'about_col',
            title: 'About Us',
            type: 'text',
            content: 'The official digital wing of Samajwadi Party, dedicated to spreading the message of development and social justice.'
        },
        {
            id: 'quick_links',
            title: 'Quick Links',
            type: 'links',
            links: [
                { label: 'About Us', path: '/about' },
                { label: 'Latest News', path: '/news' },
                { label: 'Join Us', path: '/joinus' },
                { label: 'Contact', path: '/contact' }
            ]
        },
        {
            id: 'resources',
            title: 'Resources',
            type: 'links',
            links: [
                { label: 'Posters', path: '/posters' },
                { label: 'ID Card', path: '/idcard' },
                { label: 'Daily Tasks', path: '/daily-work' },
                { label: 'Events', path: '/events' }
            ]
        },
        {
            id: 'contact_info',
            title: 'Contact Info',
            type: 'contact',
            contact: { address: 'Samajwadi Party HQ\n19, Vikramaditya Marg\nLucknow, Uttar Pradesh', phone: '', email: 'contact@samajwadiparty.in' }
        },
        {
            id: 'social_media',
            title: 'Follow Us',
            type: 'social',
            social: { facebook: 'https://facebook.com/samajwadiparty', twitter: 'https://twitter.com/samajwadiparty', instagram: 'https://instagram.com/samajwadiparty', youtube: 'https://youtube.com/samajwadiparty' }
        }
    ],
    copyright: '© 2024 Samajwadi Party. All rights reserved.'
});

// @desc    Get footer content
// @route   GET /api/footer
// @access  Public
const getFooter = async (req, res) => {
    try {
        console.log('=== GET /api/footer called ===');
        let footer = await Footer.findOne();

        if (!footer) {
            console.log('No footer found, creating default...');
            footer = await Footer.create(getDefaultFooter());
        }

        console.log('Footer retrieved:', JSON.stringify(footer, null, 2));
        res.json({
            success: true,
            data: footer
        });
    } catch (error) {
        console.error('Error fetching footer:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update footer content
// @route   PUT /api/footer
// @access  Private/Admin
const updateFooter = async (req, res) => {
    try {
        console.log('=== PUT /api/footer called ===');
        console.log('Request body:', JSON.stringify(req.body, null, 2));

        const { columns, copyright } = req.body;

        const footer = await Footer.findOneAndUpdate(
            {},
            { $set: { columns, copyright } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        console.log('Footer saved successfully:', JSON.stringify(footer, null, 2));
        res.json({
            success: true,
            message: 'Footer updated successfully',
            data: footer
        });
    } catch (error) {
        console.error('Error updating footer:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete footer content (reset to default)
// @route   DELETE /api/footer
// @access  Private/Admin
const deleteFooter = async (req, res) => {
    try {
        console.log('=== DELETE /api/footer called ===');
        await Footer.deleteMany({});
        console.log('Footer deleted successfully');
        res.json({
            success: true,
            message: 'Footer deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting footer:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getFooter,
    updateFooter,
    deleteFooter
};
