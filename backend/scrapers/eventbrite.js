const puppeteer = require('puppeteer');

const scrapeEventbrite = async () => {
    console.log('Starting Eventbrite Scrape...');
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Block images/fonts to speed up, but do NOT block image requests if we need to detect them?
    // Actually, blocking the request doesn't remove the DOM element or src attribute usually.
    // But to be safe, let's allow images for now to ensure src is populated if it relies on load.
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if(['stylesheet', 'font'].includes(req.resourceType())){
            req.abort();
        } else {
            req.continue();
        }
    });

    const url = 'https://www.eventbrite.com.au/d/australia--sydney/events/';
    const events = [];

    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        
        // Wait for event cards
        await page.waitForSelector('div.event-card', { timeout: 15000 });

        // Scrape Logic
        const scrapedData = await page.evaluate(() => {
            const eventNodes = document.querySelectorAll('div.event-card');
            const data = [];

            eventNodes.forEach(node => {
                const titleNode = node.querySelector('h3');
                if (!titleNode) return;

                const linkNode = titleNode.closest('a');
                if (!linkNode) return;

                // Traverse siblings for Date and Venue to avoid 'Almost full' tags
                // Structure: [Aside?], A (Title), P (Date), P (Venue)
                // We find the 'A' tag, then look for the next Element Sibling (Date)
                const dateNode = linkNode.nextElementSibling;
                const locationNode = dateNode ? dateNode.nextElementSibling : null;
                
                // Image selector: try finding the image inside the card
                const imageNode = node.querySelector('img'); 

                data.push({
                    title: titleNode.innerText.trim(),
                    description: 'No description available.', 
                    dateTime: dateNode ? dateNode.innerText.trim() : 'Date pending',
                    venue: locationNode ? locationNode.innerText.trim() : 'Sydney, Australia',
                    originalURL: linkNode.href,
                    image: imageNode ? imageNode.src : null,
                    source: 'Eventbrite'
                });
            });
            return data;
        });

        // Post-processing in Node
        for(const item of scrapedData) {
            if(!item.originalURL) continue;

            // Date Parsing Logic
            let dateTime = null;
            if(item.dateTime && item.dateTime !== 'Date pending') {
                 // Clean up string: "Sat, Feb 21, 10:00 PM"
                 const cleanDate = item.dateTime.replace(' at ', ' ').replace('Today', new Date().toDateString());
                 const parsed = Date.parse(cleanDate);
                 if(!isNaN(parsed)) {
                     dateTime = new Date(parsed);
                 } else {
                     // Try adding current year if missing
                     const parsedWithYear = Date.parse(cleanDate + " " + new Date().getFullYear());
                     if(!isNaN(parsedWithYear)) dateTime = new Date(parsedWithYear);
                 }
            }
            
            // Validation: Skip if date is invalid or if it looks like garbage (e.g. still "Almost full")
            // The sibling traversal should prevent "Almost full", but if dateNode was null, we might have issues.
            if(!dateTime || isNaN(dateTime.getTime())) {
                console.warn(`Skipping event "${item.title}" - Invalid Date: "${item.dateTime}"`);
                continue;
            }

            events.push({
                title: item.title,
                dateTime: dateTime,
                venue: { name: item.venue, address: 'Sydney, NSW' },
                sourceName: 'Eventbrite',
                originalURL: item.originalURL,
                imageURL: item.image, // Correctly mapped
                description: item.description || `Event on ${item.dateTime}`
            });
        }

    } catch (e) {
        console.error("Scrape Error:", e.message);
    } finally {
        await browser.close();
    }
    
    return events;
};

module.exports = scrapeEventbrite;
