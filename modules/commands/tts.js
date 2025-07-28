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

module.exports = {
    config: {
        name: "tts",
        version: "1.0",
        author: "Hridoy",
        countDown: 10,
        prefix: true,
        groupAdminOnly: false,
        description: "Converts text to voice and sends it as an MP3 file.",
        category: "media",
        guide: {
            en: "   {pn}tts <user text>: Convert the provided text to voice."
        }
    },
    onStart: async ({ event, api, args }) => {
        try {
            const threadId = event.threadID;
            const messageId = event.messageID;

            if (!args[0]) {
                return api.sendMessage("Please provide text to convert to voice, e.g., !tts Hello World.", threadId, messageId);
            }

            const text = encodeURIComponent(args.join(" "));
            const apiUrl = `https://hridoy-apis.vercel.app/tools/tts?text=${text}&apikey=hridoyXQC`;
            console.log(`[API Request] Sending to: ${apiUrl}`);

            const apiResponse = await axios.get(apiUrl, createAxiosConfig(45000, true));
            console.log(`[API Response] Status: ${apiResponse.status}, Status Text: ${apiResponse.statusText}`);

            if (apiResponse.status !== 200 || !apiResponse.data || apiResponse.data.byteLength < 1000) {
                throw new Error('Invalid response from TTS API');
            }

            const cacheDir = path.resolve(__dirname, '..', 'cache');
            await fs.ensureDir(cacheDir);
            const audioPath = path.resolve(cacheDir, `tts_${Date.now()}.mp3`);
            await fs.writeFile(audioPath, Buffer.from(apiResponse.data));

            const messageBody = `Here’s the voice for: ${args.join(" ")}`;
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

            log('info', `TTS command executed by ${event.senderID} in thread ${threadId} for text ${args.join(" ")}`);
        } catch (error) {
            console.error("Error in TTS command:", error);
            log('error', `TTS command error: ${error.message}`);
            api.sendMessage("Sorry, an error occurred while converting text to voice.", event.threadID, event.messageID);
        }
    }
};