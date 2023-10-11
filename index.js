const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const numberTypes = require('./src/utils/numberTypes.js');

module.exports = {
    bitfield: require('./src/bitfields/scopes.js').bitfield,
    Addon: require('./src/classes/addon.js'),
    CommandBuilder: require('./src/classes/builders/commandBuilder.js'),
    CommandOptionsBuilder: require('./src/classes/builders/commandOptionsBuilder.js'),
    CommandOptionChoiceBuilder: require('./src/classes/builders/commandOptionChoiceBuilder.js'),
    createBitfield: require('./src/utils/functions.js').createBitfield,
    permissionsBitfield: PermissionFlagsBits,
    ...numberTypes,
    Embed: EmbedBuilder,
    ButtonBuilder: require('./src/classes/builders/buttonBuilder.js'),
    SelectMenuBuilder: require('./src/classes/builders/selectMenuBuilder.js'),
    SelectMenuOptionBuilder: require('./src/classes/builders/selectMenuOptionBuilder.js'),
    FormBuilder: require('./src/classes/builders/formBuilder.js'),
    InputBuilder: require('./src/classes/builders/inputBuilder.js'),
    ActionRowBuilder: require('./src/classes/builders/actionRowBuilder.js')
}
