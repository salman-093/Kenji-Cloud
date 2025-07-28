const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: "loli",
        version: "1.0",
        author: "Hridoy",
        countDown: 10,
        prefix: true,
        groupAdminOnly: false,
        description: "Sends a random loli image.",
        category: "random",
        guide: {
            en: "   {pn}loli: Get a random loli image."
        }
    },
    onStart: async ({ api, event }) => {
        try {
            const threadId = event.threadID;

            const apiUrl = `https://hridoy-apis.vercel.app/random/loli?apikey=hridoyXQC`;
            console.log(`[API Request] Sending to: ${apiUrl}`);

            const apiResponse = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            console.log(`[API Response] Status: ${apiResponse.status}, Status Text: ${apiResponse.statusText}`);

            if (apiResponse.status !== 200 || !apiResponse.data || apiResponse.data.byteLength < 1000) {
                throw new Error('Invalid image response from API');
            }

            const tempDir = path.join(__dirname, '../../temp');
            await fs.ensureDir(tempDir);
            const imagePath = path.join(tempDir, `loli_${Date.now()}.png`);
            await fs.writeFile(imagePath, Buffer.from(apiResponse.data));

            await api.sendMessage(
                {
                    body: '🖼️ Random Loli Image',
                    attachment: fs.createReadStream(imagePath),
                },
                threadId
            );

            await fs.unlink(imagePath);
        } catch (error) {
            console.error('Error in loli command:', error);
            api.sendMessage('❌ Failed to fetch the loli image.', event.threadID);
        }
    }
};