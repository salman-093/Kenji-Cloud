const config = require('../config/config.json');
const { log } = require('../logger/logger');

const isOwner = (userID) => userID === config.ownerUID;
const isAdmin = (userID) => config.adminUIDs.includes(userID);
const hasPermission = (userID, commandConfig, threadInfo = null) => {
  if (commandConfig.adminOnly) {
    return isOwner(userID) || isAdmin(userID);
  }
  if (commandConfig.groupAdminOnly && threadInfo) {
    return isOwner(userID) || isAdmin(userID) || threadInfo.adminIDs.some(admin => admin.id === userID);
  }
  return true;
};

module.exports = { isOwner, isAdmin, hasPermission, isGroupAdmin: (userID, threadInfo) => threadInfo.adminIDs.some(admin => admin.id === userID) };