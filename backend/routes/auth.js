const express = require('express');
const passport = require('passport');
const router = express.Router();

// @desc    Auth with Google
// @route   GET /auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile'] }));

// @desc    Google auth callback
// @route   GET /auth/google/callback
router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
    // Successful authentication, redirect to dashboard.
    // In production with separate frontend (port 3000 vs 5000), we probably redirect to frontend URL.
    // For now, redirect to a generic success page or the frontend dashboard URL.
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/admin/dashboard`); 
    }
);

// @desc    Logout user
// @route   GET /auth/logout
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

// @desc    Get current user
// @route   GET /auth/current_user
router.get('/current_user', (req, res) => {
    res.send(req.user);
});

module.exports = router;
