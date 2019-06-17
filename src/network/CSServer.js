'use strict';

const csServer = {};

const requestHelper = require('./ServerRequrestHelper');

const _getAuthHeader = (token) => {
    return {
        'Authorization': 'Bearer: ' + token,
        'cache-control': 'no-cache',
    };
};

const _getConversationByName = (logContext, conversationName, token) => {
    const uri = process.env.CS_PATH + 'conversations?name=' + conversationName;
    return requestHelper.sendGETRequest(logContext, uri, undefined, _getAuthHeader(token));
};

const _getConversationByCID = (logContext, cid, token) => {
    const uri = process.env.CS_PATH + 'conversations/' + cid;
    return requestHelper.sendGETRequest(logContext, uri, undefined, _getAuthHeader(token));
};

csServer.createUser = (logContext, name, displayName, token) => {
    const body = {
        display_name: displayName,
        name: name,
    };
    const uri = process.env.CS_PATH + 'users';
    return requestHelper.sendPOSTRequest(logContext, uri, body, _getAuthHeader(token));
};

csServer.getConversation = async (logContext, conversationName, conversationId, token) => {
    let conversationByNameResp;
    let conversationByNameBody;
    let conversationByIdResp;
    let conversationByIdBody;

    //Fetch the conversation by its name - and then re-query with it to get all properties of conversation, such as members
    if (!conversationId) {
        conversationByNameResp = await _getConversationByName(logContext, conversationName, token);
        conversationByNameBody = JSON.parse(conversationByNameResp.body);
        if (conversationByNameBody && conversationByNameBody.count === 1) {
            conversationId = conversationByNameBody._embedded.conversations[0].uuid;
        } else {
            return;
        }
    }

    conversationByIdResp = await _getConversationByCID(logContext, conversationId, token);
    conversationByIdBody = JSON.parse(conversationByIdResp.body);
    return conversationByIdBody;
};

csServer.createConversation = async (logContext, conversationName, displayName, token) => {
    const params = {
        name: conversationName,
        display_name: displayName,
        properties: {
            video: true,
        },
    };
    const uri = process.env.CS_PATH + 'conversations';
    const response = await requestHelper.sendPOSTRequest(logContext, uri, params, _getAuthHeader(token));
    //Keeping the same structure as returned from getConversation
    response.uuid = response.body.id;
    return response;
};

csServer.updateConversationName = (logContext, conversationId, conversationName, token) => {
    const params = {
        name: conversationName,
    };

    const uri = process.env.CS_PATH + 'conversations/' + conversationId;

    return requestHelper.sendPUTRequest(logContext, uri, params, _getAuthHeader(token));
};

csServer.inviteOrJoinMember = (logContext, conversationId, userName, action, token) => {
    const uri = process.env.CS_PATH + 'conversations/' + conversationId + '/members';

    const params = {
        user_name: userName,
        action: action,
        channel: {
            type: 'app',
        },
    };
    return requestHelper.sendPOSTRequest(logContext, uri, params, _getAuthHeader(token));
};

csServer.removeMemberFromConversation = (memberId, conversationId, token) => {
    const uri = process.env.CS_PATH + 'conversations/' + conversationId + '/members/' + memberId;

    return requestHelper.sendDELETERequest(undefined, uri, undefined, _getAuthHeader(token));
};

csServer.getUsers = async (token) => { 
    const uri = process.env.CS_PATH + 'users'; 
    const response = await requestHelper.sendGETRequest(undefined, uri, undefined, _getAuthHeader(token));

    return JSON.parse(response.body); 
}

module.exports = csServer;
