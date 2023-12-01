const Save = require('../save.js');
const Role = require('./role.js');
const MemberManager = require('../managers/memberManager.js');
const UserManager = require('../managers/userManager.js');
const channelManager = require('../managers/channelManager.js');
const { ChannelType } = require('discord.js');

class Mentions{
    constructor(data, addon, guild, structureHandler){
        this.everyone = data.mentions.everyone;
        const memberMentions = Array.from(data.mentions.users.values()).filter(m => m !== undefined).map(m => {
            let author;
            if(!data.channel.isDMBased()){
                const addonMemberManager = MemberManager.get(addon.name) || new Save();
                const memberManager = addonMemberManager.get(m.id) || new Save();
                author = memberManager.get(data.guild.id);
            } else {
                const addonUserManager = UserManager.get(addon.name) || new Save();
                author = addonUserManager.get(m.id);
            }
            return {
                key: m.id,
                value: author
            };
        });
        this.members = new Save(memberMentions);
        const roleMentions = Array.from(data.mentions.roles.values()).filter(r => r !== undefined).map(r => {
            return {
                key: r.id,
                value: new Role(r, addon, guild)
            };
        });
        this.roles = new Save(roleMentions);
        const channelMentions = Array.from(data.mentions.channels.values()).filter(c => c !== undefined).map(guildChannel => {
            let channel = null;
            const addonChannelManager = channelManager.get(addon.name) || new Save();
            const guildChannelManager = addonChannelManager.get(guild.id) || new Save();
            if(guildChannel.type === ChannelType.GuildText || guildChannel.type === ChannelType.GuildAnnouncement){
                channel = guildChannelManager.get(guildChannel.id) ?? structureHandler.createStructure('TextChannel', [guildChannel, addon, guild]);
            } else if(guildChannel.type === ChannelType.GuildCategory){
                channel = guildChannelManager.get(guildChannel.id) ?? structureHandler.createStructure('CategoryChannel', [guildChannel, addon, guild]);
            } else if(guildChannel.type === ChannelType.GuildVoice){
                channel = guildChannelManager.get(guildChannel.id) ?? structureHandler.createStructure('VoiceChannel', [guildChannel, addon, guild]);
            } else if(guildChannel.type === ChannelType.GuildStageVoice){
                channel = guildChannelManager.get(guildChannel.id) ?? structureHandler.createStructure('StageChannel', [guildChannel, addon, guild]);
            } else if(guildChannel.type === ChannelType.GuildForum){
                channel = guildChannelManager.get(guildChannel.id) ?? structureHandler.createStructure('ForumChannel', [guildChannel, addon, guild]);
            } else if(guildChannel.type === ChannelType.GuildDirectory){
                channel = guildChannelManager.get(guildChannel.id) ?? structureHandler.createStructure('DirectoryChannel', [guildChannel, addon, guild]);
            }
            return {
                key: guildChannel.id,
                value: channel
            };
        });
        this.channels = new Save(channelMentions);
    }
}

module.exports = Mentions;
