const BaseChannel = require('./base.js');
const { validatePermission, getAddonPermission, getResolvableDate } = require('../../../utils/functions.js');
const { getMessageContent } = require('../../../utils/messageFunctions.js');
const scopes = require('../../../bitfields/scopes.js');
const Save = require('../../save.js');
const GuildMemberManager = require('../../managers/guildMemberManager.js');

class ThreadChannel extends BaseChannel{
    constructor(data, addon, guild, structureHandler){
        super(data, addon);
        this.guild = guild;
        this.name = data.name;
        this.threadArchived = data.archived;
        this.archived = this.threadArchived ? new Date(data.archivedTimestamp) : null;
        this.archivedTimestamp = this.threadArchived ? data.archivedTimestamp : null;
        this.autoArchive = typeof data.autoArchiveDuration === 'number' ? data.autoArchiveDuration * 60 * 1000 : null;
        this.memberCount = data.memberCount;
        this.threadJoined = data.joined;
        this.threadJoinable = data.joinable;
        this.editable = data.editable;
        this.locked = data.locked;
        this.sendable = data.sendable;
        this.viewable = data.viewable;
        this.manageable = data.manageable;
        this.slowMode = typeof data.rateLimitPerUser === 'number' ? data.rateLimitPerUser * 1000 : 0;
        this.parentId = data.parentId || null;
        this.parent = typeof this.parentId === 'string' ? this.guild.channels.get(this.parentId) : undefined;
        if(typeof this.parent !== 'undefined'){
            this.parent.threads.set(this.id, this);
        }
        this.members = new Save();
        const addonGuildMemberManager = GuildMemberManager.get(addon.name) || new Save();
        const guildMemberManager = addonGuildMemberManager.get(this.guild.id) || new Save();
        const guildMembers = Array.from(data.members.cache.values());
        for(var i = 0; i < guildMembers.length; i++){
            var _guildMember = guildMembers[i];
            var guildMember = guildMemberManager.get(_guildMember.id);
            if(typeof guildMember !== 'undefined') this.members.set(guildMember.id, guildMember);
        }
        this.owner = guildMemberManager.get(data.ownerId) || null;
        if(guild) guild.channels.set(this.id, this);
        if(validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)){
            addon.channels.set(this.id, this);
        }
        this.isArchived = () => {
            return this.threadArchived;
        };
        this.delete = function(){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
            	data.delete().then(() => resolve()).catch(reject);
            });
        };
        this.setName = function(name, reason){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(typeof name !== 'string') return reject('The name of the channel must be a type of string');
                if(typeof reason !== 'string') reason = undefined;
                data.setName(name, reason).then(ch => {
                    resolve(structureHandler.createStructure('ThreadChannel', [ch, addon, guild]));
                }).catch(reject);
            });
        }
        this.deleteMessages = function(amount){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.MESSAGES)) return reject(`Missing messages scope in bitfield`);
                if(typeof amount !== 'number') return reject('Amount argument must be a type of number');
                if(amount < 1) amount = 1;
                else if(amount > 100) amount = 100;
                data.bulkDelete(amount).then(() => resolve()).catch(reject);
            });
        }
        this.join = () => {
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(data.joined === true) resolve(this);
                else {
                    data.join().then(ch => {
                        resolve(structureHandler.createStructure('ThreadChannel', [ch, addon, guild]));
                    }).catch(reject);
                }
            });
        }
        this.leave = () => {
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(data.joined === false) resolve(this);
                else {
                    data.leave().then(ch => {
                        resolve(structureHandler.createStructure('ThreadChannel', [ch, addon, guild]));
                    }).catch(reject);
                }
            });
        }
        this.pin = (reason) =>{
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(typeof this.parent !== 'undefined'){
                    if(this.parent.type !== 'GuildForum') return reject(`The parent channel must be a forum channel in order to pin the channel`);
                }
                if(typeof reason !== 'string') reason = undefined;
                data.pin(reason).then(ch => {
                    resolve(structureHandler.createStructure('ThreadChannel', [ch, addon, guild]));
                }).catch(reject);
            })
        }
        this.unpin = function(reason){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(typeof this.parent !== 'undefined'){
                    if(this.parent.type !== 'GuildForum') return reject(`The parent channel must be a forum channel in order to unpin the channel`);
                }
                if(typeof reason !== 'string') reason = undefined;
                data.unpin(reason).then(ch => {
                    resolve(structureHandler.createStructure('ThreadChannel', [ch, addon, guild]));
                }).catch(reject);
            })
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
        this.setArchived = (archived, reason) => {
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.MESSAGES)) return reject(`Missing messages scope in bitfield`);
                if(typeof archived === 'string'){
                    reason = archived;
                }
                if(typeof archived !== 'boolean'){
                    archived = !this.archived;
                }
                if(typeof reason !== 'string'){
                    reason = undefined;
                }
                data.setArchived(archived, reason).then(ch => {
                    resolve(structureHandler.createStructure('ThreadChannel', [ch, addon, guild]));
                }).catch(reject);
            });
        }
        this.setAutoArchive = function(dateResolvable, reason){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(typeof dateResolvable !== 'string' && typeof dateResolvable !== 'number' && !(dateResolvable instanceof Date)) return reject(`Date is not resolvable, must be a string or a number`);
                if(typeof reason !== 'string') reason = undefined;
                const currentTimestamp = new Date().getTime();
                var resolveDate = dateResolvable instanceof Date ? dateResolvable.getTime() - currentTimestamp : getResolvableDate(dateResolvable);
                resolveDate = Math.round(resolveDate / (60*1000));
                data.setAutoArchiveDuration(resolveDate, reason).then(ch => resolve(structureHandler.createStructure('ThreadChannel', [ch, addon, guild]))).catch(reject);
            });
        }
        this.setLocked = (locked, reason) => {
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.MESSAGES)) return reject(`Missing messages scope in bitfield`);
                if(typeof locked === 'string'){
                    reason = locked;
                }
                if(typeof locked !== 'boolean'){
                    locked = !this.locked;
                }
                if(typeof reason !== 'string'){
                    reason = undefined;
                }
                data.setLocked(locked, reason).then(ch => {
                    resolve(structureHandler.createStructure('ThreadChannel', [ch, addon, guild]));
                }).catch(reject);
            });
        }
        this.setSlowMode = function(dateResolvable, reason){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(typeof dateResolvable !== 'string' && typeof dateResolvable !== 'number' && !(dateResolvable instanceof Date)) return reject(`Date is not resolvable, must be a string or a number`);
                if(typeof reason !== 'string') reason = undefined;
                const currentTimestamp = new Date().getTime();
                var resolveDate = dateResolvable instanceof Date ? dateResolvable.getTime() - currentTimestamp : getResolvableDate(dateResolvable);
                data.setRateLimitPerUser(resolveDate, reason).then(ch => resolve(structureHandler.createStructure('ThreadChannel', [ch, addon, guild]))).catch(reject);
            });
        }
        this.edit = function(options){
            return new Promise((resolve, reject) => {
            	if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(typeof options !== 'object') return reject('Object argument must be a type of object');
                let slowMode = undefined;
                let autoArchiveThreads = undefined;
                if(typeof options.slowMode === 'number' || typeof options.slowMode === 'string' || options.slowMode instanceof Date){
                    const currentTimestamp = new Date().getTime();
                    slowMode = options.slowMode instanceof Date ? options.slowMode.getTime() - currentTimestamp : getResolvableDate(options.slowMode);
                }
                if(typeof options.autoArchiveThreads === 'number' || typeof options.autoArchiveThreads === 'string' || options.autoArchiveThreads instanceof Date){
                    const currentTimestamp = new Date().getTime();
                    autoArchiveThreads = options.autoArchiveThreads instanceof Date ? options.autoArchiveThreads.getTime() - currentTimestamp : getResolvableDate(options.autoArchiveThreads);
                    autoArchiveThreads = Math.round(autoArchiveThreads / (60*1000));
                }
                data.edit({
                    name: typeof options.name === 'string' ? options.name : undefined,
                    reason: typeof options.reason === 'string' ? options.reason : undefined,
                    rateLimitPerUser: slowMode,
                    autoArchiveDuration: autoArchiveThreads,
                    archived: typeof options.archived === 'boolean' ? options.archived : undefined,
                    locked: typeof options.locked === 'boolean' ? options.locked : undefined
                }).then(ch => {
                    resolve(structureHandler.createStructure('ThreadChannel', [ch, addon, guild]));
                }).catch(reject);
        	});
        }
    }
}

module.exports = ThreadChannel;
