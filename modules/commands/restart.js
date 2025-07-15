const fs = require('fs');

module.exports = {
  config: {
    name: 'restart',
    version: '1.1',
    author: 'Hridoy',
    countDown: 5,
    prefix: true,
    adminOnly: true,
    description: 'Restart the bot and show restart time.',
    category: 'admin',
    guide: {
      en: '   {pn}'
    },
  },
  onStart: async ({ message, event, api, config }) => {
    try {
      const restartInfo = {
        startTime: Date.now(),
        threadID: event.threadID
      };
      fs.writeFileSync('./restart.json', JSON.stringify(restartInfo));

      api.sendMessage(`Restarting ${config.botName}...`, event.threadID, () => {
        process.exit(2); 
      });

    } catch (error) {
      console.log(error);
    }
  },
};