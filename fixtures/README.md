# 📊 Datos de Prueba - Sistema de Gestión de Proyectos

Este directorio contiene los fixtures de Django para cargar datos de prueba en el sistema de gestión de proyectos.

## 📁 Archivos de Fixtures

### `users.json`
- **8 usuarios de prueba** con datos realistas
- Incluye un administrador y 7 usuarios regulares
- Contraseña para todos: `test123`
- Datos: nombres, emails, fechas de registro

### `projects.json`
- **12 proyectos de prueba** con diferentes tipos
- Proyectos variados: e-commerce, apps móviles, sistemas web, etc.
- Asignados a diferentes usuarios
- Fechas de creación distribuidas en los últimos meses

### `tasks.json`
- **30 tareas de prueba** con diferentes estados
- Prioridades variadas (alta, media, baja)
- Algunas completadas, otras pendientes
- Fechas límite realistas
- Asignadas a diferentes usuarios y proyectos

### `comments.json`
- **20 comentarios de prueba** en diferentes tareas
- Comentarios realistas sobre progreso y colaboración
- Fechas coherentes con las tareas

### `task_history.json`
- **30 registros de historial** de cambios en tareas
- Cambios de estado, prioridad, asignación, fechas límite
- Registro de quién hizo qué cambio y cuándo

## 🚀 Comandos de Gestión

### Cargar Datos Básicos
```bash
python manage.py load_test_data
```

### Limpiar y Recargar Todo
```bash
python manage.py load_test_data --clear
```

### Cargar Solo Usuarios
```bash
python manage.py load_test_data --users-only
```

### Cargar Solo Proyectos
```bash
python manage.py load_test_data --projects-only
```

### Cargar Solo Tareas
```bash
python manage.py load_test_data --tasks-only
```

## 🔧 Generar Datos Adicionales

### Generar Datos Dinámicos
```bash
python manage.py generate_test_data
```

### Generar con Parámetros Personalizados
```bash
python manage.py generate_test_data --users 10 --projects 20 --tasks 100 --comments 200
```

## 📊 Datos Incluidos

### Usuarios de Prueba
1. **admin** - Administrador del sistema
2. **maria.garcia** - Desarrolladora frontend
3. **carlos.rodriguez** - Desarrollador backend
4. **ana.martinez** - Diseñadora UX/UI
5. **juan.lopez** - Project Manager
6. **lucia.hernandez** - QA Tester
7. **pedro.gonzalez** - DevOps Engineer
8. **sofia.torres** - Data Analyst

### Tipos de Proyectos
- Sistemas de gestión
- Aplicaciones web
- Apps móviles
- APIs REST
- Dashboards analíticos
- Plataformas e-learning
- Sistemas de inventario
- CRMs
- Sistemas de facturación

### Estados de Tareas
- **Completadas**: ~30% de las tareas
- **Pendientes**: ~70% de las tareas
- **Prioridades**: Distribuidas entre alta, media y baja

## 🔐 Credenciales de Acceso

### Usuario Administrador
- **Usuario**: `admin`
- **Contraseña**: `test123`
- **Email**: `admin@example.com`

### Usuarios Regulares
- **Usuario**: `maria.garcia` (o cualquier otro)
- **Contraseña**: `test123`
- **Email**: `maria.garcia@example.com`

## 📈 Estadísticas de Datos

### Datos Básicos (Fixtures)
- 👥 **8 usuarios**
- 📁 **12 proyectos**
- 📋 **30 tareas**
- 💬 **20 comentarios**
- 📊 **30 registros de historial**

### Datos Adicionales (Generación Dinámica)
- 👥 **5+ usuarios adicionales**
- 📁 **10+ proyectos adicionales**
- 📋 **50+ tareas adicionales**
- 💬 **100+ comentarios adicionales**

## 🛠️ Desarrollo

### Agregar Nuevos Fixtures
1. Crear archivo JSON en el directorio `fixtures/`
2. Seguir el formato de Django fixtures
3. Actualizar el comando `load_test_data.py`
4. Documentar en este README

### Modificar Datos Existentes
1. Editar el archivo JSON correspondiente
2. Ejecutar `python manage.py load_test_data --clear`
3. Verificar que los datos se cargan correctamente

### Generar Datos Personalizados
1. Modificar `generate_test_data.py`
2. Agregar nuevos templates o tipos de datos
3. Ejecutar con parámetros personalizados

## ⚠️ Notas Importantes

- **No usar en producción**: Estos datos son solo para desarrollo y testing
- **Contraseñas simples**: Todas las contraseñas son `test123` para facilitar testing
- **Datos coherentes**: Las fechas y relaciones están diseñadas para ser lógicas
- **Backup**: Hacer backup de la base de datos antes de cargar datos de prueba

## 🔄 Flujo de Trabajo Recomendado

1. **Desarrollo inicial**: Cargar datos básicos con `load_test_data`
2. **Testing**: Usar datos básicos para probar funcionalidades
3. **Escalabilidad**: Generar datos adicionales con `generate_test_data`
4. **Performance**: Probar con grandes volúmenes de datos
5. **Limpieza**: Usar `--clear` para resetear cuando sea necesario 