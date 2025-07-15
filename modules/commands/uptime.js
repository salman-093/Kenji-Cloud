const fs = require('fs');
const path = require('path');
const axios = require('axios');

const configPath = path.join(__dirname, '..', '..', 'config', 'config.json');

function readConfig() {
    try {
        const data = fs.readFileSync(configPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading config:', error);
        return { botpicture: '', botName: 'Unknown Bot', ownerName: 'Unknown Owner' };
    }
}

module.exports = {
    config: {
        name: 'uptime',
        version: '1.2',
        author: 'Hridoy',
        countDown: 5,
        prefix: true,
        description: 'Shows the bots uptime.',
        category: 'utility',
        guide: {
            en: '   {pn}'
        },
    },
    onStart: async ({ api, event }) => {
        const uptime = process.uptime();
        const days = Math.floor(uptime / (24 * 60 * 60));
        const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((uptime % (60 * 60)) / 60);
        const seconds = Math.floor(uptime % 60);

        const config = readConfig();
        const botImage = encodeURIComponent(config.botpicture || '');
        const botName = encodeURIComponent(config.botName || 'Unknown Bot');
        const developer = encodeURIComponent(config.ownerName || 'Unknown Owner');
        const uptimeStr = `${days} D, ${hours} H, ${minutes} M, ${seconds} S`;

        const apiUrl = `https://nexalo-api.vercel.app/api/uptime-card?image=${botImage}&botname=${botName}&uptime=${encodeURIComponent(uptimeStr)}&developer=${developer}`;

        try {
            console.log(`[API Request] Sending to: ${apiUrl}`);
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            console.log(`[API Response] Status: ${response.status}, Status Text: ${response.statusText}`);

            const cacheDir = path.join(__dirname, 'cache');
            if (!fs.existsSync(cacheDir)) {
                fs.mkdirSync(cacheDir);
            }
            const imagePath = path.join(cacheDir, `uptime_${Date.now()}.png`);
            fs.writeFileSync(imagePath, Buffer.from(response.data, 'binary'));

            api.sendMessage({
                attachment: fs.createReadStream(imagePath)
            }, event.threadID, () => fs.unlinkSync(imagePath));

        } catch (error) {
            console.error("Error generating or sending uptime image:", error);
            api.sendMessage("Sorry, I couldn't generate the uptime image right now.", event.threadID);
        }
    },
};