class ResponseInfo{
    constructor(data){
        this.setStatusCode = function(statusCode){
            if(typeof statusCode !== 'number') throw new Error('Status code must be a type of number');
            data.statusCode = statusCode;
        }
        this.setHeaders = function(headers){
            if(typeof headers !== 'object') throw new Error('Headers must be a type of object');
            for(var key in headers){
                data.setHeader(key, headers[key]);
            }
        }
        this.send = function(response){
            if(typeof response !== 'string' && !(response instanceof Buffer) && response !== undefined) throw new Error('Response must be a type of string or instance of Buffer');
            data.end(response);
        }
        this.end = this.send;
        this.write = function(chunk){
            if(typeof chunk !== 'string' && !(chunk instanceof Buffer) && response !== undefined) throw new Error('Response must be a type of string or instance of Buffer');
            data.write(chunk);
        }
        this.setStatus = (statusCode, headers) => {
            if(typeof statusCode === 'object'){
                headers = statusCode;
                statusCode = 200;
            } else if(typeof statusCode !== 'number'){
                throw new Error('Status code must be a type of number');
            }
            if(typeof statusCode === 'number' && typeof headers !== 'object'){
                this.setStatusCode(statusCode);
            } else {
                data.writeHead(statusCode, headers);
            }
        }
    }
}

module.exports = ResponseInfo;
