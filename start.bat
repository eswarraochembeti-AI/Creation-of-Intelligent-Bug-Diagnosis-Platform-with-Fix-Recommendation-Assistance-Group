@echo off
echo ======================================================================
echo Starting Intelligent Bug Diagnosis Platform with Fix Recommendation Assistance
echo ======================================================================
echo.

echo Launching Backend API Server (FastAPI on http://localhost:8000)...
start "Bug Platform Backend" cmd /k "python -m uvicorn backend.main:app --reload --port 8000"

echo Launching Frontend Server (Vite on http://localhost:5173)...
start "Bug Platform Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ======================================================================
echo Both servers are starting!
echo Frontend: http://localhost:5173
echo Backend API Docs: http://localhost:8000/docs
echo ======================================================================
