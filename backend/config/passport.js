const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
// We need a User model for admins. For this demo, we'll allow anyone to login but restrict Admin features via an 'role' or simple list.
// Or we just store the user in session.
// Let's create a simple User Schema inline or separate. Better separate.

const User = require('../models/User');

module.exports = function(passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/auth/google/callback` : '/auth/google/callback',
        proxy: true // Important for Vercel/Heroku to trust headers
    },
    async (accessToken, refreshToken, profile, done) => {
        // console.log(profile);
        const newUser = {
            googleId: profile.id,
            displayName: profile.displayName,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            image: profile.photos[0].value
        };

        try {
            let user = await User.findOne({ googleId: profile.id });

            if(user) {
                done(null, user);
            } else {
                user = await User.create(newUser);
                done(null, user);
            }
        } catch (err) {
            console.error(err);
            done(err, null);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id).then(user => done(null, user));
    });
};
