module.exports = {
    bitfield: {
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
    },
    strings: {
        COMMANDS: "Create commands, detect when a command get's executed and make possible changes to them",
        MEMBERS: "Detect changes to members and make changes to them",
        MESSAGES: "Read messages that are send and make changes to them",
        KICKS: "Detect when a member gets kicked",
        BANS: "Detect when a member gets banned",
        GUILDS: "Read and make changes to guilds",
        CHANNELS: "Read and make changes to the channels the bot has access to",
        SAVES: "Read all the data that has been saved and save or delete data",
        ADDONS: "Read all other registered addons and make changes to them",
        EMOJIS: "Create, edit and delete emoji's for guilds",
        ROLES: "Create, edit and delete roles in a guild",
        SERVERS: "Start a HTTP or WebSocket server and handle requests of the server",
        BOT: "Make changes to the bot",
        INTERACTIONS: "Detect interactions like buttons or menu's, get information about them and reply to them"
    }
}
