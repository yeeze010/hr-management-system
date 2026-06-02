FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/frontend/package.json apps/frontend/package.json
RUN npm install --workspace apps/frontend

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/frontend/node_modules ./apps/frontend/node_modules
COPY apps/frontend ./apps/frontend
WORKDIR /app/apps/frontend
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY deploy/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
