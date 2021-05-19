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
ENV MODE=PROD
ENV ENABLE_JSON_LOGS=true

# Running limestone node
CMD yarn start --config ./.secrets/config-limestone.json
