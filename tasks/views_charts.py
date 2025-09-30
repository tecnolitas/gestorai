from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet
from django.db.models import Count, Q, F
from django.utils import timezone
from datetime import datetime, timedelta
from collections import defaultdict
import calendar

from .models import Task, Comment, TaskHistory
from projects.models import Project
from django.contrib.auth import get_user_model

User = get_user_model()


class ChartsViewSet(ViewSet):
    """
    ViewSet para proporcionar datos para gráficos del dashboard
    """
    
    @action(detail=False, methods=['get'])
    def tasks_completed_by_period(self, request):
        """
        Retorna datos de tareas completadas por período (últimos 6 meses)
        """
        # Obtener fecha de hace 6 meses
        six_months_ago = timezone.now() - timedelta(days=180)
        
        # Filtrar tareas completadas (sin restricción de fecha para mostrar datos históricos)
        completed_tasks = Task.objects.filter(
            completed=True
        ).order_by('created_at')
        
        # Agrupar por mes
        monthly_data = defaultdict(int)
        for task in completed_tasks:
            month_key = task.created_at.strftime('%Y-%m')
            monthly_data[month_key] += 1
        
        # Generar datos para los meses donde hay tareas completadas
        labels = []
        data = []
        
        # Si hay datos, mostrar los meses con tareas
        if monthly_data:
            for month_key in sorted(monthly_data.keys()):
                # Convertir YYYY-MM a nombre del mes
                year, month = month_key.split('-')
                month_name = calendar.month_name[int(month)][:3]  # Primeras 3 letras
                labels.append(month_name)
                data.append(monthly_data[month_key])
        else:
            # Si no hay datos, mostrar los últimos 6 meses vacíos
            current_date = timezone.now()
            for i in range(6):
                if current_date.month - i <= 0:
                    month = 12 + (current_date.month - i)
                    year = current_date.year - 1
                else:
                    month = current_date.month - i
                    year = current_date.year
                
                month_name = calendar.month_name[month][:3]  # Primeras 3 letras
                labels.insert(0, month_name)
                data.insert(0, 0)
        
        return Response({
            'labels': labels,
            'datasets': [{
                'label': 'Tareas Completadas',
                'data': data
            }]
        })
    
    @action(detail=False, methods=['get'])
    def project_progress(self, request):
        """
        Retorna el progreso de los proyectos basado en tareas completadas
        """
        projects = Project.objects.all()
        
        labels = []
        data = []
        
        for project in projects:
            total_tasks = Task.objects.filter(project=project).count()
            completed_tasks = Task.objects.filter(project=project, completed=True).count()
            
            if total_tasks > 0:
                progress = round((completed_tasks / total_tasks) * 100, 1)
                labels.append(project.name[:20] + ('...' if len(project.name) > 20 else ''))
                data.append(progress)
        
        return Response({
            'labels': labels,
            'datasets': [{
                'label': 'Progreso (%)',
                'data': data
            }]
        })
    
    @action(detail=False, methods=['get'])
    def priority_distribution(self, request):
        """
        Retorna la distribución de tareas por prioridad
        """
        priority_choices = ['low', 'medium', 'high']
        priority_labels = ['Baja', 'Media', 'Alta']
        
        data = []
        for priority in priority_choices:
            count = Task.objects.filter(priority=priority).count()
            data.append(count)
        
        return Response({
            'labels': priority_labels,
            'datasets': [{
                'data': data
            }]
        })
    
    @action(detail=False, methods=['get'])
    def user_activity(self, request):
        """
        Retorna la actividad de usuarios (tareas creadas por día de la semana)
        """
        # Obtener todas las tareas (sin filtro de fecha para mostrar datos históricos)
        all_tasks = Task.objects.all()
        
        # Agrupar por día de la semana
        daily_data = defaultdict(int)
        for task in all_tasks:
            day_name = task.created_at.strftime('%a')  # Lun, Mar, etc.
            daily_data[day_name] += 1
        
        # Ordenar días de la semana
        days_order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        days_spanish = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
        
        labels = []
        data = []
        
        for i, day in enumerate(days_order):
            labels.append(days_spanish[i])
            data.append(daily_data.get(day, 0))
        
        return Response({
            'labels': labels,
            'datasets': [{
                'label': 'Tareas Creadas',
                'data': data
            }]
        })
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """
        Retorna estadísticas generales del dashboard
        """
        total_projects = Project.objects.count()
        total_tasks = Task.objects.count()
        completed_tasks = Task.objects.filter(completed=True).count()
        pending_tasks = total_tasks - completed_tasks
        
        # Tareas completadas esta semana
        week_ago = timezone.now() - timedelta(days=7)
        completed_this_week = Task.objects.filter(
            completed=True,
            created_at__gte=week_ago
        ).count()
        
        # Proyectos activos (con tareas pendientes)
        active_projects = Project.objects.filter(
            tasks__completed=False
        ).distinct().count()
        
        return Response({
            'totalProjects': total_projects,
            'totalTasks': total_tasks,
            'completedTasks': completed_tasks,
            'pendingTasks': pending_tasks,
            'completedThisWeek': completed_this_week,
            'activeProjects': active_projects
        })
    
    @action(detail=False, methods=['get'])
    def tasks_detailed_report(self, request):
        """
        Retorna reporte detallado de tareas para la página de reportes
        """
        # Obtener parámetros de filtro
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        project_id = request.query_params.get('project_id')
        user_id = request.query_params.get('user_id')
        priority = request.query_params.get('priority')
        
        # Construir filtros base
        filters = {}
        if start_date:
            filters['created_at__gte'] = start_date
        if end_date:
            filters['created_at__lte'] = end_date
        if project_id:
            filters['project_id'] = project_id
        if user_id:
            filters['assignee_id'] = user_id
        if priority:
            filters['priority'] = priority
        
        # Obtener tareas con filtros
        tasks = Task.objects.filter(**filters).select_related('project', 'assignee')
        
        # Separar tareas completadas y pendientes
        completed_tasks = tasks.filter(completed=True)
        pending_tasks = tasks.filter(completed=False)
        
        # Calcular estadísticas
        total_tasks = tasks.count()
        total_completed = completed_tasks.count()
        total_pending = pending_tasks.count()
        
        # Tareas vencidas (pendientes con fecha límite pasada)
        now = timezone.now()
        overdue_tasks = pending_tasks.filter(due_date__lt=now)
        total_overdue = overdue_tasks.count()
        
        # Tiempo promedio de completado (en días)
        if total_completed > 0:
            # Simular tiempo de completado basado en fecha de creación
            # En una implementación real, esto vendría de un campo updated_at
            avg_completion_time = 3.5  # Valor simulado
        else:
            avg_completion_time = 0
        
        # Tasa de completado
        completion_rate = round((total_completed / total_tasks * 100), 1) if total_tasks > 0 else 0
        
        # Distribución por prioridad
        priority_breakdown = {}
        for priority, label in Task.PRIORITY_CHOICES:
            priority_tasks = tasks.filter(priority=priority)
            priority_breakdown[priority] = {
                'completed': priority_tasks.filter(completed=True).count(),
                'pending': priority_tasks.filter(completed=False, due_date__gte=now).count(),
                'overdue': priority_tasks.filter(completed=False, due_date__lt=now).count()
            }
        
        # Preparar datos de tareas completadas
        completed_tasks_data = []
        for task in completed_tasks[:10]:  # Limitar a 10 para performance
            completed_tasks_data.append({
                'id': task.id,
                'title': task.title,
                'project': task.project.name if task.project else 'Sin proyecto',
                'assignee': task.assignee.first_name or task.assignee.username if task.assignee else 'Sin asignar',
                'priority': task.priority,
                'completed_at': task.created_at.strftime('%Y-%m-%d'),  # Usando created_at como proxy
                'days_to_complete': 3,  # Valor simulado
                'status': 'completed'
            })
        
        # Preparar datos de tareas pendientes/vencidas
        pending_tasks_data = []
        for task in pending_tasks[:10]:  # Limitar a 10 para performance
            days_overdue = 0
            if task.due_date and task.due_date < now:
                days_overdue = (now - task.due_date).days
            
            pending_tasks_data.append({
                'id': task.id,
                'title': task.title,
                'project': task.project.name if task.project else 'Sin proyecto',
                'assignee': task.assignee.first_name or task.assignee.username if task.assignee else 'Sin asignar',
                'priority': task.priority,
                'due_date': task.due_date.strftime('%Y-%m-%d') if task.due_date else 'Sin fecha',
                'days_overdue': days_overdue,
                'status': 'overdue' if days_overdue > 0 else 'pending'
            })
        
        return Response({
            'taskStats': {
                'totalCompleted': total_completed,
                'totalPending': total_pending,
                'averageCompletionTime': avg_completion_time,
                'overdueTasks': total_overdue,
                'completionRate': completion_rate,
                'priorityBreakdown': priority_breakdown
            },
            'completedTasks': completed_tasks_data,
            'pendingTasks': pending_tasks_data
        })
    
    @action(detail=False, methods=['get'])
    def temporal_comparison(self, request):
        """
        Retorna datos para comparativas temporales con gráficos
        """
        # Obtener parámetros de filtro
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        project_id = request.query_params.get('project_id')
        user_id = request.query_params.get('user_id')
        period = request.query_params.get('period', 'monthly')  # daily, weekly, monthly
        
        # Construir filtros base
        filters = {}
        if start_date:
            filters['created_at__gte'] = start_date
        if end_date:
            filters['created_at__lte'] = end_date
        if project_id:
            filters['project_id'] = project_id
        if user_id:
            filters['assignee_id'] = user_id
        
        # Obtener tareas con filtros
        tasks = Task.objects.filter(**filters).select_related('project', 'assignee')
        
        # Generar datos temporales según el período
        if period == 'daily':
            data = self._generate_daily_data(tasks)
        elif period == 'weekly':
            data = self._generate_weekly_data(tasks)
        else:  # monthly
            data = self._generate_monthly_data(tasks)
        
        return Response(data)
    
    def _generate_daily_data(self, tasks):
        """Genera datos diarios basados en las fechas reales de las tareas"""
        from datetime import timedelta
        
        # Obtener el rango de fechas de las tareas reales
        if tasks.exists():
            earliest_date = tasks.order_by('created_at').first().created_at.date()
            latest_date = tasks.order_by('created_at').last().created_at.date()
        else:
            # Fallback a los últimos 30 días si no hay tareas
            now = timezone.now()
            earliest_date = (now - timedelta(days=30)).date()
            latest_date = now.date()
        
        daily_data = []
        current_date = earliest_date
        
        while current_date <= latest_date:
            date_str = current_date.strftime('%d/%m')
            
            # Tareas creadas en este día
            created = tasks.filter(created_at__date=current_date).count()
            
            # Tareas completadas en este día
            completed = tasks.filter(
                completed=True,
                created_at__date=current_date
            ).count()
            
            daily_data.append({
                'date': date_str,
                'created': created,
                'completed': completed,
                'label': current_date.strftime('%d/%m')
            })
            
            # Avanzar al siguiente día
            current_date += timedelta(days=1)
        
        return {
            'period': 'daily',
            'labels': [item['label'] for item in reversed(daily_data)],
            'datasets': [
                {
                    'label': 'Tareas Creadas',
                    'data': [item['created'] for item in reversed(daily_data)],
                    'type': 'line'
                },
                {
                    'label': 'Tareas Completadas',
                    'data': [item['completed'] for item in reversed(daily_data)],
                    'type': 'line'
                }
            ]
        }
    
    def _generate_weekly_data(self, tasks):
        """Genera datos semanales basados en las fechas reales de las tareas"""
        from datetime import timedelta
        
        # Obtener el rango de fechas de las tareas reales
        if tasks.exists():
            earliest_date = tasks.order_by('created_at').first().created_at.date()
            latest_date = tasks.order_by('created_at').last().created_at.date()
        else:
            # Fallback a las últimas 12 semanas si no hay tareas
            now = timezone.now()
            earliest_date = (now - timedelta(weeks=12)).date()
            latest_date = now.date()
        
        weekly_data = []
        current_date = earliest_date
        
        while current_date <= latest_date:
            # Calcular el inicio de la semana (lunes)
            week_start = current_date - timedelta(days=current_date.weekday())
            week_end = week_start + timedelta(days=6)
            
            # Tareas creadas en esta semana
            created = tasks.filter(
                created_at__date__gte=week_start,
                created_at__date__lte=week_end
            ).count()
            
            # Tareas completadas en esta semana
            completed = tasks.filter(
                completed=True,
                created_at__date__gte=week_start,
                created_at__date__lte=week_end
            ).count()
            
            weekly_data.append({
                'week_start': week_start.strftime('%Y-%m-%d'),
                'created': created,
                'completed': completed,
                'label': f'Sem {week_start.strftime("%U")}'
            })
            
            # Avanzar a la siguiente semana
            current_date = week_end + timedelta(days=1)
        
        return {
            'period': 'weekly',
            'labels': [item['label'] for item in reversed(weekly_data)],
            'datasets': [
                {
                    'label': 'Tareas Creadas',
                    'data': [item['created'] for item in reversed(weekly_data)],
                    'type': 'bar'
                },
                {
                    'label': 'Tareas Completadas',
                    'data': [item['completed'] for item in reversed(weekly_data)],
                    'type': 'bar'
                }
            ]
        }
    
    def _generate_monthly_data(self, tasks):
        """Genera datos mensuales basados en las fechas reales de las tareas"""
        import calendar
        
        # Obtener el rango de fechas de las tareas reales
        if tasks.exists():
            earliest_date = tasks.order_by('created_at').first().created_at.date()
            latest_date = tasks.order_by('created_at').last().created_at.date()
        else:
            # Fallback a los últimos 12 meses si no hay tareas
            now = timezone.now()
            earliest_date = (now - timedelta(days=365)).date()
            latest_date = now.date()
        
        monthly_data = []
        current_date = earliest_date
        
        while current_date <= latest_date:
            year = current_date.year
            month = current_date.month
            
            # Tareas creadas en este mes
            created = tasks.filter(
                created_at__year=year,
                created_at__month=month
            ).count()
            
            # Tareas completadas en este mes
            completed = tasks.filter(
                completed=True,
                created_at__year=year,
                created_at__month=month
            ).count()
            
            monthly_data.append({
                'year': year,
                'month': month,
                'created': created,
                'completed': completed,
                'label': calendar.month_name[month][:3]
            })
            
            # Avanzar al siguiente mes
            if month == 12:
                current_date = current_date.replace(year=year + 1, month=1, day=1)
            else:
                current_date = current_date.replace(month=month + 1, day=1)
        
        return {
            'period': 'monthly',
            'labels': [item['label'] for item in reversed(monthly_data)],
            'datasets': [
                {
                    'label': 'Tareas Creadas',
                    'data': [item['created'] for item in reversed(monthly_data)],
                    'type': 'bar'
                },
                {
                    'label': 'Tareas Completadas',
                    'data': [item['completed'] for item in reversed(monthly_data)],
                    'type': 'bar'
                }
            ]
        }
    
    @action(detail=False, methods=['get'])
    def project_time_report(self, request):
        """
        Retorna reporte detallado de tiempo por proyecto
        """
        # Obtener parámetros de filtro
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        project_id = request.query_params.get('project_id')
        user_id = request.query_params.get('user_id')
        
        # Construir filtros base
        filters = {}
        if start_date:
            filters['created_at__gte'] = start_date
        if end_date:
            filters['created_at__lte'] = end_date
        if project_id:
            filters['project_id'] = project_id
        if user_id:
            filters['assignee_id'] = user_id
        
        # Obtener proyectos con sus tareas
        from projects.models import Project
        projects = Project.objects.all()
        if project_id:
            projects = projects.filter(id=project_id)
        
        project_data = []
        
        for project in projects:
            # Obtener tareas del proyecto con filtros
            project_tasks = Task.objects.filter(
                project=project,
                **filters
            ).select_related('assignee')
            
            # Calcular métricas del proyecto
            total_tasks = project_tasks.count()
            completed_tasks = project_tasks.filter(completed=True).count()
            pending_tasks = total_tasks - completed_tasks
            
            # Tareas vencidas
            now = timezone.now()
            overdue_tasks = project_tasks.filter(
                completed=False,
                due_date__lt=now
            ).count()
            
            # Tiempo estimado vs real (simulado)
            estimated_hours = total_tasks * 8  # 8 horas por tarea estimado
            actual_hours = completed_tasks * 6  # 6 horas reales por tarea completada
            
            # Progreso del proyecto
            progress = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0
            
            # Tiempo promedio por tarea
            avg_time_per_task = round(actual_hours / completed_tasks, 1) if completed_tasks > 0 else 0
            
            # Tareas por prioridad
            priority_breakdown = {}
            for priority, label in Task.PRIORITY_CHOICES:
                priority_tasks = project_tasks.filter(priority=priority)
                priority_breakdown[priority] = {
                    'total': priority_tasks.count(),
                    'completed': priority_tasks.filter(completed=True).count(),
                    'pending': priority_tasks.filter(completed=False).count()
                }
            
            # Usuarios asignados al proyecto
            assigned_users = project_tasks.values_list('assignee__first_name', 'assignee__username').distinct()
            user_list = []
            for first_name, username in assigned_users:
                if first_name:
                    user_list.append(first_name)
                elif username:
                    user_list.append(username)
            
            # Tareas recientes
            recent_tasks = project_tasks.order_by('-created_at')[:5]
            recent_tasks_data = []
            for task in recent_tasks:
                recent_tasks_data.append({
                    'id': task.id,
                    'title': task.title,
                    'assignee': task.assignee.first_name or task.assignee.username if task.assignee else 'Sin asignar',
                    'priority': task.priority,
                    'status': 'completed' if task.completed else 'pending',
                    'created_at': task.created_at.strftime('%Y-%m-%d')
                })
            
            project_data.append({
                'id': project.id,
                'name': project.name,
                'description': project.description or 'Sin descripción',
                'totalTasks': total_tasks,
                'completedTasks': completed_tasks,
                'pendingTasks': pending_tasks,
                'overdueTasks': overdue_tasks,
                'progress': progress,
                'estimatedHours': estimated_hours,
                'actualHours': actual_hours,
                'avgTimePerTask': avg_time_per_task,
                'priorityBreakdown': priority_breakdown,
                'assignedUsers': user_list,
                'recentTasks': recent_tasks_data,
                'createdAt': project.created_at.strftime('%Y-%m-%d') if hasattr(project, 'created_at') else 'N/A'
            })
        
        # Ordenar por progreso descendente
        project_data.sort(key=lambda x: x['progress'], reverse=True)
        
        # Calcular métricas generales
        total_projects = len(project_data)
        avg_progress = round(sum(p['progress'] for p in project_data) / total_projects, 1) if total_projects > 0 else 0
        total_estimated_hours = sum(p['estimatedHours'] for p in project_data)
        total_actual_hours = sum(p['actualHours'] for p in project_data)
        
        return Response({
            'projects': project_data,
            'summary': {
                'totalProjects': total_projects,
                'avgProgress': avg_progress,
                'totalEstimatedHours': total_estimated_hours,
                'totalActualHours': total_actual_hours,
                'efficiency': round((total_actual_hours / total_estimated_hours * 100), 1) if total_estimated_hours > 0 else 0
            }
        })
    
    @action(detail=False, methods=['get'])
    def user_productivity_report(self, request):
        """
        Retorna reporte detallado de productividad por usuario
        """
        # Obtener parámetros de filtro
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        project_id = request.query_params.get('project_id')
        user_id = request.query_params.get('user_id')
        
        # Construir filtros base
        filters = {}
        if start_date:
            filters['created_at__gte'] = start_date
        if end_date:
            filters['created_at__lte'] = end_date
        if project_id:
            filters['project_id'] = project_id
        if user_id:
            filters['assignee_id'] = user_id
        
        # Obtener usuarios con sus tareas
        User = get_user_model()
        users = User.objects.all()
        if user_id:
            users = users.filter(id=user_id)
        
        user_data = []
        
        for user in users:
            # Obtener tareas del usuario con filtros
            user_tasks = Task.objects.filter(
                assignee=user,
                **filters
            ).select_related('project')
            
            # Calcular métricas del usuario
            total_tasks = user_tasks.count()
            completed_tasks = user_tasks.filter(completed=True).count()
            pending_tasks = total_tasks - completed_tasks
            
            # Tareas vencidas
            now = timezone.now()
            overdue_tasks = user_tasks.filter(
                completed=False,
                due_date__lt=now
            ).count()
            
            # Tiempo estimado vs real (simulado)
            estimated_hours = total_tasks * 8  # 8 horas por tarea estimado
            actual_hours = completed_tasks * 6  # 6 horas reales por tarea completada
            
            # Productividad del usuario
            productivity = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0
            
            # Tiempo promedio por tarea
            avg_time_per_task = round(actual_hours / completed_tasks, 1) if completed_tasks > 0 else 0
            
            # Tareas por prioridad
            priority_breakdown = {}
            for priority, label in Task.PRIORITY_CHOICES:
                priority_tasks = user_tasks.filter(priority=priority)
                priority_breakdown[priority] = {
                    'total': priority_tasks.count(),
                    'completed': priority_tasks.filter(completed=True).count(),
                    'pending': priority_tasks.filter(completed=False).count()
                }
            
            # Proyectos en los que trabaja el usuario
            user_projects = user_tasks.values_list('project__name', flat=True).distinct()
            project_list = [name for name in user_projects if name]
            
            # Tareas recientes del usuario
            recent_tasks = user_tasks.order_by('-created_at')[:5]
            recent_tasks_data = []
            for task in recent_tasks:
                recent_tasks_data.append({
                    'id': task.id,
                    'title': task.title,
                    'project': task.project.name if task.project else 'Sin proyecto',
                    'priority': task.priority,
                    'status': 'completed' if task.completed else 'pending',
                    'created_at': task.created_at.strftime('%Y-%m-%d')
                })
            
            # Análisis de tendencias (últimos 30 días)
            from datetime import timedelta
            thirty_days_ago = now - timedelta(days=30)
            recent_completed = user_tasks.filter(
                completed=True,
                created_at__gte=thirty_days_ago
            ).count()
            
            # Eficiencia del usuario
            efficiency = round((actual_hours / estimated_hours * 100), 1) if estimated_hours > 0 else 0
            
            user_data.append({
                'id': user.id,
                'username': user.username,
                'firstName': user.first_name or '',
                'lastName': user.last_name or '',
                'email': user.email,
                'totalTasks': total_tasks,
                'completedTasks': completed_tasks,
                'pendingTasks': pending_tasks,
                'overdueTasks': overdue_tasks,
                'productivity': productivity,
                'estimatedHours': estimated_hours,
                'actualHours': actual_hours,
                'avgTimePerTask': avg_time_per_task,
                'efficiency': efficiency,
                'priorityBreakdown': priority_breakdown,
                'projects': project_list,
                'recentTasks': recent_tasks_data,
                'recentCompleted': recent_completed,
                'lastActive': user.last_login.strftime('%Y-%m-%d') if user.last_login else 'Nunca'
            })
        
        # Ordenar por productividad descendente
        user_data.sort(key=lambda x: x['productivity'], reverse=True)
        
        # Calcular métricas generales
        total_users = len(user_data)
        avg_productivity = round(sum(u['productivity'] for u in user_data) / total_users, 1) if total_users > 0 else 0
        total_estimated_hours = sum(u['estimatedHours'] for u in user_data)
        total_actual_hours = sum(u['actualHours'] for u in user_data)
        avg_efficiency = round(sum(u['efficiency'] for u in user_data) / total_users, 1) if total_users > 0 else 0
        
        return Response({
            'users': user_data,
            'summary': {
                'totalUsers': total_users,
                'avgProductivity': avg_productivity,
                'totalEstimatedHours': total_estimated_hours,
                'totalActualHours': total_actual_hours,
                'avgEfficiency': avg_efficiency,
                'activeUsers': len([u for u in user_data if u['totalTasks'] > 0])
            }
        })
    
    @action(detail=False, methods=['get'])
    def projects_report(self, request):
        """
        Retorna reporte detallado de proyectos
        """
        # Obtener parámetros de filtro
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        project_id = request.query_params.get('project_id')
        user_id = request.query_params.get('user_id')
        
        # Construir filtros base
        filters = {}
        if start_date:
            filters['created_at__gte'] = start_date
        if end_date:
            filters['created_at__lte'] = end_date
        if project_id:
            filters['project_id'] = project_id
        if user_id:
            filters['assignee_id'] = user_id
        
        # Obtener proyectos
        from projects.models import Project
        projects = Project.objects.all()
        if project_id:
            projects = projects.filter(id=project_id)
        
        project_data = []
        
        for project in projects:
            # Obtener tareas del proyecto con filtros
            project_tasks = Task.objects.filter(
                project=project,
                **filters
            ).select_related('assignee')
            
            # Calcular métricas del proyecto
            total_tasks = project_tasks.count()
            completed_tasks = project_tasks.filter(completed=True).count()
            pending_tasks = total_tasks - completed_tasks
            
            # Tareas vencidas
            now = timezone.now()
            overdue_tasks = project_tasks.filter(
                completed=False,
                due_date__lt=now
            ).count()
            
            # Tiempo estimado vs real (simulado)
            estimated_hours = total_tasks * 8  # 8 horas por tarea estimado
            actual_hours = completed_tasks * 6  # 6 horas reales por tarea completada
            
            # Progreso del proyecto
            progress = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0
            
            # Tiempo promedio por tarea
            avg_time_per_task = round(actual_hours / completed_tasks, 1) if completed_tasks > 0 else 0
            
            # Eficiencia del proyecto
            efficiency = round((actual_hours / estimated_hours * 100), 1) if estimated_hours > 0 else 0
            
            # Tareas por prioridad
            priority_breakdown = {}
            for priority, label in Task.PRIORITY_CHOICES:
                priority_tasks = project_tasks.filter(priority=priority)
                priority_breakdown[priority] = {
                    'total': priority_tasks.count(),
                    'completed': priority_tasks.filter(completed=True).count(),
                    'pending': priority_tasks.filter(completed=False).count()
                }
            
            # Usuarios asignados al proyecto
            assigned_users = project_tasks.values_list('assignee__first_name', 'assignee__username').distinct()
            user_list = []
            for first_name, username in assigned_users:
                if first_name:
                    user_list.append(first_name)
                elif username:
                    user_list.append(username)
            
            # Tareas recientes del proyecto
            recent_tasks = project_tasks.order_by('-created_at')[:5]
            recent_tasks_data = []
            for task in recent_tasks:
                recent_tasks_data.append({
                    'id': task.id,
                    'title': task.title,
                    'assignee': task.assignee.first_name or task.assignee.username if task.assignee else 'Sin asignar',
                    'priority': task.priority,
                    'status': 'completed' if task.completed else 'pending',
                    'created_at': task.created_at.strftime('%Y-%m-%d')
                })
            
            # Análisis de tendencias (últimos 30 días)
            from datetime import timedelta
            thirty_days_ago = now - timedelta(days=30)
            recent_completed = project_tasks.filter(
                completed=True,
                created_at__gte=thirty_days_ago
            ).count()
            
            # Velocidad del proyecto (tareas completadas por semana)
            week_ago = now - timedelta(days=7)
            weekly_completed = project_tasks.filter(
                completed=True,
                created_at__gte=week_ago
            ).count()
            
            # Estado del proyecto basado en progreso y tareas vencidas
            if progress >= 100:
                project_status = 'completed'
                status_label = 'Completado'
            elif overdue_tasks > 0:
                project_status = 'at_risk'
                status_label = 'En Riesgo'
            elif progress >= 75:
                project_status = 'on_track'
                status_label = 'En Progreso'
            elif progress >= 25:
                project_status = 'in_progress'
                status_label = 'En Desarrollo'
            else:
                project_status = 'planning'
                status_label = 'Planificación'
            
            project_data.append({
                'id': project.id,
                'name': project.name,
                'description': project.description or 'Sin descripción',
                'status': project_status,
                'statusLabel': status_label,
                'totalTasks': total_tasks,
                'completedTasks': completed_tasks,
                'pendingTasks': pending_tasks,
                'overdueTasks': overdue_tasks,
                'progress': progress,
                'estimatedHours': estimated_hours,
                'actualHours': actual_hours,
                'avgTimePerTask': avg_time_per_task,
                'efficiency': efficiency,
                'priorityBreakdown': priority_breakdown,
                'assignedUsers': user_list,
                'recentTasks': recent_tasks_data,
                'recentCompleted': recent_completed,
                'weeklyCompleted': weekly_completed,
                'createdAt': project.created_at.strftime('%Y-%m-%d') if hasattr(project, 'created_at') else 'N/A'
            })
        
        # Ordenar por progreso descendente
        project_data.sort(key=lambda x: x['progress'], reverse=True)
        
        # Calcular métricas generales
        total_projects = len(project_data)
        avg_progress = round(sum(p['progress'] for p in project_data) / total_projects, 1) if total_projects > 0 else 0
        total_estimated_hours = sum(p['estimatedHours'] for p in project_data)
        total_actual_hours = sum(p['actualHours'] for p in project_data)
        avg_efficiency = round(sum(p['efficiency'] for p in project_data) / total_projects, 1) if total_projects > 0 else 0
        
        # Contar proyectos por estado
        status_counts = {
            'completed': len([p for p in project_data if p['status'] == 'completed']),
            'on_track': len([p for p in project_data if p['status'] == 'on_track']),
            'at_risk': len([p for p in project_data if p['status'] == 'at_risk']),
            'in_progress': len([p for p in project_data if p['status'] == 'in_progress']),
            'planning': len([p for p in project_data if p['status'] == 'planning'])
        }
        
        return Response({
            'projects': project_data,
            'summary': {
                'totalProjects': total_projects,
                'avgProgress': avg_progress,
                'totalEstimatedHours': total_estimated_hours,
                'totalActualHours': total_actual_hours,
                'avgEfficiency': avg_efficiency,
                'statusCounts': status_counts,
                'activeProjects': len([p for p in project_data if p['totalTasks'] > 0])
            }
        })
