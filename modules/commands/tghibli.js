const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
    config: {
        name: 'tghibli',
        version: '1.0',
        author: 'Hridoy',
        countDown: 10,
        prefix: true,
        groupAdminOnly: false,
        description: 'Turn your text prompt into a Studio Ghibli-style AI image.',
        category: 'ai',
        guide: {
            en: '   {pn}tghibli <your description prompt>'
        },
    },
    onStart: async ({ api, event, args }) => {
        const userPrompt = args.join(' ').trim();

        if (!userPrompt) {
            return api.sendMessage("Please provide a prompt to generate a Ghibli-style image. Example: /tghibli A cat sitting on a rooftop under the moonlight", event.threadID);
        }

        const apiUrl = `https://hridoy-apis.vercel.app/ai-image/text2ghibli2?prompt=${encodeURIComponent(userPrompt)}&apikey=hridoyXQC`;

        try {
            api.sendMessage("🖼️ | Generating your Studio Ghibli-style image, please wait...", event.threadID);

            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

            const cacheDir = path.join(__dirname, 'cache');
            if (!fs.existsSync(cacheDir)) {
                fs.mkdirSync(cacheDir);
            }
            const imagePath = path.join(cacheDir, `tghibli_${Date.now()}.png`);
            fs.writeFileSync(imagePath, Buffer.from(response.data, 'binary'));

            api.sendMessage({
                attachment: fs.createReadStream(imagePath)
            }, event.threadID, () => fs.unlinkSync(imagePath));
        } catch (error) {
            console.error("Error generating Ghibli image:", error);
            api.sendMessage("Sorry, an error occurred while generating the Ghibli-style image. Please try again later.", event.threadID);
        }
    }
};