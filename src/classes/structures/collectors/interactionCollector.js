const EventEmitter = require("events");
const { generateId } = require("../../../utils/functions.js");
const { interactionCollectors } = require('../../../utils/saves.js');
const { ValueSaver } = require('valuesaver');

class InteractionCollector extends EventEmitter{
    constructor(data, message, addon){
        super();
        let addonInteractionCollectors = interactionCollectors.get(addon.name) ?? new ValueSaver();
        let collectors = addonInteractionCollectors.get(message.id) ?? [];
        let collectorId = generateId(10);
        while(collectors.filter(c => c.id === collectorId).length > 0){
            collectorId = generateId(10);
        }

        this.id = collectorId;

        if(typeof data === 'object' && !Array.isArray(data) && data !== null){
            if(typeof data.filter === 'function'){
                this.filter = data.filter;
            }
            if(typeof data.max === 'number'){
                this.max = data.max >= 1 ? data.max : 1;
            }
            if(typeof data.time === 'number'){
                let endTime = (new Date()).getTime() + data.time;
                this.time = endTime;
                setTimeout((collectorId, addon) => {
                    let addonCollectors = interactionCollectors.get(addon.name) ?? new ValueSaver();
                    let collectors = addonCollectors.get(message.id) ?? [];
                    let collectorInfo = collectors.filter(c => c.id === collectorId)[0];
                    if(collectorInfo){
                        this.emit('end');
                        let collectorIndex = collectors.indexOf(collectorInfo);
                        collectors.splice(collectorIndex, 1);
                        addonCollectors.set(message.id, collectors);
                        interactionCollectors.set(addon.name, addonCollectors);
                    }
                }, data.time, collectorId, addon);
            }
        }

        this.id = collectorId;
        
        collectors.push(this);
        addonInteractionCollectors.set(message.id, collectors);
        interactionCollectors.set(addon.name, addonInteractionCollectors);

        this.stop = () => {
            let addonCollectors = interactionCollectors.get(addon.name) ?? new ValueSaver();
            let collectors = addonCollectors.get(message.id) ?? [];
            let collectorInfo = collectors.filter(c => c.id === this.id)[0];
            if(collectorInfo){
                this.emit('end');
                let collectorIndex = collectors.indexOf(collectorInfo);
                collectors.splice(collectorIndex, 1);
                addonCollectors.set(message.id, collectors);
                interactionCollectors.set(addon.name, addonCollectors);
            } 
        }
    }
    count = 0;
    max = Infinity;
    id = null;
    filter = () => true;
    time = Infinity;
}

module.exports = InteractionCollector;
