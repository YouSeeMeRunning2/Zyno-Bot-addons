const { validatePermission, getAddonPermission } = require('../../utils/functions.js');
const { getMessageContent } = require('../../utils/messageFunctions.js');
const scopes = require('../../bitfields/scopes.js');
const Save = require('../save.js');
const Mentions = require('./mentions.js');
const MemberManager = require('../managers/memberManager.js');
const UserManager = require('../managers/userManager.js');
const Emoji = require('./emoji.js');
const ThreadChannel = require('./channel/threadChannel.js');
const DMChannel = require('./channel/dmChannel.js');

const validAutoArchiveDates = [60, 1440, 10080, 4320];

class Message{
	constructor(data, addon){
        if(!data.channel.isDMBased()){
            const addonMemberManager = MemberManager.get(addon.name) || new Save();
            const memberManager = addonMemberManager.get((data.author || data.member).id) || new Save();
            this.author = memberManager.get(data.guild.id);
    		this.guild = typeof this.author !== 'undefined' ? this.author.guild : null;
        } else {
        	const addonUserManager = UserManager.get(addon.name) || new Save();
            this.author = addonUserManager.get((data.author || data.member).id);
            this.guild = this.author;
        }
        this.isMe = this.author.id === data.client.user.id;
        this.created = new Date(data.createdTimestamp);
        this.createdTimestamp = data.createdTimestamp;
        this.editable = data.editable;
        this.editedTimestamp = data.editedTimestamp;
        this.edited = this.editedTimestamp ? new Date(data.editedTimestamp) : null;
        this.id = data.id;
        this.attachments = new Save(data.attachments);
        this.url = data.url;
        this.channel = data.channel.isDMBased() ? new DMChannel(data.channel, addon) : this.guild.channels.get(data.channelId);
        this.deletable = data.deletable;
        this.mentions = new Mentions(data, addon, this.guild);
        this.content = data.content || '';
        this.delete = function(){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.MESSAGES)) return reject(`Missing members scope in bitfield`);
                data.delete().then(() => resolve()).catch(reject);
            });
        }
        this.edit = function(...content){
            return new Promise((resolve, reject) => {
                if(content.length === 0) return reject(`At least one argument must be given`);
                if(this.editable === false) return reject('This message can not be edited as it was not send by the bot');
                let _content = getMessageContent(content);
                data.edit(_content).then(msg => resolve(new Message(msg, addon))).catch(reject);
            });
        }
        this.react = function(reaction){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.MESSAGES)) return reject(`Missing members scope in bitfield`);
                if(typeof reaction !== 'string' && !(reaction instanceof Emoji)) return reject('Reaction argument is not a type of string and not an instance of the Emoji class');
                data.react(typeof reaction === 'string' ? reaction : reaction.string).then(() => resolve()).catch(reject);
            });
        }
        this.removeAttachments = function(){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.MESSAGES)) return reject(`Missing members scope in bitfield`);
                data.removeAttachments().then(msg => resolve(new Message(msg, addon))).catch(reject);
            });
        }
        this.update = function(){
            return new Promise((resolve, reject) => {
                data.fetch().then(msg => resolve(new Message(msg, addon))).catch(reject);
            });
        }
        this.createThread = (options) => {
            return new Promise((resolve, reject) => {
            	if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(this.channel?.type !== 'GuildText') return reject('A thread can only be started if the channel where the message was sent in is a GuildText channel');
                if(typeof options !== 'object') options = {};
                if(typeof options.name !== 'string'){
                    if(this.content.length > 0) options.name = this.content.substring(0, 100);
                    else options.name = this.author?.username;
                }
                if(typeof options.reason !== 'string') options.reason = undefined;
                const currentTimestamp = new Date().getTime();
                var archiveDate = undefined;
                var slowMode = undefined;
                if(typeof options.autoArchiveThread === 'string' || options.autoArchiveThread === 'number' || options.autoArchiveThread instanceof Date){
                    archiveDate = options.autoArchiveThread instanceof Date ? options.autoArchiveThread.getTime() - currentTimestamp : getResolvableDate(options.autoArchiveThread);
                    archiveDate = Math.round(archiveDate / (60*1000));
                    if(validAutoArchiveDates.indexOf(archiveDate) < 0){
                        archiveDate = this.channel.autoArchiveThreads;
                    }
                }
                if(typeof options.slowMode === 'string' || typeof options.slowMode === 'number' || options.slowMode instanceof Date){
                    slowMode = options.slowMode instanceof Date ? options.slowMode.getTime() - currentTimestamp : getResolvableDate(options.slowMode);
                    slowMode = Math.round(slowMode / 1000);
                }
                data.startThread({
                    name: options.name,
                    rateLimitPerUser: slowMode,
                    autoArchiveDuration: archiveDate,
                    reason: options.reason,
                }).then(thread => {
                    resolve(new ThreadChannel(thread, addon, this.guild));
                }).catch(reject);
            });
        }
    }
}

module.exports = Message;
