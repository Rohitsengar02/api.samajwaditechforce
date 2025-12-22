const express = require('express');
const router = express.Router();
const ContactPageSettings = require('../models/ContactPageSettings');

// @desc    Get contact page settings
// @route   GET /api/contact-settings
// @access  Public
router.get('/', async (req, res) => {
    try {
        let settings = await ContactPageSettings.findOne();

        // If no settings exist, create default ones
        if (!settings) {
            settings = await ContactPageSettings.create({});
        }

        res.json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

// @desc    Update contact page settings
// @route   PUT /api/contact-settings
// @access  Admin (should be protected in production)
router.put('/', async (req, res) => {
    try {
        const {
            pageTitle,
            pageSubtitle,
            address,
            email,
            phone,
            formTitle,
            nameLabel,
            emailLabel,
            messageLabel,
            submitButtonText,
            successMessage,
            socialMedia,
            officeHours,
            additionalInfo
        } = req.body;

        let settings = await ContactPageSettings.findOne();

        if (!settings) {
            // Create new settings if none exist
            settings = await ContactPageSettings.create(req.body);
        } else {
            // Update existing settings
            if (pageTitle !== undefined) settings.pageTitle = pageTitle;
            if (pageSubtitle !== undefined) settings.pageSubtitle = pageSubtitle;
            if (address !== undefined) settings.address = address;
            if (email !== undefined) settings.email = email;
            if (phone !== undefined) settings.phone = phone;
            if (formTitle !== undefined) settings.formTitle = formTitle;
            if (nameLabel !== undefined) settings.nameLabel = nameLabel;
            if (emailLabel !== undefined) settings.emailLabel = emailLabel;
            if (messageLabel !== undefined) settings.messageLabel = messageLabel;
            if (submitButtonText !== undefined) settings.submitButtonText = submitButtonText;
            if (successMessage !== undefined) settings.successMessage = successMessage;
            if (socialMedia !== undefined) settings.socialMedia = socialMedia;
            if (officeHours !== undefined) settings.officeHours = officeHours;
            if (additionalInfo !== undefined) settings.additionalInfo = additionalInfo;

            await settings.save();
        }

        res.json({ success: true, data: settings, message: 'Settings updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

// @desc    Submit contact form
// @route   POST /api/contact-settings/submit
// @access  Public
router.post('/submit', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        // Here you can add logic to:
        // 1. Save to database
        // 2. Send email notification
        // 3. Send to CRM
        // For now, we'll just return success

        console.log('Contact form submission:', { name, email, message });

        const settings = await ContactPageSettings.findOne();
        const successMessage = settings?.successMessage || 'Your message has been sent!';

        res.json({
            success: true,
            message: successMessage
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

module.exports = router;
