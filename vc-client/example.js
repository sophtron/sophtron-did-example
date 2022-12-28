const crypto = require('crypto');
const axios = require('axios');

const apiClient = (function(){
    
    const userId = process.env.SophtronApiUserId;
    const accessKey = process.env.SophtronApiUserSecret;
    const apiBaseUrl = 'https://api.sophtron-prod.com/api/';
    const apiEndpoints = {
        GetInstitutionByName: 'Institution/GetInstitutionByName',
        GetUserInstitutionsByUser: 'UserInstitution/GetUserInstitutionsByUser',
        GetUserIntegrationKey: 'User/GetUserIntegrationKey',
        GetJobInformationByID: 'Job/GetJobInformationByID'
    }
    // console.log(userId);
    // console.log(accessKey);
    function buildAuthCode(httpMethod, url) {
        var authPath = url.substring(url.lastIndexOf('/')).toLowerCase();
        var integrationKey = Buffer.from(accessKey, 'base64');
        var plainKey = httpMethod.toUpperCase() + '\n' + authPath;
        var b64Sig = crypto.createHmac('sha256', integrationKey).update(plainKey).digest("base64");
        var authString = 'FIApiAUTH:' + userId + ':' + b64Sig + ':' + authPath;
        return authString;
    }
    
    function post(url, data){
        let conf = {headers: {Authorization: buildAuthCode('post', url)}};
        return axios.post(apiBaseUrl + url, data, conf)
            .then(res => {
                //console.log('response from ' + url)
                //console.log(res.data);
                return res.data
            })
            .catch(error => {
                //console.log('error from ' + url);
                //console.log(error.message);
            });
    }

    function getIngrationKey(){
        return post(apiEndpoints.GetUserIntegrationKey, {Id: userId}).then(res => res.IntegrationKey)
    }

    function getInstitutionByName(name){
        return post(apiEndpoints.GetInstitutionByName, {InstitutionName: name})
    }

    function getUserInstitutionsByUser(){
        return post(apiEndpoints.GetUserInstitutionsByUser, {UserID: userId});
    }

    function getJobInformationByID(){
        return post(apiEndpoints.GetJobInformationByID, {JobID: jobId});
    }
    
    return {
        getIngrationKey,
        getInstitutionByName,
        getUserInstitutionsByUser,
        getJobInformationByID
    }
})();

(async function(){
  let integrationKey = await apiClient.getIngrationKey();
  // need a UserInstitutionID to demo with. get a random one from the available list
  let connections = await apiClient.getUserInstitutionsByUser();
  if(connections && connections.length > 0){
    let vc = await axios.post('https://vc.sophtron-prod.com/api/vc/identity/' + connections[0].UserInstitutionID, null, {headers:{IntegrationKey: integrationKey}})
      .then(res => res.data)
      .catch(error => {
        console.log(error.message);
        if(error.response){
          console.log(error.response.data)
        }
    })
    console.log(vc);
  }else{
    //please create a UserInstitution for demo
  }
}())
