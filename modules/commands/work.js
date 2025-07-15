const fs = require('fs');
const path = require('path');

const userDBPath = path.join(__dirname, '..', '..', 'database', 'users.json');
const cooldownsPath = path.join(__dirname, '..', '..', 'database', 'cooldowns.json');

function readDB(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return {};
        }
        console.error(`Error reading database at ${filePath}:`, error);
        return {};
    }
}

function writeDB(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error(`Error writing to database at ${filePath}:`, error);
    }
}

module.exports = {
    config: {
        name: 'work',
        version: '1.0',
        author: 'Hridoy',
        aliases: ['w'],
        countDown: 24 * 60 * 60, 
        prefix: true,
        groupAdminOnly: false,
        description: 'Work to earn some money. Cooldown is 24 hours.',
        category: 'economy',
        guide: {
            en: '   {pn}'
        },
    },

    onStart: async ({ api, event }) => {
        const { senderID } = event;
        const commandName = 'work';

        const cooldowns = readDB(cooldownsPath);
        const userCooldownKey = `${senderID}_${commandName}`;
        const now = Date.now();
        const cooldownTime = module.exports.config.countDown * 1000;

        if (cooldowns[userCooldownKey] && (now - cooldowns[userCooldownKey] < cooldownTime)) {
            const remainingMs = cooldowns[userCooldownKey] + cooldownTime - now;
            const totalSeconds = Math.floor(remainingMs / 1000);
            const days = Math.floor(totalSeconds / (24 * 3600));
            const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            let timeString = '';
            if (days > 0) timeString += `${days} day${days > 1 ? 's' : ''} `;
            if (hours > 0) timeString += `${hours} hour${hours > 1 ? 's' : ''} `;
            if (minutes > 0) timeString += `${minutes} minute${minutes > 1 ? 's' : ''} `;
            if (seconds > 0) timeString += `${seconds} second${seconds > 1 ? 's' : ''}`;

            return api.sendMessage(`🕒 You've already worked. Please wait ${timeString.trim()} before working again.`, event.threadID);
        }

        const userDB = readDB(userDBPath);

        if (!userDB[senderID]) {
            userDB[senderID] = {
                name: (await api.getUserInfo(senderID))[senderID].name,
                joinDate: new Date().toISOString(),
                messageCount: 0,
                isAdmin: false,
                isBanned: false,
                lastActive: new Date().toISOString(),
                rank: 1,
                xp: 0,
                totalxp: 0,
                balance: 0
            };
        }

        const amount = Math.floor(Math.random() * (200 - 50 + 1)) + 50;
        userDB[senderID].balance += amount;

        cooldowns[userCooldownKey] = now;

        writeDB(userDBPath, userDB);
        writeDB(cooldownsPath, cooldowns);

        return api.sendMessage(`💼 You worked hard and earned ${amount} coins.\n💰 Your new balance is ${userDB[senderID].balance} coins.`, event.threadID);
    },
};
