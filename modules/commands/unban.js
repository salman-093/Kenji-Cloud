const { Users } = require('../../database/database');

module.exports = {
  config: {
    name: 'unban',
    version: '1.0',
    author: 'Hridoy',
    countDown: 5,
    prefix: true,
    adminOnly: true,
    description: 'Unbans a user from using bot commands.',
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
        return api.sendMessage('Please provide a UID or mention a user to unban.', event.threadID);
      }

      const userData = Users.get(targetUID);
      if (!userData) {
        return api.sendMessage('User not found in database.', event.threadID);
      }

      if (!userData.isBanned) {
        return api.sendMessage('User is not banned.', event.threadID);
      }

      userData.isBanned = false;
      Users.set(targetUID, userData);
      api.sendMessage(`User ${targetUID} has been unbanned.`, event.threadID);

    } catch (error) {
      console.error("Error in unban command:", error);
      api.sendMessage('An error occurred while unbanning the user.', event.threadID);
    }
  },
};