FROM node:12.4-alpine

RUN mkdir /app
WORKDIR /app

# Installing required npm packages
COPY package.json package.json
COPY yarn.lock yarn.lock
RUN yarn

# Copying all files
COPY . .

# Setting production env variables
ENV MODE=prod
ENV ENABLE_JSON_LOGS=true

# Running limestone node
CMD yarn start --manifest sample-manifests/all-supported-tokens.json --jwk ./.secrets/arweave.json --covalent-key ckey_7dfd8019d0a84935bfdb6c3ffed
