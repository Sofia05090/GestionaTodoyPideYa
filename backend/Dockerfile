FROM node:24-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src

# Carpeta de imagenes subidas por el admin (se monta como volumen en docker-compose)
RUN mkdir -p imagenes/platos && chown -R node:node imagenes

USER node
EXPOSE 5000

CMD ["node", "src/index.js"]
