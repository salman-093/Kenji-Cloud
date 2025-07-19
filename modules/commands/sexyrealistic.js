const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: 'sexy',
        version: '1.0',
        author: 'Hridoy',
        countDown: 5,
        prefix: true,
        groupAdminOnly: false,
        description: 'Generate realistic images using SexyRealistic AI.',
        category: 'ai',
        guide: {
            en: '   {pn}sexyrealistic <prompt>'
        },
    },
    onStart: async ({ api, event, args }) => {
        const threadID = event.threadID;
        const messageID = event.messageID;

        const prompt = args.join(' ').trim();
        if (!prompt) {
            return api.sendMessage('❌ Please provide a prompt. Example: !sexyrealistic A realistic portrait', threadID, messageID);
        }

        try {
            console.log(`Requesting SexyRealistic with prompt: ${prompt}`);
            const response = await axios.get(
                `https://hridoy-apis.onrender.com/ai/sexyrealistic?text=${encodeURIComponent(prompt)}`,
                { timeout: 60000 }
            );

            console.log('SexyRealistic response:', response.data);

            if (response.data.status && Array.isArray(response.data.result) && response.data.result.length > 0) {
                const cacheDir = path.resolve(__dirname, 'cache');
                await fs.ensureDir(cacheDir);
                const attachments = [];

                for (const url of response.data.result) {
                    const imagePath = path.resolve(cacheDir, `sexyrealistic_${threadID}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.webp`);
                    const imageResponse = await axios.get(url, { timeout: 30000, responseType: 'arraybuffer' });
                    await fs.writeFile(imagePath, Buffer.from(imageResponse.data));
                    attachments.push(fs.createReadStream(imagePath));
                }

                api.sendMessage({
                    attachment: attachments
                }, threadID, () => {
                    attachments.forEach(stream => fs.unlinkSync(stream.path));
                }, messageID);

            } else {
                throw new Error('Invalid or no images returned from SexyRealistic API');
            }
        } catch (error) {
            console.error('SexyRealistic error:', error.message);
            api.sendMessage(`❌ Error: ${error.message}`, threadID, messageID);
        }
    },
};