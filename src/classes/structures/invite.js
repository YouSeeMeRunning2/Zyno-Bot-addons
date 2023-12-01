const inviteManager = require('../managers/inviteManager.js');
const Save = require('../save.js');

class Invite{
    constructor(data, guild, addon, structureHandler, cache){
        this.code = data.code;
        this.createdTimestamp = data.createdTimestamp;
        this.created = new Date(data.createdTimestamp);
        this.uses = data.uses;
        this.url = data.url;
        this.guild = guild;
        this.channel = guild.channels.get(data.channelId);
        this.channelId = data.channelId;
        this.deletable = data.deletable;
        this.expiresTimestamp = data.expiresTimestamp ?? null;
        this.expires = typeof this.expiresTimestamp === 'number' ? new Date(data.expiresTimestamp) : null;
        this.inviter = guild.members.get(data.inviterId);
        this.inviterId = data.inviterId;

        this.isDeletable = () => {
            return this.deletable;
        };
        this.delete = (reason) => {
            return new Promise((resolve, reject) => {
                if(typeof reason !== 'string') reason = undefined;
                data.delete(reason).then(() => {
                    resolve();
                }).catch(reject);
            });
        };

        if(cache){
            const addonInviteManager = inviteManager.get(addon.name) || new Save();
            const guildInviteManager = addonInviteManager.get(guild.id) || new Save();
            guildInviteManager.set(this.code, this);
            addonInviteManager.set(guild.id, guildInviteManager);
            inviteManager.set(addon.name, addonInviteManager);
        }
    }
}

module.exports = Invite;
