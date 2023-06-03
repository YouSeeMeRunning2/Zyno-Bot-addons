const ButtonBuilder = require('./buttonBuilder.js');
const SelectMenuBuilder = require('./selectMenuBuilder.js');
const DiscordJS = require('discord.js');

class ActionRowBuilder{
    constructor(...args){
        for(var i = 0; i < args.length; i++){
            let arg = args[i];
            if(arg instanceof ButtonBuilder){
                if(typeof arg.data.style !== 'number') throw new Error(`A style must be set for the button`);
                this.components.push(new DiscordJS.ButtonBuilder(arg.toJSON()));
            } else if(arg instanceof SelectMenuBuilder){
                if(typeof arg.data.custom_id !== 'string') throw new Error(`A custom id must be set for the menu`);
                this.components.push(new DiscordJS.StringSelectMenuBuilder(arg.toJSON()));
            }
        }
    }
    addComponents(...args){
        for(var i = 0; i < args.length; i++){
            let arg = args[i];
            if(arg instanceof ButtonBuilder){
                if(typeof arg.data.style !== 'number') throw new Error(`A style must be set for the button`);
                this.components.push(new DiscordJS.ButtonBuilder(arg.toJSON()));
            } else if(arg instanceof SelectMenuBuilder){
                if(typeof arg.data.custom_id !== 'string') throw new Error(`A custom id must be set for the menu`);
                this.components.push(new DiscordJS.StringSelectMenuBuilder(arg.toJSON()));
            }
            return this;
        }
    }
    components = [];
};

module.exports = ActionRowBuilder;
