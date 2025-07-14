const fs = require('fs');
const path = require('path');

const userDBPath = path.join(__dirname, '..', '..', 'database', 'users.json');

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

module.exports = {
    config: {
        name: 'balance',
        version: '1.0',
        author: 'Hridoy',
        aliases: ['bal'],
        countDown: 5,
        prefix: true,
        groupAdminOnly: false,
        description: 'Check your or another user\'s balance.',
        category: 'economy',
        guide: {
            en: '   {pn}' +
                '\n   {pn} [@mention|uid]'
        },
    },
    onStart: async ({ api, event, args }) => {
        const { senderID, mentions } = event;
        let targetID;

        if (Object.keys(mentions).length > 0) {
            targetID = Object.keys(mentions)[0];
        } else if (args.length > 0) {
            targetID = args[0];
        } else {
            targetID = senderID;
        }

        const userDB = readDB(userDBPath);

        if (!userDB[targetID]) {
            if (targetID === senderID) {
                return api.sendMessage("You don't have a user account.", event.threadID);
            } else {
                return api.sendMessage("This user does not have an account.", event.threadID);
            }
        }

        const balance = userDB[targetID].balance;
        const name = userDB[targetID].name;

        let message;
        if (targetID === senderID) {
            message = `Your current balance is: ${balance}`;
        } else {
            message = `${name}'s current balance is: ${balance}`;
        }

        return api.sendMessage(message, event.threadID);
    },
};