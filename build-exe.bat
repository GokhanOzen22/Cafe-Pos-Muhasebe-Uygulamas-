@echo off
chcp 65001 > nul
title Meriç POS - Windows EXE Oluşturucu
echo ========================================================
echo   MERİÇ BELEDİYESİ POS - WINDOWS .EXE PAKETLEYİCİ
echo ========================================================
echo.
echo 1. Gereksinimler kontrol ediliyor...
call npm install
echo.
echo 2. Uygulama ve Sunucu Derleniyor...
call npm run build
echo.
echo 3. Electron Windows EXE Installer Oluşturuluyor...
call npx electron-builder --win nsis
echo.
echo ========================================================
echo   TEBRİKLER! .EXE Kurulum Dosyanız 'dist' klasörüne üretildi!
echo   Meric_POS_Setup_2.1.0.exe dosyasını çalıştırabilirsiniz.
echo ========================================================
pause
