FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY --chown=node:node . .

USER node

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://localhost:8080/health').then(response => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["npm", "start"]
