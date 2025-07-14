const { validateInput } = require('../../func/utils');
const { log } = require('../../logger/logger');

module.exports = {
  config: {
    name: 'adduser',
    version: '1.5',
    author: 'Hridoy',
    countDown: 5,
    prefix: true,
    adminOnly: false,
    aliases: ['au', 'addu'],
    description: 'Add user to box chat of you',
    category: 'box chat',
    guide: {
      en: '   {pn} [link profile | uid]'
    },
  },
  onStart: async ({ message, args, event, api, Users, Threads, config }) => {
    try {
      if (!args[0]) {
        return api.sendMessage('Please provide a user ID or profile link.', event.threadID);
      }

      const userID = args[0].match(/\d+$/)?.[0] || args[0];
      if (!validateInput(userID)) {
        return api.sendMessage('Invalid user ID.', event.threadID);
      }

      await api.addUserToGroup(userID, event.threadID, (err) => {
        if (err) {
          log('error', `Failed to add user ${userID}: ${err.message}`);
          return api.sendMessage('Failed to add user to group.', event.threadID);
        }
        api.sendMessage(`User ${userID} added to group.`, event.threadID);
        log('info', `User ${userID} added to group ${event.threadID}`);
      });
    } catch (error) {
      log('error', `Adduser error: ${error.message}`);
      api.sendMessage('An error occurred while adding the user.', event.threadID);
    }
  },
};