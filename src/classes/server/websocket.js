const EventEmitter = require('events');

class WebSocket extends EventEmitter{
    constructor(socket, handler){
        super();
        let id = Math.round(new Date().getTime() / 1000).toString() + Math.round(Math.random() * 9999).toString();
        while(handler.sockets.filter(ws => ws.id === id).length > 0){
            id = Math.round(new Date().getTime() / 1000).toString() + Math.round(Math.random() * 9999).toString();
        }
        this.id = id;
        this.send = function(data){
            socket.send(data);
        };
        this.close = () => {
            socket.close();
            this.emit('close');
            this.removeAllListeners();
        };
        socket.on('message', msg => {
            this.emit('message', Buffer.from(msg).toString());
        });
        socket.on('close', () => {
            this.emit('close');
            this.removeAllListeners();
        });
        socket.on('error', err => {
            var errorMessage = err.message.toString();
            handler.errorMessages.push(errorMessage);
        })
    }
}

module.exports = WebSocket;
