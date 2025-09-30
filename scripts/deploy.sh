#!/bin/bash

# ===========================================
# Script de Despliegue para Gestor de Proyectos
# ===========================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to check if docker-compose file exists
check_compose_file() {
    local compose_file=$1
    if [ ! -f "$compose_file" ]; then
        print_error "Docker compose file not found: $compose_file"
        exit 1
    fi
    print_success "Found compose file: $compose_file"
}

# Function to deploy development environment
deploy_development() {
    print_status "Deploying development environment..."
    
    check_docker
    check_compose_file "docker-compose.yml"
    
    print_status "Stopping existing containers..."
    docker-compose down
    
    print_status "Building and starting development containers..."
    docker-compose up -d --build
    
    print_status "Waiting for services to be ready..."
    sleep 10
    
    print_status "Running database migrations..."
    docker-compose exec web python manage.py migrate
    
    print_status "Creating superuser if not exists..."
    docker-compose exec web python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superuser created: admin/admin123')
else:
    print('Superuser already exists')
"
    
    print_success "Development environment deployed successfully!"
    print_status "Access the application at: http://localhost"
    print_status "Admin panel at: http://localhost/admin"
    print_status "API docs at: http://localhost/api/swagger/"
}

# Function to deploy production environment
deploy_production() {
    print_status "Deploying production environment..."
    
    check_docker
    check_compose_file "docker-compose.prod.yml"
    
    # Check if .env.production exists
    if [ ! -f ".env.production" ]; then
        print_warning ".env.production not found. Please create it from config/env.production"
        print_status "Copying example file..."
        cp config/env.production .env.production
        print_warning "Please edit .env.production with your production values!"
        exit 1
    fi
    
    print_status "Stopping existing containers..."
    docker-compose -f docker-compose.prod.yml down
    
    print_status "Building and starting production containers..."
    docker-compose -f docker-compose.prod.yml up -d --build
    
    print_status "Waiting for services to be ready..."
    sleep 15
    
    print_status "Running database migrations..."
    docker-compose -f docker-compose.prod.yml exec web python manage.py migrate
    
    print_status "Collecting static files..."
    docker-compose -f docker-compose.prod.yml exec web python manage.py collectstatic --noinput
    
    print_status "Creating superuser if not exists..."
    docker-compose -f docker-compose.prod.yml exec web python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@gestorai.tecnolitas.com', 'change-this-password')
    print('Superuser created: admin/change-this-password')
else:
    print('Superuser already exists')
"
    
    print_success "Production environment deployed successfully!"
    print_status "Access the application at: https://gestorai.tecnolitas.com"
    print_status "Admin panel at: https://gestorai.tecnolitas.com/admin"
    print_status "API docs at: https://gestorai.tecnolitas.com/api/swagger/"
}

# Function to show logs
show_logs() {
    local env=$1
    if [ "$env" = "prod" ]; then
        docker-compose -f docker-compose.prod.yml logs -f
    else
        docker-compose logs -f
    fi
}

# Function to show status
show_status() {
    local env=$1
    if [ "$env" = "prod" ]; then
        docker-compose -f docker-compose.prod.yml ps
    else
        docker-compose ps
    fi
}

# Main script logic
case "$1" in
    "dev")
        deploy_development
        ;;
    "prod")
        deploy_production
        ;;
    "logs")
        show_logs "$2"
        ;;
    "status")
        show_status "$2"
        ;;
    "stop")
        if [ "$2" = "prod" ]; then
            docker-compose -f docker-compose.prod.yml down
        else
            docker-compose down
        fi
        print_success "Containers stopped"
        ;;
    *)
        echo "Usage: $0 {dev|prod|logs|status|stop} [dev|prod]"
        echo ""
        echo "Commands:"
        echo "  dev     - Deploy development environment"
        echo "  prod    - Deploy production environment"
        echo "  logs    - Show logs (dev|prod)"
        echo "  status  - Show container status (dev|prod)"
        echo "  stop    - Stop containers (dev|prod)"
        echo ""
        echo "Examples:"
        echo "  $0 dev                    # Deploy development"
        echo "  $0 prod                   # Deploy production"
        echo "  $0 logs dev               # Show dev logs"
        echo "  $0 status prod            # Show prod status"
        echo "  $0 stop dev               # Stop dev containers"
        exit 1
        ;;
esac
