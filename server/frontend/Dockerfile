# fronend Dockerfile
# Stage 1: Build the React application
FROM node:18 AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:stable-alpine

# Copy the built files from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Create static directory
RUN mkdir -p /usr/share/nginx/html/static

# Copy all static files
COPY static/ /usr/share/nginx/html/static/

# Copy the nginx config file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add debugging: List contents of html directory
RUN ls -la /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]