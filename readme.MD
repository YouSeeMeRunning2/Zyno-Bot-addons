# Zyno Bot addons
Zyno Bot provides a library, based on the Discord.js library, which allows you to easily create addons for your bot. This library is by default installed on all the bots.

> The Zyno Bot addons library is supported for Zyno Bot version 1.6.0 and higher

## Creating an addon
Addons can easily be created. The library has an `Addon` class which creates a new addon. To create an addon, you are required to give your addon a name, add a description which tells what your addon does, add a version, provide an author and add which permissions your addon needs. Before the addon is created, the bot will ask the owner of the bot whether to allow the addon or not. When the addon was allowed by the bot's owner, the addon will start. It's also important to have a good file routing. Your addon must be uploaded in the `/addons/` folder as a folder. Only the file inside that folder named `index.js` will be executed by the bot. Any additional files which should be executed, must be executed in the `index.js` file of your addon.

Example of an addon:

File routing: `/home/container/addons/My cool new addon/index.js`
```js
const addons = require('zyno-bot-addons');

const addon = new addons.Addon({
    name: 'My cool new addon', // The name of the addon
    description: 'This is a test addon to demonstrate how the addon system works', // The description of what the addon does
    version: '1.0.0', // The version of the addon
    author: 'Luuk', // The author of the addon
    bitfield: [addons.bitfield.COMMANDS] // An array of the permissions it needs
});

addon.once('ready', () => {
    // The addon will now start

    const commandBuilder = addons.CommandBuilder()
    .setName('mycommand')
    .setDescription('This is a command created by the addon system');

    // A new command will be added named 'mycommand'
    addon.createCommand(commandBuilder).then(cmd => {
        cmd.on('execute', command => {
            // When the command gets executed, it will respond with the text 'Hello world!'
            command.reply('Hello world!').catch(console.log);
        });
    }).catch(err => {
        console.log(`There was an error while adding the command:`, err);
    })
});
```

## Full documentation
You can find all of our documentation herre, [Wiki](https://app.gitbook.com/o/0jghZSCj9Fij6BhhPLy5/s/H32pcDz3SxP8UThFTci3/our-bots/zyno-bot/addons)
