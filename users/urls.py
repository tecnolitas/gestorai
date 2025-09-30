from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, login_view, logout_view, register_view

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    
    # Endpoints de autenticación
    path('api/auth/login/', login_view, name='api_login'),
    path('api/auth/logout/', logout_view, name='api_logout'),
    path('api/auth/register/', register_view, name='api_register'),
] 