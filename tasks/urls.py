from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, CommentViewSet
from .views_charts import ChartsViewSet

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'charts', ChartsViewSet, basename='charts')

urlpatterns = [
    path('api/', include(router.urls)),
    # URLs para comentarios (sin routers anidados)
    path('api/tasks/<int:task_pk>/comments/', CommentViewSet.as_view({'get': 'list', 'post': 'create'}), name='task-comments'),
    path('api/tasks/<int:task_pk>/comments/<int:pk>/', CommentViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='task-comment-detail'),
] 