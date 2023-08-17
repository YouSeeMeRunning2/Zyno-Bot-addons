const BaseChannel = require('./base.js');
const UserManager = require('../../managers/userManager.js');
const Save = require('../../save.js');
const { validatePermission, getAddonPermission } = require('../../../utils/functions.js');
const scopes = require('../../../bitfields/scopes.js');

class DMChannel extends BaseChannel{
    constructor(data, addon, structureHandler){
        super(data, addon);
        this.id = data.id;
        const addonUserManager = UserManager.get(addon.name) || new Save();
        this.user = addonUserManager.get(data.recipientId);
        if(validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)){
            addon.channels.set(this.id, this);
        }
        this.update = function(){
            return new Promise((resolve, reject) => {
                data.fetch().then(ch => {
                    resolve(structureHandler.createStructure('DMChannel', [ch, addon]));
                }).catch(reject);
            });
        }
        this.send = function(...args){
            return this.user.sendDM(...args);
        }
    }
}

module.exports = DMChannel;
