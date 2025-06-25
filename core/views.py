from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login
from django.contrib import messages
from django.http import JsonResponse
from django.utils import timezone
from django.db.models import Q
from .forms import UserRegistrationForm, ClientProfileForm, ProgressForm, MessageForm
from .models import ClientProfile, Workout, ClientWorkout, Progress, NutritionPlan, Message
from django.contrib.auth.models import User

def home(request):
    return render(request, 'core/home.html', {'is_homepage': True})

def register(request):
    if request.method == 'POST':
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            # Create client profile
            ClientProfile.objects.create(user=user)
            login(request, user)
            messages.success(request, 'Registration successful! Please complete your profile.')
            return redirect('profile')
    else:
        form = UserRegistrationForm()
    return render(request, 'core/register.html', {'form': form})

@login_required
def dashboard(request):
    try:
        profile = request.user.clientprofile
    except ClientProfile.DoesNotExist:
        profile = ClientProfile.objects.create(user=request.user)
    
    # Get today's workouts
    today = timezone.now().date()
    todays_workouts = ClientWorkout.objects.filter(
        client=profile,
        assigned_date=today
    )
    
    # Get recent progress for visualization
    recent_progress = Progress.objects.filter(client=profile).order_by('-date')[:10]
    
    # Calculate weight trend (last 5 entries)
    weight_trend = []
    weight_trend_bars = []
    if recent_progress:
        for idx, entry in enumerate(reversed(recent_progress[:5])):
            if entry.weight:
                weight = float(entry.weight)
                left = (idx + 1) * 60
                height = (weight + 100) * 1.5
                weight_trend.append({
                    'date': entry.date.strftime('%m/%d'),
                    'weight': weight
                })
                weight_trend_bars.append({
                    'date': entry.date.strftime('%m/%d'),
                    'weight': weight,
                    'left': left,
                    'height': height
                })
    
    # Calculate BMI if we have height and weight
    current_bmi = None
    if profile.height_feet and profile.height_inches and profile.current_weight:
        height_inches = (profile.height_feet * 12) + profile.height_inches
        height_meters = float(height_inches) * 0.0254
        weight_kg = float(profile.current_weight) * 0.453592
        current_bmi = round(weight_kg / (height_meters ** 2), 1)
    
    # Get nutrition plan
    try:
        nutrition_plan = NutritionPlan.objects.filter(client=profile).latest('created_at')
    except NutritionPlan.DoesNotExist:
        nutrition_plan = None
    
    # Get unread messages
    unread_messages = Message.objects.filter(recipient=request.user, read=False).count()
    
    # Get workout completion stats
    total_workouts = ClientWorkout.objects.filter(client=profile).count()
    completed_workouts = ClientWorkout.objects.filter(client=profile, completed=True).count()
    completion_rate = round((completed_workouts / total_workouts * 100) if total_workouts > 0 else 0, 1)
    
    context = {
        'profile': profile,
        'todays_workouts': todays_workouts,
        'recent_progress': recent_progress,
        'weight_trend': weight_trend,
        'weight_trend_bars': weight_trend_bars,
        'current_bmi': current_bmi,
        'nutrition_plan': nutrition_plan,
        'unread_messages': unread_messages,
        'total_workouts': total_workouts,
        'completed_workouts': completed_workouts,
        'completion_rate': completion_rate,
    }
    return render(request, 'core/dashboard.html', context)

@login_required
def profile(request):
    try:
        profile = request.user.clientprofile
    except ClientProfile.DoesNotExist:
        profile = ClientProfile.objects.create(user=request.user)
    
    if request.method == 'POST':
        form = ClientProfileForm(request.POST, instance=profile)
        if form.is_valid():
            form.save()
            messages.success(request, 'Profile updated successfully!')
            return redirect('dashboard')
    else:
        form = ClientProfileForm(instance=profile)
    
    return render(request, 'core/profile.html', {'form': form, 'profile': profile})

@login_required
def workouts(request):
    profile = request.user.clientprofile
    assigned_workouts = ClientWorkout.objects.filter(client=profile).order_by('-assigned_date')
    
    return render(request, 'core/workouts.html', {
        'assigned_workouts': assigned_workouts
    })

@login_required
def workout_detail(request, workout_id):
    client_workout = get_object_or_404(ClientWorkout, id=workout_id, client=request.user.clientprofile)
    
    if request.method == 'POST':
        if 'complete' in request.POST:
            client_workout.completed = True
            client_workout.completed_date = timezone.now()
            client_workout.save()
            messages.success(request, 'Workout marked as completed!')
            return redirect('workouts')
    
    return render(request, 'core/workout_detail.html', {
        'client_workout': client_workout
    })

@login_required
def progress(request):
    profile = request.user.clientprofile
    progress_entries = Progress.objects.filter(client=profile).order_by('-date')
    
    if request.method == 'POST':
        form = ProgressForm(request.POST)
        if form.is_valid():
            progress_entry = form.save(commit=False)
            progress_entry.client = profile
            progress_entry.save()
            messages.success(request, 'Progress entry added successfully!')
            return redirect('progress')
    else:
        form = ProgressForm()
    
    return render(request, 'core/progress.html', {
        'progress_entries': progress_entries,
        'form': form
    })

@login_required
def nutrition(request):
    profile = request.user.clientprofile
    nutrition_plans = NutritionPlan.objects.filter(client=profile).order_by('-created_at')
    
    return render(request, 'core/nutrition.html', {
        'nutrition_plans': nutrition_plans
    })

@login_required
def messages_list(request):
    received_messages = Message.objects.filter(recipient=request.user).order_by('-created_at')
    sent_messages = Message.objects.filter(sender=request.user).order_by('-created_at')
    
    return render(request, 'core/messages.html', {
        'received_messages': received_messages,
        'sent_messages': sent_messages
    })

@login_required
def message_detail(request, message_id):
    message = get_object_or_404(Message, id=message_id, recipient=request.user)
    message.read = True
    message.save()
    
    return render(request, 'core/message_detail.html', {
        'message': message
    })

@login_required
def send_message(request):
    if request.method == 'POST':
        form = MessageForm(request.POST)
        if form.is_valid():
            message = form.save(commit=False)
            message.sender = request.user
            message.save()
            messages.success(request, 'Message sent successfully!')
            return redirect('messages')
    else:
        form = MessageForm()
    
    return render(request, 'core/send_message.html', {'form': form}) 