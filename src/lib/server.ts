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
        responseContent = `<!DOCTYPE html>
            <html lang="en">

    <head>
     <meta charset="UTF-8">
     <meta http-equiv="X-UA-Compatible" content="IE=edge">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Astronautas</title>
     <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">
     <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png">
     <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png">
     <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png">
     <link rel="manifest" href="/favicon/site.webmanifest">
     <link rel="mask-icon" href="/favicon/safari-pinned-tab.svg" color="#5bbad5">
     <meta name="msapplication-TileColor" content="#da532c">
     <meta name="theme-color" content="#ffffff">
     <link rel="stylesheet" href="/css/font-awesome.min.css">
     <link rel="stylesheet" href="/css/button.css">
     <link rel="stylesheet" href="/css/header.css">
     <link rel="stylesheet" href="/css/socials.css">
     <link rel="stylesheet" href="/css/main.css">

 </head>

            <body>
     <header class="container">
         <img class="logo" src="/img/logo.webp" alt="Logo">
         <nav class="main-nav">
             <a class="link" href="#">About</a>
             <a class="link" href="#">Portfolio</a>
             <a class="link" href="#">Job</a>
             <a class="link" href="#">Contact</a>
         </nav>
     </header>
    }

   <main class="container">
         <div class="left-column">
             <h1 class="main-title"><span>404</span>Lost in space</h1>
             <p class="description">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas non numquam eum reiciendis. Deserunt dolorum quasi dicta ratione assumenda sit nemo laudantium quis excepturi.</p>
             <div class="button-group">
                 <a class="button" href="#">Go home</a>
                 <a class="button" href="#">Back</a>
             </div>
         </div>
         <img class="right-column" src="/img/astronautas.webp" alt="Astronautas su telefonu rankoje">
     </main>
 
     <footer class="container">
         <div class="socials">
             <a class="social-link fa fa-facebook-official" href="#" target="_blank" title="Facebook"></a>
             <a class="social-link fa fa-twitter" href="#" target="_blank" title="Twitter"></a>
             <a class="social-link fa fa-instagram" href="#" target="_blank" title="Instagram"></a>
             <a class="social-link fa fa-linkedin-square" href="#" target="_blank" title="Linkedin"></a>
         </div>
         <p class="copyright">&copy; 2023 - All rights reserved</p>
     </footer>

     <script src="/js/main.js" type="module" defer></script>
 </body>

  </html>`;

    }


    return res.end(responseContent);
});

server.init = () => {
    server.httpServer.listen(4411, () => {
        console.log('Serveris sukasi ant http://localhost:4411');
    });
};

export { server };