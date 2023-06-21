const Save = require('../save.js');
const Role = require('./role.js');
const MemberManager = require('../managers/memberManager.js');
const UserManager = require('../managers/userManager.js');
const { ChannelType } = require('discord.js');
const TextChannel = require('./channel/textChannel.js');
const CategoryChannel = require('./channel/categoryChannel.js');
const VoiceChannel = require('./channel/voiceChannel.js');
const StageChannel = require('./channel/stageChannel.js');
const ForumChannel = require('./channel/forumChannel.js');
const DirectoryChannel = require('./channel/directoryChannel.js');

class Mentions{
    constructor(data, addon, guild){
        this.everyone = data.mentions.everyone;
        const memberMentions = Array.from(data.mentions.users.values()).map(m => {
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
        const roleMentions = Array.from(data.mentions.roles.values()).map(r => {
            return {
                key: r.id,
                value: new Role(r, addon, guild)
            };
        });
        this.roles = new Save(roleMentions);
        const channelMentions = Array.from(data.mentions.channels.values()).map(guildChannel => {
            let channel = null;
            if(guildChannel.type === ChannelType.GuildText || guildChannel.type === ChannelType.GuildAnnouncement){
                channel = new TextChannel(guildChannel, addon, guild);
            } else if(guildChannel.type === ChannelType.GuildCategory){
                channel = new CategoryChannel(guildChannel, addon, guild);
            } else if(guildChannel.type === ChannelType.GuildVoice){
                channel = new VoiceChannel(guildChannel, addon, guild);
            } else if(guildChannel.type === ChannelType.GuildStageVoice){
                channel = new StageChannel(guildChannel, addon, guild);
            } else if(guildChannel.type === ChannelType.GuildForum){
                channel = new ForumChannel(guildChannel, addon, guild);
            } else if(guildChannel.type === ChannelType.GuildDirectory){
                channel = new DirectoryChannel(guildChannel, addon, guild);
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
