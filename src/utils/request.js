const https = require('https');
const http = require('http');
const dns = require('dns');

const { URL } = require('url');
const { promisify } = require('util');

const { getClient } = require('./functions.js');

const types = {http: http, https: https};
const lookup = promisify(dns.lookup);

function validateURL(url){
    try{
        return new URL(url);
    } catch {
        return false;
    }
}

let client;

function request(url, method, body, responseType, headers){
    return new Promise(async (resolve, reject) => {
        client = getClient();
        if(typeof url !== 'string') return reject(`The url must be a type of string`);
        if(typeof method !== 'string') return reject(`The method must be a type of string`);

        let methodTypes = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'PATCH'];
        if(methodTypes.indexOf(method.toUpperCase()) < 0) return reject(`The method must be an option of ${methodTypes.join(', ')}`);

        headers = (typeof headers !== 'object' || Array.isArray(headers) || headers === null) ? {} : headers;
        responseType = typeof responseType === 'string' ? responseType : 'json';

        const parsed = validateURL(url);
        if(!parsed) return reject(`The url is not a valid url`);

        let family = 4;
        try{
            let dnsRes = await lookup(parsed.hostname);
            family = dnsRes.family;
        } catch {}

        const reqType = types[parsed.protocol.split(':')[0].toLowerCase()];

        const errors = [];

        const req = reqType.request({
            host: parsed.hostname,
            path: parsed.pathname + parsed.search,
            family: family,
            headers: {
                ...headers,
                'User-Agent': 'Zyno-Bot/v'+client.config.license.version
            }
        }, res => {
            let chunks = [];
            res.on('data', (chunk) => {
                chunks.push(chunk);
            });

            res.on('end', () => {
                let response;
                switch(responseType.toLowerCase()){
                    case 'arraybuffer':
                        let arrBuffer = Buffer.concat(chunks);
                        response = arrBuffer;
                        break;
                    case 'json':
                        let data = chunks.join(''), transformed = {};
                        try{
                            transformed = JSON.parse(data);
                        } catch {}
                        response = transformed;
                        break;
                    case 'text':
                        response = chunks.join('');
                        break;
                    case 'plain':
                        response = chunks.join('');
                        break;
                    case 'buffer':
                        let buffer = Buffer.from(chunks.join(''));
                        response = buffer;
                        break;
                }
                let resHeaders = {};
                for(var key in res.headers){
                    resHeaders[key.toLowerCase()] = res.headers[key];
                }
                resolve({
                    data: response,
                    statusCode: res.statusCode,
                    headers: resHeaders
                });
            });

            res.on('error', err => {
                let errorMessage = err.message.toString();
                errors.push(errorMessage);
                reject(errorMessage);
            });
        });

        req.on('error', err => {
            let errorMessage = err.message.toString();
            errors.push(errorMessage);
            reject(errorMessage);
        });

        if(typeof body !== 'undefined') req.write(body);

        req.end();
    });
}

module.exports = request;
