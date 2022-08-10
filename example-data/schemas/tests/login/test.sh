#!/usr/bin/env bash
cd=${BASH_SOURCE%/*}
sd="$cd/../.."
echo "valid_org.json"
 jsonschema -i $cd/valid_org.json $sd/login.json 
echo "valid.json"
 jsonschema -i $cd/valid.json  $sd/login.json 
echo "empty.json"
 jsonschema -i $cd/../empty.json  $sd/login.json 