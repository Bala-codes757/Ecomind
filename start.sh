#!/bin/bash
echo "=================================================="
echo "🌱 Starting EcoMind Full-Stack Application"
echo "=================================================="

echo "Starting Backend Server on http://localhost:5000..."
(cd backend && node server.js) &

echo "Starting Frontend Server on http://localhost:3000..."
(cd frontend && npm run dev) &

wait
