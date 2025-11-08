# Frontend Development Environment Startup Script
# Port: 5173, Backend: Port 8081 (Development)

Write-Host "🚀 Starting Furniture Store Frontend - DEVELOPMENT Mode" -ForegroundColor Green
Write-Host "📍 Frontend Port: 5173" -ForegroundColor Yellow  
Write-Host "🔗 Backend API: Port 8081 (Local MySQL)" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

# Set environment variables for development
$env:VITE_BACKEND_URL = "http://localhost:8081/furniture-store/api"
$env:VITE_ENVIRONMENT = "development"
$env:VITE_DEBUG = "false"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Check if backend is running on port 8081
Write-Host "🔍 Checking backend connectivity..." -ForegroundColor Blue
try {
    $null = Test-NetConnection -ComputerName "localhost" -Port 8081 -WarningAction SilentlyContinue -ErrorAction Stop
    Write-Host "✅ Backend is running on port 8081" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend is not running on port 8081" -ForegroundColor Yellow
    Write-Host "💡 Start backend with: .\start-dev.ps1 (in backend folder)" -ForegroundColor Cyan
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue.ToLower() -ne "y") {
        exit 1
    }
}

# Start development server
Write-Host "🎯 Starting Vite development server..." -ForegroundColor Blue
Write-Host "" -ForegroundColor White
Write-Host "🌐 Application URLs:" -ForegroundColor Green  
Write-Host "   Frontend:     http://localhost:5173/" -ForegroundColor White
Write-Host "   Backend API:  http://localhost:8081/furniture-store/api/" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "📝 Test Credentials:" -ForegroundColor Green
Write-Host "   Username: mike_chen2 | Password: password123" -ForegroundColor White
Write-Host "   Username: test_login | Password: password123" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "🔧 Environment: DEVELOPMENT (Local MySQL)" -ForegroundColor Cyan
Write-Host "🛑 Press Ctrl+C to stop the server" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Cyan

# Start Vite dev server on port 5173
npm run dev -- --port 5173