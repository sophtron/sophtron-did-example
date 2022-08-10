This is an initial brainstorm collection of sophtron's initiative for leveraging [Decentralized Identifiers](https://www.w3.org/TR/did-core/) and [Verifiable Credentials](https://www.w3.org/TR/vc-data-model/) 

The purpose of this document collection is to record the ideas where sophtron can act as a `provider` or better called `issuer` to supply the `VC` document in banking space.

### There are various needs of retriving certain kind of credentials from a user's bank account, for example:
- As a genuine source of a person's identity information to validate name, address etc.  which is broadly required in financial world and beyound 
- Retriving bank account number and routing information for setting up bank transfer such as direct deposit or debit
- In-depth credit evaluation by retriving recent bank transactions of user.
- And so on 

In the ideal `Decentralized` world, user would have authorized a reasonable level of access to his banking profile via the banking DID channel. however, this won't actually be realistic amongst thousands of banks in the US and much more around the globe, sophtron can be a reliable source of truth of this kind of sensitive information. therefore upon request, issue the proper kind of `Cerifiable Credentials`. 

### Below are the rough example data of what possiblly can be provided by sophtron as a banking credential issuer
- [vc_identity.json](vc_identity.json) is an example of an "IdentityCredential" which provides the authentic name and address information of a person
- [vc_bankaccounts.json](vc_bankaccounts.json) is an example of a "BankAccountCredential" which provides the authentic bank account information of a person's account
- [vc_transactions.json](vc_transactions.json) is an example of a "BankTransactionCredential" which is the bank activity record of a person's bank account in a certain period.
- [vc_authorization.json](vc_authorization.json): while [Authorization](https://www.w3.org/TR/vc-data-model/#authorization) is not yet identified as an appropriate use of `VerifiableCredential` at the moment,  it will possiblly be a very useful scenario when, for instance in the above examples:
    * Some sensitive (PII) information are sent through the blockchain and may leave an un-erasable trace behind, which is a a risk of leaking PII
    * Some large blob of data such as the array of bank transactions is being passed through the block chain which unecessarily enlarges the chain  quickly
    * hence, it'd be a useful flow when user may choose to grant the verifier a proper level of access to his banking profile stored in sophtron and point them with the issuer Url. then the verifier can use the granted token to access the trusted (or firstly use sophtron's DID to validate the trustship) `sophtron api` to retrieve off-ledger information. 
