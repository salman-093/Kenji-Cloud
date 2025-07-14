const { log } = require('../logger/logger');

const validateInput = (input) => {
  if (typeof input !== 'string') return false;
  return !/[<>]/.test(input); 
};

const formatMessage = (text) => {
  return text.trim().substring(0, 2000); 
};

const rateLimit = (fn, ms) => {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= ms) {
      lastCall = now;
      return fn(...args);
    }
    return null;
  };
};

module.exports = { validateInput, formatMessage, rateLimit };