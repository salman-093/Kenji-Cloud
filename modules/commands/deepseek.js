const axios = require('axios');

module.exports = {
    config: {
        name: 'deepseek',
        version: '1.0',
        author: 'Hridoy',
        countDown: 5,
        prefix: true,
        groupAdminOnly: false,
        description: 'Chat with DeepSeek AI.',
        category: 'ai',
        guide: {
            en: '   {pn}deepseek <prompt>'
        },
    },
    onStart: async ({ api, event, args }) => {
        const threadID = event.threadID;
        const messageID = event.messageID;

        const prompt = args.join(' ').trim();
        if (!prompt) {
            return api.sendMessage('❌ Please provide a prompt. Example: !deepseek Tell me a joke', threadID, messageID);
        }

        try {
            console.log(`Requesting DeepSeek with prompt: ${prompt}`);
            const response = await axios.get(
                `https://hridoy-apis.onrender.com/ai/deepseek?text=${encodeURIComponent(prompt)}`,
                { timeout: 15000 }
            );

            console.log('DeepSeek response:', response.data);

            if (response.data.status && response.data.result) {
                api.sendMessage(response.data.result, threadID, messageID);
            } else {
                throw new Error('Invalid response from DeepSeek API');
            }
        } catch (error) {
            console.error('DeepSeek error:', error.message);
            api.sendMessage(`❌ Error: ${error.message}`, threadID, messageID);
        }
    },
};