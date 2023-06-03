const Save = require('./save.js');
const Member = require('./structures/member.js');
const User = require('./structures/user.js');
const Role = require('./structures/role.js');
const Message = require('./structures/message.js');
const TextChannel = require('./structures/channel/textChannel.js');
const CategoryChannel = require('./structures/channel/categoryChannel.js');
const VoiceChannel = require('./structures/channel/voiceChannel.js');
const StageChannel = require('./structures/channel/stageChannel.js');
const ForumChannel = require('./structures/channel/forumChannel.js');
const DirectoryChannel = require('./structures/channel/directoryChannel.js');
const { getClient } = require('../utils/functions.js');
const { getMessageContent } = require('../utils/messageFunctions.js');
const { ApplicationCommandOptionType, ChannelType } = require('discord.js');

class Command{
	constructor(data, interaction, registeredCommandData, addonData){
        let client = getClient();
        this.name = registeredCommandData.name;
        this.description = registeredCommandData.description;
        this.slashCommand = interaction === true;
        this.member = new Member(data.member, addonData.addon);
        this.created = new Date();
        this.createdTimestamp = this.created.getTime();
        this.reply = (...content) => {
            return new Promise(async (resolve, reject) => {
                if(content.length === 0) return reject(`At least one argument must be given`);
                let _content = getMessageContent(content);
                if(interaction === true){
                    data.reply({..._content, fetchReply: true}).then(msg => {
                        resolve(new Message(msg, addonData.addon));
                    }).catch(reject);
                } else {
                    data.channel.send(_content).then(msg => {
                        resolve(new Message(msg, addonData.addon));
                    }).catch(reject);
                }
            });
        }
        this.guild = this.member.guild;
        this.channel = this.guild.channels.get(data.channelId);
        this.message = interaction === false ? new Message(data, addonData.addon) : undefined;
        if(interaction === false) this.args.push(...(data.content || '').substring(client.config.prefix.length).split(' '));
        else {
            let args = data.options.data.reduce((arr, item) => {
                var add;
                if(item.type === ApplicationCommandOptionType.String){
                    add = item.value.split(' ');
                    this.options.set(item.name, item.value);
                } else if(item.type === ApplicationCommandOptionType.Number || item.type === ApplicationCommandOptionType.Integer){
                    add = item.value;
                    this.options.set(item.name, item.value);
                } else if(item.type === ApplicationCommandOptionType.Channel){
                    let channel;
                    if(item.channel.type === ChannelType.GuildText || item.channel.type === ChannelType.GuildAnnouncement){
                        channel = new TextChannel(item.channel, addonData.addon, this.guild);
                    } else if(item.channel.type === ChannelType.GuildCategory){
                        channel = new CategoryChannel(item.channel, addonData.addon, this.guild);
                    } else if(item.channel.type === ChannelType.GuildVoice){
                        channel = new VoiceChannel(item.channel, addonData.addon, this.guild);
                    } else if(item.channel.type === ChannelType.GuildStageVoice){
                        channel = new StageChannel(item.channel, addonData.addon, this.guild);
                    } else if(item.channel.type === ChannelType.GuildForum){
                        channel = new ForumChannel(item.channel, addonData.addon, this.guild);
                    } else if(item.channel.type === ChannelType.GuildDirectory){
                        channel = new DirectoryChannel(item.channel, addonData.addon, this.guild);
                    }
                    add = channel.string;
                    this.options.set(item.name, channel);
                } else if(item.type === ApplicationCommandOptionType.Role){
                    let role = new Role(item.role, addonData.addon, this.guild)
                    add = role.string;
                    this.options.set(item.name, role);
                } else if(item.type === ApplicationCommandOptionType.User){
                    let user = new User(item.user, addonData.addon, false);
                    add = user.string;
                    this.options.set(item.name, user);
                }
                if(Array.isArray(add)){
                    arr.push(...add);
                } else {
                    arr.push(add);
                }
                return arr;
            }, [registeredCommandData.name]);
            this.args = args;
        }
        this.isSlashCommand = () => {
            return this.slashCommand;
        }
    }
    name = null;
    description = null;
    args = [];
    options = new Save();
}

module.exports = Command;
