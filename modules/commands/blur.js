const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
    config: {
        name: 'blur',
        version: '1.1',
        author: 'Hridoy',
        countDown: 10,
        prefix: true,
        groupAdminOnly: false,
        description: 'Generates a blurred image of a user\'s avatar.',
        category: 'fun',
        guide: {
            en: '   {pn}blur [/@mention|uid|reply]'
        },
    },
    onStart: async ({ api, event }) => {
        const { senderID, mentions, messageReply } = event;
        let targetID = senderID;

      
        if (Object.keys(mentions).length > 0) {
            targetID = Object.keys(mentions)[0];
        } else if (event.messageReply && event.messageReply.senderID) {
            targetID = event.messageReply.senderID;
        } else if (event.body.split(' ').length > 1) {
            const uid = event.body.split(' ')[1].replace(/[^0-9]/g, '');
            if (uid.length === 15 || uid.length === 16) targetID = uid;
        }

        const userInfo = await api.getUserInfo(targetID);
        const imageUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;

        const apiUrl = `https://sus-apis-2.onrender.com/api/blur?image=${encodeURIComponent(imageUrl)}`;

        try {
            console.log(`[API Request] Sending to: ${apiUrl}`);
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            console.log(`[API Response] Status: ${response.status}, Status Text: ${response.statusText}`);

            const cacheDir = path.join(__dirname, 'cache');
            if (!fs.existsSync(cacheDir)) {
                fs.mkdirSync(cacheDir);
            }
            const imagePath = path.join(cacheDir, `blur_${targetID}_${Date.now()}.png`);
            fs.writeFileSync(imagePath, Buffer.from(response.data, 'binary'));

            api.sendMessage({
                attachment: fs.createReadStream(imagePath)
            }, event.threadID, () => fs.unlinkSync(imagePath));

        } catch (error) {
            console.error("Error generating or sending blur image:", error);
            api.sendMessage("Sorry, I couldn't generate the blur image right now.", event.threadID);
        }
    },
};