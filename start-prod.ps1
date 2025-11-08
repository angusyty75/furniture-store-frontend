# Frontend Production Environment Startup Script
# Port: 4173, Backend: Port 8080 (Azure MySQL)

Write-Host "🏭 Starting Furniture Store Frontend - PRODUCTION Mode" -ForegroundColor Red
Write-Host "📍 Frontend Port: 4173 (Preview)" -ForegroundColor Yellow
Write-Host "🔗 Backend API: Port 8080 (Azure MySQL)" -ForegroundColor Yellow
Write-Host "☁️  Database: Azure East Asia" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

# Set environment variables for production
$env:VITE_BACKEND_URL = "http://localhost:8080/furniture-store/api"
$env:VITE_ENVIRONMENT = "production"
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

# Check if backend is running on port 8080
Write-Host "🔍 Checking production backend connectivity..." -ForegroundColor Blue
try {
    $null = Test-NetConnection -ComputerName "localhost" -Port 8080 -WarningAction SilentlyContinue -ErrorAction Stop
    Write-Host "✅ Production backend is running on port 8080" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Production backend is not running on port 8080" -ForegroundColor Yellow
    Write-Host "💡 Start production backend with: .\start-prod.ps1 (in backend folder)" -ForegroundColor Cyan
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue.ToLower() -ne "y") {
        exit 1
    }
}

# Build for production
Write-Host "📦 Building production assets..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Production build failed" -ForegroundColor Red
    exit 1
}

# Start preview server
Write-Host "🏭 Starting production preview server..." -ForegroundColor Blue
Write-Host "" -ForegroundColor White
Write-Host "🌐 Application URLs:" -ForegroundColor Green
Write-Host "   Frontend:     http://localhost:4173/" -ForegroundColor White
Write-Host "   Backend API:  http://localhost:8080/furniture-store/api/" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "☁️  Database: Azure MySQL (furniture-store-mysql-66ujtae2r6yf2)" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White
Write-Host "📝 Test Credentials:" -ForegroundColor Green
Write-Host "   Username: mike_chen2 | Password: password123" -ForegroundColor White
Write-Host "   Username: test_login | Password: password123" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "🔧 Environment: PRODUCTION (Azure MySQL + Optimized Build)" -ForegroundColor Cyan
Write-Host "🛑 Press Ctrl+C to stop the server" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Cyan

# Start production preview server on port 4173
npm run preview -- --port 4173