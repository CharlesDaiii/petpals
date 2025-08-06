#!/bin/bash
#
## Step 1: Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate  # Adjust the path to your virtual environment's activate script
#
# Step 2: Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt
#
## Step 3: Run database migrations
echo "Running database migrations..."
python petpal/manage.py makemigrations
python petpal/manage.py migrate
#
## Step 4: Start Django development server
echo "Starting Django development server..."
python petpal/manage.py runserver localhost:8000  # Run on localhost only
