FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

COPY frontend/ ./
RUN npm run build

FROM nginx:1.27-alpine

COPY --from=frontend-builder /app/frontend/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh && apk add --no-cache gettext

EXPOSE 80
ENV API_URL=http://backend:5000

CMD ["/docker-entrypoint.sh"]