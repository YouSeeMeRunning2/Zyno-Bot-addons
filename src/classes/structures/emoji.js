const { validatePermission, getAddonPermission } = require('../../utils/functions.js');
const UserManager = require('../managers/userManager.js');
const User = require('../structures/user.js');
const scopes = require('../../bitfields/scopes.js');
const Save = require('../save.js');
const emojiManager = require('../managers/emojiManager.js');

class Emoji{
    constructor(emoji, addon, guild, structureHandler, cache){
        if(cache){
            const addonEmojiManager = emojiManager.get(addon.name) || new Save();
            const guildEmojiManager = addonEmojiManager.get(guild.id) || new Save();
            guildEmojiManager.set(emoji.id, this);
            addonEmojiManager.set(guild.id, guildEmojiManager);
            emojiManager.set(addon.name, addonEmojiManager);
        }
        this.addon = addon;
        this.creatorId = emoji.author ? emoji.author.id : null;
        this.animated = emoji.animated;
        this.guild = guild;
        this.created = new Date(emoji.createdTimestamp);
        this.createdTimestamp = emoji.createdTimestamp;
        this.id = emoji.id;
        this.name = emoji.name;
        this.string = `<:${this.name}:${this.id}>`;
        if(guild) this.guild.emojis.set(this.id, this);
        this.getURL = function(){
            return emoji.imageURL();
        }
        this.setName = function(name, reason){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.EMOJIS)) return reject(`Missing emojis scope in bitfield`);
                if(typeof name !== 'string') return reject(`The name of the emoji must be a string`);
                if(typeof reason !== 'string') reason = undefined;
                emoji.setName(name, reason).then(e => {
                    resolve(new Emoji(e, addon, guild));
                }).catch(reject);
            });
        };
        this.delete = function(reason){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.EMOJIS)) return reject(`Missing emojis scope in bitfield`);
                if(typeof reason !== 'string') reason = undefined;
                emoji.delete(reason).then(() => {
                    resolve();
                }).catch(reject);
            });
        }
        this.updateCreator = () => {
            return new Promise((resolve, reject) => {
                emoji.fetchAuthor().then(u => {
                    this.creator = new User(u, addon, false);
                    resolve(this);
                }).catch(reject);
            });
        }
    }
    get creator(){
        const addonUserManager = UserManager.get(this.addon.name) || new Save();
        return typeof this.creatorId === 'string' ? addonUserManager.get(this.creatorId) : null;
    }
}

module.exports = Emoji;
