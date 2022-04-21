#!/bin/sh
 docker run  -p 8080:8080 \
 -e ApiUserSecret="$ApiUserSecret" \
 -e ApiUserId="$ApiUserId" \
 sph_vc