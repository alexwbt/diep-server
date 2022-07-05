FROM node:lts-alpine as build

RUN mkdir /app
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

COPY package.json /app
COPY package-lock.json /app
RUN npm install

COPY game /app/game
COPY client.js /app
COPY index.js /app
COPY .env /app

CMD ["node", "/app"]
