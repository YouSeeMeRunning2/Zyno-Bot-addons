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
                let getEvents = [...this.get.eventNames()];
                let placeholderEvents = getEvents.filter(e => e.indexOf("{*}") >= 0).filter(e => {
                    let placeholderRegEx = new RegExp(e.split("{*}").join("(.+)"));
                    return placeholderRegEx.test((req.url || ''));
                });
                if(placeholderEvents.length > 0){
                    for(let i = 0; i < placeholderEvents.length; i++){
                        let placeholders = [];
                        let eventName = placeholderEvents[i];
                        let eventRegEx = new RegExp(eventName.split("{*}").join("(\\w+)"), "i");
                        let regExRes = eventRegEx.exec((req.url || ''));
                        placeholders.push(...regExRes.slice(1, regExRes.length));
                        this.get.emit(eventName, new RequestInfo(req, null, placeholders), new ResponseInfo(res));
                    }
                }
                if(getEvents.indexOf((req.url || '')) >= 0){
                    this.get.emit((req.url || '').split('?')[0], new RequestInfo(req, null, []), new ResponseInfo(res));
                }
            } else if((req.method || '').toLowerCase() === 'post'){
                let body = [];
                req.on('data', chunk => {
                    body.push(chunk.toString());
                });
                req.on('end', () => {
                    let postEvents = [...this.post.eventNames()];
                    let placeholderPostEvents = postEvents.filter(e => e.indexOf("{*}") >= 0).filter(e => {
                        let placeholderRegEx = new RegExp(e.split("{*}").join("(.+)"));
                        return placeholderRegEx.test((req.url || ''));
                    });
                    if(placeholderPostEvents.length > 0){
                        for(let i = 0; i < placeholderPostEvents.length; i++){
                            let placeholders = [];
                            let eventName = placeholderPostEvents[i];
                            let eventRegEx = new RegExp(eventName.split("{*}").join("(\\w+)"), "i");
                            let regExRes = eventRegEx.exec((req.url || ''));
                            placeholders.push(...regExRes.slice(1, regExRes.length));
                            this.post.emit(eventName, new RequestInfo(req, body.join(''), placeholders), new ResponseInfo(res));
                        }
                    }
                    if(postEvents.indexOf((req.url || '')) >= 0){
                        this.post.emit((req.url || '').split('?')[0], new RequestInfo(req, body.join(''), []), new ResponseInfo(res));
                    }
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
