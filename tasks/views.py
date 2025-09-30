from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Task, Comment, TaskHistory
from .serializers import (
    TaskSerializer, TaskListSerializer, TaskUpdateSerializer,
    CommentSerializer, TaskHistorySerializer
)


class TaskViewSet(viewsets.ModelViewSet):
    """ViewSet para el modelo Task"""
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['project', 'assignee', 'completed', 'priority']
    search_fields = ['title', 'description']
    ordering_fields = ['title', 'created_at', 'due_date', 'completed', 'priority']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filtrar tareas por proyectos del usuario o tareas asignadas al usuario"""
        # Manejar usuarios anónimos durante la generación de documentación
        if not self.request.user.is_authenticated:
            return Task.objects.none()
        
        user = self.request.user
        
        # Si es superusuario, puede ver todas las tareas
        if user.is_superuser:
            return Task.objects.all()
        
        # Usuarios normales ven tareas de sus proyectos o tareas asignadas a ellos
        return Task.objects.filter(
            project__owner=user
        ) | Task.objects.filter(assignee=user)
    
    def get_serializer_class(self):
        if self.action == 'list':
            return TaskListSerializer
        elif self.action in ['update', 'partial_update']:
            return TaskUpdateSerializer
        return TaskSerializer
    
    
    def perform_create(self, serializer):
        """Asignar automáticamente el usuario autenticado como asignado si no se especifica"""
        if not serializer.validated_data.get('assignee'):
            serializer.save(assignee=self.request.user)
        else:
            serializer.save()
    
    def perform_update(self, serializer):
        """Registrar cambios en el historial antes de actualizar"""
        instance = serializer.instance
        old_data = {
            'title': instance.title,
            'description': instance.description,
            'priority': instance.priority,
            'completed': instance.completed,
            'due_date': instance.due_date,
            'project': instance.project,
            'assignee': instance.assignee,
        }
        
        # Guardar la instancia actualizada
        updated_instance = serializer.save()
        
        # Registrar cambios en el historial
        new_data = serializer.validated_data
        user = self.request.user
        
        for field_name, new_value in new_data.items():
            old_value = old_data.get(field_name)
            
            # Convertir valores para comparación
            if field_name in ['project', 'assignee']:
                old_value = old_value.id if old_value else None
                new_value = new_value.id if new_value else None
            elif field_name == 'due_date':
                old_value = old_value.isoformat() if old_value else None
                new_value = new_value.isoformat() if new_value else None
            else:
                old_value = str(old_value) if old_value is not None else None
                new_value = str(new_value) if new_value is not None else None
            
            # Solo registrar si el valor cambió
            if old_value != new_value:
                TaskHistory.objects.create(
                    task=updated_instance,
                    user=user,
                    field_name=field_name,
                    old_value=old_value,
                    new_value=new_value
                )
    
    @action(detail=True, methods=['post'])
    def toggle_complete(self, request, pk=None):
        """Cambiar el estado de completado de una tarea"""
        task = self.get_object()
        task.completed = not task.completed
        task.save()
        serializer = self.get_serializer(task)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_tasks(self, request):
        """Obtener tareas asignadas al usuario autenticado"""
        tasks = self.get_queryset().filter(assignee=request.user)
        count = tasks.count()
        serializer = TaskListSerializer(tasks, many=True)
        return Response({
            'count': count,
            'results': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def completed(self, request):
        """Obtener tareas completadas"""
        tasks = self.get_queryset().filter(completed=True)
        count = tasks.count()
        serializer = TaskListSerializer(tasks, many=True)
        return Response({
            'count': count,
            'results': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Obtener tareas pendientes"""
        tasks = self.get_queryset().filter(completed=False)
        count = tasks.count()
        serializer = TaskListSerializer(tasks, many=True)
        return Response({
            'count': count,
            'results': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Obtener tareas vencidas"""
        from django.utils import timezone
        tasks = self.get_queryset().filter(
            completed=False,
            due_date__lt=timezone.now().date()
        )
        serializer = TaskListSerializer(tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """Obtener historial de cambios de una tarea"""
        task = self.get_object()
        history = TaskHistory.objects.filter(task=task)
        serializer = TaskHistorySerializer(history, many=True)
        return Response(serializer.data)


class CommentViewSet(viewsets.ModelViewSet):
    """ViewSet para el modelo Comment"""
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filtrar comentarios por tarea"""
        task_id = self.kwargs.get('task_pk')
        if task_id:
            return Comment.objects.filter(task_id=task_id)
        return Comment.objects.none()
    
    def perform_create(self, serializer):
        """Asignar automáticamente el usuario autenticado"""
        task_id = self.kwargs.get('task_pk')
        serializer.save(user=self.request.user, task_id=task_id)
    
    def perform_update(self, serializer):
        """Solo permitir edición de comentarios propios"""
        comment = self.get_object()
        if comment.user != self.request.user:
            raise permissions.PermissionDenied("No puedes editar comentarios de otros usuarios")
        serializer.save()
    
    def perform_destroy(self, instance):
        """Solo permitir eliminación de comentarios propios"""
        if instance.user != self.request.user:
            raise permissions.PermissionDenied("No puedes eliminar comentarios de otros usuarios")
        instance.delete() 