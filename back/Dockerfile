FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
COPY turbo.json ./
COPY db ./db
COPY back ./back
RUN npm install
WORKDIR /app/back
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/back/src/index.js"]