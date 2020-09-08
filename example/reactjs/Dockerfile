FROM node:lts-alpine as builder

ARG environment=local
COPY . /reactjs-payments
COPY ./src/environment/environment.${environment}.js /reactjs-payments/src/environment/environment.js
WORKDIR /reactjs-payments
RUN npm rebuild node-sass
RUN npm install -g npm
RUN rm -rf node_modules/sharp
RUN npm install
RUN npm run build

FROM nginx:stable-alpine
COPY --from=builder ./reactjs-payments/public /usr/share/nginx/html/reactjs-app
COPY docker/nginx/reactjs-app.conf /etc/nginx/conf.d/reactjs-app.conf
COPY docker/nginx/cert /etc/ssl/st-cert
