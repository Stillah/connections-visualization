# Use an official Python image
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Copy the server files
COPY . /app

# Install dependencies
RUN pip install -r requirements.txt

# Expose port 8080
EXPOSE 8080

# Run the server
CMD ["python", "server.py"]