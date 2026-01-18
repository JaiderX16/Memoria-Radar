# Script para reiniciar Flask limpiamente
# Elimina caché de Python y reinicia el servidor

Write-Host "🧹 Limpiando procesos Python anteriores..." -ForegroundColor Cyan
Get-Process python -ErrorAction SilentlyContinue | Where-Object {$_.Path -like '*Memoria-Radar*'} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "🗑️ Eliminando archivos de caché de Python..." -ForegroundColor Cyan
Set-Location "C:\Users\JaiderX\Downloads\Memoria-Radar\MIA"
Get-ChildItem -Path . -Include __pycache__ -Recurse -Force | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path . -Include *.pyc -Recurse -Force | Remove-Item -Force -ErrorAction SilentlyContinue

Write-Host "✅ Caché eliminado" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Iniciando servidor Flask..." -ForegroundColor Cyan
Write-Host "   Base de datos: memoria" -ForegroundColor Yellow
Write-Host "   Puerto: 5000" -ForegroundColor Yellow
Write-Host ""

.\venv\Scripts\python.exe app_gemini.py
