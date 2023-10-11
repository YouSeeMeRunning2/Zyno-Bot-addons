const { ValueSaver } = require('valuesaver');
const CommandHandler = require('./commandHandler.js');
const Command = require('../command.js');
const CommandBuilder = require('../builders/commandBuilder.js');
const { generateId } = require('../../utils/functions.js');
const { getClientParser } = require('../../utils/parser.js');
const { createStructures } = require('./eventHandler.js');
const structureHandler = require('./structureHandler.js');
const { addons, addonCreate, commandListeners, eventListeners } = require('../../utils/saves.js');
const EventEmitter = require('events');
const fs = require('fs/promises');
const { existsSync } = require('fs');
const path = require('path');
const registeredAddons = new ValueSaver();

var clientParser = getClientParser();

function validateRegistrant(addon, registrant){
    if(!registrant) return false;
    if(addon.name !== registrant.name) return false;
    if(addon.permissions !== registrant.bitfield) return false;
    if(addon.resolveablePath !== registrant.resolveablePath) return false;
    return true;
}

class AddonRegistar{
    constructor(){}
    disableAddon(addonName, force = true, restart = false){
        return new Promise(async (resolve, reject) => {
            await new Promise(resolve => {
                if(clientParser.ready === false){
                    clientParser.once('ready', () => {
                        resolve();
                    });
                } else {
                    resolve();
                }
            });
            const addon = addons.get(addonName);
            if(!addon) return reject(`The addon was not found in the registar`);
            if(addon.verified === false || addon.allowed === false) return reject(`The addon has already been disabled`);
            const baseName = `${addon.addon.name}@${addon.addon.version}-${addon.addon.author}`;
            const registeredAddon = registeredAddons.get(baseName);
            if(registeredAddon){
                registeredAddons.delete(baseName);
            }

            addons.set(addonName, {
                ...addon,
                verified: false,
                allowed: false,
                restarting: restart,
                stopping: true,
                starting: false
            });

            try{
                let addonValuesaver = registeredAddons.toReadableArray();
                await fs.writeFile(path.join(__dirname, `../../addons.json`), JSON.stringify(addonValuesaver), {encoding: 'utf-8'});
            } catch {}
            const registeredCommands = commandRegistrant.addonCommands.filter(c => c.addon === addonName);
            const keys = registeredCommands.toReadableArray().map(c => c.key);
            for(let i = 0; i < keys.length; i++){
                let key = keys[i];
                commandRegistrant.addonCommands.delete(key);
            }
            clientParser.getClient().addons.writeValueSaver(commandRegistrant.addonCommands.toReadableArray());

            delete require.cache[require.resolve(addon.resolveablePath)];

            addon.addon.channels.clear();
            addon.addon.guilds.clear();
            addon.addon.commands.clear();
            addon.addon.removeAllListeners();
            const _commandListeners = commandListeners.filter(c => c.addonName === addonName);
            for(let i = 0; i < _commandListeners.length; i++){
                _commandListeners[i].listener.removeAllListeners();
                commandListeners.splice(commandListeners.indexOf(_commandListeners[i]), 1);
            }
            const _eventListeners = eventListeners.filter(e => e.addonName === addonName);
            for(let i = 0; i < _eventListeners.length; i++){
                _eventListeners[i].listener.removeAllListeners();
                eventListeners.splice(eventListeners.indexOf(_eventListeners[i]), 1);
            }

            const commandHandlers = registeredCommands.toReadableArray().map(a => a.value.passedClass);
            for(let i = 0; i < commandHandlers.length; i++){
                commandHandlers[i].removeAllListeners();
            }

            if(force === true){
                let commands = [...registeredCommands.toReadableArray().map(a => new CommandBuilder(a.value.command).toJSON())];
                for(var i = 0; i < commands.length; i++){
                    delete commands[i]['overwrite'];
                }

                await clientParser.getClient().updateCommands(commands);
            }

            addons.set(addonName, {
                ...addon,
                verified: false,
                allowed: false,
                restarting: restart,
                stopping: false,
                starting: false
            });
            
            resolve();
        });
    }
    enableAddon(addonName){
        return new Promise(async (resolve, reject) => {
            const addon = addons.get(addonName);
            if(!addon) return reject(`The addon was not found in the registar`);
            const baseName = `${addon.addon.name}@${addon.addon.version}-${addon.addon.author}`;
            registeredAddons.set(baseName, {
                name: addon.addon.name,
                bitfield: addon.permissions,
                resolveablePath: addon.resolveablePath
            });
            addons.set(addonName, {
                ...addon,
                verified: true,
                allowed: true,
                restarting: false,
                stopping: false,
                starting: true
            });
            try{
                let addonValuesaver = registeredAddons.toReadableArray();
                await fs.writeFile(path.join(__dirname, `../../addons.json`), JSON.stringify(addonValuesaver), {encoding: 'utf-8'});
            } catch {}
            try{
                require(require.resolve(addon.resolveablePath));
            } catch (err){
                return reject(`There was an error while registering the addon '${addon}': ${err}`);
            }
            resolve();
        });
    }
    restartAddon(addonName){
        return new Promise((resolve, reject) => {
            this.disableAddon(addonName, true, true).then(() => {
                this.enableAddon(addonName).then(resolve).catch(reject);
            }).catch(reject);
        });
    }
}

const addonRegistar = new AddonRegistar();

clientParser.parseAddonRegistar(addonRegistar);

class CommandRegister extends EventEmitter{
    constructor(){
        super();
        if(clientParser.ready === false){
            clientParser.once('ready', () => {
                this.registeredCommands.writeValueSaver(clientParser.getClient().commands.toReadableArray());
                this.emit('ready');
                this.ready = true;
            });
        } else {
            this.registeredCommands.writeValueSaver(clientParser.getClient().commands.toReadableArray());
            this.emit('ready');
            this.ready = true;
        }
        this.once('ready', () => {
            for(var i = 0; i < this.queue.length; i++){
                var commandQueue = this.queue[i].command;
                if((this.registeredCommands.get(commandQueue.name) || this.addonCommands.get(commandQueue.name)) && commandQueue.overwrite === false){
                    this.queue[i].functions.reject('There has already been another command registered with this name');
                    return;
                } else if(this.registeredCommands.get(commandQueue.name) || this.addonCommands.get(commandQueue.name)){
                    this.addonCommands.delete(commandQueue.name);
                }
            }
            if(this.queue.length > 0) this.registerCommands();
        });
    }
    register(commandJSON, addonName){
        return new Promise(async (resolve, reject) => {
            var addon = addons.get(addonName);
            if(!addon){
                var abortTooLong = setTimeout(function(){
                    reject('The owner of the bot took too long to response');
                }, 3*6e4);
                addonCreate.once(addonName, (allowed) => {
                    clearTimeout(abortTooLong);
                    if(allowed === true){
                        this.register(commandJSON, addonName).then(resolve).catch(reject);
                    } else {    
                        reject(`The addon was disabled by the bot's owner`);
                        return;
                    }
                });
            } else if(addon.verified === false){
                if(addon.allowed === false){
                    reject(`The addon was disabled by the bot's owner`);
                    return;
                }
                var abortTooLong = setTimeout(function(){
                    reject('The owner of the bot took too long to response');
                }, 3*6e4);
                addonCreate.once(addonName, (allowed) => {
                    clearTimeout(abortTooLong);
                    if(allowed === true){
                        this.register(commandJSON, addonName).then(resolve).catch(reject);
                    } else {    
                        reject(`The addon was disabled by the bot's owner`);
                        return;
                    }
                });
            } else if(this.ready === false){
                if(!!this.queue.filter(c => c.command.name === commandJSON.name).length && commandJSON.overwrite === false){
                    reject('There has already been another command registered with this name');
                    return;
                } else {
                    if(!!this.queue.filter(c => c.command.name === commandJSON.name).length){
                        var getCommand = this.queue.filter(c => c.command.name === commandJSON.name)[0];
                        var getIndex = this.queue.indexOf(getCommand);
                        this.queue.splice(getIndex, 1);
                    }
                    this.queue.push({
                        command: commandJSON,
                        addon: addonName,
                        functions: {
                            resolve: resolve,
                            reject: reject
                        }
                    });
                }
            } else {
                if((this.registeredCommands.get(commandJSON.name) || this.addonCommands.get(commandJSON.name)) && commandJSON.overwrite === false){
                    reject('There has already been another command registered with this name');
                    return;
                } else {
                    if(this.registeredCommands.get(commandJSON.name) || this.addonCommands.get(commandJSON.name)){
                        this.addonCommands.delete(commandJSON.name);
                    }
                    if(!!this.queue.filter(c => c.command.name === commandJSON.name).length && commandJSON.overwrite === false){
                        reject('There has already been another command registered with this name');
                        return;
                    } else {
                        if(!!this.queue.filter(c => c.command.name === commandJSON.name).length){
                            var getCommand = this.queue.filter(c => c.command.name === commandJSON.name)[0];
                            var getIndex = this.queue.indexOf(getCommand);
                            this.queue.splice(getIndex, 1);
                        }
                        this.queue.push({
                            command: commandJSON,
                            addon: addonName,
                            functions: {
                                resolve: resolve,
                                reject: reject
                            }
                        });
                        this.registerCommands();
                    }
                }
            }
        });
    }
    registerCommands(){
        if(this.timeout !== undefined){
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(async () => {
            this.timeout = undefined;
            var commands = [...this.queue.map(q => {
                return {...q.command}
            })];
            commands.push(...this.addonCommands.toReadableArray().map(a => new CommandBuilder(a.value.command).toJSON()));
            for(var i = 0; i < commands.length; i++){
                delete commands[i]['overwrite'];
                delete commands[i]['category'];
            }
            try{
                await clientParser.getClient().updateCommands(commands);
                var commandIds = this.addonCommands.toReadableArray().map(c => c.value.command.id);
                for(var i = 0; i < this.queue.length; i++){
                    var commandQueue = this.queue[i];
                    var cmdId = generateId();
                    while(commandIds.indexOf(cmdId) >= 0){
                        cmdId = generateId();
                    }
                    commandQueue.command['id'] = cmdId;
                    var cmd = new CommandHandler(commandQueue.command);
                    commandQueue.functions.resolve(cmd);
                    delete commandQueue.functions;
                    commandQueue.command['passedClass'] = cmd;
                    this.addonCommands.set(commandQueue.command.name, commandQueue);
                    addons.get(commandQueue.addon).addon.commands.set(commandQueue.command.name, cmd);
                }
                clientParser.getClient().addons.writeValueSaver(this.addonCommands.toReadableArray());
            } catch(err) {
                for(var i = 0; i < this.queue.length; i++){
                    var commandQueue = this.queue[i];
                    commandQueue.functions.reject(err);
                }
            }
            this.queue = [];
        }, 2000);
    }
    timeout = undefined;
    ready = false;
    queue = [];
    registeredCommands = new ValueSaver();
    addonCommands = new ValueSaver();
}

var commandRegistrant = new CommandRegister();

class InteractionHandler extends EventEmitter{
    constructor(commandRegistrant){
        super();
        this.on('execute', (commandData, interaction) => {
            var cmdName = interaction === true ? commandData.commandName : (commandData.content || '').split(' ')[0].slice(clientParser.getClient().config.prefix.length);
            var cmd = commandRegistrant.addonCommands.get(cmdName.toLowerCase());
            if(!cmd) return;
            if(!cmd.command.passedClass) return;
            var addon = addons.get(cmd.addon);
            if(!addon) return;
            if(typeof cmd.command.default_member_permissions === 'string'){
                if(!commandData.member.permissions.has(cmd.command.default_member_permissions)) return;
            }
            var getExecuteableCommand = new Command(commandData, interaction, cmd.command, addon, structureHandler);
            cmd.command.passedClass.emit('execute', getExecuteableCommand);
        });
    }
}

var interactionHandler = new InteractionHandler(commandRegistrant);
clientParser.parseInteractionHandler(interactionHandler);

function registerAddon(addon){
    return new Promise(async (resolve) => {
        if(registeredAddons.size === 0){
            if(existsSync(path.join(__dirname, `../../addons.json`))){
                try{
                    let addonContent = await fs.readFile(path.join(__dirname, `../../addons.json`), {encoding: 'utf-8'});
                    try{
                        addonContent = JSON.parse(addonContent);
                    } catch {}
                    registeredAddons.writeValueSaver(addonContent);
                } catch {}
            }
        }
        const baseName = `${addon.name}@${addon.version}-${addon.author}`;
        if(typeof addon.name === 'string'){
            if(!addons.get(addon.name)){
                var getRegistrant = registeredAddons.get(baseName);
                if(validateRegistrant(addon, getRegistrant)){
                    addons.set(addon.name, {
                        baseName: baseName,
                        addon: addon,
                        permissions: addon.permissions,
                        verified: true,
                        allowed: true,
                        resolveablePath: addon.resolveablePath,
                        restarting: false,
                        stopping: false,
                        starting: false
                    });
                    addonCreate.emit(addon.name, true);
                    if(clientParser.ready === true){
                        await createStructures(clientParser.getClient(), addons.toReadableArray());
                        resolve(true);
                    } else {
                        clientParser.once('ready', async () => {
                            await createStructures(clientParser.getClient(), addons.toReadableArray());
                            resolve(true);
                        });
                    }
                } else {
                    addons.set(addon.name, {
                        baseName: baseName,
                        addon: addon,
                        permissions: addon.permissions,
                        verified: true,
                        allowed: true,
                        resolveablePath: addon.resolveablePath,
                        restarting: false,
                        stopping: false,
                        starting: false
                    });
                    addonRegistar.disableAddon(addon.name, false, false).then(() => {
                        resolve(false);
                    }).catch(err => {
                        resolve({error: err});
                    });
                }
            } else {
                if(typeof addon.resolveablePath === 'string') throw new Error(`Another addon with the name '${addon.name}' has already been registered`);
                const addonInfo = addons.get(addon.name);
                addons.set(addon.name, {
                    baseName: addonInfo.baseName,
                    addon: addon,
                    permissions: addon.permissions,
                    verified: true,
                    allowed: true,
                    resolveablePath: addon.resolveablePath,
                    restarting: false,
                    stopping: false,
                    starting: false
                });
                await createStructures(clientParser.getClient(), addons.toReadableArray());
                addonCreate.emit(addon.name, true);
                resolve(true);
            }
        } else {
            resolve({error: 'Invalid addon: The addon has no name or connection'});
        }
    });
}

module.exports = { registerAddon, commandRegistrant, InteractionHandler };
