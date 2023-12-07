const EventEmitter = require('events');
const { Client } = require('discord.js');
const { commandListeners, addons } = require('../../utils/saves.js');
const Command = require('../command.js');
const { handleEvents, createStructures } = require('./eventHandler.js');
const { validatePermission, passClientParser } = require('../../utils/functions.js');
const bitfields = require('../../bitfields/scopes.js');
const structureHandler = require('./structureHandler.js');
var client = null;

let receivedAddons = [];

class ClientParser extends EventEmitter{
    constructor(){
        super();
        passClientParser(this);
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
    parseAddonRegistar(addonRegistar){
        this.addonRegistar = addonRegistar;
        this.emit('addonRegistarReady', this.addonRegistar);
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
                        const command = new Command(data, interaction, {name: commandName, description: null}, addonData, structureHandler);
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
    parseAddons(addons, force = false){
        return new Promise(async (resolve, reject) => {
            if(!Array.isArray(addons)) return reject(`Invalid addon array`);
            const addonsArr = this.addons.toReadableArray();
            for(let i = 0; i < addons.length; i++){
                await new Promise(_resolve => {
                    let addonName = addons[i];
                    let resolveableName = require.resolve(addonName);
                    if(addonsArr.filter(a => a.value.resolveablePath === resolveableName).length > 0){
                        _resolve(true);
                    } else {
                        this.once('addonEmit',async (addon, callback) => {
                            clearTimeout(this.waitableTimeout[resolveableName]);
                            Object.defineProperty(addon, 'resolveablePath', {
                                value: resolveableName,
                                writable: false,
                                configurable: false
                            });
                            this.removeAllListeners('addonEmit');
                            receivedAddons.push(resolveableName);
                            callback(addon.name, true, function(){
                                if(force) _resolve(true);
                            });
                            if(!force) _resolve(true);
                        });
                        try{
                            require(resolveableName);
                        } catch (err){
                            console.log(`Error while starting addon:`, err);
                        }
                        setTimeout(() => {
                            if(receivedAddons.indexOf(resolveableName) >= 0) return;
                            delete require.cache[resolveableName];
                            this.removeAllListeners('addonEmit');
                            _resolve(false);
                        }, 3e3);
                    }
                });
            }
            resolve();
        });
    }
    emitAddon(addon){
        return new Promise((resolve, reject) => {
            this.emit('addonEmit', addon, function(name, bool, callback){
                if(name === addon.name && bool) resolve(callback);
                else{
                    callback();
                    reject(`Due to security reasons, this addon was blocked`);
                }
            });
        });
    }
    client_ready = false;
    ready = false;
    InteractionHandler = null;
    event = new EventEmitter();
    waitableTimeout = {}
    addons = addons;
    addonRegistar = undefined;
}

module.exports = ClientParser;
