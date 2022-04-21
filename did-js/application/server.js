const config = require("./config.js");
const express = require("express");
const bodyParser = require("body-parser");
const api = require('./api.js');
const logger = require('./logger.js');
const util = require('util');

process.on('unhandledRejection', error => {
    logger.error('unhandledRejection: ' + error.message, error);
});
const app = express();
const expressSwagger = require('express-swagger-generator')(app);

let swaggerOptions = {
    swaggerDefinition: {
        info: {
            description: 'This is a sample server',
            title: 'Sophtron-Vc',
            version: '1.0.0',
        },
        host: 'did.sophtron-prod.com',
        basePath: '/api/',
        produces: [
            "application/json",
            "application/xml"
        ],
        schemes: ['http', 'https'],
        securityDefinitions: {
            token: {
                type: 'apiKey',
                in: 'header',
                name: 'IntegrationKey',
                description: "",
            }
        }
    },
    basedir: __dirname, //app absolute path
    files: ['./api.js'] //Path to the API handle folder
};
expressSwagger(swaggerOptions)

app.use(logger.requestHandler);
app.use(logger.errorHandler);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/ping', logger.skipLog, (req, res) => {
        res.status(200).send('ok')
    })
const maskedConfig = Object.assign( {... config}, {ApiUserSecret: 'hidden', ApiUserId: 'hidden', sophtronAssertionPK: 'hidden'})
app.get('/diagnose', (req, res) => {
        res.status(200).send(maskedConfig)
    })
if(config.Env === 'dev'){
    require('./authClient').getIntegrationKey(config.DemoUserId)
        .then(res => console.log(res));
}

Object.keys(api).forEach(key => {
    app.post('/api/' + key.replace('_', '/').replace('$', '/:'), (req, res) => {
        var promise = api[key](req, res);
        logger.info(`Api request handler invoked: ${req.path}`);
        if(promise.catch){
            promise.catch((err) => {
                res.status(err.httpCode || 500).send({error: { message: err.message }})
                logger.error(`Unhandled error on api ${req.path} call: ${err.message}`, err);
                if(err.response && err.response.data && err.response.data){
                    logger.debug(err.response.data);
                }
            });
        }
    })
});


app.get('*', logger.skipLog, function (req, res) {
    res.sendStatus(404);
});

app.listen(config.Port, () => {
    var message = `Server is running on port ${config.Port}, env: ${config.Env}`;
    logger.info(message);
});