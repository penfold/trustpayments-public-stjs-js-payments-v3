FROM rodolpheche/wiremock:2.26.3 as wiremock

ARG COPY_FROM

COPY ${COPY_FROM}/wiremock/__files /home/wiremock/__files
COPY ${COPY_FROM}/wiremock/mappings /home/wiremock/mappings
COPY ${COPY_FROM}/wiremock/keystore /home/wiremock/keystore

EXPOSE 8443
