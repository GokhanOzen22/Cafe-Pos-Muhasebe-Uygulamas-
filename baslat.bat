@echo off
chcp 65001 > nul
title Meriç Belediyesi POS Kasa Sunucusu
echo ========================================================
echo   MERİÇ BELEDİYESİ SOSYAL TESİSLERİ KASA SUNUCUSU
echo ========================================================
echo.
echo Yerel Adres:      http://localhost:3000
echo Uzaktan (No-IP):  http://adisyonkasa.ddns.net:3000
echo.
echo Sunucu başlatılıyor, lütfen bekleyin...
echo.

npm run build && npm start

pause
