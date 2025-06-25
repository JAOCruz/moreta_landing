from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import ClientProfile, Workout, ClientWorkout, Progress, NutritionPlan, Message

class ClientProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'experience_level', 'fitness_goals', 'current_weight', 'created_at']
    list_filter = ['experience_level', 'fitness_goals', 'created_at']
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['created_at', 'updated_at']

class WorkoutAdmin(admin.ModelAdmin):
    list_display = ['title', 'workout_type', 'duration_minutes', 'difficulty_level', 'created_at']
    list_filter = ['workout_type', 'difficulty_level', 'created_at']
    search_fields = ['title', 'description']
    readonly_fields = ['created_at']

class ClientWorkoutAdmin(admin.ModelAdmin):
    list_display = ['client', 'workout', 'assigned_date', 'completed', 'completed_date']
    list_filter = ['completed', 'assigned_date', 'workout__workout_type']
    search_fields = ['client__user__username', 'workout__title']
    readonly_fields = ['completed_date']

class ProgressAdmin(admin.ModelAdmin):
    list_display = ['client', 'date', 'weight', 'body_fat_percentage', 'muscle_mass']
    list_filter = ['date']
    search_fields = ['client__user__username']
    date_hierarchy = 'date'

class NutritionPlanAdmin(admin.ModelAdmin):
    list_display = ['client', 'title', 'daily_calories', 'created_at']
    list_filter = ['created_at']
    search_fields = ['client__user__username', 'title']
    readonly_fields = ['created_at']

class MessageAdmin(admin.ModelAdmin):
    list_display = ['sender', 'recipient', 'subject', 'read', 'created_at']
    list_filter = ['read', 'created_at']
    search_fields = ['sender__username', 'recipient__username', 'subject', 'content']
    readonly_fields = ['created_at']

# Register models
admin.site.register(ClientProfile, ClientProfileAdmin)
admin.site.register(Workout, WorkoutAdmin)
admin.site.register(ClientWorkout, ClientWorkoutAdmin)
admin.site.register(Progress, ProgressAdmin)
admin.site.register(NutritionPlan, NutritionPlanAdmin)
admin.site.register(Message, MessageAdmin) 