import { Route } from '@/types';
import ofetch from '@/utils/ofetch'; // Unified request library used
import { load } from 'cheerio'; // An HTML parser with an API similar to jQuery
// import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/events',
    example: '/blumenthalarts/events',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['blumenthalarts.org/'],
        },
    ],
    name: 'Events',
    handler,
    url: 'blumenthalarts.org',
};

async function handler() {
    const response = await ofetch(`https://www.blumenthalarts.org/events`);
    const $ = load(response);

    // We use a Cheerio selector to select all 'div' elements with the class name 'js-navigation-container'
    // that contain child elements with the class name 'flex-auto'.
    const items = $('div.eventList__wrapper .eventItem')
        // We use the `toArray()` method to retrieve all the DOM elements selected as an array.
        .toArray()
        // We use the `map()` method to traverse the array and parse the data we need from each element.
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            const dateString = item.find('.date').first().text().trim(); // Use trim() to clean up the string

            // Parse the date and add " EST"
            const pubDate = dateString; // parseDate(dateString, 'America/New_York');

            return {
                title: item.find('.title').first().text().trim(),
                // We need an absolute URL for `link`, but `a.attr('href')` returns a relative URL.
                link: String(a.attr('href')),
                pubDate,
                category: 'blumenthal',
            };
        });

    return {
        // channel title
        title: `The Comedy Zone - Events`,
        // channel link
        link: `https://www.cltcomedyzone.com/events`,
        // each feed item
        item: items,
    };
}
