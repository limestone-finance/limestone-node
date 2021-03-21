FROM node:12.4-alpine

RUN mkdir /app
WORKDIR /app

COPY package.json package.json
COPY yarn.lock yarn.lock
RUN yarn

COPY . .

CMD yarn start --manifest sample-manifests/all-supported-tokens.json --jwk ./.secrets/arweave.json --covalent-key hehe-not-used
