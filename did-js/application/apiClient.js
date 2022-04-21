const config = require('./config.js');
const http = require('./http');
const auth = require('./authClient.js');
const logger = require('./logger.js');

module.exports = {
    getUserInstitutionById(id){
        return http.post(config.ApiServiceEndpoint + '/UserInstitution/GetUserInstitutionByID', { UserInstitutionID :id });
    },
    getUserInstitutionAccounts(userInstitutionID){
        return http.post(config.ApiServiceEndpoint + '/UserInstitution/GetUserInstitutionAccounts', {UserInstitutionID: userInstitutionID });
    },
    getInstitutionById(id){
        var data = { InstitutionID :id };
        return http.post(config.ApiServiceEndpoint + '/Institution/GetInstitutionByID', data);
    },
    getRecentTransactions(accountId){
        var now = new Date();
        var data = {
            AccountID: accountId,
            EndDate: new Date().toISOString(),
            StartDate: new Date( now - 30 * 24 * 60 * 60 * 1000)
        }
        return http.post(config.ApiServiceEndpoint + '/transaction/getTransactionsByTransactionDate', data);
    }
}