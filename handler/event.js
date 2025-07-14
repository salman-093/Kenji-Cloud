const fs = require('fs');
const path = require('path');
const { log } = require('../logger/logger');


const events = new Map();
const eventPath = path.join(__dirname, '../modules/events');
const files = fs.readdirSync(eventPath).filter(file => file.endsWith('.js'));

for (const file of files) {
    try {
        const eventModule = require(path.join(eventPath, file));
        if (eventModule.config && eventModule.config.name && eventModule.config.eventType) {
            events.set(eventModule.config.name, eventModule);
            log('info', `Loaded event: ${eventModule.config.name}`);
        } else {
            log('error', `Failed to load event from ${file}: missing or invalid config.`);
        }
    } catch (error) {
        log('error', `Error loading event ${file}: ${error.message}`);
    }
}


module.exports = async (event, api) => {
    try {
        for (const [eventName, eventModule] of events) {
            const eventTypes = eventModule.config.eventType;

        
            let shouldTrigger = false;
            if (event.type === 'event' && eventTypes.includes(event.logMessageType)) {
                shouldTrigger = true;
            } else if ((event.type === 'message' || event.type === 'message_reply') && (eventTypes.includes('message') || eventTypes.includes('message_reply'))) {
                shouldTrigger = true;
            }

            if (shouldTrigger) {
                try {
                
                    await eventModule.onStart({ event, api });
                } catch (err) {
                    log('error', `Error executing event ${eventName}: ${err.message}`);
                }
            }
        }
    } catch (error) {
        log('error', `An unexpected error occurred in the event handler: ${error.message}`);
    }
};
