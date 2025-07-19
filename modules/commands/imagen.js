const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: 'imagen',
        version: '1.0',
        author: 'Hridoy',
        countDown: 5,
        prefix: true,
        groupAdminOnly: false,
        description: 'Generate an image using Imagen AI.',
        category: 'ai',
        guide: {
            en: '   {pn}imagen <prompt>'
        },
    },
    onStart: async ({ api, event, args }) => {
        const threadID = event.threadID;
        const messageID = event.messageID;

        const prompt = args.join(' ').trim();
        if (!prompt) {
            return api.sendMessage('❌ Please provide a prompt. Example: !imagen A futuristic city', threadID, messageID);
        }

        try {
            console.log(`Requesting Imagen with prompt: ${prompt}`);
            const response = await axios.get(
                `https://hridoy-apis.onrender.com/ai/imagen?text=${encodeURIComponent(prompt)}`,
                { timeout: 15000, responseType: 'arraybuffer' }
            );

            console.log('Imagen response received');

            const cacheDir = path.resolve(__dirname, 'cache');
            await fs.ensureDir(cacheDir);
            const imagePath = path.resolve(cacheDir, `imagen_${threadID}_${Date.now()}.png`);

            await fs.writeFile(imagePath, Buffer.from(response.data));

            api.sendMessage({
                attachment: fs.createReadStream(imagePath)
            }, threadID, () => fs.unlinkSync(imagePath), messageID);

        } catch (error) {
            console.error('Imagen error:', error.message);
            api.sendMessage(`❌ Error: ${error.message}`, threadID, messageID);
        }
    },
};