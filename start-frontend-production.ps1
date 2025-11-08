#!/usr/bin/env powershell
# =============================================================================
# FURNITURE STORE - FRONTEND PRODUCTION START SCRIPT  
# =============================================================================
# This script builds and starts the React frontend on port 4173
# Backend: http://localhost:8080/furniture-store/api
# Frontend: http://localhost:4173/
# =============================================================================

Write-Host ""
Write-Host "⚛️ FURNITURE STORE - FRONTEND STARTUP" -ForegroundColor Blue
Write-Host "=====================================" -ForegroundColor Blue
Write-Host ""

# Change to frontend directory
Set-Location "C:\Project\reactjs\furnitureStore"
Write-Host "📁 Working Directory: $(Get-Location)" -ForegroundColor Cyan

# Stop any existing Node processes
Write-Host "🛑 Stopping existing frontend processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "   ✅ Frontend processes stopped" -ForegroundColor Green

# Check if backend is running
Write-Host ""
Write-Host "🔗 Checking backend connection..." -ForegroundColor Yellow
try {
    $backendTest = Invoke-RestMethod -Uri "http://localhost:8080/furniture-store/api/products?limit=1" -TimeoutSec 5
    Write-Host "   ✅ Backend is responding on port 8080" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️ Backend not responding! Please start backend first." -ForegroundColor Red
    Write-Host "   💡 Run: .\start-backend-production.ps1" -ForegroundColor Yellow
    Write-Host ""
    $choice = Read-Host "Continue anyway? (y/N)"
    if ($choice -ne 'y' -and $choice -ne 'Y') {
        exit 1
    }
}

# Clean previous build
Write-Host ""
Write-Host "🧹 Cleaning previous build..." -ForegroundColor Yellow
Remove-Item "dist" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "node_modules\.vite" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "   ✅ Build cache cleaned" -ForegroundColor Green

# Set environment for localhost backend
Write-Host ""
Write-Host "🔧 Configuring environment..." -ForegroundColor Yellow
$env:VITE_BACKEND_URL = "http://localhost:8080/furniture-store/api"
$env:NODE_ENV = "production"
Write-Host "   Backend URL: $env:VITE_BACKEND_URL" -ForegroundColor Cyan
Write-Host "   Environment: $env:NODE_ENV" -ForegroundColor Cyan

# Build production bundle
Write-Host ""
Write-Host "🔨 Building production bundle..." -ForegroundColor Yellow
try {
    $buildOutput = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Frontend build successful" -ForegroundColor Green
        
        # Check if build shows localhost configuration
        $configFound = $buildOutput | Select-String "localhost:8080"
        if ($configFound) {
            Write-Host "   ✅ Localhost backend configuration confirmed" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️ Backend configuration might not be localhost" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ❌ Build failed!" -ForegroundColor Red
        Write-Host $buildOutput
        exit 1
    }
} catch {
    Write-Host "   ❌ Build error: $_" -ForegroundColor Red
    exit 1
}

# Start preview server
Write-Host ""
Write-Host "🚀 Starting production preview server..." -ForegroundColor Yellow
Write-Host "   Port: 4173" -ForegroundColor Cyan
Write-Host "   Backend: http://localhost:8080/furniture-store/api" -ForegroundColor Cyan
Write-Host ""

Write-Host "🎉 FRONTEND STARTING..." -ForegroundColor Blue
Write-Host "================================" -ForegroundColor Blue
Write-Host "🌐 Frontend URL: http://localhost:4173/" -ForegroundColor Cyan
Write-Host "🔗 Backend API: http://localhost:8080/furniture-store/api" -ForegroundColor Cyan
Write-Host "🔐 Login Credentials: mike_chen2 / password123" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 Features Available:" -ForegroundColor Yellow
Write-Host "   - User Login/Authentication ✅" -ForegroundColor Gray
Write-Host "   - Product Browsing ✅" -ForegroundColor Gray  
Write-Host "   - Shopping Cart ✅" -ForegroundColor Gray
Write-Host "   - Order Management ✅" -ForegroundColor Gray
Write-Host "   - Image Display ✅" -ForegroundColor Gray
Write-Host ""
Write-Host "✋ Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "🌍 Access the app at: http://localhost:4173/" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Blue
Write-Host ""

# Start the preview server (this will block the terminal)
npm run preview -- --port 4173 --host