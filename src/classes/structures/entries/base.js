const User = require('../user.js');

class BaseEntry{
    constructor(data, member, guild, addon){
        this.executor = new User(data.executor, addon, false);
        this.user = member ? new User(data.target, addon, false) : undefined;
        this.reason = data.reason;
        this.changed = new Date(data.createdTimestamp);
        this.changedTimestamp = data.createdTimestamp;
        this.guild = guild;
    }
}

module.exports = BaseEntry;
