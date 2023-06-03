const { validatePermission, getAddonPermission, getColorCode } = require('../../utils/functions.js');
const scopes = require('../../bitfields/scopes.js');

class Role{
    constructor(data, addon, guild){
        this.id = data.id;
        this.string = `<@&${this.id}>`;
        this.color = {
            hex: data.hexColor,
            base: data.color
        };
        this.hoist = data.hoist;
        this.position = data.rawPosition;
        this.name = data.name;
        this.created = new Date(data.createdTimestamp);
        this.createdTimestamp = data.createdTimestamp;
        this.editable = data.editable;
        this.guild = guild;
        this.permissions = data.permissions;
        this.mentionable = data.mentionable;
        if(guild) this.guild.roles.set(this.id, this);
        this.setName = function(name, reason){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.ROLES)) return reject('Missing roles scope in bitfield');
                if(!this.editable) return reject('This role cannot be edited');
                if(typeof name !== 'string') return reject(`The role's name must be a type of string`);
                if(typeof reason !== 'string') reason = undefined;
                data.setName(name, reason).then(r => {
                    resolve(new Role(r, addon, this.guild));
                }).catch(reject);
            });
        }
        this.setHoist = function(hoist, reason){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.ROLES)) return reject('Missing roles scope in bitfield');
                if(!this.editable) return reject('This role cannot be edited');
                if(typeof hoist !== 'boolean'){
                    if(typeof hoist === 'string'){
                        reason = hoist;
                        hoist = !this.hoist;
                    } else {
                        hoist = !this.hoist;
                    }
                }
                if(typeof reason !== 'string') reason = undefined;
                data.setHoist(hoist, reason).then(r => {
                    resolve(new Role(r, addon, this.guild));
                }).catch(reject);
            });
        }
        this.setColor = function(color, reason){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.ROLES)) return reject('Missing roles scope in bitfield');
                if(!this.editable) return reject('This role cannot be edited');
                if(typeof color !== 'string' && typeof color !== 'number') return reject(`The role's color must be a type of string or number`);
                if(typeof color === 'string'){
                    color = getColorCode(color);
                }
                
                if(typeof reason !== 'string') reason = undefined;
                data.setColor(color, reason).then(r => {
                    resolve(new Role(r, addon, this.guild));
                }).catch(reject);
            });
        }
        this.setPosition = function(position, reason){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.ROLES)) return reject('Missing roles scope in bitfield');
                if(!this.editable) return reject('This role cannot be edited');
                if(typeof position !== 'number') return reject(`The role's position must be a type of number`);
                if(typeof reason !== 'string') reason = undefined;
                data.setPosition(position, {reason: reason}).then(r => {
                    resolve(new Role(r, addon, this.guild));
                }).catch(reject);
            });
        }
        this.setMentionable = function(mentionable, reason){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.ROLES)) return reject('Missing roles scope in bitfield');
                if(!this.editable) return reject('This role cannot be edited');
                if(typeof mentionable !== 'boolean'){
                    if(typeof mentionable === 'string'){
                        reason = mentionable;
                        mentionable = !this.mentionable;
                    } else {
                        mentionable = !this.mentionable;
                    }
                }
                if(typeof reason !== 'string') reason = undefined;
                data.setMentionable(mentionable, reason).then(r => {
                    resolve(new Role(r, addon, this.guild));
                }).catch(reject);
            });
        }
        this.setPermissions = function(permissions, reason){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.ROLES)) return reject('Missing roles scope in bitfield');
                if(!this.editable) return reject('This role cannot be edited');
                if(!Array.isArray(permissions)) return reject(`The role's permissions must be an array with the permissions`);
                if(typeof reason !== 'string') reason = undefined;
                data.setPermissions(permissions, reason).then(r => {
                    resolve(new Role(r, addon, this.guild));
                }).catch(reject);
            });
        }
        this.delete = function(reason){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.ROLES)) return reject('Missing roles scope in bitfield');
                if(typeof reason !== 'string') reason = undefined;
                this.guild.deleteRole(this.id, reason).then(() => resolve()).catch(reject);
            });
        }
    }
}

module.exports = Role;
