const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: "cvo",
        version: "1.0",
        author: "Hridoy",
        countDown: 10,
        prefix: true,
        groupAdminOnly: false,
        description: "Generates a 'Crying vs OK' meme with two texts.",
        category: "fun",
        guide: {
            en: "   {pn}cvo text 1 | text 2: Create a meme with crying vs OK emoji."
        }
    },
    onStart: async ({ api, event, args }) => {
        try {
            const threadId = event.threadID;

            if (!args[0]) {
                return api.sendMessage("Please provide two texts separated by |, e.g., !cvo Sad | Happy.", threadId);
            }

            const [text1, text2] = args.join(" ").split("|").map(item => item.trim());
            if (!text1 || !text2) {
                return api.sendMessage("Please provide two texts separated by |, e.g., !cvo Sad | Happy.", threadId);
            }

            const apiUrl = `https://sus-apis-2.onrender.com/api/crying-vs-okay-emoji?text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}`;
            console.log(`[API Request] Sending to: ${apiUrl}`);

            const apiResponse = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            console.log(`[API Response] Status: ${apiResponse.status}, Status Text: ${apiResponse.statusText}`);

            if (apiResponse.status !== 200 || !apiResponse.data || apiResponse.data.byteLength < 1000) {
                throw new Error('Invalid image response from API');
            }

            const tempDir = path.join(__dirname, '../../temp');
            await fs.ensureDir(tempDir);
            const imagePath = path.join(tempDir, `cvo_${Date.now()}.png`);
            await fs.writeFile(imagePath, Buffer.from(apiResponse.data));

            await api.sendMessage(
                {
                    body: `🖼️ Crying vs OK Meme: ${text1} | ${text2}`,
                    attachment: fs.createReadStream(imagePath),
                },
                threadId
            );

            await fs.unlink(imagePath);
        } catch (error) {
            console.error('Error in cvo command:', error);
            api.sendMessage('❌ Failed to generate the Crying vs OK meme.', event.threadID);
        }
    }
};