const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
    config: {
        name: 'hijab',
        version: '1.0',
        author: 'Hridoy',
        countDown: 10,
        prefix: true,
        groupAdminOnly: false,
        description: 'Applies an AI-generated hijab to a face in the image. Reply to an image or mention a user to use their profile picture.',
        category: 'ai',
        guide: {
            en: '   {pn}hijab [reply to an image] or {pn}hijab [/@mention|uid]'
        },
    },
    onStart: async ({ api, event }) => {
        const { senderID, mentions, messageReply } = event;
        let imageUrl;
        let targetIDForFilename = senderID;

   
        if (messageReply && messageReply.attachments && messageReply.attachments.length > 0 && ['photo', 'sticker'].includes(messageReply.attachments[0].type)) {
            imageUrl = messageReply.attachments[0].url;
            targetIDForFilename = messageReply.senderID;
        } else {
            let targetID = senderID;
            if (Object.keys(mentions).length > 0) {
                targetID = Object.keys(mentions)[0];
            } else if (event.body.split(' ').length > 1) {
                const uid = event.body.split(' ')[1].replace(/[^0-9]/g, '');
                if (uid.length === 15 || uid.length === 16) targetID = uid;
            }
            targetIDForFilename = targetID;
            imageUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
        }

        if (!imageUrl) {
            return api.sendMessage("Please reply to an image or mention a user to apply hijab to their profile picture.", event.threadID);
        }

        const apiUrl = `https://hridoy-apis.vercel.app/ai-image/custom?url=${encodeURIComponent(imageUrl)}&apikey=hridoyXQC`;

        try {
            api.sendMessage("🧕 | Applying hijab with AI, please wait...", event.threadID);
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

            const cacheDir = path.join(__dirname, 'cache');
            if (!fs.existsSync(cacheDir)) {
                fs.mkdirSync(cacheDir);
            }
            const imagePath = path.join(cacheDir, `hijab_${targetIDForFilename}_${Date.now()}.png`);
            fs.writeFileSync(imagePath, Buffer.from(response.data, 'binary'));

            api.sendMessage({
                attachment: fs.createReadStream(imagePath)
            }, event.threadID, () => fs.unlinkSync(imagePath));
        } catch (error) {
            console.error("Error generating hijab image:", error);
            api.sendMessage("Sorry, an error occurred while processing the image. Please try again later.", event.threadID);
        }
    }
};