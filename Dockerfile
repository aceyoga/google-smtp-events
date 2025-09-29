FROM node:22.20.0-alpine3.22
WORKDIR /app
COPY app .
RUN npm install --production
EXPOSE 3000
CMD ["node", "server.js"]
