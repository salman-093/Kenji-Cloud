const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { log } = require('../../logger/logger');

module.exports = {
  config: {
    name: 'guesscountry',
    version: '1.0',
    author: 'Hridoy',
    countDown: 5,
    prefix: true,
    adminOnly: false,
    description: 'Guess the country based on the clue.',
    category: 'game',
    guide: {
      en: '{pn}guesscountry'
    }
  },

  onStart: async ({ api, event }) => {
    const { threadID, senderID } = event;

    try {
      const res = await axios.get('https://sus-apis-2.onrender.com/api/guess-country');
      const data = res.data;

      if (!data.success) {
        return api.sendMessage('❌ Could not fetch country data. Try again later.', threadID);
      }

      const clue = data.clue;
      const options = data.options;
      const answer = data.answer;

      const optionText = `a) ${options[0]}\nb) ${options[1]}\nc) ${options[2]}\nd) ${options[3]}`;

      const message = `🌍 Country Quiz\n\n🧩 Clue: ${clue}\n\n${optionText}\n\nReply with a, b, c, or d to answer.`;

      const sentMsg = await api.sendMessage(message, threadID);

      global.client.handleReply.push({
        name: 'guesscountry',
        messageID: sentMsg.messageID,
        threadID,
        senderID,
        correctAnswer: answer.name,
        correctIndex: options.indexOf(answer.name),
        flagUrl: answer.flag_url,
        timeout: setTimeout(async () => {
          const idx = global.client.handleReply.findIndex(e => e.messageID === sentMsg.messageID && e.name === 'guesscountry');
          if (idx >= 0) global.client.handleReply.splice(idx, 1);
          await api.sendMessage('⏰ Time is up! You did not answer.', threadID);
        }, 60000)
      });

      log('info', `Country quiz sent to ${senderID} in thread ${threadID}`);

    } catch (error) {
      log('error', `guesscountry error: ${error.message}`);
      api.sendMessage('❌ Failed to start country quiz. Try again later.', threadID);
    }
  },

  handleReply: async ({ event, api, handleReply }) => {
    const reply = event.body.trim().toLowerCase();
    const { threadID, senderID, messageID } = event;

    if (!event.messageReply || event.messageReply.messageID !== handleReply.messageID) {
      return api.sendMessage('⚠️ This is not a reply to the quiz.', threadID, messageID);
    }

    if (!['a', 'b', 'c', 'd'].includes(reply)) {
      return api.sendMessage('⚠️ Please reply with only "a", "b", "c", or "d".', threadID, messageID);
    }

    const idx = global.client.handleReply.findIndex(e => e.messageID === handleReply.messageID && e.name === 'guesscountry');
    if (idx >= 0) {
      clearTimeout(global.client.handleReply[idx].timeout);
      global.client.handleReply.splice(idx, 1);
    }

    const userAnswerIndex = { a: 0, b: 1, c: 2, d: 3 }[reply];

    const correct = userAnswerIndex === handleReply.correctIndex;

    try {
      const response = await axios.get(handleReply.flagUrl, { responseType: 'arraybuffer' });
      const cacheDir = path.join(__dirname, '..', 'cache');
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
      const imgPath = path.join(cacheDir, `country_flag_${Date.now()}.png`);
      fs.writeFileSync(imgPath, Buffer.from(response.data, 'binary'));

      const resultMsg = correct
        ? `✅ Correct! The country is **${handleReply.correctAnswer}**.`
        : `❌ Wrong! The correct answer was **${handleReply.correctAnswer}**.`;

      await api.sendMessage({
        body: resultMsg,
        attachment: fs.createReadStream(imgPath)
      }, threadID, () => fs.unlinkSync(imgPath));

      log('info', `User ${senderID} answered "${reply}" (${correct ? 'correct' : 'wrong'}) in guesscountry`);

    } catch (error) {
      log('error', `Error sending flag image: ${error.message}`);
      await api.sendMessage(
        correct
          ? `✅ Correct! The country is **${handleReply.correctAnswer}**.`
          : `❌ Wrong! The correct answer was **${handleReply.correctAnswer}**.`,
        threadID
      );
    }
  }
};
