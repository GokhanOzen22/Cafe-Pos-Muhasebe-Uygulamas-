@echo off
chcp 65001 > nul
title Meriç Belediyesi POS - Doğrudan Sessiz Yazdırma (Kiosk)
echo ========================================================
echo   MERİÇ BELEDİYESİ SOSYAL TESİSLERİ KASA & YAZICI
echo   Doğrudan Yazdırma Modu (Diyalogsuz Termal Fiş)
echo ========================================================
echo.
echo Kasa ekranı açılıyor...
echo (Yazdır butonuna tıklandığında yazıcı seçimi açılmaz, direkt yazdırılır)
echo.

:: Chrome veya Edge ile doğrudan sessiz yazdırma modunda aç
start chrome.exe --kiosk-printing "http://localhost:3000" 2>nul || start msedge.exe --kiosk-printing "http://localhost:3000" 2>nul || start http://localhost:3000

echo İşlem tamamlandı.
