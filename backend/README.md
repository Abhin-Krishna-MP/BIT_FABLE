# StartupQuest Backend

A Django REST Framework backend for the StartupQuest application.

## Features

- User registration and authentication
- Custom User model with XP and level tracking
- RESTful API endpoints
- CORS configuration for frontend integration
- Session-based authentication

## Setup

1. **Create and activate virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate.fish  # For fish shell
   # or
   source venv/bin/activate  # For bash/zsh
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables:**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and add your API keys
   # GEMINI_API_KEY=your_gemini_api_key_here
   # SECRET_KEY=your_django_secret_key_here
   ```

4. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

5. **Create superuser (optional):**
   ```bash
   python manage.py createsuperuser
   ```

6. **Run the development server:**
   ```bash
   python manage.py runserver
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/profile/` - Get user profile

### Chatbot (AI Startup Mentor)

- `POST /api/chatbot/chat/` - Send message to AI startup mentor

### Request/Response Examples

#### Register
```json
POST /api/auth/register/
{
    "username": "founder123",
    "email": "founder@startup.com",
    "password": "securepass123",
    "confirm_password": "securepass123"
}
```

#### Login
```json
POST /api/auth/login/
{
    "username": "founder123",
    "password": "securepass123"
}
```

#### Response
```json
{
    "message": "Login successful",
    "user": {
        "id": 1,
        "username": "founder123",
        "email": "founder@startup.com",
        "level": 1,
        "xp": 0,
        "created_at": "2024-01-01T00:00:00Z"
    }
}
```

#### Chatbot
```json
POST /api/chatbot/chat/
{
    "message": "How do I validate my startup idea?"
}
```

#### Chatbot Response
```json
{
    "message": "Validating your startup idea requires a multi-pronged approach. Start with lean customer discovery – conduct interviews and surveys to understand your target market's needs and pain points. Then, build a Minimum Viable Product (MVP) to test your core hypothesis and gather user feedback iteratively. Finally, analyze your data to assess product-market fit and adjust accordingly.",
    "success": true
}
```

## Admin Access

- URL: `http://localhost:8000/admin/`
- Username: `admin`
- Password: `admin123`

## Configuration

The backend is configured to work with the React frontend running on:
- `http://localhost:5173` (Vite dev server)
- `http://127.0.0.1:5173`

CORS is enabled for these origins to allow frontend-backend communication. 