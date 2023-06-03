const Save = require('../save.js');
const Role = require('./role.js');
const MemberManager = require('../managers/memberManager.js');
const UserManager = require('../managers/userManager.js');

class Mentions{
    constructor(data, addon, guild){
        this.everyone = data.mentions.everyone;
        const memberMentions = Array.from(data.mentions.users.values()).map(m => {
            let author;
            if(!data.channel.isDMBased()){
                const addonMemberManager = MemberManager.get(addon.name) || new Save();
                const memberManager = addonMemberManager.get(m.id) || new Save();
                author = memberManager.get(data.guild.id);
            } else {
                const addonUserManager = UserManager.get(addon.name) || new Save();
                author = addonUserManager.get(m.id);
            }
            return {
                key: m.id,
                value: author
            };
        });
        this.members = new Save(memberMentions);
        const roleMentions = Array.from(data.mentions.roles.values()).map(r => {
            return {
                key: r.id,
                value: new Role(r, addon, guild)
            };
        });
        this.roles = new Save(roleMentions);
    }
}

module.exports = Mentions;
