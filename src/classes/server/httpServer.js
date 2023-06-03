const http = require('http');
const EventEmitter = require('events');
const RequestInfo = require('./requestInfo.js');
const ResponseInfo = require('./responseInfo.js');

let HTTPserver;

class HttpServer{
    constructor(port){
        HTTPserver = http.createServer({
            requestTimeout: 1e4
        }, (req, res) => {
            res.setHeader('X-Powered-By', 'Zyno Bot');
            if((req.method || '').toLowerCase() === 'get'){
                this.get.emit((req.url || '').split('?')[0], new RequestInfo(req, null), new ResponseInfo(res));
            } else if((req.method || '').toLowerCase() === 'post'){
                let body = [];
                req.on('data', chunk => {
                    body.push(chunk.toString());
                });
                req.on('end', () => {
                    this.post.emit((req.url || '').split('?')[0], new RequestInfo(req, body.join('')), new ResponseInfo(res));
                })
            } else {
                res.writeHead(405, {
                    'Content-Type': 'text/plain'
                });
                res.end('Method not allowed');
                return;
            }

            req.on('error', err => {
                var errorMessage = err.message.toString();
                this.errorMessages.push(errorMessage);
            });
            res.on('error', err => {
                var errorMessage = err.message.toString();
                this.errorMessages.push(errorMessage);
            });
        });

        HTTPserver.listen(port);
    }
    post = new EventEmitter();
    get = new EventEmitter();
    errorMessages = [];
}

function getHTTPServer(){
    return HTTPserver;
}

module.exports = {HttpServer, getHTTPServer};
