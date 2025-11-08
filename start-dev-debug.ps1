# Frontend Debug Environment Startup Script  
# Port: 5174, Backend: Port 8082 (Debug Mode)

Write-Host "🐛 Starting Furniture Store Frontend - DEBUG Mode" -ForegroundColor Magenta
Write-Host "📍 Frontend Port: 5174" -ForegroundColor Yellow
Write-Host "🔗 Backend API: Port 8082 (Debug + Local MySQL)" -ForegroundColor Yellow  
Write-Host "🔍 Debug Mode: ENABLED" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

# Set environment variables for debug mode
$env:VITE_BACKEND_URL = "http://localhost:8082/furniture-store/api"
$env:VITE_ENVIRONMENT = "debug"  
$env:VITE_DEBUG = "true"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Check if backend is running on port 8082  
Write-Host "🔍 Checking backend connectivity..." -ForegroundColor Blue
try {
    $null = Test-NetConnection -ComputerName "localhost" -Port 8082 -WarningAction SilentlyContinue -ErrorAction Stop
    Write-Host "✅ Debug backend is running on port 8082" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Debug backend is not running on port 8082" -ForegroundColor Yellow
    Write-Host "💡 Start debug backend with: .\start-dev-debug.ps1 (in backend folder)" -ForegroundColor Cyan
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue.ToLower() -ne "y") {
        exit 1
    }
}

# Start development server in debug mode
Write-Host "🐛 Starting Vite development server in DEBUG mode..." -ForegroundColor Blue
Write-Host "" -ForegroundColor White
Write-Host "🌐 Application URLs:" -ForegroundColor Green
Write-Host "   Frontend:     http://localhost:5174/" -ForegroundColor White
Write-Host "   Backend API:  http://localhost:8082/furniture-store/api/" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "🐛 Debug Information:" -ForegroundColor Magenta
Write-Host "   Backend Debug Port: 5005 (for IDE attachment)" -ForegroundColor White
Write-Host "   Enhanced Logging: Enabled" -ForegroundColor White
Write-Host "   API Request Tracing: Enabled" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "📝 Test Credentials:" -ForegroundColor Green
Write-Host "   Username: mike_chen2 | Password: password123" -ForegroundColor White
Write-Host "   Username: test_login | Password: password123" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "🔧 Environment: DEBUG (Local MySQL + Enhanced Logging)" -ForegroundColor Cyan
Write-Host "🛑 Press Ctrl+C to stop the server" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Cyan

# Start Vite dev server on port 5174 with debug configuration
npm run dev -- --port 5174