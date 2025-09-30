FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

# Crear directorios necesarios para logs y static files
RUN mkdir -p /var/log/django
RUN mkdir -p /var/www/static
RUN chmod 755 /var/log/django
RUN chmod 755 /var/www/static

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"] 