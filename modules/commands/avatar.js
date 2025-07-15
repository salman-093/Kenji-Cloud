const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
    config: {
        name: 'avatar',
        version: '1.0',
        author: 'Hridoy',
        countDown: 10,
        prefix: true,
        groupAdminOnly: false,
        description: 'Generates an anime-style avatar with text.',
        category: 'fun',
        guide: {
            en: '   {pn}avatar <text> [/@mention]'
        },
    },
    onStart: async ({ api, event, args }) => {
        const { senderID, mentions } = event;
        let targetID = senderID;
        let text = args.join(' ').trim();

        if (Object.keys(mentions).length > 0) {
            targetID = Object.keys(mentions)[0];
            const mentionText = mentions[targetID];
            text = text.replace(mentionText, '').trim();
        }

        if (!text) {
            return api.sendMessage('Please provide text for the avatar.', event.threadID);
        }

        const userInfo = await api.getUserInfo(targetID);
        const topText = encodeURIComponent(userInfo[targetID]?.name || 'Unknown');

        const apiUrl = `https://sus-apis.onrender.com/api/anime-text?text=${encodeURIComponent(text)}&topText=${topText}`;

        try {
            console.log(`[API Request] Sending to: ${apiUrl}`);
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            console.log(`[API Response] Status: ${response.status}, Status Text: ${response.statusText}`);

            const cacheDir = path.join(__dirname, 'cache');
            if (!fs.existsSync(cacheDir)) {
                fs.mkdirSync(cacheDir);
            }
            const imagePath = path.join(cacheDir, `avatar_${targetID}_${Date.now()}.png`);
            fs.writeFileSync(imagePath, Buffer.from(response.data, 'binary'));

            api.sendMessage({
                attachment: fs.createReadStream(imagePath)
            }, event.threadID, () => fs.unlinkSync(imagePath));

        } catch (error) {
            console.error("Error generating or sending avatar image:", error);
            api.sendMessage("Sorry, I couldn't generate the avatar image right now.", event.threadID);
        }
    },
};