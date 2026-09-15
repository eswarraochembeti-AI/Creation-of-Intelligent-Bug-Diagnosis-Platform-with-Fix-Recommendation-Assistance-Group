# Backend Dockerfile
FROM python:3.13-slim

WORKDIR /app

# Install dependencies
COPY backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code preserving package structure
COPY backend ./backend

# Expose port
EXPOSE 8000

# Run uvicorn server
CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
