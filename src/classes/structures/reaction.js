const User = require('./user.js');
const Member = require('./member.js');
const Save = require('../save.js');
const GuildMemberManager = require('../managers/guildMemberManager.js');
const GuildManager = require('../managers/guildManager.js');
const messageManager = require('../managers/messageManager.js');

class Reaction{
    constructor(data, addon, _user, structureHandler){
        const addonMessageManager = messageManager.get(addon.name) || structureHandler.createStructure('Save');
        const guildMessageManager = addonMessageManager.get(data.message.guild.id) || structureHandler.createStructure('Save');
        const channelMessageManager = guildMessageManager.get(data.message.channel.id) || structureHandler.createStructure('Save');
        this.message = channelMessageManager.get(data.message.id) ?? structureHandler.createStructure('Message', [data.message, addon]);
        const addonGuildManager = GuildManager.get(addon.name) || structureHandler.createStructure('Save');
        this.guild = addonGuildManager.get(data.message.guildId) ?? this.message.guild;
        this.id = data.emoji.id;
        const addonGuildMemberManager = GuildMemberManager.get(addon.name) || new Save();
        const membersGuild = addonGuildMemberManager.get(this.guild.id) || new Save();
        const members = Array.from(data.users.cache.keys()).map(userId => membersGuild.get(userId));
        this.members = new Save(members.filter(m => m !== undefined).map(m => {
            return {
                key: m.id,
                value: m
            }
        }));
        this.emoji = {
            name: data.emoji.name || null,
            id: data.emoji.id || null,
            animated: data.emoji.animated || null,
            string: data.emoji.toString()
        };
        this.user = _user;
        this.isCustomEmoji = function(){
            return typeof data.emoji.id === 'string';
        };
        this.removeReaction = function(user){
            return new Promise((resolve, reject) => {
                if(typeof user === 'string'){
                    data.users.remove(user).then(_d => {
                        resolve(new Reaction(_d, addon));
                    }).catch(reject);
                } else if(user instanceof User || user instanceof Member){
                    data.users.remove(user.id).then(_d => {
                        resolve(new Reaction(_d, addon));
                    }).catch(reject);
                } else {
                    data.users.remove(_user.id).then(_d => {
                        resolve(new Reaction(_d, addon, _user));
                    }).catch(reject);
                }
            });
        }
    }
}

module.exports = Reaction;
