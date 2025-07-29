const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: 'dl',
    version: '1.0',
    author: 'Hridoy',
    countDown: 5,
    prefix: true,
    description: 'Download and send videos from Facebook, Instagram, TikTok, or YouTube.',
    category: 'media',
    guide: {
      en: '{pn}dl <video_url>'
    }
  },

  onStart: async ({ api, event, args }) => {
    const threadID = event.threadID;
    const messageID = event.messageID;
    const url = args.join(' ').trim();

    if (!url || !url.startsWith('https://')) {
      return api.sendMessage('❌ Please provide a valid video URL. Example: {pn}dl https://www.youtube.com/watch?v=example', threadID, messageID);
    }

    let statusMsg;
    try {
     
      statusMsg = await new Promise((resolve, reject) => {
        api.sendMessage('🔎 Processing your video...', threadID, (err, info) => {
          if (err) reject(err);
          else resolve(info);
        }, messageID);
      });

      let apiUrl, downloadKey;
     
      if (url.includes('facebook.com') || url.includes('fb.watch')) {
        apiUrl = `https://hridoy-apis.vercel.app/downloader/facebook2?url=${encodeURIComponent(url)}&apikey=hridoyXQC`;
        downloadKey = 'video_HD.url';
      } else if (url.includes('instagram.com')) {
        apiUrl = `https://hridoy-apis.vercel.app/downloader/instagram?url=${encodeURIComponent(url)}&apikey=hridoyXQC`;
        downloadKey = 'downloadUrl';
      } else if (url.includes('tiktok.com')) {
        apiUrl = `https://hridoy-apis.vercel.app/downloader/tiktok3?url=${encodeURIComponent(url)}&apikey=hridoyXQC`;
        downloadKey = 'data.vid1';
      } else if (url.includes('youtu.be') || url.includes('youtube.com')) {
        apiUrl = `https://hridoy-apis.vercel.app/downloader/ytmp4?url=${encodeURIComponent(url)}&format=1080&apikey=hridoyXQC`;
        downloadKey = 'result.download';
      } else {
        await api.editMessage('❌ Unsupported URL. Please provide a valid Facebook, Instagram, TikTok, or YouTube URL.', statusMsg.messageID);
        return;
      }

     
      await api.editMessage('⬇️ Downloading video...', statusMsg.messageID);

     
      const response = await axios.get(apiUrl);
      if (!response.data || !response.data.status) {
        await api.editMessage('❌ Failed to fetch video download link.', statusMsg.messageID);
        return;
      }

     
      const downloadUrl = downloadKey.split('.').reduce((obj, key) => obj && obj[key], response.data);
      if (!downloadUrl) {
        await api.editMessage('❌ No valid download link found in the response.', statusMsg.messageID);
        return;
      }

     
      const cacheDir = path.join(__dirname, 'cache');
      await fs.ensureDir(cacheDir);
      const filePath = path.join(cacheDir, `video_${Date.now()}.mp4`);

      
      const videoRes = await axios.get(downloadUrl, { responseType: 'arraybuffer', timeout: 60000 });
      await fs.writeFile(filePath, Buffer.from(videoRes.data));

      
      await api.editMessage('📤 Sending video...', statusMsg.messageID);

      
      const title = response.data.result?.title || response.data.data?.title || 'Video';
      const author = response.data.data?.author || response.data.creator || 'Unknown';

     
      await new Promise((resolve, reject) => {
        api.sendMessage({
          body: `🎥 ${title}\n👤 Author: ${author}`,
          attachment: fs.createReadStream(filePath)
        }, threadID, (err) => {
          fs.unlink(filePath).catch(() => {});
          if (err) reject(err);
          else resolve();
        }, messageID);
      });

     
      if (statusMsg?.messageID) {
        await api.unsendMessage(statusMsg.messageID);
      }

    } catch (error) {
      console.error('[dl] Error:', error);
      if (statusMsg?.messageID) {
        await api.editMessage('❌ Error occurred while processing your request.', statusMsg.messageID);
        setTimeout(() => api.unsendMessage(statusMsg.messageID), 10000);
      } else {
        api.sendMessage('❌ Error occurred while processing your request.', threadID, messageID);
      }
    }
  }
};