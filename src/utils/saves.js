const { ValueSaver } = require('valuesaver');
const EventEmitter = require('events');

const addonCreate = new EventEmitter();
const commandListeners = [];
const eventListeners = [];
const botClasses = [];
const addons = new ValueSaver();
const emojiCollectors = new ValueSaver();
const interactionCollectors = new ValueSaver();
const builtStructures = {};
let structureStatus = {
    building: false
};
const structureListener = new EventEmitter();

module.exports = {
    addons,
    commandListeners,
    eventListeners,
    addonCreate,
    botClasses,
    emojiCollectors,
    interactionCollectors,
    builtStructures,
    structureStatus,
    structureListener
};
