const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { createReadStream } = require('fs');
const { log } = require('../../logger/logger');


const createAxiosConfig = (timeout = 15000, isDownload = true) => ({
  timeout,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': isDownload ? 'audio/mpeg, audio/*' : 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': isDownload ? 'audio' : 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'cross-site'
  },
  maxRedirects: 5,
  responseType: isDownload ? 'arraybuffer' : 'json'
});


const retryRequest = async (requestFunc, maxRetries = 3, baseDelay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFunc();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = baseDelay * Math.pow(2, i) + Math.random() * 1000;
      console.log(`Retry ${i + 1}/${maxRetries} after ${Math.round(delay)}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

module.exports = {
    config: {
        name: "spotify",
        version: "1.0",
        author: "Hridoy",
        countDown: 10,
        prefix: true,
        groupAdminOnly: false,
        description: "Fetches and sends an MP3 file for a specified music name from Spotify.",
        category: "media",
        guide: {
            en: "   {pn} <music name>: Fetch and send an MP3 file for the given music name."
        }
    },
    onStart: async ({ event, api, args }) => {
        try {
            const threadId = event.threadID;
            const messageId = event.messageID;

            if (!args[0]) {
                return api.sendMessage("Please provide a music name, e.g., !Spotify song name.", threadId, messageId);
            }

            const musicName = encodeURIComponent(args.join(" "));
            const apiUrl = `https://hridoy-apis.vercel.app/play/spotify-v2?q=${musicName}&apikey=hridoyXQC`;
            console.log(`[API Request] Sending to: ${apiUrl}`);

            const apiResponse = await retryRequest(async () => {
                return await axios.get(apiUrl, createAxiosConfig(45000, true));
            });

            console.log(`[API Response] Status: ${apiResponse.status}, Status Text: ${apiResponse.statusText}`);

            if (apiResponse.status !== 200 || !apiResponse.data || apiResponse.data.byteLength < 1000) {
                throw new Error('Invalid response from Spotify API');
            }

            const cacheDir = path.resolve(__dirname, '..', 'cache');
            await fs.ensureDir(cacheDir);
            const audioPath = path.resolve(cacheDir, `spotify_${Date.now()}.mp3`);
            await fs.writeFile(audioPath, Buffer.from(apiResponse.data));

            const messageBody = `Here’s your requested song: ${args.join(" ")}`;
            await new Promise((resolve, reject) => {
                api.sendMessage(
                    {
                        body: messageBody,
                        attachment: createReadStream(audioPath)
                    },
                    threadId,
                    (err) => {
                        fs.unlink(audioPath).catch(() => {});
                        if (err) reject(err);
                        else resolve();
                    },
                    messageId
                );
            });

            log('info', `Spotify command executed by ${event.senderID} in thread ${threadId} for ${args.join(" ")}`);
        } catch (error) {
            console.error("Error in Spotify command:", error);
            log('error', `Spotify command error: ${error.message}`);
            api.sendMessage("Sorry, an error occurred while fetching the song.", event.threadID, event.messageID);
        }
    }
};