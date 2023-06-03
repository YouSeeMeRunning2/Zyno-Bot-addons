const { getChannelType, getClient } = require('../../../utils/functions.js');
const GuildMemberManager = require('../../managers/guildMemberManager.js');
const Save = require('../../save.js');

let client = getClient();

class BaseChannel{
	constructor(data, addon){
		client = getClient();
        this.id = data.id;
        this.type = getChannelType(data.type);
        this.created = new Date(data.createdTimestamp);
        this.createdTimestamp = data.createdTimestamp;
        this.string = `<#${this.id}>`;
        this.url = data.url;
        this.isTextChannel = () => {
            return this.type === 'GuildText' || this.type === 'GuildAnnouncement';
        };
        this.isVoiceChannel = () => {
            return this.type === 'GuildVoice';
        };
        this.isVoiceStage = () => {
            return this.type === 'GuildVoiceStage';
        };
        this.isDM = () => {
            return this.type === 'DM';
        };
        this.isThread = () => {
          	return this.type === 'PublicThread' || this.type === 'PrivateThread' || this.type === 'AnnouncementThread';  
        };
        this.isTicket = () => {
            if(!this.isDM()){
                const ticketFilter = client.tickets.filter(t => {
                    if(Array.isArray(t.value)){
                        return t.value.filter(t => typeof t === 'string' ? t === data.id : t.channel === data.id && t.guild === data.guild.id).length > 0;
                    } else if(typeof t.value === 'string'){
                        return t.value === data.id;
                    } else {
                        return false;
                    }
                });
                return ticketFilter.size > 0;
            } else {
                return false;
            }
        }
        this.getTicketOwner = () => {
            if(!this.isTicket()){
                return undefined;
            }
            const ticketFilter = client.tickets.filter(t => {
                if(Array.isArray(t.value)){
                    return t.value.filter(t => typeof t === 'string' ? t === data.id : t.channel === data.id && t.guild === data.guild.id).length > 0;
                } else if(typeof t.value === 'string'){
                    return t.value === data.id;
                } else {
                    return false;
                }
            });
            if(ticketFilter.size === 0) return undefined;
            const addonGuildMemberManager = GuildMemberManager.get(addon.name) || new Save();
            const guildMembers = addonGuildMemberManager.get(data.guild.id) || new Save();
            return guildMembers.get(ticketFilter.firstKey());
        }
        this.getTicketInfo = () => {
            if(!this.isTicket()){
                return undefined;
            }
            const ticketFilter = client.tickets.filter(t => {
                if(Array.isArray(t.value)){
                    return t.value.filter(t => typeof t === 'string' ? t === data.id : t.channel === data.id && t.guild === data.guild.id).length > 0;
                } else if(typeof t.value === 'string'){
                    return t.value === data.id;
                } else {
                    return false;
                }
            });
            if(ticketFilter.size === 0) return undefined;
            let ticketInfoObj = ticketFilter.first();
            const addonGuildMemberManager = GuildMemberManager.get(addon.name) || new Save();
            const guildMembers = addonGuildMemberManager.get(data.guild.id) || new Save();
            if(typeof ticketInfoObj === 'string'){
                return {
                    channelId: ticketInfoObj,
                    claimed: undefined,
                    category: undefined,
                    owner: guildMembers.get(ticketFilter.firstKey()),
                    closed: false
                }
            } else if(Array.isArray(ticketInfoObj)) {
                ticketInfoObj = ticketInfoObj.filter(t => typeof t === 'string' ? t === data.id : t.channel === data.id && t.guild === data.guild.id)[0];
                if(typeof ticketInfoObj === 'object'){
                    return {
                        channelId: ticketInfoObj.channel,
                        claimed: typeof ticketInfoObj.claimed === 'string' ? (guildMembers.get(ticketInfoObj.claimed) || undefined) : undefined,
                        category: ticketInfoObj.category || undefined,
                        owner: guildMembers.get(ticketFilter.firstKey()),
                        closed: ticketInfoObj.closed
                    }
                } else {
                    return {
                        channelId: ticketInfoObj,
                        claimed: undefined,
                        category: undefined,
                        owner: guildMembers.get(ticketFilter.firstKey()),
                        closed: false
                    }
                }
            }
        }
    }
}

module.exports = BaseChannel;
