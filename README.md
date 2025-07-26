# StartupQuest 🚀

A gamified startup journey platform built with React frontend and Django REST Framework backend.

## Features

### Frontend (React + Vite)
- 🎮 Gamified startup experience
- 📊 XP and leveling system
- 🏆 Achievements and milestones
- 👥 Guild collaboration
- 💬 Real-time chat
- 🤖 AI Startup Mentor chatbot
- 🎯 Daily challenges
- 📈 Leaderboards
- 🎨 Modern, responsive UI

### Backend (Django REST Framework)
- 🔐 User authentication and registration
- 👤 Custom user model with XP tracking
- 🛡️ Session-based security
- 🌐 CORS-enabled for frontend integration
- 📝 RESTful API endpoints
- 🤖 AI-powered chatbot with Gemini API
- 👨‍💼 Admin interface

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8+
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd StartupQuest
   ```

2. **Set up the backend:**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate.fish  # For fish shell
   # or source venv/bin/activate  # For bash/zsh
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

3. **Set up the frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Or use the development script:**
   ```bash
   ./run_dev.sh
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/profile/` - Get user profile

### Chatbot
- `POST /api/chatbot/chat/` - AI startup mentor chat

### Example Usage

#### Register a new user:
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "founder123",
    "email": "founder@startup.com",
    "password": "securepass123",
    "confirm_password": "securepass123"
  }'
```

#### Login:
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "founder123",
    "password": "securepass123"
  }'
```

## Admin Access

- **URL:** http://localhost:8000/admin/
- **Username:** admin
- **Password:** admin123

## Project Structure

```
StartUp_Quest/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── ...
│   ├── package.json
│   └── ...
├── backend/                 # Django backend
│   ├── authentication/     # Auth app
│   ├── startupquest_backend/  # Main project
│   ├── requirements.txt
│   └── ...
├── run_dev.sh              # Development script
└── README.md
```

## Development

### Backend Development
- Django 5.2.4
- Django REST Framework 3.16.0
- SQLite database (can be changed to PostgreSQL/MySQL)
- Custom User model with XP tracking

### Frontend Development
- React 19.1.0
- Vite 7.0.4
- Lucide React icons
- Modern CSS with responsive design

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue on GitHub. 