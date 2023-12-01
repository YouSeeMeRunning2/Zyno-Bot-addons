const EventEmitter = require('events');
const Save = require('./save.js');
const { createBitfield, validatePermission, getAddonPermission } = require('../utils/functions.js');
const { commandListeners, eventListeners, addons, botClasses } = require('../utils/saves.js');
const { registerAddon, commandRegistrant } = require('./handlers/addonHandler.js');
const Bot = require('./structures/bot.js');
const CommandBuilder = require('./builders/commandBuilder.js');
const scopes = require('../bitfields/scopes.js');
const { getClientParser } = require('../utils/parser.js');
const HttpServerHandler = require('./server/handler.js');
const DiscordJS = require('discord.js');

const clientParser = getClientParser();

class Addon extends EventEmitter{
    constructor(options = {}){
        super();
        (async () => {
            Object.defineProperty(this, 'ready', {
                value: false,
                writable: false
            });
            if(typeof options !== 'object' || Array.isArray(options) || !options) throw new Error(`Addon is invalid, please follow the documentation to create an addon`);
            var keys = Object.keys(options);
            if(keys.indexOf('name') < 0) throw new Error(`No name was provided`);
            if(typeof options.description !== 'string') throw new Error(`A description is required for the addon and must be a string`);
            if(options.description.length === 0 || options.description.length > 100) throw new Error(`Description must be between 1-100 characters long`);
            if(!Array.isArray(options.bitfield) && typeof options.bitfield !== 'number') throw new Error(`A bitfield with the required permissions for the addon is required and must be an array or number`);
            if(typeof options.version !== 'string') throw new Error(`A version is required for the addon and must be a string`);
            if(options.version.length === 0 || options.version.length > 10) throw new Error(`Version must be between 1-10 characters long`);
            if(typeof options.author !== 'string') throw new Error(`An author is required for the addon and must be a string`);
            if(options.author.length === 0 || options.author.length > 50) throw new Error(`Author must be between 1-50 characters long`);

            if(typeof options.name !== 'string') throw new Error(`The addon name must be a string`);
            if(options.name.length === 0 || options.name.length > 50) throw new Error(`Name must be between 1-50 characters long`);
            Object.defineProperty(this, 'name', {
                value: options.name,
                writable: false
            });

            Object.defineProperties(this, {
                description: {
                    value: options.description,
                    writable: false
                },
                version: {
                    value: options.version,
                    writable: false
                },
                author: {
                    value: options.author,
                    writable: false
                }
            });
            if(Array.isArray(options.bitfield)){
                if(!!options.bitfield.filter(v => typeof v !== 'number').length) throw new Error(`The bitfield is incorrect, make sure to use the correct bitfield values`);
                Object.defineProperty(this, 'permissions', {
                    value: createBitfield(options.bitfield),
                    writable: false
                });
            } else if(typeof options.bitfield === 'number'){
                Object.defineProperty(this, 'permissions', {
                    value: options.bitfield,
                    writable: false
                });
            } else {
                throw new Error(`The bitfield must be an Array of scopes or a number`);
            }

            const addonInfo = addons.get(this.name);
            
            let nextAddonCallback = null;
            if(!addonInfo){
                try{
                    nextAddonCallback = await clientParser.emitAddon(this);
                } catch (err){
                    console.log(err);
                    return;
                }
            } else if(addonInfo.addon.author !== this.author || addonInfo.addon.version !== this.version){
                try{
                    nextAddonCallback = await clientParser.emitAddon(this);
                } catch (err){
                    console.log(err);
                    return;
                }
            }

            this.created = new Date();

            const registrant = await registerAddon(this);

            if(typeof nextAddonCallback === 'function') nextAddonCallback();

            if(registrant === true){
                Object.defineProperty(this, 'ready', {
                    value: true,
                    writable: false
                });
                if(clientParser.ready === false){
                    clientParser.once('ready', () => {
                        this.emit('ready');
                    });
                } else {
                    this.emit('ready');
                }
            } else if(registrant !== false) {
                console.log(`Error while registering addon '${this.name}':`, registrant.error);
                return;
            }
        })().catch(err => {
            throw new Error(err);
        });
    }
    createCommand(command){
        return new Promise((resolve, reject) => {
            if(!validatePermission(getAddonPermission(this.name), scopes.bitfield.COMMANDS)) return reject(`The addon doesn't have the permissions to create a command`);
            if(!(command instanceof CommandBuilder)) return reject(`Invalid command: Command is not instance of CommandBuilder class`);
            var commandJSON = command.toJSON();
            if(typeof commandJSON.name !== 'string') return reject('Invalid command: Command name must be a string');
            if(typeof commandJSON.description !== 'string') return reject('Invalid command: Command description must be a string');
            commandRegistrant.register(commandJSON, this.name).then(resolve).catch(reject);
        });
    }
    removeCommand(commandName){
        return new Promise((resolve, reject) => {
            if(!validatePermission(getAddonPermission(this.name), scopes.bitfield.COMMANDS)) return reject(`The addon doesn't have the permissions to create a command`);
            if(typeof commandName !== 'string') return reject(`Invalid command name: Command name must be a type of string`);
            commandRegistrant.removeCommand(commandName, this.name).then(resolve).catch(reject);
        });
    }
    createEventListener(){
        const filterEventListener = eventListeners.filter(e => e.addonName === this.name);
        if(filterEventListener.length > 0){
            return filterEventListener[0].listener;
        } else {
            const event = new EventEmitter();
            eventListeners.push({listener: event, addonName: this.name});
            return event;
        }
    }
    createCommandListener(){
        const filterCommandListener = commandListeners.filter(e => e.addonName === this.name);
        if(filterCommandListener.length > 0){
            return filterCommandListener[0].listener;
        } else {
            const event = new EventEmitter();
            commandListeners.push({listener: event, addonName: this.name});
            return event;
        }
    }
    getBot(){
        return new Promise((resolve, reject) => {
            let addonInfo = addons.get(this.name);
            if(!addonInfo) return reject('Addon hasn\'t been enabled by the owner of the bot');
            if(addonInfo.verified === false || addonInfo.allowed === false) return reject('Addon hasn\'t been enabled by the owner of the bot');
            new Promise((parse) => {
                if(clientParser.ready === false){
                    clientParser.once('ready', () => {
                        parse()
                    })
                } else {
                    parse();
                }
            }).then(() => {
                const filter = botClasses.filter(b => b.addonName === this.name);
                if(filter.length > 0){
                    resolve(filter[0].bot);
                } else {
                    const bot = new Bot(this);
                    botClasses.push({addonName: this.name, bot: bot});
                    resolve(bot);
                }
            });
        });
    }
    getHTTPServer(){
        return new Promise((resolve, reject) => {
            let addonInfo = addons.get(this.name);
            if(!addonInfo) return reject('Addon hasn\'t been enabled by the owner of the bot');
            if(addonInfo.verified === false || addonInfo.allowed === false) return reject('Addon hasn\'t been enabled by the owner of the bot');
            if(!validatePermission(getAddonPermission(this.name), scopes.bitfield.SERVERS)) return reject('The addon doesn\'t have permissions to make use of the HTTP server');
            new Promise((parse) => {
                if(clientParser.ready === false){
                    clientParser.once('ready', () => {
                        parse(clientParser.getClient());
                    })
                } else {
                    parse(clientParser.getClient());
                }
            }).then(client => {
                const port = client.config.port;
                if(typeof port === 'string' || typeof port === 'number'){
                    resolve(HttpServerHandler.startHTTPServer(parseInt(port)));
                } else {
                    return reject('The owner of the bot hasn\'t set a port for the HTTP server');
                }
            });
        });
    }
    getWSServer(){
        return new Promise((resolve, reject) => {
            let addonInfo = addons.get(this.name);
            if(!addonInfo) return reject('Addon hasn\'t been enabled by the owner of the bot');
            if(addonInfo.verified === false || addonInfo.allowed === false) return reject('Addon hasn\'t been enabled by the owner of the bot');
            if(!validatePermission(getAddonPermission(this.name), scopes.bitfield.SERVERS)) return reject('The addon doesn\'t have permissions to make use of the WebSocket server');
            new Promise((parse) => {
                if(clientParser.ready === false){
                    clientParser.once('ready', () => {
                        parse(clientParser.getClient());
                    })
                } else {
                    parse(clientParser.getClient());
                }
            }).then(client => {
                const port = client.config.port;
                if(typeof port === 'string' || typeof port === 'number'){
                    resolve(HttpServerHandler.startWSServer(parseInt(port)));
                } else {
                    return reject('The owner of the bot hasn\'t set a port for the HTTP server');
                }
            });
        });
    }
    getRawSaves(){
        return new Promise((resolve, reject) => {
            let addonInfo = addons.get(this.name);
            if(!addonInfo) return reject('Addon hasn\'t been enabled by the owner of the bot');
            if(addonInfo.verified === false || addonInfo.allowed === false) return reject('Addon hasn\'t been enabled by the owner of the bot');
            if(!validatePermission(getAddonPermission(this.name), scopes.bitfield.SAVES)) return reject('The addon doesn\'t have permissions to read the saves');
            new Promise((parse) => {
                if(clientParser.ready === false){
                    clientParser.once('ready', () => {
                        parse(clientParser.getClient());
                    })
                } else {
                    parse(clientParser.getClient());
                }
            }).then(client => {
                resolve({
                    tickets: new Save(client.tickets),
                    level: new Save(client.xp),
                    economy: new Save(client.economy),
                    afk: new Save(client.afk),
                    badwords: new Save(client.badwords),
                    giveaways: new Save(client.giveaways),
                    reactrole: new Save(client.reactrole),
                    suggestions: new Save(client.suggestions),
                    warns: new Save(client.warns)
                });
            });
        })
    }
    getCommandData(commandName){
        return new Promise((resolve, reject) => {
            let addonInfo = addons.get(this.name);
            if(!addonInfo) return reject('Addon hasn\'t been enabled by the owner of the bot');
            if(addonInfo.verified === false || addonInfo.allowed === false) return reject('Addon hasn\'t been enabled by the owner of the bot');
            if(!validatePermission(getAddonPermission(this.name), scopes.bitfield.COMMANDS)) return reject('The addon doesn\'t have permissions to get information about commands');
            if(typeof commandName !== 'string') return reject('A command name is required to provide');
            let client = clientParser.getClient();
            const botCommand = client.commands.get(commandName);
            const addonCommand = client.addons.get(commandName);
            if(!botCommand && !addonCommand) return resolve(undefined);
            else if(!botCommand) return resolve({...addonCommand})
            else {
                let commandData = {
                    name: botCommand.data.name,
                    description: botCommand.data.description,
                    options: botCommand.data.options,
                    category: botCommand.data.category.toLowerCase(),
                    nsfw: botCommand.data.nsfw || false,
                    dm_permission: false,
                    permissions: typeof botCommand.data.permissions === 'string' ? DiscordJS.PermissionFlagsBits[permissions].toString() : null,
                    overwrite: false
                };
                return resolve(commandData);
            }
        });
    }
    name = null;
    description = null;
    version = null;
    author = null;
    permissions = 0;
    ready = false;
    guilds = new Save();
    channels = new Save();
    commands = new Save();
}

module.exports = Addon;
