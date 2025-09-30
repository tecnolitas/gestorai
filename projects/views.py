from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Project
from .serializers import ProjectSerializer, ProjectListSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    """ViewSet para el modelo Project"""
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['owner']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filtrar proyectos por propietario o mostrar todos si es superusuario"""
        # Manejar usuarios anónimos durante la generación de documentación
        if not self.request.user.is_authenticated:
            return Project.objects.none()
        
        # Si es superusuario, puede ver todos los proyectos
        if self.request.user.is_superuser:
            return Project.objects.all()
        
        # Usuarios normales solo ven sus propios proyectos
        return Project.objects.filter(owner=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProjectListSerializer
        return ProjectSerializer
    
    def perform_create(self, serializer):
        """Asignar automáticamente el usuario autenticado como propietario"""
        serializer.save(owner=self.request.user)
    
    @action(detail=True, methods=['get'])
    def tasks(self, request, pk=None):
        """Obtener todas las tareas de un proyecto"""
        project = self.get_object()
        tasks = project.tasks.all()
        from tasks.serializers import TaskListSerializer
        serializer = TaskListSerializer(tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Obtener estadísticas del proyecto"""
        project = self.get_object()
        total_tasks = project.tasks.count()
        completed_tasks = project.tasks.filter(completed=True).count()
        pending_tasks = total_tasks - completed_tasks
        
        return Response({
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'pending_tasks': pending_tasks,
            'completion_percentage': (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        }) 