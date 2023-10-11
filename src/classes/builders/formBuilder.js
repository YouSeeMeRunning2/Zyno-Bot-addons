const InputBuilder = require('./inputBuilder.js');

class FormBuilder{
    constructor(data){
        if(typeof data === 'object' && !Array.isArray(data) && data !== null){
            this.title = typeof data.title === 'string' ? data.title : null;
            this.custom_id = typeof data.custom_id === 'string' ? data.custom_id : null;
            this.inputs.push(...Array.isArray(data.inputs) ? data.inputs : []);
            this.inputs.push(...Array.isArray(data.components) ? data.components : []);
        }
    }
    setTitle(title){
        if(typeof title !== 'string') throw new Error(`Title of the form builder must be a type of string`);
        if(title.length < 0 || title.length > 45) throw new Error(`The length of the title of the form builder must be between 1-45 characters`);
        this.title = title;
        return this;
    }
    setCustomId(customId){
        if(typeof customId !== 'string') throw new Error(`The custom id must be a type of string`);
        if(customId.length > 100 || customId.length < 1) throw new Error(`The custom id must be between 1-100 characters`);
        this.custom_id = customId;
        return this;
    }
    addComponents(...components){
        if(components.length === 0) throw new Error(`Components must include at least one component`);
        for(var i = 0; i < components.length; i++){
            var component = components[i];
            if(component instanceof InputBuilder){
                this.components.push(component.toJSON());
            } else if(Array.isArray(component)){
                for(var z = 0; z < component.length; z++){
                    var _component = component[z];
                    if(_component instanceof InputBuilder){
                        this.inputs.push(_component.toJSON());
                    }
                }
            }
        }
        return this;
    }
    addInputs(...inputs){
        return this.addComponents(...inputs);
    }
    toJSON(){
        return {
            title: this.title,
            custom_id: this.custom_id,
            components: this.inputs
        }
    }
    title = null;
    inputs = [];
    custom_id = null;
    get components(){
        return this.inputs;
    }
}

module.exports = FormBuilder;
