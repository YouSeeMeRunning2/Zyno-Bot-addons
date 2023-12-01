const BaseChannel = require('./base.js');
const { validatePermission, getAddonPermission } = require('../../../utils/functions.js');
const scopes = require('../../../bitfields/scopes.js');
const channelManager = require('../../managers/channelManager.js');
const Save = require('../../save.js');

class DirectoryChannel extends BaseChannel{
    constructor(data, addon, guild, structureHandler, cache){
        super(data, addon);
        if(cache){
            const addonChannelManager = channelManager.get(addon.name) || new Save();
            const guildChannelManager = addonChannelManager.get(guild.id) || new Save();
            guildChannelManager.set(data.id, this);
            addonChannelManager.set(guild.id, guildChannelManager);
            channelManager.set(addon.name, addonChannelManager);
        }
        this.guild = guild;
        this.name = data.name;
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
