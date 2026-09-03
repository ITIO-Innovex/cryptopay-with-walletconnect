# Cryptope checkout SPA (TanStack Start). Production nginx proxies /cryptope-ui/ → :80.
# Local iteration: host `npm run dev` on :8080 (Node >= 20.19).
#
# Build note: without Nitro, TanStack SPA emits static files under dist/client/
# (index.html from _shell.html via scripts/ensure-spa-index.mjs) — NOT plain /app/dist.
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
# Optional native deps (bufferutil/utf-8-validate) are not required for the Vite SPA build.
RUN npm install --no-audit --no-fund --ignore-scripts
COPY . .
ARG VITE_API_BASE_URL=https://api.boxchrge.com
ARG VITE_BASE_PATH=/cryptope-ui/
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_BASE_PATH=${VITE_BASE_PATH}
ENV CRYPTOPE_PUBLIC_BASE=${VITE_BASE_PATH}
RUN npm run build \
  && test -f dist/client/index.html \
  && test -d dist/client/assets

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/client /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
