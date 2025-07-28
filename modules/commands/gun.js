const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
    config: {
        name: 'gun',
        version: '1.0',
        author: 'Hridoy',
        countDown: 10,
        prefix: true,
        groupAdminOnly: false,
        description: 'Creates a gun meme image with user\'s avatar and your text.',
        category: 'fun',
        guide: {
            en: '{pn}gun <text> (for your own profile)\n{pn}gun @someone <text>\n{pn}gun <uid> <text>\nReply to an image with {pn}gun <text>'
        },
    },
    onStart: async ({ api, event, args }) => {
        const { senderID, mentions, messageReply } = event;

        let targetID = senderID;
        let imageUrl = null;
        let userText = "";
        let targetIDForFilename = senderID;

       
        if (messageReply && messageReply.attachments && messageReply.attachments.length > 0 && ['photo', 'sticker'].includes(messageReply.attachments[0].type)) {
            imageUrl = messageReply.attachments[0].url;
            userText = args.join(' ');
            targetIDForFilename = messageReply.senderID;
        } else {
       
            if (Object.keys(mentions).length > 0) {
                targetID = Object.keys(mentions)[0];
                userText = args.slice(1).join(' ');
            } else if (args.length > 1 && args[0].match(/^\d+$/)) {
                targetID = args[0].replace(/[^0-9]/g, '');
                userText = args.slice(1).join(' ');
            } else {
                userText = args.join(' ');
            }
            targetIDForFilename = targetID;

         
            imageUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
        }

        if (!userText || userText.length < 1) {
            return api.sendMessage("❌ Please provide the text for the gun meme. Example: gun Bang!", event.threadID);
        }

        const apiUrl = `https://sus-apis-2.onrender.com/api/gun-meme?image=${encodeURIComponent(imageUrl)}&text=${encodeURIComponent(userText)}`;

        try {
            api.sendMessage("🔫 Generating gun meme image, please wait...", event.threadID);
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

            const cacheDir = path.join(__dirname, 'cache');
            if (!fs.existsSync(cacheDir)) {
                fs.mkdirSync(cacheDir);
            }
            const imagePath = path.join(cacheDir, `gun_${targetIDForFilename}_${Date.now()}.png`);
            fs.writeFileSync(imagePath, Buffer.from(response.data, 'binary'));

            api.sendMessage({
                attachment: fs.createReadStream(imagePath)
            }, event.threadID, () => fs.unlinkSync(imagePath));
        } catch (error) {
            console.error("Error generating or sending gun meme image:", error);
            api.sendMessage("❌ Sorry, I couldn't generate the gun meme image right now.", event.threadID);
        }
    }
};