const Compression = require('compression');
const Express = require('express');
import { Response } from 'express';
import Water, { Method } from 'water';
import ChunkBodyMiddleware from './Middleware/ChunkBodyMiddleware';

const water = new Water({
    token: process.env.DISCORD_TOKEN as string,
});

const app = Express();
app.set('port', process.env.PORT || 15001);
app.use(ChunkBodyMiddleware);
app.use(Compression());

app.all('*', async (req: any, res: Response) => {
    if (!['delete', 'get', 'patch', 'post', 'put'].includes(req.method.toLowerCase())) {
        return res.status(405).send(`Method not allowed. ${req.method.toLowerCase()}`);
    }

    let bucket = req.originalUrl;

    const parts = req.originalUrl.split('/');

    if (parts.length > 3) {
        const start = parts.slice(0, 3).join('/');
        const end = parts.slice(3).join('/').replace(/\d/g, '{}');

        bucket = `${start}/${end}`;
    }

    water.request(
        req.method as Method,
        bucket,
        req.originalUrl,
        req.rawBody,
        true,
    ).then(([resp, data]) => {
        if (resp.statusCode) {
            res.status(resp.statusCode);
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
            const value = resp.headers[header];

            if (value) {
                res.setHeader(header, value);
            }
        }

        res.removeHeader('x-powered-by');

        res.send(data);

        return res;
    }).catch(err => {
        return res.status(500).send(err.toString());
    });
});

export default app;
