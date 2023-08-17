const GuildChannel = require('./guildChannel.js');
const CategoryChannel = require('./categoryChannel.js');
const { validatePermission, getAddonPermission, getClient, getResolvableDate, validateURL, getVideoQualityMode, getRegion } = require('../../../utils/functions.js');
const { getMessageContent } = require('../../../utils/messageFunctions.js');
const scopes = require('../../../bitfields/scopes.js');
const { Readable } = require('stream');
const Save = require('../../save.js');
const MemberManager = require('../../managers/memberManager.js');
const ytstream = require('yt-stream');

let client;

class VoiceChannel extends GuildChannel{
    constructor(data, addon, guild, structureHandler){
        super(data, addon, guild);
        client = getClient();
        this.joinable = data.joinable;
        this.speakable = data.speakable;
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
        this.deleteMessages = function(amount){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.MESSAGES)) return reject(`Missing messages scope in bitfield`);
                if(typeof amount !== 'number') return reject('Amount argument must be a type of number');
                if(amount < 1) amount = 1;
                else if(amount > 100) amount = 100;
                data.bulkDelete(amount).then(() => resolve()).catch(reject);
            });
        }
        this.update = function(){
            return new Promise((resolve, reject) => {
                data.fetch().then(ch => {
                    resolve(structureHandler.createStructure('VoiceChannel', [ch, addon, guild]));
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
                    userLimit: typeof options.userLimit === 'number' ? (options.userLimit < 0 ? 0 : (options.userLimit > 99 ? 99 : options.userLimit)) : undefined,
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
                    resolve(structureHandler.createStructure('VoiceChannel', [ch, addon, guild]));
                }).catch(reject);
        	});
        }
        this.setRtcRegion = function(region, reason){
            return new Promise((resolve, reject) => {
            	if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(typeof region !== 'string' && region !== null) return reject('Region must be a type of string or null');
                if(typeof reason !== 'string') reason = undefined;
                region = getRegion(region);
                data.setRTCRegion(region, reason).then(ch => resolve(structureHandler.createStructure('VoiceChannel', [ch, addon, guild]))).catch(reject);
            });
        }
        this.setUserLimit = function(limit, reason){
            return new Promise((resolve, reject) => {
            	if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(typeof limit !== 'number') return reject('Limit must be a type of number');
                if(typeof reason !== 'string') reason = undefined;
                if(limit < 0) limit = 0;
                else if(limit > 99) limit = 99;
                data.setUserLimit(limit, reason).then(ch => resolve(structureHandler.createStructure('VoiceChannel', [ch, addon, guild]))).catch(reject);
            });
        }
        this.setVideoQuality = function(qualityMode, reason){
            return new Promise((resolve, reject) => {
            	if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(typeof qualityMode !== 'number' && qualityMode !== 'string') return reject('Quality mode must be a type of number or type of string');
                if(typeof reason !== 'string') reason = undefined;
                qualityMode = getVideoQualityMode(qualityMode);
                data.setVideoQualityMode(qualityMode, reason).then(ch => resolve(structureHandler.createStructure('VoiceChannel', [ch, addon, guild]))).catch(reject);
            });
        }
        this.setBitrate = function(bitrate, reason){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(typeof bitrate !== 'number') return reject('Bitrate argument must be a type of number');
                if(typeof reason !== 'string') reason = undefined;
                data.setBitrate(bitrate, reason).then(ch => resolve(structureHandler.createStructure('VoiceChannel', [ch, addon, guild]))).catch(reject);
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
        this.playSong = function(stream){
            return new Promise((resolve, reject) => {
            	if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(typeof stream !== 'string' && !(stream instanceof Readable)) return reject('Stream must be a type of string or instance of readable stream');
                if(typeof stream === 'string'){
                    if(validateURL(stream)){
                    	client.audioManager.play(data, stream, {
                            quality: 'high',
							volume: 10
						}).then(() => resolve()).catch(reject);
                    } else {
                        var query = stream.slice(0, 50).split("`").join("");
                        ytstream.search(query).then(res => {
                            if(res.length === 0) return reject('There were no YouTube video\'s found with this query');
                            client.audioManager.play(res[0].url, stream, {
                                quality: 'high',
                                volume: 10
                            }).then(() => resolve()).catch(reject);
                        }).catch(reject);
                    }
                } else {
                    client.audioManager.play(data, stream, {
                        quality: 'high',
                        volume: 10
                    }).then(() => resolve()).catch(reject);
                }
            });
        }
        this.disconnect = function(){
            return new Promise(async (resolve, reject) => {
            	if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(!data.guild.members.me.voice.channel) return resolve();
                try{
					await client.audioManager.stop(data);
                    resolve();
                } catch(err) {
                    reject(err);
                }
            });
        }
        this.getQueue = function(){
            return new Promise(async (resolve, reject) => {
            	if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(!data.guild.members.me.voice.channel) return resolve([]);
                try{
					const queue = client.audioManager.queue(data);
                    resolve(queue);
                } catch(err) {
                    reject(err);
                }
            });
        }
        this.skipSong = function(){
            return new Promise(async (resolve, reject) => {
            	if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(!data.guild.members.me.voice.channel) return resolve();
                try{
					await client.audioManager.skip(data);
                    resolve();
                } catch(err) {
                    reject(err);
                }
            });
        }
        this.pauseSong = function(){
            return new Promise((resolve, reject) => {
            	if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(!data.guild.members.me.voice.channel) return resolve();
                try{
					client.audioManager.pause(data);
                    resolve();
                } catch(err) {
                    reject(err);
                }
            });
        }
        this.resumeSong = function(){
            return new Promise((resolve, reject) => {
            	if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(!data.guild.members.me.voice.channel) return resolve();
                try{
					client.audioManager.resume(data);
                    resolve();
                } catch(err) {
                    reject(err);
                }
            });
        }
        this.shuffle = function(){
            return new Promise((resolve, reject) => {
            	if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(!data.guild.members.me.voice.channel) return resolve();
                try{
					client.audioManager.shuffle(data);
                    resolve();
                } catch(err) {
                    reject(err);
                }
            });
        }
        this.setLoop = function(){
            return new Promise((resolve, reject) => {
            	if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(!data.guild.members.me.voice.channel) return resolve();
                try{
					client.audioManager.loop(data, client.audioManager.looptypes.loop);
                    resolve();
                } catch(err) {
                    reject(err);
                }
            });
        }
        this.setUnloop = function(){
            return new Promise((resolve, reject) => {
            	if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(!data.guild.members.me.voice.channel) return resolve();
                try{
					client.audioManager.loop(data, client.audioManager.looptypes.off);
                    resolve();
                } catch(err) {
                    reject(err);
                }
            });
        }
        this.setQueueloop = function(){
            return new Promise((resolve, reject) => {
            	if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(!data.guild.members.me.voice.channel) return resolve();
                try{
					client.audioManager.loop(data, client.audioManager.looptypes.queueloop);
                    resolve();
                } catch(err) {
                    reject(err);
                }
            });
        }
        this.setVolume = function(volume){
            return new Promise((resolve, reject) => {
            	if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(typeof volume !== 'number') return reject('Volume argument must be a type of number');
                if(volume > 10) volume = 10;
                else if(volume < 1) volume = 1;
                if(!data.guild.members.me.voice.channel) return resolve();
                try{
					client.audioManager.volume(data, volume);
                    resolve();
                } catch(err) {
                    reject(err);
                }
            });
        }
    }
}

module.exports = VoiceChannel;
