const GuildChannel = require('./guildChannel.js');
const CategoryChannel = require('./categoryChannel.js');
const { validatePermission, getAddonPermission, getResolvableDate, getVideoQualityMode, getRegion } = require('../../../utils/functions.js');
const { getMessageContent } = require('../../../utils/messageFunctions.js');
const scopes = require('../../../bitfields/scopes.js');
const Save = require('../../save.js');
const MemberManager = require('../../managers/memberManager.js');
const MessageManager = require('../../managers/messageManager.js');

class StageChannel extends GuildChannel{
    constructor(data, addon, guild, structureHandler){
        super(data, addon, guild);
        this.addon = addon;
        this.joinable = data.joinable;
        this.full = data.full;
        this.rtcRegion = data.rtcRegion;
        this.bitrate = data.bitrate;
        this.userLimit = data.userLimit;
        this.videoQuality = data.videoQualityMode === 2 ? 'Full' : 'Auto';
        this.members = new Save();
        const joinedMembers = Array.from(data.members.values());
        const addonMemberManager = MemberManager.get(addon.name) || new Save();
        for(var i = 0; i < joinedMembers.length; i++){
            var joinedMember = joinedMembers[i];
            var cachedMemberGuilds = addonMemberManager.get(joinedMember.id) || new Save();
            var cachedMember = cachedMemberGuilds.get(guild.id);
            if(!cachedMember) continue;
            this.members.set(cachedMember.id, cachedMember);
        }
        if(guild) guild.channels.set(this.id, this);
        if(validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)){
            addon.channels.set(this.id, this);
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
        this.update = function(){
            return new Promise((resolve, reject) => {
                data.fetch().then(ch => {
                    resolve(structureHandler.createStructure('StageChannel', [ch, addon, guild]));
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
        this.edit = function(options){
            return new Promise((resolve, reject) => {
            	if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(typeof options !== 'object') return reject('Object argument must be a type of object');
                let slowMode = undefined;
                if(typeof options.slowMode === 'number' || typeof options.slowMode === 'string' || options.slowMode instanceof Date){
                    const currentTimestamp = new Date().getTime();
                    slowMode = options.slowMode instanceof Date ? options.slowMode.getTime() - currentTimestamp : getResolvableDate(options.slowMode);
                    slowMode = Math.round(slowMode / 1000);
                }
                data.edit({
                    name: typeof options.name === 'string' ? options.name : undefined,
                    position: typeof options.position === 'number' ? options.position: undefined,
                    nsfw: typeof options.nsfw === 'boolean' ? options.nsfw: undefined,
                    parent: typeof options.parent === 'string' || options.parent instanceof CategoryChannel ? (typeof options.parent === 'string' ? options.parent : options.parent.id) : undefined,
                    reason: typeof options.reason === 'string' ? options.reason : undefined,
                    bitrate: typeof options.bitrate === 'number' ? options.bitrate : undefined,
                    userLimit: typeof options.userLimit === 'number' ? (options.userLimit < 0 ? 0 : (options.userLimit > 10000 ? 10000 : options.userLimit)) : undefined,
                    rateLimitPerUser: slowMode,
                    videoQualityMode: typeof options.videoQuality === 'string' || typeof options.videoQuality === 'number' ? getVideoQualityMode(options.videoQuality) : undefined,
                    rtcRegion: typeof options.rtcRegion === 'string' || options.rtcRegion === null ? (typeof options.rtcRegion === 'string' ? getRegion(options.rtcRegion) : options.rtcRegion) : undefined,
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
                    resolve(structureHandler.createStructure('StageChannel', [ch, addon, guild]));
                }).catch(reject);
        	});
        }
        this.setRtcRegion = function(region, reason){
            return new Promise((resolve, reject) => {
            	if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(typeof region !== 'string' && region !== null) return reject('Region must be a type of string or null');
                if(typeof reason !== 'string') reason = undefined;
                region = getRegion(region);
                data.setRTCRegion(region, reason).then(ch => resolve(structureHandler.createStructure('StageChannel', [ch, addon, guild]))).catch(reject);
            });
        }
        this.setUserLimit = function(limit, reason){
            return new Promise((resolve, reject) => {
            	if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(typeof limit !== 'number') return reject('Limit must be a type of number');
                if(typeof reason !== 'string') reason = undefined;
                if(limit < 0) limit = 0;
                else if(limit > 10000) limit = 10000;
                data.setUserLimit(limit, reason).then(ch => resolve(structureHandler.createStructure('StageChannel', [ch, addon, guild]))).catch(reject);
            });
        }
        this.setVideoQuality = function(qualityMode, reason){
            return new Promise((resolve, reject) => {
            	if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(typeof qualityMode !== 'number' && qualityMode !== 'string') return reject('Quality mode must be a type of number or type of string');
                if(typeof reason !== 'string') reason = undefined;
                qualityMode = getVideoQualityMode(qualityMode);
                data.setVideoQualityMode(qualityMode, reason).then(ch => resolve(structureHandler.createStructure('StageChannel', [ch, addon, guild]))).catch(reject);
            });
        }
        this.setBitrate = function(bitrate, reason){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(typeof bitrate !== 'number') return reject('Bitrate argument must be a type of number');
                if(typeof reason !== 'string') reason = undefined;
                data.setBitrate(bitrate, reason).then(ch => resolve(structureHandler.createStructure('StageChannel', [ch, addon, guild]))).catch(reject);
            });
        }
    }
    get messages(){
        const addonMessageManager = MessageManager.get(this.addon.name) || new Save();
        const guildMessageManager = addonMessageManager.get(this.guildId) || new Save();
        const channelMessageManager = guildMessageManager.get(this.id) || new Save();
        return channelMessageManager;
    }
};

module.exports = StageChannel;
