const _ = require('lodash');
const url = require('url');
const moment = require('moment');
const DataGenerator = require('./fixtures/data-generator');
const config = require('../../server/config');
const common = require('../../server/lib/common');
const sequence = require('../../server/lib/promise/sequence');
const host = config.get('server').host;
const port = config.get('server').port;
const protocol = 'http://';

function getURL() {
    return protocol + host;
}

function getSigninURL() {
    return url.resolve(protocol + host + ':' + port, 'ghost/signin/');
}

function getAdminURL() {
    return url.resolve(protocol + host + ':' + port, 'ghost/');
}

function isISO8601(date) {
    return moment(date).parsingFlags().iso;
}

// make sure the API only returns expected properties only
function checkResponseValue(jsonResponse, expectedProperties) {
    var providedProperties = _.keys(jsonResponse),
        missing = _.difference(expectedProperties, providedProperties),
        unexpected = _.difference(providedProperties, expectedProperties);

    _.each(missing, function (prop) {
        jsonResponse.should.have.property(prop);
    });

    _.each(unexpected, function (prop) {
        jsonResponse.should.not.have.property(prop);
    });

    providedProperties.length.should.eql(expectedProperties.length);
}

// @TODO: support options pattern only, it's annoying to call checkResponse(null, null, null, something)
function checkResponse(jsonResponse, objectType, additionalProperties, missingProperties, onlyProperties, options) {
    options = options || {};

    let checkProperties = options.public ? (this.expectedProperties[objectType].public || this.expectedProperties[objectType]) : (this.expectedProperties[objectType].default || this.expectedProperties[objectType]);

    checkProperties = onlyProperties ? onlyProperties : checkProperties;
    checkProperties = additionalProperties ? checkProperties.concat(additionalProperties) : checkProperties;
    checkProperties = missingProperties ? _.xor(checkProperties, missingProperties) : checkProperties;

    checkResponseValue(jsonResponse, checkProperties);
}

/**
 * This function manages the work of ensuring we have an overridden owner user, and grabbing an access token
 *
 * @TODO make this do the DB init as well
 */
const doAuth = (apiOptions) => {
    return function doAuthInner() {
        let API_URL = arguments[0];
        let request = arguments[1];

        // Remove API_URL & request from this list
        let options = Array.prototype.slice.call(arguments, 2);

        // No DB setup, but override the owner
        options = _.merge({'owner:post': true}, _.transform(options, function (result, val) {
            if (val) {
                result[val] = true;
            }
        }));

        const fixtureOps = apiOptions.getFixtureOps(options);

        return sequence(fixtureOps).then(function () {
            return login(request, API_URL);
        });
    };
};

const login = (request, API_URL) => {
    // CASE: by default we use the owner to login
    if (!request.user) {
        request.user = DataGenerator.Content.users[0];
    }

    return new Promise(function (resolve, reject) {
        request.post(API_URL)
            .set('Origin', config.get('url'))
            .send({
                grant_type: 'password',
                username: request.user.email,
                password: 'Sl1m3rson99'
            })
            .then(function then(res) {
                if (res.statusCode !== 200 && res.statusCode !== 201) {
                    return reject(new common.errors.GhostError({
                        message: res.body.errors[0].message
                    }));
                }

                resolve(res.headers['set-cookie']);
            }, reject);
    });
};

module.exports = (options = {}) => {
    return {
        getSigninURL: getSigninURL,
        getAdminURL: getAdminURL,
        doAuth: doAuth(options),
        login: login,
        getURL: getURL,
        checkResponse: checkResponse,
        checkResponseValue: checkResponseValue,
        isISO8601: isISO8601
    };
};
