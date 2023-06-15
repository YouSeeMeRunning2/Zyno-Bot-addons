const EventEmitter = require('events');
const { Client } = require('discord.js');
const { commandListeners, addons } = require('../../utils/saves.js');
const Command = require('../command.js');
const { handleEvents, createStructures } = require('./eventHandler.js');
const { validatePermission } = require('../../utils/functions.js');
const bitfields = require('../../bitfields/scopes.js');
var client = null;

class ClientParser extends EventEmitter{
    constructor(){
        super();
        this.once('ready', async () => {
            this.client_ready = true;
            if(this.interactionHandler !== null){
                this.ready = true;
                await handleEvents(client, this.event);
            }
        });
    }
    parse(_client){
        if(!(_client instanceof Client)) throw new Error(`Invalid client: Client parameter is not instance of Client class`);
        if(client instanceof Client) throw new Error(`Invalid client: Another client has already been passed, possible malicious code`);
        client = _client;
    }
    getClient(){
        return client;
    }
    parseInteractionHandler(interactionHandler){
        return new Promise(async resolve => {
            this.interactionHandler = interactionHandler;
            if(client instanceof Client){
                if(this.client_ready === true){
                    this.ready = true;
                    await handleEvents(client, this.event);
                }
            }
            resolve();
        });
    }
    commandAvailability(data, interaction){
        return new Promise(async (resolve, reject) => {
            let commandName;
            if(interaction === true){
                commandName = data.commandName;
            } else {
                commandName = (data.content || '').split(' ')[0].slice(client.config.prefix.length);
            }
            for(var i = 0; i < commandListeners.length; i++){
                var commandListener = commandListeners[i];
                try{
                    await new Promise((accept, stop) => {
                        const addonData = addons.get(commandListener.addonName);
                        if(!addonData) return accept();
                        if(!validatePermission(addonData.permissions, bitfields.bitfield.COMMANDS)) return accept();
                        const command = new Command(data, interaction, {name: commandName, description: null}, addonData);
                        if(commandListener.listener.listenerCount(commandName) > 0){
                            commandListener.listener.emit(commandName, command, accept, stop);
                        } else {
                            accept();
                        }
                    });
                } catch {
                    reject();
                    break;
                }
            }
            resolve();
        });
    }
    updateStructures(){
        return new Promise(async resolve => {
            let _addons = client.addons.toReadableArray();
            await createStructures(client, _addons);
            resolve();
        });
    }
    client_ready = false;
    ready = false;
    InteractionHandler = null;
    event = new EventEmitter();
}

module.exports = ClientParser;
