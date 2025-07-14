const fs = require('fs');
const path = require('path');

const bankDBPath = path.join(__dirname, '..', '..', 'database', 'bank.json');

function readBankDB() {
    try {
        const data = fs.readFileSync(bankDBPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return {};
        }
        console.error('Error reading bank database:', error);
        return {};
    }
}

function writeBankDB(data) {
    try {
        fs.writeFileSync(bankDBPath, JSON.stringify(data, null, 4));
    } catch (error) {
        console.error('Error writing to bank database:', error);
    }
}

module.exports = {
    config: {
        name: 'bank',
        version: '1.1',
        author: 'Hridoy',
        countDown: 5,
        prefix: true,
        groupAdminOnly: false,
        description: 'Banking system with loans and top balances.',
        category: 'economy',
        guide: {
            en: '   {pn} create - Create a bank account' +
                '\n   {pn} - Check your bank balance' +
                '\n   {pn} loan <amount> - Get a loan' +
                '\n   {pn} clear - Clear your loan' +
                '\n   {pn} top - View top 10 richest users'
        },
    },
    onStart: async ({ api, event, args }) => {
        const { senderID } = event;
        const bankDB = readBankDB();
        const subcommand = args[0];

        if (!subcommand) {
            if (bankDB[senderID]) {
                const userData = bankDB[senderID];
                const statusMessage = `Your Bank Status:\n` +
                                      `Balance: ${userData.bankBalance}\n` +
                                      `Loan: ${userData.loan ? 'Yes' : 'No'}\n` +
                                      `Loan Amount: ${userData.loanAmount}`;
                return api.sendMessage(statusMessage, event.threadID);
            } else {
                return api.sendMessage("You don't have a bank account. Use `bank create` to make one.", event.threadID);
            }
        }

        if (subcommand === 'create') {
            if (bankDB[senderID]) {
                return api.sendMessage("You already have a bank account.", event.threadID);
            }
            bankDB[senderID] = {
                userID: senderID,
                loan: false,
                loanAmount: 0,
                bankBalance: 0
            };
            writeBankDB(bankDB);
            return api.sendMessage("Your bank account has been created successfully!", event.threadID);
        }

        if (!bankDB[senderID]) {
            return api.sendMessage("You don't have a bank account. Use `bank create` to make one first.", event.threadID);
        }

        if (subcommand === 'loan') {
            const amount = parseInt(args[1]);

            if (isNaN(amount) || amount <= 0) {
                return api.sendMessage('Please provide a valid amount for the loan.', event.threadID);
            }

            if (amount > 10000) {
                return api.sendMessage('You can only get a loan of up to 10,000.', event.threadID);
            }

            if (bankDB[senderID].loan) {
                return api.sendMessage('You already have an outstanding loan.', event.threadID);
            }

            bankDB[senderID].loan = true;
            bankDB[senderID].loanAmount = amount;
            bankDB[senderID].bankBalance += amount;

            writeBankDB(bankDB);

            return api.sendMessage(`You have successfully taken a loan of ${amount}. Your new balance is ${bankDB[senderID].bankBalance}.`, event.threadID);

        } else if (subcommand === 'clear') {
            if (!bankDB[senderID].loan) {
                return api.sendMessage('You do not have an outstanding loan.', event.threadID);
            }

            const loanAmount = bankDB[senderID].loanAmount;

            if (bankDB[senderID].bankBalance < loanAmount) {
                return api.sendMessage(`You do not have enough money to clear your loan. You need at least ${loanAmount}.`, event.threadID);
            }

            bankDB[senderID].bankBalance -= loanAmount;
            bankDB[senderID].loan = false;
            bankDB[senderID].loanAmount = 0;

            writeBankDB(bankDB);

            return api.sendMessage(`You have successfully cleared your loan. Your new balance is ${bankDB[senderID].bankBalance}.`, event.threadID);

        } else if (subcommand === 'top') {
            const sortedUsers = Object.values(bankDB).sort((a, b) => b.bankBalance - a.bankBalance);
            const topUsers = sortedUsers.slice(0, 10);

            let message = 'Top 10 Richest Users:\n';
            for (let i = 0; i < topUsers.length; i++) {
                const user = topUsers[i];
                try {
                    const userInfo = await api.getUserInfo(user.userID);
                    const name = userInfo[user.userID].name;
                    message += `${i + 1}. ${name}: ${user.bankBalance}\n`;
                } catch (e) {
                    message += `${i + 1}. User ${user.userID}: ${user.bankBalance}\n`;
                }
            }

            return api.sendMessage(message, event.threadID);

        } else {
            return api.sendMessage('Invalid subcommand. Use `bank create`, `bank loan`, `bank clear`, or `bank top`.', event.threadID);
        }
    },
};