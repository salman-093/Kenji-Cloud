const axios = require('axios');

module.exports = {
    config: {
        name: 'gpt4',
        version: '1.0',
        author: 'Hridoy',
        countDown: 5,
        prefix: true,
        groupAdminOnly: false,
        description: 'Chat with GPT-4 AI.',
        category: 'ai',
        guide: {
            en: '   {pn}gpt4 <query>'
        },
    },
    onStart: async ({ api, event, args }) => {
        const threadID = event.threadID;
        const messageID = event.messageID;

        const query = args.join(' ').trim();
        if (!query) {
            return api.sendMessage('❌ Please provide a query. Example: !gpt4 Tell me a fact', threadID, messageID);
        }

        try {
            console.log(`Requesting GPT-4 with query: ${query}`);
            const response = await axios.get(
                `https://hridoy-apis.onrender.com/ai/gpt4?ask=${encodeURIComponent(query)}`,
                { timeout: 15000 }
            );

            console.log('GPT-4 response:', response.data);

            if (response.data.status && response.data.result) {
                api.sendMessage(response.data.result, threadID, messageID);
            } else {
                throw new Error('Invalid response from GPT-4 API');
            }
        } catch (error) {
            console.error('GPT-4 error:', error.message);
            api.sendMessage(`❌ Error: ${error.message}`, threadID, messageID);
        }
    },
};