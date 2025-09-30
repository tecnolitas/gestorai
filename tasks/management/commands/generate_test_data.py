from django.core.management.base import BaseCommand
from django.db import transaction
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import random
from faker import Faker

from users.models import CustomUser
from projects.models import Project
from tasks.models import Task, Comment, TaskHistory

User = get_user_model()
fake = Faker(['es_ES'])

class Command(BaseCommand):
    help = 'Genera datos de prueba adicionales de forma dinámica'

    def add_arguments(self, parser):
        parser.add_argument(
            '--users',
            type=int,
            default=5,
            help='Número de usuarios adicionales a generar (default: 5)',
        )
        parser.add_argument(
            '--projects',
            type=int,
            default=10,
            help='Número de proyectos adicionales a generar (default: 10)',
        )
        parser.add_argument(
            '--tasks',
            type=int,
            default=50,
            help='Número de tareas adicionales a generar (default: 50)',
        )
        parser.add_argument(
            '--comments',
            type=int,
            default=100,
            help='Número de comentarios adicionales a generar (default: 100)',
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('🚀 Generando datos de prueba adicionales...')
        )

        with transaction.atomic():
            self.generate_users(options['users'])
            self.generate_projects(options['projects'])
            self.generate_tasks(options['tasks'])
            self.generate_comments(options['comments'])

        self.show_summary()
        self.stdout.write(
            self.style.SUCCESS('✅ Datos adicionales generados exitosamente!')
        )

    def generate_users(self, count):
        """Generar usuarios adicionales"""
        self.stdout.write(f'👥 Generando {count} usuarios adicionales...')
        
        for i in range(count):
            username = fake.user_name()
            first_name = fake.first_name()
            last_name = fake.last_name()
            email = fake.email()
            
            user = User.objects.create_user(
                username=username,
                first_name=first_name,
                last_name=last_name,
                email=email,
                password='test123'
            )
            
        self.stdout.write(
            self.style.SUCCESS(f'✅ {count} usuarios generados')
        )

    def generate_projects(self, count):
        """Generar proyectos adicionales"""
        self.stdout.write(f'📁 Generando {count} proyectos adicionales...')
        
        users = list(User.objects.all())
        if not users:
            self.stdout.write(
                self.style.ERROR('❌ No hay usuarios disponibles para asignar proyectos')
            )
            return

        project_types = [
            'Sistema de Gestión',
            'Aplicación Web',
            'App Móvil',
            'API REST',
            'Dashboard Analytics',
            'Sistema de Reportes',
            'Plataforma E-learning',
            'Sistema de Inventario',
            'CRM',
            'Sistema de Facturación'
        ]

        for i in range(count):
            project_type = random.choice(project_types)
            name = f"{project_type} - {fake.company()}"
            description = fake.text(max_nb_chars=200)
            owner = random.choice(users)
            
            # Fecha de creación aleatoria en los últimos 6 meses
            created_at = timezone.now() - timedelta(
                days=random.randint(0, 180)
            )
            
            project = Project.objects.create(
                name=name,
                description=description,
                owner=owner,
                created_at=created_at,
                updated_at=created_at
            )
            
        self.stdout.write(
            self.style.SUCCESS(f'✅ {count} proyectos generados')
        )

    def generate_tasks(self, count):
        """Generar tareas adicionales"""
        self.stdout.write(f'📋 Generando {count} tareas adicionales...')
        
        users = list(User.objects.all())
        projects = list(Project.objects.all())
        
        if not users or not projects:
            self.stdout.write(
                self.style.ERROR('❌ No hay usuarios o proyectos disponibles')
            )
            return

        task_templates = [
            'Implementar {feature}',
            'Configurar {feature}',
            'Diseñar {feature}',
            'Optimizar {feature}',
            'Crear {feature}',
            'Integrar {feature}',
            'Desarrollar {feature}',
            'Probar {feature}',
            'Documentar {feature}',
            'Refactorizar {feature}'
        ]

        features = [
            'autenticación',
            'base de datos',
            'API REST',
            'interfaz de usuario',
            'sistema de pagos',
            'notificaciones',
            'reportes',
            'dashboard',
            'filtros avanzados',
            'exportación de datos'
        ]

        priorities = ['low', 'medium', 'high']
        completed_probability = 0.3  # 30% de probabilidad de estar completada

        for i in range(count):
            template = random.choice(task_templates)
            feature = random.choice(features)
            title = template.format(feature=feature)
            description = fake.text(max_nb_chars=150)
            priority = random.choice(priorities)
            project = random.choice(projects)
            assignee = random.choice(users)
            completed = random.random() < completed_probability
            
            # Fecha de creación aleatoria
            created_at = timezone.now() - timedelta(
                days=random.randint(0, 90)
            )
            
            # Fecha límite aleatoria (entre creación y 30 días después)
            due_date = created_at + timedelta(
                days=random.randint(1, 30)
            )
            
            task = Task.objects.create(
                title=title,
                description=description,
                priority=priority,
                project=project,
                assignee=assignee,
                completed=completed,
                created_at=created_at,
                due_date=due_date
            )
            
        self.stdout.write(
            self.style.SUCCESS(f'✅ {count} tareas generadas')
        )

    def generate_comments(self, count):
        """Generar comentarios adicionales"""
        self.stdout.write(f'💬 Generando {count} comentarios adicionales...')
        
        users = list(User.objects.all())
        tasks = list(Task.objects.all())
        
        if not users or not tasks:
            self.stdout.write(
                self.style.ERROR('❌ No hay usuarios o tareas disponibles')
            )
            return

        comment_templates = [
            'He completado {task}. ¿Puedes revisarlo?',
            'Empezando con {task}. Espero terminarlo pronto.',
            'Necesito ayuda con {task}. ¿Alguien puede asistirme?',
            'Progreso en {task}: {progress}% completado.',
            'Encontré un bug en {task}. Voy a investigarlo.',
            'Actualización sobre {task}: {update}',
            '¿Alguien más está trabajando en {task}?',
            'Revisión de {task} completada. Todo se ve bien.',
            'Cambios en {task}: {changes}',
            'Documentación de {task} actualizada.'
        ]

        for i in range(count):
            task = random.choice(tasks)
            user = random.choice(users)
            template = random.choice(comment_templates)
            
            # Generar contenido más específico
            if '{task}' in template:
                content = template.format(
                    task=task.title.lower(),
                    progress=random.randint(10, 90),
                    update=fake.sentence(),
                    changes=fake.sentence()
                )
            else:
                content = fake.text(max_nb_chars=100)
            
            # Fecha de comentario después de la creación de la tarea
            comment_date = task.created_at + timedelta(
                days=random.randint(0, 30)
            )
            
            comment = Comment.objects.create(
                task=task,
                user=user,
                content=content,
                created_at=comment_date,
                updated_at=comment_date
            )
            
        self.stdout.write(
            self.style.SUCCESS(f'✅ {count} comentarios generados')
        )

    def show_summary(self):
        """Mostrar resumen de datos generados"""
        user_count = User.objects.count()
        project_count = Project.objects.count()
        task_count = Task.objects.count()
        comment_count = Comment.objects.count()

        self.stdout.write('\n📊 Resumen total de datos:')
        self.stdout.write(f'   👥 Usuarios: {user_count}')
        self.stdout.write(f'   📁 Proyectos: {project_count}')
        self.stdout.write(f'   📋 Tareas: {task_count}')
        self.stdout.write(f'   💬 Comentarios: {comment_count}') 