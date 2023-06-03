const { validatePermission, getAddonPermission, getClient, validateURL } = require('../../utils/functions.js');
const scopes = require('../../bitfields/scopes.js');
const request = require('../../utils/request.js');
const { ActivityType } = require('discord.js');
const path = require('path');
const fs = require('fs/promises');
const { existsSync } = require('fs');

let client, presenceTimeout = undefined, presenceOptions = {}, presenceFunctions = [], editTimeout = undefined, editOptions = {}, editFunctions = [];
function updatePresence(){
    if(presenceTimeout !== undefined){
        clearTimeout(presenceTimeout);
        presenceTimeout = undefined;
    }
    presenceTimeout = setTimeout(async function(_options){
        clearInterval(client.presenceUpdate);
        try{
            await client.user.setPresence(_options);
            client.presenceUpdate = setInterval(function(_o){
                client.user.setPresence(_o).catch(err => {});
            }, 2*60*60*1000, _options);
            for(var i = 0; i < presenceFunctions.length; i++){
                let _function = presenceFunctions[i];
                _function.resolve();
            }
        } catch(err) {
            for(var i = 0; i < presenceFunctions.length; i++){
                let _function = presenceFunctions[i];
                _function.reject(err);
            }
        }
        presenceFunctions = [];
        presenceTimeout = undefined;
        presenceOptions = {};
    }, 2e3, presenceOptions);
}

function updateUser(){
    if(editTimeout !== undefined){
        clearTimeout(editTimeout);
        editTimeout = undefined;
    }
    editTimeout = setTimeout(async function(_options){
        try{
            await client.user.edit(_options);
            for(var i = 0; i < editFunctions.length; i++){
                let _function = editFunctions[i];
                _function.resolve();
            }
        } catch(err) {
            for(var i = 0; i < editFunctions.length; i++){
                let _function = editFunctions[i];
                _function.reject(err);
            }
        }
        editFunctions = [];
        editTimeout = undefined;
        editOptions = {};
    }, 2e3, editOptions);
}

class Bot{
    constructor(addon){
        client = getClient();
        this.setActivity = function(activity){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.BOT)) return reject(`Missing bot scope in bitfield`);
                if(typeof activity !== 'string') return reject(`Activity must be a type of string`);
                let activityOptions = presenceOptions['activities'] || [{}];
                activityOptions[0]['name'] = activity;
                presenceOptions['activities'] = activityOptions;
                presenceFunctions.push({resolve: resolve, reject: reject});
                updatePresence();
            });
        }
        this.setActivityType = function(activityType){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.BOT)) return reject(`Missing bot scope in bitfield`);
                if(typeof activityType !== 'string') return reject(`Status type must be a type of string`);
                let activityOptions = presenceOptions['activities'] || [{}];
                switch(activityType.toLowerCase()){
                    case 'competing':
                        activityOptions[0]['type'] = ActivityType.Competing;
                        break;
                    case 'listening':
                        activityOptions[0]['type'] = ActivityType.Listening;
                        break;
                    case 'playing':
                        activityOptions[0]['type'] = ActivityType.Playing;
                        break;
                    case 'streaming':
                        activityOptions[0]['type'] = ActivityType.Streaming;
                        break;
                    case 'watching':
                        activityOptions[0]['type'] = ActivityType.Watching;
                    break;
                    default:
                        return reject(`Invalid activity type, activity type must be one of options competing, listening, playing, streaming, watching`);
                    break;
                }
                presenceOptions['activities'] = activityOptions;
                presenceFunctions.push({resolve: resolve, reject: reject});
                updatePresence();
            });
        }
        this.setStreamingURL = function(streamURL){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.BOT)) return reject(`Missing bot scope in bitfield`);
                if(typeof streamURL !== 'string') return reject(`Status type must be a type of string`);
                const parsed = validateURL(streamURL);
                if(!parsed) return reject(`Invalid url for streaming activity`);
                if(['youtube.com', 'twitch.com'].indexOf(parsed.hostname.toLowerCase()) < 0) return reject(`The stream url must be a YouTube or Twitch url`);
                let activityOptions = presenceOptions['activities'] || [{}];
                activityOptions[0]['url'] = streamURL;
                presenceOptions['activities'] = activityOptions;
                presenceFunctions.push({resolve: resolve, reject: reject});
                updatePresence();
            });
        }
        this.setStatusType = function(statusType){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.BOT)) return reject(`Missing bot scope in bitfield`);
                if(typeof statusType !== 'string') return reject(`Status type must be a type of string`);
                let statusTypes = ['online', 'idle', 'dnd', 'invisible'];
                if(statusTypes.indexOf(statusType.toLowerCase()) < 0) return reject(`Status type must be one of options ${statusTypes.join(', ')}`);
                presenceOptions['status'] = statusType.toLowerCase();
                presenceFunctions.push({resolve: resolve, reject: reject});
                updatePresence();
            });
        }
        this.setUsername = function(username){
            return new Promise((resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.BOT)) return reject(`Missing bot scope in bitfield`);
                if(typeof username !== 'string') return reject(`Username must be a type of string`);
                if(username.length < 2 || username.length > 32) return reject(`The username must be at least 2 characters long and may max be 32 characters long`)
                editOptions['username'] = username;
                editFunctions.push({resolve: resolve, reject: reject});
                updateUser();
            });
        }
        this.setAvatar = function(avatar){
            return new Promise(async (resolve, reject) => {
                if(!validatePermission(getAddonPermission(addon.name), scopes.bitfield.BOT)) return reject(`Missing bot scope in bitfield`);
                if(typeof avatar !== 'string' && !(avatar instanceof Buffer)) return reject(`Avatar must be a type of string or instance of Buffer`);
                if(typeof avatar === 'string'){
                    const parsed = validateURL(avatar);
                    if(!parsed){
                        let avatarPath = avatar;
                        if(!existsSync(avatarPath)){
                            avatarPath = path.join(process.cwd(), avatarPath);
                            if(!existsSync(avatarPath)) return reject(`Invalid path to avatar image`);
                        }
                        let extension = avatarPath.split('.');
                        extension = extension[extension.length - 1];
                        if(['png', 'jpeg'].indexOf(extension.toLowerCase()) < 0) return reject(`The avatar image must be a png or jpeg image`);
                        let buffer;
                        try{
                            buffer = await fs.readFile(avatarPath);
                        } catch (err){
                            return reject(`Error while reading file: ${err}`);
                        }
                        buffer = Buffer.from(buffer);
                        editOptions['avatar'] = buffer;
                    } else {
                        let res;
                        try{
                            res = await request(parsed.toString(), 'GET', undefined, 'buffer', {});
                        } catch (err){
                            return reject(`Error while downloading new avatar image: `)
                        }
                        if(!(res.headers['content-type'] || '').toLowerCase().startsWith('image/png') && !(res.headers['content-type'] || '').toLowerCase().startsWith('image/jpeg')) return reject(`The avatar image must be a png or jpeg image`);
                        editOptions['avatar'] = res.data;
                    }
                } else {
                    editOptions['avatar'] = buffer;
                }
                editFunctions.push({resolve: resolve, reject: reject});
                updateUser();
            });
        }
    }
    get username(){
        return client.user.username;
    }
    get avatarURL(){
        return client.user.displayAvatarURL({size: 256});
    }
    get tag(){
        return client.user.tag;
    }
    get id(){
        return client.user.id;
    }
    get created(){
        return new Date(client.user.createdTimestamp);
    }
    get createdTimestamp(){
        return client.user.createdTimestamp;
    }
}

module.exports = Bot;
