const { log } = require('../logger/logger');

const cooldowns = new Map();

const checkCooldown = (userID, commandName, countDown) => {
  const key = `${userID}_${commandName}`;
  const now = Date.now();
  const lastUsed = cooldowns.get(key) || 0;
  if (now - lastUsed < countDown * 1000) {
    return false;
  }
  cooldowns.set(key, now);
  return true;
};

module.exports = { checkCooldown };