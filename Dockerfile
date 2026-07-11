# Stage 1: Build the Vite React Application
FROM oven/bun:1-alpine AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .

ARG VITE_MASTER_URL
ARG VITE_AGGREGATOR_URL
ENV VITE_MASTER_URL=$VITE_MASTER_URL
ENV VITE_AGGREGATOR_URL=$VITE_AGGREGATOR_URL

RUN bun run build

# Stage 2: Serve with lightweight Nginx
FROM nginx:1.25-alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Write the Nginx configuration inline to support Vite SPA client-side routing
RUN printf 'server {\n\
    listen 80;\n\
    location / {\n\
        root /usr/share/nginx/html;\n\
        index index.html index.htm;\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
    gzip on;\n\
    gzip_types text/plain text/css application/json application/javascript text/xml;\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
