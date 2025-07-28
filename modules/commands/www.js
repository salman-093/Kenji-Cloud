const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
    config: {
        name: 'www',
        version: '1.0',
        author: 'Hridoy',
        countDown: 10,
        prefix: true,
        groupAdminOnly: false,
        description: 'Generates a Who Would Win meme between two users.',
        category: 'fun',
        guide: {
            en: '{pn}www @someone\n{pn}www @user1 @user2'
        },
    },

    onStart: async ({ api, event }) => {
        const { senderID, mentions, threadID } = event;
        const mentionIDs = Object.keys(mentions);


        if (mentionIDs.length === 0) {
            return api.sendMessage("❌ Please mention at least one user.\nExample: www @someone", threadID);
        }

        let imageUrl1, imageUrl2;
        let id1, id2;

        if (mentionIDs.length === 1) {
          
            id1 = senderID;
            id2 = mentionIDs[0];
        } else {
          
            id1 = mentionIDs[0];
            id2 = mentionIDs[1];
        }

        imageUrl1 = `https://graph.facebook.com/${id1}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
        imageUrl2 = `https://graph.facebook.com/${id2}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;

        const apiUrl = `http://sus-apis-2.onrender.com/api/who-would-win?image1=${encodeURIComponent(imageUrl1)}&image2=${encodeURIComponent(imageUrl2)}`;

        try {
            api.sendMessage("⚔️ Generating 'Who Would Win' meme...", threadID);
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

            const cacheDir = path.join(__dirname, 'cache');
            if (!fs.existsSync(cacheDir)) {
                fs.mkdirSync(cacheDir);
            }
            const imagePath = path.join(cacheDir, `www_${Date.now()}.png`);
            fs.writeFileSync(imagePath, Buffer.from(response.data, 'binary'));

            api.sendMessage({
                attachment: fs.createReadStream(imagePath)
            }, threadID, () => fs.unlinkSync(imagePath));
        } catch (error) {
            console.error("Error generating WWW image:", error);
            api.sendMessage("❌ Couldn't generate the meme right now.", threadID);
        }
    }
};
