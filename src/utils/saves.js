const { ValueSaver } = require('valuesaver');
const EventEmitter = require('events');

const addonCreate = new EventEmitter();
const commandListeners = [];
const eventListeners = [];
const botClasses = [];
const addons = new ValueSaver();

module.exports = {
    addons,
    commandListeners,
    eventListeners,
    addonCreate,
    botClasses
};
