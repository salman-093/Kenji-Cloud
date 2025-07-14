const fs = require('fs-extra');

module.exports = {
  config: {
    name: 'adminonly',
    version: '1.0',
    author: 'Hridoy',
    countDown: 5,
    prefix: true,
    adminOnly: true,
    description: 'Toggles admin-only mode for the bot.',
    category: 'admin',
    guide: {
      en: '   {pn} [true|false]',
    },
  },

  onStart: async ({ api, event, args }) => {
    try {
      if (args.length === 0) {
        return api.sendMessage(
          `Admin-only mode is currently: ${global.client.config.adminOnlyMode}. Use '${global.client.config.prefix}adminonly true' or '${global.client.config.prefix}adminonly false' to change.`,
          event.threadID
        );
      }

      const newState = args[0].toLowerCase();
      if (newState !== 'true' && newState !== 'false') {
        return api.sendMessage("Invalid argument. Please use 'true' or 'false'.", event.threadID);
      }

      global.client.config.adminOnlyMode = (newState === 'true');
      fs.writeJsonSync('./config/config.json', global.client.config, { spaces: 2 });

      api.sendMessage(
        `Admin-only mode has been set to: ${global.client.config.adminOnlyMode}.`,
        event.threadID
      );

    } catch (error) {
      console.error("Error in adminonly command:", error);
      api.sendMessage('An error occurred while changing admin-only mode.', event.threadID);
    }
  },
};
