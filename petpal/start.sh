#!/bin/bash

# Railway startup script for Django
echo "Starting Django application..."

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Run migrations
echo "Running database migrations..."
python manage.py migrate

# Start the server
echo "Starting Gunicorn server..."
exec gunicorn petpal.wsgi:application --bind 0.0.0.0:$PORT --workers 3