const { URLSearchParams } = require('url');

class RequestInfo{
    constructor(data, body, placeholders){
        const params = new URLSearchParams((data.url || '').split('?').slice(1).join('?'));
        this.url = (data.url || '').split('?')[0];
        this.method = (data.method || '').toUpperCase();
        this.headers = {};
        for(var key in data.headers){
            this.headers[key.toLowerCase()] = data.headers[key];
        }
        this.query = params;
        this.body = body;
        this.ip = data.socket.remoteAddress;
        this.placeholders = placeholders || [];
    }
}

module.exports = RequestInfo;
