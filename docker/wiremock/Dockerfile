FROM registry.gitlab.com/trustpayments-public/public-docker-registry/wiremock:7.3.68 as wiremock

ARG COPY_FROM

COPY ${COPY_FROM}/wiremock/__files /home/wiremock/__files
COPY ${COPY_FROM}/wiremock/mappings /home/wiremock/mappings
COPY ${COPY_FROM}/wiremock/keystore /home/wiremock/keystore

EXPOSE 6443
