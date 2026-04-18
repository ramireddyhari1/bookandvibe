Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "Book & Vibe - Complete Setup" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 2: Starting services in separate windows..." -ForegroundColor Yellow
Write-Host ""

# Start Backend
Write-Host "  1. Starting Backend (port 5000)..." -ForegroundColor Cyan
$backendCmd = "cd 'c:\Users\harih\Downloads\book and vibe\backend'; npm install; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd
Start-Sleep -Seconds 2

# Start Web App
Write-Host "  2. Starting Web App (port 3000)..." -ForegroundColor Cyan
$webCmd = "cd 'c:\Users\harih\Downloads\book and vibe\web-app'; npm install; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $webCmd
Start-Sleep -Seconds 2

# Start Admin Dashboard
Write-Host "  3. Starting Admin Dashboard (port 3001)..." -ForegroundColor Cyan
$adminCmd = "cd 'c:\Users\harih\Downloads\book and vibe\admin-dashboard'; npm install; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $adminCmd
Start-Sleep -Seconds 3

# Start ngrok tunnels
Write-Host ""
Write-Host "Step 3: Starting ngrok tunnels..." -ForegroundColor Yellow
Write-Host ""

$ngrokInstalled = Get-Command ngrok -ErrorAction SilentlyContinue
if ($null -eq $ngrokInstalled) {
    Write-Host "ngrok not found. Skipping ngrok setup." -ForegroundColor Yellow
    Write-Host "Install ngrok from: https://ngrok.com/download" -ForegroundColor Cyan
} else {
    Write-Host "  1. Backend tunnel (port 5000)..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http 5000"
    Start-Sleep -Seconds 1

    Write-Host "  2. Web App tunnel (port 3000)..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http 3000"
    Start-Sleep -Seconds 1

    Write-Host "  3. Admin Dashboard tunnel (port 3001)..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http 3001"
    Start-Sleep -Seconds 1
}

Write-Host ""
Write-Host "=======================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""

Write-Host "LOCAL ACCESS:" -ForegroundColor Yellow
Write-Host "  Backend:           http://localhost:5000" -ForegroundColor Cyan
Write-Host "  Web App:           http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Admin Dashboard:   http://localhost:3001" -ForegroundColor Cyan
Write-Host ""

Write-Host "All windows are running. Check each for output." -ForegroundColor Green
Write-Host "Check ngrok windows for public URLs to share with your friend." -ForegroundColor Green
