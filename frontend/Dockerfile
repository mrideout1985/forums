FROM node:20-alpine AS dependencies
COPY package.json /app/
WORKDIR /app
RUN npm install

FROM node:20-alpine AS build
COPY . /app/
COPY --from=dependencies /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build

FROM node:20-alpine
COPY package.json /app/
COPY --from=dependencies /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build
WORKDIR /app
CMD ["npx", "react-router-serve", "./build/server/index.js"]