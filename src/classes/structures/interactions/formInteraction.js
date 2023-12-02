const GuildManager = require('../../managers/guildManager.js');
const GuildMemberManager = require('../../managers/guildMemberManager.js');
const channelManager = require('../../managers/channelManager.js');
const userManager = require('../../managers/userManager.js');
const messageManager = require('../../managers/messageManager.js');
const { getMessageContent } = require('../../../utils/messageFunctions.js');
const Save = require('../../save.js');
const { InteractionResponse, ComponentType } = require('discord.js');

class FormInteraction{
    constructor(data, addon, structureHandler){
        this.addon = addon;
        this.type = "Form";
        this.guildId = data.guildId;
        this.channelId = data.channelId;
        this.memberId = data.member?.id;
        this.messageId = data.message?.id;
        this.customId = data.customId;
        this.id = data.id;
        this.inputs = data.fields.fields.filter(f => f.type === ComponentType.TextInput).map(f => f.value);
        const addonMessageManager = messageManager.get(this.addon.name) || new Save();
        const guildMessageManager = addonMessageManager.get(this.guildId) || new Save();
        const channelMessageManager = guildMessageManager.get(this.channelId) || new Save();
        this.message = channelMessageManager.get(this.messageId);
       	if(!this.message){
            this.message = structureHandler.createStructure('Message', [data.message, addon]);
            channelMessageManager.set(this.messageId, this.message);
            guildMessageManager.set(this.channelId, channelMessageManager);
            addonMessageManager.set(this.guildId, guildMessageManager);
            messageManager.set(this.addon.name, addonMessageManager);
        }
        this.isButton = () => {
            return this.type === "Button";
        };
        this.isMenu = () => {
            return this.type === "Menu";
        };
        this.isForm = () => {
            return this.type === "Form";
        };
        this.getInput = function(customId){
            return data.fields.getTextInputValue(customId);
        }
        this.deferUpdate = function(){
            return new Promise((resolve, reject) => {
                data.deferUpdate().then(() => resolve()).catch(reject)
            });
        };
        this.deferReply = function(){
            return new Promise((resolve, reject) => {
                data.deferReply().then(() => resolve()).catch(reject)
            });
        }
        this.deleteReply = function(){
            return new Promise((resolve, reject) => {
                data.deleteReply().then(() => resolve()).catch(reject)
            });
        };
        this.reply = function(...content){
            return new Promise((resolve, reject) => {
                if(content.length === 0) return reject(`At least one argument must be given`);
                let _content = getMessageContent(content);
                if(!data.replied && !data.deferred) data.reply(_content).then(msg => resolve(structureHandler.createStructure('Message', [msg, addon]))).catch(reject);
                else data.editReply(_content).then(i => resolve(structureHandler.createStructure('Message', [i instanceof InteractionResponse ? i.interaction.message : i, addon]))).catch(reject);
            });
        };
        this.followUp = function(...content){
            return new Promise((resolve, reject) => {
                if(content.length === 0) return reject(`At least one argument must be given`);
                let _content = getMessageContent(content);
                data.followUp(_content).then(i => resolve(structureHandler.createStructure('Message', [i instanceof InteractionResponse ? i.interaction.message : i, addon]))).catch(reject);
            });
        };
        this.update = function(...content){
            return new Promise((resolve, reject) => {
                if(content.length === 0) return reject(`At least one argument must be given`);
                let _content = getMessageContent(content);
                data.update(_content).then(i => resolve(structureHandler.createStructure('Message', [i instanceof InteractionResponse ? i.interaction.message : i, addon]))).catch(reject);
            });
        };
    }
    get member(){
        const addonGuildMemberManager = GuildMemberManager.get(this.addon.name) || new Save();
        const GuildMembers = addonGuildMemberManager.get(this.guildId) || new Save();
        return GuildMembers.get(this.memberId);
    }
    get guild(){
        const addonGuildManager = GuildManager.get(this.addon.name) || new Save();
        return addonGuildManager.get(this.guildId);
    }
    get channel(){
        const addonChannelManager = channelManager.get(this.addon.name) || new Save();
        const guildChannelManager = addonChannelManager.get(this.guildId) || new Save();
        return guildChannelManager.get(this.channelId);
    }
    get user(){
        const addonUserManager = userManager.get(this.addon.name) || new Save();
        return addonUserManager.get(this.memberId);
    }
}

module.exports = FormInteraction;
