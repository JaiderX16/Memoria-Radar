# Script para verificar el estado de los servidores
# Guarda este archivo como: check-servers.ps1

Write-Host "🔍 Verificando estado de los servidores..." -ForegroundColor Cyan
Write-Host ""

# Verificar Vite (React Frontend) - Puerto 5173
Write-Host "📱 Frontend React (Vite) - Puerto 5173:" -ForegroundColor Yellow
$viteRunning = Test-NetConnection -ComputerName localhost -Port 5173 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($viteRunning) {
    Write-Host "   ✅ CORRIENDO" -ForegroundColor Green
    Write-Host "   URL: http://localhost:5173" -ForegroundColor Gray
} else {
    Write-Host "   ❌ NO ESTÁ CORRIENDO" -ForegroundColor Red
    Write-Host "   Ejecuta: npm run dev" -ForegroundColor Yellow
}
Write-Host ""

# Verificar Flask (Backend MIA) - Puerto 5000
Write-Host "🐍 Backend Flask (MIA) - Puerto 5000:" -ForegroundColor Yellow
$flaskRunning = Test-NetConnection -ComputerName localhost -Port 5000 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($flaskRunning) {
    Write-Host "   ✅ CORRIENDO" -ForegroundColor Green
    Write-Host "   URL: http://localhost:5000" -ForegroundColor Gray
    
    # Probar endpoint /api/places
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/places?limit=1" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        $data = $response.Content | ConvertFrom-Json
        $total = if ($data.total) { $data.total } else { 0 }
        Write-Host "   📊 Lugares en BD: $total" -ForegroundColor Cyan
    } catch {
        Write-Host "   ⚠️ Error al consultar /api/places" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ NO ESTÁ CORRIENDO" -ForegroundColor Red
    Write-Host "   Ejecuta: .\start-flask.ps1" -ForegroundColor Yellow
}
Write-Host ""

# Verificar MySQL - Puerto 3306
Write-Host "🗄️ MySQL Database - Puerto 3306:" -ForegroundColor Yellow
$mysqlRunning = Test-NetConnection -ComputerName localhost -Port 3306 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($mysqlRunning) {
    Write-Host "   ✅ CORRIENDO" -ForegroundColor Green
} else {
    Write-Host "   ❌ NO ESTÁ CORRIENDO" -ForegroundColor Red
    Write-Host "   Inicia MySQL desde XAMPP/WAMP o servicios de Windows" -ForegroundColor Yellow
}
Write-Host ""

# Resumen
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
if ($viteRunning -and $flaskRunning -and $mysqlRunning) {
    Write-Host "✅ TODOS LOS SERVICIOS ESTÁN CORRIENDO" -ForegroundColor Green
    Write-Host "   Abre: http://localhost:5173" -ForegroundColor Cyan
} else {
    Write-Host "⚠️ ALGUNOS SERVICIOS NO ESTÁN CORRIENDO" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Para iniciar todos los servicios:" -ForegroundColor White
    if (-not $mysqlRunning) {
        Write-Host "  1. Inicia MySQL" -ForegroundColor Gray
    }
    if (-not $flaskRunning) {
        Write-Host "  2. Ejecuta: .\start-flask.ps1" -ForegroundColor Gray
    }
    if (-not $viteRunning) {
        Write-Host "  3. Ejecuta: npm run dev" -ForegroundColor Gray
    }
}
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
