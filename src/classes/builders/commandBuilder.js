const CommandOptionsBuilder = require('./commandOptionsBuilder');
const { PermissionFlagsBits } = require('discord.js');

class CommandBuilder{
    constructor(data = {}){
        if(typeof data !== 'object' || Array.isArray(data)) throw new Error(`Invalid command: Invalid data type provided in the command option builder`);
        for(var key in data){
            this[key] = data[key];
        }
    }
    setName(name){
        if(typeof name !== 'string') throw new Error(`Invalid command: Command name must be a string`);
        if(!/^([a-z-]{1,32})$/.test(name)) throw new Error(`Invalid command: Command name must match the following regex: /^([a-zA-Z-]{1,32})$/`);
        this.name = name;
        return this;
    }
    setDescription(description){
        if(typeof description !== 'string') throw new Error(`Invalid command: Command description must be a string`);
        if(description.length === 0 || description > 100) throw new Error(`Invalid command: Command description must be between 1-100 characters`);
        this.description = description;
        return this;
    }
    addOptions(...options){
        for(var i = 0; i < options.length; i++){
            if(Array.isArray(options[i])){
                for(var z = 0; z < options[i].length; z++){
                    var option = options[i][z];
                    if(!(option instanceof CommandOptionsBuilder)) throw new Error(`Invalid command: Command option is not instance of CommandOptionsBuilder class`);
                    var optionJSON = option.toJSON();
                    if(typeof optionJSON.name !== 'string') throw new Error(`Invalid command: Command option name must be a string`);
                    if(typeof optionJSON.description !== 'string') throw new Error(`Invalid command: Command option description must be a string`);
                    this.options.push(optionJSON);
                }
            } else {
                var option = options[i];
                if(!(option instanceof CommandOptionsBuilder)) throw new Error(`Invalid command: Command option is not instance of CommandOptionsBuilder class`);
                var optionJSON = option.toJSON();
                if(typeof optionJSON.name !== 'string') throw new Error(`Invalid command: Command option name must be a string`);
                if(typeof optionJSON.description !== 'string') throw new Error(`Invalid command: Command option description must be a string`);
                this.options.push(optionJSON);
            }
        }
        return this;
    }
    setPermission(permission){
        if(Object.values(PermissionFlagsBits).indexOf(permission) < 0) throw new Error(`Invalid command: Command permission must be a bit value`);
        this.permissions = permission.toString();
        return this;
    }
    setNSFW(boolean = true){
        if(boolean === true){
            this.nsfw = true;
        } else if(boolean === false){
            this.nsfw = false;
        } else {
            this.nsfw = true;
        }
        return this;
    }
    setOverwrite(overwrite = true){
        if(overwrite === true){
            this.overwrite = true;
        } else if(overwrite === false){
            this.overwrite = false;
        } else {
            this.overwrite = true;
        }
        return this;
    }
    toJSON(){
        var commandObject = {
            name: this.name,
            description: this.description,
            options: this.options,
            dm_permission: this.dm_permission,
            default_member_permissions: this.permissions,
            nsfw: this.nsfw,
            overwrite: this.overwrite
        };
        return commandObject;
    }
    name = null;
    description = null;
    options = [];
    dm_permission = false;
    permissions = null;
    nsfw = false;
    overwrite = false;
}

module.exports = CommandBuilder;
