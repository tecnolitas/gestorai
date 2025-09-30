# 🚀 Plan de Despliegue - Gestor de Proyectos

## 🎯 **Objetivo General**
Migrar la aplicación de desarrollo (SQLite + Django + Frontend Next.js) a un entorno de producción con PostgreSQL, contenedores Docker separados, proxy nginx y configuración específica para el dominio `gestorai.tecnolitas.com`.

---

## 📊 **Estado Actual**
- ✅ **Backend Django**: Funcional con PostgreSQL y API REST completo
- ✅ **Frontend Next.js**: Aplicación completa con todas las funcionalidades
- ✅ **Datos de Prueba**: 139 tareas, 27 proyectos, 10 usuarios en PostgreSQL
- ✅ **Base de Datos**: PostgreSQL containerizado con datos migrados
- ✅ **Frontend Containerizado**: Funcionando en contenedor Docker
- ✅ **Proxy Nginx**: Implementado con proxy reverso completo
- ✅ **Docker Compose**: Configuración completa con 4 servicios
- ✅ **Comunicación**: Frontend y backend comunicándose correctamente
- ✅ **Infraestructura**: Lista para despliegue en producción

---

## 🏗️ **Arquitectura Objetivo**

### **Desarrollo (Actual)**
```
Frontend (Next.js) → Backend (Django) → SQLite
     ↓                    ↓
   localhost:3000    localhost:8000
```

### **Producción (Actual - Completado)**
```
Internet → Nginx → Frontend (Next.js) → Backend (Django) → PostgreSQL
    ↓         ↓            ↓                ↓              ↓
Puerto 80  Proxy      Container        Container      Container
:443      Reverso    :3000            :8000          :5432
```

### **Arquitectura Implementada:**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │   Frontend      │    │    Backend      │    │   PostgreSQL    │
│   Proxy :80     │───▶│   Next.js       │    │    Django       │───▶│   Database      │
│   :443          │    │   :3000         │    │    :8000        │    │   :5432         │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 📋 **FASES DE DESPLIEGUE**

### **FASE 1: Migración de Base de Datos a PostgreSQL**
**Prioridad: CRÍTICA** | **Tiempo estimado: 1-2 días** | **✅ COMPLETADA**

#### **1.1 Configuración de PostgreSQL**
- [x] **Crear contenedor PostgreSQL**
  - [x] Definir imagen PostgreSQL 15 en docker-compose
  - [x] Configurar volúmenes persistentes para datos
  - [x] Establecer variables de entorno (DB_NAME, DB_USER, DB_PASSWORD)
  - [x] Configurar puerto 5432

- [x] **Actualizar configuración Django**
  - [x] Instalar psycopg2-binary en requirements.txt
  - [x] Crear configuración de base de datos para PostgreSQL únicamente
  - [x] Configurar variables de entorno para conexión
  - [x] Actualizar settings.py para usar solo PostgreSQL

#### **1.2 Migración de Datos**
- [x] **Exportar datos de SQLite**
  - [x] Crear script de exportación de datos existentes
  - [x] Exportar usuarios, proyectos, tareas, comentarios, historial
  - [x] Verificar integridad de relaciones
  - [x] Crear backup de SQLite actual

- [x] **Importar datos a PostgreSQL**
  - [x] Ejecutar migraciones en PostgreSQL
  - [x] Importar datos exportados
  - [x] Verificar integridad de datos
  - [x] Validar que todas las relaciones funcionan

#### **1.3 Simplificación y Validación**
- [x] **Eliminar soporte dual SQLite/PostgreSQL**
  - [x] Simplificar configuración para usar solo PostgreSQL
  - [x] Eliminar archivo db.sqlite3
  - [x] Actualizar docker-compose.yml
  - [x] Limpiar archivos de exportación temporales

- [x] **Verificar funcionalidad**
  - [x] Probar login/logout
  - [x] Verificar CRUD de proyectos y tareas
  - [x] Comprobar filtros y búsquedas
  - [x] Validar reportes y gráficos
  - [x] Verificar comentarios e historial

---

### **FASE 2: Containerización del Frontend**
**Prioridad: ALTA** | **Tiempo estimado: 1 día** | **✅ COMPLETADA**

#### **2.1 Dockerfile para Next.js**
- [x] **Crear Dockerfile.frontend**
  - [x] Usar imagen Node.js 18 Alpine
  - [x] Configurar multi-stage build (build + production)
  - [x] Instalar dependencias y construir aplicación
  - [x] Configurar servidor de producción (standalone)
  - [x] Exponer puerto 3000

- [x] **Optimizaciones**
  - [x] Configurar .dockerignore para excluir node_modules
  - [x] Optimizar tamaño de imagen
  - [x] Configurar variables de entorno para build
  - [x] Implementar health checks

#### **2.2 Configuración Next.js para Producción**
- [x] **Variables de entorno**
  - [x] Configurar NEXT_PUBLIC_API_URL para producción
  - [x] Configurar variables de dominio
  - [x] Actualizar next.config.js para producción
  - [x] Configurar headers de seguridad

- [x] **Build optimizado**
  - [x] Configurar output: 'standalone' para mejor performance
  - [x] Optimizar imágenes y assets
  - [x] Configurar compresión y minificación
  - [x] Verificar que funciona en contenedor

#### **2.3 Integración con Docker Compose**
- [x] **Servicio frontend**
  - [x] Definir servicio frontend en docker-compose
  - [x] Configurar dependencias (backend debe estar listo)
  - [x] Mapear puerto 3000
  - [x] Configurar variables de entorno
  - [x] Probar funcionamiento completo

#### **2.4 Corrección de Comunicación API**
- [x] **Problemas identificados y solucionados**
  - [x] Corregir rutas API para usar prefijo `/api`
  - [x] Configurar comunicación entre contenedores
  - [x] Actualizar API service para usar URLs correctas
  - [x] Verificar login y funcionalidad completa

---

### **FASE 3: Configuración de Nginx como Proxy**
**Prioridad: ALTA** | **Tiempo estimado: 1 día** | **✅ COMPLETADA**

#### **3.1 Configuración Nginx**
- [x] **Crear Dockerfile.nginx**
  - [x] Usar imagen nginx:alpine
  - [x] Configurar nginx.conf para proxy reverso
  - [x] Configurar SSL/TLS (preparación para HTTPS)
  - [x] Configurar compresión y caché
  - [x] Configurar logs

- [x] **Configuración de Proxy**
  - [x] Proxy para frontend (puerto 3000)
  - [x] Proxy para backend API (puerto 8000)
  - [x] Configurar headers apropiados
  - [x] Manejar CORS desde nginx
  - [x] Configurar rate limiting

#### **3.2 Configuración para Dominio**
- [x] **Configuración de dominio**
  - [x] Configurar server_name para gestorai.tecnolitas.com
  - [x] Configurar redirect de HTTP a HTTPS
  - [x] Configurar certificados SSL (preparado para Let's Encrypt)
  - [x] Configurar subdirectorios si es necesario

#### **3.3 Integración con Docker Compose**
- [x] **Servicio nginx**
  - [x] Definir servicio nginx en docker-compose
  - [x] Configurar dependencias (frontend y backend)
  - [x] Mapear puerto 80 y 443
  - [x] Configurar volúmenes para configuración
  - [x] Probar funcionamiento completo

#### **3.4 Configuración Avanzada**
- [x] **Características Implementadas**
  - [x] Headers de seguridad (X-Frame-Options, CSP, etc.)
  - [x] Rate limiting para API y login
  - [x] Compresión gzip optimizada
  - [x] Health check endpoint
  - [x] Configuración de upstream servers
  - [x] Manejo de WebSockets para Next.js

---

### **FASE 4: Configuración del Repositorio GitHub**
**Prioridad: CRÍTICA** | **Tiempo estimado: 0.5 días**

#### **4.1 Configuración del Repositorio**
- [ ] **Preparación del código**
  - [ ] Verificar que no hay archivos sensibles en el código
  - [ ] Crear .gitignore apropiado para Django + Next.js + Docker
  - [ ] Eliminar archivos temporales y cache
  - [ ] Verificar que no hay contraseñas hardcodeadas

- [ ] **Subida inicial al repositorio**
  - [ ] Conectar repositorio local con GitHub remoto
  - [ ] Hacer commit inicial con todo el código
  - [ ] Configurar rama develop como principal [[memory:7746159]]
  - [ ] Crear rama production para despliegues
  - [ ] Configurar .gitignore para archivos de entorno

#### **4.2 Configuración de Archivos**
- [ ] **Archivos de configuración**
  - [ ] Crear .env.example para variables de entorno
  - [ ] Documentar variables necesarias
  - [ ] Crear README.md con instrucciones de instalación
  - [ ] Configurar .dockerignore para optimizar builds
  - [ ] Crear docker-compose.override.yml para desarrollo local

- [ ] **Documentación del repositorio**
  - [ ] Actualizar README.md con descripción del proyecto
  - [ ] Documentar comandos de Docker
  - [ ] Documentar proceso de desarrollo
  - [ ] Crear CONTRIBUTING.md si es necesario
  - [ ] Configurar issues y pull requests

#### **4.3 Configuración de CI/CD (Opcional)**
- [ ] **GitHub Actions (futuro)**
  - [ ] Crear workflow para tests automáticos
  - [ ] Configurar deployment automático
  - [ ] Configurar notificaciones
  - [ ] Documentar proceso de CI/CD

---

### **FASE 5: Configuración de Entornos Separados** ✅
**Prioridad: ALTA** | **Tiempo estimado: 1 día**

#### **5.1 Variables de Entorno** ✅
- [x] **Archivos .env**
  - [x] Crear .env.development para desarrollo
  - [x] Crear .env.production para producción
  - [x] Configurar variables de base de datos
  - [x] Configurar variables de dominio y URLs
  - [x] Configurar secretos y claves

- [x] **Configuración Django**
  - [x] Crear settings/development.py
  - [x] Crear settings/production.py
  - [x] Configurar DEBUG y ALLOWED_HOSTS
  - [x] Configurar CORS para producción
  - [x] Configurar logging para producción

#### **5.2 Docker Compose Separados** ✅
- [x] **docker-compose.yml (Desarrollo)**
  - [x] Mantener configuración actual para desarrollo
  - [x] Usar PostgreSQL para desarrollo
  - [x] Configurar volúmenes para hot reload
  - [x] Configurar puertos locales

- [x] **docker-compose.prod.yml (Producción)**
  - [x] Configuración optimizada para producción
  - [x] Usar PostgreSQL
  - [x] Configurar nginx como proxy
  - [x] Configurar volúmenes persistentes
  - [x] Configurar restart policies

#### **5.3 Scripts de Despliegue** ✅
- [x] **Scripts de automatización**
  - [x] Crear script deploy.sh para producción
  - [x] Crear script backup.sh para respaldos
  - [x] Crear script migrate.sh para migraciones
  - [x] Crear script logs.sh para monitoreo
  - [x] Documentar comandos de despliegue

---

### **FASE 6: Optimizaciones y Seguridad**
**Prioridad: MEDIA** | **Tiempo estimado: 1 día**

#### **6.1 Optimizaciones de Performance**
- [ ] **Backend Django**
  - [ ] Configurar gunicorn para producción
  - [ ] Configurar workers y threads
  - [ ] Configurar caché (Redis opcional)
  - [ ] Optimizar queries de base de datos
  - [ ] Configurar static files con nginx

- [ ] **Frontend Next.js**
  - [ ] Configurar compresión gzip
  - [ ] Configurar caché de assets
  - [ ] Optimizar bundle size
  - [ ] Configurar CDN si es necesario
  - [ ] Implementar service workers

#### **6.2 Seguridad**
- [ ] **Configuración de seguridad**
  - [ ] Configurar HTTPS obligatorio
  - [ ] Configurar headers de seguridad
  - [ ] Configurar rate limiting
  - [ ] Configurar firewall básico
  - [ ] Configurar backup automático

- [ ] **Variables sensibles**
  - [ ] Mover SECRET_KEY a variables de entorno
  - [ ] Configurar contraseñas seguras para PostgreSQL
  - [ ] Configurar tokens de API seguros
  - [ ] Documentar variables de entorno
  - [ ] Crear .env.example

---

### **FASE 7: Testing y Validación**
**Prioridad: CRÍTICA** | **Tiempo estimado: 1 día**

#### **7.1 Testing de Funcionalidad**
- [ ] **Pruebas de integración**
  - [ ] Probar login/logout completo
  - [ ] Verificar CRUD de proyectos y tareas
  - [ ] Probar filtros, búsquedas y ordenamiento
  - [ ] Verificar reportes y gráficos
  - [ ] Probar comentarios e historial
  - [ ] Verificar vista Kanban y calendario

- [ ] **Pruebas de rendimiento**
  - [ ] Probar carga de datos grandes
  - [ ] Verificar tiempo de respuesta
  - [ ] Probar concurrencia básica
  - [ ] Verificar uso de memoria
  - [ ] Probar funcionamiento con nginx

#### **7.2 Testing de Despliegue**
- [ ] **Pruebas de despliegue**
  - [ ] Probar docker-compose up completo
  - [ ] Verificar que todos los servicios inician
  - [ ] Probar reinicio de servicios
  - [ ] Verificar persistencia de datos
  - [ ] Probar backup y restore

- [ ] **Pruebas de dominio**
  - [ ] Configurar DNS temporal para testing
  - [ ] Probar acceso desde dominio
  - [ ] Verificar SSL/TLS
  - [ ] Probar desde diferentes dispositivos
  - [ ] Verificar funcionamiento móvil

---

### **FASE 8: Documentación y Entrega**
**Prioridad: MEDIA** | **Tiempo estimado: 0.5 días**

#### **8.1 Documentación**
- [ ] **Documentación técnica**
  - [ ] Actualizar README.md con instrucciones de despliegue
  - [ ] Documentar variables de entorno
  - [ ] Documentar comandos de Docker
  - [ ] Crear guía de troubleshooting
  - [ ] Documentar proceso de backup

- [ ] **Documentación de usuario**
  - [ ] Crear guía de usuario final
  - [ ] Documentar funcionalidades
  - [ ] Crear FAQ
  - [ ] Documentar reportes
  - [ ] Crear tutoriales

#### **8.2 Entrega**
- [ ] **Preparación para producción**
  - [ ] Verificar que todo funciona
  - [ ] Crear script de despliegue final
  - [ ] Preparar credenciales de producción
  - [ ] Documentar proceso de monitoreo
  - [ ] Entregar al cliente

---

## 🛠️ **Tecnologías y Herramientas**

### **Base de Datos**
- **Desarrollo**: SQLite (actual)
- **Producción**: PostgreSQL 15 en Docker

### **Backend**
- **Framework**: Django 4.2.7
- **API**: Django REST Framework
- **Servidor**: Gunicorn (producción)
- **Containerización**: Docker

### **Frontend**
- **Framework**: Next.js 14
- **Lenguaje**: TypeScript
- **Styling**: Tailwind CSS
- **Containerización**: Docker

### **Proxy y Servidor Web**
- **Proxy**: Nginx
- **SSL/TLS**: Let's Encrypt
- **Containerización**: Docker

### **Infraestructura**
- **Orquestación**: Docker Compose
- **Entornos**: Desarrollo y Producción separados
- **Dominio**: gestorai.tecnolitas.com

---

## 📅 **Cronograma Estimado**

| Fase | Duración | Dependencias | Estado |
|------|----------|--------------|--------|
| Fase 1: PostgreSQL | 1-2 días | - | ✅ Completada |
| Fase 2: Frontend Docker | 1 día | Fase 1 | ✅ Completada |
| Fase 3: Nginx Proxy | 1 día | Fase 2 | ✅ Completada |
| Fase 4: Repositorio GitHub | 0.5 días | - | ⏳ Pendiente |
| Fase 5: Entornos | 1 día | Fase 3,4 | ⏳ Pendiente |
| Fase 6: Optimizaciones | 1 día | Fase 5 | ⏳ Pendiente |
| Fase 7: Testing | 1 día | Fase 6 | ⏳ Pendiente |
| Fase 8: Documentación | 0.5 días | Fase 7 | ⏳ Pendiente |

**Duración total estimada: 7-8 días**

---

## 🎯 **Criterios de Éxito**

### **Funcionalidad**
- [ ] Todos los datos migrados correctamente a PostgreSQL
- [ ] Frontend funcionando en contenedor Docker
- [ ] Nginx proxy funcionando correctamente
- [ ] Acceso desde dominio gestorai.tecnolitas.com
- [ ] Todas las funcionalidades operativas

### **Performance**
- [ ] Tiempo de respuesta < 2 segundos
- [ ] Carga de página inicial < 3 segundos
- [ ] Uso de memoria optimizado
- [ ] Compresión y caché funcionando

### **Seguridad**
- [ ] HTTPS configurado
- [ ] Headers de seguridad implementados
- [ ] Variables sensibles en entorno
- [ ] Rate limiting activo

### **Mantenimiento**
- [ ] Scripts de despliegue funcionando
- [ ] Backup automático configurado
- [ ] Logs centralizados
- [ ] Documentación completa

---

## 🚨 **Riesgos y Mitigaciones**

### **Riesgos Técnicos**
- **Pérdida de datos durante migración**
  - *Mitigación*: Backup completo antes de migración, pruebas en entorno de staging
- **Problemas de conectividad entre contenedores**
  - *Mitigación*: Configuración de redes Docker, health checks
- **Configuración SSL/TLS**
  - *Mitigación*: Usar Let's Encrypt, configuración gradual

### **Riesgos de Tiempo**
- **Complejidad de configuración nginx**
  - *Mitigación*: Configuración paso a paso, documentación detallada
- **Problemas de DNS**
  - *Mitigación*: Testing con IPs temporales, configuración gradual

---

## 📝 **Comandos de Despliegue**

### **Desarrollo**
```bash
# Levantar entorno completo (PostgreSQL + Backend + Frontend + Nginx)
docker-compose up -d --build

# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f nginx
docker-compose logs -f web
docker-compose logs -f frontend
docker-compose logs -f db

# Ejecutar comandos Django
docker-compose exec web python manage.py [comando]

# Verificar estado de servicios
docker-compose ps

# Acceder a la aplicación
# Frontend: http://localhost
# API: http://localhost/api/
# Admin: http://localhost/admin/
```

### **Producción**
```bash
# Levantar entorno de producción
docker-compose -f docker-compose.prod.yml up -d --build

# Ver logs de producción
docker-compose -f docker-compose.prod.yml logs -f

# Backup de base de datos
docker-compose -f docker-compose.prod.yml exec db pg_dump -U [user] [db] > backup.sql
```

### **Gestión del Repositorio GitHub**
```bash
# Configurar repositorio remoto (solo primera vez)
git remote add origin https://github.com/[usuario]/[repositorio].git

# Subir código inicial
git add .
git commit -m "Commit inicial - Aplicación completa"
git branch -M develop
git push -u origin develop

# Crear rama de producción
git checkout -b production
git push -u origin production

# Trabajo diario en desarrollo
git checkout develop
git add .
git commit -m "Descripción del cambio"
git push origin develop

# Despliegue a producción
git checkout production
git merge develop
git push origin production
```

---

## 🎉 **Entregables Finales**

1. **Aplicación en Producción**
   - Frontend accesible en gestorai.tecnolitas.com
   - Backend API funcionando
   - Base de datos PostgreSQL con todos los datos
   - Nginx proxy configurado

2. **Configuración de Docker**
   - docker-compose.yml (desarrollo)
   - docker-compose.prod.yml (producción)
   - Dockerfiles optimizados
   - Variables de entorno configuradas

3. **Documentación**
   - README actualizado
   - Guía de despliegue
   - Documentación de troubleshooting
   - Scripts de automatización

4. **Scripts de Mantenimiento**
   - Script de backup
   - Script de despliegue
   - Script de migración
   - Script de monitoreo

---

## 📊 **RESUMEN DE PROGRESO**

### **Fases Completadas:**
- ✅ **FASE 1**: Migración PostgreSQL (Completada)
- ✅ **FASE 2**: Containerización Frontend (Completada)  
- ✅ **FASE 3**: Nginx Proxy (Completada)
- ✅ **FASE 5**: Entornos Separados (Completada)

### **Fases Pendientes:**
- ⏳ **FASE 4**: Repositorio GitHub (Pendiente)
- ⏳ **FASE 6**: Optimizaciones (Pendiente)
- ⏳ **FASE 7**: Testing (Pendiente)
- ⏳ **FASE 8**: Documentación (Pendiente)

### **Progreso Total:**
**4 de 8 fases completadas (50%)**

---

*Este plan será actualizado conforme avance el despliegue y se identifiquen nuevas necesidades o ajustes.*
