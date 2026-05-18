@echo off
title Gerador de Carteirinha

where node >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado.
    echo Instale em: https://nodejs.org  (versao LTS)
    pause
    exit /b 1
)

if not exist "dist\" (
    echo Preparando aplicacao pela primeira vez, aguarde...
    call npm install --silent
    call npm run build
    if errorlevel 1 (
        echo [ERRO] Falha ao preparar a aplicacao.
        pause
        exit /b 1
    )
)

echo Abrindo o navegador...
node server.js
