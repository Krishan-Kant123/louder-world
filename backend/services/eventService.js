const Event = require('../models/Event');

/**
 * Syncs scraped events with the database.
 * @param {Array} scrapedEvents - List of event objects from scraper
 * @param {String} sourceName - Source identifier (e.g., 'Eventbrite')
 */
const syncEvents = async (scrapedEvents, sourceName) => {
    console.log(`Syncing ${scrapedEvents.length} events from ${sourceName}...`);
    let newCount = 0;
    let updatedCount = 0;
    
    // Get all active URLs for this source to detect inactive ones later
    // const activeUrls = new Set(scrapedEvents.map(e => e.originalURL));

    for (const event of scrapedEvents) {
        try {
            // Find existing event by strict URL match
            const existingEvent = await Event.findOne({ originalURL: event.originalURL });

            if (existingEvent) {
                // Check if meaningful details changed
                const isTimeChanged = new Date(existingEvent.dateTime).getTime() !== new Date(event.dateTime).getTime();
                const isVenueChanged = existingEvent.venue.name !== event.venue.name;
                
                if (isTimeChanged || isVenueChanged) {
                    existingEvent.dateTime = event.dateTime;
                    existingEvent.venue = event.venue;
                    existingEvent.title = event.title; // Update title just in case
                    existingEvent.imageURL = event.imageURL;
                    existingEvent.status = 'updated';
                    existingEvent.lastScrapedAt = new Date();
                    await existingEvent.save();
                    updatedCount++;
                } else {
                    // Just update timestamp, keep status as is (unless it was inactive?)
                    existingEvent.lastScrapedAt = new Date();
                    // If it was inactive, mark it back to 'updated' or 'new'? Maybe 'updated'
                    if (existingEvent.status === 'inactive') {
                        existingEvent.status = 'updated';
                    }
                    await existingEvent.save();
                }
            } else {
                // Create new
                await Event.create({
                    ...event,
                    sourceName,
                    status: 'new',
                    lastScrapedAt: new Date()
                });
                newCount++;
            }
        } catch (err) {
            console.error(`Error syncing event ${event.title}:`, err.message);
        }
    }

    // Identify Inactive Events (Not present in current scrape but exist in DB for this source)
    // Rule: If lastScrapedAt is older than 24 hours (or scrape interval), mark inactive.
    // This part is better done as a separate cleanup job or carefully here.
    // For now, we update 'lastScrapedAt' for all found.
    // Cleanup will flag those with old 'lastScrapedAt'.
    
    console.log(`Sync Complete: ${newCount} New, ${updatedCount} Updated.`);
};

module.exports = { syncEvents };
