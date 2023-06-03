class CommandOptionChoiceBuilder{
    constructor(data = {}){
        if(typeof data !== 'object' || Array.isArray(data)) throw new Error(`Invalid command: Invalid data type provided in the command option builder`);
        for(var key in data){
            this[key] = data[key];
        }
    }
    setName(name){
        if(typeof name !== 'string') throw new Error(`Invalid command: Command option choice name must be a string`);
        if(name.length === 0 || name > 100) throw new Error(`Invalid command: Command option choice name must be between 1-100 characters`);
        this.name = name;
        return this;
    }
    setValue(value){
        if(typeof value === 'string'){
            if(value.length === 0 || value > 100) throw new Error(`Invalid command: Command option choice name must be between 1-100 characters`);
        }
        this.value = value;
        return this;
    }
    toJSON(){
        return {
            name: this.name,
            value: this.value
        };
    }
    name = null;
    value = null;
}

module.exports = CommandOptionChoiceBuilder;
