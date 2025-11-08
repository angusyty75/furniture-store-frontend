<#
start-frontend-easy.ps1

A simple PowerShell helper to build and run the frontend in "production preview" mode
while ensuring the built app uses the correct backend URL (so API calls go to your backend
on localhost:8080 instead of being routed to the preview server origin).

Usage examples:

# 1) Default: build and preview using backend http://localhost:8080/furniture-store/api on port 4173
.\start-frontend-easy.ps1

# 2) Custom backend URL and port (no install):
.\start-frontend-easy.ps1 -BackendUrl "http://localhost:8080/furniture-store/api" -Port 4173 -SkipInstall

# 3) Start dev server instead of preview:
.\start-frontend-easy.ps1 -Mode dev -Port 5174

Parameters:
-BackendUrl  : Backend API base URL used at build-time (default: http://localhost:8080/furniture-store/api)
-Port        : Preferred preview port (default: 4173). If taken, script will try next ports.
-SkipInstall : Skip `npm install` even if node_modules is missing.
-SkipBuild   : Skip `npm run build` (useful if you already built)
-Mode        : 'preview' (default) or 'dev' to run `npm run dev` instead
-Install     : Force installing node modules even if node_modules exists

Notes:
- You MUST run this script from project root or it will `Set-Location` to the project root.
- Setting BackendUrl is important because Vite inlines import.meta.env.* at build time.
- If you want to use relative '/api' URLs you must run a proxy that forwards /api -> backend.
#>

param(
    [string]$BackendUrl = "http://localhost:8080/furniture-store/api",
    [int]$Port = 4173,
    [switch]$SkipInstall,
    [switch]$SkipBuild,
    [ValidateSet('preview','dev')]
    [string]$Mode = 'preview',
    [switch]$Install
)

# Ensure path
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if ($scriptDir) { Set-Location $scriptDir }

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "Start Frontend Easy - Mode: $Mode" -ForegroundColor Green
Write-Host "Project: $PWD" -ForegroundColor Yellow
Write-Host "Backend URL (build-time): $BackendUrl" -ForegroundColor Yellow
Write-Host "Preferred Port: $Port" -ForegroundColor Yellow
Write-Host "SkipInstall: $SkipInstall  SkipBuild: $SkipBuild" -ForegroundColor Yellow
Write-Host "===============================================" -ForegroundColor Cyan

# Ensure node is available
try {
    node --version > $null
} catch {
    Write-Host "Node.js is not found in PATH. Please install Node.js (>=16) and re-run." -ForegroundColor Red
    exit 1
}

# Optionally install dependencies
$needInstall = -not (Test-Path "node_modules") -or $Install.IsPresent
if ($needInstall -and -not $SkipInstall.IsPresent) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ npm install failed" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "📦 node_modules found or install skipped" -ForegroundColor Green
}

# Optionally clean previous build
if (Test-Path "dist") {
    Write-Host "🧹 Removing existing dist/..." -ForegroundColor Cyan
    try { Remove-Item -Path "dist" -Recurse -Force -ErrorAction Stop } catch { }
}

# Build step (unless skipped)
if (-not $SkipBuild.IsPresent) {
    Write-Host "🏗️  Building for production (embedding backend URL)..." -ForegroundColor Cyan
    # Set environment variable for Vite build (PowerShell assignment)
    $env:VITE_BACKEND_URL = $BackendUrl
    $env:VITE_API_BASE_URL = $BackendUrl
    $env:VITE_ENVIRONMENT = "production"
    # Run build
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Build finished" -ForegroundColor Green
} else {
    Write-Host "⚠️  Skipping build as requested" -ForegroundColor Yellow
}

# If running dev mode, start dev server
if ($Mode -eq 'dev') {
    Write-Host "🚧 Starting development server (dev)..." -ForegroundColor Cyan
    npm run dev -- --port $Port
    exit 0
}

# For preview: find a free port (try up to 10 ports starting from $Port)
$maxTries = 10
$startPort = $Port
$selectedPort = $null
for ($i=0; $i -lt $maxTries; $i++) {
    $tryPort = $startPort + $i
    # Check availability using Test-NetConnection (may require admin or newer PS)
    $conn = $null
    try {
        $conn = Test-NetConnection -ComputerName 'localhost' -Port $tryPort -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    } catch {
        # If Test-NetConnection not available (older PS), do a TCP attempt
        try {
            $tcp = New-Object System.Net.Sockets.TcpClient
            $async = $tcp.BeginConnect('127.0.0.1',$tryPort,$null,$null)
            $connected = $async.AsyncWaitHandle.WaitOne(200)
            if ($connected) { $tcp.EndConnect($async); $tcp.Close(); $conn = @{ TcpTestSucceeded = $true } }
            else { $conn = @{ TcpTestSucceeded = $false } }
        } catch { $conn = @{ TcpTestSucceeded = $false } }
    }

    if ($conn -and $conn.TcpTestSucceeded) {
        Write-Host "Port $tryPort in use, trying next..." -ForegroundColor Yellow
        continue
    } else {
        $selectedPort = $tryPort
        break
    }
}

if (-not $selectedPort) {
    Write-Host "❌ Could not find a free port to start preview server" -ForegroundColor Red
    exit 1
}

Write-Host "🌐 Starting preview server on port $selectedPort" -ForegroundColor Cyan
Write-Host "   Frontend URL: http://localhost:$selectedPort/" -ForegroundColor Green
Write-Host "   Backend API:  $BackendUrl" -ForegroundColor Green

# Start Vite preview and pass host so network is available where applicable
# Note: preview will block this terminal; you can run this script in its own terminal window.
npm run preview -- --port $selectedPort --host

# End
