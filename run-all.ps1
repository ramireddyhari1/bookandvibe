# Book & Vibe - Full Stack Development Setup
# This script starts all three services and exposes them via ngrok

# Configuration
$WORKSPACE = "c:\Users\harih\Downloads\book and vibe"
$BACKEND_PORT = 5000
$WEB_APP_PORT = 3000
$ADMIN_PORT = 3001

# Colors for output
function Write-Header {
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host $args[0] -ForegroundColor Cyan
    Write-Host "===============================================" -ForegroundColor Cyan
}

function Write-Step {
    Write-Host $args[0] -ForegroundColor Yellow
}

# Check ngrok installation
function Check-Ngrok {
    $ngrokPath = Get-Command ngrok -ErrorAction SilentlyContinue
    if ($null -eq $ngrokPath) {
        Write-Host "WARNING: ngrok not installed!" -ForegroundColor Red
        Write-Host "Install from: https://ngrok.com/download" -ForegroundColor Yellow
        Write-Host "Or run: choco install ngrok (if using Chocolatey)" -ForegroundColor Yellow
        return $false
    }
    return $true
}

Write-Header "Book & Vibe - Full Stack Development Server"

# Check if ngrok is available
$ngrokAvailable = Check-Ngrok
Write-Host ""

# Function to start a service
function Start-Service {
    param(
        [string]$Name,
        [string]$Path,
        [string]$Port,
        [int]$Order
    )
    
    Write-Step "[$Order] Starting $Name on port $Port..."
    
    $job = Start-Job -ScriptBlock {
        param($path, $port, $name)
        Set-Location $path
        Write-Host "📦 Installing dependencies for $name..."
        npm install
        Write-Host "🚀 Starting $name..."
        npm run dev
    } -ArgumentList $Path, $Port, $Name
    
    return $job
}

# Start services
Write-Host "Starting all services..." -ForegroundColor Green
Write-Host ""

$backendJob = Start-Service "Backend" "$WORKSPACE\backend" $BACKEND_PORT 1
Start-Sleep -Seconds 3

$webAppJob = Start-Service "Web App" "$WORKSPACE\web-app" $WEB_APP_PORT 2
Start-Sleep -Seconds 3

$adminJob = Start-Service "Admin Dashboard" "$WORKSPACE\admin-dashboard" $ADMIN_PORT 3
Start-Sleep -Seconds 5

Write-Host ""
Write-Header "Services Status"
Write-Host "Backend:          Starting... (check job output)" -ForegroundColor Green
Write-Host "Web App:          Starting... (check job output)" -ForegroundColor Green
Write-Host "Admin Dashboard:  Starting... (check job output)" -ForegroundColor Green

# Optional: Start ngrok tunnels
if ($ngrokAvailable) {
    Write-Host ""
    Write-Header "Setting up ngrok tunnels"
    
    Write-Step "Starting ngrok tunnels..."
    
    $ngrokBackend = Start-Job -ScriptBlock { ngrok http 5000 --log=stdout } -Name "ngrok-backend"
    Start-Sleep -Seconds 2
    
    $ngrokWeb = Start-Job -ScriptBlock { ngrok http 3000 --log=stdout } -Name "ngrok-web"
    Start-Sleep -Seconds 2
    
    $ngrokAdmin = Start-Job -ScriptBlock { ngrok http 3001 --log=stdout } -Name "ngrok-admin"
    Start-Sleep -Seconds 2
    
    Write-Host "✓ ngrok tunnels started!" -ForegroundColor Green
}

Write-Host ""
Write-Header "🎉 All Services Running!"

Write-Host ""
Write-Host "LOCAL ACCESS:" -ForegroundColor Green
Write-Host "  Backend:          http://localhost:5000" -ForegroundColor Cyan
Write-Host "  Web App:          http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Admin Dashboard:  http://localhost:3001" -ForegroundColor Cyan

if ($ngrokAvailable) {
    Write-Host ""
    Write-Host "NGROK TUNNELS:" -ForegroundColor Green
    Write-Host "  Check the command output above for public URLs" -ForegroundColor Yellow
    Write-Host "  Backend tunnel:       ngrok http 5000" -ForegroundColor Cyan
    Write-Host "  Web App tunnel:       ngrok http 3000" -ForegroundColor Cyan
    Write-Host "  Admin Dashboard tunnel: ngrok http 3001" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "To view running jobs:" -ForegroundColor Gray
Write-Host "  Get-Job" -ForegroundColor Gray
Write-Host ""
Write-Host "To stop all services:" -ForegroundColor Gray
Write-Host "  Get-Job | Stop-Job" -ForegroundColor Gray
Write-Host ""
