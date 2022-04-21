var processEnv = {}
Object.keys(process.env).forEach(k => {
    processEnv[k.toUpperCase()] = process.env[k];
})

const config = {
    LogLevel: processEnv.LOGLEVEL || 'debug',
    Port: processEnv.PORT || '8080',
    Env: processEnv.ENV || 'dev', //mocked
    Component: processEnv.COMPONENT || 'sph-did-js',
    Version: processEnv.VERSION || '',

    ApiUserId: processEnv.APIUSERID,
    ApiUserSecret: processEnv.APIUSERSECRET,
    
    ApiServiceEndpoint: processEnv.APISERVICEENDPOINT || 'https://api.sophtron-prod.com/api',
    DidDemoServiceEndpoint: processEnv.DIDDEMOSERVICEENDPOINT ||  'http://localhost:8090/', 
};


module.exports = config;