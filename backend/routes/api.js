const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Lead = require('../models/Lead');

// @route   GET /api/events
// @desc    Get all active events
// @access  Public
router.get('/events', async (req, res) => {
    try {
        const { city, search } = req.query;
        let query = { status: { $ne: 'inactive' } }; // Default: show new, updated, imported

        if (city) {
            query['venue.address'] = { $regex: city, $options: 'i' };
        }
        
        if (search) {
             query.$text = { $search: search };
        }

        const events = await Event.find(query).sort({ dateTime: 1 });
        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/leads
// @desc    Capture user email
// @access  Public
router.post('/leads', async (req, res) => {
    const { email, eventId, consent } = req.body;

    try {
        const newLead = new Lead({
            email,
            eventId,
            consent
        });

        await newLead.save();
        res.json(newLead);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
