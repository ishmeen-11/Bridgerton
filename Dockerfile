FROM node:18-slim

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy application files
COPY . .

# HF Spaces exposes port 7860 by default
ENV PORT=7860
EXPOSE 7860

CMD ["node", "server.js"]
