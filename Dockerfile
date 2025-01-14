FROM node:22 as development

WORKDIR /app/api

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

FROM node:22 as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app/api

COPY package*.json .

RUN npm ci --only=production
COPY --from=development ./app/api/src/public/ ./build/public
COPY --from=development ./app/api/build ./build

CMD [ "node","build/index.js" ]
