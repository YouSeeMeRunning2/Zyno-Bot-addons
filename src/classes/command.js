const Save = require('./save.js');
const User = require('./structures/user.js');
const Role = require('./structures/role.js');
const { getClientParser, getClient, validatePermission, getAddonPermission } = require('../utils/functions.js');
const { getMessageContent } = require('../utils/messageFunctions.js');
const { ApplicationCommandOptionType, ChannelType } = require('discord.js');
const channelManager = require('./managers/channelManager.js');
const roleManager = require('./managers/roleManager.js');
const userManager = require('./managers/userManager.js');
const memberManager = require('./managers/guildMemberManager.js');
const guildManager = require('./managers/guildManager.js');
const messageManager = require('./managers/messageManager.js');
const scopes = require('../bitfields/scopes.js');

function commandResolver(data, save, guild, structureHandler, addonData, defaultData){
    const addonChannelManager = channelManager.get(addonData.addon.name) || new Save();
    const guildChannelManager = addonChannelManager.get(defaultData.guild.id) || new Save();
    const addonRoleManager = roleManager.get(addonData.addon.name) || new Save();
    const guildRoleManager = addonRoleManager.get(defaultData.guild.id) || new Save();
    const addonUserManager = userManager.get(addonData.addon.name) || new Save();
    return data.reduce((arr, item) => {
        var add;
        if(item.type === ApplicationCommandOptionType.Subcommand || item.type === ApplicationCommandOptionType.SubcommandGroup){
            add = [item.name];
            let newSave = new Save();
            add.push(...commandResolver(item.options, newSave, structureHandler));
            save.set(item.name, newSave);
        } else if(item.type === ApplicationCommandOptionType.String){
            add = item.value.split(' ');
            save.set(item.name, item.value);
        } else if(item.type === ApplicationCommandOptionType.Number || item.type === ApplicationCommandOptionType.Integer){
            add = item.value;
            save.set(item.name, item.value);
        } else if(item.type === ApplicationCommandOptionType.Channel){
            let channel;
            if(item.channel.type === ChannelType.GuildText || item.channel.type === ChannelType.GuildAnnouncement){
                channel = guildChannelManager.get(item.channel.id);
                if(!channel) channel = structureHandler.createStructure('TextChannel', [item.channel, addonData.addon, guild]);
            } else if(item.channel.type === ChannelType.GuildCategory){
                channel = guildChannelManager.get(item.channel.id);
                if(!channel) channel = structureHandler.createStructure('CategoryChannel', [item.channel, addonData.addon, guild]);
            } else if(item.channel.type === ChannelType.GuildVoice){
                channel = guildChannelManager.get(item.channel.id);
                if(!channel) channel = structureHandler.createStructure('VoiceChannel', [item.channel, addonData.addon, guild]);
            } else if(item.channel.type === ChannelType.GuildStageVoice){
                channel = guildChannelManager.get(item.channel.id);
                if(!channel) channel = structureHandler.createStructure('StageChannel', [item.channel, addonData.addon, guild]);
            } else if(item.channel.type === ChannelType.GuildForum){
                channel = guildChannelManager.get(item.channel.id);
                if(!channel) channel = structureHandler.createStructure('ForumChannel', [item.channel, addonData.addon, guild]);
            } else if(item.channel.type === ChannelType.GuildDirectory){
                channel = guildChannelManager.get(item.channel.id);
                if(!channel) channel = structureHandler.createStructure('DirectoryChannel', [item.channel, addonData.addon, guild]);
            }
            add = channel.string;
            save.set(item.name, channel);
        } else if(item.type === ApplicationCommandOptionType.Role){
            let role = guildRoleManager.get(item.role.id) ?? new Role(item.role, addonData.addon, guild)
            add = role.string;
            save.set(item.name, role);
        } else if(item.type === ApplicationCommandOptionType.User){
            let user = addonUserManager.get(item.user.id) ?? new User(item.user, addonData.addon, false, structureHandler);
            add = user.string;
            save.set(item.name, user);
        }
        if(Array.isArray(add)){
            arr.push(...add);
        } else {
            arr.push(add);
        }
        return arr;
    }, []);
}

class Command{
	constructor(data, interaction, registeredCommandData, addonData, structureHandler){
        let client = getClient();
        this.addon = addonData.addon;
        this.name = registeredCommandData.name;
        this.description = registeredCommandData.description;
        this.slashCommand = interaction === true;
        this.memberId = data.member?.id;
        this.guildId = data.guild?.id;
        this.created = new Date();
        this.createdTimestamp = this.created.getTime();
        this.reply = (...content) => {
            return new Promise(async (resolve, reject) => {
                if(content.length === 0) return reject(`At least one argument must be given`);
                let _content = getMessageContent(content);
                if(interaction === true){
                    data.reply({..._content, fetchReply: true}).then(msg => {
                        resolve(structureHandler.createStructure('Message', [msg, addonData.addon]));
                    }).catch(reject);
                } else {
                    data.channel.send(_content).then(msg => {
                        resolve(structureHandler.createStructure('Message', [msg, addonData.addon]));
                    }).catch(reject);
                }
            });
        }
        this.channelId = data.channelId;
        this.messageId = interaction === false ? data.id : undefined;
        if(interaction === false) this.args.push(...(data.content || '').substring(client.config.prefix.length).split(' '));
        else {
            const addonGuildManager = guildManager.get(this.addon.name) || new Save();
            const g = addonGuildManager.get(this.guildId);
            let args = commandResolver(data.options.data, this.options, g, structureHandler, addonData, data);
            this.args = [registeredCommandData.name, ...args];
        }
        this.isSlashCommand = () => {
            return this.slashCommand;
        }
        this.executeCommand = (commandName, args) => {
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addonData.addon.name), scopes.bitfield.COMMANDS)) return reject(`Missing commands scope in bitfield`);
                if(typeof commandName !== 'string') return reject(`Command name must be a type of string`);
                if(!Array.isArray(args)){
                    args = this.args;
                }
                let clientParser = getClientParser();
                let client = clientParser.getClient();
                const cmd = client.commands.get(commandName);
                if(cmd){
                    args[0] = commandName;
                    cmd.run(client, args, data, interaction);
                } else {
                    client.clientParser.interactionHandler.emit('execute', data, interaction);
                }
                resolve();
            });
        }
    }
    get channel(){
        const addonChannelManager = channelManager.get(this.addon.name) || new Save();
        const guildChannelManager = addonChannelManager.get(this.guildId) || new Save();
        return guildChannelManager.get(this.channelId);
    }
    get guild(){
        const addonGuildManager = guildManager.get(this.addon.name) || new Save();
        return addonGuildManager.get(this.guildId);
    }
    get member(){
        const addonMemberManager = memberManager.get(this.addon.name) || new Save();
        const guildMemberManager = addonMemberManager.get(this.guildId) || new Save();
        return guildMemberManager.get(this.memberId);
    }
    get message(){
        if(this.slashCommand === true) return undefined;
        const addonMessageManager = messageManager.get(this.addon.name) || new Save();
        const guildMessageManager = addonMessageManager.get(this.guildId) || new Save();
        const channelMessageManager = guildMessageManager.get(this.channelId) || new Save();
        return channelMessageManager.get(this.messageId);
    }
    name = null;
    description = null;
    args = [];
    options = new Save();
}

module.exports = Command;
