import { Route } from '@/types';
import ofetch from '@/utils/ofetch'; // Unified request library used
import { load } from 'cheerio'; // An HTML parser with an API similar to jQuery
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/events',
    example: '/cltcomedyzone/events',
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
            source: ['cltcomedyzone.com/'],
        },
    ],
    name: 'Events',
    handler,
    url: 'cltcomedyzone.com',
};

async function handler() {
    const response = await ofetch(`https://www.cltcomedyzone.com/events`);
    const $ = load(response);

    // We use a Cheerio selector to select all 'div' elements with the class name 'js-navigation-container'
    // that contain child elements with the class name 'flex-auto'.
    const items = $('.page-content .event-list-item')
        // We use the `toArray()` method to retrieve all the DOM elements selected as an array.
        .toArray()
        // We use the `map()` method to traverse the array and parse the data we need from each element.
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            const dateString = item.find('.event-date').first().text().trim(); // Use trim() to clean up the string

            // Parse the date and add " EST"
            const pubDate = parseDate(dateString, 'America/New_York');

            return {
                title: a.text(),
                // We need an absolute URL for `link`, but `a.attr('href')` returns a relative URL.
                link: String(a.attr('href')),
                pubDate,
                category: 'comedy',
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
