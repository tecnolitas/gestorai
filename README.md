# GestorAI - Sistema de Gestión de Proyectos

Sistema completo de gestión de proyectos desarrollado con Django REST Framework y Next.js, containerizado con Docker.

## 🚀 Características

- **Backend**: Django REST Framework con PostgreSQL
- **Frontend**: Next.js con TypeScript y Tailwind CSS
- **Base de Datos**: PostgreSQL containerizada
- **Proxy**: Nginx para producción
- **Containerización**: Docker y Docker Compose
- **Autenticación**: Sistema de usuarios con tokens
- **API REST**: Endpoints completos para gestión de proyectos y tareas

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │   Frontend      │    │    Backend      │    │   PostgreSQL    │
│   Proxy :80     │───▶│   Next.js       │    │    Django       │───▶│   Database      │
│   :443          │    │   :3000         │    │    :8000        │    │   :5432         │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Tecnologías

### Backend
- Django 4.2.7
- Django REST Framework 3.14.0
- PostgreSQL 15
- Python 3.11

### Frontend
- Next.js 15.4.5
- TypeScript
- Tailwind CSS
- React 18

### Infraestructura
- Docker & Docker Compose
- Nginx
- PostgreSQL

## 📦 Instalación y Uso

### Desarrollo

```bash
# Clonar el repositorio
git clone https://github.com/tecnolitas/gestorai.git
cd gestorai

# Levantar el entorno de desarrollo
docker-compose up -d --build

# Acceder a la aplicación
# Frontend: http://localhost
# Backend: http://localhost:8000
# Admin: http://localhost:8000/admin/
```

### Producción

```bash
# Usar el script de despliegue
./scripts/deploy.sh prod

# O manualmente
docker-compose -f docker-compose.prod.yml up -d --build
```

## 🔐 Credenciales por Defecto

- **Usuario**: admin
- **Contraseña**: admin123

## 📁 Estructura del Proyecto

```
gestorai/
├── config/                 # Configuración Django
│   ├── settings/          # Settings por entorno
│   └── env.*             # Variables de entorno
├── frontend/              # Aplicación Next.js
├── nginx/                 # Configuración Nginx
├── scripts/               # Scripts de despliegue
├── users/                 # App de usuarios
├── projects/              # App de proyectos
├── tasks/                 # App de tareas
├── docker-compose.yml     # Desarrollo
├── docker-compose.prod.yml # Producción
└── requirements.txt       # Dependencias Python
```

## 🚀 Despliegue

El proyecto incluye scripts automatizados para despliegue:

```bash
# Desarrollo
./scripts/deploy.sh dev

# Producción
./scripts/deploy.sh prod

# Ver logs
./scripts/deploy.sh logs [dev|prod]

# Estado de servicios
./scripts/deploy.sh status [dev|prod]
```

## 📝 API Endpoints

- `GET /api/projects/` - Listar proyectos
- `POST /api/projects/` - Crear proyecto
- `GET /api/tasks/` - Listar tareas
- `POST /api/tasks/` - Crear tarea
- `POST /api/auth/login/` - Iniciar sesión
- `POST /api/auth/logout/` - Cerrar sesión

## 🔧 Configuración

### Variables de Entorno

Copia los archivos de ejemplo y configura las variables:

```bash
cp config/env.development .env.development
cp config/env.production .env.production
```

### Dominio de Producción

Para producción, actualiza el dominio en:
- `config/settings/production.py`
- `nginx/nginx.conf`
- `config/env.production`

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👥 Contribuidores

- Tecnolitas Team

## 📞 Soporte

Para soporte técnico, contacta a: [email@tecnolitas.com]