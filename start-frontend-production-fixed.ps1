# Frontend Production Startup Script (Fixed Environment Variables)
# Port: 4173, Backend: Port 8080

Write-Host "🏭 Furniture Store Frontend - PRODUCTION STARTUP" -ForegroundColor Red
Write-Host "===============================================" -ForegroundColor Yellow
Write-Host "Frontend Port: 4173" -ForegroundColor Cyan
Write-Host "Backend URL:   http://localhost:8080/furniture-store/api" -ForegroundColor Cyan
Write-Host "Database:      Azure MySQL" -ForegroundColor Cyan
Write-Host ""

# Set working directory
Set-Location "c:\Project\reactjs\furnitureStore"

# Set production environment variables BEFORE build
Write-Host "🔧 Setting production environment variables..." -ForegroundColor Blue
$env:VITE_BACKEND_URL = "http://localhost:8080/furniture-store/api"
$env:VITE_ENVIRONMENT = "production" 
$env:NODE_ENV = "production"
$env:VITE_DEBUG = "false"

# Display environment for verification
Write-Host "📋 Environment Configuration:" -ForegroundColor Green
Write-Host "   VITE_BACKEND_URL: $env:VITE_BACKEND_URL" -ForegroundColor White
Write-Host "   VITE_ENVIRONMENT: $env:VITE_ENVIRONMENT" -ForegroundColor White
Write-Host "   NODE_ENV: $env:NODE_ENV" -ForegroundColor White
Write-Host ""

# Check backend connectivity
Write-Host "🔍 Verifying backend connection..." -ForegroundColor Blue
try {
    $testResponse = Invoke-RestMethod -Uri "$env:VITE_BACKEND_URL/products?limit=1" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend is accessible and responding" -ForegroundColor Green
    Write-Host "   Sample product: $($testResponse[0].nameEn)" -ForegroundColor White
} catch {
    Write-Host "⚠️  Backend connection failed: $_" -ForegroundColor Yellow
    Write-Host "💡 Ensure backend is running: .\start-prod.ps1 (in backend folder)" -ForegroundColor Cyan
    $continue = Read-Host "Continue with frontend startup anyway? (y/N)"
    if ($continue.ToLower() -ne "y") {
        exit 1
    }
}

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Clean previous build
Write-Host "🧹 Cleaning previous build..." -ForegroundColor Blue
if (Test-Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force
}

# Build with environment variables
Write-Host "🏗️  Building production bundle with correct backend URL..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed - check the errors above" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Build completed successfully" -ForegroundColor Green
Write-Host ""

# Start preview server
Write-Host "🏭 Starting production preview server..." -ForegroundColor Blue
Write-Host ""
Write-Host "===============================================" -ForegroundColor Green
Write-Host "🌐 PRODUCTION FRONTEND READY!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host "Frontend URL: http://localhost:4173/" -ForegroundColor Cyan
Write-Host "Backend API:  $env:VITE_BACKEND_URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "👤 Login Credentials:" -ForegroundColor White
Write-Host "   mike_chen2 / password123" -ForegroundColor Green
Write-Host "   test_login / password123" -ForegroundColor Green
Write-Host ""
Write-Host "🛑 Press Ctrl+C to stop the server" -ForegroundColor Red
Write-Host "===============================================" -ForegroundColor Green

# Start on port 4173
npm run preview -- --port 4173