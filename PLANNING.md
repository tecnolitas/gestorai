Plan de Desarrollo: Gestor de Proyectos con Django en Docker
Este documento detalla los pasos necesarios para construir una aplicación backend con Django para la gestión de proyectos y tareas. El objetivo es proporcionar un contexto claro y una secuencia de tareas para que un asistente de IA (como Cursor) pueda ejecutar la implementación completa.

Objetivo de la Aplicación
Crear un backend robusto que permita gestionar usuarios, proyectos y tareas. La aplicación debe contar con un panel de administración funcional para realizar operaciones CRUD (Crear, Leer, Actualizar, Borrar) sobre los datos. Toda la aplicación se ejecutará dentro de un entorno controlado por Docker para garantizar la portabilidad y consistencia.

Stack Tecnológico
Framework Backend: Django

Lenguaje: Python

Base de Datos (desarrollo): SQLite (gestionada por Django ORM)

Entorno de Ejecución: Contenedor Docker

API REST: Django REST Framework

Modelo de Datos (Diseño Entidad-Relación)
La aplicación se estructurará en torno a tres modelos principales con las siguientes relaciones:

Usuario (CustomUser):

Heredará del AbstractUser de Django para incluir campos estándar de autenticación.

Será el modelo principal para la autenticación en todo el sistema.

Proyecto (Project):

Campos: name (texto), description (texto largo), owner (relación ForeignKey con CustomUser).

Relación: Un usuario puede tener muchos proyectos. Si un usuario se elimina, todos sus proyectos asociados se eliminarán en cascada (on_delete=models.CASCADE).

Tarea (Task):

Campos: title (texto), description (texto largo), completed (booleano), created_at (fecha y hora de creación, automática), due_date (fecha límite), project (relación ForeignKey con Project), assignee (relación ForeignKey con CustomUser).

Relación: Un proyecto puede tener muchas tareas. Si un proyecto se elimina, todas sus tareas se eliminarán en cascada (on_delete=models.CASCADE). Cada tarea está asignada a un usuario.

Plan de Implementación Paso a Paso
Fase 1: Configuración del Entorno Docker
[x] Crear un fichero Dockerfile para definir la imagen de la aplicación.

[x] Usar una imagen base oficial de Python.

[x] Establecer el directorio de trabajo (WORKDIR).

[x] Copiar el fichero de dependencias.

[x] Instalar las dependencias con pip.

[x] Copiar el resto del código del proyecto al contenedor.

[x] Exponer el puerto 8000.

[x] Definir el comando por defecto (CMD) para iniciar el servidor de desarrollo de Django.

[x] Crear un fichero requirements.txt y añadir la dependencia de Django.

[x] Crear un fichero docker-compose.yml para orquestar el contenedor.

[x] Definir un servicio web que construya la imagen a partir del Dockerfile.

[x] Mapear el puerto 8000 del contenedor al 8000 del host.

[x] Montar un volumen para que los cambios en el código local se reflejen inmediatamente en el contenedor.

[x] Construir y levantar el contenedor en modo detached ejecutando docker-compose up -d --build.

Fase 2: Creación y Configuración del Proyecto Django
[x] Ejecutar el comando django-admin startproject config . dentro del contenedor para crear el proyecto en la raíz del directorio de trabajo.

[x] Crear las tres aplicaciones necesarias (users, projects, tasks) ejecutando los siguientes comandos dentro del contenedor:

[x] python manage.py startapp users

[x] python manage.py startapp projects

[x] python manage.py startapp tasks

[x] Modificar el fichero config/settings.py:

[x] Añadir las nuevas aplicaciones a la lista INSTALLED_APPS en el orden lógico de dependencia: 'users', 'projects', 'tasks'.

[x] Especificar el modelo de usuario personalizado añadiendo la línea AUTH_USER_MODEL = 'users.CustomUser'.

Fase 3: Definición de Modelos y Relaciones
[x] En la app users, editar el fichero models.py para definir el modelo CustomUser que herede de AbstractUser.

[x] En la app projects, editar el fichero models.py para definir el modelo Project con sus campos y la relación ForeignKey a CustomUser.

[x] En la app tasks, editar el fichero models.py para definir el modelo Task con todos sus campos y las relaciones ForeignKey a Project y CustomUser.

Fase 4: Migraciones y Creación de la Base de Datos
[x] Ejecutar el comando python manage.py makemigrations dentro del contenedor para crear los archivos de migración para las tres aplicaciones.

[x] Ejecutar el comando python manage.py migrate para aplicar las migraciones y crear la base de datos db.sqlite3 con todas las tablas.

[x] Crear un superusuario para acceder al panel de administración ejecutando python manage.py createsuperuser de forma interactiva.

Fase 5: Configuración del Panel de Administración
[x] En la app users, editar admin.py para registrar el modelo CustomUser.

[x] En la app projects, editar admin.py para registrar el modelo Project.

[x] En la app tasks, editar admin.py para registrar el modelo Task.

[x] Personalizar la vista de administración para Task:

[x] Crear una clase TaskAdmin que herede de admin.ModelAdmin.

[x] Usar list_display para mostrar los campos: title, project, assignee, completed, created_at, due_date.

[x] Usar list_filter para permitir filtrar por completed, project, assignee y las fechas.

[x] Registrar el modelo Task junto con su clase TaskAdmin personalizada.

Fase 6: Verificación Final
[x] Asegurarse de que el servidor de desarrollo esté corriendo dentro del contenedor.

[x] Acceder al panel de administración (http://localhost:8000/admin/).

[x] Iniciar sesión con las credenciales del superusuario.

[x] Verificar que los modelos Users, Projects y Tasks aparecen en el panel.

[x] Realizar una prueba funcional completa:

[x] Crear un Project.

[x] Crear una Task y asociarla al proyecto y al usuario creados.

[x] Verificar que los filtros y la ordenación funcionan en la lista de tareas.

[x] Eliminar el Project creado y confirmar que el sistema avisa sobre el borrado en cascada de la Task asociada.

Fase 7: Implementación del API REST con Django REST Framework
[x] Actualizar requirements.txt para incluir Django REST Framework y dependencias adicionales:

[x] Añadir 'djangorestframework' para el API REST.

[x] Añadir 'django-cors-headers' para manejar CORS en desarrollo.

[x] Añadir 'drf-yasg' para documentación automática del API.

[x] Modificar config/settings.py para configurar Django REST Framework:

[x] Añadir 'rest_framework' a INSTALLED_APPS.

[x] Añadir 'corsheaders' a INSTALLED_APPS.

[x] Añadir 'corsheaders.middleware.CorsMiddleware' al MIDDLEWARE (antes de CommonMiddleware).

[x] Configurar CORS_ALLOWED_ORIGINS para desarrollo local.

[x] Configurar REST_FRAMEWORK con autenticación y permisos por defecto.

[x] Configurar drf-yasg para documentación automática.

[x] Crear serializers para cada modelo en las aplicaciones correspondientes:

[x] En users/serializers.py crear UserSerializer con campos básicos (id, username, email, first_name, last_name).

[x] En projects/serializers.py crear ProjectSerializer con todos los campos y owner como UserSerializer anidado.

[x] En tasks/serializers.py crear TaskSerializer con todos los campos y project/assignee como serializers anidados.

[x] Crear viewsets para cada modelo con operaciones CRUD completas:

[x] En users/views.py crear UserViewSet con list, retrieve, create, update, destroy.

[x] En projects/views.py crear ProjectViewSet con list, retrieve, create, update, destroy.

[x] En tasks/views.py crear TaskViewSet con list, retrieve, create, update, destroy.

[x] Implementar filtros y búsqueda en los viewsets:

[x] En ProjectViewSet añadir filtros por owner y búsqueda por name.

[x] En TaskViewSet añadir filtros por project, assignee, completed y búsqueda por title.

[x] Configurar las URLs del API en config/urls.py:

[x] Incluir las URLs de drf-yasg para documentación automática.

[x] Incluir las URLs de cada aplicación usando DefaultRouter.

[x] Crear archivos urls.py en cada aplicación:

[x] En users/urls.py configurar las rutas del UserViewSet.

[x] En projects/urls.py configurar las rutas del ProjectViewSet.

[x] En tasks/urls.py configurar las rutas del TaskViewSet.

[x] Implementar autenticación y permisos:

[x] Configurar autenticación por token o sesión.

[x] Implementar permisos para que los usuarios solo vean sus propios proyectos y tareas.

[x] Crear endpoints de autenticación (login, logout, registro).

[x] Crear datos de prueba para el API:

[x] Crear un script de fixtures o usar el shell de Django para crear usuarios, proyectos y tareas de prueba.

[x] Verificar que todos los endpoints funcionan correctamente.

[x] Crear documentación del API usando drf-yasg.

[x] Configurar el endpoint de documentación en /api/docs/.

[x] Verificar que la documentación se genera automáticamente.

---

## ✅ ESTADO DEL PROYECTO: COMPLETADO (TODAS LAS FASES)

**Fecha de Finalización**: 30 de Julio de 2025

### Resumen de Implementación

Todas las fases del plan de desarrollo han sido completadas exitosamente:

- ✅ **Fase 1**: Entorno Docker configurado y funcionando
- ✅ **Fase 2**: Proyecto Django creado con todas las aplicaciones
- ✅ **Fase 3**: Modelos y relaciones implementados correctamente
- ✅ **Fase 4**: Base de datos creada y migraciones aplicadas
- ✅ **Fase 5**: Panel de administración configurado y personalizado
- ✅ **Fase 6**: Verificación completa y funcional
- ✅ **Fase 7**: API REST completamente implementado y funcional

### Acceso a la Aplicación

- **URL del Panel de Administración**: http://localhost:8000/admin/
- **URL de la Documentación del API**: http://localhost:8000/api/docs/
- **Credenciales**: admin / admin123
- **Servidor de Desarrollo**: http://localhost:8000/

### Funcionalidades Implementadas

1. **Gestión de Usuarios**: Modelo CustomUser heredando de AbstractUser
2. **Gestión de Proyectos**: CRUD completo con propietarios
3. **Gestión de Tareas**: CRUD completo con asignación y filtros avanzados
4. **Eliminación en Cascada**: Funcionando correctamente
5. **Panel de Administración**: Completamente funcional y personalizado
6. **API REST Completo**: 
   - Autenticación por token
   - CRUD completo para todos los modelos
   - Filtros y búsqueda avanzada
   - Endpoints personalizados
   - Documentación automática
   - Paginación y ordenamiento

### Comandos de Ejecución

```bash
# Levantar la aplicación
docker-compose up -d --build

# Ver logs
docker-compose logs web

# Ejecutar comandos de Django
docker-compose exec web python manage.py [comando]

# Detener la aplicación
docker-compose down
```

### Endpoints del API Verificados

- ✅ `POST /api/auth/login/` - Autenticación
- ✅ `GET /api/users/me/` - Usuario actual
- ✅ `GET /api/projects/` - Listar proyectos
- ✅ `POST /api/projects/` - Crear proyecto
- ✅ `GET /api/tasks/` - Listar tareas
- ✅ `POST /api/tasks/` - Crear tarea
- ✅ `PATCH /api/tasks/{id}/` - Actualizar tarea
- ✅ `POST /api/tasks/{id}/toggle_complete/` - Cambiar estado
- ✅ `GET /api/tasks/completed/` - Tareas completadas
- ✅ `GET /api/tasks/pending/` - Tareas pendientes
- ✅ `GET /api/tasks/my_tasks/` - Mis tareas
- ✅ `GET /api/docs/` - Documentación automática

**Estado**: ✅ PROYECTO COMPLETADO Y FUNCIONAL - API REST OPERATIVO