FROM node:22-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN echo "=== Tailwind version ===" && \
    cat node_modules/tailwindcss/package.json | grep '"version"' && \
    npm run build:prod && \
    echo "=== CSS sizes ===" && \
    wc -c dist/assets/*.css && \
    ls -la dist/index.html
ENV PORT=3000
CMD ["node", "server.js"]
