# ACM Website — Start All Dev Servers
# Run this from d:\acm-website\acm-root\
# Each sub-app opens in its own terminal window.

$rootDir = Split-Path -Parent $PSScriptRoot
if (-not $rootDir) { $rootDir = (Get-Location).Path }

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  ACM WEBSITE — Starting All Development Servers" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Root Shell    : http://localhost:3001  (acm-root)" -ForegroundColor White
Write-Host "  Frontview     : http://localhost:8080  (acm-frontview)" -ForegroundColor White
Write-Host "  Homepage      : http://localhost:5173  (ACM CITY 2)" -ForegroundColor White
Write-Host "  Events        : http://localhost:5174  (acm-events)" -ForegroundColor White
Write-Host "  Editorial     : http://localhost:5175  (editorial page)" -ForegroundColor White
Write-Host "  Research      : http://localhost:5176  (acm-research)" -ForegroundColor White
Write-Host "  Our Team      : http://localhost:5177  (acm-team)" -ForegroundColor White
Write-Host "  Connect       : http://localhost:5178  (acm connect us)" -ForegroundColor White
Write-Host ""
Write-Host "  Open http://localhost:3001 to view the integrated site." -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Helper to start a sub-app in a new terminal window
function Start-SubApp {
    param(
        [string]$Title,
        [string]$Path
    )
    $absPath = Join-Path $rootDir $Path
    $pkgPath = Join-Path $absPath "package.json"
    if (-not (Test-Path $pkgPath)) {
        Write-Warning "package.json not found in $absPath — skipping $Title"
        return
    }
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "Set-Location '$absPath'; Write-Host '$Title' -ForegroundColor Cyan; npm run dev"
    ) -WindowStyle Normal
}

# Start all sub-apps
Start-SubApp "Frontview (8080)"  "acm-frontview\Earth Spinning Animation\ACM-Website-main"
Start-SubApp "Homepage (5173)"   "acm homepage\ACM CITY 2"
Start-SubApp "Events (5174)"     "acm-events\acm-events"
Start-SubApp "Editorial (5175)"  "editorial page\events-acm"
Start-SubApp "Research (5176)"   "acm-research\acm-research-v3_7_4-mesh-field"
Start-SubApp "Our Team (5177)"   "acm-team"
Start-SubApp "Connect (5178)"    "acm connect us"

# Small delay then start the root shell in this window
Write-Host "Starting Root Shell on port 3000..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Set-Location $PSScriptRoot
npm run dev
