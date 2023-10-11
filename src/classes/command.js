const Save = require('./save.js');
const Member = require('./structures/member.js');
const User = require('./structures/user.js');
const Role = require('./structures/role.js');
const { getClientParser, getClient } = require('../utils/functions.js');
const { getMessageContent } = require('../utils/messageFunctions.js');
const { ApplicationCommandOptionType, ChannelType } = require('discord.js');

function commandResolver(data, save, structureHandler, addonData){
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
                channel = structureHandler.createStructure('TextChannel', [item.channel, addonData.addon, this.guild]);
            } else if(item.channel.type === ChannelType.GuildCategory){
                channel = structureHandler.createStructure('CategoryChannel', [item.channel, addonData.addon, this.guild]);
            } else if(item.channel.type === ChannelType.GuildVoice){
                channel = structureHandler.createStructure('VoiceChannel', [item.channel, addonData.addon, this.guild]);
            } else if(item.channel.type === ChannelType.GuildStageVoice){
                channel = structureHandler.createStructure('StageChannel', [item.channel, addonData.addon, this.guild]);
            } else if(item.channel.type === ChannelType.GuildForum){
                channel = structureHandler.createStructure('ForumChannel', [item.channel, addonData.addon, this.guild]);
            } else if(item.channel.type === ChannelType.GuildDirectory){
                channel = structureHandler.createStructure('DirectoryChannel', [item.channel, addonData.addon, this.guild]);
            }
            add = channel.string;
            save.set(item.name, channel);
        } else if(item.type === ApplicationCommandOptionType.Role){
            let role = new Role(item.role, addonData.addon, this.guild)
            add = role.string;
            save.set(item.name, role);
        } else if(item.type === ApplicationCommandOptionType.User){
            let user = new User(item.user, addonData.addon, false, structureHandler);
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
        this.name = registeredCommandData.name;
        this.description = registeredCommandData.description;
        this.slashCommand = interaction === true;
        this.member = new Member(data.member, addonData.addon, structureHandler);
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
        this.guild = this.member.guild;
        this.channel = this.guild.channels.get(data.channelId);
        this.message = interaction === false ? structureHandler.createStructure('Message', [data, addonData.addon]) : undefined;
        if(interaction === false) this.args.push(...(data.content || '').substring(client.config.prefix.length).split(' '));
        else {
            let args = commandResolver(data.options.data, this.options, structureHandler, addonData);
            this.args = [registeredCommandData.name, ...args];
        }
        this.isSlashCommand = () => {
            return this.slashCommand;
        }
        this.executeCommand = (commandName, args) => {
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.COMMANDS)) return reject(`Missing commands scope in bitfield`);
                if(typeof commandName !== 'string') return reject(`Command name must be a type of string`);
                if(!Array.isArray(args)){
                    args = this.args;
                }
                let clientParser = getClientParser();
                let client = clientParser.getClient();
                const cmd = client.commands.get(commandName);
                if(cmd){
                    cmd.run(client, args, data, true);
                } else {
                    client.clientParser.interactionHandler.emit('execute', data, false);
                }
                resolve();
            });
        }
    }
    name = null;
    description = null;
    args = [];
    options = new Save();
}

module.exports = Command;
