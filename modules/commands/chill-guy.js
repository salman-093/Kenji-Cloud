const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
    config: {
        name: 'chill-guy',
        version: '1.0',
        author: 'Hridoy',
        countDown: 10,
        prefix: true,
        groupAdminOnly: false,
        description: 'Generates a chill guy meme with the provided text.',
        category: 'fun',
        guide: {
            en: '   {pn}chill-guy <text>'
        },
    },
    onStart: async ({ api, event, args }) => {
        const text = args.join(' ').trim();

        if (!text) {
            return api.sendMessage('Please provide text for the chill guy meme.', event.threadID);
        }

        const apiUrl = `https://sus-apis-2.onrender.com/api/chill-guy?text=${encodeURIComponent(text)}`;

        try {
            console.log(`[API Request] Sending to: ${apiUrl}`);
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            console.log(`[API Response] Status: ${response.status}, Status Text: ${response.statusText}`);

            const cacheDir = path.join(__dirname, 'cache');
            if (!fs.existsSync(cacheDir)) {
                fs.mkdirSync(cacheDir);
            }
            const imagePath = path.join(cacheDir, `chill_guy_${Date.now()}.png`);
            fs.writeFileSync(imagePath, Buffer.from(response.data, 'binary'));

            api.sendMessage({
                attachment: fs.createReadStream(imagePath)
            }, event.threadID, () => fs.unlinkSync(imagePath));

        } catch (error) {
            console.error("Error generating or sending chill guy image:", error);
            api.sendMessage("Sorry, I couldn't generate the chill guy image right now.", event.threadID);
        }
    },
};