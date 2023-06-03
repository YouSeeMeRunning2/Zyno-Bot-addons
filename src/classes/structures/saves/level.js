class Level{
	constructor(client, guildMember){
        const emptyXP = [{xp: 0, messages: 0, level: 0, guild: guildMember.guild.id}];
        const userXP = client.xp.get(guildMember.id) || emptyXP;
        const guildXP = userXP.filter(e => e.guild === guildMember.guild.id)[0] || {xp: 0, messages: 0, level: 0, guild: guildMember.guild.id};
        let guildIndex = userXP.indexOf(guildXP);
        
        this.xp = guildXP.xp;
        this.level = guildXP.level;
        this.messages = guildXP.messages;
        this.setXP = (amount) => {
            return new Promise(async (resolve, reject) => {
                if(typeof amount !== 'number') return reject('XP must be a number');
                if(amount < 0) amount = 0;
                if(guildIndex >= 0) userXP.splice(guildIndex, 1);
                if(amount > guildXP.xp){
                    guildXP.xp = amount;
                    while(client.getXPForLevel(guildXP.level) < guildXP.xp){
                        guildXP.level += 1;
                    }
                    guildXP.level -= 1;
                } else if(amount < guildXP.xp) {
                    while(client.getXPForLevel(guildXP.level) > guildXP.xp){
                        guildXP.level -= 1;
                    }
                }
                userXP.push(guildXP);
                guildIndex = userXP.indexOf(guildXP);
                client.xp.set(guildMember.id, userXP);
                try{
                    await client.xp.save('xp');
                    this.xp = amount;
                    this.level = guildXP.level;
                    resolve(this);
                } catch(err) {
                    reject(err);
                }
            });
        }
        this.setLevel = (amount) => {
            return new Promise(async (resolve, reject) => {
                if(typeof amount !== 'number') return reject('Level must be a number');
                if(amount < 0) amount = 0;
                if(guildIndex >= 0) userXP.splice(guildIndex, 1);
                guildXP.level = amount;
                guildXP.xp = client.getXPForLevel(amount);
                userXP.push(guildXP);
                guildIndex = userXP.indexOf(guildXP);
                client.xp.set(guildMember.id, userXP);
                try{
                    await client.xp.save('xp');
                    this.level = amount;
                    this.xp = guildXP.xp;
                    resolve(this);
                } catch(err) {
                    reject(err);
                }
            });
        };
    }
}

module.exports = Level;
