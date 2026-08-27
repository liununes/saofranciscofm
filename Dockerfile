FROM node:18-alpine
RUN apk add --no-cache ffmpeg
WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 80

CMD ["/usr/local/bin/docker-entrypoint.sh"]
