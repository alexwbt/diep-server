FROM node:lts-alpine

RUN mkdir /app
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

COPY package.json /app
COPY package-lock.json /app
RUN npm install

COPY game /app/game
COPY client.js /app
COPY index.js /app

ARG PORT
EXPOSE ${PORT}

CMD ["node", "/app"]
