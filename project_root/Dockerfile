# Stage 1: Build dependencies
FROM python:3.13 AS builder

RUN mkdir /app

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN pip install --upgrade pip

COPY requirements.txt /app/

RUN pip install --no-cache-dir -r requirements.txt


# Stage 2: Production
FROM python:3.13

RUN useradd -m -r appuser && \
    mkdir /app && \
    chown -R appuser:appuser /app

# Copy Python dependencies
COPY --from=builder /usr/local/lib/python3.13/site-packages/ \
    /usr/local/lib/python3.13/site-packages/

COPY --from=builder /usr/local/bin/ \
    /usr/local/bin/

RUN mkdir -p /app/cache \
    && chown -R appuser:appuser /app/cache

WORKDIR /app

# Copy application code
COPY --chown=appuser:appuser . .

# Create directory for collected static files
RUN mkdir -p /app/staticfiles && \
    chown -R appuser:appuser /app/staticfiles

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Collect static files inside the image


USER appuser

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "promo.wsgi:application"]
