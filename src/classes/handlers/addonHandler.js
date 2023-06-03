const { ValueSaver } = require('valuesaver');
const CommandHandler = require('./commandHandler.js');
const Command = require('../command.js');
const { getPermissionsString, generateId } = require('../../utils/functions.js');
const { getClientParser } = require('../../utils/parser.js');
const { createStructures } = require('./eventHandler.js');
const { addons, addonCreate } = require('../../utils/saves.js');
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
    return true;
}

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
            this.registerCommands();
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
            clearTimeout(timeout);
        }
        this.timeout = setTimeout(async () => {
            this.timeout = undefined;
            var commands = this.queue.map(q => q.command);
            commands.push(...this.addonCommands.toReadableArray().map(a => a.value));
            for(var i = 0; i < commands.length; i++){
                delete commands[i]['overwrite'];
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
            } catch {
                for(var i = 0; i < this.queue.length; i++){
                    var commandQueue = this.queue[i];
                    commandQueue.functions.reject("The command couldn't be registered due to an error received from the Discord API");
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
            var getExecuteableCommand = new Command(commandData, interaction, cmd.command, addon);
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
        var baseName = `${addon.name}@${addon.version}-${addon.author}`;
        if(typeof addon.name === 'string'){
            if(addons.get(addon.name)){
                resolve({error: 'Invalid addon: Another addon with the same name already exists'});
            } else {
                var getRegistrant = registeredAddons.get(baseName);
                if(validateRegistrant(addon, getRegistrant)){
                    addons.set(addon.name, {
                        baseName: baseName,
                        addon: addon,
                        permissions: addon.permissions,
                        verified: true,
                        allowed: true
                    });
                    addonCreate.emit(addon.name, true);
                    resolve(true);
                } else {
                    addons.set(addon.name, {
                        baseName: baseName,
                        addon: addon,
                        permissions: addon.permissions,
                        verified: false,
                        allowed: true
                    });
                    new Promise(async resolve => {
                        var permissionsString = getPermissionsString(addon.permissions);
                        if(clientParser.ready === true){
                            const addonRegistrant = await clientParser.getClient().registerAddon(addon, permissionsString);
                            resolve(addonRegistrant);
                        } else {
                            clientParser.once('ready', async () => {
                                const addonRegistrant = await clientParser.getClient().registerAddon(addon, permissionsString);
                                resolve(addonRegistrant);
                            });
                        }
                    }).then(async val => {
                        var getAddon = addons.get(addon.name);
                        if(val === true){
                            getAddon['verified'] = true;
                            addons.set(addon.name, getAddon);
                            registeredAddons.set(baseName, {
                                name: addon.name,
                                bitfield: addon.permissions
                            });
                            addonCreate.emit(addon.name, true);
                            try{
                                let addonValuesaver = registeredAddons.toReadableArray();
                                await fs.writeFile(path.join(__dirname, `../../addons.json`), JSON.stringify(addonValuesaver), {encoding: 'utf-8'});
                            } catch {}
                            await createStructures(clientParser.getClient(), addons.toReadableArray());
                            resolve(true);
                        } else {
                            getAddon['allowed'] = false;
                            addons.set(addon.name, getAddon);
                            addonCreate.emit(addon.name, false);
                            resolve(false);
                        }
                    });
                }
            }
        } else {
            resolve({error: 'Invalid addon: The addon has no name or connection'});
        }
    });
}

module.exports = { registerAddon, commandRegistrant, InteractionHandler };
