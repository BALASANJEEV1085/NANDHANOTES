#!/bin/sh
set -eu

if [ -z "${API_URL:-}" ]; then
  export API_URL="http://backend:5000"
fi

envsubst '${API_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
