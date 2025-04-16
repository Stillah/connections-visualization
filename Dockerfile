# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Install Node.js for the frontend
RUN apt-get update && apt-get install -y \
    curl \
    && curl -sL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy all files to the container
COPY . .

# Install server dependencies
WORKDIR /app/server
RUN pip install --no-cache-dir -r requirements.txt

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm install

# Install sender dependencies
WORKDIR /app/sender
RUN pip install --no-cache-dir -r requirements.txt

# Expose necessary ports
EXPOSE 8080 3000

# Create a startup script to run all services
RUN echo '#!/bin/bash\n\
cd /app/server && python server.py &\n\
cd /app/sender && python sender.py &\n\
cd /app/frontend && npm run dev -- --host 0.0.0.0\n\
' > /app/start.sh && chmod +x /app/start.sh

# Set the default command to run the startup script
CMD ["/app/start.sh"]