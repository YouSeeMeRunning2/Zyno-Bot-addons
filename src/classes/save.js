const { ValueSaver } = require('valuesaver');

class Save extends Map{
	constructor(data){
        super();
        data = typeof data !== 'undefined' ? data : [];
        if(data instanceof ValueSaver){
            let dataArray = data.toReadableArray();
            for(var i = 0; i < dataArray.length; i++){
                let obj = dataArray[i];
                this.set(obj.key, obj.value);
            }
        } else if(data instanceof Map){
            let keys = Array.from(data.keys());
            let values = Array.from(data.values());
            for(var i = 0; i < keys.length; i++){
                this.set(keys[i], values[i]);
            }
        } else if(Array.isArray(data)){
            let dataFilter = data.filter(d => {
                if(typeof d === 'object'){
                    let keys = Object.keys(d);
                    return keys.indexOf('key') >= 0 && keys.indexOf('value') >= 0 && typeof d.key === 'string';
                } else {
                    return false;
                }
            });
            if(dataFilter.length !== data.length) return;
            for(var i = 0; i < data.length; i++){
                let obj = data[i];
                this.set(obj.key, obj.value);
            }
        } else if(typeof data === 'object' && data !== null){
            for(var key in data){
				this.set(key, data[key]);
            }
        }
    }
    first(){
        let values = Array.from(this.values());
        return values[0];
    }
    last(){
        let values = Array.from(this.values());
        return values[values.length - 1];
    }
    firstKey(){
        let keys = Array.from(this.keys());
        return keys[0];
    }
    lastKey(){
        let keys = Array.from(this.keys());
        return keys[keys.length - 1];
    }
    toObject(){
        let keys = Array.from(this.keys());
        let values = Array.from(this.values());
        let obj = {};
        for(var i = 0; i < keys.length; i++){
            obj[keys[i]] = values[i];
        }
        return obj;
    }
    toArray(){
        let keys = Array.from(this.keys());
        let values = Array.from(this.values());
        let arr = [];
        for(var i = 0; i < keys.length; i++){
            let obj = {};
            obj[keys[i]] = values[i];
            arr.push(obj);
        }
        return arr;
    }
    toReadableArray(){
        let keys = Array.from(this.keys());
        let values = Array.from(this.values());
        let arr = [];
        for(var i = 0; i < keys.length; i++){
            let obj = {};
            obj['key'] = keys[i];
            obj['value'] = values[i];
            arr.push(obj);
        }
        return arr;
    }
    has(key){
        return typeof this.get(key) !== 'undefined';
    }
    filter(_f){
        const readableArray = this.toReadableArray();
        const getFilter = readableArray.filter(_f);
        return new Save(getFilter);
    }
}

module.exports = Save;
