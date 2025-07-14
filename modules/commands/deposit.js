const fs = require('fs');
const path = require('path');

const userDBPath = path.join(__dirname, '..', '..', 'database', 'users.json');
const bankDBPath = path.join(__dirname, '..', '..', 'database', 'bank.json');

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
        name: 'deposit',
        version: '1.0',
        author: 'Hridoy',
        countDown: 5,
        prefix: true,
        groupAdminOnly: false,
        description: 'Deposit money from your balance to your bank account.',
        category: 'economy',
        guide: {
            en: '   {pn} <amount>'
        },
    },
    onStart: async ({ api, event, args }) => {
        const { senderID } = event;
        const amount = parseInt(args[0]);

        if (isNaN(amount) || amount <= 0) {
            return api.sendMessage('Please provide a valid amount to deposit.', event.threadID);
        }

        const userDB = readDB(userDBPath);
        const bankDB = readDB(bankDBPath);

        if (!userDB[senderID]) {
            return api.sendMessage("You don't have a user account.", event.threadID);
        }

        if (!bankDB[senderID]) {
            return api.sendMessage("You don't have a bank account. Use `bank create` to make one.", event.threadID);
        }

        if (userDB[senderID].balance < amount) {
            return api.sendMessage("You don't have enough balance to deposit that amount.", event.threadID);
        }

        userDB[senderID].balance -= amount;
        bankDB[senderID].bankBalance += amount;

        writeDB(userDBPath, userDB);
        writeDB(bankDBPath, bankDB);

        return api.sendMessage(`Successfully deposited ${amount}. Your new bank balance is ${bankDB[senderID].bankBalance}.`, event.threadID);
    },
};
