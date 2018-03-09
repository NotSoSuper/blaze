import { Response } from 'express';

export default function chunkBody(req: any, _: Response, next: Function) {
    req.rawBody = '';
    req.setEncoding('utf8');

    req.on('data', (chunk: Buffer) => {
        req.rawBody += chunk;
    });

    req.on('end', () => {
        next();
    });
}
