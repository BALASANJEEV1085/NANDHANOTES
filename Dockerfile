FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/ ./
RUN rm -rf node_modules && npm install --legacy-peer-deps && npm run build

FROM node:18-alpine
WORKDIR /app
COPY backend/ ./
RUN rm -rf node_modules && npm install --legacy-peer-deps --production
COPY --from=frontend-builder /app/frontend/build ./public
EXPOSE 5000
ENV PORT=5000
CMD ["node", "server.js"]