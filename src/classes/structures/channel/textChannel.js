const GuildChannel = require('./guildChannel.js');
const CategoryChannel = require('./categoryChannel.js');
const { validatePermission, getAddonPermission, getResolvableDate } = require('../../../utils/functions.js');
const { getMessageContent } = require('../../../utils/messageFunctions.js');
const scopes = require('../../../bitfields/scopes.js');
const Save = require('../../save.js');
const MessageManager = require('../../managers/messageManager.js');
const channelManager = require('../../managers/channelManager.js');

const validAutoArchiveDates = [60, 1440, 10080, 4320];

class TextChannel extends GuildChannel{
    constructor(data, addon, guild, structureHandler, cache){
        super(data, addon, guild);
        if(cache){
            const addonChannelManager = channelManager.get(addon.name) || new Save();
            const guildChannelManager = addonChannelManager.get(guild.id) || new Save();
            guildChannelManager.set(data.id, this);
            addonChannelManager.set(guild.id, guildChannelManager);
            channelManager.set(addon.name, addonChannelManager);
        }
        this.addon = addon;
        this.topic = data.topic;
        this.autoArchiveThreads = typeof data.defaultAutoArchiveDuration === 'number' ? data.defaultAutoArchiveDuration * 60 * 1000 : 0;
        this.threads = new Save();
        const guildThreads = Array.from(data.threads.cache.values());
        for(var i = 0; i < guildThreads.length; i++){
            var guildThread = guildThreads[i];
            structureHandler.createStructure('ThreadChannel', [guildThread, addon, guild]);
        }
        if(validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)){
            addon.channels.set(this.id, this);
        }
        this.setTopic = function(topic, reason){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
            	if(typeof topic !== 'string') return reject('Topic argument must be a type of string');
                if(typeof reason !== 'string') reason = undefined;
                data.setTopic(topic, reason).then(ch => {
                    resolve(structureHandler.createStructure('TextChannel', [ch, addon, guild]));
                }).catch(reject);
            });
        }
        this.send = function(...content){
            return new Promise((resolve, reject) => {
                if(content.length === 0) return reject(`At least one argument must be given`);
                let _content = getMessageContent(content);
                data.send(_content).then(msg => {
                    resolve(structureHandler.createStructure('Message', [msg, addon]));
                }).catch(reject);
            });
        }
        this.update = function(){
            return new Promise((resolve, reject) => {
                data.fetch().then(ch => {
                    resolve(structureHandler.createStructure('ThreadChannel', [ch, addon, guild]));
                }).catch(reject);
            });
        }
        this.getMessage = function(messageId){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.MESSAGES)) return reject(`Missing messages scope in bitfield`);
                if(typeof messageId !== 'string') return reject('Message id argument must be a type of string');
                data.messages.fetch(messageId).then(msg => resolve(structureHandler.createStructure('Message', [msg, addon]))).catch(reject);
            });
        }
        this.deleteMessages = function(amount, filter){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.MESSAGES)) return reject(`Missing messages scope in bitfield`);
                if(typeof amount !== 'number') return reject('Amount argument must be a type of number');
                if(amount < 1) amount = 1;
                else if(amount > 100) amount = 100;
                let messageDelete = amount;
                if(typeof filter === 'function'){
                    messageDelete = Array.from(this.messages.filter(m => filter(m)).values()).map(m => m.id).slice(0, amount);
                }
                data.bulkDelete(messageDelete).then(() => resolve()).catch(reject);
            });
        }
        this.edit = (options) => {
            return new Promise((resolve, reject) => {
            	if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(typeof options !== 'object') return reject('Object argument must be a type of object');
                let slowMode = undefined;
                let autoArchiveThreads = undefined;
                if(typeof options.slowMode === 'number' || typeof options.slowMode === 'string' || options.slowMode instanceof Date){
                    const currentTimestamp = new Date().getTime();
                    slowMode = options.slowMode instanceof Date ? options.slowMode.getTime() - currentTimestamp : getResolvableDate(options.slowMode);
                    slowMode = Math.round(slowMode / 1000);
                }
                if(typeof options.autoArchiveThreads === 'number' || typeof options.autoArchiveThreads === 'string' || options.autoArchiveThreads instanceof Date){
                    const currentTimestamp = new Date().getTime();
                    autoArchiveThreads = options.autoArchiveThreads instanceof Date ? options.autoArchiveThreads.getTime() - currentTimestamp : getResolvableDate(options.autoArchiveThreads);
                    autoArchiveThreads = Math.round(autoArchiveThreads / (60*1000));
                    if(validAutoArchiveDates.indexOf(autoArchiveThreads) < 0){
                        autoArchiveThreads = this.autoArchiveThreads;
                    }
                }
                data.edit({
                    name: typeof options.name === 'string' ? options.name : undefined,
                    position: typeof options.position === 'number' ? options.position: undefined,
                    topic: typeof options.topic === 'string' ? options.topic : undefined,
                    nsfw: typeof options.nsfw === 'boolean' ? options.nsfw: undefined,
                    parent: typeof options.parent === 'string' || options.parent === null || options.parent instanceof CategoryChannel ? (options.parent instanceof CategoryChannel ? options.parent.id : options.parent) : undefined,
                    reason: typeof options.reason === 'string' ? options.reason : undefined,
                    rateLimitPerUser: slowMode,
                    defaultAutoArchiveDuration: autoArchiveThreads,
                    permissionOverwrites: Array.isArray(options.permissions) ? options.permissions.reduce((arr, i) => {
                        if(typeof i !== 'object' || Array.isArray(i) || i === null) return arr;
                        if(typeof i.id !== 'string') return arr;
                        if(!Array.isArray(i['allow']) && !Array.isArray(i['deny'])) return arr;
                       	if(typeof i['type'] === 'string'){
                            switch(i['type'].toLowerCase()){
                                case 'user':
                                    i['type'] = 1;
                                    break;
                                case 'member':
                                    i['type'] = 1;
                                    break;
                                case 'role':
                                    i['type'] = 0;
                                    break;
                                default:
                                    delete i['type'];
                                    break;
                            }
                        }
                        arr.push(i);
                        return arr;
                    }, []) : undefined
                }).then(ch => {
                    resolve(structureHandler.createStructure('TextChannel', [ch, addon, guild]));
                }).catch(reject);
        	});
        }
        this.createThread = (options) => {
            return new Promise((resolve, reject) => {
            	if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(typeof options !== 'object') return reject('Object argument must be a type of object');
                if(typeof options.name !== 'string' && !(options.message instanceof Message)) return reject('The name of the thread must be a type of string');
                if(typeof options.name !== 'string'){
                    if(options.message.content.length > 0) options.name = options.message.content.substring(0, 100);
                    else options.name = options.message.author.username;
                }
                if(typeof options.reason !== 'string') options.reason = undefined;
                const currentTimestamp = new Date().getTime();
                var archiveDate = undefined;
                var slowMode = undefined;
                var type = undefined;
                if(typeof options.autoArchiveThread === 'string' || options.autoArchiveThread === 'number' || options.autoArchiveThread instanceof Date){
                    archiveDate = options.autoArchiveThread instanceof Date ? options.autoArchiveThread.getTime() - currentTimestamp : getResolvableDate(options.autoArchiveThread);
                    archiveDate = Math.round(archiveDate / (60*1000));
                    if(validAutoArchiveDates.indexOf(archiveDate) < 0){
                        archiveDate = this.autoArchiveThreads;
                    }
                }
                if(typeof options.slowMode === 'string' || typeof options.slowMode === 'number' || options.slowMode instanceof Date){
                    slowMode = options.slowMode instanceof Date ? options.slowMode.getTime() - currentTimestamp : getResolvableDate(options.slowMode);
                    slowMode = Math.round(slowMode / 1000);
                }
                const validThreadTypes = {
                    'announcement': 5,
                    'public': 11,
                    'private': 12
                };
                if(typeof options.type === 'string'){
                    const threadKeys = Object.keys(validThreadTypes);
                    const threadValues = Object.values(validThreadTypes);
                    const threadIndex = threadKeys.indexOf(options.type.toLowerCase());
                    if(threadIndex >= 0){
                        type = threadValues[threadIndex];
                    }
                }
                data.threads.create({
                    name: options.name,
                    type: type,
                    rateLimitPerUser: slowMode,
                    autoArchiveDuration: archiveDate,
                    reason: options.reason,
                    startMessage: options.message instanceof Message || typeof options.message === 'string' ? (options.message instanceof Message ? options.message.id : options.message) : undefined
                }).then(thread => {
                    resolve(structureHandler.createStructure('ThreadChannel', [thread, addon, guild]));
                }).catch(reject);
            });
        }
    }
    get messages(){
        const addonMessageManager = MessageManager.get(this.addon.name) || new Save();
        const guildMessageManager = addonMessageManager.get(this.guildId) || new Save();
        const channelMessageManager = guildMessageManager.get(this.id) || new Save();
        return channelMessageManager;
    }
}

module.exports = TextChannel;
