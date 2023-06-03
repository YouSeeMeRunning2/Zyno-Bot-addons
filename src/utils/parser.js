const ClientParser = require('../classes/handlers/clientParser.js');

const parser = new ClientParser();

function getClient(){
    return parser.getClient();
}

function registerClient(){
    return parser.parse;
}

function getClientParser(){
    return parser;
}

module.exports = {
    getClient,
    registerClient,
    getClientParser
};
