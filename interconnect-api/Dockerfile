# Use a lightweight Python base image
FROM python:3.10-slim

# Create a working directory for the application
WORKDIR /app

# Copy requirements into the container
COPY /interconnect-api/requirements.txt /app/

# Install required Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY ./interconnect-api .

# Expose the FastAPI port
EXPOSE 4000

# Run FastAPI via uvicorn
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "4000"]