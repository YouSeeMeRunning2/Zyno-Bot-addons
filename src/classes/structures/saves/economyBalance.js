class EconomyBalance{
	constructor(client, guildMember){
        const emptyBalance = [{bank: 0, cash: 0, guild: guildMember.guild.id}];
        const userBalance = client.economy.get(guildMember.id) || emptyBalance;
        const guildBalance = userBalance.filter(e => e.guild === guildMember.guild.id)[0] || {bank: 0, cash: 0, guild: guildMember.guild.id};
        let guildIndex = userBalance.indexOf(guildBalance);
        
        this.bank = guildBalance.bank;
        this.cash = guildBalance.cash;
        this.setBank = (amount) => {
            return new Promise(async (resolve, reject) => {
                if(typeof amount !== 'number') return reject('Bank amount must be a number');
                if(amount < 0) amount = 0;
                if(guildIndex >= 0) userBalance.splice(guildIndex, 1);
                guildBalance.bank = amount;
                userBalance.push(guildBalance);
                guildIndex = userBalance.indexOf(guildBalance);
                client.economy.set(guildMember.id, userBalance);
                try{
                    await client.economy.save('economy');
                    this.bank = amount;
                    resolve(this);
                } catch(err) {
                    reject(err);
                }
            });
        }
        this.setCash = (amount) => {
            return new Promise(async (resolve, reject) => {
                if(typeof amount !== 'number') return reject('Cash amount must be a number');
                if(amount < 0) amount = 0;
                if(guildIndex >= 0) userBalance.splice(guildIndex, 1);
                guildBalance.cash = amount;
                userBalance.push(guildBalance);
                guildIndex = userBalance.indexOf(guildBalance);
                client.economy.set(guildMember.id, userBalance);
                try{
                    await client.economy.save('economy');
                    this.cash = amount;
                    resolve(this);
                } catch(err) {
                    reject(err);
                }
            });
        };
    }
}

module.exports = EconomyBalance;
