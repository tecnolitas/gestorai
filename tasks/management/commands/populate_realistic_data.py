from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from projects.models import Project
from tasks.models import Task
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Poblar la base de datos con datos realistas para reportes'

    def handle(self, *args, **options):
        self.stdout.write('🚀 Creando datos realistas para reportes...')
        
        # Crear usuarios
        users_data = [
            {'username': 'maria.garcia', 'email': 'maria.garcia@empresa.com', 'first_name': 'María', 'last_name': 'García'},
            {'username': 'carlos.lopez', 'email': 'carlos.lopez@empresa.com', 'first_name': 'Carlos', 'last_name': 'López'},
            {'username': 'ana.martinez', 'email': 'ana.martinez@empresa.com', 'first_name': 'Ana', 'last_name': 'Martínez'},
            {'username': 'david.rodriguez', 'email': 'david.rodriguez@empresa.com', 'first_name': 'David', 'last_name': 'Rodríguez'},
            {'username': 'laura.sanchez', 'email': 'laura.sanchez@empresa.com', 'first_name': 'Laura', 'last_name': 'Sánchez'},
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
            users.append(user)
            self.stdout.write(f'✅ Usuario creado: {user.first_name} {user.last_name}')

        # Crear proyectos
        projects_data = [
            {
                'name': 'Sistema CRM Avanzado',
                'description': 'Desarrollo de un sistema CRM completo con funcionalidades de gestión de clientes, ventas y marketing automatizado.',
                'created_at': timezone.now() - timedelta(days=60)
            },
            {
                'name': 'Dashboard Analytics Empresarial',
                'description': 'Plataforma de análisis de datos en tiempo real con visualizaciones interactivas y reportes automatizados.',
                'created_at': timezone.now() - timedelta(days=45)
            },
            {
                'name': 'App Móvil E-commerce',
                'description': 'Aplicación móvil nativa para comercio electrónico con integración de pagos y gestión de inventario.',
                'created_at': timezone.now() - timedelta(days=30)
            },
            {
                'name': 'Sistema de Gestión Documental',
                'description': 'Plataforma para gestión, almacenamiento y búsqueda de documentos corporativos con control de versiones.',
                'created_at': timezone.now() - timedelta(days=25)
            },
            {
                'name': 'API de Integración Financiera',
                'description': 'API REST para integración con sistemas bancarios y procesamiento de transacciones financieras.',
                'created_at': timezone.now() - timedelta(days=20)
            },
            {
                'name': 'Portal de Recursos Humanos',
                'description': 'Sistema web para gestión de empleados, nóminas, vacaciones y evaluación de desempeño.',
                'created_at': timezone.now() - timedelta(days=15)
            },
            {
                'name': 'Sistema de Monitoreo IoT',
                'description': 'Plataforma para monitoreo de dispositivos IoT con alertas en tiempo real y análisis predictivo.',
                'created_at': timezone.now() - timedelta(days=10)
            },
            {
                'name': 'Plataforma de E-learning',
                'description': 'Sistema de aprendizaje en línea con cursos interactivos, evaluaciones y certificaciones.',
                'created_at': timezone.now() - timedelta(days=5)
            }
        ]
        
        projects = []
        for project_data in projects_data:
            # Asignar un owner aleatorio a cada proyecto
            project_data['owner'] = random.choice(users)
            project, created = Project.objects.get_or_create(
                name=project_data['name'],
                defaults=project_data
            )
            projects.append(project)
            self.stdout.write(f'✅ Proyecto creado: {project.name} (Owner: {project.owner.first_name})')

        # Crear tareas con diferentes estados y progresos
        tasks_data = [
            # Sistema CRM Avanzado - 80% completado
            {'title': 'Diseño de base de datos', 'project': 0, 'assignee': 0, 'priority': 'high', 'completed': True, 'days_ago': 50, 'due_days': 45},
            {'title': 'Implementar autenticación', 'project': 0, 'assignee': 1, 'priority': 'high', 'completed': True, 'days_ago': 45, 'due_days': 40},
            {'title': 'API de gestión de clientes', 'project': 0, 'assignee': 0, 'priority': 'high', 'completed': True, 'days_ago': 40, 'due_days': 35},
            {'title': 'Interfaz de usuario principal', 'project': 0, 'assignee': 2, 'priority': 'medium', 'completed': True, 'days_ago': 35, 'due_days': 30},
            {'title': 'Módulo de ventas', 'project': 0, 'assignee': 1, 'priority': 'high', 'completed': True, 'days_ago': 30, 'due_days': 25},
            {'title': 'Sistema de notificaciones', 'project': 0, 'assignee': 3, 'priority': 'medium', 'completed': False, 'days_ago': 25, 'due_days': 20},
            {'title': 'Reportes y analytics', 'project': 0, 'assignee': 4, 'priority': 'low', 'completed': False, 'days_ago': 20, 'due_days': 15},
            
            # Dashboard Analytics Empresarial - 100% completado
            {'title': 'Configuración de servidor', 'project': 1, 'assignee': 0, 'priority': 'high', 'completed': True, 'days_ago': 40, 'due_days': 35},
            {'title': 'Integración con APIs externas', 'project': 1, 'assignee': 1, 'priority': 'high', 'completed': True, 'days_ago': 35, 'due_days': 30},
            {'title': 'Dashboard principal', 'project': 1, 'assignee': 2, 'priority': 'high', 'completed': True, 'days_ago': 30, 'due_days': 25},
            {'title': 'Gráficos interactivos', 'project': 1, 'assignee': 4, 'priority': 'medium', 'completed': True, 'days_ago': 25, 'due_days': 20},
            {'title': 'Sistema de alertas', 'project': 1, 'assignee': 3, 'priority': 'medium', 'completed': True, 'days_ago': 20, 'due_days': 15},
            {'title': 'Exportación de datos', 'project': 1, 'assignee': 0, 'priority': 'low', 'completed': True, 'days_ago': 15, 'due_days': 10},
            
            # App Móvil E-commerce - 60% completado
            {'title': 'Diseño de UI/UX', 'project': 2, 'assignee': 2, 'priority': 'high', 'completed': True, 'days_ago': 25, 'due_days': 20},
            {'title': 'Configuración React Native', 'project': 2, 'assignee': 1, 'priority': 'high', 'completed': True, 'days_ago': 20, 'due_days': 15},
            {'title': 'Pantalla de productos', 'project': 2, 'assignee': 4, 'priority': 'high', 'completed': True, 'days_ago': 15, 'due_days': 10},
            {'title': 'Carrito de compras', 'project': 2, 'assignee': 3, 'priority': 'high', 'completed': False, 'days_ago': 10, 'due_days': 5},
            {'title': 'Integración de pagos', 'project': 2, 'assignee': 0, 'priority': 'high', 'completed': False, 'days_ago': 5, 'due_days': 0},
            {'title': 'Push notifications', 'project': 2, 'assignee': 3, 'priority': 'medium', 'completed': False, 'days_ago': 3, 'due_days': 2},
            
            # Sistema de Gestión Documental - 40% completado
            {'title': 'Arquitectura de microservicios', 'project': 3, 'assignee': 0, 'priority': 'high', 'completed': True, 'days_ago': 20, 'due_days': 15},
            {'title': 'API de documentos', 'project': 3, 'assignee': 1, 'priority': 'high', 'completed': True, 'days_ago': 15, 'due_days': 10},
            {'title': 'Sistema de búsqueda', 'project': 3, 'assignee': 4, 'priority': 'medium', 'completed': False, 'days_ago': 10, 'due_days': 5},
            {'title': 'Control de acceso', 'project': 3, 'assignee': 2, 'priority': 'high', 'completed': False, 'days_ago': 5, 'due_days': 0},
            {'title': 'Interfaz web', 'project': 3, 'assignee': 2, 'priority': 'medium', 'completed': False, 'days_ago': 3, 'due_days': 2},
            
            # API de Integración Financiera - 50% completado
            {'title': 'Análisis de seguridad', 'project': 4, 'assignee': 0, 'priority': 'high', 'completed': True, 'days_ago': 15, 'due_days': 10},
            {'title': 'Integración bancaria', 'project': 4, 'assignee': 1, 'priority': 'high', 'completed': True, 'days_ago': 10, 'due_days': 5},
            {'title': 'Validación de transacciones', 'project': 4, 'assignee': 3, 'priority': 'high', 'completed': False, 'days_ago': 5, 'due_days': 0},
            {'title': 'Documentación API', 'project': 4, 'assignee': 4, 'priority': 'medium', 'completed': False, 'days_ago': 3, 'due_days': 2},
            
            # Portal de Recursos Humanos - 25% completado
            {'title': 'Diseño de base de datos RRHH', 'project': 5, 'assignee': 0, 'priority': 'high', 'completed': True, 'days_ago': 10, 'due_days': 5},
            {'title': 'Módulo de nóminas', 'project': 5, 'assignee': 1, 'priority': 'high', 'completed': False, 'days_ago': 5, 'due_days': 0},
            {'title': 'Gestión de vacaciones', 'project': 5, 'assignee': 2, 'priority': 'medium', 'completed': False, 'days_ago': 3, 'due_days': 2},
            {'title': 'Evaluación de desempeño', 'project': 5, 'assignee': 3, 'priority': 'low', 'completed': False, 'days_ago': 2, 'due_days': 1},
            
            # Sistema de Monitoreo IoT - 25% completado
            {'title': 'Configuración IoT', 'project': 6, 'assignee': 0, 'priority': 'high', 'completed': True, 'days_ago': 8, 'due_days': 3},
            {'title': 'Dashboard de monitoreo', 'project': 6, 'assignee': 2, 'priority': 'high', 'completed': False, 'days_ago': 5, 'due_days': 0},
            {'title': 'Sistema de alertas', 'project': 6, 'assignee': 3, 'priority': 'medium', 'completed': False, 'days_ago': 3, 'due_days': 2},
            {'title': 'Análisis predictivo', 'project': 6, 'assignee': 4, 'priority': 'low', 'completed': False, 'days_ago': 2, 'due_days': 1},
            
            # Plataforma de E-learning - 25% completado
            {'title': 'Diseño de cursos', 'project': 7, 'assignee': 2, 'priority': 'high', 'completed': True, 'days_ago': 4, 'due_days': 1},
            {'title': 'Sistema de usuarios', 'project': 7, 'assignee': 1, 'priority': 'high', 'completed': False, 'days_ago': 2, 'due_days': 0},
            {'title': 'Reproductor de video', 'project': 7, 'assignee': 4, 'priority': 'medium', 'completed': False, 'days_ago': 1, 'due_days': 1},
            {'title': 'Sistema de evaluaciones', 'project': 7, 'assignee': 3, 'priority': 'medium', 'completed': False, 'days_ago': 1, 'due_days': 1},
        ]
        
        for task_data in tasks_data:
            created_at = timezone.now() - timedelta(days=task_data['days_ago'])
            due_date = timezone.now() - timedelta(days=task_data['due_days'])
            
            task = Task.objects.create(
                title=task_data['title'],
                description=f"Descripción detallada para {task_data['title']}",
                project=projects[task_data['project']],
                assignee=users[task_data['assignee']],
                priority=task_data['priority'],
                completed=task_data['completed'],
                created_at=created_at,
                due_date=due_date
            )
            self.stdout.write(f'✅ Tarea creada: {task.title} ({task.project.name})')

        self.stdout.write('\n🎉 ¡Datos realistas creados exitosamente!')
        self.stdout.write(f'📊 Resumen:')
        self.stdout.write(f'   - {User.objects.count()} usuarios')
        self.stdout.write(f'   - {Project.objects.count()} proyectos')
        self.stdout.write(f'   - {Task.objects.count()} tareas')
        self.stdout.write(f'   - {Task.objects.filter(completed=True).count()} tareas completadas')
        self.stdout.write(f'   - {Task.objects.filter(completed=False).count()} tareas pendientes')
