module.exports = {
  config: {
    name: 'botJoinedGroup',
    version: '1.0',
    author: 'Hridoy',
    description: 'Sets bot nickname when added to a new group.',
    eventType: ['log:subscribe'], 
  },
  onStart: async ({ api, event }) => {
    try {
      console.log('botJoinedGroup event triggered');
      const botID = await api.getCurrentUserID();
      const addedParticipants = event.logMessageData.addedParticipants;

      if (addedParticipants && addedParticipants.some(p => p.userFbId === botID)) {
        console.log('Bot has been added to the group');
        const botName = global.client.config.botName || 'Kenji Cloud';
        api.changeNickname(botName, event.threadID, botID, (err) => {
          if (err) {
            console.error("Failed to change bot nickname:", err);
          } else {
            console.log(`Bot nickname set to '${botName}' in thread ${event.threadID}`);
          }
        });
      }
    } catch (error) {
      console.error("Error in botJoinedGroup event:", error);
    }
  },
};