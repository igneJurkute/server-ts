import http, { IncomingMessage, ServerResponse } from 'node:http';
import { file } from './file.js';

type Server = { 
    init: () => void;
    // httpServer: typeof http.createServer;
    httpServer: any;
}

const server = {} as Server;

server.httpServer = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const socket = req.socket as any;
    const encryption = socket.encryption as any;
    const ssl = encryption !== undefined ? 's' : '';

    const baseURL = `http${ssl}://${req.headers.host}`;
    const parsedURL = new URL(req.url ?? '', baseURL);
    const httpMethod = req.method ? req.method.toLowerCase() : 'get';
    const trimmedPath = parsedURL.pathname
        .replace(/^\/+|\/+$/g, '')
        .replace(/\/\/+/g, '/');
    const textFileExtensions = ['css', 'js', 'svg', 'webmanifest'];
    const binaryFileExtensions = ['png', 'jpg', 'jpeg', 'webp', 'ico', 'eot', 'ttf', 'woff', 'woff2', 'otf'];
    const fileExtension = trimmedPath.slice(trimmedPath.lastIndexOf('.') + 1);
    
    const isTextFile = textFileExtensions.includes(fileExtension);
    const isBinaryFile = binaryFileExtensions.includes(fileExtension);
    const isAPI = trimmedPath.startsWith('api/');
    const isPage = !isTextFile && !isBinaryFile && !isAPI;

    // type Mimes = { [key: string]: string };
    type Mimes = Record<string, string>;
 
    const MIMES: Mimes = {
        html: 'text/html',
        css: 'text/css',
        js: 'text/javascript',
        json: 'application/json',
        txt: 'text/plain',
        svg: 'image/svg+xml',
        xml: 'application/xml',
        ico: 'image/vnd.microsoft.icon',
        jpeg: 'image/jpeg',
        jpg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
        woff2: 'font/woff2',
        woff: 'font/woff',
        ttf: 'font/ttf',
        webmanifest: 'application/manifest+json',
    };

    let responseContent: string | Buffer = 'ERROR: neturiu tai ko tu nori...';


    if (isTextFile) {
        const [err, msg] = await file.readPublic(trimmedPath);
        res.writeHead(err ? 404 : 200, {
            'Content-Type': MIMES[fileExtension],
            'cache-control': `max-age=60`,
        });
         if (err) {
             responseContent = msg;
         } else {
             responseContent = msg;
         }
    }

    if (isBinaryFile) {
        const [err, msg] = await file.readPublicBinary(trimmedPath);
        res.writeHead(err ? 404 : 200, {
            'Content-Type': MIMES[fileExtension],
            'cache-control': `max-age=60`,
        });
         if (err) {
             responseContent = msg;
         } else {
             responseContent = msg;
         }
    }

    if (isAPI) {
        responseContent = 'API DUOMENYS';
    }

    if (isPage) {
        let fileResponse = await file.read('../pages', trimmedPath + '.html');
        let [err, msg] = fileResponse;

        if (err) {
            fileResponse = await file.read('../pages', '404.html');
            err = fileResponse[0];
            msg = fileResponse[1];
        }

        res.writeHead(err ? 404 : 200, {
            'Content-Type': MIMES.html,
        });

        responseContent = msg as string;

    }


    return res.end(responseContent);
});

server.init = () => {
    server.httpServer.listen(4411, () => {
        console.log('Serveris sukasi ant http://localhost:4411');
    });
};

export { server };