const User = require('../user.js');

class MuteEntry{
    constructor(data, member, addon){
        this.executor = new User(data.executor, addon, false);
        this.user = new User(data.target, addon, false);
        this.reason = data.reason;
        this.muted = new Date(data.createdTimestamp);
        this.mutedTimestamp = data.createdTimestamp;
        this.guild = member.guild;
    }
}

module.exports = MuteEntry;
