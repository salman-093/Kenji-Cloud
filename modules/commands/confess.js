const fs = require('fs');
const path = require('path');
const axios = require('axios');

const confessAssetsPath = path.join(__dirname, '..', '..', 'assets', 'confess.json');

const defaultMessages = [
    "I have a secret crush on you.",
    "I can't stop thinking about you.",
    "You've made a huge impact on my life.",
    "I admire you from afar.",
    "Your smile brightens my day.",
    "I wish I had the courage to talk to you.",
    "You inspire me every single day.",
    "I’ve been hiding my feelings for a while now.",
    "I feel happy just seeing your name pop up.",
    "There’s something about you I can’t explain.",
    "You make my world feel complete.",
    "Whenever I’m down, I think about you.",
    "You have the most beautiful eyes I've ever seen.",
    "Your energy lights up every room you enter.",
    "I dream about being with you someday.",
    "You’ve changed my perspective on life.",
    "I feel lucky just knowing you exist.",
    "You’re the reason behind my random smiles.",
    "Seeing you makes my day instantly better.",
    "I could watch you all day and never get bored.",
    "Your voice is my favorite sound.",
    "I can't help but fall for you more every day.",
    "You’re more special than you realize.",
    "I never believed in love at first sight until I saw you.",
    "You make even the smallest moments feel magical.",
    "If only you knew how much you mean to me.",
    "You always know how to make me smile.",
    "I find peace just being around you.",
    "My heart races whenever I see you.",
    "You are the missing piece in my puzzle.",
    "Every little thing about you makes me happy.",
    "You’re my favorite kind of distraction.",
    "There’s nobody else I’d rather be with.",
    "Your laugh is literally the best sound ever.",
    "I wish I could freeze time when we’re together.",
    "I feel complete when you’re near me.",
    "You have no idea how much I care about you.",
    "Every time I look at you, I fall all over again.",
    "You're the first person I think about in the morning.",
    "I just want to make you happy always.",
    "Even your flaws make you perfect to me.",
    "Being with you feels like home.",
    "I secretly wish you felt the same about me.",
    "You always make life feel less heavy.",
    "The world feels brighter when you’re around.",
    "You’re the kind of person people write songs about.",
    "Just one smile from you can change my whole mood.",
    "You make ordinary days feel like an adventure.",
    "No one has ever made me feel like this before.",
    "You’re my favorite notification.",
    "You’re effortlessly amazing in everything you do."
];


function readAssets() {
    try {
        const data = fs.readFileSync(confessAssetsPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading confess assets:', error);
        return { image_urls: [] };
    }
}

module.exports = {
    config: {
        name: 'confess',
        version: '1.2',
        author: 'Hridoy',
        countDown: 30,
        prefix: true,
        groupAdminOnly: false,
        description: 'Sends an anonymous confession to a user.',
        category: 'utility',
        guide: {
            en: '   {pn} [@mention|uid] [message]'
        },
    },
    onStart: async ({ api, event, args }) => {
        const { senderID, mentions } = event;
        let targetID;
        let message;

        if (Object.keys(mentions).length > 0) {
            targetID = Object.keys(mentions)[0];
            const mentionText = mentions[targetID];
            message = args.join(' ').replace(mentionText, '').trim();
        } else {
            targetID = args.shift();
            message = args.join(' ');
        }

        if (!targetID) {
            return api.sendMessage('Please specify a user to confess to.', event.threadID);
        }
        
        if (targetID == senderID) {
            return api.sendMessage("You can't confess to yourself!", event.threadID);
        }

        const assets = readAssets();
        if (!assets.image_urls || assets.image_urls.length === 0) {
            return api.sendMessage('Could not find any confession images.', event.threadID);
        }

        const validImageUrls = assets.image_urls.filter(url => url && typeof url === 'string');
        if (validImageUrls.length === 0) {
            return api.sendMessage('No valid confession images available.', event.threadID);
        }

        const randomImage = validImageUrls[Math.floor(Math.random() * validImageUrls.length)];
        const confessionMessage = message || defaultMessages[Math.floor(Math.random() * defaultMessages.length)];

        let imagePath = null;
        try {
            console.log(`[API Request] Fetching image from: ${randomImage}`);
            const imageResponse = await axios.get(randomImage, { responseType: 'arraybuffer' });
            console.log(`[API Response] Status: ${imageResponse.status}, Status Text: ${imageResponse.statusText}`);

            const cacheDir = path.join(__dirname, 'cache');
            if (!fs.existsSync(cacheDir)) {
                fs.mkdirSync(cacheDir);
            }
            imagePath = path.join(cacheDir, `confess_${Date.now()}${path.extname(randomImage)}`);
            fs.writeFileSync(imagePath, Buffer.from(imageResponse.data, 'binary'));

            const senderInfo = await api.getUserInfo(senderID);
            const senderName = senderInfo[senderID]?.name || 'Anonymous';

            const finalMessage = {
                body: `Someone has a confession for you:\n\n"${confessionMessage}"\n\nFrom: facebook.com/${senderID}`,
                attachment: fs.createReadStream(imagePath)
            };

            api.sendMessage(finalMessage, targetID, (err) => {
                if (imagePath) fs.unlinkSync(imagePath);
                if (err) {
                    console.error("Failed to send confession:", err);
                    api.sendMessage("Could not send the confession. The user might have blocked the bot.", event.threadID);
                } else {
                    api.sendMessage("Your confession has been sent successfully!", event.threadID);
                }
            });

        } catch (error) {
            console.error(`[API Error] Failed to fetch image ${randomImage}:`, error.message);
            if (imagePath) fs.unlinkSync(imagePath);
            api.sendMessage("An error occurred while sending the confession. Using text only.", event.threadID);
            const textOnlyMessage = {
                body: `Someone has a confession for you:\n\n"${confessionMessage}"\n\nFrom: facebook.com/${senderID}`
            };
            api.sendMessage(textOnlyMessage, targetID, (err) => {
                if (err) {
                    console.error("Failed to send text-only confession:", err);
                    api.sendMessage("Could not send the confession. The user might have blocked the bot.", event.threadID);
                } else {
                    api.sendMessage("Your confession has been sent as text successfully!", event.threadID);
                }
            });
        }
    },
};