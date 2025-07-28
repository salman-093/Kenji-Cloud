const axios = require('axios');
const { log } = require('../../logger/logger');

module.exports = {
    config: {
        name: "cleanuri",
        version: "1.0",
        author: "Hridoy",
        countDown: 5,
        prefix: true,
        adminOnly: false,
        description: "Shorten a URL using CleanURI API",
        category: "utility",
        guide: {
            en: "   {pn} <url>: Shorten the provided URL."
        }
    },

    onStart: async ({ event, api, args }) => {
        try {
            if (!args[0]) {
                return api.sendMessage('Please provide a URL to shorten.', event.threadID);
            }

            const url = encodeURIComponent(args.join(" ").trim());
            if (url.includes(" ") || !url) {
                return api.sendMessage('Invalid URL. Remove spaces and ensure it\'s a valid URL.', event.threadID);
            }

            const response = await axios.post('https://cleanuri.com/api/v1/shorten', `url=${url}`, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                timeout: 15000
            });

            const shortenedUrl = response.data.result_url;
            await api.sendMessage(`Original URL: ${decodeURIComponent(url)}\nShortened URL: ${shortenedUrl}`, event.threadID);

            log('info', `ShortURL command executed by ${event.senderID} in thread ${event.threadID}`);
        } catch (error) {
            log('error', `ShortURL command error: ${error.message || 'Unknown error'}`);
            api.sendMessage('An error occurred while shortening the URL. Please check the URL and try again.', event.threadID);
        }
    }
};