const DiscordJS = require('discord.js');
const ActionRowBuilder = require('../classes/builders/actionRowBuilder.js');
const ButtonBuilder = require('../classes/builders/buttonBuilder.js');
const SelectMenuBuilder = require('../classes/builders/selectMenuBuilder.js');

function getMessageContent(content){
    let _content = {content: '', embeds: [], files: [], components: []};
    for(var i = 0; i < content.length; i++){
        let objPart = content[i];
        if(typeof objPart === 'string'){
            _content['content'] += objPart;
        } else if(objPart instanceof DiscordJS.EmbedBuilder){
            _content['embeds'].push(objPart);
        } else if(objPart instanceof ActionRowBuilder){
            _content['components'].push(new DiscordJS.ActionRowBuilder({components: objPart.components}));
        } else if(objPart instanceof ButtonBuilder || objPart instanceof SelectMenuBuilder){
            _content['components'].push(new DiscordJS.ActionRowBuilder({components: (new ActionRowBuilder(objPart)).components}));
        } else if(typeof objPart === 'object' && !Array.isArray(objPart) && objPart !== null){
            _content = {..._content, ...objPart};
        }
    }
    return _content;
}

module.exports = { getMessageContent };
