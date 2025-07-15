const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
    config: {
        name: 'qr-code',
        version: '1.0',
        author: 'Hridoy',
        countDown: 10,
        prefix: true,
        groupAdminOnly: false,
        description: 'Generates a gradient QR code from the provided text.',
        category: 'utility',
        guide: {
            en: '   {pn}qr-code <text>'
        },
    },
    onStart: async ({ api, event, args }) => {
        const text = args.join(' ').trim();

        if (!text) {
            return api.sendMessage('Please provide text to generate a QR code.', event.threadID);
        }

        const apiUrl = `https://sus-apis.onrender.com/api/gradient-qr?text=${encodeURIComponent(text)}`;

        try {
            console.log(`[API Request] Sending to: ${apiUrl}`);
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            console.log(`[API Response] Status: ${response.status}, Status Text: ${response.statusText}`);

            const cacheDir = path.join(__dirname, 'cache');
            if (!fs.existsSync(cacheDir)) {
                fs.mkdirSync(cacheDir);
            }
            const imagePath = path.join(cacheDir, `qr_code_${Date.now()}.png`);
            fs.writeFileSync(imagePath, Buffer.from(response.data, 'binary'));

            api.sendMessage({
                attachment: fs.createReadStream(imagePath)
            }, event.threadID, () => fs.unlinkSync(imagePath));

        } catch (error) {
            console.error("Error generating or sending QR code image:", error);
            api.sendMessage("Sorry, I couldn't generate the QR code image right now.", event.threadID);
        }
    },
};