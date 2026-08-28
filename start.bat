@echo off
echo ==================================================
echo 🌱 Starting EcoMind Full-Stack Application
echo ==================================================
echo.
echo 1. Starting Backend Server on http://localhost:5000...
start "EcoMind Backend" cmd /k "cd backend && node server.js"
echo.
echo 2. Starting Frontend Dev Server on http://localhost:3000...
start "EcoMind Frontend" cmd /k "cd frontend && npm run dev"
echo.
echo ==================================================
echo Success! EcoMind is starting in background windows.
echo Access the app at: http://localhost:3000/
echo ==================================================
