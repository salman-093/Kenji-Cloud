const axios = require('axios');
const fs = require('fs-extra');

module.exports = {
  config: {
    name: 'cnggcimg',
    version: '1.0',
    author: 'Hridoy',
    countDown: 10,
    prefix: true,
    groupAdminOnly: true,
    description: 'Changes the group image.',
    category: 'group',
    guide: {
      en: '   {pn} [reply_to_image_message]'
    },
  },
  onStart: async ({ api, event }) => {
    try {
      if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
        return api.sendMessage('Please reply to an image message to set it as the group image.', event.threadID);
      }

      const attachment = event.messageReply.attachments[0];

      

      const imageUrl = attachment.url;
      const cacheDir = __dirname + '/cache';
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir);
      }
      const imagePath = cacheDir + '/threadimage.jpg';

      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(imagePath, Buffer.from(response.data, 'binary'));

      api.changeGroupImage(fs.createReadStream(imagePath), event.threadID, (err) => {
        fs.unlinkSync(imagePath); 
        if (err) {
          console.error("Failed to change thread image:", err);
          return api.sendMessage('Failed to change group image. Make sure the bot has admin privileges in this group.', event.threadID);
        }
        api.sendMessage('Successfully changed group image.', event.threadID);
      });

    } catch (error) {
      console.error("Error in threadimage command:", error);
      api.sendMessage('An error occurred while trying to change the group image.', event.threadID);
    }
  },
};