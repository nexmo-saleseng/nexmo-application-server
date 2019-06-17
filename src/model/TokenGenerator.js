const jwt = require('jsonwebtoken');
const tokenTypeEnum = require('./TokenTypeEnum');

const adminAcl = {
    'paths': {
        '/v1/users/**': {},
        '/v1/conversations/**': {},
    }
};

const vbcAcl = {
    //TODO - consider reducing permissions
    'paths': {
        '/v1/users/**': {},
        '/v1/conversations/**': {},
        '/v1/sessions/**': {},
        '/v1/devices/**': {},
        '/v1/image/**': {},
        '/v3/media/**': {},
        '/v1/applications/**': {},
        '/v1/push/**': {},
        '/v1/knocking/**': {}
    }
};


class TokenGenerator {
    constructor() {
    }

    genToken(tokenType, params) {
        const { payload, appKey, options } = this._computeSignParams(tokenType, params);
        return jwt.sign(payload, {key: appKey}, options);
    }
    
    genTokenAsync(tokenType, params) {
        const { payload, appKey, options } = this._computeSignParams(tokenType, params);
        return new Promise((resolve, reject) => {
            jwt.sign(payload, {key: appKey}, options, (err, token) => {
                if (err) {
                    return reject(err);
                }
                resolve(token);
            });  
        });
    }

    _computeSignParams(tokenType, params) {
        let jti, acl, exp, sub;

        const now = Date.now();

        switch (tokenType) {
       
        case tokenTypeEnum.Admin:
            jti = 'admin' + '_' + now;
            acl = adminAcl;
            exp = Math.floor(now / 1000) + (10 * 365 * 24 * 60 * 60); //10 years expiration
            break;
        case tokenTypeEnum.User:
            jti = params.username;
            acl = vbcAcl;
            //TODO - One day expiration for now, should be fixed when refresh token feature is implemented
            exp = Math.floor(now / 1000) + (7 * 24 * 60 * 60);
            sub = params.username;
            break;
        }

        const options = {
            algorithm: 'RS256',
            issuer: 'issuer',
        };

        const payload = {
            iat: Math.floor(now / 1000),
            nbf: Math.floor(now / 1000),
            jti,
            application_id: process.env.APP_ID,
        };

        payload.acl = acl;
        payload.sub = sub;
        payload.exp = exp;

        const appKey = Buffer.from(process.env.APP_KEY, 'base64').toString('ascii');

        return {
            payload,
            appKey,
            options
        };
    }
}

module.exports = new TokenGenerator();