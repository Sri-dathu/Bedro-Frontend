# BEDRO frontend (TanStack Start, Nitro node-server build). Build context: Frontend/.
#   docker build --build-arg VITE_API_BASE_URL=http://localhost:8000 -t bedro-frontend Frontend
FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# Baked into the browser bundle: the URL the *browser* uses to reach the backend.
ARG VITE_API_BASE_URL=http://localhost:8000
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production PORT=8080 HOST=0.0.0.0
COPY --from=build --chown=node:node /app/.output ./.output
USER node
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=5s --start-period=15s --retries=5 \
    CMD node -e "fetch('http://127.0.0.1:8080/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", ".output/server/index.mjs"]
