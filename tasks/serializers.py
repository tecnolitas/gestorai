from rest_framework import serializers
from .models import Task, Comment, TaskHistory
from users.serializers import UserSerializer
from projects.serializers import ProjectSerializer


class TaskSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Task"""
    project = ProjectSerializer(read_only=True)
    assignee = UserSerializer(read_only=True)
    project_id = serializers.IntegerField(write_only=True, required=False)
    assignee_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'completed', 'status', 'priority', 'created_at', 
            'due_date', 'project', 'assignee', 'project_id', 'assignee_id'
        ]
        read_only_fields = ['id', 'created_at']
    
    def create(self, validated_data):
        # Manejar project_id
        project_id = validated_data.pop('project_id', None)
        if project_id:
            from projects.models import Project
            validated_data['project'] = Project.objects.get(id=project_id)
        
        # Manejar assignee_id
        assignee_id = validated_data.pop('assignee_id', None)
        if assignee_id:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            validated_data['assignee'] = User.objects.get(id=assignee_id)
        else:
            # Asignar automáticamente el usuario autenticado como asignado si no se especifica
            validated_data['assignee'] = self.context['request'].user
        
        return super().create(validated_data)


class TaskListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listar tareas"""
    project = ProjectSerializer(read_only=True)
    assignee = UserSerializer(read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'completed', 'status', 'priority', 'created_at', 
            'due_date', 'project', 'assignee'
        ]
        read_only_fields = ['id', 'created_at']


class TaskUpdateSerializer(serializers.ModelSerializer):
    """Serializer para actualizar tareas"""
    project_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    assignee_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    project = ProjectSerializer(read_only=True)
    assignee = UserSerializer(read_only=True)
    
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'completed', 'status', 'priority', 'due_date', 'project', 'assignee', 'project_id', 'assignee_id']
        read_only_fields = ['id']
    
    def update(self, instance, validated_data):
        # Manejar project_id
        project_id = validated_data.pop('project_id', None)
        if project_id is not None:
            if project_id:
                from projects.models import Project
                validated_data['project'] = Project.objects.get(id=project_id)
            else:
                validated_data['project'] = None
        
        # Manejar assignee_id
        assignee_id = validated_data.pop('assignee_id', None)
        if assignee_id is not None:
            if assignee_id:
                from django.contrib.auth import get_user_model
                User = get_user_model()
                validated_data['assignee'] = User.objects.get(id=assignee_id)
            else:
                validated_data['assignee'] = None
        
        return super().update(instance, validated_data)


class CommentSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Comment"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'task', 'user', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'task', 'created_at', 'updated_at']


class TaskHistorySerializer(serializers.ModelSerializer):
    """Serializer para el modelo TaskHistory"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = TaskHistory
        fields = ['id', 'task', 'user', 'field_name', 'old_value', 'new_value', 'changed_at']
        read_only_fields = ['id', 'user', 'changed_at'] 