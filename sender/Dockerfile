# Use an official Python image
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Copy the sender script and the CSV file into the container
COPY . /app

# Install dependencies
RUN pip install pandas
RUN pip install requests

# Run the sender script
CMD ["python", "sender.py"]