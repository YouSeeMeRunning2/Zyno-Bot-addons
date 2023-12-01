const userManager = require('../../managers/userManager.js');
const Save = require('../../save.js');

class MuteEntry{
    constructor(data, member, addon){
        const addonUserManager = userManager.get(addon.name) || new Save();
        this.executor = addonUserManager.get(data.executor.id);
        this.user = addonUserManager.get(data.target.id);
        this.reason = data.reason;
        this.muted = new Date(data.createdTimestamp);
        this.mutedTimestamp = data.createdTimestamp;
        this.guild = member.guild;
    }
}

module.exports = MuteEntry;
