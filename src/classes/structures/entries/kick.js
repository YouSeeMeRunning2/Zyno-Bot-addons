const userManager = require('../../managers/userManager.js');
const Save = require('../../save.js');

class KickEntry{
    constructor(user, guild, entry, addon){
        const addonUserManager = userManager.get(addon.name) || new Save();
        this.executor = addonUserManager.get(entry.executor.id);
        this.user = addonUserManager.get(user.id);
        this.kicked = new Date(entry.createdTimestamp);
        this.kickedTimestamp = entry.createdTimestamp;
        this.reason = entry.reason;
        this.guild = guild;
    }
}

module.exports = KickEntry;
