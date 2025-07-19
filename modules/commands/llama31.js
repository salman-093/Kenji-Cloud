const axios = require('axios');

module.exports = {
    config: {
        name: 'llama31',
        version: '1.0',
        author: 'Hridoy',
        countDown: 5,
        prefix: true,
        groupAdminOnly: false,
        description: 'Chat with LLaMA 3.1 8B AI.',
        category: 'ai',
        guide: {
            en: '   {pn}llama31 <query>'
        },
    },
    onStart: async ({ api, event, args }) => {
        const threadID = event.threadID;
        const messageID = event.messageID;

        const query = args.join(' ').trim();
        if (!query) {
            return api.sendMessage('❌ Please provide a query. Example: !llama31 Tell me about space', threadID, messageID);
        }

        try {
            console.log(`Requesting LLaMA 3.1 8B with query: ${query}`);
            const response = await axios.get(
                `https://hridoy-apis.onrender.com/ai/llama-3.1-8b?text=${encodeURIComponent(query)}`,
                { timeout: 15000 }
            );

            console.log('LLaMA 3.1 8B response:', response.data);

            if (response.data.status && response.data.result) {
                api.sendMessage(response.data.result, threadID, messageID);
            } else {
                throw new Error('Invalid response from LLaMA 3.1 8B API');
            }
        } catch (error) {
            console.error('LLaMA 3.1 8B error:', error.message);
            api.sendMessage(`❌ Error: ${error.message}`, threadID, messageID);
        }
    },
};