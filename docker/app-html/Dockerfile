FROM registry.gitlab.com/trustpayments-public/public-docker-registry/nginx:7.7.2 as app-html

ARG SDK_DIST_PATH
ARG APP_DIST_PATH

COPY ${SDK_DIST_PATH}                     /usr/share/nginx/html/app
COPY ${APP_DIST_PATH}                     /usr/share/nginx/html/example

COPY docker/app-html/nginx/app.conf       /etc/nginx/conf.d/app.conf
COPY docker/app-html/nginx/example.conf   /etc/nginx/conf.d/example.conf
COPY docker/app-html/nginx/cert           /etc/ssl/st-cert
