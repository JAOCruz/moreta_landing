"""
WSGI config for moreta_fitness project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moreta_fitness.settings')

application = get_wsgi_application() 