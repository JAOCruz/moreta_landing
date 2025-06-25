from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

class ClientProfile(models.Model):
    EXPERIENCE_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    
    GOAL_CHOICES = [
        ('weight_loss', 'Weight Loss'),
        ('muscle_gain', 'Muscle Gain'),
        ('strength', 'Strength Training'),
        ('endurance', 'Endurance'),
        ('general_fitness', 'General Fitness'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=15, blank=True)
    current_weight = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True, help_text="Weight in pounds (lbs)")
    target_weight = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True, help_text="Target weight in pounds (lbs)")
    height_feet = models.IntegerField(null=True, blank=True, help_text="Height in feet")
    height_inches = models.IntegerField(null=True, blank=True, help_text="Height in inches (0-11)")
    age = models.IntegerField(null=True, blank=True)
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_CHOICES, default='beginner')
    fitness_goals = models.CharField(max_length=20, choices=GOAL_CHOICES, default='general_fitness')
    medical_conditions = models.TextField(blank=True)
    dietary_restrictions = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"
    
    def get_height_display(self):
        if self.height_feet and self.height_inches is not None:
            return f"{self.height_feet}' {self.height_inches}\""
        elif self.height_feet:
            return f"{self.height_feet}'"
        return "Not provided"

class Workout(models.Model):
    WORKOUT_TYPE_CHOICES = [
        ('strength', 'Strength Training'),
        ('cardio', 'Cardio'),
        ('flexibility', 'Flexibility'),
        ('hiit', 'HIIT'),
        ('yoga', 'Yoga'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    workout_type = models.CharField(max_length=20, choices=WORKOUT_TYPE_CHOICES)
    duration_minutes = models.IntegerField()
    difficulty_level = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    instructions = models.TextField()
    video_url = models.URLField(blank=True)
    # Temporarily removed image field to avoid Pillow dependency
    # image = models.ImageField(upload_to='workouts/', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title

class ClientWorkout(models.Model):
    client = models.ForeignKey(ClientProfile, on_delete=models.CASCADE)
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE)
    assigned_date = models.DateField()
    completed = models.BooleanField(default=False)
    completed_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        unique_together = ['client', 'workout', 'assigned_date']
    
    def __str__(self):
        return f"{self.client.user.username} - {self.workout.title}"

class Progress(models.Model):
    client = models.ForeignKey(ClientProfile, on_delete=models.CASCADE)
    date = models.DateField()
    weight = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True, help_text="Weight in pounds (lbs)")
    body_fat_percentage = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    muscle_mass = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True, help_text="Muscle mass in pounds (lbs)")
    notes = models.TextField(blank=True)
    
    class Meta:
        unique_together = ['client', 'date']
    
    def __str__(self):
        return f"{self.client.user.username} - {self.date}"

class NutritionPlan(models.Model):
    client = models.ForeignKey(ClientProfile, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()
    daily_calories = models.IntegerField()
    protein_grams = models.IntegerField()
    carbs_grams = models.IntegerField()
    fat_grams = models.IntegerField()
    meal_plan = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.client.user.username} - {self.title}"

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    subject = models.CharField(max_length=200)
    content = models.TextField()
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.sender.username} to {self.recipient.username}: {self.subject}" 