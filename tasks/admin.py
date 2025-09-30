from django.contrib import admin
from .models import Task, Comment, TaskHistory


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'assignee', 'priority', 'completed', 'created_at', 'due_date']
    list_filter = ['completed', 'priority', 'project', 'assignee', 'created_at', 'due_date']
    search_fields = ['title', 'description']
    readonly_fields = ['created_at']
    list_editable = ['completed', 'priority']


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['task', 'user', 'content', 'created_at']
    list_filter = ['created_at', 'user', 'task']
    search_fields = ['content', 'task__title', 'user__username']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(TaskHistory)
class TaskHistoryAdmin(admin.ModelAdmin):
    list_display = ['task', 'user', 'field_name', 'changed_at']
    list_filter = ['field_name', 'changed_at', 'user', 'task']
    search_fields = ['field_name', 'task__title', 'user__username']
    readonly_fields = ['changed_at'] 