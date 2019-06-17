'use strict';

const bunyan = require('bunyan');
const PrettyStream = require('bunyan-prettystream');
const logsUtils = { log: {} };

logsUtils.createNewLogger = () => {
    logsUtils.log = bunyan.createLogger({
        name: 'NexmoServer',
        streams: [{
            type: 'rotating-file',
            path: process.env.LOGGER_PATH,
            period: process.env.LOGGER_PERIOD,
            count: parseInt(process.env.LOGGER_COUNT),
        }],
    });
};

logsUtils.createTestLogger = () => {
    const prettyStdOut = new PrettyStream();
    prettyStdOut.pipe(process.stdout);
    logsUtils.log = bunyan.createLogger({
        name: 'NexmoServer-Test',
        streams: [{
            level: 'debug',
            type: 'raw',
            stream: prettyStdOut,
        }],
    });
};

logsUtils.resetLogger = () => {
    logsUtils.log = {};
};

logsUtils.createUserContext = (displayName, userName, conversationName) => {
    return {
        user:
        {
            display_name: displayName,
            user_name: userName,
            converstion: conversationName,
        },
    };
};

logsUtils.createPSTNContext = (pinCode, roomId) => {
    return {
        pin_code: pinCode,
        room_id: roomId
    };
};

module.exports = logsUtils;
