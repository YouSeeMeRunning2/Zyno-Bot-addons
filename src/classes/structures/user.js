const UserManager = require('../managers/userManager.js');
const Save = require('../save.js');
const { getMessageContent } = require('../../utils/messageFunctions.js');
const MemberManager = require('../managers/memberManager.js');

function getImageOptions(options){
    var imageOptions = {};
    if(typeof options === 'object'){
        if(options.dynamic){
            imageOptions['forceStatic'] = false;
        } else {
            imageOptions['forceStatic'] = true;
        }
        if(typeof options.extension === 'string'){
            imageOptions['extension'] = options.extension;
        }
        if(typeof options.size === 'number'){
            imageOptions['size'] = options.size;
        }
    }
    return imageOptions;
}

class User{
    constructor(user, addon, loop, structureHandler, cache){
        if(loop === false && cache){
            const addonUserManager = UserManager.get(addon.name) || new Save();
            addonUserManager.set(user.id, new User(user, addon, true, structureHandler, false));
            UserManager.set(addon.name, addonUserManager);
        }
        this.id = user.id;
        this.string = `<@!${this.id}>`;
        this.username = user.username;
		this.tag = user.tag;
		this.discriminator = user.discriminator;
        this.created = new Date(user.createdTimestamp);
        this.createdTimestamp = user.createdTimestamp;
        this.bot = user.bot;
        this.system = user.system;
        this.addon = addon;
        Object.defineProperty(this, 'bitfield', {
            value: addon.permissions,
            writable: false
        });
        this.avatarURL = function(options){
            var imageOptions = getImageOptions(options);
            return user.displayAvatarURL(imageOptions);
        }
        this.bannerURL = function(options){
            var imageOptions = getImageOptions(options);
            return user.bannerURL(imageOptions);
        }
        this.update = function(){
            return new Promise((resolve, reject) => {
                user.fetch().then(u => {
                    resolve(new User(u, addon));
                }).catch(reject);
            });
        }
        this.sendDM = function(...content){
            return new Promise((resolve, reject) => {
                if(content.length === 0) return reject(`At least one argument must be given`);
                let _content = getMessageContent(content);
                user.send(_content).then(msg => {
                    resolve(structureHandler.createStructure('Message', [msg, addon]));
                }).catch(reject);
            });
        }
        this.getDMChannel = function(){
            return new Promise((resolve, reject) => {
                user.createDM().then(ch => {
                    resolve(structureHandler.createStructure('DMChannel', [ch, addon]));
                }).catch(reject);
            });
        }
        this.getMembers = function(){
            const addonMemberManager = MemberManager.get(addon.name) || new Save();
            return (new Save(addonMemberManager.get(user.id)) || new Save());
        }
    }
}

module.exports = User;
