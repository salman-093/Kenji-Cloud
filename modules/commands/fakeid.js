const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    config: {
        name: 'fakeid',
        version: '1.0',
        author: 'Hridoy',
        countDown: 10,
        prefix: true,
        groupAdminOnly: false,
        description: 'Generates a random fake identity with avatar and personal details.',
        category: 'fun',
        guide: {
            en: '{pn}fakeid'
        },
    },

    onStart: async ({ api, event }) => {
        const apiUrl = `https://sus-apis-2.onrender.com/api/fakeidentity`;

        try {
            const response = await axios.get(apiUrl);
            const data = response.data;

            if (!data.success || !data.identity) {
                return api.sendMessage("❌ Failed to generate fake identity.", event.threadID);
            }

            const id = data.identity;
            const info = 
`🆔 𝗙𝗔𝗞𝗘 𝗜𝗗𝗘𝗡𝗧𝗜𝗧𝗬
👤 Name: ${id.name}
👩‍🦰 Gender: ${id.gender}
🎂 DOB: ${id.dob}
📧 Email: ${id.email}
📞 Phone: ${id.phone}
💼 Job: ${id.job}
🏠 Address: ${id.address}
💻 Username: ${id.username}
🕓 Created: ${new Date(id.createdAt).toLocaleString()}`;

            const imageUrl = id.avatar;

            const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const cacheDir = path.join(__dirname, 'cache');
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

            const imgPath = path.join(cacheDir, `fakeid_${Date.now()}.jpg`);
            fs.writeFileSync(imgPath, Buffer.from(imgRes.data, 'binary'));

            api.sendMessage({
                body: info,
                attachment: fs.createReadStream(imgPath)
            }, event.threadID, () => fs.unlinkSync(imgPath));

        } catch (err) {
            console.error("Error fetching fake ID:", err);
            api.sendMessage("❌ Error generating fake ID.", event.threadID);
        }
    }
};
