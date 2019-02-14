#!/usr/bin/env node


// Required packages
const got = require('got');
const ical = require('node-ical');
const argv = require('mri')(process.argv.slice(2));

// Arguments check
if (! argv['personio-ics'] || ! argv['slack-webhook']) {
    console.error('Endpoints needed');

    process.exit(1);
}

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

    // Post to slack
    got(argv['slack-webhook'], {
        method: 'POST',
        body: JSON.stringify({
            'text': 'Today absent:\n`' + absences.join('`\n`') + '`'
        })
    });
});
