const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');
const logDir = path.join(__dirname, 'logs');fs.ensureDirSync(logDir);const logFile = path.join(logDir, `log_${moment().format('YYYYMMDD')}.log`);const log = (level, message) => {  const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}
`;  fs.appendFileSync(logFile, logMessage, { encoding: 'utf8' });  switch (level) {    case 'info':      console.log(logMessage);      break;    case 'error':      console.error(logMessage);      break;    case 'warn':      console.warn(logMessage);      break;  }};

module.exports = { log };