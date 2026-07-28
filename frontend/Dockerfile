# # # ---------- Stage 1: Build React App ----------
# # FROM node:22-alpine AS build

# # WORKDIR /app

# # # Copy package files
# # COPY package*.json ./

# # # Install dependencies
# # RUN npm install

# # # Copy source code
# # COPY . .

# # # Build the production React app
# # RUN npm run build


# # #  Stage 2: Serve with Nginx 
# # FROM nginx:alpine

# # # Remove the default Nginx website
# # RUN rm -rf /usr/share/nginx/html/*

# # # Copy the React build output
# # COPY --from=build /app/build /usr/share/nginx/html

# # # Expose HTTP port
# # EXPOSE 80

# # # Start Nginx
# # CMD ["nginx", "-g", "daemon off;"]

# # ---------- Stage 1: Build React App ----------
# FROM node:22-alpine AS build

# WORKDIR /app

# COPY package*.json ./

# RUN npm ci

# COPY . .

# RUN npm run build

# # ---------- Stage 2: Serve with Nginx ----------
# FROM nginx:alpine

# RUN rm -rf /usr/share/nginx/html/*

# COPY --from=build /app/build /usr/share/nginx/html

# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]




# ---------- Stage 1: Build React App ----------
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

# Install dependencies from package-lock.json
RUN npm ci

COPY . .

# Build production React app
RUN npm run build

# ---------- Stage 2: Serve with Nginx ----------
FROM nginx:alpine

# Remove default nginx files
RUN rm -rf /usr/share/nginx/html/*

# Copy React build
COPY --from=build /app/build /usr/share/nginx/html

# React Router support
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]