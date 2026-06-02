# ─── Build stage ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

# VITE_BASE_URL doit être passé au build-time via --build-arg
ARG VITE_BASE_URL
ARG VITE_CLIENT_GOOGLE_ID
ENV VITE_BASE_URL=$VITE_BASE_URL
ENV VITE_CLIENT_GOOGLE_ID=$VITE_CLIENT_GOOGLE_ID

RUN yarn build

# ─── Serve stage ───────────────────────────────────────────────────────────────
FROM nginx:alpine AS runtime

# Config nginx pour SPA : redirige toutes les routes vers index.html
COPY --from=builder /app/dist /usr/share/nginx/html

RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    # Gzip\n\
    gzip on;\n\
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
