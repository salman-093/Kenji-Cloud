const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: "cj",
        version: "1.0",
        author: "Hridoy",
        countDown: 10,
        prefix: true,
        groupAdminOnly: false,
        description: "Generates a CJ 'Ohh Shit' meme with custom text.",
        category: "media",
        guide: {
            en: "   {pn}cj <text>: Create a CJ meme with your text."
        }
    },
    onStart: async ({ api, event, args }) => {
        try {
            const threadId = event.threadID;

            if (!args[0]) {
                return api.sendMessage("Please provide text for the CJ meme, e.g., !cj Ohh Shit.", threadId);
            }

            const text = encodeURIComponent(args.join(" "));
            const apiUrl = `https://sus-apis-2.onrender.com/api/cj-reaction?text=${text}`;
            console.log(`[API Request] Sending to: ${apiUrl}`);

            const apiResponse = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            console.log(`[API Response] Status: ${apiResponse.status}, Status Text: ${apiResponse.statusText}`);

            if (apiResponse.status !== 200 || !apiResponse.data || apiResponse.data.byteLength < 1000) {
                throw new Error('Invalid image response from API');
            }

            const tempDir = path.join(__dirname, '../../temp');
            await fs.ensureDir(tempDir);
            const imagePath = path.join(tempDir, `cj_${Date.now()}.png`);
            await fs.writeFile(imagePath, Buffer.from(apiResponse.data));

            await api.sendMessage(
                {
                    body: `🖼️ CJ Meme: ${args.join(" ")}`,
                    attachment: fs.createReadStream(imagePath),
                },
                threadId
            );

            await fs.unlink(imagePath);
        } catch (error) {
            console.error('Error in cj command:', error);
            api.sendMessage('❌ Failed to generate the CJ meme.', event.threadID);
        }
    }
};