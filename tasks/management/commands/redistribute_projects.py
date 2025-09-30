from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from projects.models import Project
from tasks.models import Task
from datetime import datetime, timedelta
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Redistribuir proyectos entre usuarios manteniendo algunos para el administrador'

    def handle(self, *args, **options):
        # Obtener todos los usuarios
        users = User.objects.filter(is_active=True)
        admin_user = User.objects.get(email='admin@empresa.com')
        
        self.stdout.write(self.style.SUCCESS(f'👤 Usuarios encontrados: {users.count()}'))
        
        # Proyectos que debe mantener el administrador (proyectos de gestión/supervisión)
        admin_projects = [
            'Sistema de Gestión Empresarial',
            'Portal de Clientes Corporativo', 
            'Plataforma de Análisis de Datos',
            'Sistema de Gestión de Proyectos Avanzado',
            'API de Integración Empresarial'
        ]
        
        # Redistribuir proyectos
        all_projects = Project.objects.all()
        redistributed = 0
        
        for project in all_projects:
            if project.name in admin_projects:
                # Mantener estos proyectos para el administrador
                self.stdout.write(self.style.SUCCESS(f'✅ Manteniendo proyecto del admin: {project.name}'))
                continue
            else:
                # Redistribuir a otros usuarios
                new_owner = random.choice([u for u in users if u != admin_user])
                old_owner = project.owner
                project.owner = new_owner
                project.save()
                redistributed += 1
                self.stdout.write(self.style.SUCCESS(f'🔄 Redistribuido: {project.name} de {old_owner.email} → {new_owner.email}'))
        
        # Crear algunos proyectos adicionales para el administrador (proyectos de supervisión)
        admin_supervision_projects = [
            {
                'name': 'Dashboard de Supervisión Global',
                'description': 'Panel de control para supervisar todos los proyectos y tareas de la plataforma con métricas en tiempo real.'
            },
            {
                'name': 'Sistema de Reportes Ejecutivos',
                'description': 'Generación automática de reportes ejecutivos con análisis de rendimiento y productividad de equipos.'
            }
        ]
        
        for project_data in admin_supervision_projects:
            project, created = Project.objects.get_or_create(
                name=project_data['name'],
                owner=admin_user,
                defaults={
                    'description': project_data['description'],
                    'created_at': datetime.now() - timedelta(days=random.randint(1, 15))
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'✅ Proyecto de supervisión creado: {project.name}'))
        
        # Redistribuir tareas también
        all_tasks = Task.objects.all()
        task_redistributed = 0
        
        for task in all_tasks:
            # Si la tarea pertenece a un proyecto del admin, mantenerla
            if task.project.owner == admin_user and task.project.name in admin_projects:
                continue
            # Si la tarea pertenece a un proyecto redistribuido, asignarla al nuevo propietario del proyecto
            elif task.project.owner != admin_user:
                task.assignee = task.project.owner
                task.save()
                task_redistributed += 1
            # Si la tarea está asignada al admin pero no es de sus proyectos, redistribuirla
            elif task.assignee == admin_user and task.project.owner != admin_user:
                task.assignee = task.project.owner
                task.save()
                task_redistributed += 1
        
        # Crear algunas tareas específicas para el administrador
        admin_tasks = [
            {
                'title': 'Revisar métricas globales de productividad',
                'description': 'Analizar el rendimiento general de todos los equipos y proyectos de la plataforma.',
                'completed': True,
                'priority': 'high'
            },
            {
                'title': 'Generar reporte mensual ejecutivo',
                'description': 'Crear reporte consolidado con estadísticas de todos los proyectos y equipos.',
                'completed': False,
                'priority': 'high'
            },
            {
                'title': 'Auditar seguridad de la plataforma',
                'description': 'Revisar configuraciones de seguridad y permisos de usuarios.',
                'completed': False,
                'priority': 'medium'
            }
        ]
        
        # Asignar tareas del admin a sus proyectos de supervisión
        admin_supervision_projects_objs = Project.objects.filter(owner=admin_user, name__in=[p['name'] for p in admin_supervision_projects])
        
        for task_data in admin_tasks:
            if admin_supervision_projects_objs.exists():
                project = admin_supervision_projects_objs.first()
                task, created = Task.objects.get_or_create(
                    title=task_data['title'],
                    project=project,
                    assignee=admin_user,
                    defaults={
                        'description': task_data['description'],
                        'completed': task_data['completed'],
                        'priority': task_data['priority'],
                        'due_date': datetime.now() + timedelta(days=random.randint(1, 30)),
                        'created_at': datetime.now() - timedelta(days=random.randint(1, 10))
                    }
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f'✅ Tarea de supervisión creada: {task.title}'))
        
        # Mostrar estadísticas finales
        admin_projects_count = Project.objects.filter(owner=admin_user).count()
        admin_tasks_count = Task.objects.filter(assignee=admin_user).count()
        total_projects = Project.objects.count()
        total_tasks = Task.objects.count()
        
        self.stdout.write(self.style.SUCCESS(f'\n📊 ESTADÍSTICAS FINALES:'))
        self.stdout.write(self.style.SUCCESS(f'   Proyectos redistribuidos: {redistributed}'))
        self.stdout.write(self.style.SUCCESS(f'   Tareas redistribuidas: {task_redistributed}'))
        self.stdout.write(self.style.SUCCESS(f'   Proyectos del admin: {admin_projects_count}'))
        self.stdout.write(self.style.SUCCESS(f'   Tareas del admin: {admin_tasks_count}'))
        self.stdout.write(self.style.SUCCESS(f'   Total proyectos: {total_projects}'))
        self.stdout.write(self.style.SUCCESS(f'   Total tareas: {total_tasks}'))
        
        self.stdout.write(self.style.SUCCESS(f'\n✅ Redistribución completada!'))
        self.stdout.write(self.style.SUCCESS(f'   El administrador puede VER todos los proyectos y tareas'))
        self.stdout.write(self.style.SUCCESS(f'   Pero solo tiene asignados {admin_projects_count} proyectos y {admin_tasks_count} tareas'))
