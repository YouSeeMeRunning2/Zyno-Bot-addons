const userManager = require('../../managers/userManager.js');
const Save = require('../../save.js');

class BanEntry{
    constructor(user, guild, entry, addon){
        const addonUserManager = userManager.get(addon.name) || new Save();
        this.executor = addonUserManager.get(entry.executor.id);
        this.user = addonUserManager.get(user.id);
        this.banned = new Date(entry.createdTimestamp);
        this.bannedTimestamp = entry.createdTimestamp;
        this.reason = entry.reason;
        this.guild = guild;
    }
}

module.exports = BanEntry;
