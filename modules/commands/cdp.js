const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: "cdp",
        version: "1.0",
        author: "Hridoy",
        countDown: 10,
        prefix: true,
        groupAdminOnly: false,
        description: "Fetches and sends matching couple pictures.",
        category: "random",
        guide: {
            en: "   {pn}cdp: Get a random matching couple picture."
        }
    },
    onStart: async ({ api, event }) => {
        try {
            const threadId = event.threadID;

            const apiUrl = `https://hridoy-apis.vercel.app/random/couple?apikey=hridoyXQC`;
            console.log(`[API Request] Sending to: ${apiUrl}`);

            const apiResponse = await axios.get(apiUrl, { responseType: 'json' });
            console.log(`[API Response] Status: ${apiResponse.status}, Status Text: ${apiResponse.statusText}, Data: ${JSON.stringify(apiResponse.data)}`);

            if (apiResponse.data.cowo && apiResponse.data.cewe) {
                const [cowoUrl, ceweUrl] = [apiResponse.data.cowo, apiResponse.data.cewe];
                const tempDir = path.join(__dirname, '../../temp');
                await fs.ensureDir(tempDir);

                const [cowoResponse, ceweResponse] = await Promise.all([
                    axios.get(cowoUrl, { responseType: 'arraybuffer' }),
                    axios.get(ceweUrl, { responseType: 'arraybuffer' })
                ]);

                const cowoPath = path.join(tempDir, `cdp_cowo_${Date.now()}.jpg`);
                const cewePath = path.join(tempDir, `cdp_cewe_${Date.now()}.jpg`);
                await Promise.all([
                    fs.writeFile(cowoPath, cowoResponse.data),
                    fs.writeFile(cewePath, ceweResponse.data)
                ]);

                await api.sendMessage(
                    {
                        body: '🖼️ Matching Couple Pictures:',
                        attachment: [
                            fs.createReadStream(cowoPath),
                            fs.createReadStream(cewePath)
                        ]
                    },
                    threadId
                );

                await Promise.all([
                    fs.unlink(cowoPath),
                    fs.unlink(cewePath)
                ]);
            } else {
                throw new Error('No couple images found in API response');
            }
        } catch (error) {
            console.error('Error in cdp command:', error);
            api.sendMessage('❌ Failed to fetch the couple pictures.', event.threadID);
        }
    }
};