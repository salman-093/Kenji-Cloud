const axios = require('axios');

module.exports = {
  config: {
    name: 'train',
    version: '1.0',
    author: 'Hridoy',
    countDown: 5,
    prefix: true,
    adminOnly: false,
    aliases: [],
    description: 'Train the bot with question and answer',
    category: 'utility',
    guide: {
      en: '{pn}train {question} | {answer}'
    },
  },
  onStart: async ({ message, args, event, api, Users, config }) => {
    try {
      const trainData = args.join(' ').split('|');
      if (trainData.length !== 2) {
        return api.sendMessage('Invalid format. Use {pn}train {question} | {answer}', event.threadID);
      }
      const question = trainData[0].trim();
      const answer = trainData[1].trim();
      const language = config.language || 'en';
      const url = `https://simsim-nexalo.vercel.app/api/train/${encodeURIComponent(question)}/${encodeURIComponent(answer)}/${language}`;

      const response = await axios.get(url);

      if (response.data && response.data.message === 'Training entry added') {
        const userInfo = await api.getUserInfo(event.senderID);
        const teacher = userInfo[event.senderID].name;
        const msg = `❓ Question: ${question}\n👉 Answer: ${answer}\n🧑‍🏫 Teacher: ${teacher}`;
        api.sendMessage(msg, event.threadID);
      } else {
        api.sendMessage('Failed to train the bot. Please try again.', event.threadID);
      }
    } catch (error) {
      console.error('Error in train command:', error);
      api.sendMessage('An error occurred while training the bot.', event.threadID);
    }
  },
};