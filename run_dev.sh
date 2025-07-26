#!/bin/bash

# StartupQuest Development Server Script

echo "🚀 Starting StartupQuest Development Environment..."

# Function to cleanup background processes
cleanup() {
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start Django backend
echo "🐍 Starting Django backend on http://localhost:8000"
cd backend
source venv/bin/activate.fish
python manage.py runserver &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start React frontend
echo "⚛️  Starting React frontend on http://localhost:5173"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ Both servers are running!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend: http://localhost:8000"
echo "👨‍💼 Admin: http://localhost:8000/admin (admin/admin123)"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for background processes
wait 