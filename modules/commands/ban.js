const { Users } = require('../../database/database');

module.exports = {
  config: {
    name: 'ban',
    version: '1.0',
    author: 'Hridoy',
    countDown: 5,
    prefix: true,
    adminOnly: true,
    description: 'Bans a user from using bot commands.',
    category: 'admin',
    guide: {
      en: '   {pn} [uid|@mention]'
    },
  },
  onStart: async ({ api, event, args }) => {
    try {
      let targetUID;

      if (event.mentions && Object.keys(event.mentions).length > 0) {
        targetUID = Object.keys(event.mentions)[0];
      } else if (args.length > 0) {
        targetUID = args[0];
      } else {
        return api.sendMessage('Please provide a UID or mention a user to ban.', event.threadID);
      }

      const userData = Users.get(targetUID);
      if (!userData) {
        return api.sendMessage('User not found in database.', event.threadID);
      }

      if (userData.isBanned) {
        return api.sendMessage('User is already banned.', event.threadID);
      }

      userData.isBanned = true;
      Users.set(targetUID, userData);
      api.sendMessage(`User ${targetUID} has been banned from using bot commands.`, event.threadID);

    } catch (error) {
      console.error("Error in ban command:", error);
      api.sendMessage('An error occurred while banning the user.', event.threadID);
    }
  },
};