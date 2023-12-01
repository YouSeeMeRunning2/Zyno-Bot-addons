const { EventEmitter } = require('events');

class CommandHandler extends EventEmitter{
    constructor(data){
		super();
        Object.defineProperties(this, {
            name: {
                value: data.name,
                writable: false
            },
            description: {
                value: data.description,
                writable: false
            },
            id: {
                value: data.id,
                writable: false
            },
            options: {
                value: data.options,
                writable: false
            },
            category: {
                value: data.category,
                writable: false
            }, 
            dm_permission: {
                value: data.dm_permission,
                writable: false
            },
            permissions: {
                value: data.default_member_permissions,
                writable: false
            },
            nsfw: {
                value: data.nsfw,
                writable: false
            },
            overwrite: {
                value: data.overwrite,
                writable: false
            }
        });
    }
    name = null;
    description = null;
    id = null;
    options = [];
    category = null;
    dm_permission = false;
    permissions = null;
    nsfw = false;
    overwrite = false;
}

module.exports = CommandHandler;
