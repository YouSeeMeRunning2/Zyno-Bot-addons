const User = require('../user.js');

class KickEntry{
    constructor(user, guild, entry, addon){
        this.executor = new User(entry.executor, addon, false);
        this.user = new User(user, addon, false);
        this.kicked = new Date(entry.createdTimestamp);
        this.kickedTimestamp = entry.createdTimestamp;
        this.reason = entry.reason;
        this.guild = guild;
    }
}

module.exports = KickEntry;
