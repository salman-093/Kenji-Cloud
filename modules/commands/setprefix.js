const { Threads } = require('../../database/database');

module.exports = {
  config: {
    name: 'setprefix',
    version: '1.0',
    author: 'Hridoy',
    countDown: 5,
    prefix: true,
    groupAdminOnly: true,
    description: 'Sets a custom prefix for the current group.',
    category: 'group',
    guide: {
      en: '   {pn} [new_prefix]'
    },
  },
  onStart: async ({ api, event, args }) => {
    try {
      const newPrefix = args[0];

      if (!newPrefix) {
        return api.sendMessage('Please provide a new prefix.', event.threadID);
      }

      const threadData = Threads.get(event.threadID);
      if (!threadData) {
        return api.sendMessage('Could not find thread data.', event.threadID);
      }

      threadData.settings.prefix = newPrefix;
      Threads.set(event.threadID, threadData);

      api.sendMessage(`The prefix for this group has been set to: '${newPrefix}'.`, event.threadID);

    } catch (error) {
      console.error("Error in setprefix command:", error);
      api.sendMessage('An error occurred while setting the prefix.', event.threadID);
    }
  },
};