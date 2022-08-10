#!/usr/bin/env bash
cd=${BASH_SOURCE%/*}
sd="$cd/../.."
schema="$sd/mfa_response.json"
for filename in $cd/*.json; do
    echo $filename
    jsonschema -i $filename $schema
done

echo "empty.json"
 jsonschema -i $cd/../empty.json $schema