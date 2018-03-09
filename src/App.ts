import * as http from 'http';
import Water, { Method } from 'water';

const water = new Water({
    token: process.env.DISCORD_TOKEN as string,
});

const app = http.createServer((req, res) => {
    if (!req.method) {
        res.statusCode = 400;

        return res.end('No method given.');
    }

    if (!req.url) {
        res.statusCode = 400;

        return res.end('No url.');
    }

    if (!['delete', 'get', 'patch', 'post', 'put'].includes(req.method.toLowerCase())) {
        res.statusCode = 405;

        return res.end('Method not allowed.');
    }

    let bucket = req.url;

    const parts = req.url.split('/');

    if (parts.length > 3) {
        const start = parts.slice(0, 3).join('/');
        const end = parts.slice(3).join('/').replace(/\d/g, '{}');

        bucket = `${start}/${end}`;
    }

    let body = '';

    req.setEncoding('utf8');

    req.on('data', (chunk: Buffer) => {
        body += chunk;
    });

    req.on('end', () => {
        const requestBody = body.length > 0 ? body : null;

        water.request(
            req.method as Method,
            bucket,
            req.url as string,
            requestBody,
            true,
        ).then(([response, data]) => {
            if (response.statusCode) {
                res.statusCode = response.statusCode;
            }

            const headers = [
                'content-type',
                'retry-after',
                'set-cookie',
                'x-ratelimit-global',
                'x-ratelimit-limit',
                'x-ratelimit-remaining',
                'x-ratelimit-reset',
                'via',
                'cf-ray',
            ];

            for (let header of headers) {
                const value = response.headers[header];

                if (value) {
                    res.setHeader(header, value);
                }
            }

            res.removeHeader('x-powered-by');

            res.end(data);
        }).catch(err => {
            res.statusCode = 500;

            res.end(err.toString());
        });
    });
});

export default app;
