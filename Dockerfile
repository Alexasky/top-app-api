FROM node:20-alpine
LABEL org.opencontainers.image.source=https://github.com/alexasky/top-app-api
WORKDIR /opt/app
ADD package.json package.json
RUN npm install
ADD . .
RUN npm run build
RUN npm prune --production
CMD ["node", "./dist/main.js"]