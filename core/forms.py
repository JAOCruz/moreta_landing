from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import ClientProfile, Progress, Message

class UserRegistrationForm(UserCreationForm):
    email = forms.EmailField(required=True)
    first_name = forms.CharField(max_length=30, required=True)
    last_name = forms.CharField(max_length=30, required=True)
    
    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'password1', 'password2')

class ClientProfileForm(forms.ModelForm):
    class Meta:
        model = ClientProfile
        exclude = ['user', 'created_at', 'updated_at']
        widgets = {
            'current_weight': forms.NumberInput(attrs={'step': '0.1', 'placeholder': 'e.g., 150.5 lbs'}),
            'target_weight': forms.NumberInput(attrs={'step': '0.1', 'placeholder': 'e.g., 140.0 lbs'}),
            'height_feet': forms.NumberInput(attrs={'min': '3', 'max': '8', 'placeholder': 'e.g., 5'}),
            'height_inches': forms.NumberInput(attrs={'min': '0', 'max': '11', 'placeholder': 'e.g., 9'}),
            'medical_conditions': forms.Textarea(attrs={'rows': 3, 'placeholder': 'Any medical conditions or injuries...'}),
            'dietary_restrictions': forms.Textarea(attrs={'rows': 3, 'placeholder': 'Any dietary restrictions or allergies...'}),
        }
    
    def clean_height_inches(self):
        height_inches = self.cleaned_data.get('height_inches')
        if height_inches is not None and (height_inches < 0 or height_inches > 11):
            raise forms.ValidationError("Height in inches must be between 0 and 11.")
        return height_inches
    
    def clean_height_feet(self):
        height_feet = self.cleaned_data.get('height_feet')
        if height_feet is not None and (height_feet < 3 or height_feet > 8):
            raise forms.ValidationError("Height in feet must be between 3 and 8.")
        return height_feet

class ProgressForm(forms.ModelForm):
    enable_body_fat = forms.BooleanField(required=False, label="Track Body Fat %")
    enable_muscle_mass = forms.BooleanField(required=False, label="Track Muscle Mass (lbs)")
    strength = forms.ChoiceField(
        choices=[('less', 'Less'), ('same', 'Same'), ('more', 'More')],
        required=False,
        label="Strength"
    )
    energy = forms.ChoiceField(
        choices=[('less', 'Less'), ('same', 'Same'), ('more', 'More')],
        required=False,
        label="Energy"
    )

    class Meta:
        model = Progress
        exclude = ['client']
        widgets = {
            'date': forms.DateInput(attrs={'type': 'date'}),
            'weight': forms.NumberInput(attrs={'step': '0.1', 'placeholder': 'e.g., 150.5 lbs'}),
            'body_fat_percentage': forms.NumberInput(attrs={'step': '0.1', 'placeholder': 'e.g., 15.5%'}),
            'muscle_mass': forms.NumberInput(attrs={'step': '0.1', 'placeholder': 'e.g., 120.0 lbs'}),
            'notes': forms.Textarea(attrs={'rows': 3, 'placeholder': 'Any notes about your progress...'}),
        }

    def clean(self):
        cleaned_data = super().clean()
        if not cleaned_data.get('enable_body_fat'):
            cleaned_data['body_fat_percentage'] = None
        if not cleaned_data.get('enable_muscle_mass'):
            cleaned_data['muscle_mass'] = None
        return cleaned_data

class MessageForm(forms.ModelForm):
    class Meta:
        model = Message
        fields = ['recipient', 'subject', 'content']
        widgets = {
            'content': forms.Textarea(attrs={'rows': 5}),
        } 