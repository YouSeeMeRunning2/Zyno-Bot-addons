const userManager = require('../../managers/userManager.js');
const Save = require('../../save.js');

class BaseEntry{
    constructor(data, member, guild, addon){
        const addonUserManager = userManager.get(addon.name) || new Save();
        this.executor = addonUserManager.get(data.executor.id);
        this.user = member ? addonUserManager.get(data.target.id) : undefined;
        this.reason = data.reason;
        this.changed = new Date(data.createdTimestamp);
        this.changedTimestamp = data.createdTimestamp;
        this.guild = guild;
    }
}

module.exports = BaseEntry;
