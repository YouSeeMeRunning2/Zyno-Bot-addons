const Emoji = require('../structures/emoji.js');
const { validateEmote } = require('../../utils/functions.js');

class SelectMenuOptionBuilder{
    constructor(data){
        if(typeof data === 'object' && !Array.isArray(data) && data !== null){
            this.data = data;
        }
    }
    setValue(value){
        if(typeof value !== 'string') throw new Error(`The value must be a type of string`);
        if(value.length > 100) throw new Error(`The value may not be longer than 100 characters`);
        this.data.value = value;
        return this;
    }
    setCustomId(id){
        return this.setValue(id);
    }
    setLabel(label){
        if(typeof label !== 'string') throw new Error(`The label must be a type of string`);
        if(label.length > 100) throw new Error(`The label may not be longer than 100 characters`);
        this.data.label = label;
        return this;
    }
    setText(text){
        return this.setLabel(text);
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
    setDefault(defaultOption = true){
        this.data.default = !!defaultOption;
        return this;
    }
    setDescription(description){
        if(typeof description !== 'string') throw new Error(`The description must be a type of string`);
        if(description.length > 100) throw new Error(`The description may not be longer than 100 characters`);
        this.data.description = description;
        return this;
    }
    toJSON(){
        return this.data;
    }
    data = {
        label: null,
        value: null,
        description: null,
        emoji: null,
        default: false
    }
}

module.exports = SelectMenuOptionBuilder;
