const { log } = require('../../logger/logger');

module.exports = {
  config: {
    name: 'uid',
    version: '1.0',
    author: 'Hridoy',
    countDown: 5,
    prefix: true,
    adminOnly: false,
    aliases: ['id', 'userid'],
    description: 'Get the user ID of the sender',
    category: 'utility',
    guide: {
      en: '   {pn}'
    },
  },
  onStart: async ({ event, api }) => {
    try {
      const userID = event.senderID;
      api.sendMessage(`Your UID: ${userID}`, event.threadID);
      log('info', `UID command executed by ${userID}`);
    } catch (error) {
      log('error', `UID command error: ${error.message}`);
      api.sendMessage('An error occurred while fetching the UID.', event.threadID);
    }
  },
};