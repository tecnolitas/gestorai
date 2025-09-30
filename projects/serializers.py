from rest_framework import serializers
from .models import Project
from users.serializers import UserSerializer


class ProjectSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Project"""
    owner = UserSerializer(read_only=True)
    
    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'owner', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def create(self, validated_data):
        # Asignar automáticamente el usuario autenticado como propietario
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class ProjectListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listar proyectos"""
    owner = UserSerializer(read_only=True)
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    task_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'owner', 'owner_name', 'task_count', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_task_count(self, obj):
        return obj.tasks.count() 