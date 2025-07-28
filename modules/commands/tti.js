const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: "tti",
        version: "1.0",
        author: "Hridoy",
        countDown: 10,
        prefix: true,
        groupAdminOnly: false,
        description: "Generates an image from text.",
        category: "media",
        guide: {
            en: "   {pn}tti <text>: Create an image from the provided text."
        }
    },
    onStart: async ({ api, event, args }) => {
        try {
            const threadId = event.threadID;

            if (!args[0]) {
                return api.sendMessage("Please provide text to convert to an image, e.g., !tti Hello World.", threadId);
            }

            const text = encodeURIComponent(args.join(" "));
            const apiUrl = `https://hridoy-apis.vercel.app/maker/text-to-image?text=${text}&apikey=hridoyXQC`;
            console.log(`[API Request] Sending to: ${apiUrl}`);

            const apiResponse = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            console.log(`[API Response] Status: ${apiResponse.status}, Status Text: ${apiResponse.statusText}`);

            if (apiResponse.status !== 200 || !apiResponse.data || apiResponse.data.byteLength < 1000) {
                throw new Error('Invalid image response from API');
            }

            const tempDir = path.join(__dirname, '../../temp');
            await fs.ensureDir(tempDir);
            const imagePath = path.join(tempDir, `tti_${Date.now()}.png`);
            await fs.writeFile(imagePath, Buffer.from(apiResponse.data));

            await api.sendMessage(
                {
                    body: `🖼️ Text to Image: ${args.join(" ")}`,
                    attachment: fs.createReadStream(imagePath),
                },
                threadId
            );

            await fs.unlink(imagePath);
        } catch (error) {
            console.error('Error in tti command:', error);
            api.sendMessage('❌ Failed to generate the text-to-image.', event.threadID);
        }
    }
};