const Emoji = require('../structures/emoji.js');
const { ButtonStyle } = require('discord.js');
const { validateURL, validateEmote } = require('../../utils/functions.js');

class ButtonBuilder{
    constructor(data){
        if(typeof data === 'object' && !Array.isArray(data) && data !== null){
            this.data = {...this.data, ...data};
        }
    }
    setCustomId(customId){
        if(typeof customId !== 'string') throw new Error(`The custom id must be a type of string`);
        if(customId.length > 100) throw new Error(`The custom id may not be longer than 100 characters`);
        this.data.custom_id = customId;
        return this;
    }
    setDisabled(disabled = true){
        this.data.disabled = !!disabled;
        return this;
    }
    setLabel(label){
        if(typeof label !== 'string') throw new Error(`The label must be a type of string`);
        if(label.length > 80) throw new Error(`The label may not be longer than 80 characters`);
        this.data.label = label;
        return this;
    }
    setText(...args){
        return this.setLabel(...args);
    }
    setStyle(style){
        if(typeof this.data.url === 'string') return this;
        if(typeof style !== 'string' && typeof style !== 'number') throw new Error(`The style must be a string or a number`);
        const allowedNumberTypes = Object.values(ButtonStyle);
        const allowedStringTypes = ['primary', 'danger', 'secondary', 'success', 'blurple', 'gray', 'grey', 'red', 'green'];
        if(typeof style === 'number' && allowedNumberTypes.indexOf(style) < 0) throw new Error(`The style number must be one of the options ${allowedNumberTypes.join(', ')}`);
        else if(typeof style === 'string'){
            if(allowedStringTypes.indexOf(style.toLowerCase()) < 0) throw new Error(`The style string must be one of the options ${allowedStringTypes.join(', ')}`);
            style = style.toLowerCase();
            if(style === 'primary' || style === 'blurple'){
                this.data.style = ButtonStyle.Primary;
            } else if(style === 'secondary' || style === 'gray' || style === 'grey'){
                this.data.style = ButtonStyle.Secondary;
            } else if(style === 'danger' || style === 'red'){
                this.data.style = ButtonStyle.Danger;
            } else if(style === 'success' || style === 'green'){
                this.data.style = ButtonStyle.Success;
            }
        } else if(typeof style === 'number'){
            this.data.style = style;
        }
        return this;
    }
    setURL(url){
        if(typeof url !== 'string') throw new Error(`The url must be a type of string`);
        if(!validateURL(url)) throw new Error(`The url must be a valid url`);
        this.data.style = ButtonStyle.Link;
        this.data.url = url;
        return this;
    }
    setEmoji(emoji){
        if(typeof emoji !== 'string' && !(emoji instanceof Emoji)) throw new Error(`The emoji must be a type of string or instance of the Emoji class`);
        if(validateEmote(emoji)){
            this.data.emoji = {
                animated: false,
                id: null,
                name: emoji
            };
        } else if(emoji instanceof Emoji){
            this.data.emoji = {
                animated: emoji.animated,
                id: emoji.id,
                name: emoji.name
            };
        } else throw new Error(`The emoji must be a unicode emoji or an instance of Emoji class`);
        return this;
    }
    toJSON(){
        return this.data;
    }
    data = {
        custom_id: 'somecustomid',
        style: ButtonStyle.Primary,
        label: 'Zyno Bot addon button',
        emoji: null,
        disabled: false,
        url: null,
        type: 2
    };
}

module.exports = ButtonBuilder;
