from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import datetime, timedelta
from projects.models import Project
from tasks.models import Task
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Poblar la base de datos con datos completos y realistas para reportes'

    def handle(self, *args, **options):
        self.stdout.write('🚀 Creando datos completos y realistas para reportes...')
        
        # Crear usuarios más diversos
        users_data = [
            {'username': 'admin', 'email': 'admin@empresa.com', 'first_name': 'Administrador', 'last_name': 'Sistema'},
            {'username': 'maria.garcia', 'email': 'maria.garcia@empresa.com', 'first_name': 'María', 'last_name': 'García'},
            {'username': 'carlos.lopez', 'email': 'carlos.lopez@empresa.com', 'first_name': 'Carlos', 'last_name': 'López'},
            {'username': 'ana.martinez', 'email': 'ana.martinez@empresa.com', 'first_name': 'Ana', 'last_name': 'Martínez'},
            {'username': 'david.rodriguez', 'email': 'david.rodriguez@empresa.com', 'first_name': 'David', 'last_name': 'Rodríguez'},
            {'username': 'laura.sanchez', 'email': 'laura.sanchez@empresa.com', 'first_name': 'Laura', 'last_name': 'Sánchez'},
            {'username': 'jose.gonzalez', 'email': 'jose.gonzalez@empresa.com', 'first_name': 'José', 'last_name': 'González'},
            {'username': 'carmen.ruiz', 'email': 'carmen.ruiz@empresa.com', 'first_name': 'Carmen', 'last_name': 'Ruiz'},
            {'username': 'antonio.morales', 'email': 'antonio.morales@empresa.com', 'first_name': 'Antonio', 'last_name': 'Morales'},
            {'username': 'isabel.jimenez', 'email': 'isabel.jimenez@empresa.com', 'first_name': 'Isabel', 'last_name': 'Jiménez'},
        ]
        
        users = []
        for user_data in users_data:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults=user_data
            )
            if created:
                user.set_password('password123')
                user.save()
            elif user.username == 'admin':
                user.set_password('admin123')
                user.is_superuser = True
                user.is_staff = True
                user.save()
            users.append(user)
            self.stdout.write(f'✅ Usuario: {user.first_name} {user.last_name}')

        # Crear proyectos más diversos (20 proyectos)
        projects_data = [
            {
                'name': 'Sistema CRM Avanzado',
                'description': 'Desarrollo de un sistema CRM completo con funcionalidades de gestión de clientes, ventas y marketing automatizado.',
                'created_at': datetime(2024, 7, 1, 9, 0, 0, tzinfo=timezone.utc)
            },
            {
                'name': 'Dashboard Analytics Empresarial',
                'description': 'Plataforma de análisis de datos en tiempo real con visualizaciones interactivas y reportes automatizados.',
                'created_at': datetime(2024, 7, 5, 10, 0, 0, tzinfo=timezone.utc)
            },
            {
                'name': 'App Móvil E-commerce',
                'description': 'Aplicación móvil nativa para comercio electrónico con integración de pagos y gestión de inventario.',
                'created_at': datetime(2024, 7, 10, 8, 30, 0, tzinfo=timezone.utc)
            },
            {
                'name': 'Sistema de Gestión Documental',
                'description': 'Plataforma para gestión, almacenamiento y búsqueda de documentos corporativos con control de versiones.',
                'created_at': datetime(2024, 7, 15, 11, 0, 0, tzinfo=timezone.utc)
            },
            {
                'name': 'API de Integración Financiera',
                'description': 'API REST para integración con sistemas bancarios y procesamiento de transacciones financieras.',
                'created_at': datetime(2024, 7, 20, 14, 0, 0, tzinfo=timezone.utc)
            },
            {
                'name': 'Portal de Recursos Humanos',
                'description': 'Sistema web para gestión de empleados, nóminas, vacaciones y evaluación de desempeño.',
                'created_at': datetime(2024, 7, 25, 9, 0, 0, tzinfo=timezone.utc)
            },
            {
                'name': 'Sistema de Monitoreo IoT',
                'description': 'Plataforma para monitoreo de dispositivos IoT con alertas en tiempo real y análisis predictivo.',
                'created_at': datetime(2024, 8, 1, 10, 0, 0, tzinfo=timezone.utc)
            },
            {
                'name': 'Plataforma de E-learning',
                'description': 'Sistema de aprendizaje en línea con cursos interactivos, evaluaciones y certificaciones.',
                'created_at': datetime(2024, 8, 5, 8, 0, 0, tzinfo=timezone.utc)
            },
            {
                'name': 'Sistema de Inventario Inteligente',
                'description': 'Gestión automatizada de inventario con predicción de demanda y optimización de stock.',
                'created_at': datetime(2024, 8, 10, 13, 0, 0, tzinfo=timezone.utc)
            },
            {
                'name': 'Portal de Clientes B2B',
                'description': 'Plataforma web para gestión de clientes corporativos con catálogo de productos y pedidos.',
                'created_at': datetime(2024, 8, 15, 11, 30, 0, tzinfo=timezone.utc)
            },
            {
                'name': 'Sistema de Facturación Electrónica',
                'description': 'Emisión y gestión de facturas electrónicas con integración fiscal y contable.',
                'created_at': datetime(2024, 8, 20, 9, 0, 0, tzinfo=timezone.utc)
            },
            {
                'name': 'App de Delivery y Logística',
                'description': 'Aplicación móvil para gestión de entregas, rutas optimizadas y seguimiento en tiempo real.',
                'created_at': datetime(2024, 8, 25, 15, 0, 0, tzinfo=timezone.utc)
            },
            {
                'name': 'Sistema de Reservas y Citas',
                'description': 'Plataforma para gestión de citas médicas, reservas de restaurantes y servicios.',
                'created_at': datetime(2024, 9, 1, 10, 0, 0, tzinfo=timezone.utc)
            },
            {
                'name': 'Dashboard de Ventas y Marketing',
                'description': 'Análisis de campañas de marketing, conversiones y métricas de ventas en tiempo real.',
                'created_at': datetime(2024, 9, 2, 14, 0, 0, tzinfo=timezone.utc)
            },
            {
                'name': 'Sistema de Gestión de Proyectos',
                'description': 'Herramienta completa para planificación, seguimiento y colaboración en proyectos.',
                'created_at': datetime(2024, 9, 3, 8, 0, 0, tzinfo=timezone.utc)
            },
            {
                'name': 'API de Integración con Redes Sociales',
                'description': 'Conectores para Facebook, Instagram, Twitter y LinkedIn con análisis de engagement.',
                'created_at': datetime(2024, 9, 4, 12, 0, 0, tzinfo=timezone.utc)
            },
            {
                'name': 'Sistema de Chat y Comunicación',
                'description': 'Plataforma de mensajería interna con videollamadas y compartir archivos.',
                'created_at': datetime(2024, 9, 5, 9, 30, 0, tzinfo=timezone.utc)
            },
            {
                'name': 'Portal de Análisis de Datos',
                'description': 'Herramientas de business intelligence con dashboards personalizables y reportes automáticos.',
                'created_at': datetime(2024, 9, 6, 11, 0, 0, tzinfo=timezone.utc)
            },
            {
                'name': 'Sistema de Gestión de Calidad',
                'description': 'Control de calidad, auditorías y certificaciones ISO con seguimiento de no conformidades.',
                'created_at': datetime(2024, 9, 7, 8, 0, 0, tzinfo=timezone.utc)
            },
            {
                'name': 'App de Gestión de Flotas',
                'description': 'Monitoreo de vehículos, mantenimiento preventivo y optimización de rutas de transporte.',
                'created_at': datetime(2024, 9, 7, 16, 0, 0, tzinfo=timezone.utc)
            }
        ]
        
        projects = []
        for project_data in projects_data:
            project_data['owner'] = random.choice(users)
            project, created = Project.objects.get_or_create(
                name=project_data['name'],
                defaults=project_data
            )
            projects.append(project)
            self.stdout.write(f'✅ Proyecto: {project.name}')

        # Crear tareas distribuidas en diferentes períodos temporales
        # Julio 2024 - Tareas más antiguas, muchas completadas
        july_tasks = [
            # Sistema CRM Avanzado - Julio
            {'title': 'Análisis de requisitos', 'project': 0, 'assignee': 1, 'priority': 'high', 'completed': True, 'created': (2024, 7, 2, 9, 0), 'due': (2024, 7, 5, 17, 0)},
            {'title': 'Diseño de arquitectura', 'project': 0, 'assignee': 2, 'priority': 'high', 'completed': True, 'created': (2024, 7, 3, 10, 0), 'due': (2024, 7, 8, 17, 0)},
            {'title': 'Configuración de base de datos', 'project': 0, 'assignee': 3, 'priority': 'high', 'completed': True, 'created': (2024, 7, 6, 8, 0), 'due': (2024, 7, 10, 17, 0)},
            {'title': 'API de autenticación', 'project': 0, 'assignee': 4, 'priority': 'high', 'completed': True, 'created': (2024, 7, 8, 11, 0), 'due': (2024, 7, 12, 17, 0)},
            {'title': 'Módulo de clientes', 'project': 0, 'assignee': 1, 'priority': 'high', 'completed': True, 'created': (2024, 7, 10, 14, 0), 'due': (2024, 7, 15, 17, 0)},
            {'title': 'Interfaz de usuario', 'project': 0, 'assignee': 5, 'priority': 'medium', 'completed': True, 'created': (2024, 7, 12, 9, 0), 'due': (2024, 7, 18, 17, 0)},
            {'title': 'Módulo de ventas', 'project': 0, 'assignee': 2, 'priority': 'high', 'completed': True, 'created': (2024, 7, 15, 13, 0), 'due': (2024, 7, 20, 17, 0)},
            {'title': 'Sistema de notificaciones', 'project': 0, 'assignee': 6, 'priority': 'medium', 'completed': True, 'created': (2024, 7, 18, 10, 0), 'due': (2024, 7, 22, 17, 0)},
            {'title': 'Reportes básicos', 'project': 0, 'assignee': 7, 'priority': 'medium', 'completed': True, 'created': (2024, 7, 20, 15, 0), 'due': (2024, 7, 25, 17, 0)},
            {'title': 'Integración con email', 'project': 0, 'assignee': 3, 'priority': 'low', 'completed': True, 'created': (2024, 7, 22, 11, 0), 'due': (2024, 7, 28, 17, 0)},
            {'title': 'Optimización de rendimiento', 'project': 0, 'assignee': 4, 'priority': 'medium', 'completed': False, 'created': (2024, 7, 25, 8, 0), 'due': (2024, 7, 30, 17, 0)},
            {'title': 'Documentación técnica', 'project': 0, 'assignee': 8, 'priority': 'low', 'completed': False, 'created': (2024, 7, 28, 14, 0), 'due': (2024, 8, 2, 17, 0)},
            
            # Dashboard Analytics Empresarial - Julio
            {'title': 'Análisis de datos existentes', 'project': 1, 'assignee': 2, 'priority': 'high', 'completed': True, 'created': (2024, 7, 6, 9, 0), 'due': (2024, 7, 9, 17, 0)},
            {'title': 'Diseño de dashboard', 'project': 1, 'assignee': 5, 'priority': 'high', 'completed': True, 'created': (2024, 7, 8, 10, 0), 'due': (2024, 7, 12, 17, 0)},
            {'title': 'Configuración de servidor', 'project': 1, 'assignee': 3, 'priority': 'high', 'completed': True, 'created': (2024, 7, 10, 8, 0), 'due': (2024, 7, 13, 17, 0)},
            {'title': 'Integración con APIs', 'project': 1, 'assignee': 4, 'priority': 'high', 'completed': True, 'created': (2024, 7, 12, 11, 0), 'due': (2024, 7, 16, 17, 0)},
            {'title': 'Gráficos interactivos', 'project': 1, 'assignee': 6, 'priority': 'medium', 'completed': True, 'created': (2024, 7, 14, 13, 0), 'due': (2024, 7, 18, 17, 0)},
            {'title': 'Sistema de alertas', 'project': 1, 'assignee': 7, 'priority': 'medium', 'completed': True, 'created': (2024, 7, 16, 9, 0), 'due': (2024, 7, 20, 17, 0)},
            {'title': 'Exportación de datos', 'project': 1, 'assignee': 8, 'priority': 'low', 'completed': True, 'created': (2024, 7, 18, 15, 0), 'due': (2024, 7, 22, 17, 0)},
            {'title': 'Optimización de consultas', 'project': 1, 'assignee': 2, 'priority': 'medium', 'completed': False, 'created': (2024, 7, 20, 12, 0), 'due': (2024, 7, 25, 17, 0)},
        ]
        
        # Agosto 2024 - Tareas en progreso
        august_tasks = [
            # App Móvil E-commerce - Agosto
            {'title': 'Análisis de mercado móvil', 'project': 2, 'assignee': 5, 'priority': 'high', 'completed': True, 'created': (2024, 8, 1, 9, 0), 'due': (2024, 8, 3, 17, 0)},
            {'title': 'Diseño de UI/UX', 'project': 2, 'assignee': 6, 'priority': 'high', 'completed': True, 'created': (2024, 8, 3, 10, 0), 'due': (2024, 8, 8, 17, 0)},
            {'title': 'Configuración React Native', 'project': 2, 'assignee': 3, 'priority': 'high', 'completed': True, 'created': (2024, 8, 5, 8, 0), 'due': (2024, 8, 10, 17, 0)},
            {'title': 'Pantalla de productos', 'project': 2, 'assignee': 4, 'priority': 'high', 'completed': True, 'created': (2024, 8, 8, 11, 0), 'due': (2024, 8, 13, 17, 0)},
            {'title': 'Carrito de compras', 'project': 2, 'assignee': 1, 'priority': 'high', 'completed': True, 'created': (2024, 8, 10, 14, 0), 'due': (2024, 8, 15, 17, 0)},
            {'title': 'Integración de pagos', 'project': 2, 'assignee': 2, 'priority': 'high', 'completed': False, 'created': (2024, 8, 12, 9, 0), 'due': (2024, 8, 18, 17, 0)},
            {'title': 'Push notifications', 'project': 2, 'assignee': 7, 'priority': 'medium', 'completed': False, 'created': (2024, 8, 15, 13, 0), 'due': (2024, 8, 20, 17, 0)},
            {'title': 'Optimización de imágenes', 'project': 2, 'assignee': 8, 'priority': 'medium', 'completed': False, 'created': (2024, 8, 18, 10, 0), 'due': (2024, 8, 23, 17, 0)},
            {'title': 'Testing de usabilidad', 'project': 2, 'assignee': 5, 'priority': 'low', 'completed': False, 'created': (2024, 8, 20, 15, 0), 'due': (2024, 8, 25, 17, 0)},
            
            # Sistema de Gestión Documental - Agosto
            {'title': 'Análisis de requisitos', 'project': 3, 'assignee': 2, 'priority': 'high', 'completed': True, 'created': (2024, 8, 2, 9, 0), 'due': (2024, 8, 5, 17, 0)},
            {'title': 'Arquitectura de microservicios', 'project': 3, 'assignee': 3, 'priority': 'high', 'completed': True, 'created': (2024, 8, 5, 10, 0), 'due': (2024, 8, 10, 17, 0)},
            {'title': 'API de documentos', 'project': 3, 'assignee': 4, 'priority': 'high', 'completed': True, 'created': (2024, 8, 8, 8, 0), 'due': (2024, 8, 13, 17, 0)},
            {'title': 'Sistema de búsqueda', 'project': 3, 'assignee': 6, 'priority': 'medium', 'completed': True, 'created': (2024, 8, 10, 11, 0), 'due': (2024, 8, 15, 17, 0)},
            {'title': 'Control de acceso', 'project': 3, 'assignee': 1, 'priority': 'high', 'completed': False, 'created': (2024, 8, 12, 14, 0), 'due': (2024, 8, 18, 17, 0)},
            {'title': 'Interfaz web', 'project': 3, 'assignee': 5, 'priority': 'medium', 'completed': False, 'created': (2024, 8, 15, 9, 0), 'due': (2024, 8, 20, 17, 0)},
            {'title': 'Versionado de documentos', 'project': 3, 'assignee': 7, 'priority': 'medium', 'completed': False, 'created': (2024, 8, 18, 13, 0), 'due': (2024, 8, 23, 17, 0)},
            {'title': 'Backup automático', 'project': 3, 'assignee': 8, 'priority': 'low', 'completed': False, 'created': (2024, 8, 20, 10, 0), 'due': (2024, 8, 25, 17, 0)},
            
            # API de Integración Financiera - Agosto
            {'title': 'Análisis de seguridad', 'project': 4, 'assignee': 3, 'priority': 'high', 'completed': True, 'created': (2024, 8, 3, 9, 0), 'due': (2024, 8, 6, 17, 0)},
            {'title': 'Integración bancaria', 'project': 4, 'assignee': 4, 'priority': 'high', 'completed': True, 'created': (2024, 8, 6, 10, 0), 'due': (2024, 8, 11, 17, 0)},
            {'title': 'Validación de transacciones', 'project': 4, 'assignee': 2, 'priority': 'high', 'completed': True, 'created': (2024, 8, 8, 8, 0), 'due': (2024, 8, 13, 17, 0)},
            {'title': 'Documentación API', 'project': 4, 'assignee': 8, 'priority': 'medium', 'completed': False, 'created': (2024, 8, 10, 11, 0), 'due': (2024, 8, 15, 17, 0)},
            {'title': 'Testing de integración', 'project': 4, 'assignee': 1, 'priority': 'medium', 'completed': False, 'created': (2024, 8, 12, 14, 0), 'due': (2024, 8, 18, 17, 0)},
            {'title': 'Monitoreo de transacciones', 'project': 4, 'assignee': 6, 'priority': 'low', 'completed': False, 'created': (2024, 8, 15, 9, 0), 'due': (2024, 8, 20, 17, 0)},
        ]
        
        # Septiembre 2024 - Tareas recientes
        september_tasks = [
            # Portal de Recursos Humanos - Septiembre
            {'title': 'Análisis de procesos RRHH', 'project': 5, 'assignee': 1, 'priority': 'high', 'completed': True, 'created': (2024, 9, 1, 9, 0), 'due': (2024, 9, 3, 17, 0)},
            {'title': 'Diseño de base de datos', 'project': 5, 'assignee': 3, 'priority': 'high', 'completed': True, 'created': (2024, 9, 2, 10, 0), 'due': (2024, 9, 5, 17, 0)},
            {'title': 'Módulo de nóminas', 'project': 5, 'assignee': 4, 'priority': 'high', 'completed': False, 'created': (2024, 9, 3, 8, 0), 'due': (2024, 9, 8, 17, 0)},
            {'title': 'Gestión de vacaciones', 'project': 5, 'assignee': 5, 'priority': 'medium', 'completed': False, 'created': (2024, 9, 4, 11, 0), 'due': (2024, 9, 9, 17, 0)},
            {'title': 'Evaluación de desempeño', 'project': 5, 'assignee': 6, 'priority': 'low', 'completed': False, 'created': (2024, 9, 5, 13, 0), 'due': (2024, 9, 10, 17, 0)},
            
            # Sistema de Monitoreo IoT - Septiembre
            {'title': 'Configuración IoT', 'project': 6, 'assignee': 2, 'priority': 'high', 'completed': True, 'created': (2024, 9, 1, 8, 0), 'due': (2024, 9, 3, 17, 0)},
            {'title': 'Dashboard de monitoreo', 'project': 6, 'assignee': 5, 'priority': 'high', 'completed': False, 'created': (2024, 9, 2, 10, 0), 'due': (2024, 9, 6, 17, 0)},
            {'title': 'Sistema de alertas', 'project': 6, 'assignee': 7, 'priority': 'medium', 'completed': False, 'created': (2024, 9, 3, 12, 0), 'due': (2024, 9, 7, 17, 0)},
            {'title': 'Análisis predictivo', 'project': 6, 'assignee': 8, 'priority': 'low', 'completed': False, 'created': (2024, 9, 4, 14, 0), 'due': (2024, 9, 8, 17, 0)},
            
            # Plataforma de E-learning - Septiembre
            {'title': 'Diseño de cursos', 'project': 7, 'assignee': 5, 'priority': 'high', 'completed': True, 'created': (2024, 9, 2, 9, 0), 'due': (2024, 9, 4, 17, 0)},
            {'title': 'Sistema de usuarios', 'project': 7, 'assignee': 3, 'priority': 'high', 'completed': False, 'created': (2024, 9, 3, 11, 0), 'due': (2024, 9, 7, 17, 0)},
            {'title': 'Reproductor de video', 'project': 7, 'assignee': 6, 'priority': 'medium', 'completed': False, 'created': (2024, 9, 4, 13, 0), 'due': (2024, 9, 8, 17, 0)},
            {'title': 'Sistema de evaluaciones', 'project': 7, 'assignee': 4, 'priority': 'medium', 'completed': False, 'created': (2024, 9, 5, 15, 0), 'due': (2024, 9, 9, 17, 0)},
            
            # Proyectos más recientes - Septiembre
            {'title': 'Análisis de inventario', 'project': 8, 'assignee': 2, 'priority': 'high', 'completed': True, 'created': (2024, 9, 3, 8, 0), 'due': (2024, 9, 5, 17, 0)},
            {'title': 'Algoritmo de predicción', 'project': 8, 'assignee': 8, 'priority': 'high', 'completed': False, 'created': (2024, 9, 4, 10, 0), 'due': (2024, 9, 8, 17, 0)},
            {'title': 'Dashboard de stock', 'project': 8, 'assignee': 5, 'priority': 'medium', 'completed': False, 'created': (2024, 9, 5, 12, 0), 'due': (2024, 9, 9, 17, 0)},
            
            {'title': 'Diseño de catálogo', 'project': 9, 'assignee': 6, 'priority': 'high', 'completed': True, 'created': (2024, 9, 4, 9, 0), 'due': (2024, 9, 6, 17, 0)},
            {'title': 'Sistema de pedidos', 'project': 9, 'assignee': 1, 'priority': 'high', 'completed': False, 'created': (2024, 9, 5, 11, 0), 'due': (2024, 9, 9, 17, 0)},
            {'title': 'Gestión de clientes B2B', 'project': 9, 'assignee': 3, 'priority': 'medium', 'completed': False, 'created': (2024, 9, 6, 13, 0), 'due': (2024, 9, 10, 17, 0)},
        ]
        
        # Combinar todas las tareas
        all_tasks = july_tasks + august_tasks + september_tasks
        
        # Crear tareas adicionales para proyectos más recientes
        additional_tasks = []
        for project_idx in range(10, 20):  # Proyectos 10-19
            for i in range(random.randint(3, 8)):  # 3-8 tareas por proyecto
                task_data = {
                    'title': f'Tarea {i+1} del proyecto {projects[project_idx].name[:20]}...',
                    'project': project_idx,
                    'assignee': random.randint(0, 9),
                    'priority': random.choice(['low', 'medium', 'high']),
                    'completed': random.choice([True, False, False, False]),  # 25% completadas
                    'created': (2024, 9, random.randint(1, 7), random.randint(8, 17), random.randint(0, 59)),
                    'due': (2024, 9, random.randint(8, 15), random.randint(8, 17), random.randint(0, 59))
                }
                additional_tasks.append(task_data)
        
        all_tasks.extend(additional_tasks)
        
        # Crear todas las tareas
        for task_data in all_tasks:
            created_at = datetime(*task_data['created'], tzinfo=timezone.utc)
            due_date = datetime(*task_data['due'], tzinfo=timezone.utc)
            
            task = Task.objects.create(
                title=task_data['title'],
                description=f"Descripción detallada para {task_data['title']}",
                project=projects[task_data['project']],
                assignee=users[task_data['assignee']],
                priority=task_data['priority'],
                completed=task_data['completed'],
                due_date=due_date
            )
            # Actualizar la fecha de creación después de crear el objeto
            task.created_at = created_at
            task.save()

        self.stdout.write('\n🎉 ¡Datos completos creados exitosamente!')
        self.stdout.write(f'📊 Resumen:')
        self.stdout.write(f'   - {User.objects.count()} usuarios')
        self.stdout.write(f'   - {Project.objects.count()} proyectos')
        self.stdout.write(f'   - {Task.objects.count()} tareas')
        self.stdout.write(f'   - {Task.objects.filter(completed=True).count()} tareas completadas')
        self.stdout.write(f'   - {Task.objects.filter(completed=False).count()} tareas pendientes')
        
        # Mostrar distribución por mes
        july_completed = Task.objects.filter(created_at__year=2024, created_at__month=7, completed=True).count()
        august_completed = Task.objects.filter(created_at__year=2024, created_at__month=8, completed=True).count()
        september_completed = Task.objects.filter(created_at__year=2024, created_at__month=9, completed=True).count()
        
        self.stdout.write(f'\n📅 Distribución temporal:')
        self.stdout.write(f'   - Julio 2024: {july_completed} tareas completadas')
        self.stdout.write(f'   - Agosto 2024: {august_completed} tareas completadas')
        self.stdout.write(f'   - Septiembre 2024: {september_completed} tareas completadas')
