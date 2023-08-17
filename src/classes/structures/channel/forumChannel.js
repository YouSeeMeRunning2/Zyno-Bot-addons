const GuildChannel = require('./guildChannel.js');
const CategoryChannel = require('./categoryChannel.js');
const { validatePermission, getAddonPermission, getResolvableDate } = require('../../../utils/functions.js');
const scopes = require('../../../bitfields/scopes.js');
const Save = require("../../save.js");

const validAutoArchiveDates = [60, 1440, 10080, 4320];

class ForumChannel extends GuildChannel{
    constructor(data, addon, guild, structureHandler){
        super(data, addon, guild);
        this.topic = data.topic;
        this.autoArchiveThreads = typeof data.defaultAutoArchiveDuration === 'number' ? data.defaultAutoArchiveDuration * 60 * 1000 : 0;
        this.threads = new Save();
        const guildThreads = Array.from(data.threads.cache.values());
        for(var i = 0; i < guildThreads.length; i++){
            var guildThread = guildThreads[i];
            structureHandler.createStructure('ThreadChannel', [guildThread, addon, guild]);
        }
        if(guild) guild.channels.set(this.id, this);
        if(validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)){
            addon.channels.set(this.id, this);
        }
        this.setTopic = function(topic, reason){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
            	if(typeof topic !== 'string') return reject('Topic argument must be a type of string');
                if(typeof reason !== 'string') reason = undefined;
                data.setTopic(topic, reason).then(ch => {
                    resolve(structureHandler.createStructure('ForumChannel', [ch, addon, guild]));
                }).catch(reject);
            });
        }
        this.update = function(){
            return new Promise((resolve, reject) => {
                data.fetch().then(ch => {
                    resolve(structureHandler.createStructure('ForumChannel', [ch, addon, guild]));
                }).catch(reject);
            });
        }
        this.edit = function(options){
            return new Promise((resolve, reject) => {
            	if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(typeof options !== 'object') return reject('Object argument must be a type of object');
                let slowMode = undefined;
                let autoArchiveThreads = undefined;
                const currentTimestamp = new Date().getTime();
                if(typeof options.slowMode === 'number' || typeof options.slowMode === 'string' || options.slowMode instanceof Date){
                    slowMode = options.slowMode instanceof Date ? options.slowMode.getTime() - currentTimestamp : getResolvableDate(options.slowMode);
                    slowMode = Math.round(slowMode / 1000);
                }
                if(typeof options.autoArchiveThreads === 'number' || typeof options.autoArchiveThreads === 'string' || options.autoArchiveThreads instanceof Date){
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
                    parent: typeof options.parent === 'string' || options.parent instanceof CategoryChannel ? (typeof options.parent === 'string' ? options.parent : options.parent.id) : undefined,
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
                    resolve(structureHandler.createStructure('ForumChannel', [ch, addon, guild]));
                }).catch(reject);
        	});
        }
        this.createThread = (options) => {
            return new Promise((resolve, reject) => {
            	if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(typeof options !== 'object') options = {};
                if(typeof options.name !== 'string') return reject('The name of the thread must be a type of string');
                if(typeof options.reason !== 'string') options.reason = undefined;
                const currentTimestamp = new Date().getTime();
                var archiveDate = undefined;
                var slowMode = undefined;
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
                data.threads.create({
                    name: options.name,
                    rateLimitPerUser: slowMode,
                    autoArchiveDuration: archiveDate,
                    reason: options.reason,
                }).then(thread => {
                    resolve(structureHandler.createStructure('ThreadChannel', [thread, addon, this.guild]));
                }).catch(reject);
            });
        }
    }
}

module.exports = ForumChannel;
