const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: "blue",
        version: "1.0",
        author: "Hridoy",
        countDown: 10,
        prefix: true,
        groupAdminOnly: false,
        description: "Sends a random Blue Archive image.",
        category: "random",
        guide: {
            en: "   {pn}blue: Get a random Blue Archive image."
        }
    },
    onStart: async ({ api, event }) => {
        try {
            const threadId = event.threadID;

            const apiUrl = `https://hridoy-apis.vercel.app/random/bluearchive?apikey=hridoyXQC`;
            console.log(`[API Request] Sending to: ${apiUrl}`);

            const apiResponse = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            console.log(`[API Response] Status: ${apiResponse.status}, Status Text: ${apiResponse.statusText}`);

            if (apiResponse.status !== 200 || !apiResponse.data || apiResponse.data.byteLength < 1000) {
                throw new Error('Invalid image response from API');
            }

            const tempDir = path.join(__dirname, '../../temp');
            await fs.ensureDir(tempDir);
            const imagePath = path.join(tempDir, `blue_${Date.now()}.png`);
            await fs.writeFile(imagePath, Buffer.from(apiResponse.data));

            await api.sendMessage(
                {
                    body: '🖼️ Random Blue Archive Image',
                    attachment: fs.createReadStream(imagePath),
                },
                threadId
            );

            await fs.unlink(imagePath);
        } catch (error) {
            console.error('Error in blue command:', error);
            api.sendMessage('❌ Failed to fetch the Blue Archive image.', event.threadID);
        }
    }
};