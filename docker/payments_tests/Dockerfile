ARG IMAGE_PIPELINE

FROM ${IMAGE_PIPELINE} as payments-tests

ARG COPY_FROM

# Get up to date
#hadolint ignore=DL3009
RUN apt-get update

# Make JAVA_HOME available in docker
RUN apt-get install -y --no-install-recommends openjdk-11-jdk-headless \
    && rm -rf /var/lib/apt/lists/*
ENV JAVA_HOME  /usr/lib/jvm/java-11-openjdk-amd64/

# Latest versions of python tools via pip
RUN pip install poetry
COPY ${COPY_FROM}/ /app/
WORKDIR /app
#hadolint ignore=SC1091
RUN python3 -m venv venv \
    && . venv/bin/activate \
    && poetry install

# Install BrowserStack
#RUN wget --quiet https://www.browserstack.com/browserstack-local/BrowserStackLocal-linux-x64.zip \
#    && unzip BrowserStackLocal-linux-x64.zip \
#    && ./BrowserStackLocal <key> --force-local $FORCE_LOCAL --only "domain.com"

# Clean up apt-get
RUN apt-get -y autoremove \
    && rm -rf /var/lib/apt/lists/*


# Get framework into docker
ENV PATH "$PATH:/app"
