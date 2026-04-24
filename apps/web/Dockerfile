FROM node:22-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build:prod
EXPOSE 3000
CMD ["node", "server.js"]
