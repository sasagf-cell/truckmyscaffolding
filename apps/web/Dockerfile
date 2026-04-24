FROM node:22-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build:prod && ls -la dist/index.html
ENV PORT=3000
CMD ["node", "server.js"]
