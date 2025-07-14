const { log } = require('../../logger/logger');
const axios = require('axios');
const fs = require('fs-extra');

module.exports = {
  config: {
    name: 'goodbye',
    version: '1.0',
    author: 'Hridoy',
    eventType: ['log:unsubscribe']
  },
  onStart: async ({ event, api }) => {
    try {
      const { logMessageData, threadID } = event;
      const ownUserID = api.getCurrentUserID();

      if (logMessageData.leftParticipantFbId === ownUserID) {
        return;
      }

      const thread = await api.getThreadInfo(threadID);
      const leftUserID = logMessageData.leftParticipantFbId;
      const userInfo = await api.getUserInfo(leftUserID);
      const userName = userInfo[leftUserID] ? userInfo[leftUserID].name : 'Someone';
      const userImageUrl = `https://graph.facebook.com/${leftUserID}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
      const goodbyeText = `${userName} has left ${thread.threadName}!`;


      const apiUrl = `https://nexalo-api.vercel.app/api/goodbye-card?image=${encodeURIComponent(userImageUrl)}&username=${encodeURIComponent(userName)}&text=${encodeURIComponent(goodbyeText)}`;
      console.log(`[API Request] Sending to: ${apiUrl}`);

   
      axios.interceptors.request.use(request => {
        console.log('[API Request Details]', {
          url: request.url,
          method: request.method,
          headers: request.headers,
          params: request.params
        });
        return request;
      }, error => {
        console.log('[API Request Error]', error);
        return Promise.reject(error);
      });


      const apiResponse = await axios.get(apiUrl, { responseType: 'arraybuffer' });
      console.log(`[API Response] Status: ${apiResponse.status}, Status Text: ${apiResponse.statusText}`);


      const cacheDir = __dirname + '/cache';
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir);
      }
      const imagePath = `${cacheDir}/goodbye_card.png`;
      fs.writeFileSync(imagePath, Buffer.from(apiResponse.data, 'binary'));

      await api.sendMessage({
        body: 'Goodbye!',
        attachment: fs.createReadStream(imagePath)
      }, threadID, () => fs.unlinkSync(imagePath));

      log('info', `Goodbye message sent to ${threadID} for user ${userName}`);
    } catch (error) {
      console.log('[API Error]', error.message);
      log('error', `Goodbye event error: ${error.message}`);
    }
  },
};