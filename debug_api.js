import fs from 'fs';
import http from 'http';

const fetchUrl = (url) => {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
        }).on('error', reject);
    });
};

const run = async () => {
    try {
        console.log('Fetching places...');
        const places = await fetchUrl('http://localhost:3000/api/lugares');

        console.log('Fetching events...');
        const events = await fetchUrl('http://localhost:3000/api/eventos');

        const output = {
            places: {
                status: places.statusCode,
                headers: places.headers,
                body: places.body.substring(0, 2000) // First 2000 chars
            },
            events: {
                status: events.statusCode,
                headers: events.headers,
                body: events.body.substring(0, 2000) // First 2000 chars
            }
        };

        fs.writeFileSync('api_debug_output.json', JSON.stringify(output, null, 2));
        console.log('Debug output written to api_debug_output.json');
    } catch (error) {
        console.error('Error:', error);
        fs.writeFileSync('api_debug_output.json', JSON.stringify({ error: error.message }, null, 2));
    }
};

run();
