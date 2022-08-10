# sophtron-did-example

This is a quick example of integrating [ION-Tools](https://www.npmjs.com/package/@decentralized-identity/ion-tools) and [DID-SDK](https://github.com/TBD54566975/ssi-sdk)

### This is only an example for experimental use, please don't host it in public network without security review. 

This example implements 2 RESTFUL API to provide some DID and VC related functionalities such as 
- generating/resolving DID
    * /api/did/generate
    * /api/did/example
    * /api/did/resolve
- sign/verify VC
    * /api/vc/sign
    * /api/vc/verify
- Getting Sophtron signed vc:
    * /api/vc/identity
    * /api/vc/accounts
    * /api/vc/transactions

#The JS-express service is the external interface, 
It invokes the Go http server for DID-SDK access, this is configured by option `DidDemoServiceEndpoint`

#The Golang service wraps DID SDK, 
it provides plain interface which 
- Takes a PrivateKey to sign 
- Takes a PublicKey to verify 
