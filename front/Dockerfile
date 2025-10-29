FROM node:22-alpine AS builder
WORKDIR /app

# Copy root package files for workspace setup
COPY package*.json ./
COPY turbo.json ./

# Copy the front workspace
COPY front ./front

# Install all dependencies
RUN npm install

# Build the frontend
WORKDIR /app/front
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/front/dist /usr/share/nginx/html
COPY front/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]