const axios = require('axios');
const { log } = require('../../logger/logger');

module.exports = {
    config: {
        name: "insult",
        version: "1.0",
        author: "Hridoy",
        countDown: 5,
        prefix: true,
        adminOnly: false,
        description: "Generate a random insult",
        category: "fun",
        guide: {
            en: "   {pn}: Get a random insult."
        }
    },

    onStart: async ({ event, api }) => {
        try {
            const response = await axios.get('https://evilinsult.com/generate_insult.php?lang=en&type=json', { timeout: 15000 });
            const { insult } = response.data;

            await api.sendMessage(`Insult: ${insult}`, event.threadID);

            log('info', `Insult command executed by ${event.senderID} in thread ${event.threadID}`);
        } catch (error) {
            log('error', `Insult command error: ${error.message || 'Unknown error'}`);
            api.sendMessage('An error occurred while generating the insult. Please try again.', event.threadID);
        }
    }
};