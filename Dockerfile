FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ ./
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production --legacy-peer-deps
COPY backend/ ./
COPY --from=frontend-builder /app/frontend/dist ./public
EXPOSE 5000
ENV PORT=5000
CMD ["node", "server.js"]
