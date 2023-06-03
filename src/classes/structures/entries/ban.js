const User = require('../user.js');

class BanEntry{
    constructor(user, guild, entry, addon){
        this.executor = new User(entry.executor, addon, false);
        this.user = new User(user, addon, false);
        this.banned = new Date(entry.createdTimestamp);
        this.bannedTimestamp = entry.createdTimestamp;
        this.reason = entry.reason;
        this.guild = guild;
    }
}

module.exports = BanEntry;
