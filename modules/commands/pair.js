const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { log } = require('../../logger/logger');

module.exports = {
    config: {
        name: 'pair',
        version: '1.0',
        author: 'Hridoy',
        countDown: 5,
        prefix: true,
        groupAdminOnly: false,
        description: 'Pairs you with a random person from the group using a love image.',
        category: 'fun',
        guide: {
            en: '   {pn}'
        },
    },
    onStart: async ({ api, event }) => {
        const { threadID, senderID } = event;

        try {
            const threadInfo = await api.getThreadInfo(threadID);
            const { participantIDs } = threadInfo;

            if (participantIDs.length < 2) {
                return api.sendMessage("There aren't enough people in this group to find a pair.", threadID);
            }

            let partnerID;
            do {
                partnerID = participantIDs[Math.floor(Math.random() * participantIDs.length)];
            } while (partnerID === senderID);

            const [senderInfo, partnerInfo] = await Promise.all([
                api.getUserInfo(senderID),
                api.getUserInfo(partnerID)
            ]);
            const senderName = senderInfo[senderID]?.name || 'Unknown';
            const partnerName = partnerInfo[partnerID]?.name || 'Unknown';

            const lovePercentage = Math.floor(Math.random() * 51) + 50;

            const avatarSenderUrl = `https://graph.facebook.com/${senderID}/picture?width=400&height=400&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
            const avatarPartnerUrl = `https://graph.facebook.com/${partnerID}/picture?width=400&height=400&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;

            const apiUrl = `https://hridoy-apis.vercel.app/canvas/love?avatar1=${encodeURIComponent(avatarSenderUrl)}&avatar2=${encodeURIComponent(avatarPartnerUrl)}&apikey=hridoyXQC`;
            console.log(`[API Request] Sending to: ${apiUrl}`);

            const apiResponse = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            console.log(`[API Response] Status: ${apiResponse.status}, Status Text: ${apiResponse.statusText}`);

            const cacheDir = path.join(__dirname, '..', 'cache');
            if (!fs.existsSync(cacheDir)) {
                fs.mkdirSync(cacheDir);
            }
            const imagePath = path.join(cacheDir, `pair_${senderID}_${partnerID}.png`);
            fs.writeFileSync(imagePath, Buffer.from(apiResponse.data, 'binary'));

            const messageBody = `💕 Successful Pairing! 💕\n\n${senderName} & ${partnerName}\n\nLove Percentage: ${lovePercentage}%`;
            api.sendMessage({
                body: messageBody,
                mentions: [
                    { tag: senderName, id: senderID },
                    { tag: partnerName, id: partnerID }
                ],
                attachment: fs.createReadStream(imagePath)
            }, threadID, () => fs.unlinkSync(imagePath));

            log('info', `Pair command executed by ${senderID} in thread ${threadID} with partner ${partnerID}`);
        } catch (error) {
            console.error("Error in pair command:", error);
            log('error', `Pair command error: ${error.message}`);
            api.sendMessage("Sorry, an error occurred while creating your pair.", threadID);
        }
    },
};