ARG IMAGE_PIPELINE

FROM ${IMAGE_PIPELINE} as builder
ARG BUILD_TYPE
ARG LIBRARY_ARG

# Copy source code and build artifacts
COPY . .
RUN npm config set js-payments:host merchant.securetrading.net
RUN npm install --prefix example/html
RUN npm run build:${BUILD_TYPE} --prefix example/html ${LIBRARY_ARG}

FROM nginx:stable-alpine as app-html
ARG PIPELINE_WORKDIR
COPY --from=builder ${PIPELINE_WORKDIR}/dist /usr/share/nginx/html/app
COPY --from=builder ${PIPELINE_WORKDIR}/example/html/dist /usr/share/nginx/html/example
COPY docker/app-html/nginx/app.conf /etc/nginx/conf.d/app.conf
COPY docker/app-html/nginx/example.conf /etc/nginx/conf.d/example.conf
COPY docker/app-html/nginx/cert /etc/ssl/st-cert
