#!/bin/sh

# Make migrations and migrate the database.
echo "Making migrations and migrating the database. "
python manage.py migrate --noinput
python manage.py collectstatic --noinput

# --- CREATE SUPERUSER ---
echo "Checking for superuser..."
python manage.py shell <<EOF
from django.contrib.auth import get_user_model
import os

User = get_user_model()
username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL')

if username and password and email:
    if not User.objects.filter(username=username).exists():
        print(f"Creating superuser {username}...")
        User.objects.create_superuser(username, email, password)
    else:
        print(f"Superuser {username} already exists.")
else:
    print("Superuser environment variables not set. Skipping superuser creation.")
EOF

exec "$@"