'use strict';

const csServer = require('../network/CSServer');
const tokenType = require('../model/TokenTypeEnum');

class CsController {
    constructor() {
    }

    init(tokenGenerator) {
        this.tokenGenerator = tokenGenerator;
        this.adminToken = tokenGenerator.genToken(tokenType.Admin); 
    }

    async createUser(username, displayName) { 
        const token = await this.tokenGenerator.genTokenAsync(tokenType.User, { username }); 
        try {
            await csServer.createUser(undefined, username, displayName, this.adminToken); 
            return { username, displayName, token };
        } catch (err) {
            //TODO - should be fixed once getUsersByName from CS is possible
            if (err.body.code === 'user:error:duplicate-name') {
                return { username, displayName, token };
            } else {
                throw(err);
            }
        }
    }

    async getUsers() { 
        let users = await csServer.getUsers(this.adminToken); 
        return users; 
    }
}

module.exports = new CsController();
