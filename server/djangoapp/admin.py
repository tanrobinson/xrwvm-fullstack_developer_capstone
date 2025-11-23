"""
This module registers the CarMake and CarModel models with the Django admin site.
"""

from django.contrib import admin  # noqa: I001
from .models import CarMake, CarModel

# Register your models here.
# Registering models with their respective admins
admin.site.register(CarMake)
admin.site.register(CarModel)

# CarModelInline class

# CarModelAdmin class

# CarMakeAdmin class with CarModelInline

# Register models here
