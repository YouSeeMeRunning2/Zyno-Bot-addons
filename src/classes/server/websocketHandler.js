const EventEmitter = require('events');
const http = require('http');
const WebSocket = require('./websocket.js');
const RequestInfo = require('./requestInfo.js');
const { WebSocketServer } = require('ws');
const { ValueSaver } = require('valuesaver');

const websockets = new ValueSaver();

class WebSocketHandler extends EventEmitter{
    constructor(httpServer = http.Server.prototype){
        super();
        const wsServer = new WebSocketServer({
            server: httpServer
        });
        wsServer.on('connection', (_ws, req) => {
            const reqInfo = new RequestInfo(req, null);
            const ws = new WebSocket(_ws, this);
            websockets.set(ws.id, _ws);
            this.sockets.push(ws);
            this.emit('connection', ws, reqInfo);
        });
    }
    sockets = [];
    errorMessages = [];
}

module.exports = WebSocketHandler;
