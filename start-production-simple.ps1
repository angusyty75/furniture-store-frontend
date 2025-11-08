# Simple Production Startup Script (Windows Compatible)
Write-Host "🏭 Starting Production Environment (Windows Compatible)" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan

Set-Location "c:\Project\reactjs\furnitureStore"

# Set production environment variables
Write-Host "🔧 Setting environment variables..." -ForegroundColor Blue
$env:VITE_BACKEND_URL = "http://localhost:8080/furniture-store/api"
$env:VITE_ENVIRONMENT = "production"
$env:NODE_ENV = "production"

# Clean dist folder
Write-Host "🧹 Cleaning build folder..." -ForegroundColor Blue
if (Test-Path "dist") { Remove-Item -Path "dist" -Recurse -Force }

# Build with simpler configuration (no terser minification)
Write-Host "📦 Building with Windows-compatible settings..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
    Write-Host "🚀 Starting preview server on port 4173..." -ForegroundColor Blue
    Write-Host ""
    Write-Host "🌐 Frontend URL: http://localhost:4173" -ForegroundColor Cyan
    Write-Host "🔗 Backend API: http://localhost:8080/furniture-store/api" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "👤 Login: mike_chen2 / password123" -ForegroundColor Green
    Write-Host ""
    
    # Start preview server
    npm run preview -- --port 4173
} else {
    Write-Host "❌ Build failed. Trying development mode instead..." -ForegroundColor Red
    Write-Host "🔄 Starting development server..." -ForegroundColor Yellow
    $env:VITE_BACKEND_URL = "http://localhost:8080/furniture-store/api"
    npm run dev -- --port 4174
}