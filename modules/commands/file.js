const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: 'file',
    version: '1.0',
    author: 'Hridoy',
    countDown: 5,
    prefix: true,
    adminOnly: true,
    description: 'Sends the specified command file as a message.',
    category: 'Group',
    guide: {
      en: '   {pn} [command_name]'
    },
  },
  onStart: async ({ message, args, event, api }) => {
    try {
      if (args.length < 1) {
        return api.sendMessage('Usage: !file [command_name]', event.threadID);
      }

      const commandName = args[0].toLowerCase();
      const commandPath = path.join(__dirname, `${commandName}.js`);

      if (fs.existsSync(commandPath)) {
        const fileContent = fs.readFileSync(commandPath, 'utf8');
        api.sendMessage({ body: `javascript\n${fileContent}\n` }, event.threadID);
      } else {
        api.sendMessage(`Command '${commandName}' not found.`, event.threadID);
      }
    } catch (error) {
      console.log(error);
      api.sendMessage('An error occurred while fetching the command file.', event.threadID);
    }
  },
};
