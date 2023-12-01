const BaseChannel = require('./base.js');
const CategoryChannel = require('./categoryChannel.js');
const guildManager = require('../../managers/guildManager.js');
const { validatePermission, getAddonPermission, getResolvableDate } = require('../../../utils/functions.js');
const scopes = require('../../../bitfields/scopes.js');
const Permissions = require('../permissions.js');
const User = require('../user.js');
const Invite = require('../invite.js');
const Save = require('../../save.js');

class GuildChannel extends BaseChannel{
	constructor(data, addon, guild){
        super(data, addon);
        this.addon = addon;
        this.viewable = data.viewable;
        this.name = data.name;
        this.guildId = guild.id;
        this.manageable = data.manageable;
        this.position = data.position;
        this.deletable = data.deletable;
        this.parent = typeof data.parentId === 'string' ? new CategoryChannel(data.parent, addon, guild) : null;
        this.parentId = data.parentId || null;
        this.permissionsLocked = data.permissionsLocked;
        this.slowMode = typeof data.rateLimitPerUser === 'number' ? data.rateLimitPerUser * 1000 : 0;
        this.nsfw = data.nsfw;
        this.permissions = new Save();
        const permissions = Array.from(data.permissionOverwrites.cache.values());
        for(var i = 0; i < permissions.length; i++){
            var permission = permissions[i];
            this.permissions.set(permission.id, new Permissions(permission, this));
        }
        this.createInvite = (options) => {
            return new Promise((resolve, reject) => {
                if(typeof options !== 'object' || Array.isArray(options) || options === null) options = {};
                let _options = {...options};
                if(typeof _options.targetType === 'string'){
                    switch(_options.targetType.toLowerCase()){
                        case 'stream':
                            _options.targetType = 1;
                            break;
                        case 'application':
                            _options.targetType = 2;
                            break;
                        case 'embeddedapplication':
                            _options.targetType = 2;
                            break;
                    }
                    if(_options.targetUser instanceof User){
                        _options.targetUser = _options.targetUser.id;
                    }
                } else if(typeof _options.targetType === 'number'){
                    if(_options.targetType < 1 || _options.targetType > 2){
                        return reject(`Invalid target type for invite`);
                    }
                    if(_options.targetUser instanceof User){
                        _options.targetUser = _options.targetUser.id;
                    }
                } else if(typeof _options.targetType !== 'undefined'){
                    return reject(`Invalid target type for invite`);
                }

                data.createInvite({
                    temporary: !!_options.temporary,
                    maxAge: typeof _options.maxAge === 'number' ? Math.round(_options.maxAge / 1000) : 0,
                    maxUses: typeof _options.maxUses === 'number' ? _options.maxUses : 0,
                    unique: !!_options.unique,
                    targetUser: typeof _options.targetUser === 'string' ? _options.targetUser : undefined,
                    targetApplication: typeof _options.targetApplication === 'string' ? _options.targetApplication : undefined,
                    targetType: typeof _options.targetType === 'number' ? _options.targetType : undefined,
                    reason: typeof _options.reason === 'string' ? _options.reason : undefined
                }).then(invite => {
                    resolve(new Invite(invite, this.guild, addon));
                }).catch(reject);
            });
        };
        this.setNSFW = (nsfw, reason) => {
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(typeof nsfw !== 'boolean'){
                    if(typeof nsfw === 'string'){
                        reason = nsfw;
                        nsfw = !this.nsfw;
                    } else {
                        nsfw = !this.nsfw;
                    }
                }
                if(typeof reason !== 'string') reason = undefined;
                data.setNSFW(nsfw, reason).then(ch => {
                    resolve(new GuildChannel(ch, addon, guild));
                }).catch(reject);
            });
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
                    resolve(new GuildChannel(ch, addon, guild));
                }).catch(reject);
            });
        }
        this.setPosition = function(position, reason){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(typeof position !== 'number') return reject('The position of the channel must be a type of number');
                if(typeof reason !== 'string') reason = undefined;
                data.setPosition(position, {reason: reason}).then(ch => {
                    resolve(new GuildChannel(ch, addon, guild));
                }).catch(reject);
            });
        }
        this.setParent = function(parent, reason){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(typeof parent !== 'string' && !(parent instanceof CategoryChannel)) return reject('The position of the channel must be a type of string or instance of CategoryChannel');
                if(typeof reason !== 'string') reason = undefined;
                data.setParent(parent instanceof CategoryChannel ? parent.id : parent, {reason: reason}).then(ch => {
                    resolve(new GuildChannel(ch, addon, guild));
                }).catch(reject);
            });
        }
        this.lockPermissions = function(){
            return new Promise((resolve, reject) => {
                data.lockPermissions().then(ch => resolve(new GuildChannel(ch, addon, guild))).catch(reject);
            });
        }
        this.permissionsFor = function(_o){
            if(typeof _o !== 'object' && typeof _o !== 'string') throw new Error(`The argument must be an instance of User, Member, Role or type of string`);
            return data.permissionsFor(typeof _o === 'string' ? _o : _o.id);
        }
        this.setSlowMode = function(dateResolvable, reason){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.CHANNELS)) return reject(`Missing channels scope in bitfield`);
                if(typeof dateResolvable !== 'string' && typeof dateResolvable !== 'number' && !(dateResolvable instanceof Date)) return reject(`Date is not resolvable, must be a string or a number`);
                if(typeof reason !== 'string') reason = undefined;
                const currentTimestamp = new Date().getTime();
                var resolveDate = dateResolvable instanceof Date ? dateResolvable.getTime() - currentTimestamp : getResolvableDate(dateResolvable);
                resolveDate = Math.round(resolveDate / 1000);
                data.setRateLimitPerUser(resolveDate, reason).then(ch => resolve(new GuildChannel(ch, addon, guild))).catch(reject);
            });
        }
    }
    get guild(){
        const addonGuildManager = guildManager.get(this.addon.name) || new Save();
        return addonGuildManager.get(this.guildId);
    }
}

module.exports = GuildChannel;
