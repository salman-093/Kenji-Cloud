const { Users } = require('../../database/database');

module.exports = {
  config: {
    name: 'banlist',
    version: '1.0',
    author: 'Hridoy',
    countDown: 5,
    prefix: true,
    description: 'Lists all banned users.',
    category: 'utility',
    guide: {
      en: '   {pn}'
    },
  },
  onStart: async ({ api, event }) => {
    try {
      const allUsers = Users.getAll(); 
      const bannedUsers = Object.values(allUsers).filter(user => user.isBanned);

      if (bannedUsers.length === 0) {
        return api.sendMessage('No users are currently banned.', event.threadID);
      }

      let banListMessage = '--- Banned Users ---\n';
      bannedUsers.forEach(user => {
        banListMessage += `- ${user.name} (UID: ${user.userID})\n`;
      });

      api.sendMessage(banListMessage, event.threadID);

    } catch (error) {
      console.error("Error in banlist command:", error);
      api.sendMessage('An error occurred while fetching the ban list.', event.threadID);
    }
  },
};