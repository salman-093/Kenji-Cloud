const axios = require('axios');

module.exports = {
    config: {
        name: 'zephyr',
        version: '1.0',
        author: 'Hridoy',
        countDown: 5,
        prefix: true,
        groupAdminOnly: false,
        description: 'Chat with Zephyr AI.',
        category: 'ai',
        guide: {
            en: '   {pn}zephyr <prompt>'
        },
    },
    onStart: async ({ api, event, args }) => {
        const threadID = event.threadID;
        const messageID = event.messageID;

        const prompt = args.join(' ').trim();
        if (!prompt) {
            return api.sendMessage('❌ Please provide a prompt. Example: !zephyr Tell me a story', threadID, messageID);
        }

        try {
            console.log(`Requesting Zephyr with prompt: ${prompt}`);
            const response = await axios.get(
                `https://hridoy-apis.onrender.com/ai/zephyr?text=${encodeURIComponent(prompt)}`,
                { timeout: 15000 }
            );

            console.log('Zephyr response:', response.data);

            if (response.data.status && response.data.result) {
                api.sendMessage(response.data.result, threadID, messageID);
            } else {
                throw new Error('Invalid response from Zephyr API');
            }
        } catch (error) {
            console.error('Zephyr error:', error.message);
            api.sendMessage(`❌ Error: ${error.message}`, threadID, messageID);
        }
    },
};