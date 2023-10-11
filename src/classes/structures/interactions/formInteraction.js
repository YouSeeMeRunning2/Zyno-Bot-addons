const GuildManager = require('../../managers/guildManager.js');
const GuildMemberManager = require('../../managers/guildMemberManager.js');
const { getMessageContent } = require('../../../utils/messageFunctions.js');
const Save = require('../../save.js');
const { ComponentType } = require('discord.js');

class FormInteraction{
    constructor(data, addon, structureHandler){
        const addonGuildManager = GuildManager.get(addon.name) || new Save();
        this.type = "Form";
        this.guild = addonGuildManager.get(data.guildId);
        this.guildId = data.guildId;
        this.channel = this.guild ? this.guild.channels.get(data.channelId) : null;
        this.channelId = data.channelId;
        const addonGuildMemberManager = GuildMemberManager.get(addon.name) || new Save();
        const GuildMembers = addonGuildMemberManager.get(this.guildId) || new Save();
        this.member = GuildMembers.get(data.member.id);
        this.user = structureHandler.createStructure('User', [data.user, addon, false]);
        this.message = structureHandler.createStructure('Message', [data.message, addon]);
        this.customId = data.customId;
        this.id = data.id;
        this.inputs = data.fields.fields.filter(f => f.type === ComponentType.TextInput).map(f => f.value);
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
                else data.editReply(_content).then(msg => resolve(structureHandler.createStructure('Message', [msg, addon]))).catch(reject);
            });
        };
        this.followUp = function(...content){
            return new Promise((resolve, reject) => {
                if(content.length === 0) return reject(`At least one argument must be given`);
                let _content = getMessageContent(content);
                data.followUp(_content).then(msg => resolve(structureHandler.createStructure('Message', [msg, addon]))).catch(reject);
            });
        };
        this.update = function(...content){
            return new Promise((resolve, reject) => {
                if(content.length === 0) return reject(`At least one argument must be given`);
                let _content = getMessageContent(content);
                data.update(_content).then(msg => resolve(structureHandler.createStructure('Message', [msg, addon]))).catch(reject);
            });
        };
    }
}

module.exports = FormInteraction;
