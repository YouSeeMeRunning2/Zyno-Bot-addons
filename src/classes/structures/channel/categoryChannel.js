const BaseChannel = require('./base.js');
const { validatePermission, getAddonPermission } = require('../../../utils/functions.js');
const scopes = require('../../../bitfields/scopes.js');
const Permissions = require('../permissions.js');
const Save = require('../../save.js');

class CategoryChannel extends BaseChannel{
    constructor(data, addon, guild, structureHandler){
        super(data, addon);
        this.viewable = data.viewable;
        this.name = data.name;
        this.position = data.position;
        this.deletable = data.deletable;
        this.guild = guild;
        this.manageable = data.manageable;
        this.permissions = new Save();
        const permissions = Array.from(data.permissionOverwrites.cache.values());
        for(var i = 0; i < permissions.length; i++){
            var permission = permissions[i];
            this.permissions.set(permission.id, new Permissions(permission, this));
        }
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
        this.setName = function(name, reason){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(typeof name !== 'string') return reject('The name of the channel must be a type of string');
                if(typeof reason !== 'string') reason = undefined;
                data.setName(name, reason).then(ch => {
                    resolve(structureHandler.createStructure('CategoryChannel', [ch, addon, guild]));
                }).catch(reject);
            });
        }
        this.setPosition = function(position, reason){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(typeof position !== 'number') return reject('The position of the channel must be a type of number');
                if(typeof reason !== 'string') reason = undefined;
                data.setPosition(position, {reason: reason}).then(ch => {
                    resolve(structureHandler.createStructure('CategoryChannel', [ch, addon, guild]));
                }).catch(reject);
            });
        }
        this.update = function(){
            return new Promise((resolve, reject) => {
                data.fetch().then(ch => {
                    resolve(structureHandler.createStructure('CategoryChannel', [ch, addon, guild]));
                }).catch(reject);
            });
        }
    }
    get channels(){
        return this.guild.channels.filter(ch => ch.parentId === this.id);
    }
}

module.exports = CategoryChannel;
