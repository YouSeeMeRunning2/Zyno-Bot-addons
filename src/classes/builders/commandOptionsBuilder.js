const CommandOptionChoiceBuilder = require('./commandOptionChoiceBuilder.js');
const numberTypes = require('../../utils/numberTypes.js');

class CommandOptionsBuilder{
    constructor(data = {}){
        if(typeof data !== 'object' || Array.isArray(data)) throw new Error(`Invalid command: Invalid data type provided in the command option builder`);
        for(var key in data){
            this[key] = data[key];
        }
    }
    setOptionType(type){
        if(typeof type !== 'number') throw new Error(`Invalid command: Option type is not a number`);
        if(type < 1 || type > 11) throw new Error(`Invalid command: Type number is out of range`);
        this.type = type;
        return this;
    }
    setName(name){
        if(typeof name !== 'string') throw new Error(`Invalid command: Command name must be a string`);
        if(!/^([a-z-]{1,32})$/.test(name)) throw new Error(`Invalid command: Command name must match the following regex: /^([a-zA-Z-]{1,32})$/`);
        this.name = name;
        return this;
    }
    setDescription(description){
        if(typeof description !== 'string') throw new Error(`Invalid command: Command description must be a string`);
        if(description.length === 0 || description > 100) throw new Error(`Invalid command: Command description must be between 1-100 characters`);
        this.description = description;
        return this;
    }
    setRequired(boolean = true){
        if(boolean === true){
            this.required = true;
        } else if(boolean === false){
            this.required = false;
        } else {
            this.required = true;
        }
        return this;
    }
    addChoices(...choices){
        for(var i = 0; i < choices.length; i++){
            if(Array.isArray(choices[i])){
                for(var z = 0; z < choices[i].length; z++){
                    var choice = choices[i][z];
                    if(!(choice instanceof CommandOptionChoiceBuilder)) throw new Error(`Invalid command: Command option choice is not instance of CommandOptionChoiceBuilder class`);
                    var choiceJSON = choice.toJSON();
                    if(typeof choiceJSON.name !== 'string') throw new Error(`Invalid command: Command option choice name is not a string`);
                    if(typeof choiceJSON.value === 'undefined') throw new Error(`Invalid command: Can not read type of command option choice value of undefined`);
                    this.choices.push(choiceJSON);
                }
            } else {
                var choice = choices[i];
                if(!(choice instanceof CommandOptionChoiceBuilder)) throw new Error(`Invalid command: Command option choice is not instance of CommandOptionChoiceBuilder class`);
                var choiceJSON = choice.toJSON();
                if(typeof choiceJSON.name !== 'string') throw new Error(`Invalid command: Command option choice name is not a string`);
                if(typeof choiceJSON.value === 'undefined') throw new Error(`Invalid command: Can not read type of command option choice value of undefined`);
                this.choices.push(choiceJSON);
            }
        }
        return this;
    }
    addOptions(...options){
        for(var i = 0; i < options.length; i++){
            if(Array.isArray(options[i])){
                for(var z = 0; z < options[i].length; z++){
                    var option = options[i][z];
                    if(!(option instanceof CommandOptionsBuilder)) throw new Error(`Invalid command: Command option is not instance of CommandOptionsBuilder class`);
                    var optionJSON = option.toJSON();
                    if(typeof optionJSON.name !== 'string') throw new Error(`Invalid command: Command option name is not a string`);
                    this.options.push(optionJSON);
                }
            } else {
                var option = options[i];
                if(!(option instanceof CommandOptionsBuilder)) throw new Error(`Invalid command: Command option is not instance of CommandOptionsBuilder class`);
                var optionJSON = option.toJSON();
                if(typeof optionJSON.name !== 'string') throw new Error(`Invalid command: Command option name is not a string`);
                this.options.push(optionJSON);
            }
        }
        return this;
    }
    addChannelTypes(...channelTypes){
        for(var i = 0; i < channelTypes.length; i++){
            if(Array.isArray(channelTypes[i])){
                for(var z = 0; z < channelTypes[i].length; z++){
                    var channelType = channelTypes[i][z];
                    if(typeof channelType !== 'number') throw new Error(`Invalid command: Command option channel type must be a number`);
                    if(Object.values(numberTypes.ChannelTypes).indexOf(channelType) < 0) throw new Error(`Invalid command: Command option channel type is out of range`);
                    if(this.channelTypes.indexOf(channelType) < 0){
                        this.channelTypes.push(channelType);
                    }
                }
            } else {
                var channelType = channelTypes[i];
                if(typeof channelType !== 'number') throw new Error(`Invalid command: Command option channel type must be a number`);
                if(Object.values(numberTypes.ChannelTypes).indexOf(channelType) < 0) throw new Error(`Invalid command: Command option channel type is out of range`);
                if(this.channelTypes.indexOf(channelType) < 0){
                    this.channelTypes.push(channelType);
                }
            }
        }
        return this;
    }
    setMinValue(min){
        if(typeof min !== 'number') throw new Error(`Invalid command: Command option min value must be a number`);
        this.minValue = min;
        return this;
    }
    setMaxValue(max){
        if(typeof max !== 'number') throw new Error(`Invalid command: Command option max value must be a number`);
        this.maxValue = max;
        return this;
    }
    setMinLength(length){
        if(typeof length !== 'number') throw new Error(`Invalid command: Command option min length must be a number`);
        this.minLength = length;
        return this;
    }
    setMaxLength(length){
        if(typeof length !== 'number') throw new Error(`Invalid command: Command option max length must be a number`);
        this.maxLength = length;
        return this;
    }
    toJSON(){
        var optionObj = {
            name: this.name,
            description: this.description,
            choices: this.choices,
            options: this.options,
            options: this.options,
            channel_types: this.channelTypes,
            type: this.type
        };
        if(typeof this.minValue !== 'undefined'){
            optionObj['min_value'] = this.minValue;
        }
        if(typeof this.maxValue !== 'undefined'){
            optionObj['max_value'] = this.maxValue;
        }
        if(typeof this.minLength !== 'undefined'){
            optionObj['min_length'] = this.minLength;
        }
        if(typeof this.maxLength !== 'undefined'){
            optionObj['max_length'] = this.maxLength;
        }
        if([numberTypes.CommandOptionTypes.SUB_COMMAND, numberTypes.CommandOptionTypes.SUB_COMMAND_GROUP].indexOf(this.type) < 0){
            optionObj['required'] = this.required;
        }
        return optionObj;
    }
    name = null;
    description = null;
    required = true;
    choices = [];
    options = [];
    channelTypes = [];
    type = 3;
    minValue = undefined;
    maxValue = undefined;
    minLength = undefined;
    maxLength = undefined;
}

module.exports = CommandOptionsBuilder;
