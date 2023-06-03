const { validatePermission, getAddonPermission } = require('../../utils/functions.js');
const scopes = require('../../bitfields/scopes.js');
const { PermissionFlagsBits } = require('discord.js');

class Permissions{
    constructor(data, channel){
        this.channel = channel;
        this.id = data.id;
        if(data.type === 0){
            this.type = 'Role';
        } else if(data.type === 1){
            this.type = 'Member';
        }
        this.allow = data.allow;
        this.deny = data.deny;
        this.delete = function(reason){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(typeof reason !== 'string') reason = undefined;
                data.delete(reason).then(() => resolve()).catch(reject);
            });
        };
        this.edit = (options, reason) => {
			return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(typeof options !== 'object' || Array.isArray(options) || options === null) return reject('Options argument must be a type of object');
                if(typeof reason !== 'string') reason = undefined;
                var _options = {};
                const permissionsKeys = Object.keys(options);
                const permissionsValues = Object.values(options);
                const permissionsBitsKeys = Object.keys(PermissionFlagsBits);
                for(var i = 0; i < permissionsKeys.length; i++){
                    var permissionKey = permissionsKeys[i];
                    var permissionValue = permissionsValues[i];
                    var getPermissionName = permissionsBitsKeys.filter(k => k.toLowerCase() === permissionKey.toLowerCase());
                    if(getPermissionName.length === 0){
                        continue;
                    } else {
                        _options[getPermissionName[0]] = !!permissionValue ? true : permissionValue;
                    }
                }
                data.edit(_options, reason).then((_ch) => {
                    resolve(new Permissions(_ch.permissionOverwrites.cache.get(this.id), _ch))
                }).catch(reject);
            });
        }
    }
}

module.exports = Permissions;
