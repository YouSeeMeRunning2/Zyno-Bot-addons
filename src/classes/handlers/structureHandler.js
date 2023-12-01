const Member = require('../structures/member.js');
const Save = require('../save.js');
const TextChannel = require('../structures/channel/textChannel.js');
const CategoryChannel = require('../structures/channel/categoryChannel.js');
const VoiceChannel = require('../structures/channel/voiceChannel.js');
const StageChannel = require('../structures/channel/stageChannel.js');
const ForumChannel = require('../structures/channel/forumChannel.js');
const DirectoryChannel = require('../structures/channel/directoryChannel.js');
const BanEntry = require('../structures/entries/ban.js');
const KickEntry = require('../structures/entries/kick.js');
const MuteEntry = require('../structures/entries/mute.js');
const BaseEntry = require('../structures/entries/base.js');
const Message = require('../structures/message.js');
const Guild = require('../structures/guild.js');
const Emoji = require('../structures/emoji.js');
const Role = require('../structures/role.js');
const User = require('../structures/user.js');
const Reaction = require('../structures/reaction.js');
const Invite = require('../structures/invite.js');
const ButtonInteraction =  require('../structures/interactions/buttonInteraction.js');
const MenuInteraction = require('../structures/interactions/menuInteraction.js');
const FormInteraction = require('../structures/interactions/formInteraction.js');
const Mentions = require('../structures/mentions.js');
const VoiceState = require('../structures/voiceState.js');

const structures = {
    Member: Member,
    Save: Save,
    TextChannel: TextChannel,
    CategoryChannel: CategoryChannel,
    VoiceChannel: VoiceChannel,
    StageChannel: StageChannel,
    ForumChannel: ForumChannel,
    DirectoryChannel: DirectoryChannel,
    BanEntry: BanEntry,
    KickEntry: KickEntry,
    MuteEntry: MuteEntry,
    BaseEntry: BaseEntry,
    Message: Message,
    Guild: Guild,
    Role: Role,
    Emoji: Emoji,
    User: User,
    Reaction: Reaction,
    Invite: Invite,
    ButtonInteraction: ButtonInteraction,
    MenuInteraction: MenuInteraction,
    FormInteraction: FormInteraction,
    Mentions: Mentions,
    VoiceState: VoiceState
}

class StructureHandler{
    constructor(){}

    createStructure(name, args){
        if(!structures[name]) return;
        let _arguments = [...(args || [])];
        if(name !== 'Save') _arguments.push(this, true);
        const structure = new structures[name](..._arguments);
        return structure;
    }
}

const structureHandler = new StructureHandler();

module.exports = structureHandler;
