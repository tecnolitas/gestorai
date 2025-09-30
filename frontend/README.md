# Frontend - Gestor de Proyectos

Esta es la aplicación frontend en Next.js para el Gestor de Proyectos que se conecta con el backend Django.

## Características

- ✅ Autenticación de usuarios
- ✅ Dashboard con estadísticas
- ✅ Gestión de proyectos
- ✅ Gestión de tareas
- ✅ Interfaz moderna y responsive
- ✅ Integración completa con API Django

## Tecnologías Utilizadas

- **Next.js 14** - Framework de React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de estilos
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas
- **Axios** - Cliente HTTP
- **Lucide React** - Iconos

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
# Crear archivo .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
```

3. Ejecutar en modo desarrollo:
```bash
npm run dev
```

4. Abrir [http://localhost:3000](http://localhost:3000)

## Estructura del Proyecto

```
src/
├── app/                 # Páginas de la aplicación
│   ├── dashboard/       # Dashboard principal
│   ├── login/          # Página de login
│   └── layout.tsx      # Layout principal
├── components/         # Componentes reutilizables
│   ├── ui/            # Componentes de UI básicos
│   ├── Navigation.tsx # Navegación principal
│   └── ProtectedRoute.tsx # Protección de rutas
├── contexts/          # Contextos de React
│   └── AuthContext.tsx # Contexto de autenticación
├── services/          # Servicios de API
│   └── api.ts         # Cliente de API
└── types/             # Tipos TypeScript
    └── api.ts         # Tipos del API
```

## Configuración

El frontend está configurado para conectarse al backend Django en `http://localhost:8000`. Asegúrate de que el backend esté ejecutándose antes de usar el frontend.

### Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Credenciales de Prueba

- **Usuario**: admin
- **Contraseña**: admin123

## Scripts Disponibles

- `npm run dev` - Ejecutar en modo desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Ejecutar en modo producción
- `npm run lint` - Ejecutar linter

## API Endpoints Utilizados

- `POST /api/auth/login/` - Autenticación
- `GET /api/users/me/` - Usuario actual
- `GET /api/projects/` - Listar proyectos
- `POST /api/projects/` - Crear proyecto
- `GET /api/tasks/` - Listar tareas
- `POST /api/tasks/` - Crear tarea
- `PATCH /api/tasks/{id}/` - Actualizar tarea
- `POST /api/tasks/{id}/toggle_complete/` - Cambiar estado de tarea
- `GET /api/tasks/completed/` - Tareas completadas
- `GET /api/tasks/pending/` - Tareas pendientes
- `GET /api/tasks/my_tasks/` - Mis tareas

## Desarrollo

### Estructura de Componentes

- **UI Components**: Componentes básicos reutilizables (Button, Input, Textarea)
- **Navigation**: Navegación principal con menú responsive
- **ProtectedRoute**: Componente para proteger rutas que requieren autenticación

### Contextos

- **AuthContext**: Maneja el estado de autenticación del usuario

### Servicios

- **api.ts**: Cliente HTTP para comunicarse con el backend Django
