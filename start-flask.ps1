# Script para iniciar el servidor Flask (Backend MIA)
# Guarda este archivo como: start-flask.ps1

Write-Host "🚀 Iniciando servidor Flask (Backend MIA)..." -ForegroundColor Cyan
Write-Host ""

# Navegar a la carpeta MIA
Set-Location -Path "C:\Users\JaiderX\Downloads\Memoria-Radar\MIA"

# Verificar que existe el entorno virtual
if (-not (Test-Path ".\venv\Scripts\python.exe")) {
    Write-Host "❌ Error: No se encontró el entorno virtual en .\venv" -ForegroundColor Red
    Write-Host "   Ejecuta primero: python -m venv venv" -ForegroundColor Yellow
    pause
    exit 1
}

# Verificar que existe app_gemini.py
if (-not (Test-Path ".\app_gemini.py")) {
    Write-Host "❌ Error: No se encontró app_gemini.py" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "✅ Entorno virtual encontrado" -ForegroundColor Green
Write-Host "✅ app_gemini.py encontrado" -ForegroundColor Green
Write-Host ""
Write-Host "📡 Iniciando servidor en http://localhost:5000..." -ForegroundColor Cyan
Write-Host "   Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
Write-Host ""

# Iniciar el servidor Flask
.\venv\Scripts\python.exe .\app_gemini.py
