# Development Mode with Production Backend (No Build Required)
Write-Host "🔧 Starting DEVELOPMENT MODE → PRODUCTION BACKEND" -ForegroundColor Yellow
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "Frontend: Development Server (hot reload)" -ForegroundColor Green
Write-Host "Backend:  Production (port 8080 + Azure MySQL)" -ForegroundColor Green
Write-Host ""

Set-Location "c:\Project\reactjs\furnitureStore"

# Set environment to use production backend but dev mode
$env:VITE_BACKEND_URL = "http://localhost:8080/furniture-store/api"
$env:VITE_ENVIRONMENT = "dev-prod"
$env:NODE_ENV = "development"

Write-Host "🔧 Configuration:" -ForegroundColor Blue
Write-Host "   Frontend Mode: Development (Hot Reload)" -ForegroundColor White
Write-Host "   Frontend Port: 5174" -ForegroundColor White  
Write-Host "   Backend URL:   $env:VITE_BACKEND_URL" -ForegroundColor White
Write-Host "   Database:      Azure MySQL (Production)" -ForegroundColor White
Write-Host ""

# Test backend connection
Write-Host "🔍 Testing production backend..." -ForegroundColor Blue
try {
    $response = Invoke-RestMethod -Uri "$env:VITE_BACKEND_URL/products?limit=1" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend connected - Sample: $($response[0].nameEn)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend not available: $_" -ForegroundColor Red
    Write-Host "💡 Start backend first: cd c:\Project\java\furniture-store; .\start-prod.ps1" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "🌐 DEVELOPMENT MODE READY!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host "Frontend URL: http://localhost:5174" -ForegroundColor Cyan
Write-Host "Backend API:  $env:VITE_BACKEND_URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "👤 Login: mike_chen2 / password123" -ForegroundColor White
Write-Host "🔄 Hot reload enabled" -ForegroundColor Yellow
Write-Host "🛑 Press Ctrl+C to stop" -ForegroundColor Red
Write-Host "===============================================" -ForegroundColor Green

# Start development server on port 5174 (different from normal dev port 5173)
npm run dev -- --port 5174