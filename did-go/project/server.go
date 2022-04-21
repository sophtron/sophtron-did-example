package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	vc "github.com/TBD54566975/did-sdk/credential"
	"github.com/TBD54566975/did-sdk/cryptosuite"
	"log"
	"net/http"
	"strings"
	"time"
)

func ping(w http.ResponseWriter, req *http.Request) {
	fmt.Fprintf(w, "ok")
}
func makeCredential(w http.ResponseWriter, req *http.Request) {
	var knownCred vc.VerifiableCredential

	err := json.NewDecoder(req.Body).Decode(&knownCred)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = knownCred.IsValid()
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// re-build with our builder
	builder := vc.NewVerifiableCredentialBuilder()
	err = builder.AddContext(knownCred.Context)
	err = builder.SetID(knownCred.ID)
	err = builder.AddType(knownCred.Type)
	err = builder.SetIssuer(knownCred.Issuer)
	vnow, _ := time.Now().UTC().MarshalText()
	err = builder.SetIssuanceDate(string(vnow))
	err = builder.SetCredentialSubject(knownCred.CredentialSubject)

	credential, err := builder.Build()

	//jwk, err := cryptosuite.GenerateJSONWebKey2020(cryptosuite.OKP, cryptosuite.Ed25519)
	issuerStr, _ := knownCred.Issuer.(string)
	//issuerStr, err := util.InterfaceToStrings(knownCred.Issuer)
	pkStr64 := strings.TrimPrefix(req.URL.Path, "/sign/")
	pkStr, err := base64.StdEncoding.DecodeString(pkStr64)
	var pk cryptosuite.PrivateKeyJWK
	err = json.Unmarshal([]byte(pkStr), &pk)
	signer, err := cryptosuite.NewJSONWebKeySigner(issuerStr, pk, cryptosuite.AssertionMethod)
	suite := cryptosuite.GetJSONWebSignature2020Suite()
	err = suite.Sign(signer, credential)

	if err == nil {
		out, _ := json.Marshal(credential)
		fmt.Fprintf(w, string(out))
	}
}

func verifyCredential(w http.ResponseWriter, req *http.Request) {
	var knownCred vc.VerifiableCredential

	err := json.NewDecoder(req.Body).Decode(&knownCred)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	fmt.Println("received knwnCred")

	err = knownCred.IsValid()
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	fmt.Println("validated knwnCred")

	//issuerStr, _ := knownCred.Issuer.(string)
	//issuerStr, err := util.InterfaceToStrings(knownCred.Issuer)
	pkStr64 := strings.TrimPrefix(req.URL.Path, "/verify/")
	fmt.Println("retrieved pkstr64")
	pkStr, err := base64.StdEncoding.DecodeString(pkStr64)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
	}
	fmt.Println("decoded pkstr64")
	var pk cryptosuite.JSONWebKey2020
	err = json.Unmarshal([]byte(pkStr), &pk)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
	}
	fmt.Println("json unmarshalled pkstr64, pkID: " + pk.ID)

	verifier, err := cryptosuite.NewJSONWebKeyVerifier(pk.ID, pk.PublicKeyJWK)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	suite := cryptosuite.GetJSONWebSignature2020Suite()
	err = suite.Verify(verifier, &knownCred)

	if err != nil {
		http.Error(w, err.Error(), http.StatusOK)
		fmt.Println("Verification failed")
	} else {
		fmt.Fprintf(w, "ok")
	}
}

func main() {
	http.HandleFunc("/sign/", makeCredential)
	http.HandleFunc("/verify/", verifyCredential)
	http.HandleFunc("/ping", ping)
	log.Fatal(http.ListenAndServe(":8090", nil))
}
