FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY backend-proxy-example.js ./

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "backend-proxy-example.js"]

