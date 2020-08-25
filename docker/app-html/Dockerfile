ARG IMAGE_PIPELINE
FROM ${IMAGE_PIPELINE} as builder

ARG BUILD_TYPE

COPY . .
RUN npm config set js-payments:host merchant.securetrading.net
RUN npm run build:${BUILD_TYPE}

FROM nginx:stable-alpine as app-html
ARG PIPELINE_WORKDIR
COPY --from=builder ${PIPELINE_WORKDIR}/dist /usr/share/nginx/html/app
COPY --from=builder ${PIPELINE_WORKDIR}/dist /usr/share/nginx/html/example
COPY docker/nginx/app.conf /etc/nginx/conf.d/app.conf
COPY docker/nginx/example.conf /etc/nginx/conf.d/example.conf
COPY docker/nginx/cert /etc/ssl/st-cert
