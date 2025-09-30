from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.db import transaction
from django.contrib.auth import get_user_model
from users.models import CustomUser
from projects.models import Project
from tasks.models import Task, Comment, TaskHistory
import os

User = get_user_model()

class Command(BaseCommand):
    help = 'Carga datos de prueba para el sistema de gestión de proyectos'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Limpiar todos los datos existentes antes de cargar',
        )
        parser.add_argument(
            '--users-only',
            action='store_true',
            help='Cargar solo usuarios de prueba',
        )
        parser.add_argument(
            '--projects-only',
            action='store_true',
            help='Cargar solo proyectos de prueba',
        )
        parser.add_argument(
            '--tasks-only',
            action='store_true',
            help='Cargar solo tareas de prueba',
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('🚀 Iniciando carga de datos de prueba...')
        )

        if options['clear']:
            self.clear_data()

        if options['users_only']:
            self.load_users()
        elif options['projects_only']:
            self.load_projects()
        elif options['tasks_only']:
            self.load_tasks()
        else:
            # Cargar todo
            self.load_users()
            self.load_projects()
            self.load_tasks()

        self.stdout.write(
            self.style.SUCCESS('✅ Datos de prueba cargados exitosamente!')
        )

    def clear_data(self):
        """Limpiar todos los datos existentes"""
        self.stdout.write('🧹 Limpiando datos existentes...')
        
        with transaction.atomic():
            TaskHistory.objects.all().delete()
            Comment.objects.all().delete()
            Task.objects.all().delete()
            Project.objects.all().delete()
            # No eliminar usuarios para evitar problemas con el superuser
            
        self.stdout.write(
            self.style.SUCCESS('✅ Datos limpiados exitosamente')
        )

    def load_users(self):
        """Cargar usuarios de prueba"""
        self.stdout.write('👥 Cargando usuarios de prueba...')
        
        try:
            call_command('loaddata', 'fixtures/users.json', verbosity=0)
            self.stdout.write(
                self.style.SUCCESS('✅ Usuarios cargados exitosamente')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error cargando usuarios: {e}')
            )

    def load_projects(self):
        """Cargar proyectos de prueba"""
        self.stdout.write('📁 Cargando proyectos de prueba...')
        
        try:
            call_command('loaddata', 'fixtures/projects.json', verbosity=0)
            self.stdout.write(
                self.style.SUCCESS('✅ Proyectos cargados exitosamente')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error cargando proyectos: {e}')
            )

    def load_tasks(self):
        """Cargar tareas, comentarios e historial de prueba"""
        self.stdout.write('📋 Cargando tareas de prueba...')
        
        try:
            call_command('loaddata', 'fixtures/tasks.json', verbosity=0)
            self.stdout.write(
                self.style.SUCCESS('✅ Tareas cargadas exitosamente')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error cargando tareas: {e}')
            )

        self.stdout.write('💬 Cargando comentarios de prueba...')
        
        try:
            call_command('loaddata', 'fixtures/comments.json', verbosity=0)
            self.stdout.write(
                self.style.SUCCESS('✅ Comentarios cargados exitosamente')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error cargando comentarios: {e}')
            )

        self.stdout.write('📊 Cargando historial de cambios...')
        
        try:
            call_command('loaddata', 'fixtures/task_history.json', verbosity=0)
            self.stdout.write(
                self.style.SUCCESS('✅ Historial cargado exitosamente')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error cargando historial: {e}')
            )

    def show_summary(self):
        """Mostrar resumen de datos cargados"""
        user_count = User.objects.count()
        project_count = Project.objects.count()
        task_count = Task.objects.count()
        comment_count = Comment.objects.count()
        history_count = TaskHistory.objects.count()

        self.stdout.write('\n📊 Resumen de datos cargados:')
        self.stdout.write(f'   👥 Usuarios: {user_count}')
        self.stdout.write(f'   📁 Proyectos: {project_count}')
        self.stdout.write(f'   📋 Tareas: {task_count}')
        self.stdout.write(f'   💬 Comentarios: {comment_count}')
        self.stdout.write(f'   📊 Historial: {history_count}') 