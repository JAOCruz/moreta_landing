"""
ASGI config for moreta_fitness project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moreta_fitness.settings')

application = get_asgi_application() 