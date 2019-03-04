#!/usr/bin/env node


// Required packages
const got = require('got');
const util = require('util');
const ical = require('node-ical');
const DateDiff = require('date-diff');
const pluralize = require('pluralize');
const CachemanFile = require('cacheman-file');
const difference = require('lodash.difference');
const argv = require('mri')(process.argv.slice(2));

// Arguments check
if (! argv['personio-ics'] || ! argv['slack-webhook']) {
    console.error('Endpoints needed');

    process.exit(1);
}

// Today values
const todayKey = new Date().toISOString().split('T')[0];
const todayDate = Date.parse(todayKey);

// Cache init
const cache = new CachemanFile({tmpDir: './cache'});
const cacheKey = todayKey;
const cacheTTL = 60 * 60 * 24;

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
        const diffTime = todayDate <= eventEnd && todayDate >= eventStart;

        if (! diffTime) {
            return;
        }

        const diffDays = Math.ceil((new DateDiff(eventEnd, todayDate)).days());

        if (diffDays > 31) {
            return;
        }

        absences.push(
            util.format(
                '>%s _(%s)_',
                event.summary,
                pluralize('day', diffDays, true)
            )
        );
    });

    // Exit if empty
    if (! absences.length) {
        console.log('No crowd');

        process.exit(1);
    }

    // Sync cache
    cache.get(cacheKey, (error, value) => {

        if (error) {
            console.log('Cacheman error');

            process.exit(1);
        }

        const diffAbsences = difference(absences, value);

        if (! diffAbsences.length) {
            return;
        }

        cache.set(cacheKey, absences, cacheTTL, () => {

            got(argv['slack-webhook'], {
                method: 'POST',
                body: JSON.stringify({
                    'text': '\n' + diffAbsences.sort().join('\n')
                })
            });

        });
    })

});
