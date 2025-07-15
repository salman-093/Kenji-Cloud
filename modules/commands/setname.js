module.exports = {
  config: {
    name: 'setname',
    version: '1.0',
    author: 'Hridoy',
    countDown: 5,
    prefix: true,
    groupAdminOnly: true,
    description: 'Sets a user`s nickname in the group.',
    category: 'group',
    guide: {
      en: '   {pn} [uid|@mention] [new_nickname]'
    },
  },
  onStart: async ({ api, event, args }) => {
    try {
      let targetID;
      let newNickname;

      if (event.mentions && Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
        newNickname = args.slice(1).join(' ');
      } else if (args.length >= 2) {
        targetID = args[0];
        newNickname = args.slice(1).join(' ');
      } else {
        return api.sendMessage('Please provide a UID or mention a user and a new nickname.', event.threadID);
      }

      if (!targetID || !newNickname) {
        return api.sendMessage('Invalid arguments. Usage: !setname [uid|@mention] [new_nickname]', event.threadID);
      }

      api.changeNickname(newNickname, event.threadID, targetID, (err) => {
        if (err) {
          console.error("Failed to set nickname:", err);
          return api.sendMessage('Failed to set nickname. Make sure the bot has admin privileges in this group.', event.threadID);
        }
        api.sendMessage(`Successfully set nickname for user ${targetID} to '${newNickname}'.`, event.threadID);
      });

    } catch (error) {
      console.error("Error in setname command:", error);
      api.sendMessage('An error occurred while trying to set the nickname.', event.threadID);
    }
  },
};