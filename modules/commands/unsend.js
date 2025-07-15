const { log } = require('../../logger/logger');

module.exports = {
  config: {
    name: 'unsend',
    version: '1.0',
    author: 'Hridoy',
    countDown: 5,
    prefix: true,
    adminOnly: true, 
    description: 'Unsend a message by replying to it.',
    category: 'admin',
    guide: {
      en: '   {pn} (Reply to the message you want to unsend)'
    },
    languages: {
      en: {
        noReply: 'Please reply to the message you want to unsend.',
        unsendSuccess: 'Successfully unsent the message.',
        unsendFail: 'Failed to unsend the message. It might not be a bots message or an error occurred.',
        notAdmin: 'You do not have permission to use this command.'
      }
    }
  },
  onStart: async ({ event, api, args }) => {
    const config = global.client.config;
    const adminUIDs = config.adminUIDs || [];

    if (!adminUIDs.includes(event.senderID)) {
      return api.sendMessage(global.client.commands.get('unsend').config.languages.en.notAdmin, event.threadID, event.messageID);
    }

    if (!event.messageReply) {
      return api.sendMessage(global.client.commands.get('unsend').config.languages.en.noReply, event.threadID, event.messageID);
    }

    const messageIDToUnsend = event.messageReply.messageID;

    try {
      await api.unsendMessage(messageIDToUnsend);
      api.sendMessage(global.client.commands.get('unsend').config.languages.en.unsendSuccess, event.threadID);
      log('info', `Unsend command executed by ${event.senderID} for message ID: ${messageIDToUnsend}`);
    } catch (error) {
      log('error', `Unsend command error: ${error.message}`);
      api.sendMessage(global.client.commands.get('unsend').config.languages.en.unsendFail, event.threadID);
    }
  }
};