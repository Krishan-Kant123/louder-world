const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const connectDB = require('./config/db');
const scrapeEventbrite = require('./scrapers/eventbrite');
const { syncEvents } = require('./services/eventService');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
// const MongoStore = require('connect-mongo'); // Optional for persistent sessions, skipping for MVP to save deps or use default memory (leaks)
// Note: express-session MemoryStore is not for production. Mongoose 6+ has MongoStore usually separate.

// Passport config
require('./config/passport')(passport);

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Frontend URL
    credentials: true
}));

// Sessions
app.use(session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    // store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }) // Uncomment if connect-mongo installed
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api', require('./routes/api'));
app.use('/auth', require('./routes/auth'));
const runScraper = async () => {
    console.log('--- Triggering Scheduled Scrape ---');
    try {
        const events = await scrapeEventbrite();
        await syncEvents(events, 'Eventbrite');
        console.log('--- Scrape & Sync Finished ---');
    } catch (err) {
        console.error('Scheduled Scrape Failed:', err.message);
    }
};

// Start Scraper on server start (for demo purposes)
// In production, might want to delay this or use true Cron
console.log('Initializing Scheduler...');
// Run immediately on start (Wait 5s to ensure DB connects)
setTimeout(runScraper, 5000);

// Run every 6 hours (6 * 60 * 60 * 1000)
setInterval(runScraper, 21600000); 

// Routes (Placeholder)
app.get('/', (req, res) => res.send('API Running'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
