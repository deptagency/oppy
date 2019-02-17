#!/usr/bin/env node


// Required packages
const got = require('got');
const ical = require('node-ical');
const CachemanFile = require('cacheman-file');
const difference = require('lodash.difference');
const argv = require('mri')(process.argv.slice(2));

// Arguments check
if (! argv['personio-ics'] || ! argv['slack-webhook']) {
    console.error('Endpoints needed');

    process.exit(1);
}

// Cache init
const cache = new CachemanFile({tmpDir: './cache'});
const cacheKey = new Date().toISOString().split('T')[0];
const cacheTTL = 60 * 60 * 10;

// Absences pool
let absences = [];

// Request ICS
ical.fromURL(argv['personio-ics'], {}, (error, data) => {

    // Exit on error
    if (error) {
        console.log(error);

        process.exit(1);
    }

    // Loop events
    Object.values(data).map(event => {
        const eventStart = Date.parse(event.start);
        const eventEnd = Date.parse(event.end);
        const today = Date.now();
        const diff = today <= eventEnd && today >= eventStart;

        diff && absences.push(event.summary);
    });

    // Exit if empty
    if (! absences.length) {
        console.log('No crowd');

        process.exit(1);
    }

    // Sync cache
    cache.get(cacheKey, async (error, value) => {

        if (error) {
            console.log('Caching error');

            return;
        }

        const diff = difference(absences, value);

        await cache.set(cacheKey, absences, cacheTTL);

        if (diff.length) {
            got(argv['slack-webhook'], {
                method: 'POST',
                body: JSON.stringify({
                    'text': 'Today absent:\n`' + diff.join('`\n`') + '`'
                })
            });
        }

    })

});
