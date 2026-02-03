const axios = require('axios');
const cheerio = require('cheerio');

async function testScrape() {
    console.log("Testing Eventbrite...");
    try {
        const { data } = await axios.get('https://www.eventbrite.com.au/d/australia--sydney/events/', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });
        const $ = cheerio.load(data);
        const events = [];
        // Attempt to find common event card selectors
        $('div.eds-event-card-content__primary-content').each((i, el) => {
             const title = $(el).find('div.eds-event-card__formatted-name--is-clamped').text().trim();
             if(title) events.push(title);
        });
        
        // Timeout structure check
        // $('article.tile').each(...)

        console.log(`Eventbrite found ${events.length} titles.`);
        if(events.length > 0) console.log(events.slice(0, 3));
    } catch (e) {
        console.log("Eventbrite failed:", e.message);
    }

    console.log("\nTesting Timeout Sydney...");
    try {
        const { data } = await axios.get('https://www.timeout.com/sydney/events', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });
        const $2 = cheerio.load(data);
        const timeoutEvents = [];
        $2('article.tile').each((i, el) => {
             const title = $2(el).find('h3._h3_cuogz_1').text().trim(); // Note: Selectors might vary, checking generic
             if(title) timeoutEvents.push(title);
        });
        // Fallback for timeout generic lookup
         if(timeoutEvents.length === 0) {
             $2('h3').each((i, el) => { 
                 if ($2(el).parents('article').length) timeoutEvents.push($2(el).text().trim());
             });
         }

        console.log(`Timeout found ${timeoutEvents.length} titles.`);
        if(timeoutEvents.length > 0) console.log(timeoutEvents.slice(0, 3));

    } catch (e) {
         console.log("Timeout failed:", e.message);
    }
}

testScrape();
