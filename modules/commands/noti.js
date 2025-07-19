const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const config = require('../../config/config.json');

module.exports = {
    config: {
        name: 'adminnoti',
        version: '1.0',
        author: 'Hridoy',
        countDown: 5,
        prefix: true,
        adminOnly: true,
        description: 'Send a notification to all groups (admin only).',
        category: 'admin',
        guide: {
            en: '   {pn}noti <text> (or reply to media with <text>)'
        },
    },
    onStart: async ({ api, event, args }) => {
        const threadID = event.threadID;
        const messageID = event.messageID;

        const text = args.join(' ').trim();
        if (!text) {
            return api.sendMessage('❌ Please provide a text. Example: !noti Hello everyone', threadID, messageID);
        }

        try {
         
            const adminName = config.ownerName || 'Admin';

         
            console.log('================================');
            console.log(`Bot Admin Notification - ${adminName}`);
            console.log('--------------------------------');
            console.log(`Message: ${text}`);
            const sendTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });
            console.log(`Send Time: ${sendTime}`);
            console.log('================================');


            const allThreads = await api.getThreadList(100, null, ['INBOX']);
            const groupThreads = allThreads.filter(t => t.isGroup && t.participantIDs.includes(api.getCurrentUserID()));

            if (groupThreads.length === 0) {
                return api.sendMessage('❌ No groups found where the bot is active.', threadID, messageID);
            }

            let attachments = [];
            if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
                const cacheDir = path.resolve(__dirname, 'cache');
                await fs.ensureDir(cacheDir);

                for (const attachment of event.messageReply.attachments) {
                    const url = attachment.url || (attachment.type === 'photo' ? attachment.largePreviewUrl : null);
                    if (url) {
                        const filePath = path.resolve(cacheDir, `noti_${threadID}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.${attachment.type}`);
                        const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
                        await fs.writeFile(filePath, Buffer.from(response.data));
                        attachments.push(fs.createReadStream(filePath));
                    }
                }
            }


            const notificationMessage = `================================\n` +
                                       `Bot Admin Notification - ${adminName}\n` +
                                       `--------------------------------\n` +
                                       `Message: ${text}\n` +
                                       `Send Time: ${sendTime}\n` +
                                       `================================`;

        
            let successCount = 0;
            for (const thread of groupThreads) {
                await new Promise(resolve => {
                    api.sendMessage({
                        body: notificationMessage,
                        attachment: attachments.length > 0 ? attachments : undefined
                    }, thread.threadID, (err) => {
                        if (!err) successCount++;
                        if (attachments.length > 0) {
                            attachments.forEach(stream => fs.unlinkSync(stream.path));
                        }
                        resolve();
                    });
                });
            }

            api.sendMessage(`✅ Notification sent successfully to ${successCount} group(s)!`, threadID, messageID);

        } catch (error) {
            console.error('AdminNoti error:', error.message);
            api.sendMessage(`❌ Error: ${error.message}`, threadID, messageID);
        }
    },
};