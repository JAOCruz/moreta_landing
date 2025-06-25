from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('register/', views.register, name='register'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('profile/', views.profile, name='profile'),
    path('workouts/', views.workouts, name='workouts'),
    path('workout/<int:workout_id>/', views.workout_detail, name='workout_detail'),
    path('progress/', views.progress, name='progress'),
    path('nutrition/', views.nutrition, name='nutrition'),
    path('messages/', views.messages_list, name='messages'),
    path('message/<int:message_id>/', views.message_detail, name='message_detail'),
    path('send-message/', views.send_message, name='send_message'),
] 