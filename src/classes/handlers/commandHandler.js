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
            }
        });
    }
    name = null;
    description = null;
    id = null;
}

module.exports = CommandHandler;
