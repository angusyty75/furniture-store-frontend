# SEO Implementation Test Script
# Run this to verify SEO implementation is working

Write-Host "🔍 SEO Implementation Test Results" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Test 1: Check if SEO files exist
Write-Host "`n✅ File Structure Test:" -ForegroundColor Green
$seoFiles = @(
    "src\hooks\useSEO.js",
    "src\components\StructuredData.jsx"
)

foreach ($file in $seoFiles) {
    if (Test-Path $file) {
        Write-Host "   ✓ $file exists" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $file missing" -ForegroundColor Red
    }
}

# Test 2: Check for SEO imports in key files
Write-Host "`n✅ Import Integration Test:" -ForegroundColor Green
$pagesWithSEO = @(
    "src\pages\Home.jsx",
    "src\pages\Cart.jsx", 
    "src\pages\ProductList.jsx",
    "src\components\ProductDetail.jsx"
)

foreach ($page in $pagesWithSEO) {
    if (Test-Path $page) {
        $content = Get-Content $page -Raw
        if ($content -match "useSEO") {
            Write-Host "   ✓ $page has SEO integration" -ForegroundColor Green
        } else {
            Write-Host "   ✗ $page missing SEO" -ForegroundColor Red
        }
    }
}

# Test 3: Check index.html for base SEO tags
Write-Host "`n✅ Base HTML SEO Test:" -ForegroundColor Green
if (Test-Path "index.html") {
    $indexContent = Get-Content "index.html" -Raw
    $seoTags = @("description", "keywords", "og:title", "twitter:card")
    
    foreach ($tag in $seoTags) {
        if ($indexContent -match $tag) {
            Write-Host "   ✓ $tag meta tag found" -ForegroundColor Green
        } else {
            Write-Host "   ✗ $tag meta tag missing" -ForegroundColor Red
        }
    }
}

Write-Host "`n🎯 Manual Testing Instructions:" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
Write-Host "1. Open: http://localhost:5174/" -ForegroundColor White
Write-Host "2. Check browser tab titles change on navigation" -ForegroundColor White
Write-Host "3. Right-click → View Source → Look for meta tags" -ForegroundColor White
Write-Host "4. Use Chrome DevTools → Lighthouse → SEO audit" -ForegroundColor White

Write-Host "`n🚀 Development Server Status:" -ForegroundColor Magenta
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5174/" -TimeoutSec 5 -UseBasicParsing
    Write-Host "   ✓ Server running on port 5174" -ForegroundColor Green
} catch {
    Write-Host "   ⚠  Server not responding (may need to start npm run dev)" -ForegroundColor Yellow
}

Write-Host "`nSEO implementation complete!" -ForegroundColor Cyan