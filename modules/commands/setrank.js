const fs = require('fs');
const path = require('path');

const userDBPath = path.join(__dirname, '..', '..', 'database', 'users.json');
const configPath = path.join(__dirname, '..', '..', 'config', 'config.json');

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
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    } catch (error) {
        console.error(`Error writing to database at ${filePath}:`, error);
    }
}

module.exports = {
    config: {
        name: 'setrank',
        version: '1.0',
        author: 'Hridoy',
        countDown: 5,
        prefix: true,
        groupAdminOnly: false, 
        description: 'Set a user\'s rank, xp, or reset it (Bot Admin only).',
        category: 'admin',
        guide: {
            en: '   {pn} xp [@mention|uid] <amount>' +
                '\n   {pn} level [@mention|uid] <level>' +
                '\n   {pn} reset [@mention|uid]'
        },
    },
    onStart: async ({ api, event, args }) => {
        const { senderID, mentions } = event;
        const config = readDB(configPath);

        if (!config.adminUIDs || !config.adminUIDs.includes(senderID)) {
            return api.sendMessage("You don't have permission to use this command.", event.threadID);
        }

        const subcommand = args.shift();
        let targetID;
        let valueArg;

        if (mentions && Object.keys(mentions).length > 0) {
            targetID = Object.keys(mentions)[0];
            const mentionText = mentions[targetID];
            const remainingText = args.join(' ');
            valueArg = remainingText.replace(mentionText, '').trim();
        } else {
            targetID = args.shift();
            valueArg = args.join(' ');
        }

        if (!subcommand || !targetID) {
            return api.sendMessage('Invalid usage. Please follow the guide.', event.threadID);
        }

        const userDB = readDB(userDBPath);

        if (!userDB[targetID]) {
            return api.sendMessage("This user does not have an account.", event.threadID);
        }

        switch (subcommand) {
            case 'xp':
                const xpAmount = parseInt(valueArg);
                if (isNaN(xpAmount) || xpAmount < 0) {
                    return api.sendMessage('Please provide a valid non-negative XP amount.', event.threadID);
                }
                userDB[targetID].xp = xpAmount;
                writeDB(userDBPath, userDB);
                return api.sendMessage(`Successfully set ${userDB[targetID].name}'s XP to ${xpAmount}.`, event.threadID);

            case 'level':
                const levelAmount = parseInt(valueArg);
                if (isNaN(levelAmount) || levelAmount < 0) {
                    return api.sendMessage('Please provide a valid non-negative level number.', event.threadID);
                }
                userDB[targetID].rank = levelAmount;
                writeDB(userDBPath, userDB);
                return api.sendMessage(`Successfully set ${userDB[targetID].name}'s level to ${levelAmount}.`, event.threadID);

            case 'reset':
                userDB[targetID].xp = 0;
                userDB[targetID].rank = 1;
                userDB[targetID].totalxp = 0; 
                writeDB(userDBPath, userDB);
                return api.sendMessage(`Successfully reset ${userDB[targetID].name}'s rank and XP.`, event.threadID);

            default:
                return api.sendMessage('Invalid subcommand. Use `xp`, `level`, or `reset`.', event.threadID);
        }
    },
};