const axios = require('axios');
const { log } = require('../../logger/logger');

module.exports = {
    config: {
        name: "tinyurl",
        version: "1.0",
        author: "Hridoy",
        countDown: 5,
        prefix: true,
        adminOnly: false,
        description: "Shorten a URL using TinyURL API",
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

            const url = args.join(" ");
            const apiKey = "rzjQPNYy2Ktvyik5QGhPT1rrdGSTUtnN4dYurUtJKsSrxj3layuHKKJD2VF7";
            const response = await axios.post('https://api.tinyurl.com/create', {
                url: url,
                api_token: apiKey
            }, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 15000
            });

            const shortenedUrl = response.data.data.tiny_url;
            await api.sendMessage(`Original URL: ${url}\nShortened URL: ${shortenedUrl}`, event.threadID);

            log('info', `TinyURL command executed by ${event.senderID} in thread ${event.threadID}`);
        } catch (error) {
            log('error', `TinyURL command error: ${error.message || 'Unknown error'}`);
            api.sendMessage('An error occurred while shortening the URL. Please check the URL and try again.', event.threadID);
        }
    }
};