const HomeContent = require('../models/HomeContent');

// Default content for initialization
const getDefaultContent = () => ({
    hero: {
        slides: [{
            badge: 'भारत की सबसे बड़ी समाजवादी पार्टी',
            title: 'समाजवादी पार्टी में\nआपका स्वागत है!',
            subtitle: 'समाज के हर वर्ग के विकास के लिए समर्पित। समानता, न्याय और समृद्धि के लिए हमारे साथ जुड़ें।',
            image: '',
            stats: [
                { num: '25L+', label: 'सक्रिय सदस्य' },
                { num: '75+', label: 'सीटें जीतीं' },
                { num: '1000+', label: 'विकास परियोजनाएं' }
            ],
            highlights: ['Free Laptop योजना', 'किसान पेंशन योजना', 'रोजगार गारंटी']
        }],
        autoPlayInterval: 5000
    },
    trackRecord: {
        title: 'Our Track Record',
        items: [
            { num: '10L+', label: 'Active Members', icon: 'account-group' },
            { num: '75', label: 'Districts Covered', icon: 'city' },
            { num: '1M+', label: 'Tasks Completed', icon: 'checkbox-marked-circle' },
            { num: '5000+', label: 'Campaigns Run', icon: 'bullhorn' }
        ]
    },
    president: {
        slides: [{
            badge: 'National President',
            name: 'Akhilesh Yadav',
            subtitle: 'समाजवादी पार्टी के राष्ट्रीय अध्यक्ष',
            quote: 'समाजवाद का अर्थ है - समानता, न्याय और विकास।',
            image: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Akhilesh_Yadav_Lok_Sabha.jpg',
            achievements: [
                'Former Chief Minister of UP (2012-2017)',
                'Member of 17th Lok Sabha',
                'Launched 1000+ Development Projects'
            ],
            isActive: true
        }],
        autoPlayInterval: 5000
    },
    legacy: {
        title: 'Our Legacy',
        leaders: [{
            name: 'Mulayam Singh Yadav',
            role: 'Founder',
            image: 'https://i.pinimg.com/474x/a5/ba/d8/a5bad8e597e3fb5b4256385476659dc9.jpg',
            description: 'Visionary leader who founded Samajwadi Party in 1992',
            isActive: true
        }],
        cards: [
            { title: 'Founded in 1992', desc: '30+ Years of Service' },
            { title: 'Multiple Terms', desc: '3 CM Tenures' }
        ]
    },
    programs: {
        title: 'Our Programs',
        items: [
            { title: 'Youth Employment', desc: 'Creating job opportunities', image: '' },
            { title: 'Farmer Welfare', desc: 'Supporting agricultural community', image: '' },
            { title: 'Education for All', desc: 'Quality education accessible to everyone', image: '' }
        ]
    },
    explorePages: {
        title: 'Explore Pages',
        selectedPageIds: []
    },
    footer: {
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
                links: []
            },
            {
                id: 'resources',
                title: 'Resources',
                type: 'links',
                links: []
            },
            {
                id: 'contact_info',
                title: 'Contact Info',
                type: 'contact',
                contact: { address: '', phone: '', email: '' }
            },
            {
                id: 'social_media',
                title: 'Follow Us',
                type: 'social',
                social: { facebook: '', twitter: '', instagram: '', youtube: '' }
            }
        ],
        copyright: '© 2024 Samajwadi Party. All rights reserved.'
    }
});

// @desc    Get home content
// @route   GET /api/home-content
// @access  Public
const getHomeContent = async (req, res) => {
    try {
        let content = await HomeContent.findOne().populate('explorePages.selectedPageIds');

        // If no content exists, create with defaults
        if (!content) {
            content = await HomeContent.create(getDefaultContent());
        }

        res.json({
            success: true,
            data: content
        });
    } catch (error) {
        console.error('Error fetching home content:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update entire home content
// @route   PUT /api/home-content
// @access  Private/Admin
const updateHomeContent = async (req, res) => {
    try {
        const { hero, trackRecord, president, legacy, programs, explorePages, footer } = req.body;

        console.log('=== Updating Home Content ===');
        console.log('Received hero:', JSON.stringify(hero, null, 2));

        // Create update object
        const updateData = {};
        if (hero !== undefined) updateData.hero = hero;
        if (trackRecord !== undefined) updateData.trackRecord = trackRecord;
        if (president !== undefined) updateData.president = president;
        if (legacy !== undefined) updateData.legacy = legacy;
        if (programs !== undefined) updateData.programs = programs;
        if (explorePages !== undefined) updateData.explorePages = explorePages;
        if (footer !== undefined) updateData.footer = footer;

        // Use findOneAndUpdate to ensure fields are set correctly
        const content = await HomeContent.findOneAndUpdate(
            {},
            { $set: updateData },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.json({
            success: true,
            message: 'Home content updated successfully',
            data: content
        });
    } catch (error) {
        console.error('Error updating home content:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update Hero Section
// @route   PUT /api/home-content/hero
// @access  Private/Admin
const updateHeroSection = async (req, res) => {
    try {
        const { slides, autoPlayInterval } = req.body;

        let content = await HomeContent.findOne();
        if (!content) {
            content = new HomeContent(getDefaultContent());
        }

        if (slides !== undefined) content.hero.slides = slides;
        if (autoPlayInterval !== undefined) content.hero.autoPlayInterval = autoPlayInterval;

        content.markModified('hero');
        await content.save();

        res.json({
            success: true,
            message: 'Hero section updated successfully',
            data: content.hero
        });
    } catch (error) {
        console.error('Error updating hero:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update Track Record Section
// @route   PUT /api/home-content/track-record
// @access  Private/Admin
const updateTrackRecord = async (req, res) => {
    try {
        const { title, items } = req.body;

        let content = await HomeContent.findOne();
        if (!content) {
            content = new HomeContent(getDefaultContent());
        }

        if (title !== undefined) content.trackRecord.title = title;
        if (items !== undefined) content.trackRecord.items = items;

        await content.save();

        res.json({
            success: true,
            message: 'Track record updated successfully',
            data: content.trackRecord
        });
    } catch (error) {
        console.error('Error updating track record:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update President Section
// @route   PUT /api/home-content/president
// @access  Private/Admin
const updatePresident = async (req, res) => {
    try {
        const { badge, name, subtitle, quote, image, achievements } = req.body;

        let content = await HomeContent.findOne();
        if (!content) {
            content = new HomeContent(getDefaultContent());
        }

        if (badge !== undefined) content.president.badge = badge;
        if (name !== undefined) content.president.name = name;
        if (subtitle !== undefined) content.president.subtitle = subtitle;
        if (quote !== undefined) content.president.quote = quote;
        if (image !== undefined) content.president.image = image;
        if (achievements !== undefined) content.president.achievements = achievements;

        await content.save();

        res.json({
            success: true,
            message: 'President section updated successfully',
            data: content.president
        });
    } catch (error) {
        console.error('Error updating president:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update Legacy Section
// @route   PUT /api/home-content/legacy
// @access  Private/Admin
const updateLegacy = async (req, res) => {
    try {
        const { title, founderName, founderRole, founderImage, cards } = req.body;

        let content = await HomeContent.findOne();
        if (!content) {
            content = new HomeContent(getDefaultContent());
        }

        if (title !== undefined) content.legacy.title = title;
        if (founderName !== undefined) content.legacy.founderName = founderName;
        if (founderRole !== undefined) content.legacy.founderRole = founderRole;
        if (founderImage !== undefined) content.legacy.founderImage = founderImage;
        if (cards !== undefined) content.legacy.cards = cards;

        await content.save();

        res.json({
            success: true,
            message: 'Legacy section updated successfully',
            data: content.legacy
        });
    } catch (error) {
        console.error('Error updating legacy:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update Programs Section
// @route   PUT /api/home-content/programs
// @access  Private/Admin
const updatePrograms = async (req, res) => {
    try {
        const { title, items } = req.body;

        let content = await HomeContent.findOne();
        if (!content) {
            content = new HomeContent(getDefaultContent());
        }

        if (title !== undefined) content.programs.title = title;
        if (items !== undefined) content.programs.items = items;

        await content.save();

        res.json({
            success: true,
            message: 'Programs section updated successfully',
            data: content.programs
        });
    } catch (error) {
        console.error('Error updating programs:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update Explore Pages Section
// @route   PUT /api/home-content/explore-pages
// @access  Private/Admin
const updateExplorePages = async (req, res) => {
    try {
        const { title, selectedPageIds } = req.body;

        let content = await HomeContent.findOne();
        if (!content) {
            content = new HomeContent(getDefaultContent());
        }

        if (title !== undefined) content.explorePages.title = title;
        if (selectedPageIds !== undefined) content.explorePages.selectedPageIds = selectedPageIds;

        await content.save();

        res.json({
            success: true,
            message: 'Explore pages updated successfully',
            data: content.explorePages
        });
    } catch (error) {
        console.error('Error updating explore pages:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Reset to default content
// @route   POST /api/home-content/reset
// @access  Private/Admin
const resetToDefault = async (req, res) => {
    try {
        await HomeContent.deleteMany({});
        const content = await HomeContent.create(getDefaultContent());

        res.json({
            success: true,
            message: 'Home content reset to defaults',
            data: content
        });
    } catch (error) {
        console.error('Error resetting home content:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getHomeContent,
    updateHomeContent,
    updateHeroSection,
    updateTrackRecord,
    updatePresident,
    updateLegacy,
    updatePrograms,
    updateExplorePages,
    resetToDefault
};
