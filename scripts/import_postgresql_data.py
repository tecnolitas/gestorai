#!/usr/bin/env python
"""
Script para importar datos exportados de SQLite a PostgreSQL
"""

import os
import sys
import django
import json
from datetime import datetime

# Configurar Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import CustomUser
from projects.models import Project
from tasks.models import Task, Comment, TaskHistory

def import_data(export_timestamp):
    """Importar datos desde archivos JSON a PostgreSQL"""
    
    print(f"🔄 Iniciando importación de datos a PostgreSQL...")
    print(f"📅 Timestamp de exportación: {export_timestamp}")
    
    export_dir = "fixtures/export"
    
    # Verificar que existen los archivos de exportación
    required_files = [
        f"users_{export_timestamp}.json",
        f"projects_{export_timestamp}.json",
        f"tasks_{export_timestamp}.json",
        f"comments_{export_timestamp}.json",
        f"task_history_{export_timestamp}.json",
    ]
    
    for file in required_files:
        file_path = os.path.join(export_dir, file)
        if not os.path.exists(file_path):
            print(f"❌ Error: No se encontró el archivo {file}")
            return False
    
    try:
        # Importar usuarios
        print("📥 Importando usuarios...")
        with open(os.path.join(export_dir, f"users_{export_timestamp}.json"), 'r', encoding='utf-8') as f:
            users_data = json.load(f)
        
        user_count = 0
        for user_data in users_data:
            # Evitar duplicar el superusuario admin
            if user_data['username'] == 'admin' and CustomUser.objects.filter(username='admin').exists():
                print("⚠️  Usuario admin ya existe, saltando...")
                continue
                
            user, created = CustomUser.objects.get_or_create(
                username=user_data['username'],
                defaults={
                    'email': user_data['email'],
                    'first_name': user_data['first_name'],
                    'last_name': user_data['last_name'],
                    'is_active': user_data['is_active'],
                    'is_staff': user_data['is_staff'],
                    'is_superuser': user_data['is_superuser'],
                }
            )
            if created:
                user_count += 1
                # Establecer contraseña por defecto
                user.set_password('admin123')
                user.save()
        
        print(f"✅ Importados {user_count} usuarios nuevos")
        
        # Importar proyectos
        print("📥 Importando proyectos...")
        with open(os.path.join(export_dir, f"projects_{export_timestamp}.json"), 'r', encoding='utf-8') as f:
            projects_data = json.load(f)
        
        project_count = 0
        for project_data in projects_data:
            # Buscar el owner por ID original
            try:
                owner = CustomUser.objects.get(id=project_data['owner_id'])
                project, created = Project.objects.get_or_create(
                    name=project_data['name'],
                    defaults={
                        'description': project_data['description'],
                        'owner': owner,
                    }
                )
                if created:
                    project_count += 1
            except CustomUser.DoesNotExist:
                print(f"⚠️  Usuario con ID {project_data['owner_id']} no encontrado, saltando proyecto {project_data['name']}")
        
        print(f"✅ Importados {project_count} proyectos nuevos")
        
        # Importar tareas
        print("📥 Importando tareas...")
        with open(os.path.join(export_dir, f"tasks_{export_timestamp}.json"), 'r', encoding='utf-8') as f:
            tasks_data = json.load(f)
        
        task_count = 0
        for task_data in tasks_data:
            try:
                project = Project.objects.get(id=task_data['project_id'])
                assignee = CustomUser.objects.get(id=task_data['assignee_id']) if task_data['assignee_id'] else None
                
                task, created = Task.objects.get_or_create(
                    title=task_data['title'],
                    project=project,
                    defaults={
                        'description': task_data['description'],
                        'completed': task_data['completed'],
                        'priority': task_data['priority'],
                        'assignee': assignee,
                    }
                )
                if created:
                    task_count += 1
            except (Project.DoesNotExist, CustomUser.DoesNotExist) as e:
                print(f"⚠️  Error importando tarea {task_data['title']}: {e}")
        
        print(f"✅ Importadas {task_count} tareas nuevas")
        
        # Importar comentarios
        print("📥 Importando comentarios...")
        with open(os.path.join(export_dir, f"comments_{export_timestamp}.json"), 'r', encoding='utf-8') as f:
            comments_data = json.load(f)
        
        comment_count = 0
        for comment_data in comments_data:
            try:
                task = Task.objects.get(id=comment_data['task_id'])
                user = CustomUser.objects.get(id=comment_data['user_id'])
                
                comment, created = Comment.objects.get_or_create(
                    task=task,
                    content=comment_data['content'],
                    user=user,
                    defaults={
                        'created_at': comment_data['created_at'],
                    }
                )
                if created:
                    comment_count += 1
            except (Task.DoesNotExist, CustomUser.DoesNotExist) as e:
                print(f"⚠️  Error importando comentario: {e}")
        
        print(f"✅ Importados {comment_count} comentarios nuevos")
        
        # Importar historial de tareas
        print("📥 Importando historial de tareas...")
        with open(os.path.join(export_dir, f"task_history_{export_timestamp}.json"), 'r', encoding='utf-8') as f:
            task_history_data = json.load(f)
        
        history_count = 0
        for history_data in task_history_data:
            try:
                task = Task.objects.get(id=history_data['task_id'])
                user = CustomUser.objects.get(id=history_data['user_id'])
                
                history, created = TaskHistory.objects.get_or_create(
                    task=task,
                    field_name=history_data['field_name'],
                    old_value=history_data['old_value'],
                    new_value=history_data['new_value'],
                    user=user,
                    defaults={
                        'changed_at': history_data['changed_at'],
                    }
                )
                if created:
                    history_count += 1
            except (Task.DoesNotExist, CustomUser.DoesNotExist) as e:
                print(f"⚠️  Error importando historial: {e}")
        
        print(f"✅ Importado historial de {history_count} cambios nuevos")
        
        # Crear resumen de importación
        import_summary = {
            'import_timestamp': datetime.now().isoformat(),
            'export_timestamp': export_timestamp,
            'imported_counts': {
                'users': user_count,
                'projects': project_count,
                'tasks': task_count,
                'comments': comment_count,
                'task_history': history_count,
            },
            'total_counts': {
                'users': CustomUser.objects.count(),
                'projects': Project.objects.count(),
                'tasks': Task.objects.count(),
                'comments': Comment.objects.count(),
                'task_history': TaskHistory.objects.count(),
            }
        }
        
        with open(f"{export_dir}/import_summary_{export_timestamp}.json", 'w', encoding='utf-8') as f:
            json.dump(import_summary, f, indent=2, ensure_ascii=False)
        
        print(f"\n🎉 Importación completada!")
        print(f"📊 Importados: {import_summary['imported_counts']}")
        print(f"📊 Totales en DB: {import_summary['total_counts']}")
        print(f"📄 Resumen guardado en: import_summary_{export_timestamp}.json")
        
        return True
        
    except Exception as e:
        print(f"❌ Error durante la importación: {e}")
        return False

def main():
    if len(sys.argv) != 2:
        print("Uso: python import_postgresql_data.py <timestamp>")
        print("Ejemplo: python import_postgresql_data.py 20250101_120000")
        sys.exit(1)
    
    export_timestamp = sys.argv[1]
    
    try:
        success = import_data(export_timestamp)
        if success:
            print("\n✅ Importación exitosa!")
            sys.exit(0)
        else:
            print("\n❌ Importación falló!")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
