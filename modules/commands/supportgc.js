const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', '..', 'config', 'config.json');

function readConfig() {
    try {
        const data = fs.readFileSync(configPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading config file:', error);
        return {};
    }
}

module.exports = {
    config: {
        name: 'supportgc',
        version: '1.0',
        author: 'Hridoy',
        countDown: 30,
        prefix: true,
        groupAdminOnly: false,
        description: 'Join the support group chat.',
        category: 'utility',
        guide: {
            en: '   {pn}'
        },
    },
    onStart: async ({ api, event }) => {
        const { senderID, threadID } = event;
        const config = readConfig();

        if (!config.supportGC) {
            return api.sendMessage("The support group ID has not been configured.", threadID);
        }

        try {
            const supportGroupInfo = await api.getThreadInfo(config.supportGC);
            if (supportGroupInfo.participantIDs.includes(senderID)) {
                return api.sendMessage("You are already in the support group.", threadID);
            }

            const userInfo = await api.getUserInfo(senderID);
            const userName = userInfo[senderID].name;

            api.sendMessage(`Adding ${userName} to the support group...`, threadID);

            api.addUserToGroup(senderID, config.supportGC, (err) => {
                if (err) {
                    console.error("Failed to add user to support group:", err);
                    api.sendMessage("Failed to add you to the support group. The bot may not be an admin in the group or another error occurred.", threadID);
                } else {
                    api.sendMessage(`Successfully added ${userName} to the support group!`, threadID);
                }
            });
        } catch (error) {
            console.error("Error getting support group info:", error);
            api.sendMessage("Could not verify the support group. The bot may not be a member of it.", threadID);
        }
    },
};
