const bitfieldInfo = require('../bitfields/scopes.js');
const colors = require('./colors.json');
const types = require('./channelTypes.js');
const { addons } = require('./saves.js');

var _client;

function generateId(length = 20){
    var characters = '0123456789';
    var newId = '';
    while(newId.length < length){
        newId += characters.charAt((Math.round(Math.random() * (characters.length - 1))));
    }
    return newId;
}

function createBitfield(scopes){
    if(!Array.isArray(scopes)) throw new Error(`The scopes must be an array with scopes in it`);
    var bitfield = scopes.reduce((b, s) => {
        b += s;
        return b;
    }, 0);
    return bitfield;
}

function getPermissionsString(bitfield){
    var permissionString = [];
    if(typeof bitfield !== 'number') throw new Error(`Invalid bitfied: Bitfield is not a number`);
    var bitfieldKeys = Object.keys(bitfieldInfo.bitfield);
    var bitfieldValues = Object.values(bitfieldInfo.bitfield);
    for(var i = 0; i < bitfieldValues.length; i++){
        var bitValue = bitfieldValues[i];
        if(bitfield & bitValue){
            permissionString.push(bitfieldInfo.strings[bitfieldKeys[i]])
        }
    }
    return permissionString;
}

function validatePermission(bitfield, bitvalue){
    return bitfield & bitvalue;
}

function getResolvableDate(dateResolvable){
    var currentTimestamp = new Date().getTime();
    if(typeof dateResolvable === 'number'){
        if(dateResolvable > currentTimestamp) return dateResolvable - currentTimestamp;
        else return dateResolvable;
    } else if(typeof dateResolvable === 'string') {
        if(!/^[0-9a-zA-Z ]*$/.test(dateResolvable)) return 6e4;
        var date = /^[0-9]*/.exec(dateResolvable);
        var dateNumber = parseInt(date[0]);
        var dateType = dateResolvable.split(date[0]).slice(1).join(date[0]).split(' ').join('').toLowerCase();
        if(dateType === 'week' || dateType === 'weeks' || dateType === 'w'){
            return dateNumber*7*24*60*60*1000;
        } else if(dateType === 'day' || dateType === 'days' || dateType === 'd'){
            return dateNumber*24*60*60*1000;
        } else if(dateType === 'hour' || dateType === 'hours' || dateType === 'h'){
            return dateNumber*60*60*1000;
        } else if(dateType === 'minute' || dateType === 'minutes' || dateType === 'm'){
            return dateNumber*60*1000;
        } else if(dateType === 'second' || dateType === 'seconds' || dateType === 's'){
            return dateNumber*1000;
        } else if(dateType === 'milisecond' || dateType === 'miliseconds' || dateType === 'ms'){
            return dateNumber;
        } else {
            return 6e4;
        }
    } else {
        return 6e4;
    }
}

function getColorCode(color){
    if(!colors[color.toLowerCase()]){
        if(color.length > 7){
            return 0;
        } else {
            if(color.indexOf('#') === 0){
                var colorCode = color.slice(1);
                return parseInt(colorCode, 16);
            } else {
                return parseInt(colorCode, 16);
            }
        }
    } else {
        var colorCode = colors[color.toLowerCase()].slice(1);
        return parseInt(colorCode, 16);
    }
}

function getAddonPermission(addonName){
    return (addons.get(addonName) || {permissions: 0}).permissions;
}

function wait(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

function passClient(client){
    _client = client;
}

function getClient(){
    return _client;
}

function getChannelType(n){
    return types[n.toString()] || 'Unknown';
}

function getChannelId(channelName){
    channelName = channelName.toLowerCase();
    const channelValues = Object.values(types).map(t => t.toLowerCase());
    const channelIds = Object.keys(types).map(i => parseInt(i));
    let channelIndex = channelValues.indexOf(channelName);
    channelIndex = channelIndex >= 0 ? channelIndex : 0;
    return channelIds[channelIndex];
}

function validateURL(string){
    try {
        return new URL(string);
    } catch {
        return false;
    }
}

function getVideoQualityMode(mode){
    if(typeof mode === 'number'){
        if(mode > 2) mode = 2;
        else if(mode < 1) mode = 1;
        return mode;
    } else {
        switch(mode.toLowerCase()){
            case 'full':
                return 2;
                break;
            case 'auto':
                return 1;
                break;
            default:
                return 1;
                break;
        }
    }
}

function getRegion(region){
    if(typeof region !== 'string') return null;
    const regions = ['brazil', 'hong kong', 'india', 'japan', 'rotterdam', 'russia', 'singapore', 'south africa', 'sydney', 'us central', 'us east', 'us south', 'us west'];
    if(regions.indexOf(region.toLowerCase()) >= 0) return region.toLowerCase();
    else return null;
}

function validateEmote(emote){
    let emoteRegEx = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
    return emoteRegEx.test(emote);
}

const validateDiscordEmote = (emote) => {
    const emoteRegex = /^<:[^:\n]+:[0-9]+>$/;
    if (!emoteRegex.test(emote)) return false;
  
    const [, emoteName, emoteId] = emote.match(/^<:([^:\n]+):([0-9]+)>$/);
    
    if (emoteName.length > 32 || isNaN(emoteId)) return false;
  
    return true;
};

module.exports = {
    generateId,
    createBitfield,
    getPermissionsString,
    validatePermission,
    getResolvableDate,
    getColorCode,
    getAddonPermission,
    wait,
    passClient,
    getClient,
    getChannelType,
    getChannelId,
    validateURL,
    getVideoQualityMode,
    getRegion,
    validateEmote,
    validateDiscordEmote
};
