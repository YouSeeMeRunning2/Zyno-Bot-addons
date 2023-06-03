const { HttpServer, getHTTPServer } = require('./httpServer.js');
const WebSocketHandler = require('./websocketHandler.js');

let server = null;
let wsServer = null;
function startHTTPServer(port){
    if(server instanceof HttpServer) return server;
    server = new HttpServer(port);
    return server;
}

function startWSServer(port){
    if(wsServer instanceof WebSocketHandler){
        return wsServer;
    } else {
        if(!(server instanceof HttpServer)){
            server = new HttpServer(port);
        }
        let httpServer = getHTTPServer();
        wsServer = new WebSocketHandler(httpServer);
        return wsServer;
    }
}

module.exports = { startHTTPServer, startWSServer };
