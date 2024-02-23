import ValueSaver from 'valuesaver';
import EventEmitter from 'events';
import { PermissionsBitField, PermissionFlags, EmbedBuilder, ActionRowBuilder as DiscordActionRowBuilder, Attachment } from 'discord.js';
import { Readable } from 'stream';

type addonOptions = {
    name: string;
    description: string;
    author: string;
    version: string;
    bitfield: [number] | number;
};

type CategoryOption = "General" | "Polls" | "Games" | "Fun" | "Giveaway" | "Music" | "Moderation" | "Economy" | "Level" | "Tickets" | "Bot" | "Admin";

type SaveDataType = Map<any, any> | object | Array<any> | ValueSaver;

type AddonEvents = {
    ready: [];
}

type CommandEvents = {
    execute: [Command]
}

type MessageContentType = {content: string; embeds: [EmbedBuilder], files: [string], components: [DiscordActionRowBuilder]} | string | EmbedBuilder | ButtonBuilder | SelectMenuBuilder | ActionRowBuilder;

type ChannelType = TextChannel | VoiceChannel | StageChannel | CategoryChannel | DirectoryChannel | ForumChannel | DMChannel | ThreadChannel;

type ChannelStringTypes = 'GuildText' | 'DM' | 'GuildVoice' | 'GroupDM' | 'GuildCategory' | 'GuildAnnouncement' | 'AnnouncementThread' | 'PublicThread' | 'PrivateThread' | 'GuildStageVoice' | 'GuildDirectory' | 'GuildForum';

type ButtonStyleType = 'primary' | 'secondary' | 'success' | 'danger' | 'blurple' | 'gray' | 'grey' | 'red' | 'green' | number;

type ResolvableDate = string | number | Date;

type CreateMessageBasedThreadOptions = {
    name: string;
    autoArchiveThread: ResolvableDate;
    slowMode: ResolvableDate;
    reason: string;
};

type CreateInviteOptions = {
    maxAge: number;
    maxUses: number;
    temporary: boolean;
    targetUser: string | User;
    targetType: 'application' | 'user' | 'EmbeddedApplication' | number;
    targetApplication: string; unique?: boolean;
    reason: string;
}

type AvatarOptions = {
    dynamic: boolean;
    size: string;
    extension: string;
};

type BannerOptions = AvatarOptions;

type BanOptions = {
    deleteMessagesTime: ResolvableDate;
    reason: string;
};

type ResolvableMember = Member | string;

type CreateEmojiOptions = {
    imageUrl: string;
    name: string;
    reason: string;
};

type ResolvableEmoji = Emoji | string;

type CreateRoleOptions = {
    name: string;
    color: string | number;
    reason: string;
    position: number;
    hoist: boolean;
    permissions: [permissionFlagsBitsObject];
};

type ResolvableRole = Role | string;

type ResolvableParent = CategoryChannel | string;

type VideoQualityModeType = 'full' | 'auto' | 1 | 2;

type OverwriteType = 'member' | 'user' | 'role';

type PermissionsOverwrite = [{
    type: OverwriteType,
    id: string;
    deny: [permissionFlagsBitsObject],
    allow: [permissionFlagsBitsObject]
}];

type CreateChannelOptions = {
    name: string;
    slowMode: ResolvableDate;
    autoArchiveThreads: ResolvableDate;
    parent: ResolvableParent;
    type: ChannelStringTypes;
    topic: string;
    nsfw: boolean;
    bitrate: number;
    userLimit: number;
    position: number;
    videoQualityMode: VideoQualityModeType;
    rtcRegion: string;
    reason: string;
    permissions: PermissionsOverwrite;
};

type ActivityType = 'competing' | 'listening' | 'watching' | 'playing' | 'streaming';

type StatusType = 'online' | 'dnd' | 'idle' | 'offline';

type AvatarResolvable = string | Buffer;

type permissionsEditOptions = {
    AddReactions: boolean;
    Administrator: boolean;
    AttachFiles: boolean;
    BanMembers: boolean;
    ChangeNickname: boolean;
    Connect: boolean;
    CreateInstantInvite: boolean;
    CreatePrivateThreads: boolean;
    CreatePublicThreads: boolean;
    DeafenMembers: boolean;
    EmbedLinks: boolean;
    KickMembers: boolean;
    ManageChannels: boolean;
    ManageEmojisAndStickers: boolean;
    ManageEvents: boolean;
    ManageGuild: boolean;
    ManageGuildExpressions: boolean;
    ManageMessages: boolean;
    ManageNicknames: boolean;
    ManageRoles: boolean;
    ManageThreads: boolean;
    ManageWebhooks: boolean;
    MentionEveryone: boolean;
    ModerateMembers: boolean;
    MoveMembers: boolean;
    MuteMembers: boolean;
    PrioritySpeaker: boolean;
    ReadMessageHistory: boolean;
    RequestToSpeak: boolean;
    SendMessages: boolean;
    SendMessagesInThreads: boolean;
    SendTTSMessages: boolean;
    SendVoiceMessages: boolean;
    Speak: boolean;
    Stream: boolean;
    UseApplicationCommands: boolean;
    UseEmbeddedActivities: boolean;
    UseExternalEmojis: boolean;
    UseExternalSounds: boolean;
    UseExternalStickers: boolean;
    UseSoundboard: boolean;
    UseVAD: boolean;
    ViewAuditLog: boolean;
    ViewChannel: boolean;
    ViewCreatorMonetizationAnalytics: boolean;
    ViewGuildInsights: boolean;
};

type UserResolvable = User | string;

type CommandOptionType = string | number | ChannelType | Role;

type ParentResolvable = CategoryChannel | string;

type ResolvableMemberOrRole = User | Member | Role | string;

type ForumChannelEditOptions = {
    name: string;
    position: number;
    topic: string;
    nsfw: boolean;
    parent: ParentResolvable;
    reason: string;
    slowMode: ResolvableDate;
    autoArchiveThreads: ResolvableDate;
    permissions: PermissionsOverwrite;
};

type TextChannelEditOptions = {
    name: string;
    position: number;
    topic: string;
    nsfw: boolean;
    parent: ParentResolvable;
    reason: string;
    slowMode: ResolvableDate;
    autoArchiveThreads: ResolvableDate;
    permissions: PermissionsOverwrite;
};

type CreateThreadOptions = {
    name: string;
    slowMode: ResolvableDate;
    autoArchiveThreads: ResolvableDate;
    reason: string;
};

type ThreadEditOptions = {
    name: string;
    reason: string;
    slowMode: ResolvableDate;
    autoArchiveThreads: ResolvableDate;
    archived: boolean;
    locked: boolean;
};

type VoiceChannelEditOptions = {
    name: string;
    position: number;
    nsfw: boolean;
    parent: ParentResolvable;
    reason: string;
    bitrate: number;
    userLimit: number;
    slowMode: ResolvableDate;
    videoQualityMode: VideoQualityModeType | number;
    rtcRegion: string;
    permissions: PermissionsOverwrite;
};

type rawTicketInfo = {
    channel: string;
    claimed: boolean | string;
    closed: boolean;
    guild: string;
    category: boolean | string;
}

type ReactionCollectorEvents = {
    end: [];
    collect: [Reaction, User];
}

type InteractionCollectorEvents = {
    end: [];
    collect: [MenuInteraction | ButtonInteraction];
}

type CreateReactionCollectorOptions = {
    filter: (reaction: Reaction, user: User) => boolean;
    max: number;
    time: number;
};

type CreateInteractionCollectorOptions = {
    filter: (interaction: MenuInteraction | ButtonInteraction) => boolean;
    max: number;
    time: number;
};

type BotEvents = {
    menuSelect: [MenuInteraction];
    buttonClick: [ButtonInteraction];
    formSubmit: [FormInteraction];
    roleDelete: [Role, BaseEntry];
    roleUpdate: [Role, Role, BaseEntry];
    roleAdd: [Role, BaseEntry];
    channelDelete: [ChannelType, BaseEntry];
    channelUpdate: [ChannelType, BaseEntry];
    channelAdd: [ChannelType, BaseEntry];
    emojiDelete: [Emoji, BaseEntry];
    emojiUpdate: [Emoji, Emoji, BaseEntry];
    emojiAdd: [Emoji, BaseEntry];
    guildDelete: [Guild];
    guildNameChange: [Guild, Guild, BaseEntry];
    guildDescriptionChange: [Guild, Guild, BaseEntry];
    guildOwnerChange: [Guild, Guild, BaseEntry];
    guildBoost: [Guild, Guild, BaseEntry];
    guildAdd: [Guild];
    inviteCreate: [Invite];
    inviteDelete: [Invite];
    reactionDelete: [Reaction];
    reactionAdd: [Reaction];
    messageUpdate: [Message, Message];
    messageDelete: [Message, User];
    message: [Message];
    membersPrune: [Save<string, Member>, Guild];
    ticketClose: [ChannelType, Buffer, rawTicketInfo];
    levelUp: [Member];
    memberBan: [BanEntry];
    bannerChange: [User, User];
    avatarChange: [User, User];
    discriminatorChange: [User, User];
    usernameChange: [User, User];
    roleChange: [Member, Member, BaseEntry];
    nicknameChange: [Member, Member, BaseEntry];
    memberMuteRemove: [Member, Member, MuteEntry];
    memberMuteAdd: [Member, Member, MuteEntry];
    memberKick: [KickEntry];
    memberLeave: [Member];
    memberAdd: [Member];
    voiceUpdate: [VoiceState, VoiceState];
};

type WebSocketHandlerEvent = {
    connection: [WebSocket, RequestInfo];
};

type WebSocketEvents = {
    message: [string];
    close: [];
};

declare class HTTPEventListener extends EventEmitter{
    on<T>(eventName: T, listener: (request: RequestInfo, response: ResponseInfo) => void);
    once<T>(eventName: T, listener: (request: RequestInfo, response: ResponseInfo) => void);
    emit<T>(eventName: T, listener: (request: RequestInfo, response: ResponseInfo) => void);
}

declare class RequestInfo{
    url: string;
    method: string;
    headers: object;
    query: URLSearchParams;
    body: string | null;
    ip: string;
}

declare class ResponseInfo{
    /**
     * Set the status code of the web page
     * @param statusCode The status code you want to send to the client
     */
    setStatusCode(statusCode: number);

    /**
     * Send the response headers to the client
     * @param headers The response headers
     */
    setHeaders(headers: object);

    /**
     * Send a response to the client
     * @param response The response you want to send
     */
    send(response: string | Buffer);
    
    /**
     * Send a response to the client
     * @param response The response you want to send
     */
    end(response: string | Buffer);

    /**
     * Write a response to the client, but doesn't send it yet, it sends the response after calling the `end` or `send` function
     * @param chunk The response you want to send
     */
    write(chunk: string | Buffer);

    /**
     * Sends a status to the client
     * @param statusCode The status code to send to the client
     * @param headers The response headers to send to the client
     */
    setStatus(statusCode?: number, headers?: object);
}

declare class HTTPServer{
    post: HTTPEventListener;
    get: HTTPEventListener;
    errorMessages: [];
}

declare class WebSocket extends EventEmitter{
    id: string;
    
    /**
     * Sends a message to the client
     * @param data The message to send to the client
     */
    send(data: Buffer | string);

    /**
     * Closes the connection with the client
     */
    close();
    on<T extends keyof WebSocketEvents>(eventName: T, listener: (...args: WebSocketEvents[T]) => void);
    once<T extends keyof WebSocketEvents>(eventName: T, listener: (...args: WebSocketEvents[T]) => void);
    emit<T extends keyof WebSocketEvents>(eventName: T, listener: (...args: WebSocketEvents[T]) => void);
}

declare class WebSocketHandler extends EventEmitter{
    sockets: [];
    errorMessages: [];
    on<T extends keyof WebSocketHandlerEvent>(eventName: T, listener: (...args: WebSocketHandlerEvent[T]) => void);
    once<T extends keyof WebSocketHandlerEvent>(eventName: T, listener: (...args: WebSocketHandlerEvent[T]) => void);
    emit<T extends keyof WebSocketHandlerEvent>(eventName: T, listener: (...args: WebSocketHandlerEvent[T]) => void);
}

declare class ReactionCollector extends EventEmitter{
    on<T extends keyof ReactionCollectorEvents>(eventName: T, listener: (...args: ReactionCollectorEvents[T]) => void);
    once<T extends keyof ReactionCollectorEvents>(eventName: T, listener: (...args: ReactionCollectorEvents[T]) => void);
    emit<T extends keyof ReactionCollectorEvents>(eventName: T, listener: (...args: ReactionCollectorEvents[T]) => void);

    /**
     * Stops collecting new reactions
     */
    stop() : void;

    count: number;
    max: number;
    filter: Function;
    id: string;
    time: number;
}

declare class InteractionCollector extends EventEmitter{
    on<T extends keyof InteractionCollectorEvents>(eventName: T, listener: (...args: InteractionCollectorEvents[T]) => void);
    once<T extends keyof InteractionCollectorEvents>(eventName: T, listener: (...args: InteractionCollectorEvents[T]) => void);
    emit<T extends keyof InteractionCollectorEvents>(eventName: T, listener: (...args: InteractionCollectorEvents[T]) => void);

    /**
     * Stops collecting new reactions
     */
    stop() : void;

    count: number;
    max: number;
    filter: Function;
    id: string;
    time: number;
}

declare class BotEventListener extends EventEmitter{
    on<T extends keyof BotEvents>(eventName: T, listener: (...args: BotEvents[T]) => void);
    once<T extends keyof BotEvents>(eventName: T, listener: (...args: BotEvents[T]) => void);
    emit<T extends keyof BotEvents>(eventName: T, listener: (...args: BotEvents[T]) => void);
}

declare class BotCommandListener extends EventEmitter{
    on<T>(eventName: T, listener: (command: Command, next: Function, abort: Function) => void);
    once<T>(eventName: T, listener: (command: Command, next: Function, abort: Function) => void);
    emit<T>(eventName: T, listener: (command: Command, next: Function, abort: Function) => void);
}

declare class BaseChannel{
    id: string;
    type: ChannelStringTypes;
    created: Date;
    createdTimestamp: number;
    string: string;
    url: string;

    /**
     * Returns a boolean which defines whether the channel is a text channel or not
     */
    isTextChannel() : boolean;

    /**
     * Returns a boolean which defines whether the channel is a voice channel or not
     */
    isVoiceChannel() : boolean;

    /**
     * Returns a boolean which defines whether the channel is a voice stage channel or not
     */
    isVoiceStage() : boolean;

    /**
     * Returns a boolean which defines whether the channel is a DM channel or not
     */
    isDM() : boolean;

    /**
     * Returns a boolean which defines whether the channel is a thread channel or not
     */
    isThread() : boolean;

    /**
     * Returns a boolean which defines whether the channel is a ticket or not
     */
    isTicket() : boolean;

    /**
     * Returns the owner of the ticket if the channel is a ticket as a Member class
     */
    getTicketOwner() : Member | undefined;

    /**
     * Returns information about the ticket if the channel is a ticket
     */
    getTicketInfo() : undefined | {
        channelId: string;
        claimed?: Member | undefined;
        category?: string | undefined;
        owner?: Member;
        closed: boolean;
    };
}

declare class CategoryChannel extends BaseChannel{
    viewable: boolean;
    name: string;
    position: number;
    deletable: boolean;
    guild: Guild;
    guildId: string;
    manageable: boolean;
    permissions: Save<string, Permissions>;
    channels: Save<string, ChannelType>;
    
    /**
     * Deletes the category channel
     */
    delete() : Promise<void>;

    /**
     * Changes the name of the category channel
     * @param name The new name for the category channel
     * @param reason The reason to change the name
     */
    setName(name: string, reason?: string) : Promise<CategoryChannel>;

    /**
     * Changes the order of the categories by changing the position of the category channel
     * @param position The new position of the category channel
     * @param reason The reason to change the position of the category channel
     */
    setPosition(position: number, reason?: string) : Promise<CategoryChannel>;

    /**
     * Updates the category channel in case there were made changes to it
     */
    update() : Promise<CategoryChannel>;
}

declare class GuildChannel extends BaseChannel{
    viewable: boolean;
    name: string;
    guild: Guild;
    guildId: string;
    manageable: boolean;
    position: number;
    deletable: boolean;
    parent?: CategoryChannel | null | undefined;
    parentId?: string | null;
    permissionsLocked: boolean;
    slowMode: number;
    nsfw: boolean;
    permissions: Save<string, Permissions>;

    /**
     * Creates an invite for the specified channel
     * @param options Options to customize the invite
     */
    createInvite(options: CreateInviteOptions) : Promise<Invite>;

    /**
     * Marks or unmarks the channel as NSFW
     * @param nsfw A boolean which defines whether the channel should be NSFW or not
     * @param reason The reason to change the NSFW status
     */
    setNSFW(nsfw?: boolean, reason?: string) : Promise<GuildChannel>;

    /**
     * Deletes the category channel
     */
    delete() : Promise<void>;
    
    /**
     * Changes the name of the channel
     * @param name The new name for the channel
     * @param reason The reason to change the name
     */
    setName(name: string, reason?: string) : Promise<GuildChannel>;

    /**
     * Changes the order of the channels by changing the position of the channel
     * @param position The new position of the channel
     * @param reason The reason to change the position of the channel
     */
    setPosition(position: number, reason?: string) : Promise<GuildChannel>;

    /**
     * Change the parent of the channel
     * @param parent The new parent of the channel
     * @param reason The reason to change the parent of the channel
     */
    setParent(parent: ParentResolvable, reason?: string) : Promise<GuildChannel>;

    /**
     * Synchronize the permissions of the category channel with the current channel
     */
    lockPermissions() : Promise<GuildChannel>;

    /**
     * Get the permissions for a member or a role in this channel
     * @param resolvableMemberOrRole The member or role to get the permissions of
     */
    permissionsFor(resolvableMemberOrRole: ResolvableMemberOrRole) : PermissionsBitField;

    /**
     * Sets a slow mode for this channel
     * @param dateResolvable The slow mode for the channel in miliseconds
     * @param reason The reason to change the slow mode for this channel
     */
    setSlowMode(dateResolvable: ResolvableDate, reason?: string) : Promise<GuildChannel>;
}

declare class ForumChannel extends GuildChannel{
    topic: string;
    autoArchiveThreads: number;
    threads: Save<string, ThreadChannel>;

    /**
     * Changes the topic of the forum channel
     * @param topic The new topic for the forum channel
     * @param reason The reason to change the topic
     */
    setTopic(topic: string, reason?: string) : Promise<ForumChannel>;

    /**
     * Updates the forum channel in case changes have been made to it
     */
    update() : Promise<ForumChannel>;

    /**
     * Change the settings of the forum channel
     * @param options The settings which should be changed for the channel
     */
    edit(options: ForumChannelEditOptions) : Promise<ForumChannel>;

    /**
     * Creates a new thread channel
     * @param options The settings for the thread channel
     */
    createThread(options: CreateThreadOptions) : Promise<ThreadChannel>;
}

declare class TextChannel extends GuildChannel{
    topic: string;
    autoArchiveThreads: number;
    threads: Save<string, ThreadChannel>;
    messages: Save<string, Message>;

    /**
     * Changes the topic of the text channel
     * @param topic The new topic for the text channel
     * @param reason The reason to change the topic
     */
    setTopic(topic: string, reason?: string) : Promise<TextChannel>;

    /**
     * Sends a message in this channel
     * @param content The content of the message to send
     */
    send(...content: [MessageContentType]) : Promise<Message>;

    /**
     * Updates the text channel in case changes have been made to it
     */
    update() : Promise<TextChannel>;

    /**
     * Get a message which was sent in this channel
     * @param messageId The id of the message to get
     */
    getMessage(messageId: string) : Promise<Message>;

    /**
     * Delete an amount of messages in this channel
     * @param amount The amount of messages to delete, max 100 messages per time
     * @param filter A function to filter the messages you'd like to delete from the cache
     */
    deleteMessages(amount: number, filter: ({key, value} : {key: string; value: Message;}) => boolean) : Promise<void>;

    /**
     * Change the settings of the text channel
     * @param options The settings which should be changed for the channel
     */
    edit(options: TextChannelEditOptions) : Promise<TextChannel>;

    /**
     * Creates a new thread channe;
     * @param options The settings for the thread channel
     */
    createThread(options: CreateThreadOptions) : Promise<ThreadChannel>;
}

declare class ThreadChannel extends BaseChannel{
    guild: Guild;
    guildId: string;
    name: string;
    threadArchived: boolean;
    archived?: Date | null;
    archivedTimestamp?: number | null;
    autoArchive?: number | null;
    memberCount: number;
    threadJoined: boolean;
    threadJoinable: boolean;
    editable: boolean;
    locked: boolean;
    sendable: boolean;
    viewable: boolean;
    manageable: boolean;
    slowMode: number;
    parentId?: string | null;
    parent?: CategoryChannel | null | undefined;
    messages: Save<string, Message>;
    members: Save<string, Member>;
    owner: Member;

    /**
     * Returns a boolean which defines whether the channel is archived or not
     */
    isArchived() : boolean;
    
    /**
     * Deletes the thread channel
     */
    delete() : Promise<void>;

    /**
     * Changes the name of the thread channel
     * @param name The new name for the thread channel
     * @param reason The reason to change the name
     */
    setName(name: string, reason?: string) : Promise<ThreadChannel>;
    
    /**
     * Sends a message in this channel
     * @param content The content of the message to send
     */
    send(...content: [MessageContentType]) : Promise<Message>;

    /**
     * Updates the thread channel in case changes have been made to it
     */
    update() : Promise<ThreadChannel>;

    /**
     * Get a message which was sent in this channel
     * @param messageId The id of the message to get
     */
    getMessage(messageId: string) : Promise<Message>;

    /**
     * Delete an amount of messages in this channel
     * @param amount The amount of messages to delete, max 100 messages per time
     * @param filter A function to filter the messages you'd like to delete from the cache
     */
    deleteMessages(amount: number, filter: ({key, value} : {key: string; value: Message;}) => boolean) : Promise<void>;

    /**
     * Joins the thread channel if the bot isn't a participant already
     */
    join() : Promise<ThreadChannel>;

    /**
     * Leaves the thread channel if the bot is a participant
     */
    leave() : Promise<ThreadChannel>;

    /**
     * Pins the thread channel at the top of a forum channel (not possible for text channels)
     * @param reason The reason to pin the thread channel
     */
    pin(reason?: string) : Promise<ThreadChannel>;

    /**
     * Unpins the thread channel from the forum channel (not possible for text channels)
     * @param reason The reason to unpin the thread channel
     */
    unpin(reason?: string) : Promise<ThreadChannel>;

    /**
     * Sends a message to the thread channel
     * @param content The content of the message
     */
    send(...content: [MessageContentType]) : Promise<Message>;

    /**
     * Archives or unarchives the thread channel
     * @param archived A boolean which defines whether the thread channel should be archived or not
     * @param reason The reason to archive or unarchive the thread channel
     */
    setArchived(archived?: boolean, reason?: string) : Promise<ThreadChannel>;
    
    /**
     * Changes the auto archive duration of the thread channel after no activity
     * @param dateResolvable How long it should take before the channel should be archived automatically
     * @param reason The reason to change the duration of the auto archivement
     */
    setAutoArchive(dateResolvable: ResolvableDate, reason?: string) : Promise<ThreadChannel>;

    /**
     * Change the lock status of the thread channel
     * @param locked A boolean which defines whether the thread channel should be locked or not
     * @param reason The reason to lock or unlock the thread channel
     */
    setLocked(locked?: boolean, reason?: string) : Promise<ThreadChannel>;
   
    /**
     * Sets a slow mode for this channel
     * @param dateResolvable The slow mode for the channel in miliseconds
     * @param reason The reason to change the slow mode for this channel
     */
    setSlowMode(dateResolvable: ResolvableDate, reason?: string) : Promise<GuildChannel>;

    /**
     * Changes the settings of the thread channel
     * @param options The settings you'd like to change in the thread channel
     */
    edit(options: ThreadEditOptions) : Promise<ThreadChannel>;
}

declare class StageChannel extends GuildChannel{
    joinable: boolean;
    full: boolean;
    rtcRegion: string;
    bitrate: number;
    userLimit: number;
    videoQualityMode: VideoQualityModeType;
    messages: Save<string, Message>;
    members: Save<string, Member>;

    /**
     * Sends a message to the stage channel
     * @param content The content of the message
     */
    send(...content: [MessageContentType]) : Promise<Message>;

    /**
     * Updates the stage channel in case there were made changes to it
     */
    update() : Promise<StageChannel>;

    /**
     * Delete an amount of messages in this channel
     * @param amount The amount of messages to delete, max 100 messages per time
     * @param filter A function to filter the messages you'd like to delete from the cache
     */
    deleteMessages(amount: number, filter: ({key, value} : {key: string; value: Message;}) => boolean) : Promise<void>;

    /**
     * Changes the settings of the stage channel
     * @param options The settings you'd like to change
     */
    edit(options: VoiceChannelEditOptions) : Promise<StageChannel>;

    /**
     * Changes the stage channel region
     * @param region The region you'd like to set the stage channel to
     * @param reason The reason to change the stage channel region
     */
    setRtcRegion(region: string, reason?: string) : Promise<StageChannel>;

    /**
     * Sets a limit on the amount of members which are allowed to join the stage channel
     * @param limit The amount of members which are allowed to join (min 0, max 99)
     * @param reason The reason to change the user limit
     */
    setUserLimit(limit: number, reason?: string) : Promise<StageChannel>;

    /**
     * Changes the default video quality mode
     * @param qualityMode The video quality mode you'd like to set
     * @param reason The reason to change the video quality mode
     */
    setVideoQuality(qualityMode: VideoQualityModeType, reason?: string) : Promise<StageChannel>;

    /**
     * Changes the bitrate of the stage channel and can improve or worsen the audio quality
     * @param bitrate The bitrate you'd like to set
     * @param reason The reason to change the bitrate
     */
    setBitrate(bitrate: number, reason?: string) : Promise<StageChannel>;
}

declare class VoiceChannel extends GuildChannel{
    joinable: boolean;
    speakable: boolean;
    full: boolean;
    rtcRegion: string;
    bitrate: number;
    userLimit: number;
    videoQuality: string;
    members: Save<string, Member>;
    messages: Save<string, Message>;

    /**
     * Sends a message to the voice channel
     * @param content The content of the message
     */
    send(...content: [MessageContentType]) : Promise<Message>;

    /**
     * Updates the voice channel in case there were made changes to it
     */
    update() : Promise<VoiceChannel>;

    /**
     * Delete an amount of messages in this channel
     * @param amount The amount of messages to delete, max 100 messages per time
     * @param filter A function to filter the messages you'd like to delete from the cache
     */
    deleteMessages(amount: number, filter: ({key, value} : {key: string; value: Message;}) => boolean) : Promise<void>;

    /**
     * Changes the settings of the voice channel
     * @param options The settings you'd like to change
     */
    edit(options: VoiceChannelEditOptions) : Promise<VoiceChannel>;

    /**
     * Changes the voice channel region
     * @param region The region you'd like to set the voice channel to
     * @param reason The reason to change the voice channel region
     */
    setRtcRegion(region: string, reason?: string) : Promise<VoiceChannel>;

    /**
     * Sets a limit on the amount of members which are allowed to join the voice channel
     * @param limit The amount of members which are allowed to join (min 0, max 99)
     * @param reason The reason to change the user limit
     */
    setUserLimit(limit: number, reason?: string) : Promise<VoiceChannel>;

    /**
     * Changes the default video quality mode
     * @param qualityMode The video quality mode you'd like to set
     * @param reason The reason to change the video quality mode
     */
    setVideoQuality(qualityMode: VideoQualityModeType, reason?: string) : Promise<VoiceChannel>;

    /**
     * Changes the bitrate of the voice channel and can improve or worsen the audio quality
     * @param bitrate The bitrate you'd like to set
     * @param reason The reason to change the bitrate
     */
    setBitrate(bitrate: number, reason?: string) : Promise<VoiceChannel>;

    /**
     * Plays a song in the voice channel
     * @param stream The stream to play (YouTube url, stream url or instance of Readable stream)
     */
    playSong(stream: string | Readable) : Promise<void>;

    /**
     * Disconnects from the voice channel if the bot is connected to it
     */
    disconnect() : Promise<void>;

    /**
     * Gets the queue in the voice channel
     */
    getQueue() : Promise<[{
        title: string | null,
        url: string | Readable
    }]>;

    /**
     * Skips the song which is currently playing in the voice channel
     */
    skipSong() : Promise<void>;

    /**
     * Pauses the song which is currently playing
     */
    pauseSong() : Promise<void>;

    /**
     * Resumes the song which was paused
     */
    resumeSong() : Promise<void>;

    /**
     * Shuffles the queue of the voice channel
     */
    shuffle() : Promise<void>;

    /**
     * Loops the song which is currently being played
     */
    setLoop() : Promise<void>;

    /**
     * Disables the loop if it was enabled;
     */
    setUnloop() : Promise<void>;

    /**
     * Loops the whole queue
     */
    setQueueloop() : Promise<void>;

    /**
     * Changes the volume of the song which is being played
     * @param volume A number which defines the volume between 1 and 10
     */
    setVolume(volume: number) : Promise<void>;
}

declare class DirectoryChannel extends BaseChannel{
    guild: Guild;
    guildId: string;
    name: string;
    
    /**
     * Deletes the directory channel
     */
    delete() : Promise<void>;

    /**
     * Updates the directory channel in case there were made changes to it
     */
    update() : Promise<DirectoryChannel>;
}

declare class DMChannel extends BaseChannel{
    id: string;
    user: string;

    /**
     * Sends a DM to the user of the DM channel
     * @param content The content of the message to send
     */
    send(...content: [MessageContentType]) : Promise<Message>;

    /**
     * Updates the directory channel in case there were made changes to it
     */
    update() : Promise<DirectoryChannel>;
}

declare class BanEntry{
    executor: User;
    user: User;
    banned: Date;
    bannedTimestamp: number;
    reason: string;
    guild: Guild;
}

declare class BaseEntry{
    executor: String;
    user?: User;
    reason: string;
    changed: Date;
    changedTimestamp: number;
    guild: Guild;
}

declare class KickEntry{
    executor: User;
    user: User;
    kicked: Date;
    kickedTimestamp: number;
    reason: string;
    guild: Guild;
}

declare class MuteEntry{
    executor: User;
    user: User;
    reason: string;
    muted: Date;
    mutedTimestamp: number;
    guild: Guild;
}

declare class MenuInteraction{
    type: "Menu";
    guild: Guild;
    guildId: string;
    channel: ChannelType;
    channelId: string;
    member: Member;
    memberId: string;
    user: User;
    message: Message;
    messageId: string;
    customId: string;
    id: string;
    values: [string];

    /**
     * Returns a boolean which defines whether the interaction is a button interaction or not
     */
    isButton() : false;

    /**
     * Returns a boolean which defines whether the interaction is a menu interaction or not
     */
    isMenu() : true;

    /**
     * Returns a boolean which defines whether the interaction is a form interaction or not
     */
    isForm() : false;

    /**
     * Tells the API that an update has been made as a result of the menu interaction
     */
    deferUpdate() : Promise<void>;

    /**
     * Change the status of the interaction to 'Bot is thinking' and send a reply later
     */
    deferReply() : Promise<void>;

    /**
     * Deletes a reply if a reply was sent
     */
    deleteReply() : Promise<void>;

    /**
     * Replies or edits the reply to the menu interaction with a message
     * @param content The content of the message to send
     */
    reply(...content: [MessageContentType]) : Promise<Message>;

    /**
     * Replies later to the menu interaction with a normal message
     * @param content The content of the message to send
     */
    followUp(...content: [MessageContentType]) : Promise<Message>;

    /**
     * Updates the original reply of the menu interaction
     * @param content The content of the new message
     */
    update(...content: [MessageContentType]) : Promise<Message>;

    /**
     * Shows a form to the member
     * @param form The form the member who selected a value from the menu should see
     */
    sendForm(form: FormBuilder) : Promise<void>;

    /**
     * Executes a command based on the current interaction
     * @param commandName The name of the command you'd like to execute
     * @param args The arguments you'd like to pass to the command
     */
    executeCommand(commandName: string, args?: [any]) : void;
}

declare class ButtonInteraction{
    type: "Button";
    guild: Guild;
    guildId: string;
    channel: ChannelType;
    channelId: string;
    member: Member;
    memberId: string;
    user: User;
    message: Message;
    messageId: string;
    customId: string;
    id: string;

    /**
     * Returns a boolean which defines whether the interaction is a button interaction or not
     */
    isButton() : true;

    /**
     * Returns a boolean which defines whether the interaction is a menu interaction or not
     */
    isMenu() : false;

    /**
     * Returns a boolean which defines whether the interaction is a form interaction or not
     */
    isForm() : false;

    /**
     * Tells the API that an update has been made as a result of the button interaction
     */
    deferUpdate() : Promise<void>;

    /**
     * Change the status of the interaction to 'Bot is thinking' and send a reply later
     */
    deferReply() : Promise<void>;

    /**
     * Deletes a reply if a reply was sent
     */
    deleteReply() : Promise<void>;

    /**
     * Replies to the button interaction with a message
     * @param content The content of the message to send
     */
    reply(...content: [MessageContentType]) : Promise<Message>;

    /**
     * Replies later to the button interaction with a normal message
     * @param content The content of the message to send
     */
    followUp(...content: [MessageContentType]) : Promise<Message>;

    /**
     * Updates the original reply of the button interaction
     * @param content The content of the new message
     */
    update(...content: [MessageContentType]) : Promise<Message>;

    /**
     * Shows a form to the member
     * @param form The form the member who pressed the button should see
     */
    sendForm(form: FormBuilder) : Promise<void>;

    /**
     * Executes a command based on the current interaction
     * @param commandName The name of the command you'd like to execute
     * @param args The arguments you'd like to pass to the command
     */
    executeCommand(commandName: string, args?: [any]) : void;
}

declare class FormInteraction{
    type: "Form";
    guild: Guild;
    guildId: string;
    channel: ChannelType;
    channelId: string;
    member: Member;
    memberId: string;
    user: User;
    message: Message;
    messageId: string;
    customId: string;
    id: string;
    inputs: [string];

    /**
     * Returns a boolean which defines whether the interaction is a button interaction or not
     */
    isButton() : false;

    /**
     * Returns a boolean which defines whether the interaction is a menu interaction or not
     */
    isMenu() : false;

    /**
     * Returns a boolean which defines whether the interaction is a form interaction or not
     */
    isForm() : true;

    /**
     * Get an input value provided by the member
     * @param customId The custom id of the input
     */
    getInput(customId: string) : string;
    /**
     * Tells the API that an update has been made as a result of the button interaction
     */
    deferUpdate() : Promise<void>;

    /**
     * Change the status of the interaction to 'Bot is thinking' and send a reply later
     */
    deferReply() : Promise<void>;

    /**
     * Deletes a reply if a reply was sent
     */
    deleteReply() : Promise<void>;

    /**
     * Replies to the button interaction with a message
     * @param content The content of the message to send
     */
    reply(...content: [MessageContentType]) : Promise<Message>;

    /**
     * Replies later to the button interaction with a normal message
     * @param content The content of the message to send
     */
    followUp(...content: [MessageContentType]) : Promise<Message>;

    /**
     * Updates the original reply of the button interaction
     * @param content The content of the new message
     */
    update(...content: [MessageContentType]) : Promise<Message>;

    /**
     * Executes a command based on the current interaction
     * @param commandName The name of the command you'd like to execute
     * @param args The arguments you'd like to pass to the command
     */
    executeCommand(commandName: string, args?: [any]) : void;
}

declare class Level{
    xp: number;
    level: number;
    messages: number;

    /**
     * Change the member's XP amount
     * @param amount The new XP amount for the member
     */
    setXP(amount: number) : Promise<Level>;

    /**
     * Change the member's level in the level system
     * @param level The new level for the member
     */
    setLevel(level: number) : Promise<Level>;
}

declare class EconomyBalance{
    bank: number;
    cash: number;
    
    /**
     * Change the bank value of the member's economy balance
     * @param amount The new bank value
     */
    setBank(amount: number) : Promise<EconomyBalance>;

    /**
     * Change the cash value of the member's economy balance
     * @param amount The new cash value
     */
    setCash(amount: number) : Promise<EconomyBalance>;
}

declare class VoiceState{
    member: Member | null | undefined;
    id: string | null;
    connected: boolean;
    selfMute: boolean;
    selfDeaf: boolean;
    selfVideo: boolean;
    streaming: boolean;
    serverMute: boolean;
    serverDeaf: boolean;
    mute: boolean;
    deaf: boolean;
    channelId: string | null;
    guild: Guild;
    guildId: string | undefined;
    channel: ChannelType;
    
    /**
     * Disconnect the member from the voice channel if the member is in a voice channel
     * @param reason The reason to disconnect the member
     */
    disconnect(reason?: string) : Promise<void>;

    /**
     * Server-deaf a member
     * @param deaf A boolean which defines whether the member should be deafed or not
     * @param reason The reason to deaf or undeaf the member
     */
    setDeaf(deaf?: boolean, reason?: string) : Promise<void>;

    /**
     * Server-mute a member
     * @param mute A boolean which defines whether the member should be muted or not
     * @param reason The reason to mute or unmute the user
     */
    setMute(mute?: boolean, reason?: string) : Promise<void>;

    /**
     * Change the voice channel of the member
     * @param channel The channel where you'd like to put the member in
     * @param reason The reason why you want to change the voice channel
     */
    setChannel(channel: string | VoiceChannel | StageChannel, reason?: string) : Promise<void>;
}

declare class Reaction{
    message: Message;
    guild: Guild;
    id: string;
    members: Save<string, Member>;
    emoji: {
        name: string;
        id: string | null;
        animated: boolean | null;
        string: string;
    };
    user: User;

    /**
     * A boolean which defines whether the emoji is a custom emoji or a normal emoji
     */
    isCustomEmoji() : boolean;

    /**
     * Removes the reaction of a user who has reacted with the same emoji
     * @param user The user whose reaction should be removed
     */
    removeReaction(user?: UserResolvable) : Promise<Reaction>;
}

declare class Permissions{
    channel: ChannelType;
    id: string;
    type: 'Member' | 'Role';
    allow: PermissionsBitField;
    deny: PermissionsBitField;
    
    /**
     * Deletes the permissions for the member or role in the channel
     */
    delete() : Promise<void>;

    /**
     * Updates the permissions for the member or role in the channel
     * @param options The permissions which should be changed for the member or role
     * @param reason The reason to change the permissions
     */
    edit(options: permissionsEditOptions, reason?: string) : Promise<Permissions>;
}

declare class Mentions{
    everyone: boolean;
    members: Save<string, Member>;
    roles: Save<string, Role>;
    channels: Save<string, ChannelType>;
}

declare class Emoji{
    animated: boolean;
    guild: Guild;
    creator: User | null | undefined;
    created: Date;
    createdTimestamp: number;
    id: string;
    name: string;
    string: string;

    /**
     * Provides the url of the image of the emoji
     */
    getURL() : string;

    /**
     * Changes the name of the current emoji
     * @param name The new name for the emoji
     * @param reason The reason to change the name of the emoji
     */
    setName(name: string, reason?: string) : Promise<Emoji>;

    /**
     * Deletes the emoji from the guild
     * @param reason The reason to delete the emoji
     */
    delete(reason?: string) : Promise<void>;

    /**
     * Updates the creator of the emoji in case the creator is not defined or has updated in the mean time
     */
    updateCreator() : Promise<Emoji>;
}

declare class Role{
    id: string;
    string: string;
    color: {
        hex: string;
        base: number;
    };
    hoist: boolean;
    position: number;
    name: string;
    created: Date;
    createdTimestamp: number;
    editable: boolean;
    guild: Guild;
    guildId: string;
    permissions: PermissionsBitField;
    mentionable: boolean;

    /**
     * Changes the name of the role
     * @param name The new name for the role
     * @param reason The reason to change the name of the role
     */
    setName(name: string, reason?: string) : Promise<Role>;

    /**
     * Add or remove the hoist from the role
     * @param hoist A boolean which defines whether to enable or disable the hoist
     * @param reason The reason to change the hoist
     */
    setHoist(hoist?: boolean, reason?: string) : Promise<Role>;

    /**
     * Changes the color of the role
     * @param color The new color for the role
     * @param reason The reason to change the color
     */
    setColor(color: string | number, reason?: string) : Promise<Role>;

    /**
     * Changes the order of the roles by changing the position of the current role
     * @param position The position to put the current role in
     * @param reason The reason to change the role's position
     */
    setPosition(position: number, reason?: string) : Promise<Role>;

    /**
     * Change whether the role can be mentioned or not
     * @param mentionable A boolean which defines whether the role can be mentioned or not
     * @param reason The reason to change the role's mentionability
     */
    setMentionable(mentionable?: boolean, reason?: string) : Promise<Role>;

    /**
     * Change the permissions a user has with this role
     * @param permissions An array with permissions users with this role should have
     * @param reason The reason to change the permissions
     */
    setPermissions(permissions: [permissionFlagsBitsObject], reason?: string) : Promise<Role>;

    /**
     * Deletes the role from the guild
     * @param reason The reason to delete the role
     */
    delete(reason?: string) : Promise<void>;
}

declare class Bot{
    username: string;
    avatarURL: string;
    tag: string;
    id: string;
    created: Date;
    createdTimestamp: number;

    /**
     * Set the activity for the bot
     * @param activity The activity you'd like to give the bot
     */
    setActivity(activity: string) : Promise<void>;

    /**
     * Set the activity type of the activity
     * @param activityType The activity type you'd like to set
     */
    setActivityType(activityType: ActivityType) : Promise<void>;

    /**
     * Sets the streaming url for the activity, only if the activity type is set to 'streaming'
     * @param streamURL The url of a stream, only Twitch and YouTube url's are allowed
     */
    setStreamingURL(streamURL: string) : Promise<void>;

    /**
     * Set the type of the bot's status
     * @param statusType The stauts of the bot
     */
    setStatusType(statusType: StatusType) : Promise<void>;

    /**
     * Changes the username of the bot
     * @param username The new username to set for the bot
     */
    setUsername(username: string) : Promise<void>;

    /**
     * Changes the avatar of the bot
     * @param avatar The new avatar for the bot
     */
    setAvatar(avatar: AvatarResolvable) : Promise<void>;
}

declare class Invite{
    url: string;
    code: string;
    inviter: Member;
    inviterId: string;
    expires: Date | null;
    expireTimestamp: number | null;
    created: Date;
    createdTimestamp: number;
    deletable: boolean;
    channel: ChannelType;
    channelId: string;
    guild: Guild;
    uses: number;

    /**
     * Defines whether the invite can be deleted or not
     */
    isDeletable() : boolean;

    /**
     * Deletes the invite
     * @param reason The reason to delete the invite
     */
    delete(reason?: string) : Promise<void>;
}

declare class Guild{
    addon: Addon;
    id: string;
    name: string;
    channels: Save<string, ChannelType>;
    iconURL: string;
    description: string;
    owner: Member;
    ownerId: string;
    verified: boolean;
    verificationLevel: number;
    boosts: number;
    emojis: Save<string, Emoji>;
    roles: Save<string, Role>;
    everyoneRole: Role;
    memberCount: number;
    botAdded: Date;
    botAddedTimestamp: number;
    created: Date;
    createdTimestamp: number;
    voiceStates: Save<string, VoiceState>;
    members: Save<string, Member>;
    moderationRoles: Save<string, Role>;
    ticketRoles: Save<string, Role>;
    joinRoles: Save<string, Role>;
    invites: Save<string, Invite>;

    /**
     * Change the name of the guild
     * @param name The new name of the guild
     */
    setName(name: string) : Promise<Guild>;

    /**
     * Change the icon of the guild
     * @param iconUrl The url of the new icon
     * @param reason The reason to change the icon
     */
    setIcon(iconUrl: string, reason?: string) : Promise<Guild>;

    /**
     * Change the banner of the guild
     * @param bannerUrl The url of the new banner
     * @param reason The reason to change the banner
     */
    setBanner(bannerUrl: string, reason?: string) : Promise<Guild>;

    /**
     * Unban a user from the guild
     * @param userId The id of the user you want to unban
     * @param reason The reason to unban the user
     */
    unban(userId: string, reason?: string) : Promise<Guild>;

    /**
     * Ban a user from the guild
     * @param resolvableMember The member you want to ban
     */
    ban(resolvableMember: ResolvableMember) : Promise<Guild>;

    /**
     * Creates a new emoji in the guild
     * @param options Options for the emoji to create
     */
    createEmoji(options: CreateEmojiOptions) : Promise<Emoji>;

    /**
     * Deletes an emoji from the guild
     * @param resolvableEmoji The emoji you want to delete
     * @param reason The reason to delete the emoji
     */
    deleteEmoji(resolvableEmoji: ResolvableEmoji, reason?: string) : Promise<Emoji>;

    /**
     * Creates a new role in the guild
     * @param options Options for the role to create
     */
    createRole(options: CreateRoleOptions) : Promise<Role>;

    /**
     * Deletes a role from the guild
     * @param resolvableRole The role you want to delete
     * @param reason The reason to delete the role
     */
    deleteRole(resolvableRole: ResolvableRole, reason?: string) : Promise<void>;

    /**
     * Creates a new channel in the guild
     * @param options Options for the channel to create
     */
    createChannel(options: CreateChannelOptions) : Promise<ChannelType>;
}

declare class User{
    id: string;
    string: string;
    username: string;
    tag: string;
    discriminator: string;
    created: Date;
    createdTimestamp: number;
    bot: boolean;
    system: boolean;
    addon: Addon;
    bitfield: number;
    /**
     * Get the user's avatar url
     * @param options Options for the avatar url
     */
    avatarURL(options?: AvatarOptions) : string;

    /**
     * Get the user's banner url
     * @param options Options for the banner url
     */
    bannerURL(options?: BannerOptions) : string;

    /**
     * Updates the user if there were made any changes to the user, when the user updated their username for example
     */
    update() : Promise<User>;

    /**
     * Sends a DM to the user
     * @param content The content for the DM to send
     */
    sendDM(...content: [MessageContentType]) : Promise<Message>;

    /**
     * Gets the DM channel of the user
     */
    getDMChannel() : Promise<DMChannel>;

    /**
     * Gets a Save of the Member classes of every guild the user and the bot are in together
     */
    getMembers() : Save<string, Member>;
}

declare class Member extends User{
    guildId: string;
    guild: Guild;
    roles: Save<string, Role>;
    nickname: string | null;
    displayName: string;
    permissions: PermissionsBitField;
    color: {
        hex: string;
        base: number;
    };
    joinedTimestamp: number;
    joined: Date;
    manageable: boolean;
    moderatable: boolean;
    bannable: boolean;
    kickable: boolean;
    voiceConnected: boolean;
    voice: VoiceState;

    /**
     * Gets the invite information about this member
     */
    getInviteInfo() : {invitedBy?: Member; invites: number; leaves: number; total: number};

    /**
     * Get all the warns the user has received
     */
    getWarns() : [{warnedBy: Member; reason: string; warnedAt: Date; warnedAtTimestamp: number;}];

    /**
     * Returns all the open ticket channels the user has
     */
    getTickets() : Save<string, TextChannel>;

    /**
     * Get the economy balance of the member
     */
    getEconomy() : EconomyBalance;

    /**
     * Get the level info of the member
     */
    getLevel() : Level;

    /**
     * Give the member a timeout so it can't send any messages anymore
     * @param resolvableDate A resolvable date format for the length of the timeout
     * @param reason The reason for the timeout
     */
    setTimeout(resolvableDate: ResolvableDate, reason?: string) : Promise<Member>;

    /**
     * Remove the timeout of the member if it has a timeout
     * @param reason The reason for the removal of the timeout
     */
    removeTimeout(reason?: string) : Promise<Member>;

    /**
     * Whether the user has a timeout or not
     */
    hasTimeout() : boolean;

    /**
     * Returns the timestamp of when the timeouts of the member ends
     */
    timeoutUntil() : number;

    /**
     * Kicks the member from the server
     * @param reason The reason for the kick
     */
    kick(reason?: string) : Promise<Member>;

    /**
     * Bans the member from the server
     * @param banOptions Additional options for the ban
     */
    ban(banOptions?: BanOptions) : Promise<Member>;

    /**
     * Updates the member if there were made changes to the member, when the roles have been updated for example
     */
    update() : Promise<Member>;

    /**
     * The roles that the member should be given
     * @param role An array of the role id's or Role classes or a single Role class or single role id of the role(s) which should be given to the member
     * @param reason The reason to give the roles
     */
    addRole(role: [Role | string] | Role | string, reason?: string) : Promise<Member>;

    /**
     * The roles that the member should be removed from the member
     * @param role An array of the role id's or Role classes or a single Role class or single role id of the role(s) which should be removed from the member
     * @param reason The reason to give the roles
     */
    removeRole(role: [Role | string] | Role | string, reason?: string) : Promise<Member>;

    /**
     * Overwrite all the roles with other roles the user should get
     * @param role An array of the role id's or Role classes or a single Role class or single role id of the role(s) which overwrite the current roles of the member
     * @param reason The reason to set the roles
     */
    setRoles(role: [Role | string] | Role | string, reason?: string) : Promise<Member>;

    /**
     * Returns a boolean which defines whether the user can be banned or not
     */
    isBannable() : boolean;

    /**
     * Returns a boolean which defines whether the user can be kicked or not
     */
    isKickable() : boolean;

    /**
     * Returns a boolean which defines whether the user can be muted or not
     */
    isMuteable() : boolean;
}

declare class Message{
    addon: Addon;
    isMe: boolean;
    guild: User | Guild;
    guildId: string;
    author: Member | User;
    created: Date;
    createdTimestamp: number;
    editable: boolean;
    edited: Date | null;
    editedTimestamp: number | null;
    id: string;
    attachments: Save<string, Attachment>;
    url: string;
    channel: ChannelType;
    channelId: string;
    deletable: boolean;
    mentions: Mentions;
    content: string;
    dm: boolean;

    /**
     * Defines whether the message is a DM message or was sent in a Discord server.
     */
    isDM() : boolean;
    /**
     * Deletes the message
     */
    delete() : Promise<void>;

    /**
     * Reply to the message
     * @param content The content of the reply
     */
    reply(...content: [MessageContentType]) : Promise<Message>;

    /**
     * Edit the current message
     * @param content The content of the new message
     */
    edit(...content: [MessageContentType]) : Promise<Message>;

    /**
     * Reacts to the message with an emoji
     * @param reaction The emoji you'd like the bot to react with, either a string or the Emoji class
     */
    react(reaction: string | Emoji) : Promise<void>;

    /**
     * Removes the attachments of the message
     */
    removeAttachments() : Promise<Message>;

    /**
     * Updates the message content if a user for example has edited the message
     */
    update() : Promise<Message>;

    /**
     * Creates a thread based on the current message
     * @param options The options to customize the thread channel
     */
    createThread(options?: CreateMessageBasedThreadOptions) : Promise<ThreadChannel>;

    /**
     * Executes a command based on the current message
     * @param commandName The name of the command you'd like to execute
     * @param args The arguments you'd like to pass to the command
     */
    executeCommand(commandName: string, args?: [any]) : void;

    /**
     * Collects reactions which meet certain requirements set in the options
     * @param options The requirements the reactions must meet to be collected
     */
    createReactionCollector(options: CreateReactionCollectorOptions) : ReactionCollector;

    /**
     * Collects interactions which meet certain requirements set in the options
     * @param options The requirements the interactions must meet to be collected
     */
    createInteractionCollector(options: CreateInteractionCollectorOptions) : InteractionCollector;
}

declare class Command{
    name: string;
    description: string;
    slashCommand: boolean;
    member: Member;
    memberId: string;
    created: Date;
    createdTimestamp: number;
    guild: Guild;
    guildId: string;
    channel: ChannelType;
    messageId: string | undefined;
    message?: Message | undefined;
    args: [string];
    options: Save<string, CommandOptionType>;

    /**
     * Send a reply to the command
     * @param content The content of the reply
     */
    reply(...content: [MessageContentType]) : Promise<Message>;

    /**
     * Whether the executed command is a slash command or not
     */
    isSlashCommand() : boolean;
    
    /**
     * Executes a command based on the current message
     * @param commandName The name of the command you'd like to execute
     * @param args The arguments you'd like to pass to the command
     */
    executeCommand(commandName: string, args?: [any]) : void;
}

export class InputBuilder{
    /**
     * Creates a new input which members can fill in
     * @param data The data to create the input from
     */
    constructor(data?: {placeholder?: string; custom_id?: string; style?: number | 'short' | 'paragraph'; max_length?: number; min_length?: number; label?: string; value?: string; required?: boolean;});

    /**
     * Sets the label of the input
     * @param label The label you'd like to set for the input
     */
    setLabel(label: string) : InputBuilder;
    
    /**
     * Sets the placeholder of the input
     * @param placeholder The placeholder you'd like to set for the input
     */
    setPlaceholder(placeholder: string) : InputBuilder;
    
    /**
     * Sets the standard value of the input
     * @param label The standard value you'd like to set for the input
     */
    setValue(label: string) : InputBuilder;
    
    /**
     * Sets the minimum amount of characters which must be provided in the input
     * @param minLength The minimum amount of characters which must be provided
     */
    setMinLength(minLength: string) : InputBuilder;
    
    /**
     * Sets the maximum amount of characters which may be provided in the input
     * @param maxLength The maximum amount of characters which may be provided
     */
    setMaxLength(maxLength: string) : InputBuilder;
    
    /**
     * Will define whether the input is required to fill in for the member or not
     * @param boolean A boolean which defines whether the input is required to fill in or not
     */
    setRequired(boolean: boolean) : InputBuilder;
    
    /**
     * Sets a custom id for the input to identify it with later
     * @param customId The custom id you'd like to set for the input
     */
    setCustomId(customId: string) : InputBuilder;

    /**
     * Sets the type of style for the input
     * @param style Whether you'd like a short input style or a paragraph input style for the input
     */
    setStyle(style: 1 | 2 | 'short' | 'paragraph') : InputBuilder;

    toJSON() : {
        type: 4,
        style: number;
        required: boolean;
        min_length: number | null;
        max_length: number | null;
        placeholder: string | null;
        label: string | null;
        value: string | null;
    };

    style: number;
    required: boolean;
    min_length: number | null;
    max_length: number | null;
    placeholder: string | null;
    label: string | null;
    value: string | null;
}

export class FormBuilder{
    /**
     * Creates a new form which members can fill in
     * @param data The data to create the form builder from
     */
    constructor(data?: {title?: string; custom_id?: string; components?: [InputBuilder], inputs?: [InputBuilder]});

    /**
     * Sets the title of the form
     * @param title The title you'd like to set for the form
     */
    setTitle(title: string) : FormBuilder;
    
    /**
     * Sets a custom id for the form to identify it with later
     * @param customId The custom id you'd like to set for the form
     */
    setCustomId(customId: string) : FormBuilder;

    /**
     * Adds inputs to the form for members to fill in
     * @param components The input(s) you'd like to add to the form
     */
    addComponents(...components: [InputBuilder]) : FormBuilder;

    /**
     * Identical to the `addComponents` function. Adds inputs to the form for members to fill in
     * @param inputs The input(s) you'd like to add to the form
     */
    addInputs(...inputs: [InputBuilder]) : FormBuilder;

    custom_id: string | null;
    title: string | null;
    inputs: [{
        type: 4,
        style: number;
        required: boolean;
        min_length: number | null;
        max_length: number | null;
        placeholder: string | null;
        label: string | null;
        value: string | null;
    }];
    components: [{
        type: 4,
        style: number;
        required: boolean;
        min_length: number | null;
        max_length: number | null;
        placeholder: string | null;
        label: string | null;
        value: string | null;
    }];
}

export class ActionRowBuilder{
    /**
     * Creates an Action Row Builder
     * @param data The components to create the Action Row Builder for
     */
    constructor(...data: [ButtonBuilder | SelectMenuBuilder]);

    /**
     * Adds the components to the Action Row Builder
     * @param data The components to add to the Action Row Builder
     */
    addComponents(...data: [ButtonBuilder | SelectMenuBuilder]) : ActionRowBuilder;

    components: [];
}

export class ButtonBuilder{
    /**
     * Creates a Button Builder
     * @param data Additional data to import the Button Builder from
     */
    constructor(data: object);

    /**
     * An id so you can recognize the button when it's being executed
     * @param id The id for the button you'd like to set
     */
    setCustomId(id: string) : ButtonBuilder;

    /**
     * Whether the button should be disabled or not
     * @param disabled A boolean which defines whether the button should be disabled or not
     */
    setDisabled(disabled?: boolean) : ButtonBuilder;

    /**
     * Sets the text for the button
     * @param label The text for the button
     */
    setLabel(label: string) : ButtonBuilder;

    /**
     * Same as the `setLabel` function. Sets the text for the button
     * @param text The text for the button
     */
    setText(text: string) : ButtonBuilder;

    /**
     * How the button should look like
     * @param style The style for the button
     */
    setStyle(style: ButtonStyleType) : ButtonBuilder;

    /**
     * Sets a url for the button
     * @param url The url where the user should go to when the user clicks the button
     */
    setURL(url: string) : ButtonBuilder;

    /**
     * Set an emoji next to the label of the button which is visible for the user
     * @param emoji The emoji for the button
     */
    setEmoji(emoji: string | Emoji) : ButtonBuilder;

    /**
     * Converts the Button Builder into a JSON object
     */
    toJSON() : {
        custom_id: string;
        style: number;
        label: string;
        emoji: null | {
            id: null | string;
            name: string;
            animated: boolean;
        };
        disabled: boolean;
        url: null | string;
        type: number;
    };

    data: {
        custom_id: string;
        style: number;
        label: string;
        emoji: null | {
            id: null | string;
            name: string;
            animated: boolean;
        };
        disabled: boolean;
        url: null | string;
        type: number;
    };
}

export class SelectMenuOptionBuilder{
    /**
     * Creates a Select Menu Option Builder
     * @param data Additional data to import the Select Menu Option Builder from
     */
    constructor(data: object);

    /**
     * A value so you can recognize the options that the user selects
     * @param value The value for the option
     */
    setValue(value: string) : SelectMenuOptionBuilder;

    /**
     * Same as the `setValue` function. A value so you can recognize the options that the user selects
     * @param value The value for the option
     */
    setCustomId(id: string) : SelectMenuOptionBuilder;

    /**
     * Set the label for the option which is visible for the user
     * @param label The label for the option
     */
    setLabel(label: string) : SelectMenuOptionBuilder;

    /**
     * Same as the `setLabel` function. Set the label for the option which is visible for the user
     * @param label The label for the option
     */
    setText(text: string) : SelectMenuOptionBuilder;

    /**
     * Set an emoji next to the label of the option which is visible for the user
     * @param emoji The emoji for the option
     */
    setEmoji(emoji: string | Emoji) : SelectMenuOptionBuilder;

    /**
     * Whether to set the option as the default option or not
     * @param defaultOption A boolean which defines whether the option is the default option in the menu or not
     */
    setDefault(defaultOption?: boolean) : SelectMenuOptionBuilder;

    /**
     * A description for the user so the user understand better what the option will do
     * @param description The description for the option
     */
    setDescription(description: string) : SelectMenuOptionBuilder;

    /**
     * Converts the Select Menu Option Builder into a JSON object
     */
    toJSON() : {
        label: null | string;
        value: null | string;
        emoji: null | {
            id: null | string;
            name: string;
            animated: boolean;
        };
        description: null | string;
        default: boolean;
    }

    data: {
        label: null | string;
        value: null | string;
        emoji: null | {
            id: null | string;
            name: string;
            animated: boolean;
        };
        description: null | string;
        default: boolean;
    };
}

export class SelectMenuBuilder{
    /**
     * Creates a Select Menu
     * @param data Additional data to import the Select Menu from
     */
    constructor(data: object);

    /**
     * Set a custom id to the select menu so you can recognize them when a menu is being executed
     * @param id The custom id you'd like to set
     */
    setCustomId(id: string) : SelectMenuBuilder;

    /**
     * Set a placeholder for the select menu when no option is selected
     * @param placeholder The placeholder you'd like to set
     */
    setPlaceholder(placeholder: string) : SelectMenuBuilder;

    /**
     * Whether the select menu should be disabled or not
     * @param disabled A boolean which defines whether the select menu should be disabled or not
     */
    setDisabled(disabled?: boolean) : SelectMenuBuilder;

    /**
     * Set the minimum amount of options which a user should select
     * @param minimum The minimum amount of options
     */
    setMinValues(minimum: number) : SelectMenuBuilder;

    /**
     * Set a maximum amount of options which a user may select
     * @param maximum The maximum amount of options
     */
    setMaxValues(maximum: number) : SelectMenuBuilder;

    /**
     * The options a user can choose between
     * @param options An array or argument with the SelectMenuOptionBuilder class which defines an option
     */
    setOptions(...options: [SelectMenuOptionBuilder]) : SelectMenuBuilder;

    /**
     * Converts the Select Menu Builder into a JSON object
     */
    toJSON() : {
        custom_id: string;
        options: [SelectMenuOptionBuilder | undefined];
        placeholder: null | string;
        min_values: number;
        max_values: number;
        disabled: boolean;
        type: number;
    };

    data: {
        custom_id: string;
        options: [SelectMenuOptionBuilder | undefined];
        placeholder: null | string;
        min_values: number;
        max_values: number;
        disabled: boolean;
        type: number;
    };
}

export class CommandOptionChoiceBuilder{
    /**
     * Creates a Command Option
     * @param data  Additional data to import the Command Option Choice Builder from
     */
    constructor(data: object);

    /**
     * Set the command option choice name
     * @param name The name of the command option choice
     */
    setName(name: string) : CommandOptionChoiceBuilder;

    /**
     * Set the command option choice value
     * @param value The value of the command option choice
     */
    setValue(value: string) : CommandOptionChoiceBuilder;

    /**
     * Convert the command option choice builder into a JSON object
     */
    toJSON() : {
        name: string;
        value: string;
    };

    name: string;
    value: string;
}

export class CommandOptionsBuilder{
    /**
     * Creates a Command Options Builder
     * @param data Additional data to import the Command Options Builder from
     */
    constructor(data: object);

    /**
     * Set the command option type
     * @param type The type of the option
     */
    setOptionType(type: number) : CommandOptionsBuilder;

    /**
     * Sets the name of the command option
     * @param name The command option's name
     */
    setName(name: string) : CommandOptionsBuilder;

    /**
     * Set the description of the command option
     * @param description The command option's description
     */
    setDescription(description: string) : CommandOptionsBuilder;

    /**
     * Whether or not the option is required to fill in
     * @param required A boolean which shows whether the command option is required or not
     */
    setRequired(required?: boolean) : CommandOptionsBuilder;

    /**
     * The choices the member can pick between for the option
     * @param choices The choices the member can pick between for the option
     */
    addChoices(...choices: [CommandOptionChoiceBuilder]) : CommandOptionsBuilder;

    /**
     * Add options if the command option type is a subcommand or subcommand group
     * @param options The (group)subcommand's options
     */
    addOptions(...options: [CommandOptionsBuilder]) : CommandOptionsBuilder;

    /**
     * The type of channels which will show for a channel command option
     * @param channelTypes The type of channels
     */
    addChannelTypes(...channelTypes: [number]) : CommandOptionsBuilder;

    /**
     * Set a minimum number for if the command option type is a number
     * @param min The minimum number
     */
    setMinValue(min: number) : CommandOptionsBuilder;

    /**
     * Set a maximum number for if the command option type is a number
     * @param max The maximum number
     */
    setMaxValue(max: number) : CommandOptionsBuilder;

    /**
     * Set a minimum length for if the command option type is a string
     * @param min The minimum length
     */
    setMinLength(min: number) : CommandOptionsBuilder;

    /**
     * Set a maximum length for if the command option type is a string
     * @param max The maximum length
     */
    setMaxLength(max: number) : CommandOptionsBuilder;

    /**
     * Convert the Command Options Builder into a JSON object
     */
    toJSON() : {
        name: string;
        description: string;
        required: boolean;
        choices: [];
        channelTypes: [];
        type: number;
        minValue: number | undefined;
        maxValue: number | undefined;
        minLength: number | undefined;
        maxLength: number | undefined;
    };

    name: string;
    description: string;
    required: boolean;
    choices: [];
    channelTypes: [];
    type: number;
    minValue: number | undefined;
    maxValue: number | undefined;
    minLength: number | undefined;
    maxLength: number | undefined;
}

export class CommandBuilder{
    /**
     * Creates a Command Builder
     * @param data Additional data to import the Command Builder from
     */
    constructor(data: object);
    /**
     * The name to give the command
     * @param name The command's name
     */
    setName(name: string) : CommandBuilder;
    /**
     * The description to give the command
     * @param description The command's description
     */
    setDescription(description: string) : CommandBuilder;
    /**
     * Sets the category of the command 
     * @param category The category to set for the command
     */
    setCategory(category: CategoryOption) : CommandBuilder;
    /**
     * Any additional options for the command
     * @param options The command's options
     */
    addOptions(...options: [CommandOptionsBuilder]) : CommandBuilder;

    /**
     * Add a permission to the command so only members with a certain permission can execute the command
     * @param permission The permission a member needs
     */
    setPermission(permission: PermissionFlags) : CommandBuilder;

    /**
     * Whether or not the command should be NSFW
     * @param nsfw Whether or not the command is NSFW
     */
    setNSFW(nsfw?: boolean) : CommandBuilder;

    /**
     * Whether or not the bot should overwrite other commands with the same name
     * @param overwrite Whether or not the bot should overwrite other commands with the same name
     */
    setOverwrite(overwrite?: boolean) : CommandBuilder;

    /**
     * Convert the Command Option builder into a JSON object
     */
    toJSON() : {
        name: string;
        description: string;
        options: [];
        nsfw: boolean;
        permission: string;
        default_member_permissions: boolean;
        overwrite: boolean;
        category: CategoryOption;
    };

    name: string;
    description: string;
    options: [];
    nsfw: boolean;
    permission: string | null;
    default_member_permissions: boolean;
    overwrite: boolean;
    category: CategoryOption;
}

declare class CommandHandler extends EventEmitter{

    on<T extends keyof CommandEvents>(eventName: T, listener: (...args: CommandEvents[T]) => void);
    once<T extends keyof CommandEvents>(eventName: T, listener: (...args: CommandEvents[T]) => void);
    emit<T extends keyof CommandEvents>(eventName: T, listener: (...args: CommandEvents[T]) => void);

    name: string;
    description: string;
    id: string;
    options: [];
    category: string | null;
    dm_permission: boolean;
    permissions: string | null;
    nsfw: boolean;
    overwrite: boolean;
}

export declare class Save<K, V> extends Map<K, V>{
    /**
     * Creates a new Save
     * @param data Data which can be imported from a Map(-based class), ValueSaver, Array or an object
     */
    constructor(data: SaveDataType);

    /**
     * The first value that has been set
     */
    first() : any;

    /**
     * The last value that has been set
     */
    last() : any;

    /**
     * The first key that has been set
     */
    firstKey() : any;

    /**
     * The last key that has been set
     */
    lastKey() : any;

    /**
     * Converts the Save to an object with the structure key => value
     */
    toObject() : object;

    /**
     * Converts the Save to an Array which has objects inside it. All the objects have one key and one value.
     */
    toArray() : [object];

    /**
     * Converts the Save to a ValueSaver readable array. The array has several objects which all have two keys, named 'key' and 'value'.
     */
    toReadableArray() : [{key: any, value: any}];

    /**
     * Creates a new Save with only the items that meet the requirements of the filter
     * @param filter A filter function which has certain requirements for the new Save
     */
    filter(filter: ({key, value}: {key: any; value: any;}) => boolean) : Save<any, any>;
}

export class Addon extends EventEmitter{
    /**
     * Creates an addon and allows the developer to start using the data of the bot
     * @param options Required options to add for your bot
     */
    constructor(options: addonOptions);

    /**
     * Creates an executable command for the users
     * @param command The command builder which has the structure for the command
     */
    createCommand(command: CommandBuilder) : Promise<CommandHandler>;

    /**
     * Removes a command which was previously created by this addon
     * @param commandName The name of the command you'd like to remove
     */
    removeCommand(commandName: string) : Promise<void>;

    /**
     * Creates an event listener which listens to events of the bot
     */
    createEventListener() : BotEventListener;
    /**
     * Creates an event listener which listens to commands and can interrupt the executed command
     */
    createCommandListener() : BotCommandListener;

    /**
     * Gets an object which allows you to change the bot's settings like username and avatar
     */
    getBot() : Promise<Bot>;
    
    /**
     * Gets the HTTP server of the bot if this has been set by the bot's owner and allows you to create web pages for the bot
     */
    getHTTPServer() : Promise<HTTPServer>;

    /**
     * Gets the WebSocket server of the bot if this has been set by the bot's owner and allows you to communicate with users who are connected to the WebSocket server
     */
    getWSServer() : Promise<WebSocketHandler>;

    /**
     * Gets the raw data of the saves of the bot
     */
    getRawSaves() : Promise<{
        tickets: Save<string, [object]>,
        level: Save<string, [object]>,
        economy: Save<string, [object]>,
        afk: Save<string, [object]>,
        badwords: Save<string, [string]>,
        giveaways: Save<string, object>,
        reactrole: Save<string, [object]>,
        suggestions: Save<string, object>,
        warns: Save<string, [object]>
    }>;

    /**
     * Returns an object with the structure of a command
     * @param commandName The name of the command you'd like to get the structure of
     */
    getCommandData(commandName: string) : Promise<{
        name: string;
        description?: string;
        nsfw: boolean;
        dm_permission: boolean;
        permissions?: string | null | undefined;
        overwrite: boolean;
        category: string;
        options: [{
            name: string;
            description: string;
            options: [];
            nsfw: boolean;
            permission: string;
            default_member_permissions: boolean;
            overwrite: boolean;
            category: CategoryOption;
        }]
    } | undefined>;

    on<T extends keyof AddonEvents>(eventName: T, listener: (...args: AddonEvents[T]) => void);
    once<T extends keyof AddonEvents>(eventName: T, listener: (...args: AddonEvents[T]) => void);
    emit<T extends keyof AddonEvents>(eventName: T, listener: (...args: AddonEvents[T]) => void);

    name: string;
    description: string;
    version: string;
    author: string;
    permissions: number;
    ready: boolean;
    guilds: Save<string, Guild>;
    channels: Save<string, ChannelType>;
    commands: Save<string, CommandHandler>;
}

type permissionFlagsBitsObject = {
    AddReactions: bigint;
    Administrator: bigint;
    AttachFiles: bigint;
    BanMembers: bigint;
    ChangeNickname: bigint;
    Connect: bigint;
    CreateInstantInvite: bigint;
    CreatePrivateThreads: bigint;
    CreatePublicThreads: bigint;
    DeafenMembers: bigint;
    EmbedLinks: bigint;
    KickMembers: bigint;
    ManageChannels: bigint;
    ManageEmojisAndStickers: bigint;
    ManageEvents: bigint;
    ManageGuild: bigint;
    ManageGuildExpressions: bigint;
    ManageMessages: bigint;
    ManageNicknames: bigint;
    ManageRoles: bigint;
    ManageThreads: bigint;
    ManageWebhooks: bigint;
    MentionEveryone: bigint;
    ModerateMembers: bigint;
    MoveMembers: bigint;
    MuteMembers: bigint;
    PrioritySpeaker: bigint;
    ReadMessageHistory: bigint;
    RequestToSpeak: bigint;
    SendMessages: bigint;
    SendMessagesInThreads: bigint;
    SendTTSMessages: bigint;
    SendVoiceMessages: bigint;
    Speak: bigint;
    Stream: bigint;
    UseApplicationCommands: bigint;
    UseEmbeddedActivities: bigint;
    UseExternalEmojis: bigint;
    UseExternalSounds: bigint;
    UseExternalStickers: bigint;
    UseSoundboard: bigint;
    UseVAD: bigint;
    ViewAuditLog: bigint;
    ViewChannel: bigint;
    ViewCreatorMonetizationAnalytics: bigint;
    ViewGuildInsights: bigint;
};

declare let permissionsBitfield: permissionFlagsBitsObject;

type bitfieldObject = {
    COMMANDS: 1,
    MEMBERS: 2,
    MESSAGES: 4,
    KICKS: 8,
    BANS: 16,
    GUILDS: 32,
    CHANNELS: 64,
    SAVES: 128,
    ADDONS: 256,
    EMOJIS: 512,
    ROLES: 1024,
    SERVERS: 2048,
    BOT: 4096,
    INTERACTIONS: 8192
};

declare let bitfield: bitfieldObject;

type channelTypesObject = {
    GUILD_TEXT: 0,
    DM: 1,
    GUILD_VOICE: 2,
    GROUP_DM: 3,
    GUILD_CATEGORY: 4,
    GUILD_ANNOUNCEMENT: 5,
    ANNOUNCEMENT_THREAD: 10,
    PUBLIC_THREAD: 11,
    PRIVATE_THREAD: 12,
    GUILD_STAGE_VOICE: 13,
    GUILD_DIRECTORY: 14,
    GUILD_FORUM: 15
};

declare let ChannelTypes: channelTypesObject;

type commandOptionTypesObject = {
    SUB_COMMAND: 1,
    SUB_COMMAND_GROUP: 2,
    STRING: 3,
    INTEGER: 4,
    BOOLEAN: 5,
    USER: 6,
    CHANNEL: 7,
    ROLE: 8,
    MENTIONABLE: 9,
    NUMBER: 10,
    ATTACHMENT: 11
};

declare let CommandOptionTypes: commandOptionTypesObject;

export class Embed extends EmbedBuilder{}

export { permissionsBitfield, bitfield, ChannelTypes, CommandOptionTypes };
