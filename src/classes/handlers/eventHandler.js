const Member = require('../structures/member.js');
const MemberManager = require('../managers/memberManager.js');
const GuildMemberManager = require('../managers/guildMemberManager.js');
const GuildManager = require('../managers/guildManager.js');
const { getAddonPermission, validatePermission, passClient, wait } = require('../../utils/functions.js');
const { eventListeners, addons } = require('../../utils/saves.js');
const scopes = require('../../bitfields/scopes.js');
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
const ButtonInteraction =  require('../structures/interactions/buttonInteraction.js');
const MenuInteraction = require('../structures/interactions/menuInteraction.js');
const { ChannelType, AuditLogEvent } = require('discord.js');

function createStructures(client, addons){
    return new Promise(async resolve => {
        const guilds = Object.values(client.mainguilds);
        for(var i = 0; i < guilds.length; i++){
            var guild = guilds[i];
            for(var z = 0; z < addons.length; z++){
                var addonInfo = addons[z].value;
                new Guild(guild, addonInfo.addon);
                if(addonInfo.verified === true && addonInfo.allowed === true){
                    await wait(1e3);
                    const members = Array.from(guild.members.cache.values());
                    for(var _i = 0; _i < members.length; _i++){
                        var _member = members[_i];
                        new Member(_member, addonInfo.addon);
                    }
                }
            }
        }
        resolve();
    });
}

function emitEvent(addonName, eventName, permissionBitfield, ...args){
    if(!validatePermission(getAddonPermission(addonName), permissionBitfield)) return;
    const listener = eventListeners.filter(e => e.addonName === addonName)[0];
    if(!listener) return;
    if(listener.listener.listenerCount(eventName) > 0){
        listener.listener.emit(eventName, ...args);
    }
}

function handleEvents(client, parser){
    return new Promise(async resolve => {
        passClient(client);
        let _addons = addons.toReadableArray();
        await createStructures(client, _addons);

        parser.on('voiceStateUpdate', (_oldState, _newState) => {
            if(!_newState || !_oldState) return;
            if(client.config.guilds.indexOf((_newState.member || _oldState.member).guild.id) < 0) return;
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true){
                    const oldState = new Member(_oldState.member, addonInfo.addon).voice;
                    const newState = new Member(_newState.member, addonInfo.addon).voice;
                    emitEvent(addonInfo.addon.name, 'voiceUpdate', scopes.bitfield.MEMBERS, oldState, newState);
                } else {
                    continue;
                }
            }
        });

        parser.on('memberAdd', _member => {
            if(!_member) return;
            if(client.config.guilds.indexOf(_member.guild.id) < 0) return;
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true){
                    const member = new Member(_member, addonInfo.addon);
                    emitEvent(addonInfo.addon.name, 'memberAdd', scopes.bitfield.MEMBERS, member);
                }
            }
        });

        parser.on('memberLeave', _member => {
            if(!_member) return;
            if(client.config.guilds.indexOf(_member.guild.id) < 0) return;
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true){
                    const member = new Member(_member, addonInfo.addon);

                    const addonG = GuildMemberManager.get(addonInfo.addon.name) || new Save();
                    const g = addonG.get(_member.guild.id);
                    if(g){
                        g.delete(member.id);
                        addonG.set(_member.guild.id, g);
                        GuildMemberManager.set(addonInfo.addon.name, addonG);
                    }

                    const addonMemberManager = MemberManager.get(addonInfo.addon.name) || new Save();
                    const memberInfo = addonMemberManager.get(_member.id);
                    if(memberInfo){
                        memberInfo.delete(_member.guild.id);
                        if(memberInfo.size === 0){
                            addonMemberManager.delete(member.id);
                        } else {
                            addonMemberManager.set(member.id, memberInfo);
                        }
                        MemberManager.set(addonInfo.addon.name, addonMemberManager);
                    }

                    emitEvent(addonInfo.addon.name, 'memberLeave', scopes.bitfield.MEMBERS, member);
                }
            }
        });
        
        parser.on('kick', (_member, entry) => {
            if(!_member) return;
            if(client.config.guilds.indexOf(_member.guild.id) < 0) return;
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true){

                    const addonG = GuildMemberManager.get(addonInfo.addon.name) || new Save();
                    const g = addonG.get(_member.guild.id);
                    if(g){
                        g.delete(_member.id);
                        addonG.set(guild.id, g);
                        GuildMemberManager.set(addonInfo.addon.name, addonG);
                    }

                    const addonMemberManager = MemberManager.get(addonInfo.addon.name) || new Save();
                    const memberInfo = addonMemberManager.get(_member.id);
                    if(memberInfo){
                        memberInfo.delete(guild.id);
                        if(memberInfo.size === 0){
                            addonMemberManager.delete(_member.id);
                        } else {
                            addonMemberManager.set(_member.id, memberInfo);
                        }
                        MemberManager.set(addonInfo.addon.name, addonMemberManager);
                    }

                    const addonGuildManager = GuildManager.get(addonInfo.addon.name) || new Save();
                    const guild = addonGuildManager.get(_member.guild.id);

                    const kickEntry = new KickEntry(_member.user, guild, entry, addonInfo.addon);

                    emitEvent(addonInfo.addon.name, 'memberKick', scopes.bitfield.MEMBERS, kickEntry);
                }
            }
        });

        parser.on('muteAdd', (_oldMember, _newMember, auditLog) => {
            if(!_oldMember || !_newMember) return;
            if(client.config.guilds.indexOf(_newMember.guild.id) < 0) return;
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true){
                    const oldMember = new Member(_oldMember, addonInfo.addon);
                    const newMember = new Member(_newMember, addonInfo.addon);
                    const muteEntry = new MuteEntry(auditLog, newMember, addonInfo.addon);
                    emitEvent(addonInfo.addon.name, 'memberMuteAdd', scopes.bitfield.MEMBERS, oldMember, newMember, muteEntry);
                }
            }
        });
        
        parser.on('muteRemove', (_oldMember, _newMember, auditLog) => {
            if(!_oldMember || !_newMember) return;
            if(client.config.guilds.indexOf(_newMember.guild.id) < 0) return;
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true){
                    const oldMember = new Member(_oldMember, addonInfo.addon);
                    const newMember = new Member(_newMember, addonInfo.addon);
                    const muteEntry = new MuteEntry(auditLog, newMember, addonInfo.addon);
                    emitEvent(addonInfo.addon.name, 'memberMuteRemove', scopes.bitfield.MEMBERS, oldMember, newMember, muteEntry);
                }
            }
        });

        parser.on('guildMemberUpdate', async (_oldMember, _newMember) => {
            if(!_oldMember || !_newMember) return;
            if(client.config.guilds.indexOf(_newMember.guild.id) < 0) return;
            await wait(400);
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true){
                    const oldMember = new Member(_oldMember, addonInfo.addon);
                    const newMember = new Member(_newMember, addonInfo.addon);
                    if(oldMember.nickname !== newMember.nickname){
                        _newMember.guild.fetchAuditLogs({
                            limit: 1,
                            type: AuditLogEvent.MemberUpdate,
                        }).then(logs => {
                            const log = logs.entries.first();

                            if(!log) return;
                            
                            if(log.targetId !== newMember.id) return;

                            const entry = new BaseEntry(log, newMember, addonInfo.addon);

                            emitEvent(addonInfo.addon.name, 'nicknameChange', scopes.bitfield.MEMBERS, oldMember, newMember, entry);
                        }).catch(err => {});
                    } else if(oldMember.roles.size !== newMember.roles.size){
                        _newMember.guild.fetchAuditLogs({
                            limit: 1,
                            type: AuditLogEvent.MemberRoleUpdate,
                        }).then(logs => {
                            const log = logs.entries.first();

                            if(!log) return;

                            if(log.targetId !== newMember.id) return;

                            const entry = new BaseEntry(log, newMember, newMember.guild, addonInfo.addon);

                            emitEvent(addonInfo.addon.name, 'roleChange', scopes.bitfield.MEMBERS, oldMember, newMember, entry);
                        }).catch(err => {});
                    }
                }
            }
        });

        client.on('userUpdate', async (_oldUser, _newUser) => {
            if(!_oldUser || !_newUser) return;
            await wait(400);
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true){
                    const oldUser = new User(_oldUser, addonInfo.addon, false);
                    const newUser = new User(_newUser, addonInfo.addon, false);
                    if(oldUser.username !== newUser.username){
                        emitEvent(addonInfo.addon.name, 'usernameChange', scopes.bitfield.MEMBERS, oldUser, newUser);
                    } else if(oldUser.discriminator !== newUser.discriminator){
                        emitEvent(addonInfo.addon.name, 'discriminatorChange', scopes.bitfield.MEMBERS, oldUser, newUser);
                    } else if(oldUser.avatarURL !== newUser.avatarURL){
                        emitEvent(addonInfo.addon.name, 'avatarChange', scopes.bitfield.MEMBERS, oldUser, newUser);
                    } else if(oldUser.bannerURL !== newUser.bannerURL){
                        emitEvent(addonInfo.addon.name, 'bannerChange', scopes.bitfield.MEMBERS, oldUser, newUser);
                    }
                }
            }
        });

        parser.on('ban', (ban, entry) => {
            if(!ban) return;
            if(client.config.guilds.indexOf(ban.guild.id) < 0) return;
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true){
                    const addonG = GuildMemberManager.get(addonInfo.addon.name) || new Save();
                    const g = addonG.get(ban.guild.id);
                    if(g){
                        g.delete(ban.user.id);
                        addonG.set(ban.guild.id, g);
                        GuildMemberManager.set(addonInfo.addon.name, addonG);
                    }

                    const addonMemberManager = MemberManager.get(addonInfo.addon.name) || new Save();
                    const memberInfo = addonMemberManager.get(ban.user.id);
                    if(memberInfo){
                        memberInfo.delete(ban.guild.id);
                        if(memberInfo.size === 0){
                            addonMemberManager.delete(ban.user.id);
                        } else {
                            addonMemberManager.set(ban.user.id, memberInfo);
                        }
                        MemberManager.set(addonInfo.addon.name, addonMemberManager);
                    }

                    const addonGuildManager = GuildManager.get(addonInfo.addon.name) || new Save();
                    const guild = addonGuildManager.get(ban.guild.id);

                    const banEntry = new BanEntry(ban.user, guild, entry, addonInfo.addon);

                    emitEvent(addonInfo.addon.name, 'memberBan', scopes.bitfield.MEMBERS, banEntry);
                }
            }
        });
        
        parser.on('levelUp', _member => {
            if(!_member) return;
            if(client.config.guilds.indexOf(_member.guild.id) < 0) return;
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true){
                    const member = new Member(_member, addonInfo.addon);
                    emitEvent(addonInfo.addon.name, 'levelUp', scopes.bitfield.MEMBERS, member);
                }
            }
        });
        
        parser.on('ticketClose', (_channel, transcript) => {
            if(!_channel) return;
            if(client.config.guilds.indexOf(_channel.guild.id) < 0) return;
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true){
                    let channel = undefined;

                    const addonGuildManager = GuildManager.get(addonInfo.addon.name) || new Save();
                    const guild = addonGuildManager.get(_channel.guild.id);

                    if(_channel.type === ChannelType.GuildText || _channel.type === ChannelType.GuildAnnouncement){
                        channel = new TextChannel(_channel, addonInfo.addon, guild);
                    } else if(_channel.type === ChannelType.GuildCategory){
                        channel = new CategoryChannel(_channel, addonInfo.addon, guild);
                    } else if(_channel.type === ChannelType.GuildVoice){
                        channel = new VoiceChannel(_channel, addonInfo.addon, guild);
                    } else if(_channel.type === ChannelType.GuildStageVoice){
                        channel = new StageChannel(_channel, addonInfo.addon, guild);
                    } else if(_channel.type === ChannelType.GuildForum){
                        channel = new ForumChannel(_channel, addonInfo.addon, guild);
                    } else if(_channel.type === ChannelType.GuildDirectory){
                        channel = new DirectoryChannel(_channel, addonInfo.addon, guild);
                    }
                    emitEvent(addonInfo.addon.name, 'ticketClose', scopes.bitfield.MEMBERS, channel, transcript);
                }
            }
        });

        client.on('guildMembersChunk', (_members, guild, chunk) => {
            if(!_members || !guild) return;
            if(client.config.guilds.indexOf(guild.id) < 0) return;
            const members = Array.from(_members.values());
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true){
                    const chunkedMembers = new Save();
                    for(var i = 0; i < members.length; i++){
                        var member = members[i];
                        const _member = new Member(member, addonInfo.addon);
                        chunkedMembers.set(_member.id, _member);
                        const addonG = GuildMemberManager.get(addonInfo.addon.name) || new Save();
                        const g = addonG.get(guild.id);
                        if(g){
                            g.delete(member.id);
                            addonG.set(guild.id, g);
                            GuildMemberManager.set(addonInfo.addon.name, addonG);
                        }

                        const addonMemberManager = MemberManager.get(addonInfo.addon.name) || new Save();
                        const memberInfo = addonMemberManager.get(member.id);
                        if(memberInfo){
                            memberInfo.delete(guild.id);
                            if(memberInfo.size === 0){
                                addonMemberManager.delete(member.id);
                            } else {
                                addonMemberManager.set(member.id, memberInfo);
                            }
                            MemberManager.set(addonInfo.addon.name, addonMemberManager);
                        }
                    }

                    emitEvent(addonInfo.addon.name, 'membersPrune', scopes.bitfield.MEMBERS, chunkedMembers, chunkedMembers.first().guild);
                }
            }
        });

        parser.on('messageCreate', message => {
            if(!message) return;
            if(client.config.guilds.indexOf(message.guild.id) < 0) return;
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true){
                    const msg = new Message(message, addonInfo.addon);
                    emitEvent(addonInfo.addon.name, 'message', scopes.bitfield.MESSAGES, msg);
                }
            }
        });

        parser.on('messageDelete', (_message, _executor) => {
            if(!_message) return;
            if(client.config.guilds.indexOf(_message.guild.id) < 0) return;
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true){
                    const executor = new User(_executor, addonInfo.addon, false);
                    const message = new Message(_message, addonInfo.addon);
                    emitEvent(addonInfo.addon.name, 'messageDelete', scopes.bitfield.MESSAGES, message, executor);
                }
            }
        });

        parser.on('messageUpdate', (_oldMessage, _newMessage) => {
            if(!_oldMessage || !_newMessage) return;
            if(client.config.guilds.indexOf(_newMessage.guild.id) < 0) return;
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true){
                    const oldMessage = new Message(_oldMessage, addonInfo.addon);
                    const newMessage = new Message(_newMessage, addonInfo.addon);
                    emitEvent(addonInfo.addon.name, 'messageUpdate', scopes.bitfield.MESSAGES, oldMessage, newMessage);
                }
            }
        });

        parser.on('reactionAdd', (_reaction, _user) => {
            if(!_reaction || !_user) return;
            if(client.config.guilds.indexOf(_reaction.message.guild.id) < 0) return;
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true){
                    const user = new User(_user, addonInfo.addon, false);
                    const reaction = new Reaction(_reaction, addonInfo.addon, user);
                    emitEvent(addonInfo.addon.name, 'reactionAdd', scopes.bitfield.EMOJIS, reaction);
                }
            }
        });

        client.on('messageReactionRemove', async (_reaction, _user) => {
            if(!_reaction || !_user) return;
            if(client.config.guilds.indexOf(_reaction.message.guild.id) < 0) return;
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true){
                    try{
                        await wait(400);
                        await _reaction.message.fetch();
                    } catch {}
                    const user = new User(_user, addonInfo.addon, false);
                    const reaction = new Reaction(_reaction, addonInfo.addon, user);
                    emitEvent(addonInfo.addon.name, 'reactionDelete', scopes.bitfield.EMOJIS, reaction);
                }
            }
        });

        parser.on('serverAdd', async (_guild) => {
            if(!_guild) return;
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true){
                    await createStructures(client, _addons);
                    const guild = addonInfo.addon.guilds.get(_guild.id);
                    emitEvent(addonInfo.addon.name, 'guildAdd', scopes.bitfield.GUILDS, guild);
                }
            }
        });

        parser.on('guildUpdate', async (_oldGuild, _newGuild) => {
            if(!_oldGuild || !_newGuild) return;
            if(client.config.guilds.indexOf(_newGuild.id) < 0) return;
            await wait(400);
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true){
                    _newGuild.fetchAuditLogs({
                        limit: 1,
                        type: AuditLogEvent.GuildUpdate
                    }).then(async logs => {
                        const log = logs.entries.first();

                        if(!log) return;

                        if(log.targetId !== _newGuild.id) return;

                        const oldGuild = new Guild(_oldGuild, addonInfo.addon);
                        await createStructures();
                        const newGuild = addonInfo.addon.guilds.get(_newGuild.id);
                        const entry = new BaseEntry(log, undefined, newGuild, addonInfo.addon);

                        if(oldGuild.name !== newGuild.name){
                            emitEvent(addonInfo.addon.name, 'guildNameChange', scopes.bitfield.GUILDS, oldGuild, newGuild, entry);
                        } else if(oldGuild.iconURL !== newGuild.iconURL){
                            emitEvent(addonInfo.addon.name, 'guildIconChange', scopes.bitfield.GUILDS, oldGuild, newGuild, entry);                        
                        } else if(oldGuild.description !== newGuild.description){
                            emitEvent(addonInfo.addon.name, 'guildDescriptionChange', scopes.bitfield.GUILDS, oldGuild, newGuild, entry);
                        } else if(oldGuild.ownerId !== newGuild.ownerId){
                            emitEvent(addonInfo.addon.name, 'guildOwnerChange', scopes.bitfield.GUILDS, oldGuild, newGuild, entry);
                        }
                    }).catch(err => {});
                }
            }
        });

        parser.on('serverDelete', (_oldServer) => {
            if(!_oldServer) return;
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true){
                    const oldServer = new Guild(_oldServer, addonInfo.addon);
                    const addonGuildMemberManager = GuildMemberManager.get(addonInfo.addon.name) || new Save();
                    addonGuildMemberManager.delete(_oldServer.id);
                    GuildMemberManager.set(addonInfo.addon.name, addonGuildMemberManager);
                    const addonMemberManager = MemberManager.get(addonInfo.addon.name) || new Save();
                    const members = addonMemberManager.filter(m => m instanceof Save ? typeof m.get(_oldServer.id) !== 'undefined' : false);
                    const memberIds = Array.from(members.keys());
                    for(var i = 0; i < memberIds.length; i++){
                        var memberId = memberIds[i];
                        const g = members.get(memberId);
                        g.delete(_oldServer.id);
                        addonMemberManager.set(memberId, g);
                    }
                    MemberManager.set(addonInfo.addon.name, addonMemberManager);
                    const addonGuildManager = GuildManager.get(addonInfo.addon.name) || new Save();
                    addonGuildManager.delete(_oldServer.id);
                    GuildManager.set(addonInfo.addon.name, addonGuildManager);
                    addonInfo.addon.guilds.delete(_oldServer.id);
                    emitEvent(addonInfo.addon.name, 'guildDelete', scopes.bitfield.GUILDS, oldServer);
                }
            }
        });

        client.on('emojiCreate', async (_emoji) => {
            if(!_emoji) return;
            if(client.config.guilds.indexOf(_emoji.guild.id) < 0) return;
            await wait(400);
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true){
                    _emoji.guild.fetchAuditLogs({
                        limit: 1,
                        type: AuditLogEvent.EmojiCreate,
                    }).then(logs => {
                        const log = logs.entries.first();

                        if(!log) return;
                        
                        if(log.targetId !== _emoji.id) return;

                        const guild = new Guild(_emoji.guild, addonInfo.addon);
                        const emoji = guild.emojis.filter(e => e.value.id === _emoji.id).first();

                        const entry = new BaseEntry(log, undefined, guild, addonInfo.addon);

                        emitEvent(addonInfo.addon.name, 'emojiAdd', scopes.bitfield.EMOJIS, emoji, entry);
                    }).catch(err => {});
                }
            }
        });

        client.on('emojiUpdate', async (_oldEmoji, _newEmoji) => {
            if(!_oldEmoji || !_newEmoji) return;
            if(client.config.guilds.indexOf(_newEmoji.guild.id) < 0) return;
            await wait(400);
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true){
                    _newEmoji.guild.fetchAuditLogs({
                        limit: 1,
                        type: AuditLogEvent.EmojiUpdate,
                    }).then(logs => {
                        const log = logs.entries.first();

                        if(!log) return;
                        
                        if(log.targetId !== _newEmoji.id) return;

                        const guild = new Guild(_newEmoji.guild, addonInfo.addon);
                        const emoji = guild.emojis.filter(e => e.value.id === _newEmoji.id).first();
                        const oldEmoji = new Emoji(_oldEmoji, addonInfo.addon, undefined);
                        oldEmoji.guild = guild;

                        const entry = new BaseEntry(log, undefined, guild, addonInfo.addon);

                        emitEvent(addonInfo.addon.name, 'emojiUpdate', scopes.bitfield.EMOJIS, oldEmoji, emoji, entry);
                    }).catch(err => {});
                }
            }
        });

        client.on('emojiDelete', async (_emoji) => {
            if(!_emoji) return;
            if(client.config.guilds.indexOf(_emoji.guild.id) < 0) return;
            await wait(400);
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true){
                    _emoji.guild.fetchAuditLogs({
                        limit: 1,
                        type: AuditLogEvent.EmojiDelete,
                    }).then(logs => {
                        const log = logs.entries.first();

                        if(!log) return;
                        
                        if(log.targetId !== _emoji.id) return;

                        const guild = new Guild(_emoji.guild, addonInfo.addon);
                        const oldEmoji = new Emoji(_emoji, addonInfo.addon, undefined);
                        oldEmoji.guild = guild;

                        const entry = new BaseEntry(log, undefined, guild, addonInfo.addon);

                        emitEvent(addonInfo.addon.name, 'emojiDelete', scopes.bitfield.EMOJIS, oldEmoji, entry);
                    }).catch(err => {});;
                }
            }
        });

        parser.on('channelCreate', async (_channel) => {
            if(!_channel) return;
            if(client.config.guilds.indexOf(_channel.guild.id) < 0) return;
            await wait(400);
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true){
                    _channel.guild.fetchAuditLogs({
                        limit: 1,
                        type: AuditLogEvent.ChannelCreate,
                    }).then(logs => {
                        const log = logs.entries.first();

                        if(!log) return;
                        
                        if(log.targetId !== _channel.id) return;

                        const guild = new Guild(_channel.guild, addonInfo.addon);
                        const channel = guild.channels.filter(e => e.value.id === _channel.id).first();

                        const entry = new BaseEntry(log, undefined, guild, addonInfo.addon);

                        emitEvent(addonInfo.addon.name, 'channelAdd', scopes.bitfield.CHANNELS, channel, entry);
                    }).catch(err => {});
                }
            }
        });

        client.on('channelUpdate', async (_oldChannel, _newChannel) => {
            if(!_oldChannel || !_newChannel) return;
            if(client.config.guilds.indexOf(_newChannel.guild.id) < 0) return;
            await wait(400);
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true){
                    _newChannel.guild.fetchAuditLogs({
                        limit: 1,
                        type: AuditLogEvent.ChannelUpdate,
                    }).then(logs => {
                        const log = logs.entries.first();

                        if(!log) return;
                        
                        if(log.targetId !== _newChannel.id) return;
                        
                        let newChannel;
                        const guild = new Guild(_newChannel.guild, addonInfo.addon);
                        if(_newChannel.type === ChannelType.GuildText || _newChannel.type === ChannelType.GuildAnnouncement){
                            newChannel = new TextChannel(_newChannel, addonInfo.addon, guild);
                        } else if(_newChannel.type === ChannelType.GuildCategory){
                            newChannel = new CategoryChannel(_newChannel, addonInfo.addon, guild);
                        } else if(_newChannel.type === ChannelType.GuildVoice){
                            newChannel = new VoiceChannel(_newChannel, addonInfo.addon, guild);
                        } else if(_newChannel.type === ChannelType.GuildStageVoice){
                            newChannel = new StageChannel(_newChannel, addonInfo.addon, guild);
                        } else if(_newChannel.type === ChannelType.GuildForum){
                            newChannel = new ForumChannel(_newChannel, addonInfo.addon, guild);
                        } else if(_newChannel.type === ChannelType.GuildDirectory){
                            newChannel = new DirectoryChannel(_newChannel, addonInfo.addon, guild);
                        }
                        let oldChannel;
                        if(_oldChannel.type === ChannelType.GuildText || _oldChannel.type === ChannelType.GuildAnnouncement){
                            oldChannel = new TextChannel(_oldChannel, addonInfo.addon, undefined);
                        } else if(_oldChannel.type === ChannelType.GuildCategory){
                            oldChannel = new CategoryChannel(_oldChannel, addonInfo.addon, undefined);
                        } else if(_oldChannel.type === ChannelType.GuildVoice){
                            oldChannel = new VoiceChannel(_oldChannel, addonInfo.addon, undefined);
                        } else if(_oldChannel.type === ChannelType.GuildStageVoice){
                            oldChannel = new StageChannel(_oldChannel, addonInfo.addon, undefined);
                        } else if(_oldChannel.type === ChannelType.GuildForum){
                            oldChannel = new ForumChannel(_oldChannel, addonInfo.addon, undefined);
                        } else if(_oldChannel.type === ChannelType.GuildDirectory){
                            oldChannel = new DirectoryChannel(_oldChannel, addonInfo.addon, undefined);
                        }
                        oldChannel.guild = guild;

                        const entry = new BaseEntry(log, undefined, guild, addonInfo.addon);

                        emitEvent(addonInfo.addon.name, 'channelUpdate', scopes.bitfield.CHANNELS, oldChannel, newChannel, entry);
                    }).catch(err => {});
                }
            }
        });

        parser.on('channelDelete', async (_channel) => {
            if(!_channel) return;
            if(client.config.guilds.indexOf(_channel.guild.id) < 0) return;
            await wait(400);
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true){
                    const guild = new Guild(_channel.guild, addonInfo.addon);
                    guild.channels.delete(_channel.id);
                    addonInfo.addon.channels.delete(_channel.id);
                    _channel.guild.fetchAuditLogs({
                        limit: 1,
                        type: AuditLogEvent.ChannelDelete,
                    }).then(logs => {
                        const log = logs.entries.first();

                        if(!log) return;
                        
                        if(log.targetId !== _channel.id) return;

                        let oldChannel;
                        if(_channel.type === ChannelType.GuildText || _channel.type === ChannelType.GuildAnnouncement){
                            oldChannel = new TextChannel(_channel, addonInfo.addon, undefined);
                        } else if(_channel.type === ChannelType.GuildCategory){
                            oldChannel = new CategoryChannel(_channel, addonInfo.addon, undefined);
                        } else if(_channel.type === ChannelType.GuildVoice){
                            oldChannel = new VoiceChannel(_channel, addonInfo.addon, undefined);
                        } else if(_channel.type === ChannelType.GuildStageVoice){
                            oldChannel = new StageChannel(_channel, addonInfo.addon, undefined);
                        } else if(_channel.type === ChannelType.GuildForum){
                            oldChannel = new ForumChannel(_channel, addonInfo.addon, undefined);
                        } else if(_channel.type === ChannelType.GuildDirectory){
                            oldChannel = new DirectoryChannel(_channel, addonInfo.addon, undefined);
                        }
                        oldChannel.guild = guild;

                        const entry = new BaseEntry(log, undefined, guild, addonInfo.addon);

                        emitEvent(addonInfo.addon.name, 'channelDelete', scopes.bitfield.CHANNELS, oldChannel, entry);
                    }).catch(err => {});
                }
            }
        });

        client.on('roleCreate', async (_role) => {
            if(!_role) return;
            if(client.config.guilds.indexOf(_role.guild.id) < 0) return;
            await wait(400);
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true){
                    _role.guild.fetchAuditLogs({
                        limit: 1,
                        type: AuditLogEvent.RoleCreate,
                    }).then(logs => {
                        const log = logs.entries.first();

                        if(!log) return;
                        
                        if(log.targetId !== _role.id) return;
                        
                        const guild = new Guild(_role.guild, addonInfo.addon);
                        const role = guild.roles.filter(e => e.value.id === _role.id).first();

                        const entry = new BaseEntry(log, undefined, guild, addonInfo.addon);

                        emitEvent(addonInfo.addon.name, 'roleAdd', scopes.bitfield.ROLES, role, entry);
                    }).catch(err => {});
                }
            }
        });

        client.on('roleUpdate', async (_oldRole, _newRole) => {
            if(!_oldRole || !_newRole) return;
            if(client.config.guilds.indexOf(_newRole.guild.id) < 0) return;
            await wait(400);
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true){
                    _newRole.guild.fetchAuditLogs({
                        limit: 1,
                        type: AuditLogEvent.RoleUpdate,
                    }).then(logs => {
                        const log = logs.entries.first();

                        if(!log) return;
                        
                        if(log.targetId !== _newRole.id) return;

                        const guild = new Guild(_newRole.guild, addonInfo.addon);
                        const role = guild.roles.filter(e => e.value.id === _newRole.id).first();
                        const oldRole = new Role(_oldRole, addonInfo.addon, undefined);
                        oldRole.guild = guild;

                        const entry = new BaseEntry(log, undefined, guild, addonInfo.addon);

                        emitEvent(addonInfo.addon.name, 'roleUpdate', scopes.bitfield.ROLES, oldRole, role, entry);
                    }).catch(err => {});
                }
            }
        });

        client.on('roleDelete', async (_role) => {
            if(!_role) return;
            if(client.config.guilds.indexOf(_role.guild.id) < 0) return;
            await wait(400);
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true){
                    _role.guild.fetchAuditLogs({
                        limit: 1,
                        type: AuditLogEvent.RoleDelete,
                    }).then(logs => {
                        const log = logs.entries.first();

                        if(!log) return;
                        
                        if(log.targetId !== _role.id) return;

                        const guild = new Guild(_role.guild, addonInfo.addon);
                        const oldRole = new Role(_role, addonInfo.addon, undefined);
                        oldRole.guild = guild;

                        const entry = new BaseEntry(log, undefined, guild, addonInfo.addon);

                        emitEvent(addonInfo.addon.name, 'roleDelete', scopes.bitfield.ROLES, oldRole, entry);
                    }).catch(err => {});
                }
            }
        });

        parser.on('button', (interaction) => {
            if(!interaction) return;
            if(!interaction.inGuild()) return;
            if(client.config.guilds.indexOf(interaction.guild?.id) < 0) return;
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true){
                    const buttonInteraction = new ButtonInteraction(interaction, addonInfo.addon);
                    emitEvent(addonInfo.addon.name, 'buttonClick', scopes.bitfield.INTERACTIONS, buttonInteraction);
                }
            }
        });

        parser.on('menu', (interaction) => {
            if(!interaction) return;
            if(!interaction.inGuild()) return;
            if(client.config.guilds.indexOf(interaction.guild?.id) < 0) return;
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true){
                    const menuInteraction = new MenuInteraction(interaction, addonInfo.addon);
                    emitEvent(addonInfo.addon.name, 'menuSelect', scopes.bitfield.INTERACTIONS, menuInteraction);
                }
            }
        });

        resolve();
    });
}

module.exports = { handleEvents, createStructures };
