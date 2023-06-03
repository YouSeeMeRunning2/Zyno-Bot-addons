const SelectMenuOptionBuilder = require('./selectMenuOptionBuilder.js');

function checkValue(...args){
    let res = [];
    for(var i = 0; i < args.length; i++){
        let arg = args[i];
        if(Array.isArray(arg)){
            res.push(...checkValue(...arg));
        } else {
            res.push(arg);
        }
    }
    return res;
}

class SelectMenuBuilder{
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
    setPlaceholder(placeholder){
        if(typeof placeholder !== 'string') throw new Error(`The placeholder must be a type of string`);
        if(placeholder.length > 150) throw new Error(`The placeholder may not be longer than 150 characters`);
        this.data.placeholder = placeholder;
        return this;
    }
    setDisabled(disabled = true){
        this.data.disabled = !!disabled;
        return this;
    }
    setMinValues(value){
        if(typeof value !== 'number') throw new Error(`The minimum values must be a type of number`);
        value = (value < 0 ? 0 : (value > 25 ? 25 : value));
        this.data.min_values = value;
        return this;
    }
    setMaxValues(value){
        if(typeof value !== 'number') throw new Error(`The maximum values must be a type of number`);
        value = (value < 1 ? 1 : (value > 25 ? 25 : value));
        this.data.max_values = value;
        return this;
    }
    setOptions(...options){
        options = checkValue(...options);
        if(options.length === 0) throw new Error(`A minimum of one option must be set`);
        if(options.filter(a => !(a instanceof SelectMenuOptionBuilder)).length > 0) throw new Error(`All arguments or array items must be an instance of SelectMenuOptionBuilder`);
        this.data.options.push(...options.reduce((arr, item) => {
            arr.push(item.toJSON());
            return arr;
        }, []));
        return this;
    }
    toJSON(){
        return this.data;
    }
    data = {
        custom_id: 'somecustomid',
        options: [],
        placeholder: null,
        min_values: 1,
        max_values: 1,
        disabled: false,
        type: 3
    }
}

module.exports = SelectMenuBuilder;
