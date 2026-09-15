@echo off
chcp 65001 > nul
title Meriç Belediyesi POS Kasa Sunucusu
echo ========================================================
echo   MERİÇ BELEDİYESİ SOSYAL TESİSLERİ KASA SUNUCUSU
echo ========================================================
echo.
echo Sunucu başlatılıyor, lütfen bekleyin...
echo.

npm run build && npm start

pause
