module.exports = {
    config: {
        name: 'tid',
        version: '1.0',
        author: 'Hridoy',
        countDown: 5,
        prefix: true,
        groupAdminOnly: false,
        description: 'Get the current thread/group ID.',
        category: 'utility',
        guide: {
            en: '   {pn}'
        },
    },
    onStart: async ({ api, event }) => {
        api.sendMessage(`The Thread ID is: ${event.threadID}`, event.threadID);
    },
};
