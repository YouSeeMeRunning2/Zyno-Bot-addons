const { URLSearchParams } = require('url');

class RequestInfo{
    constructor(data, body){
        const params = new URLSearchParams((data.url || '').split('?')[0]);
        this.url = (data.url || '').split('?')[0];
        this.method = (data.method || '').toUpperCase();
        this.headers = {};
        for(var key in data.headers){
            this.headers[key.toLowerCase()] = data.headers[key];
        }
        this.query = params;
        this.body = body;
        this.ip = data.socket.remoteAddress;
    }
}

module.exports = RequestInfo;
