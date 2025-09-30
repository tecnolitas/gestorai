from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from projects.models import Project
from tasks.models import Task
from datetime import datetime, timedelta
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Actualizar datos del usuario administrador con proyectos y tareas'

    def handle(self, *args, **options):
        # Buscar o crear el usuario administrador
        admin_user, created = User.objects.get_or_create(
            email='admin@empresa.com',
            defaults={
                'username': 'admin',
                'first_name': 'Administrador',
                'last_name': 'Sistema',
                'is_superuser': True,
                'is_staff': True,
                'is_active': True,
            }
        )
        
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS(f'✅ Usuario administrador creado: {admin_user.email}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'✅ Usuario administrador encontrado: {admin_user.email}'))
        
        # Crear proyectos adicionales para el administrador
        admin_projects = [
            {
                'name': 'Sistema de Gestión Empresarial',
                'description': 'Plataforma integral para la gestión de recursos humanos, finanzas y operaciones empresariales con dashboard ejecutivo y reportes avanzados.'
            },
            {
                'name': 'Portal de Clientes Corporativo',
                'description': 'Sistema web para gestión de clientes corporativos con portal de autoservicio, seguimiento de casos y facturación automatizada.'
            },
            {
                'name': 'Plataforma de Análisis de Datos',
                'description': 'Herramienta de business intelligence con visualizaciones interactivas, machine learning y reportes predictivos para toma de decisiones.'
            },
            {
                'name': 'Sistema de Gestión de Proyectos Avanzado',
                'description': 'Plataforma completa de gestión de proyectos con metodologías ágiles, seguimiento de tiempo, recursos y colaboración en equipo.'
            },
            {
                'name': 'API de Integración Empresarial',
                'description': 'API REST para integración con sistemas externos, webhooks, sincronización de datos y automatización de procesos empresariales.'
            }
        ]
        
        created_projects = []
        for project_data in admin_projects:
            project, created = Project.objects.get_or_create(
                name=project_data['name'],
                owner=admin_user,
                defaults={
                    'description': project_data['description'],
                    'created_at': datetime.now() - timedelta(days=random.randint(1, 30))
                }
            )
            if created:
                created_projects.append(project)
                self.stdout.write(self.style.SUCCESS(f'✅ Proyecto creado: {project.name}'))
            else:
                created_projects.append(project)
                self.stdout.write(self.style.SUCCESS(f'✅ Proyecto existente: {project.name}'))
        
        # Crear tareas para los proyectos del administrador
        task_templates = [
            # Tareas completadas
            {
                'title': 'Configurar infraestructura base',
                'description': 'Configurar servidores, base de datos y servicios de infraestructura necesarios para el proyecto.',
                'completed': True,
                'priority': 'high'
            },
            {
                'title': 'Diseñar arquitectura del sistema',
                'description': 'Crear la arquitectura técnica del sistema con diagramas y documentación detallada.',
                'completed': True,
                'priority': 'high'
            },
            {
                'title': 'Implementar autenticación y autorización',
                'description': 'Sistema de autenticación seguro con roles y permisos granulares.',
                'completed': True,
                'priority': 'high'
            },
            {
                'title': 'Crear API REST principal',
                'description': 'Desarrollar endpoints principales de la API con documentación OpenAPI.',
                'completed': True,
                'priority': 'medium'
            },
            {
                'title': 'Implementar dashboard principal',
                'description': 'Crear dashboard con métricas clave y visualizaciones interactivas.',
                'completed': True,
                'priority': 'medium'
            },
            # Tareas pendientes
            {
                'title': 'Optimizar rendimiento de consultas',
                'description': 'Optimizar consultas de base de datos y implementar índices para mejorar el rendimiento.',
                'completed': False,
                'priority': 'high'
            },
            {
                'title': 'Implementar sistema de notificaciones',
                'description': 'Sistema de notificaciones en tiempo real con email, SMS y push notifications.',
                'completed': False,
                'priority': 'medium'
            },
            {
                'title': 'Crear tests de integración',
                'description': 'Desarrollar suite completa de tests de integración para validar funcionalidades.',
                'completed': False,
                'priority': 'medium'
            },
            {
                'title': 'Implementar backup automático',
                'description': 'Sistema de respaldo automático de datos con recuperación ante desastres.',
                'completed': False,
                'priority': 'high'
            },
            {
                'title': 'Documentar API y procesos',
                'description': 'Crear documentación completa de la API y procesos de despliegue.',
                'completed': False,
                'priority': 'low'
            },
            {
                'title': 'Configurar monitoreo y alertas',
                'description': 'Implementar sistema de monitoreo con alertas automáticas y métricas de rendimiento.',
                'completed': False,
                'priority': 'medium'
            },
            {
                'title': 'Implementar auditoría de seguridad',
                'description': 'Sistema de auditoría de seguridad con logs detallados y análisis de vulnerabilidades.',
                'completed': False,
                'priority': 'high'
            }
        ]
        
        # Asignar tareas a proyectos del administrador
        for project in created_projects:
            # Seleccionar tareas aleatorias para cada proyecto
            selected_tasks = random.sample(task_templates, random.randint(3, 6))
            
            for task_data in selected_tasks:
                due_date = datetime.now() + timedelta(days=random.randint(1, 30))
                
                task, created = Task.objects.get_or_create(
                    title=task_data['title'],
                    project=project,
                    assignee=admin_user,
                    defaults={
                        'description': task_data['description'],
                        'completed': task_data['completed'],
                        'priority': task_data['priority'],
                        'due_date': due_date,
                        'created_at': datetime.now() - timedelta(days=random.randint(1, 15))
                    }
                )
                
                if created:
                    self.stdout.write(self.style.SUCCESS(f'✅ Tarea creada: {task.title} en {project.name}'))
        
        # Mostrar estadísticas
        total_projects = Project.objects.filter(owner=admin_user).count()
        total_tasks = Task.objects.filter(assignee=admin_user).count()
        completed_tasks = Task.objects.filter(assignee=admin_user, completed=True).count()
        
        self.stdout.write(self.style.SUCCESS(f'\n📊 Estadísticas del usuario administrador:'))
        self.stdout.write(self.style.SUCCESS(f'   Proyectos: {total_projects}'))
        self.stdout.write(self.style.SUCCESS(f'   Tareas totales: {total_tasks}'))
        self.stdout.write(self.style.SUCCESS(f'   Tareas completadas: {completed_tasks}'))
        self.stdout.write(self.style.SUCCESS(f'   Tareas pendientes: {total_tasks - completed_tasks}'))
        self.stdout.write(self.style.SUCCESS(f'   Progreso: {(completed_tasks/total_tasks*100):.1f}%' if total_tasks > 0 else '   Progreso: 0%'))
