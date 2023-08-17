const BaseChannel = require('./base.js');
const { validatePermission, getAddonPermission } = require('../../../utils/functions.js');
const scopes = require('../../../bitfields/scopes.js');

class DirectoryChannel extends BaseChannel{
    constructor(data, addon, guild, structureHandler){
        super(data, addon);
        this.guild = guild;
        this.name = data.name;
        if(guild) guild.channels.set(this.id, this);
        if(validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)){
            addon.channels.set(this.id, this);
        }
        this.delete = function(){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
            	data.delete().then(() => resolve()).catch(reject);
            });
        };
        this.update = function(){
            return new Promise((resolve, reject) => {
                data.fetch().then(ch => {
                    resolve(structureHandler.createStructure('DirectoryChannel', [ch, addon, guild]));
                }).catch(reject);
            });
        };
    }
}

module.exports = DirectoryChannel;
