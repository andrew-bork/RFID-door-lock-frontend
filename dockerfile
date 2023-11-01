FROM node:20.5.1

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./


RUN npm install

COPY ./app/ ./app/
COPY ./pages/ ./pages/
COPY ./.eslintrc.json ./
COPY ./next-env.d.ts ./
COPY ./next.config.js ./
COPY ./tsconfig.json ./

ARG NODE_PATH=/usr/src/app

RUN npm run build

EXPOSE 3000 

CMD npm start