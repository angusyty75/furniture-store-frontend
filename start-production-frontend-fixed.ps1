# Production Frontend Startup - FIXED VERSION
Write-Host "🎨 FURNITURE STORE - PRODUCTION FRONTEND (FIXED)" -ForegroundColor Magenta
Write-Host "===============================================" -ForegroundColor Yellow
Write-Host "Frontend: Port 4173 | Backend: Port 8080 | Database: Azure MySQL" -ForegroundColor Cyan
Write-Host ""

Set-Location "c:\Project\reactjs\furnitureStore"

# FIXED: Set environment variables to use direct backend URL instead of proxy
Write-Host "🔧 Setting environment variables (DIRECT BACKEND)..." -ForegroundColor Blue
$env:VITE_BACKEND_URL = "http://localhost:8080/furniture-store/api"
$env:VITE_API_BASE_URL = "http://localhost:8080/furniture-store/api"
$env:VITE_ENVIRONMENT = "production"
$env:NODE_ENV = "production"

Write-Host "📋 Configuration:" -ForegroundColor Green
Write-Host "   Backend URL: $env:VITE_BACKEND_URL" -ForegroundColor White
Write-Host "   Environment: $env:VITE_ENVIRONMENT" -ForegroundColor White
Write-Host ""

# Test backend connection
Write-Host "🔍 Testing backend connection (port 8080)..." -ForegroundColor Blue
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/furniture-store/api/products?limit=1" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend is responding!" -ForegroundColor Green
    Write-Host "   Sample product: $($response.nameEn)" -ForegroundColor White
} catch {
    Write-Host "❌ Backend connection failed: $_" -ForegroundColor Red
    Write-Host "💡 Start backend first:" -ForegroundColor Cyan
    Write-Host "   cd c:\Project\java\furniture-store" -ForegroundColor White
    Write-Host "   .\start-production-backend.ps1" -ForegroundColor White
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

# Build for production
Write-Host "🏗️  Building production bundle..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build completed successfully" -ForegroundColor Green
    Write-Host "🚀 Starting production preview server..." -ForegroundColor Blue
    Write-Host ""
    Write-Host "===============================================" -ForegroundColor Green
    Write-Host "🎨 PRODUCTION FRONTEND READY!" -ForegroundColor Green
    Write-Host "===============================================" -ForegroundColor Green
    Write-Host "🌐 Frontend URL: http://localhost:4173/" -ForegroundColor Cyan
    Write-Host "🔗 Backend API:  http://localhost:8080/furniture-store/api" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "👤 Login Credentials:" -ForegroundColor White
    Write-Host "   mike_chen2 / password123" -ForegroundColor Green
    Write-Host "   test_login / password123" -ForegroundColor Green
    Write-Host ""
    Write-Host "💾 Database: Azure MySQL (Production)" -ForegroundColor Yellow
    Write-Host "🛑 Press Ctrl+C to stop the server" -ForegroundColor Red
    Write-Host "===============================================" -ForegroundColor Green
    
    # Start preview server on port 4173
    npm run preview -- --port 4173 --host
} else {
    Write-Host "❌ Build failed - trying development mode instead..." -ForegroundColor Red
    Write-Host "🔄 Starting development server on port 5174..." -ForegroundColor Yellow
    npm run dev -- --port 5174 --host
}