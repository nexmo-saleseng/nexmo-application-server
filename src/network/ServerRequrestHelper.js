'use strict';

const request = require('request');
const uuid = require('uuid');
const logsUtils = require('../utils/LogsUtils');
const httpError = require('http-errors');

const ServerRequestHelper = {};

function sendRequest(logContext, method, uri, json, headers, auth) {
    return new Promise((resolve, reject) => {
        const reqId = uuid.v4();
        logsUtils.log.info(logContext, '[' + reqId + '] OUTBOUND REQUEST ' + method + ' ' + uri, {body: json});
        const requestObject = {
            url: uri,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (headers) {
            const keys = Object.keys(headers);
            for (let index = 0; index < keys.length; index++) {
                requestObject.headers[keys[index]] = headers[keys[index]];
            }
        }

        if (json) {
            requestObject.json = json;
        }

        if (auth) {
            requestObject.auth = auth;
        }

        request(requestObject, function(error, response, body) {
            if (error) {
                logsUtils.log.error(logContext, error);
                return reject(new httpError.InternalServerError('Something failed!'));
            }

            if (body) {
                logsUtils.log.info(logContext, '[' + reqId + '] OUTBOUND RESPONSE ' + response.statusCode + ' ' + method + ' ' + uri, {body: body});
            } else {
                logsUtils.log.info(logContext, '[' + reqId + '] OUTBOUND RESPONSE ' + response.statusCode + ' ' + method + ' ' + uri);
            }

            if (response.statusCode < 200 || response.statusCode >= 300) {
                error = new httpError.BadRequest('Server Error');
                error.body = body;
                logsUtils.log.error(logContext,
                    {
                        name: error.name,
                        message: error.message,
                        status: error.status,
                        body: error.body
                    });
                return reject(error);
            }

            return resolve({
                body: body,
                response: response,
            });
        });
    });
}

ServerRequestHelper.sendPOSTRequest = (logContext, uri, json, headers, auth) => {
    return sendRequest(logContext, 'POST', uri, json, headers, auth);
};

ServerRequestHelper.sendPUTRequest = (logContext, uri, json, headers, auth) => {
    return sendRequest(logContext, 'PUT', uri, json, headers, auth);
};

ServerRequestHelper.sendDELETERequest = (logContext, uri, json, headers, auth) => {
    return sendRequest(logContext, 'DELETE', uri, json, headers, auth);
};

ServerRequestHelper.sendGETRequest = (logContext, uri, json, headers, auth) => {
    return sendRequest(logContext, 'GET', uri, json, headers, auth);
};


module.exports = ServerRequestHelper;
