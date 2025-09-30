"""
Django settings for config project.
This file imports the appropriate settings based on the environment.
"""

import os

# Determine which settings to use based on DJANGO_SETTINGS_MODULE
settings_module = os.environ.get('DJANGO_SETTINGS_MODULE', 'config.settings.development')

if settings_module == 'config.settings.development':
    from .settings.development import *
elif settings_module == 'config.settings.production':
    from .settings.production import *
else:
    # Default to development if no valid settings module is specified
    from .settings.development import *