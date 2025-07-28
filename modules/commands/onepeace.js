const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: "onepeace",
        version: "1.0",
        author: "Hridoy",
        countDown: 10,
        prefix: true,
        groupAdminOnly: false,
        description: "Sends a random One Piece image.",
        category: "random",
        guide: {
            en: "   {pn}onepeace: Get a random One Piece image."
        }
    },
    onStart: async ({ api, event }) => {
        try {
            const threadId = event.threadID;

            const apiUrl = `https://hridoy-apis.vercel.app/random/onepiece?apikey=hridoyXQC`;
            console.log(`[API Request] Sending to: ${apiUrl}`);

            const apiResponse = await axios.get(apiUrl, { responseType: 'json' });
            console.log(`[API Response] Status: ${apiResponse.status}, Status Text: ${apiResponse.statusText}, Data: ${JSON.stringify(apiResponse.data)}`);

            if (apiResponse.data.url) {
                const imageUrl = apiResponse.data.url;
                const tempPath = path.join(__dirname, `../../temp/onepeace_${Date.now()}.jpeg`);
                await fs.ensureDir(path.dirname(tempPath));

                const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
                await fs.writeFile(tempPath, imageResponse.data);

                await api.sendMessage(
                    {
                        body: `🖼️ Random One Piece Image: ${apiResponse.data.name || 'Unknown'}`,
                        attachment: fs.createReadStream(tempPath),
                    },
                    threadId
                );

                await fs.unlink(tempPath);
            } else {
                throw new Error('No image URL found in API response');
            }
        } catch (error) {
            console.error('Error in onepeace command:', error);
            api.sendMessage('❌ Failed to fetch the One Piece image.', event.threadID);
        }
    }
};