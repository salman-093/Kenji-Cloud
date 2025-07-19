const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: 'flux',
        version: '1.0',
        author: 'Hridoy',
        countDown: 5,
        prefix: true,
        groupAdminOnly: false,
        description: 'Generate an image using Flux AI.',
        category: 'ai',
        guide: {
            en: '   {pn}flux <prompt>'
        },
    },
    onStart: async ({ api, event, args }) => {
        const threadID = event.threadID;
        const messageID = event.messageID;

        const prompt = args.join(' ').trim();
        if (!prompt) {
            return api.sendMessage('❌ Please provide a prompt. Example: !flux A beautiful landscape', threadID, messageID);
        }

        try {
            console.log(`Requesting Flux with prompt: ${prompt}`);
            const response = await axios.get(
                `https://hridoy-apis.onrender.com/ai/flux?prompt=${encodeURIComponent(prompt)}`,
                { timeout: 15000, responseType: 'arraybuffer' }
            );

            console.log('Flux response received');

            const cacheDir = path.resolve(__dirname, 'cache');
            await fs.ensureDir(cacheDir);
            const imagePath = path.resolve(cacheDir, `flux_${threadID}_${Date.now()}.png`);

            await fs.writeFile(imagePath, Buffer.from(response.data));

            api.sendMessage({
                attachment: fs.createReadStream(imagePath)
            }, threadID, () => fs.unlinkSync(imagePath), messageID);

        } catch (error) {
            console.error('Flux error:', error.message);
            api.sendMessage(`❌ Error: ${error.message}`, threadID, messageID);
        }
    },
};