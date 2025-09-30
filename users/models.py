from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """
    Custom user model that inherits from AbstractUser.
    This model will be used for authentication throughout the system.
    """
    pass 