const ION = require('@decentralized-identity/ion-tools');
const apiClient = require('./apiClient');
const logger = require('./logger.js')
const util = require('util')
const http = require('./http')
const config = require('./config')

async function generateDid(serviceId, serviceEndpoint){
    let assertionKeys = await ION.generateKeyPair();
    logger.trace("generated keys");
    var did =  new ION.DID({
      content: {
        publicKeys: [
          {
            id: 'key-1',
            type: 'EcdsaSecp256k1VerificationKey2019',
            publicKeyJwk: assertionKeys.publicJwk,
            purposes: [ 'authentication', 'assertionMethod' ]
          }
        ],
        services: [
          {
            id: serviceId || 'sophtron_did_example_service',
            type: 'LinkedDomains',
            serviceEndpoint: serviceEndpoint || 'https://did.sophtron.com'
          }
        ]
      }
    });
    logger.trace("generated did");
    return {did, assertionKeys};
}
async function verifyVc(did, vc, res){
  did = did || config.sophtronDid;
  let resolved = await ION.resolve(did);
  let keyRef = resolved.didDocument.assertionMethod[0];
  let key = resolved.didDocument.verificationMethod.filter(v => v.id === keyRef)[0];
  key.id = did;
  let key64 = Buffer.from(JSON.stringify(key)).toString('base64')
  return http.stream(config.DidDemoServiceEndpoint + 'verify/' + key64, vc, res);
}
module.exports = {
    /**
     * Generate and submit a DID with ION tools.
     * @route POST did/generate
     * @group DID - DID Operations
     * @returns {object} 200 - Json object that contains the DID URLs and private keys generated, please node the keys down!
     * @returns {Error}  default - Unexpected error
    */
    async did_generate(req, res){
        let {did, assertionKeys} = await generateDid(req.body.serviceId, req.body.serviceEndpoint )
        var state = await did.getState();
        var ret = {
          longUrl: state.longForm,
          shortUrl: state.shortForm,
          create: state.ops[0].content,
          assertionKeys,
          updateKeys: state.ops[0].update,
          recoveryKeys: state.ops[0].recovery,
      };
      let request = await did.generateRequest(0);
        logger.trace('generating did request', request);
        logger.debug('generating did request', request);
        let anchor =  new ION.AnchorRequest(request);
        logger.trace('anchor did request', anchor);
        logger.debug('anchor did request', anchor);
        await anchor.submit();
        res.send(ret);
    },
    /**
     * Make an example of a DID with ION tools. this one will only generate keys and construc the DID document, won't submit to the network
     * @route POST did/example
     * @group DID - DID Operations
     * @returns {object} 200 - Json object that contains the DID URLs and private keys generated, please node the keys down!
     * @returns {Error}  default - Unexpected error
    */
    async did_example(req, res){
      let {did, assertionKeys} = await generateDid(req.body.serviceId, req.body.serviceEndpoint )
      var state = await did.getState();
      var ret = {
          longUrl: state.longForm,
          shortUrl: state.shortForm,
          create: state.ops[0].content,
          assertionKeys,
          updateKeys: state.ops[0].update,
          recoveryKeys: state.ops[0].recovery,
      };
      res.send(ret);
    },
    /**
     * Resolve a DID with ION tools.
     * @route POST did/resolve
     * @group DID - DID Operations
     * @param {string} didUrl.body.required - the did short or long URL. resolving will fail if a shot url is provided but the DID hasn't been yet published - e.g. {"didUrl": "did:xxxx:yyyy"}
     * @returns {object} 200 - The DID document in Json
     * @returns {Error}  default - Unexpected error
    */
    async did_resolve(req, res){
        //var url = 'did:ion:EiBqIk-hlP5eZEdc88NDcFnP5c3V1H_ssmNE2aLvqHrxsQ:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJrZXktMSIsInB1YmxpY0tleUp3ayI6eyJjcnYiOiJzZWNwMjU2azEiLCJrdHkiOiJFQyIsIngiOiJaLThPUlhRRXNOamhIaWdoNm9UV0VabHZ2Ty1UajZUTWtMS3ZxRzBNaFlVIiwieSI6IlN5TkJEWk5FR3BFTGZaZ0Rma244alBoWU5nV04tNEpmbW54bWVyRHJYbGMifSwicHVycG9zZXMiOlsiYXV0aGVudGljYXRpb24iLCJhc3NlcnRpb24iXSwidHlwZSI6IkVjZHNhU2VjcDI1NmsxVmVyaWZpY2F0aW9uS2V5MjAxOSJ9XSwic2VydmljZXMiOlt7ImlkIjoic29waHRyb25fZGlkX2V4YW1wbGVfc2VydmljZSIsInNlcnZpY2VFbmRwb2ludCI6Imh0dHBzOi8vZGlkLnNvcGh0cm9uLmNvbSIsInR5cGUiOiJMaW5rZWREb21haW5zIn1dfX1dLCJ1cGRhdGVDb21taXRtZW50IjoiRWlCS01XY2hxZk5OR1N3em96YXpnTFo4ZUM1c0xGcEthaUM2a0VmX1NENE5KQSJ9LCJzdWZmaXhEYXRhIjp7ImRlbHRhSGFzaCI6IkVpQXVzS2hQVUtubnBZaDRrUFI1OHVRbENOQnl3VXhhVU4taEI1M2tGZlVtV2ciLCJyZWNvdmVyeUNvbW1pdG1lbnQiOiJFaUNxZ1F6Vl9fWWRCN1JvWjdtMDk4a3hKTkVhOU9TNGQzUWNraWlrdHlELTN3In19'
        //var ret = await ION.resolve(url);
        //console.log('resolving:' + util.inspect(req.body, {depth: 3}));
        var ret = await ION.resolve(req.body.didUrl);
        //console.log(ret);
        res.send(ret);
    },
    /**
     * Sign a VC to get the proof
     * @route POST vc/sign/:key
     * @group VC - VC Operations
     * @param {string} [key.query.optional = Sophtron Key] - The private key used to sign, if not provided, Sophtron AssertionMethod key will be used
     * @param {object} vc.body.required - the vc document to be verified 
     * @returns {object} 200 - the signed Json document
     * @returns {Error}  default - Unexpected error
    */
    vc_sign$key(req, res){
      return http.stream(config.DidDemoServiceEndpoint + 'sign/' + (req.params.key || config.sophtronAssertionPK), req.body, res);
    },
    vc_sign(req, res){
      return http.stream(config.DidDemoServiceEndpoint + 'sign/' + config.sophtronAssertionPK, req.body, res);
    },
    /**
     * Verify a VC
     * @route POST /vc/verify/:did
     * @group VC - VC Operations
     * @param {string} [did.query.optional = Sophtron DID ] - The DID of the issuer, if not provided, Sophtron DID will be used to retrieve the public key
     * @param {object} vc.body.required - the vc document to be verified 
     * @returns {object} 200 - 'OK'
     * @returns {Error}  default - Verification error message
    */
    vc_verify(req, res){
      return verifyVc(null, req.body, res);
    },
    vc_verify$did(req, res){
      return verifyVc(req.params.did, req.body, res);
    },
    /**
     * Get a Sophtron Issued vc of user's bank accounts, max 5 accounts returned for demo
     * @route POST vc/accounts/:userInstitutionId
     * @group VC - VC Operations
     * @param {string} userInstitutionId.path.required
     * @returns {object} 200 - The signed VC document in Json format
     * @returns {Error}  default - Unexpected error
    */
    async vc_accounts$userInstitutionId(req, res){
      let id = req.params.userInstitutionId;
        if(id){
          logger.debug("headers:", req.headers);
          var key = req.headers.integrationkey;
          var uins = await apiClient.getUserInstitutionById(id, key)
          var ins = await apiClient.getInstitutionById(uins.InstitutionID, key);
          var accounts = (await apiClient.getUserInstitutionAccounts(id, key)).slice(0, 5);
          var vc = {
              "@context": [
                  "https://www.w3.org/2018/credentials/v1",
                  "https://www.w3.org/2018/credentials/examples/v1"
              ],
              "id": "https://did.sophtron.com/vc/accounts/"  + id,
              "type": ["VerifiableCredential", "BankAccountCredential"],
              "issuer": config.sophtronDid,
              "issuanceDate": "2022-01-01T19:23:24Z",
              "credentialSubject": {
                  "id": "http://api.sophtron.com/api/userinstitution/" + id,
                  "name": ins.OwnerName || "John Example",
                  "institution": ins.InstitutionName,
                  "institutionImg": ins.Logo.trim(),
                  "accounts": accounts.map(a => ({
                      "id": "https://api.sophtron.com/api/userInstituionAccount/" + a.AccountID,
                      "routingNumber": a.RoutingNumber,
                      "accountname": a.AccountName,
                      "accountNumber": a.FullAccountNumber || a.AccountNumber,
                      "accountType": a.AccountType,
                      "availableBalnace": a.Balance,
                      "status": a.Status,
                      "updatedDate": a.LastUpdated

                  }))
              }
          };
          var ret = await http.post(config.DidDemoServiceEndpoint + 'sign/' + config.sophtronAssertionPK, vc, res);
          res.send(ret);
        }else{
          res.status(404).send('invalid id')
      }
    },
    /**
     * Get a Sophtron Issued vc of user's identity information
     * @route POST vc/identity/:userInstitutionId
     * @group VC - VC Operations
     * @param {string} userInstitutionId.path.required
     * @returns {object} 200 - The signed VC document in Json format
     * @returns {Error}  default - Unexpected error
    */
    async vc_identity$userInstitutionId(req, res){
      let id = req.params.userInstitutionId
      if(id){
          var key = req.headers.integrationkey;
          var ui = await apiClient.getUserInstitutionById(id, key);
          logger.debug("Received ui")
          var ins = await apiClient.getInstitutionById(ui.InstitutionID, key);
          logger.debug("Received ins")
          var vc = {
              "@context": [
                  "https://www.w3.org/2018/credentials/v1",
                  "https://www.w3.org/2018/credentials/examples/v1"
              ],
              "id": "https://did.sophtron.com/vc/identity/"  + id,
              "type": ["VerifiableCredential", "IdentityCredential"],
              "issuer": config.sophtronDid,
              "issuanceDate": "2022-01-01T19:23:24Z",
              "credentialSubject": {
                  "id": "http://api.sophtron.com/api/userinstitution/" + id,
                  "name": ui.OwnerName || "John",
                  "address": ui.Address || "123 example street",
                  "email": ui.Email || "John@example.com",
                  "updatedDate": ui.LastModified,
                  "institution": ins.InstitutionName,
                  "institutionImg": ins.Logo.trim(),
              }
          }
          logger.debug("Streaming")
          var ret = await http.post(config.DidDemoServiceEndpoint + 'sign/' + config.sophtronAssertionPK, vc, res);
          res.send(ret);
          logger.debug("Streamed")
        }else{
          res.status(404).send('invalid id')
      }
    },
    /**
     * Get a Sophtron Issued vc of user's bank accounts, and transactions max 1 account and 10 transactions each account returned for demo
     * @route POST vc/transactions/:userInstitutionId
     * @group VC - VC Operations
     * @param {string} userInstitutionId.path.required
     * @returns {object} 200 - The signed VC document in Json format
     * @returns {Error}  default - Unexpected error
    */
    async vc_transactions$userInstitutionId(req, res){
      let id = req.params.userInstitutionId;
      if(id){
          var key = req.headers.integrationkey;
          var uins = await apiClient.getUserInstitutionById(id, key)
          var ins = await apiClient.getInstitutionById(uins.InstitutionID, key);
          var accounts = (await apiClient.getUserInstitutionAccounts(id, key)).slice(0, 1);
          var vc = {
              "@context": [
                  "https://www.w3.org/2018/credentials/v1",
                  "https://www.w3.org/2018/credentials/examples/v1"
              ],
              "id": "https://did.sophtron.com/vc/transactions/"  + id,
              "type": ["VerifiableCredential", "BankAccountCredential"],
              "issuer": config.sophtronDid,
              "issuanceDate": "2022-01-01T19:23:24Z",
              "credentialSubject": {
                  "id": "http://api.sophtron.com/api/userinstitution/" + id,
                  "name": ins.OwnerName || "John Example",
                  "institution": ins.InstitutionName,
                  "institutionImg": ins.Logo.trim(),
                  "accounts": await Promise.all(accounts.map(async a => ({
                      "id": "https://api.sophtron.com/api/userInstituionAccount/" + a.AccountID,
                      "routingNumber": a.RoutingNumber,
                      "accountname": a.AccountName,
                      "accountNumber": a.FullAccountNumber || a.AccountNumber,
                      "accountType": a.AccountType,
                      "availableBalnace": a.Balance,
                      "status": a.Status,
                      "updatedDate": a.LastUpdated,
                      "transactions": (await apiClient.getRecentTransactions(a.AccountID, key)).slice(0, 10).map(t => ({
                        "amount": t.Amount,
                        "category": t.Category,
                        "date": t.Date,
                        "description": t.Description,
                        "id": 'https://api.sophtron.com/api/userInstituionAccount/' + t.TransactionID,
                        "type": t.Type,
                      }))
                  })))
              }
          };
          var ret = await http.post(config.DidDemoServiceEndpoint + 'sign/' + config.sophtronAssertionPK, vc, res);
          res.send(ret);
      }else{
          res.status(404).send('invalid id')
      }
    }

}