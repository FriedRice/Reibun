#!/bin/bash
# Gets a cert for nginx using certbot, generates the nginx conf, and finally
# runs nginx in the foreground.

# Get docker config supplied variables
export MYAKUWEB_DOMAIN="$(cat "$MYAKUWEB_DOMAIN_FILE")"
export CERTBOT_EMAIL="$(cat "$CERTBOT_EMAIL_FILE")"
export MYAKUWEB_ALLOWED_HOSTS="$(\
    cat $MYAKUWEB_ALLOWED_HOSTS_FILE | tr '\n' ' ' | sed 's/ $//g' \
)"

# Use DOLLAR to insert $ for nginx variables because using $ directly would
# cause the nginx variables to be replaced by envsubst
export DOLLAR='$'
envsubst < $NGINX_RUN_FILES_DIR/nginx_template.conf > \
    /etc/nginx/conf.d/myaku_reverseproxy.conf

cert_dir="/etc/letsencrypt/live/$MYAKUWEB_DOMAIN"
mkdir -p $cert_dir

# Start nginx as a daemon so that certbot can reach it
nginx

if [ ! -f "$cert_dir/privkey.pem" ]; then
    # No cert is available, so we must create a new one

    if [ "$USE_PROD_CERT" == "1" ]; then
        # A cert for prod is needed, so get one with certbot
        echo "Getting a prod cert using certbot"

        # Create dummy cert first so that nginx will start
        openssl req -x509 -nodes -newkey rsa:4096 -days 365 \
            -keyout "$cert_dir/privkey.pem" \
            -out "$cert_dir/fullchain.pem" \
            -subj "/CN=localhost"

        # Delete dummy certificate and any other certificate remnants
        rm -Rf /etc/letsencrypt/live
        rm -Rf /etc/letsencrypt/archive
        rm -Rf /etc/letsencrypt/renewal

        # Get a prod cert from certbot
        certbot certonly --webroot -w "$CERTBOT_WEB_ROOT" \
            -m $CERTBOT_EMAIL -d $MYAKUWEB_DOMAIN \
            --rsa-key-size 4096 --agree-tos --non-interactive
        if [ $? -ne 0 ]; then
            echo "Certbot failed"
            exit 1
        fi
        echo "Certbot successfully acquired a cert"

    else
        # Create dummy cert to use for dev
        echo "Creating a dummy cert for dev use"
        openssl req -x509 -nodes -newkey rsa:4096 -days 365 \
            -keyout "$cert_dir/privkey.pem" \
            -out "$cert_dir/fullchain.pem" \
            -subj "/CN=localhost"
    fi

else
    echo "Using existing cert"

    if [ "$USE_PROD_CERT" == "1" ]; then
        # Prod cert is available, so try renewing it
        certbot renew
    fi
fi

# Stop nginx so that we can start it in the foreground
nginx -s stop

# Errors can happen if nginx starts at the same time uwsgi is starting in the
# Myaku web container, so wait for uwsgi to be ready
uwsgi_available=0
for ((i = 0; i < 20; i++))
do
    nc -zv -w 1 $MYAKUWEB_APISERVER_HOST $MYAKUWEB_APISERVER_UWSGI_PORT
    if [ $? -eq 0 ]; then
        echo "uWSGI available after $i seconds"
        uwsgi_available=1
        break
    fi
    sleep 1
done
if [ $uwsgi_available -eq 0 ]; then
    echo "ERROR: uWSGI not available after 20 seconds"
    exit 1
fi

echo "Starting nginx in foreground"
exec nginx -g 'daemon off;'
