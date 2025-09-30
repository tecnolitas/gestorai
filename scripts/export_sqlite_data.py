#!/usr/bin/env python
"""
Script para exportar datos de SQLite a formato JSON
para posterior importación a PostgreSQL
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

def export_data():
    """Exportar todos los datos de la base de datos SQLite"""
    
    print("🔄 Iniciando exportación de datos de SQLite...")
    
    # Crear directorio de exportación si no existe
    export_dir = "fixtures/export"
    os.makedirs(export_dir, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Exportar usuarios
    print("📤 Exportando usuarios...")
    users_data = []
    for user in CustomUser.objects.all():
        users_data.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_active': user.is_active,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'date_joined': user.date_joined.isoformat() if user.date_joined else None,
            'last_login': user.last_login.isoformat() if user.last_login else None,
        })
    
    with open(f"{export_dir}/users_{timestamp}.json", 'w', encoding='utf-8') as f:
        json.dump(users_data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Exportados {len(users_data)} usuarios")
    
    # Exportar proyectos
    print("📤 Exportando proyectos...")
    projects_data = []
    for project in Project.objects.all():
        projects_data.append({
            'id': project.id,
            'name': project.name,
            'description': project.description,
            'owner_id': project.owner_id,
            'created_at': project.created_at.isoformat() if project.created_at else None,
            'updated_at': project.updated_at.isoformat() if project.updated_at else None,
        })
    
    with open(f"{export_dir}/projects_{timestamp}.json", 'w', encoding='utf-8') as f:
        json.dump(projects_data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Exportados {len(projects_data)} proyectos")
    
    # Exportar tareas
    print("📤 Exportando tareas...")
    tasks_data = []
    for task in Task.objects.all():
        tasks_data.append({
            'id': task.id,
            'title': task.title,
            'description': task.description,
            'completed': task.completed,
            'priority': task.priority,
            'created_at': task.created_at.isoformat() if task.created_at else None,
            'due_date': task.due_date.isoformat() if task.due_date else None,
            'project_id': task.project_id,
            'assignee_id': task.assignee_id,
        })
    
    with open(f"{export_dir}/tasks_{timestamp}.json", 'w', encoding='utf-8') as f:
        json.dump(tasks_data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Exportadas {len(tasks_data)} tareas")
    
    # Exportar comentarios
    print("📤 Exportando comentarios...")
    comments_data = []
    for comment in Comment.objects.all():
        comments_data.append({
            'id': comment.id,
            'content': comment.content,
            'created_at': comment.created_at.isoformat() if comment.created_at else None,
            'updated_at': comment.updated_at.isoformat() if comment.updated_at else None,
            'task_id': comment.task_id,
            'user_id': comment.user_id,
        })
    
    with open(f"{export_dir}/comments_{timestamp}.json", 'w', encoding='utf-8') as f:
        json.dump(comments_data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Exportados {len(comments_data)} comentarios")
    
    # Exportar historial de tareas
    print("📤 Exportando historial de tareas...")
    task_history_data = []
    for history in TaskHistory.objects.all():
        task_history_data.append({
            'id': history.id,
            'field_name': history.field_name,
            'old_value': history.old_value,
            'new_value': history.new_value,
            'changed_at': history.changed_at.isoformat() if history.changed_at else None,
            'task_id': history.task_id,
            'user_id': history.user_id,
        })
    
    with open(f"{export_dir}/task_history_{timestamp}.json", 'w', encoding='utf-8') as f:
        json.dump(task_history_data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Exportado historial de {len(task_history_data)} cambios")
    
    # Crear archivo de resumen
    summary = {
        'export_timestamp': timestamp,
        'export_date': datetime.now().isoformat(),
        'counts': {
            'users': len(users_data),
            'projects': len(projects_data),
            'tasks': len(tasks_data),
            'comments': len(comments_data),
            'task_history': len(task_history_data),
        },
        'files': [
            f"users_{timestamp}.json",
            f"projects_{timestamp}.json",
            f"tasks_{timestamp}.json",
            f"comments_{timestamp}.json",
            f"task_history_{timestamp}.json",
        ]
    }
    
    with open(f"{export_dir}/export_summary_{timestamp}.json", 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    
    print(f"\n🎉 Exportación completada!")
    print(f"📁 Archivos guardados en: {export_dir}/")
    print(f"📊 Resumen: {summary['counts']}")
    print(f"📄 Archivo de resumen: export_summary_{timestamp}.json")
    
    return timestamp, summary

if __name__ == "__main__":
    try:
        timestamp, summary = export_data()
        sys.exit(0)
    except Exception as e:
        print(f"❌ Error durante la exportación: {e}")
        sys.exit(1)
