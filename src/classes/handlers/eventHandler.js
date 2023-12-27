const structureHandler = require('./structureHandler.js');
const MemberManager = require('../managers/memberManager.js');
const GuildMemberManager = require('../managers/guildMemberManager.js');
const GuildManager = require('../managers/guildManager.js');
const inviteManager = require('../managers/inviteManager.js');
const channelManager = require('../managers/channelManager.js');
const voiceStateManager = require('../managers/voiceStateManager.js');
const userManager = require('../managers/userManager.js');
const roleManager = require('../managers/roleManager.js');
const emojiManager = require('../managers/emojiManager.js');
const MessageManager = require('../managers/messageManager.js');
const { getAddonPermission, validatePermission, passClient, wait } = require('../../utils/functions.js');
const { eventListeners, addons, emojiCollectors, interactionCollectors, builtStructures, structureStatus, structureListener } = require('../../utils/saves.js');
const scopes = require('../../bitfields/scopes.js');
const { ChannelType, AuditLogEvent } = require('discord.js');

async function specificStructureCreation(guild, addonInfo, callback){
    if(!Array.isArray(builtStructures[addonInfo.addon.name])) builtStructures[addonInfo.addon.name] = [];
	if(builtStructures[addonInfo.addon.name].indexOf(guild.id) >= 0) return;
    if(addonInfo.verified === true && addonInfo.allowed === true){
        builtStructures[addonInfo.addon.name].push(guild.id);
        let g = structureHandler.createStructure('Guild', [guild, addonInfo.addon]);
        const channels = Array.from(guild.channels.cache.values());
        for(let _i = 0; _i < channels.length; _i++){
            let channel = channels[_i];
            if(!channel) continue;
            if(channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildAnnouncement){
                structureHandler.createStructure('TextChannel', [channel, addonInfo.addon, g]);
            } else if(channel.type === ChannelType.GuildCategory){
                structureHandler.createStructure('CategoryChannel', [channel, addonInfo.addon, g]);
            } else if(channel.type === ChannelType.GuildVoice){
                structureHandler.createStructure('VoiceChannel', [channel, addonInfo.addon, g]);
            } else if(channel.type === ChannelType.GuildStageVoice){
                structureHandler.createStructure('StageChannel', [channel, addonInfo.addon, g]);
            } else if(channel.type === ChannelType.GuildForum){
                structureHandler.createStructure('ForumChannel', [channel, addonInfo.addon, g]);
            } else if(channel.type === ChannelType.GuildDirectory){
                structureHandler.createStructure('DirectoryChannel', [channel, addonInfo.addon, g]);
            }
            if(_i % 3 === 0) await wait(1e2);
        }
        const guildRoles = Array.from(guild.roles.cache.values());
        for(let _i = 0; _i < guildRoles.length; _i++){
            var guildRole = guildRoles[_i];
            if(!guildRole) continue;
            structureHandler.createStructure('Role', [guildRole, addonInfo.addon, g]);
            if(_i % 3 === 0) await wait(1e2);
        }
        const guildEmojis = Array.from(guild.emojis.cache.values());
        for(let _i = 0; _i < guildEmojis.length; _i++){
            var guildEmoji = guildEmojis[_i];
            if(!guildEmoji) continue;
            structureHandler.createStructure('Emoji', [guildEmoji, addonInfo.addon, g]);
            if(_i % 3 === 0) await wait(2e1);
        }
        const members = Array.from(guild.members.cache.values());
        for(let _i = 0; _i < members.length; _i++){
            var _member = members[_i];
            if(!_member) continue;
            structureHandler.createStructure('Member', [_member, addonInfo.addon]);
            structureHandler.createStructure('VoiceState', [_member.voice, addonInfo.addon]);
            if(_i % 3 === 0) await wait(2e1);
        }
    }
    callback();
}

function createStructures(client){
    return new Promise(async resolve => {
        structureStatus['building'] = true;
        const readableAddons = addons.toReadableArray();
        const guilds = Object.values(client.mainguilds);
        for(var i = 0; i < guilds.length; i++){
            var guild = guilds[i];
            let addonIndex = 0;
            if(readableAddons.length <= addonIndex) continue;
            await new Promise(async (nextG) => {
                async function createNewCallback(){
                    await specificStructureCreation(guild, readableAddons[addonIndex].value, async function(){
                        ++addonIndex;
                        if(addonIndex + 1 > readableAddons.length){
                            nextG();
                        } else {
							await createNewCallback();
                        }
                    });
                }
                await createNewCallback();
            });
        }
        structureStatus['building'] = false;
        structureListener.emit('created');
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

        client.on('inviteCreate', invite => {
            if(!invite) return;
            if(client.config.guilds.indexOf(invite.guild.id) < 0) return;
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true && addonInfo.addon.ready === true){
                    if(validatePermission(getAddonPermission(addonInfo.addon.name), scopes.bitfield.GUILDS)){
                        const addonGuilds = GuildManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                        const cachedGuild = addonGuilds.get(invite.guild.id);
                        if(!cachedGuild) continue;

                        let cachedInvite = structureHandler.createStructure('Invite', [invite, cachedGuild, addonInfo.addon]);

                        emitEvent(addonInfo.addon.name, 'inviteCreate', scopes.bitfield.GUILDS, cachedInvite);

                        cachedInvite = null;
                    }
                }
            }
        });

        client.on('inviteDelete', invite => {
            if(!invite) return;
            if(client.config.guilds.indexOf(invite.guild.id) < 0) return;
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true && addonInfo.addon.ready === true){
                    if(validatePermission(getAddonPermission(addonInfo.addon.name), scopes.bitfield.GUILDS)){
                        const addonInviteManager = inviteManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                        const guildInviteManager = addonInviteManager.get(invite.guild.id) || structureHandler.createStructure('Save');
                        let cachedInvite = guildInviteManager.get(invite.code);
                        guildInviteManager.delete(invite.code);
                        addonInviteManager.set(invite.guild.id, guildInviteManager);
                        inviteManager.set(addonInfo.addon.name, addonInviteManager);

                        emitEvent(addonInfo.addon.name, 'inviteDelete', scopes.bitfield.GUILDS, cachedInvite);

                        cachedInvite = null;
                    }
                }
            }
        });

        parser.on('voiceStateUpdate', (_oldState, _newState) => {
            if(!_newState || !_oldState) return;
            if(client.config.guilds.indexOf((_newState.member || _oldState.member).guild.id) < 0) return;
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true && addonInfo.addon.ready === true){
                    const addonVoiceStateManager = voiceStateManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                    const guildVoiceStateManager = addonVoiceStateManager.get(_oldState.guild.id) || structureHandler.createStructure('Save');
                    let oldState = guildVoiceStateManager.get(_oldState.member.id);
                    guildVoiceStateManager.delete(_oldState.member.id);
                    addonVoiceStateManager.set(_oldState.guild.id, guildVoiceStateManager);
                    voiceStateManager.set(addonInfo.addon.name, addonVoiceStateManager);
                    let newState = structureHandler.createStructure('VoiceState', [_newState, addonInfo.addon]);
                    emitEvent(addonInfo.addon.name, 'voiceUpdate', scopes.bitfield.MEMBERS, oldState, newState);

                    oldState = null;
                    newState = null;
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
                if(addonInfo.verified === true && addonInfo.allowed === true && addonInfo.addon.ready === true){
                    let member = structureHandler.createStructure('Member', [_member, addonInfo.addon]);
                    emitEvent(addonInfo.addon.name, 'memberAdd', scopes.bitfield.MEMBERS, member);

                    member = null;
                }
            }
        });

        parser.on('memberLeave', _member => {
            if(!_member) return;
            if(client.config.guilds.indexOf(_member.guild.id) < 0) return;
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true && addonInfo.addon.ready === true){

                    const addonG = GuildMemberManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                    const g = addonG.get(_member.guild.id) || structureHandler.createStructure('Save');
                    let member = g.get(_member.id);
                    g.delete(_member.id);
                    addonG.set(_member.guild.id, g);
                    GuildMemberManager.set(addonInfo.addon.name, addonG);

                    const addonMemberManager = MemberManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                    const memberInfo = addonMemberManager.get(_member.id);
                    if(memberInfo){
                        memberInfo.delete(_member.guild.id);
                        if(memberInfo.size === 0){
                            addonMemberManager.delete(_member.id);
                        } else {
                            addonMemberManager.set(_member.id, memberInfo);
                        }
                        MemberManager.set(addonInfo.addon.name, addonMemberManager);
                    }

                    emitEvent(addonInfo.addon.name, 'memberLeave', scopes.bitfield.MEMBERS, member);

                    member = null;
                }
            }
        });
        
        parser.on('kick', (_member, entry) => {
            if(!_member) return;
            if(client.config.guilds.indexOf(_member.guild.id) < 0) return;
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true && addonInfo.addon.ready === true){

                    const addonG = GuildMemberManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                    const g = addonG.get(_member.guild.id);
                    if(g){
                        g.delete(_member.id);
                        addonG.set(guild.id, g);
                        GuildMemberManager.set(addonInfo.addon.name, addonG);
                    }

                    const addonMemberManager = MemberManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
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

                    const addonGuildManager = GuildManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                    let guild = addonGuildManager.get(_member.guild.id);

                    let kickEntry = structureHandler.createStructure('KickEntry', [_member.user, guild, entry, addonInfo.addon]);

                    emitEvent(addonInfo.addon.name, 'memberKick', scopes.bitfield.MEMBERS, kickEntry);

                    guild = null;
                    kickEntry = null;
                }
            }
        });

        parser.on('muteAdd', (_oldMember, _newMember, auditLog) => {
            if(!_oldMember || !_newMember) return;
            if(client.config.guilds.indexOf(_newMember.guild.id) < 0) return;
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true && addonInfo.addon.ready === true){
                    const addonGuildMemberManager = GuildMemberManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                    const guildGuildMemberManager = addonGuildMemberManager.get(_oldMember.guild.id) || structureHandler.createStructure('Save');
                    let oldMember = guildGuildMemberManager.get(_oldMember.id);
                    guildGuildMemberManager.delete(_oldMember.id);
                    addonGuildMemberManager.set(_oldMember.guild.id, guildGuildMemberManager);
                    GuildMemberManager.set(addonInfo.addon.name, addonGuildMemberManager);
                    let newMember = structureHandler.createStructure('Member', [_newMember, addonInfo.addon]);
                    let muteEntry = structureHandler.createStructure('MuteEntry', [auditLog, newMember, addonInfo.addon]);
                    emitEvent(addonInfo.addon.name, 'memberMuteAdd', scopes.bitfield.MEMBERS, oldMember, newMember, muteEntry);

                    oldMember = null;
                    newMember = null;
                    muteEntry = null;
                }
            }
        });
        
        parser.on('muteRemove', (_oldMember, _newMember, auditLog) => {
            if(!_oldMember || !_newMember) return;
            if(client.config.guilds.indexOf(_newMember.guild.id) < 0) return;
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true && addonInfo.addon.ready === true){
                    const addonGuildMemberManager = GuildMemberManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                    const guildGuildMemberManager = addonGuildMemberManager.get(_oldMember.guild.id) || structureHandler.createStructure('Save');
                    let oldMember = guildGuildMemberManager.get(_oldMember.id);
                    guildGuildMemberManager.delete(_oldMember.id);
                    addonGuildMemberManager.set(_oldMember.guild.id, guildGuildMemberManager);
                    GuildMemberManager.set(addonInfo.addon.name, addonGuildMemberManager);
                    let newMember = structureHandler.createStructure('Member', [_newMember, addonInfo.addon]);
                    let muteEntry = structureHandler.createStructure('MuteEntry', [auditLog, newMember, addonInfo.addon]);
                    emitEvent(addonInfo.addon.name, 'memberMuteRemove', scopes.bitfield.MEMBERS, oldMember, newMember, muteEntry);

                    oldMember = null;
                    newMember = null;
                    muteEntry = null;
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
                if(addonInfo.verified === true && addonInfo.allowed === true && addonInfo.addon.ready === true){
                    const addonGuildManager = GuildManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                    const cachedGuild = addonGuildManager.get(_oldMember.guild.id);
                    const addonGuildMemberManager = GuildMemberManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                    const guildGuildMemberManager = addonGuildMemberManager.get(_oldMember.guild.id) || structureHandler.createStructure('Save');
                    let oldMember = guildGuildMemberManager.get(_oldMember.id);
                    guildGuildMemberManager.delete(_oldMember.id);
                    addonGuildMemberManager.set(_oldMember.guild.id, guildGuildMemberManager);
                    GuildMemberManager.set(addonInfo.addon.name, addonGuildMemberManager);
                    let newMember = structureHandler.createStructure('Member', [_newMember, addonInfo.addon]);
                    if(oldMember.nickname !== newMember.nickname){
                        _newMember.guild.fetchAuditLogs({
                            limit: 1,
                            type: AuditLogEvent.MemberUpdate,
                        }).then(logs => {
                            const log = logs.entries.first();

                            if(!log) return;
                            
                            if(log.targetId !== newMember.id) return;

                            let entry = structureHandler.createStructure('BaseEntry', [log, newMember, cachedGuild, addonInfo.addon]);

                            emitEvent(addonInfo.addon.name, 'nicknameChange', scopes.bitfield.MEMBERS, oldMember, newMember, entry);

                            oldMember = null;
                            newMember = null;
                            entry = null;
                        }).catch(err => {});
                    } else if(oldMember.roles.size !== newMember.roles.size){
                        _newMember.guild.fetchAuditLogs({
                            limit: 1,
                            type: AuditLogEvent.MemberRoleUpdate,
                        }).then(logs => {
                            const log = logs.entries.first();

                            if(!log) return;

                            if(log.targetId !== newMember.id) return;

                            let entry = structureHandler.createStructure('BaseEntry', [log, newMember, cachedGuild, addonInfo.addon]);

                            emitEvent(addonInfo.addon.name, 'roleChange', scopes.bitfield.MEMBERS, oldMember, newMember, entry);

                            oldMember = null;
                            newMember = null;
                            entry = null;
                        }).catch(err => {});
                    } else {
                        oldMember = null;
                        newMember = null;
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
                if(addonInfo.verified === true && addonInfo.allowed === true && addonInfo.addon.ready === true){
                    const addonUserManager = userManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                    let oldUser = addonUserManager.get(_oldUser.id) ?? structureHandler.createStructure('User', [_oldUser, addonInfo.addon, false]);
                    addonUserManager.delete(_oldUser.id);
                    userManager.set(addonInfo.addon.name, addonUserManager);
                    let newUser = structureHandler.createStructure('User', [_newUser, addonInfo.addon, false]);
                    if(oldUser.username !== newUser.username){
                        emitEvent(addonInfo.addon.name, 'usernameChange', scopes.bitfield.MEMBERS, oldUser, newUser);
                    } else if(oldUser.discriminator !== newUser.discriminator){
                        emitEvent(addonInfo.addon.name, 'discriminatorChange', scopes.bitfield.MEMBERS, oldUser, newUser);
                    } else if(oldUser.avatarURL !== newUser.avatarURL){
                        emitEvent(addonInfo.addon.name, 'avatarChange', scopes.bitfield.MEMBERS, oldUser, newUser);
                    } else if(oldUser.bannerURL !== newUser.bannerURL){
                        emitEvent(addonInfo.addon.name, 'bannerChange', scopes.bitfield.MEMBERS, oldUser, newUser);
                    }
                    oldUser = null;
                    newUser = null;
                }
            }
        });

        parser.on('ban', (ban, entry) => {
            if(!ban) return;
            if(client.config.guilds.indexOf(ban.guild.id) < 0) return;
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true && addonInfo.addon.ready === true){
                    const addonG = GuildMemberManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                    const g = addonG.get(ban.guild.id);
                    if(g){
                        g.delete(ban.user.id);
                        addonG.set(ban.guild.id, g);
                        GuildMemberManager.set(addonInfo.addon.name, addonG);
                    }

                    const addonMemberManager = MemberManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
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

                    const addonGuildManager = GuildManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                    let guild = addonGuildManager.get(ban.guild.id);

                    let banEntry = structureHandler.createStructure('BanEntry', [ban.user, guild, entry, addonInfo.addon]);

                    emitEvent(addonInfo.addon.name, 'memberBan', scopes.bitfield.MEMBERS, banEntry);

                    guild = null;
                    banEntry = null;
                }
            }
        });
        
        parser.on('levelUp', _member => {
            if(!_member) return;
            if(client.config.guilds.indexOf(_member.guild.id) < 0) return;
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true && addonInfo.addon.ready === true){
                    const addonGuildMemberManager = GuildMemberManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                    const guildGuildMemberManager = addonGuildMemberManager.get(_member.guild.id) || structureHandler.createStructure('Save');
                    let cachedMember = guildGuildMemberManager.get(_member.id);
                    emitEvent(addonInfo.addon.name, 'levelUp', scopes.bitfield.MEMBERS, cachedMember);

                    cachedMember = null;
                }
            }
        });
        
        parser.on('ticketClose', (_channel, transcript, rawInfo) => {
            if(!_channel) return;
            if(client.config.guilds.indexOf(_channel.guild.id) < 0) return;
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true && addonInfo.addon.ready === true){
                    const addonChannelManager = channelManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                    const guildChannelManager = addonChannelManager.get(_channel.guild.id) || structureHandler.createStructure('Save');

                    let channel = guildChannelManager.get(_channel.id);

                    const addonGuildManager = GuildManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                    let guild = addonGuildManager.get(_channel.guild.id);

                    if(!channel){
                        if(_channel.type === ChannelType.GuildText || _channel.type === ChannelType.GuildAnnouncement){
                            channel = structureHandler.createStructure('TextChannel', [_channel, addonInfo.addon, guild]);
                        } else if(_channel.type === ChannelType.GuildCategory){
                            channel = structureHandler.createStructure('CategoryChannel', [_channel, addonInfo.addon, guild]);
                        } else if(_channel.type === ChannelType.GuildVoice){
                            channel = structureHandler.createStructure('VoiceChannel', [_channel, addonInfo.addon, guild]);
                        } else if(_channel.type === ChannelType.GuildStageVoice){
                            channel = structureHandler.createStructure('StageChannel', [_channel, addonInfo.addon, guild]);
                        } else if(_channel.type === ChannelType.GuildForum){
                            channel = structureHandler.createStructure('ForumChannel', [_channel, addonInfo.addon, guild]);
                        } else if(_channel.type === ChannelType.GuildDirectory){
                            channel = structureHandler.createStructure('DirectoryChannel', [_channel, addonInfo.addon, guild]);
                        }
                    }

                    emitEvent(addonInfo.addon.name, 'ticketClose', scopes.bitfield.CHANNELS, channel, transcript, rawInfo);

                    channel = null;
                    guild = null;
                }
            }
        });

        client.on('guildMembersChunk', (_members, guild, chunk) => {
            if(!_members || !guild) return;
            if(client.config.guilds.indexOf(guild.id) < 0) return;
            const members = Array.from(_members.values());
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true && addonInfo.addon.ready === true){
                    const addonGuildMemberManager = GuildMemberManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                    const guildGuildMemberManager = addonGuildMemberManager.get(guild.id) || structureHandler.createStructure('Save');

                    let chunkedMembers = structureHandler.createStructure('Save');
                    for(var i = 0; i < members.length; i++){
                        let member = members[i];
                        let _member = guildGuildMemberManager.get(member.id) ?? structureHandler.createStructure('Member', [member, addonInfo.addon]);
                        chunkedMembers.set(_member.id, _member);
                        _member = null;
                        guildGuildMemberManager.delete(member.id);
                        addonGuildMemberManager.set(guild.id, guildGuildMemberManager);
                        GuildMemberManager.set(addonInfo.addon.name, addonGuildMemberManager);

                        const addonMemberManager = MemberManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
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

                    chunkedMembers = null;
                }
            }
        });

        parser.on('messageCreate', async message => {
            if(!message) return;
            if(message.partial){
                try{
                    message = await message.fetch();
                } catch {
                    return;
                }
            }
            if(!message.guild || !message.channel || !message.id || (!message.author && !message.member)) return;
            if(message.channel.type === ChannelType.DM) return;
            if(client.config.guilds.indexOf(message.guild.id) < 0) return;
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true && addonInfo.addon.ready === true){
                    let msg = structureHandler.createStructure('Message', [message, addonInfo.addon]);
                    if(msg.channel){
                        if(validatePermission(getAddonPermission(addonInfo.addon.name), scopes.bitfield.MESSAGES) && (msg.channel.isVoiceStage() || msg.channel.isTextChannel() || msg.channel.isThread() || msg.channel.isVoiceChannel())){
                            const addonMessageManager = MessageManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                            const guildMessageManager = addonMessageManager.get(message.guild.id) || structureHandler.createStructure('Save');
                            const channelMessageManager = guildMessageManager.get(message.channel.id) || structureHandler.createStructure('Save');
                            channelMessageManager.set(message.id, msg);
                            guildMessageManager.set(message.channel.id, channelMessageManager);
                            addonMessageManager.set(message.guild.id, guildMessageManager);
                            MessageManager.set(addonInfo.addon.name, addonMessageManager);
                        }
                    }
                    emitEvent(addonInfo.addon.name, 'message', scopes.bitfield.MESSAGES, msg);

                    msg = null;
                }
            }
        });

        parser.on('messageDelete', (_message, _executor) => {
            if(!_message) return;
            if(_message.partial){
                return;
            }
            if(!_message.guild || !_message.channel || !_message.id || (!_message.author && !_message.member)) return;
            if(_message.channel.type === ChannelType.DM) return;
            if(client.config.guilds.indexOf(_message.guild.id) < 0) return;
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true && addonInfo.addon.ready === true){
                    let executor = structureHandler.createStructure('User', [_executor, addonInfo.addon, false]);
                    let message = structureHandler.createStructure('Message', [_message, addonInfo.addon]);
                    if(validatePermission(getAddonPermission(addonInfo.addon.name), scopes.bitfield.MESSAGES)){
                        const addonMessageManager = MessageManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                        const guildMessageManager = addonMessageManager.get(_message.guild.id) || structureHandler.createStructure('Save');
                        const channelMessageManager = guildMessageManager.get(_message.channel.id) || structureHandler.createStructure('Save');
                        channelMessageManager.delete(_message.id);
                        guildMessageManager.set(_message.channel.id, channelMessageManager);
                        addonMessageManager.set(_message.guild.id, guildMessageManager);
                        MessageManager.set(addonInfo.addon.name, addonMessageManager);
                    }
                    emitEvent(addonInfo.addon.name, 'messageDelete', scopes.bitfield.MESSAGES, message, executor);

                    executor = null;
                    message = null;
                }
            }
        });

        parser.on('messageUpdate', async (_oldMessage, _newMessage) => {
            if(!_oldMessage || !_newMessage) return;
            if(_newMessage.partial){
                try{
                    _newMessage = await _newMessage.fetch();
                } catch {
                    return;
                }
            }
            if(!_newMessage.guild || !_newMessage.channel || !_newMessage.id || (!_newMessage.author && !_newMessage.member) || !_oldMessage.guild || !_oldMessage.channel || !_oldMessage.id || (!_oldMessage.author && !_oldMessage.member)) return;
            if(_newMessage.channel.type === ChannelType.DM) return;
            if(client.config.guilds.indexOf(_newMessage.guild.id) < 0) return;
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true && addonInfo.addon.ready === true){
                    const addonMessageManager = MessageManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                    const guildMessageManager = addonMessageManager.get(_oldMessage.guild.id) || structureHandler.createStructure('Save');
                    const channelMessageManager = guildMessageManager.get(_oldMessage.channel.id) || structureHandler.createStructure('Save');
                    let oldMessage = channelMessageManager.get(_oldMessage.id) ?? structureHandler.createStructure('Message', [_oldMessage, addonInfo.addon]);
                    
                    let newMessage = structureHandler.createStructure('Message', [_newMessage, addonInfo.addon]);
                    if(validatePermission(getAddonPermission(addonInfo.addon.name), scopes.bitfield.MESSAGES)){
                        const addonMessageManager = MessageManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                        const guildMessageManager = addonMessageManager.get(_newMessage.guild.id) || structureHandler.createStructure('Save');
                        const channelMessageManager = guildMessageManager.get(_newMessage.channel.id) || structureHandler.createStructure('Save');
                        channelMessageManager.set(newMessage.id, newMessage);
                        guildMessageManager.set(_newMessage.channel.id, channelMessageManager);
                        addonMessageManager.set(_newMessage.guild.id, guildMessageManager);
                        MessageManager.set(addonInfo.addon.name, addonMessageManager);
                    }
                    emitEvent(addonInfo.addon.name, 'messageUpdate', scopes.bitfield.MESSAGES, oldMessage, newMessage);

                    oldMessage = null;
                    newMessage = null;
                }
            }
        });

        parser.on('reactionAdd', (_reaction, _user) => {
            if(!_reaction || !_user) return;
            if(client.config.guilds.indexOf(_reaction.message.guild.id) < 0) return;
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true && addonInfo.addon.ready === true){
                    const addonUserManager = userManager.get(addonInfo.addon.name) ?? structureHandler.createStructure('Save');
                    let user = addonUserManager.get(_user.id) ?? structureHandler.createStructure('User', [_user, addonInfo.addon, false]);
                    let reaction = structureHandler.createStructure('Reaction', [_reaction, addonInfo.addon, user]);
                    const addonEmojiCollectors = emojiCollectors.get(addonInfo.addon.name);
                    if(addonEmojiCollectors){
                        const messageCollectors = addonEmojiCollectors.get(_reaction.message.id);
                        if(messageCollectors){
                            const collectors = messageCollectors.filter(c => {
                                return c.filter(reaction, user);
                            });
                            const removeCollectors = [];
                            for(let i = 0; i < collectors.length; i++){
                                let collector = collectors[i];
                                ++collector.count;
                                if(collector.max <= collector.count){
                                    removeCollectors.push(collector);
                                }
                                if(collector.time < (new Date()).getTime()){
                                    removeCollectors.push(collector);
                                    continue;
                                }
                                collector.emit('collect', reaction, user);
                            }
                            for(let i = 0; i < removeCollectors.length; i++){
                                let removeCollector = removeCollectors[i];
                                removeCollector.emit('end');
                                removeCollector.removeAllListeners();
                                let collectorIndex = messageCollectors.indexOf(removeCollector);
                                if(collectorIndex >= 0){
                                    messageCollectors.splice(collectorIndex, 1);
                                }
                            }
                            addonEmojiCollectors.set(_reaction.message.id, messageCollectors);
                            emojiCollectors.set(addonInfo.addon.name, addonEmojiCollectors);
                        }
                    }
                    emitEvent(addonInfo.addon.name, 'reactionAdd', scopes.bitfield.EMOJIS, reaction);

                    reaction = null;
                    user = null;
                }
            }
        });

        client.on('messageReactionRemove', async (_reaction, _user) => {
            if(!_reaction || !_user) return;
            if(client.config.guilds.indexOf(_reaction.message.guild.id) < 0) return;
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true && addonInfo.addon.ready === true){
                    try{
                        await wait(400);
                        await _reaction.message.fetch();
                    } catch {}
                    const addonUserManager = userManager.get(addonInfo.addon.name) ?? structureHandler.createStructure('Save');
                    let user = addonUserManager.get(_user.id) ?? structureHandler.createStructure('User', [_user, addonInfo.addon, false]);
                    let reaction = structureHandler.createStructure('Reaction', [_reaction, addonInfo.addon, user]);
                    emitEvent(addonInfo.addon.name, 'reactionDelete', scopes.bitfield.EMOJIS, reaction);

                    user = null;
                    reaction =  null;
                }
            }
        });

        parser.on('serverAdd', async (_guild) => {
            if(!_guild) return;
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true && addonInfo.addon.ready === true){
                    await createStructures(client, _addons);
                    let guild = addonInfo.addon.guilds.get(_guild.id);
                    emitEvent(addonInfo.addon.name, 'guildAdd', scopes.bitfield.GUILDS, guild);
                    
                    guild = null;
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
                if(addonInfo.verified === true && addonInfo.allowed === true && addonInfo.addon.ready === true){
                    _newGuild.fetchAuditLogs({
                        limit: 1,
                        type: AuditLogEvent.GuildUpdate
                    }).then(async logs => {
                        const log = logs.entries.first();

                        if(!log) return;

                        if(log.targetId !== _newGuild.id) return;

                        const addonGuildManager = GuildManager.get(addonInfo.addon.name) ?? structureHandler.createStructure('Save');
                        let oldGuild = addonGuildManager.get(_oldGuild.id) ?? structureHandler.createStructure('Guild', [_oldGuild, addonInfo.addon]);
                        let newGuild = structureHandler.createStructure('Guild', [_newGuild, addonInfo.addon]);
                        let entry = structureHandler.createStructure('BaseEntry', [log, undefined, newGuild, addonInfo.addon]);

                        if(oldGuild.name !== newGuild.name){
                            emitEvent(addonInfo.addon.name, 'guildNameChange', scopes.bitfield.GUILDS, oldGuild, newGuild, entry);
                        } else if(oldGuild.iconURL !== newGuild.iconURL){
                            emitEvent(addonInfo.addon.name, 'guildIconChange', scopes.bitfield.GUILDS, oldGuild, newGuild, entry);                        
                        } else if(oldGuild.description !== newGuild.description){
                            emitEvent(addonInfo.addon.name, 'guildDescriptionChange', scopes.bitfield.GUILDS, oldGuild, newGuild, entry);
                        } else if(oldGuild.ownerId !== newGuild.ownerId){
                            emitEvent(addonInfo.addon.name, 'guildOwnerChange', scopes.bitfield.GUILDS, oldGuild, newGuild, entry);
                        } else if(oldGuild.boosts !== newGuild.boosts){
                            emitEvent(addonInfo.addon.name, 'guildBoost', scopes.bitfield.GUILDS, oldGuild, newGuild, entry);
                        }

                        oldGuild = null;
                        newGuild = null;
                        entry =  null;
                    }).catch(err => {});
                }
            }
        });

        parser.on('serverDelete', (_oldServer) => {
            if(!_oldServer) return;
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true && addonInfo.addon.ready === true){
                    const addonGuildManager = GuildManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                    let oldServer = addonGuildManager.get(_oldServer.id);
                    const addonGuildMemberManager = GuildMemberManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                    addonGuildMemberManager.delete(_oldServer.id);
                    GuildMemberManager.set(addonInfo.addon.name, addonGuildMemberManager);
                    const addonMemberManager = MemberManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                    const members = addonMemberManager.filter(m => m instanceof Save ? typeof m.get(_oldServer.id) !== 'undefined' : false);
                    const memberIds = Array.from(members.keys());
                    for(var i = 0; i < memberIds.length; i++){
                        var memberId = memberIds[i];
                        let g = members.get(memberId);
                        g.delete(_oldServer.id);
                        addonMemberManager.set(memberId, g);
                        g = null;
                    }
                    MemberManager.set(addonInfo.addon.name, addonMemberManager);
                    const addonRoleManager = roleManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                    addonRoleManager.delete(_oldServer.id);
                    roleManager.set(addonInfo.addon.name, addonRoleManager);
                    const addonEmojiManager = emojiManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                    addonEmojiManager.delete(_oldServer.id);
                    emojiManager.set(addonInfo.addon.name, addonEmojiManager);
                    const addonMessageManager = MessageManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                    addonMessageManager.delete(_oldServer.id);
                    MessageManager.set(addonInfo.addon.name, addonMessageManager);
                    const addonVoiceStateManager = voiceStateManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                    addonVoiceStateManager.delete(_oldServer.id);
                    voiceStateManager.set(addonInfo.addon.name, addonVoiceStateManager);
                    addonGuildManager.delete(_oldServer.id);
                    GuildManager.set(addonInfo.addon.name, addonGuildManager);
                    const addonInviteManager = inviteManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                    addonInviteManager.delete(_oldServer.id);
                    inviteManager.set(addonInfo.addon.name, addonInviteManager);
                    addonInfo.addon.guilds.delete(_oldServer.id);
                    emitEvent(addonInfo.addon.name, 'guildDelete', scopes.bitfield.GUILDS, oldServer);

                    oldServer = null;
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
                if(addonInfo.verified === true && addonInfo.allowed === true && addonInfo.addon.ready === true){
                    _emoji.guild.fetchAuditLogs({
                        limit: 1,
                        type: AuditLogEvent.EmojiCreate,
                    }).then(logs => {
                        const log = logs.entries.first();

                        if(!log) return;
                        
                        if(log.targetId !== _emoji.id) return;

                        const addonGuildManager = GuildManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                        let guild = addonGuildManager.get(_emoji.guild.id) ?? structureHandler.createStructure('Guild', [_emoji.guild, addonInfo.addon]);
                        let emoji = guild.emojis.filter(e => e.value.id === _emoji.id).first();

                        let entry = structureHandler.createStructure('BaseEntry', [log, undefined, guild, addonInfo.addon]);

                        emitEvent(addonInfo.addon.name, 'emojiAdd', scopes.bitfield.EMOJIS, emoji, entry);

                        guild = null;
                        emoji = null;
                        entry = null;
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
                if(addonInfo.verified === true && addonInfo.allowed === true && addonInfo.addon.ready === true){
                    _newEmoji.guild.fetchAuditLogs({
                        limit: 1,
                        type: AuditLogEvent.EmojiUpdate,
                    }).then(logs => {
                        const log = logs.entries.first();

                        if(!log) return;
                        
                        if(log.targetId !== _newEmoji.id) return;

                        const addonGuildManager = GuildManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                        let guild = addonGuildManager.get(_oldEmoji.guild.id) ?? structureHandler.createStructure('Guild', [_oldEmoji.guild, addonInfo.addon]);

                        const addonEmojiManager = emojiManager.get(addonInfo.addon.name) || structureHandler.get('Save');
                        const guildEmojiManager = addonEmojiManager.get(_oldEmoji.guild.id) || structureHandler.get('Save');
                        let oldEmoji = guildEmojiManager.get(_oldEmoji.id);
                        
                        let emoji = structureHandler.createStructure('Emoji', [_newEmoji, addonInfo.addon, guild]);

                        let entry = structureHandler.createStructure('BaseEntry', [log, undefined, guild, addonInfo.addon]);

                        emitEvent(addonInfo.addon.name, 'emojiUpdate', scopes.bitfield.EMOJIS, oldEmoji, emoji, entry);

                        guild = null;
                        oldEmoji = null;
                        emoji = null;
                        entry = null;
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
                if(addonInfo.verified === true && addonInfo.allowed === true && addonInfo.addon.ready === true){
                    _emoji.guild.fetchAuditLogs({
                        limit: 1,
                        type: AuditLogEvent.EmojiDelete,
                    }).then(logs => {
                        const log = logs.entries.first();

                        if(!log) return;
                        
                        if(log.targetId !== _emoji.id) return;

                        const addonGuildManager = GuildManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                        let guild = addonGuildManager.get(_emoji.guild.id) ?? structureHandler.createStructure('Guild', [_emoji.guild, addonInfo.addon]);

                        const addonEmojiManager = emojiManager.get(addonInfo.addon.name) || structureHandler.get('Save');
                        const guildEmojiManager = addonEmojiManager.get(_emoji.guild.id) || structureHandler.get('Save');
                        let oldEmoji = guildEmojiManager.get(_emoji.id);
                        guildEmojiManager.delete(_emoji.id);
                        addonGuildManager.set(_emoji.guild.id, guildEmojiManager);
                        emojiManager.set(addonInfo.addon.name, addonEmojiManager);

                        let entry = structureHandler.createStructure('BaseEntry', [log, undefined, guild, addonInfo.addon]);

                        emitEvent(addonInfo.addon.name, 'emojiDelete', scopes.bitfield.EMOJIS, oldEmoji, entry);

                        guild =  null;
                        oldEmoji = null;
                        entry = null;
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
                if(addonInfo.verified === true && addonInfo.allowed === true && addonInfo.addon.ready === true){
                    _channel.guild.fetchAuditLogs({
                        limit: 1,
                        type: AuditLogEvent.ChannelCreate,
                    }).then(logs => {
                        const log = logs.entries.first();

                        if(!log) return;
                        
                        if(log.targetId !== _channel.id) return;

                        let channel;
                        if(_channel.type === ChannelType.GuildText || _channel.type === ChannelType.GuildAnnouncement){
                            channel = structureHandler.createStructure('TextChannel', [_channel, addonInfo.addon, guild]);
                        } else if(_channel.type === ChannelType.GuildCategory){
                            channel = structureHandler.createStructure('CategoryChannel', [_channel, addonInfo.addon, guild]);
                        } else if(_channel.type === ChannelType.GuildVoice){
                            channel = structureHandler.createStructure('VoiceChannel', [_channel, addonInfo.addon, guild]);
                        } else if(_channel.type === ChannelType.GuildStageVoice){
                            channel = structureHandler.createStructure('StageChannel', [_channel, addonInfo.addon, guild]);
                        } else if(_channel.type === ChannelType.GuildForum){
                            channel = structureHandler.createStructure('ForumChannel', [_channel, addonInfo.addon, guild]);
                        } else if(_channel.type === ChannelType.GuildDirectory){
                            channel = structureHandler.createStructure('DirectoryChannel', [_channel, addonInfo.addon, guild]);
                        }

                        let entry = structureHandler.createStructure('BaseEntry', [log, undefined, guild, addonInfo.addon]);

                        emitEvent(addonInfo.addon.name, 'channelAdd', scopes.bitfield.CHANNELS, channel, entry);

                        channel = null;
                        entry = null;
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
                if(addonInfo.verified === true && addonInfo.allowed === true && addonInfo.addon.ready === true){
                    _newChannel.guild.fetchAuditLogs({
                        limit: 1,
                        type: AuditLogEvent.ChannelUpdate,
                    }).then(logs => {
                        const log = logs.entries.first();

                        if(!log) return;
                        
                        if(log.targetId !== _newChannel.id) return;

                        const addonGuildManager = GuildManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                        let guild = addonGuildManager.get(_newChannel.guild.id) ?? structureHandler.createStructure('Guild', [_newChannel.guild, addonInfo.addon]);

                        const addonChannelManager = channelManager.get(addonInfo.addon.name) ?? structureHandler.createStructure('Save');
                        const guildChannelManager = addonChannelManager.get(_oldChannel.guild.id) ?? structureHandler.createStructure('Save');
                        let oldChannel = guildChannelManager.get(_oldChannel.id);
                        
                        let newChannel;
                        if(_newChannel.type === ChannelType.GuildText || _newChannel.type === ChannelType.GuildAnnouncement){
                            newChannel = structureHandler.createStructure('TextChannel', [_newChannel, addonInfo.addon, guild]);
                        } else if(_newChannel.type === ChannelType.GuildCategory){
                            newChannel = structureHandler.createStructure('CategoryChannel', [_newChannel, addonInfo.addon, guild]);
                        } else if(_newChannel.type === ChannelType.GuildVoice){
                            newChannel = structureHandler.createStructure('VoiceChannel', [_newChannel, addonInfo.addon, guild]);
                        } else if(_newChannel.type === ChannelType.GuildStageVoice){
                            newChannel = structureHandler.createStructure('StageChannel', [_newChannel, addonInfo.addon, guild]);
                        } else if(_newChannel.type === ChannelType.GuildForum){
                            newChannel = structureHandler.createStructure('ForumChannel', [_newChannel, addonInfo.addon, guild]);
                        } else if(_newChannel.type === ChannelType.GuildDirectory){
                            newChannel = structureHandler.createStructure('DirectoryChannel', [_newChannel, addonInfo.addon, guild]);
                        }

                        let entry = structureHandler.createStructure('BaseEntry', [log, undefined, guild, addonInfo.addon]);

                        emitEvent(addonInfo.addon.name, 'channelUpdate', scopes.bitfield.CHANNELS, oldChannel, newChannel, entry);

                        oldChannel = null;
                        newChannel = null;
                        entry = null;
                        guild = null;
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
                if(addonInfo.verified === true && addonInfo.allowed === true && addonInfo.addon.ready === true){
                    addonInfo.addon.channels.delete(_channel.id);
                    if(validatePermission(getAddonPermission(addonInfo.addon.name), scopes.bitfield.MESSAGES)){
                        const addonMessageManager = MessageManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                        const guildMessageManager = addonMessageManager.get(_channel.guild.id) || structureHandler.createStructure('Save');
                        guildMessageManager.delete(_channel.id);
                        addonMessageManager.set(_channel.guild.id, guildMessageManager);
                        MessageManager.set(addonInfo.addon.name, addonMessageManager);
                    }
                    _channel.guild.fetchAuditLogs({
                        limit: 1,
                        type: AuditLogEvent.ChannelDelete,
                    }).then(logs => {
                        const log = logs.entries.first();

                        if(!log) return;
                        
                        if(log.targetId !== _channel.id) return;

                        const addonChannelManager = channelManager.get(addonInfo.addon.name) ?? structureHandler.createStructure('Save');
                        const guildChannelManager = addonChannelManager.get(_channel.guild.id) ?? structureHandler.createStructure('Save');
                        let oldChannel = guildChannelManager.get(_channel.id);
                        guildChannelManager.delete(_channel.id);
                        addonChannelManager.set(_channel.guild.id, guildChannelManager);
                        channelManager.set(addonInfo.addon.name);

                        let entry = structureHandler.createStructure('BaseEntry', [log, undefined, guild, addonInfo.addon]);

                        emitEvent(addonInfo.addon.name, 'channelDelete', scopes.bitfield.CHANNELS, oldChannel, entry);

                        oldChannel = null;
                        entry =  null;
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
                if(addonInfo.verified === true && addonInfo.allowed === true && addonInfo.addon.ready === true){
                    _role.guild.fetchAuditLogs({
                        limit: 1,
                        type: AuditLogEvent.RoleCreate,
                    }).then(logs => {
                        const log = logs.entries.first();

                        if(!log) return;
                        
                        if(log.targetId !== _role.id) return;
                        
                        const addonGuildManager = GuildManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                        let guild = addonGuildManager.get(_role.guild.id) ?? structureHandler.createStructure('Guild', [_role.guild, addonInfo.addon]);
                        let role = structureHandler.createStructure('Role', [_role, addonInfo.addon, guild]);

                        let entry = structureHandler.createStructure('BaseEntry', [log, undefined, guild, addonInfo.addon]);

                        emitEvent(addonInfo.addon.name, 'roleAdd', scopes.bitfield.ROLES, role, entry);

                        guild = null;
                        role = null;
                        entry = null;
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
                if(addonInfo.verified === true && addonInfo.allowed === true && addonInfo.addon.ready === true){
                    _newRole.guild.fetchAuditLogs({
                        limit: 1,
                        type: AuditLogEvent.RoleUpdate,
                    }).then(logs => {
                        const log = logs.entries.first();

                        if(!log) return;
                        
                        if(log.targetId !== _newRole.id) return;

                        const addonGuildManager = GuildManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                        let guild = addonGuildManager.get(_newRole.guild.id) ?? structureHandler.createStructure('Guild', [_newRole.guild, addonInfo.addon]);
                        
                        const addonRoleManager = roleManager.get(addonInfo.addon.name) ?? structureHandler.createStructure('Save');
                        const guildRoleManager = addonRoleManager.get(_oldRole.guild.id) ?? structureHandler.createStructure('Save');
                        let oldRole = guildRoleManager.get(_oldRole.id) ?? structureHandler.createStructure('Role', [_oldRole, addonInfo.addon, guild]);
                        let role = structureHandler.createStructure('Role', [_newRole, addonInfo.addon, guild]);

                        let entry = structureHandler.createStructure('BaseEntry', [log, undefined, guild, addonInfo.addon]);

                        emitEvent(addonInfo.addon.name, 'roleUpdate', scopes.bitfield.ROLES, oldRole, role, entry);

                        guild = null;
                        oldRole = null;
                        role = null;
                        entry = null;
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
                if(addonInfo.verified === true && addonInfo.allowed === true && addonInfo.addon.ready === true){
                    _role.guild.fetchAuditLogs({
                        limit: 1,
                        type: AuditLogEvent.RoleDelete,
                    }).then(logs => {
                        const log = logs.entries.first();

                        if(!log) return;
                        
                        if(log.targetId !== _role.id) return;

                        const addonGuildManager = GuildManager.get(addonInfo.addon.name) || structureHandler.createStructure('Save');
                        let guild = addonGuildManager.get(_role.guild.id) ?? structureHandler.createStructure('Guild', [_role.guild, addonInfo.addon]);
                        
                        const addonRoleManager = roleManager.get(addonInfo.addon.name) ?? structureHandler.createStructure('Save');
                        const guildRoleManager = addonRoleManager.get(_role.guild.id) ?? structureHandler.createStructure('Save');
                        let oldRole = guildRoleManager.get(_role.id) ?? structureHandler.createStructure('Role', [_role, addonInfo.addon, guild]);
                        guildRoleManager.delete(_role.id);
                        addonGuildManager.set(_role.guild.id, guildRoleManager);
                        roleManager.set(addonInfo.addon.name, addonGuildManager);

                        let entry = structureHandler.createStructure('BaseEntry', [log, undefined, guild, addonInfo.addon]);

                        emitEvent(addonInfo.addon.name, 'roleDelete', scopes.bitfield.ROLES, oldRole, entry);

                        guild = null;
                        oldRole = null;
                        entry = null;
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
                if(addonInfo.verified === true && addonInfo.allowed === true && addonInfo.addon.ready === true){
                    let buttonInteraction = structureHandler.createStructure('ButtonInteraction', [interaction, addonInfo.addon]);
                    const addonInteractionCollectors = interactionCollectors.get(addonInfo.addon.name);
                    if(addonInteractionCollectors){
                        const messageCollectors = addonInteractionCollectors.get(interaction.message.id);
                        if(messageCollectors){
                            const collectors = messageCollectors.filter(c => {
                                return c.filter(buttonInteraction);
                            });
                            const removeCollectors = [];
                            for(let i = 0; i < collectors.length; i++){
                                let collector = collectors[i];
                                ++collector.count;
                                if(collector.max <= collector.count){
                                    removeCollectors.push(collector);
                                }
                                if(collector.time < (new Date()).getTime()){
                                    removeCollectors.push(collector);
                                    continue;
                                }
                                collector.emit('collect', buttonInteraction);
                            }
                            for(let i = 0; i < removeCollectors.length; i++){
                                let removeCollector = removeCollectors[i];
                                removeCollector.emit('end');
                                removeCollector.removeAllListeners();
                                let collectorIndex = messageCollectors.indexOf(removeCollector);
                                if(collectorIndex >= 0){
                                    messageCollectors.splice(collectorIndex, 1);
                                }
                            }
                            addonInteractionCollectors.set(interaction.message.id, messageCollectors);
                            interactionCollectors.set(addonInfo.addon.name, addonInteractionCollectors);
                        }
                    }
                    emitEvent(addonInfo.addon.name, 'buttonClick', scopes.bitfield.INTERACTIONS, buttonInteraction);

                    buttonInteraction =  null;
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
                if(addonInfo.verified === true && addonInfo.allowed === true && addonInfo.addon.ready === true){
                    let menuInteraction = structureHandler.createStructure('MenuInteraction', [interaction, addonInfo.addon]);
                    const addonInteractionCollectors = interactionCollectors.get(addonInfo.addon.name);
                    if(addonInteractionCollectors){
                        const messageCollectors = addonInteractionCollectors.get(interaction.message.id);
                        if(messageCollectors){
                            const collectors = messageCollectors.filter(c => {
                                return c.filter(menuInteraction);
                            });
                            const removeCollectors = [];
                            for(let i = 0; i < collectors.length; i++){
                                let collector = collectors[i];
                                ++collector.count;
                                if(collector.max <= collector.count){
                                    removeCollectors.push(collector);
                                }
                                if(collector.time < (new Date()).getTime()){
                                    removeCollectors.push(collector);
                                    continue;
                                }
                                collector.emit('collect', menuInteraction);
                            }
                            for(let i = 0; i < removeCollectors.length; i++){
                                let removeCollector = removeCollectors[i];
                                removeCollector.emit('end');
                                removeCollector.removeAllListeners();
                                let collectorIndex = messageCollectors.indexOf(removeCollector);
                                if(collectorIndex >= 0){
                                    messageCollectors.splice(collectorIndex, 1);
                                }
                            }
                            addonInteractionCollectors.set(interaction.message.id, messageCollectors);
                            interactionCollectors.set(addonInfo.addon.name, addonInteractionCollectors);
                        }
                    }
                    emitEvent(addonInfo.addon.name, 'menuSelect', scopes.bitfield.INTERACTIONS, menuInteraction);
                    
                    menuInteraction = null;
                }
            }
        });

        parser.on('modal', (interaction) => {
            if(!interaction) return;
            if(!interaction.inGuild()) return;
            if(client.config.guilds.indexOf(interaction.guild?.id) < 0) return;
            _addons = addons.toReadableArray();
            for(var z = 0; z < _addons.length; z++){
                let addonInfo = _addons[z].value;
                if(addonInfo.verified === true && addonInfo.allowed === true && addonInfo.addon.ready === true){
                    let modalInteraction = structureHandler.createStructure('FormInteraction', [interaction, addonInfo.addon]);
                    emitEvent(addonInfo.addon.name, 'formSubmit', scopes.bitfield.INTERACTIONS, modalInteraction);

                    modalInteraction = null;
                }
            }
        });

        resolve();
    });
}

module.exports = { handleEvents, createStructures };
