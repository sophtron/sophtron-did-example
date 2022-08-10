#!/usr/bin/env bash
echo "Testing login schema"
echo "....."
${BASH_SOURCE%/*}/login/test.sh
echo "Testing mfa challenge schema"
echo "....."
${BASH_SOURCE%/*}/mfa/test.sh
echo "Testing mfa response schema"
echo "....."
${BASH_SOURCE%/*}/mfa_response/test.sh