const crypto = require('crypto');
const axios = require('axios');
const logger = require('../logger');
const config = require('../config');

function buildAuthCode(httpMethod, url) {
    var authPath = url.substring(url.lastIndexOf('/')).toLowerCase();
    var userId = config.ApiUserId;
    var integrationKey = Buffer.from(config.ApiUserSecret, 'base64');
    var plainKey = httpMethod.toUpperCase() + '\n' + authPath;
    var b64Sig = crypto.createHmac('sha256', integrationKey).update(plainKey).digest("base64");
    var authString = 'FIApiAUTH:' + userId + ':' + b64Sig + ':' + authPath;
    return authString;
}

function getHeaders(url, headers){
    headers = headers || {};
    if(!headers.Authorization){
        headers.Authorization = buildAuthCode('get', url);
    }
    return headers;
}

function stream(url, data, target){
    logger.debug(`stream request: ${url}`);
    return axios({
                method: data ? 'post' : 'get',
                data,
                url: url,
                responseType: 'stream'
            })
        .then(res => {
            logger.debug(`Received stream response from ${url}`);
            return res;
        })
        .catch(error => {
            logger.error('error from ' + url, error);
            if(error.response){
                return error.response
            }
        })
        .then(res => {
            if(res){
                target.setHeader('content-type', res.headers['content-type']);
                return res.data.pipe(target);
            }else{

                target.status(500).send("unexpected error")
            }
        });
}

function wget(url){
    logger.debug(`wget request: ${url}`);
    return axios.get( url)
        .then(res => {
            logger.debug(`Received wget response from ${url}`);
            return res.data
        })
        .catch(error => {
            logger.error('error from ' + url, error);
            throw error;
        });
}

function get(url, integrationKey, headers, returnFullResObject){
    var headers = getHeaders(url, headers, integrationKey);
    logger.debug(`get request: ${url}`);
    return axios.get( url, {headers})
        .then(res => {
            logger.debug(`Received get response from ${url}`);
            return returnFullResObject ? res : res.data
        })
        .catch(error => {
            logger.error('error from ' + url, error);
            throw error;
        });
}

function post(url, data, integrationKey, headers, returnFullResObject){
    logger.debug(`post request: ${url}`);
    return axios.post(url, data, {headers: getHeaders(url, headers, integrationKey)})
        .then(res => {
            logger.debug(`Received post response from ${url}`);
            return returnFullResObject ? res : res.data
        })
        .catch(error => {
            logger.error('error from ' + url, error);
            throw error;
        });
}

module.exports = {
    get,
    wget,
    post,
    stream,
    buildAuthCode
}
