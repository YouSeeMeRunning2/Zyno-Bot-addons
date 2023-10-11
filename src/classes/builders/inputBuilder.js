const { TextInputStyle } = require('discord.js');

class InputBuilder{
    constructor(data){
        if(typeof data === 'object' && !Array.isArray(data) && data !== null){
            this.custom_id = typeof data.custom_id === 'string' ? data.custom_id : this.custom_id;
            this.min_length = typeof data.min_length === 'number' ? data.min_length : this.min_length;
            this.max_length = typeof data.max_length === 'number' ? data.max_length : this.max_length;
            this.label = typeof data.label === 'string' ? data.label : this.label;
            this.placeholder = typeof data.placeholder === 'string' ? data.placeholder : this.placeholder;
            this.required = typeof data.required === 'boolean' ? data.required : this.required;
            this.value = typeof data.value === 'string' ? data.value : this.value;
            this.custom_id = typeof data.custom_id === 'string' ? data.custom_id : this.custom_id;
            if(typeof data.style === 'number'){
                if(data.style === 1 || data.style === 2){
                    this.style = data.style;
                }
            } else if(typeof data.style === 'string'){
                switch(data.style.toLowerCase()){
                    case 'short':
                        this.style = TextInputStyle.Short;
                        break;
                    case 'paragraph':
                        this.style = TextInputStyle.Paragraph;
                        break;
                }
            }
        }
    }
    setLabel(label){
        if(typeof label !== 'string') throw new Error(`Label of the input builder must be a type of string`);
        if(label.length < 0 || label.length > 45) throw new Error(`The length of the label of the input builder must be between 1-45 characters`);
        this.label = label;
        return this;
    }
    setValue(value){
        if(typeof value !== 'string') throw new Error(`Value of the input builder must be a type of string`);
        if(value.length < 0 || value.length > 4000) throw new Error(`The length of the standard value of the input builder must be between 1-4000 characters`);
        this.value = value;
        return this;
    }
    setMinLength(minLength){
        if(typeof minLength !== 'number') throw new Error(`Min length of the input builder must be a type of number`);
        if(minLength > 4000 || minLength < 0) throw new Error(`The number of the min length of the input builder must be between 0-4000`);
        this.min_length = minLength;
        return this;
    }
    setMaxLength(maxLength){
        if(typeof maxLength !== 'number') throw new Error(`Max length of the input builder must be a type of number`);
        if(maxLength > 4000 || maxLength < 1) throw new Error(`The number of the max length of the input builder must be between 1-4000`);
        this.max_length = maxLength;
        return this;
    }
    setCustomId(customId){
        if(typeof customId !== 'string') throw new Error(`The custom id must be a type of string`);
        if(customId.length > 100 || customId.length < 1) throw new Error(`The custom id must be between 1-100 characters`);
        this.custom_id = customId;
        return this;
    }
    setPlaceholder(placeholder){
        if(typeof placeholder !== 'string') throw new Error(`The placeholder must be a type of string`);
        if(placeholder.length > 100 || placeholder.length < 1) throw new Error(`The placeholder must be between 1-100 characters`);
        this.placeholder = placeholder;
        return this;
    }
    setRequired(required){
        this.required = typeof required === 'boolean' ? required : !this.required;
        return this;
    }
    setStyle(style){
        if(typeof style !== 'string' && typeof style !== 'number') throw new Error(`Style of the input builder must be a type of string or a type of number`);
        if(typeof style === 'number'){
            if(style === 1 || style === 2){
                this.style = style;
            } else {
                throw new Error(`Style number out of range 1-2`);
            }
        } else if(typeof style === 'string'){
            switch(style.toLowerCase()){
                case 'short':
                    this.style = TextInputStyle.Short;
                    break;
                case 'paragraph':
                    this.style = TextInputStyle.Paragraph;
                    break;
            }
        }
        return this;
    }
    toJSON(){
        return {
            custom_id: this.custom_id,
            min_length: this.min_length,
            max_length: this.max_length,
            style: this.style,
            label: this.label,
            placeholder: this.placeholder,
            type: this.type,
            required: this.required,
            value: this.value
        }
    }
    custom_id = null;
    min_length = null;
    style = TextInputStyle.Short;
    label = null;
    placeholder = null;
    type = 4;
    max_length = null;
    required = false;
    value = null;
}

module.exports = InputBuilder;
