const Page = require('../models/Page');

// @desc    Get all pages
// @route   GET /api/pages
// @access  Public
const getPages = async (req, res) => {
    try {
        const { status, type } = req.query;
        const query = {};

        if (status) query.status = status;
        if (type) query.type = type;

        const pages = await Page.find(query).sort({ order: 1, createdAt: -1 });

        res.json({
            success: true,
            count: pages.length,
            data: pages
        });
    } catch (error) {
        console.error('Error fetching pages:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single page by ID
// @route   GET /api/pages/:id
// @access  Public
const getPageById = async (req, res) => {
    try {
        const page = await Page.findById(req.params.id);

        if (!page) {
            return res.status(404).json({ success: false, message: 'Page not found' });
        }

        res.json({
            success: true,
            data: page
        });
    } catch (error) {
        console.error('Error fetching page:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single page by slug
// @route   GET /api/pages/slug/:slug
// @access  Public
const getPageBySlug = async (req, res) => {
    try {
        const page = await Page.findOne({ slug: req.params.slug });

        if (!page) {
            return res.status(404).json({ success: false, message: 'Page not found' });
        }

        res.json({
            success: true,
            data: page
        });
    } catch (error) {
        console.error('Error fetching page:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create a page
// @route   POST /api/pages
// @access  Private/Admin
const createPage = async (req, res) => {
    try {
        const { title, slug, type, content, metaTitle, metaDescription, metaKeywords, headerImage, status, customFields, order, showInMenu, icon } = req.body;

        if (!title || !slug) {
            return res.status(400).json({ success: false, message: 'Please provide title and slug' });
        }

        // Check if slug already exists
        const existingPage = await Page.findOne({ slug });
        if (existingPage) {
            return res.status(400).json({ success: false, message: 'A page with this slug already exists' });
        }

        const page = await Page.create({
            title,
            slug,
            type: type || 'static',
            content,
            metaTitle,
            metaDescription,
            metaKeywords,
            headerImage,
            status: status || 'draft',
            customFields: customFields || [],
            order: order || 0,
            showInMenu: showInMenu || false,
            icon,
            // createdBy: req.user._id // Uncomment when auth is enabled
        });

        res.status(201).json({
            success: true,
            message: 'Page created successfully',
            data: page
        });
    } catch (error) {
        console.error('Error creating page:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update a page
// @route   PUT /api/pages/:id
// @access  Private/Admin
const updatePage = async (req, res) => {
    try {
        const { title, slug, type, content, metaTitle, metaDescription, metaKeywords, headerImage, status, customFields, order, showInMenu, icon } = req.body;

        const page = await Page.findById(req.params.id);

        if (!page) {
            return res.status(404).json({ success: false, message: 'Page not found' });
        }

        // Check if slug is being changed and if it's already taken by another page
        if (slug && slug !== page.slug) {
            const existingPage = await Page.findOne({ slug });
            if (existingPage) {
                return res.status(400).json({ success: false, message: 'A page with this slug already exists' });
            }
        }

        // Update fields
        page.title = title || page.title;
        page.slug = slug || page.slug;
        page.type = type || page.type;
        page.content = content !== undefined ? content : page.content;
        page.metaTitle = metaTitle !== undefined ? metaTitle : page.metaTitle;
        page.metaDescription = metaDescription !== undefined ? metaDescription : page.metaDescription;
        page.metaKeywords = metaKeywords !== undefined ? metaKeywords : page.metaKeywords;
        page.headerImage = headerImage !== undefined ? headerImage : page.headerImage;
        page.status = status || page.status;
        page.customFields = customFields !== undefined ? customFields : page.customFields;
        page.order = order !== undefined ? order : page.order;
        page.showInMenu = showInMenu !== undefined ? showInMenu : page.showInMenu;
        page.icon = icon !== undefined ? icon : page.icon;

        if (content !== undefined) {
            page.markModified('content');
        }

        const updatedPage = await page.save();

        res.json({
            success: true,
            message: 'Page updated successfully',
            data: updatedPage
        });
    } catch (error) {
        console.error('Error updating page:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update page content (sections) only
// @route   PATCH /api/pages/:id/content
// @access  Private/Admin
const updatePageContent = async (req, res) => {
    try {
        const { content } = req.body;
        const page = await Page.findById(req.params.id);

        if (!page) {
            return res.status(404).json({ success: false, message: 'Page not found' });
        }

        page.content = content;
        await page.save();

        res.json({
            success: true,
            message: 'Page content updated successfully'
        });
    } catch (error) {
        console.error('Error updating page content:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a page
// @route   DELETE /api/pages/:id
// @access  Private/Admin
const deletePage = async (req, res) => {
    try {
        const page = await Page.findById(req.params.id);

        if (!page) {
            return res.status(404).json({ success: false, message: 'Page not found' });
        }

        await Page.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Page deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting page:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getPages,
    getPageById,
    getPageBySlug,
    createPage,
    updatePage,
    updatePageContent,
    deletePage
};
