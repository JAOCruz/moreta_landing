# Moreta Fitness - Django Web Application

A comprehensive fitness coaching web application built with Django, featuring user authentication, personalized workout tracking, progress monitoring, and nutrition planning.

## Features

- **User Authentication**: Secure registration and login system
- **Client Profiles**: Detailed fitness profiles with goals and medical information
- **Workout Management**: Personalized workout assignments and tracking
- **Progress Tracking**: Monitor weight, body composition, and fitness metrics
- **Nutrition Plans**: Customized meal plans and nutritional guidance
- **Messaging System**: Communication between clients and coaches
- **Admin Panel**: Comprehensive admin interface for coaches
- **Responsive Design**: Mobile-friendly interface using Bootstrap

## Technology Stack

- **Backend**: Django 4.2.7
- **Database**: SQLite (can be easily changed to PostgreSQL/MySQL)
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap
- **Authentication**: Django's built-in authentication system
- **File Handling**: Pillow for image processing

## Installation & Setup

### Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd moreta_landing
```

### Step 2: Create Virtual Environment

```bash
python -m venv venv
```

### Step 3: Activate Virtual Environment

**On Windows:**
```bash
venv\Scripts\activate
```

**On macOS/Linux:**
```bash
source venv/bin/activate
```

### Step 4: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 5: Run Database Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### Step 6: Create Superuser (Admin)

```bash
python manage.py createsuperuser
```

### Step 7: Run the Development Server

```bash
python manage.py runserver
```

The application will be available at `http://127.0.0.1:8000/`

## Usage

### For Clients

1. **Register**: Create a new account at `/register/`
2. **Complete Profile**: Fill in your fitness information and goals
3. **Access Dashboard**: View assigned workouts, track progress, and access nutrition plans
4. **Track Progress**: Log your weight, body composition, and other metrics
5. **Communicate**: Send messages to your coach

### For Coaches (Admin)

1. **Admin Access**: Login at `/admin/` with superuser credentials
2. **Manage Clients**: View and edit client profiles
3. **Assign Workouts**: Create and assign personalized workouts
4. **Monitor Progress**: Track client progress and achievements
5. **Send Messages**: Communicate with clients through the messaging system

## Project Structure

```
moreta_landing/
├── manage.py                 # Django management script
├── requirements.txt          # Python dependencies
├── moreta_fitness/          # Main Django project
│   ├── __init__.py
│   ├── settings.py          # Django settings
│   ├── urls.py              # Main URL configuration
│   ├── wsgi.py              # WSGI configuration
│   └── asgi.py              # ASGI configuration
├── core/                    # Main application
│   ├── __init__.py
│   ├── admin.py             # Admin interface configuration
│   ├── apps.py              # App configuration
│   ├── forms.py             # Django forms
│   ├── models.py            # Database models
│   ├── urls.py              # App URL patterns
│   └── views.py             # View functions
├── templates/               # HTML templates
│   ├── base.html            # Base template
│   ├── core/                # App-specific templates
│   └── registration/        # Authentication templates
├── assets/                  # Static files (CSS, JS, images)
└── media/                   # User-uploaded files
```

## Database Models

### ClientProfile
- User information and fitness details
- Experience level, goals, medical conditions
- Current and target weight/height

### Workout
- Workout details and instructions
- Difficulty level and duration
- Video URLs and images

### ClientWorkout
- Links clients to assigned workouts
- Tracks completion status and notes

### Progress
- Progress tracking entries
- Weight, body fat, muscle mass measurements

### NutritionPlan
- Personalized nutrition plans
- Calorie and macronutrient targets

### Message
- Communication system between users
- Read/unread status tracking

## Customization

### Adding New Workout Types
1. Update `WORKOUT_TYPE_CHOICES` in `core/models.py`
2. Create new workout templates
3. Update admin interface if needed

### Modifying User Fields
1. Edit `ClientProfile` model in `core/models.py`
2. Update forms in `core/forms.py`
3. Modify templates as needed
4. Run migrations

### Styling Changes
- Modify CSS files in `assets/css/`
- Update templates in `templates/`
- Customize Bootstrap classes

## Deployment

### Production Settings
1. Update `settings.py`:
   - Set `DEBUG = False`
   - Configure `ALLOWED_HOSTS`
   - Use production database (PostgreSQL recommended)
   - Set up static file serving

2. Install production dependencies:
   ```bash
   pip install gunicorn psycopg2-binary
   ```

3. Configure web server (Nginx/Apache)

4. Set up environment variables for sensitive data

### Environment Variables
Create a `.env` file for production:
```
SECRET_KEY=your-secret-key-here
DEBUG=False
DATABASE_URL=postgresql://user:password@localhost/dbname
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.

## Changelog

### Version 1.0.0
- Initial release
- User authentication system
- Client profile management
- Workout tracking
- Progress monitoring
- Nutrition planning
- Messaging system
- Admin interface 