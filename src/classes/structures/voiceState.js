const Save = require('../save.js');
const { validatePermission, getAddonPermission } = require('../../utils/functions.js');
const GuildMemberManager = require('../managers/guildMemberManager.js');
const VoiceChannel = require('./channel/voiceChannel.js');
const StageChannel = require('./channel/stageChannel.js');
const VoiceStateManager = require('../managers/voiceStateManager.js');
const scopes = require('../../bitfields/scopes.js');

class VoiceState{
    constructor(voiceState, addon){
        if(typeof voiceState.member === 'object' && !Array.isArray(voiceState.member) && voiceState.member !== null){
            const addonVoiceStateManager = VoiceStateManager.get(addon.name) || new Save();
            addonVoiceStateManager.set(voiceState.member.id, this);
            VoiceStateManager.set(addon.name, addonVoiceStateManager);
            this.member = ((GuildMemberManager.get(addon.name) || new Save()).get(voiceState.member.guild.id) || new Save()).get(voiceState.member.id);
            this.id = voiceState.member.id;
        } else {
            this.member = null;
            this.id = null;
        }
        this.connected = typeof voiceState.channelId === 'string';
        this.selfMute = voiceState.selfMute;
        this.selfDeaf = voiceState.selfDeaf;
        this.selfVideo = voiceState.selfVideo;
        this.streaming = voiceState.streaming;
        this.suppress = voiceState.suppress;
        this.serverMute = voiceState.serverMute;
        this.serverDeaf = voiceState.serverDeaf;
        this.mute = this.selfMute || this.serverMute || false;
        this.deaf = this.selfDeaf || this.serverDeaf || false;
        this.channelId = voiceState.channelId || null;
        this.channel = typeof this.channelId === 'string' ? (this.member.guild.channels.get(this.channelId) || null) : null;
        this.disconnect = function(reason){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.MEMBERS)) return reject(`Missing members scope in bitfield`);
                if(typeof reason !== 'string') reason = undefined;
                voiceState.disconnect(reason).then(() => {
                    resolve();
                }).catch(reject);
            });
        }
        this.setDeaf = function(deaf, reason){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.MEMBERS)) return reject(`Missing members scope in bitfield`);
                if(typeof deaf !== 'string' && typeof deaf !== 'boolean') deaf = !this.serverDeaf;
                if(typeof reason !== 'string') reason = undefined;
                voiceState.setDeaf(deaf, reason).then(m => {
                    resolve();
                }).catch(reject);
            });
        }
        this.setMute = function(mute, reason){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.MEMBERS)) return reject(`Missing members scope in bitfield`);
                if(typeof mute !== 'string' && typeof mute !== 'boolean') mute = !this.serverMute;
                if(typeof reason !== 'string') reason = undefined;
                voiceState.setMute(mute, reason).then(m => {
                    resolve();
                }).catch(reject);
            });
        }
        this.setChannel = function(channel, reason){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.MEMBERS)) return reject(`Missing members scope in bitfield`);
                if(typeof channel !== 'string' && !(channel instanceof VoiceChannel) && !(channel instanceof StageChannel)) return reject(`The channel is not a resolvable channel`);
                if(typeof reason !== 'string') reason = undefined;
                if(typeof channel !== 'string') channel = channel.id;
                voiceState.setChannel(channel, reason).then(m => {
                    resolve();
                }).catch(reject);
            })
        }
    }
}

module.exports = VoiceState;
