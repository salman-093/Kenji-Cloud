const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
    config: {
        name: 'raven',
        version: '1.0',
        author: 'Hridoy',
        countDown: 10,
        prefix: true,
        groupAdminOnly: false,
        description: 'Generates a raven presenting image with a user\'s avatar and text.',
        category: 'fun',
        guide: {
            en: '   {pn}raven <text> [/@mention|uid|reply]'
        },
    },
    onStart: async ({ api, event, args }) => {
        const { senderID, mentions, messageReply } = event;
        let targetID = senderID;
        let text = args.join(' ').trim();

        if (!text) {
            return api.sendMessage('Please provide text for the raven image.', event.threadID);
        }


        if (Object.keys(mentions).length > 0) {
            targetID = Object.keys(mentions)[0];
            const mentionText = mentions[targetID];
            text = text.replace(mentionText, '').trim();
        } else if (event.messageReply && event.messageReply.senderID) {
            targetID = event.messageReply.senderID;
        } else if (event.body.split(' ').length > 1) {
            const uid = event.body.split(' ').slice(1).join(' ').replace(/[^0-9]/g, '');
            if (uid.length === 15 || uid.length === 16) targetID = uid;
        }

        const userInfo = await api.getUserInfo(targetID);
        const imageUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;

        const apiUrl = `https://sus-apis-2.onrender.com/api/raven-presenting?image=${encodeURIComponent(imageUrl)}&message=${encodeURIComponent(text)}`;

        try {
            console.log(`[API Request] Sending to: ${apiUrl}`);
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            console.log(`[API Response] Status: ${response.status}, Status Text: ${response.statusText}`);

            const cacheDir = path.join(__dirname, 'cache');
            if (!fs.existsSync(cacheDir)) {
                fs.mkdirSync(cacheDir);
            }
            const imagePath = path.join(cacheDir, `raven_${targetID}_${Date.now()}.png`);
            fs.writeFileSync(imagePath, Buffer.from(response.data, 'binary'));

            api.sendMessage({
                attachment: fs.createReadStream(imagePath)
            }, event.threadID, () => fs.unlinkSync(imagePath));

        } catch (error) {
            console.error("Error generating or sending raven image:", error);
            api.sendMessage("Sorry, I couldn't generate the raven image right now.", event.threadID);
        }
    },
};