# MERİÇ BELEDİYESİ SOSYAL TESİSLERİ
## RESTORAN, KASA & ADİSYON OTOMASYON SİSTEMİ KULLANIM KİTAPÇIĞI (v2.4)

Bu kullanım kılavuzu; garsonlar, mutfak personeli, kasiyerler ve tesis yöneticileri için hazırlanmış görsel destekli hızlı başvuru ve operasyon rehberidir.

---

## İÇİNDEKİLER
1. [Giriş ve Kullanıcı PIN Kodları](#1-giriş-ve-kullanıcı-pin-kodları)
2. [Masa ve Bölge Görünümü (Renk Kodları)](#2-masa-ve-bölge-görünümü)
3. [Adım Adım Sipariş Akışı ve Buton Görselleri](#3-adım-adım-sipariş-akışı-ve-buton-görselleri)
4. [Adisyon Eylem Butonları Sözlüğü (Görsel Rehber)](#4-adisyon-eylem-butonları-sözlüğü)
5. [Ödeme Alma ve Hesap Kapatma (Kasa)](#5-ödeme-alma-ve-hesap-kapatma)
6. [Doğrudan Termal Fiş Yazdırma (Yazıcı Seçim Penceresi Olmadan)](#6-doğrudan-termal-fiş-yazdırma)
7. [Mutfak Ekranı (KDS) ve Hazır Zili](#7-mutfak-ekranı-ve-hazır-zili)
8. [Stok, Reçete ve Kritik Seviye Takibi](#8-stok-reçete-ve-kritik-seviye-takibi)
9. [Fiş / Fatura Yönetimi (Alış & Gider)](#9-fiş--fatura-yönetimi)
10. [Yönetim Paneli, Menü, Fiyat Güncelleme ve Z Raporu](#10-yönetim-paneli-menü-fiyat-ve-z-raporu)
11. [Çoklu Cihaz, Tablet ve Telefon Entegrasyonu](#11-çoklu-cihaz-tablet-ve-telefon-entegrasyonu)
12. [Sıkça Sorulan Sorular & Sorun Giderme](#12-sıkça-sorulan-sorular--sorun-giderme)

---

## 1. GİRİŞ VE KULLANICI PIN KODLARI

Sistem, güvenliği ve işlem sorumluluğunu sağlamak amacıyla 4 haneli PIN kodlarıyla çalışır. Yapılan her sipariş, iptal ve tahsilat personelin ismiyle loglanır.

| Rol | Varsayılan Personel | PIN Kodu | Yetki Kapsamı |
| :--- | :--- | :--- | :--- |
| **Yönetici (Admin)** | Tesis Müdürü | **1234** | Tam yetki (Menü, Fiyat, Raporlar, Stok, Ayarlar, Yetkilendirme) |
| **Garson** | Ahmet Yılmaz | **5678** | Masa açma, sipariş alma, mutfağa gönderme, masa taşıma |
| **Garson** | Mehmet Demir | **9012** | Masa açma, sipariş alma, mutfağa gönderme, masa taşıma |
| **Mutfak** | Ali Usta | **1111** | Mutfak sipariş ekranı, hazırlama durumu, hazır zili bildirimi |

> 💡 **Vardiya Değişimi:** Sağ üst köşedeki **"Çıkış"** butonuna basılarak oturum kapatılır; yeni gelen personel kendi PIN kodunu girerek mesaiye başlar.

---

## 2. MASA VE BÖLGE GÖRÜNÜMÜ

Ekranın üst kısmında tesisin bölümleri yer alır:
- **Ana Salon:** Kapalı ana restoran alanı masaları
- **Teras:** Açık hava manzaralı teras masaları
- **Bahçe:** Bahçe ve kamelya masaları

### Masa Kartı Renkleri & Durumları:
```
┌────────────────────────┐      ┌────────────────────────┐      ┌────────────────────────┐
│ Bahçe 3          [BOŞ] │      │ Teras 5         [AÇIK] │      │ Ana Salon 1   [HESAP!] │
│                        │      │ #104                   │      │ #102                   │
│         [ 🍽️ ]         │      │       ₺540,00          │      │       ₺780,00          │
│  Yeni müşteri alabilir │      │ 4 Kişi • ⏱️ 25 dk      │      │ Kasa ödeme bekliyor    │
└────────────────────────┘      └────────────────────────┘      └────────────────────────┘
  🟢 YEŞİL (Boş Masa)             🟠 SARI/AMBER (Açık Masa)        🔴 KIRMIZI (Hesap İstendi)
```

---

## 3. ADIM ADIM SİPARİŞ AKIŞI VE BUTON GÖRSELLERİ

### 🔹 ADIM 1: Masayı Seçin
Salondaki ilgili masanın üzerine dokunun. Boş masaya dokunduğunuzda yeni adisyon penceresi açılır.

---

### 🔹 ADIM 2: Menüden Ürün veya Kategori Seçin
Sağ paneldeki hızlı filtreleme butonları veya arama çubuğunu kullanın:

```
[ 🔍 Ürün adı ara (Örn: Çay, Köfte, San Sebastian)...                               ]

[ ⭐ Tüm Menü (38) ]   [ 🥩 Izgaralar ]   [ 🍕 Pideler ]   [ ☕ İçecekler ]   [ 🍰 Tatlılar ]
```

---

### 🔹 ADIM 3: Ürün Kartına Dokunarak Sepete Ekleyin
Menüdeki ürün kartına her dokunuşta adet `+1` olarak sepete eklenir:

```
┌────────────────────────────────────────────────────────┐
│ Meriç Kasap Köfte                           [Stok: 48] │
│ Garnitür, köz biber ve domates ile                     │
│ ────────────────────────────────────────────────────── │
│ ₺280,00                           [ + Sepete Ekle ]   │
└────────────────────────────────────────────────────────┘
```

---

### 🔹 ADIM 4: Adet Kontrolü, İptal ve Ürün Notu Ekleme
Sol taraftaki adisyon listesindeki her kalem için kontroller:

```
┌────────────────────────────────────────────────────────┐
│ Meriç Kasap Köfte  [Yeni]                      ₺560,00 │
│ ────────────────────────────────────────────────────── │
│ [ - ]  2  [ + ]   [ 🗑️ İptal ]     [ 💬 Not: Az acılı ]│
└────────────────────────────────────────────────────────┘
```
- **`[ - ]` ve `[ + ]`:** Ürün adedini azaltır veya artırır.
- **`[ 🗑️ ]` (Çöp Kutusu):** Yanlış girilen kalemi satırdan siler.
- **`[ 💬 + Not Ekle ]`:** Aşçıya iletilecek özel pişirme notu ekler (*"Soğansız"*, *"Az pişmiş"*, *"Acısız"*).

---

### 🔹 ADIM 5: Müşteri / Kişi Tanımını Girin (ZORUNLU)
Hesap karışıklığını önlemek ve borç takibini kolaylaştırmak için zorunlu alandır:

```
┌────────────────────────────────────────────────────────┐
│ 👤 MÜŞTERİ / KİŞİ TANIMI                    [ ZORUNLU ]│
│ [ Örn: Ahmet Bey (Belediye Ekibi) veya 4 Kişilik Aile ]│
└────────────────────────────────────────────────────────┘
```

---

### 🔹 ADIM 6: Siparişi Onaylayıp Mutfağa Gönderin
Sağ alttaki eylem butonuna dokunun:

```
┌────────────────────────────────────────┐
│       [ 📤 Kaydet & Mutfak ]           │
└────────────────────────────────────────┘
 (Koyu Gri Zemin / Sarı Gönder İkonu)
```
- Sipariş kaydedilir.
- Aşçının KDS ekranına anında düşer.
- Varsa mutfak termal yazıcısından sipariş fişi basılır.
- Pencere otomatik kapanır ve masa sarı renge döner.

---

## 4. ADİSYON EYLEM BUTONLARI SÖZLÜĞÜ

Adisyon ekranının alt kısmında yer alan tüm butonlar, renkleri ve görevleri:

| Buton Görseli & Metni | Renk & Tasarım | Kimler Kullanır? | Ne İşe Yarar? |
| :--- | :--- | :--- | :--- |
| `[ 📤 Kaydet & Mutfak ]` | Koyu Gri / Sarı İkon | **Garson & Kasa** | Siparişi mutfağa (KDS) yollar, masayı açık kaydeder. |
| `[ 🎟️ Hesap İste / Fiş Bas ]` | Parlak Kehribar (Sarı) | **Garson** | Termal yazıcıdan hesap fişini basar, masayı "Hesap İstendi" durumuna alır. |
| `[ 💳 Hesap Kapat (₺...) ]` | Zümrüt Yeşili | **Kasa / Yönetici** | Ödeme alma penceresini açar, nakit/kart tahsilatı ile masayı kapatır. |
| `[ 🖨️ Direkt Yazdır & Kapat ]` | Sarı / POS-80C | **Kasiyer** | Windows seçim diyaloğu olmadan doğrudan fişi termal yazıcıdan çıkarır. |
| `[ ⇄ Masa Taşı ]` | Açık Gri Çerçeveli | **Tüm Roller** | Müşterinin adisyonunu başka bir boş masaya aktarır. |
| `[ 👤 Ödemeden Gitti (Borç Yaz) ]` | Kırmızı Çerçeveli | **Tüm Roller** | Masayı boşaltıp hesabı "Tahsil Edilmemiş Müşteri Borçları"na kaydeder. |
| `[ 🔔 Hazır & Servise Ver ]` | Canlı Yeşil | **Mutfak (Şef)** | Yemeğin piştiğini bildirir; garson tabletlerinde zil çalar. |

---

## 5. ÖDEME ALMA VE HESAP KAPATMA

Kasiyer veya yetkili personel **`[ 💳 Hesap Kapat ]`** butonuna bastığında ödeme ekranı açılır:

```
┌────────────────────────────────────────────────────────┐
│                ÖDENECEK TOPLAM TUTAR                   │
│                      ₺560,00                           │
│ ────────────────────────────────────────────────────── │
│   ┌──────────────────────┐    ┌──────────────────────┐ │
│   │   [ 💳 Kredi Kartı ] │    │    [ 💵 Nakit ]      │ │
│   │      (POS Slip)      │    │    (Para Üstü)       │ │
│   └──────────────────────┘    └──────────────────────┘ │
│                                                        │
│   ┌──────────────────────────────────────────────────┐ │
│   │       ✓ ÖDEMEYİ ONAYLA & HESABI KAPAT            │ │
│   └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

1. **Kredi Kartı:** Banka POS cihazından tahsilat yapıldıktan sonra seçilir.
2. **Nakit Ödeme:** Verilen nakit girildiğinde kalan para üstü otomatik hesaplanır.
3. **Ödemeyi Onayla:** Masa bakiyesi `0,00 TL` olur, masa anında yeşile (boş) döner ve kasa cirosuna eklenir.

---

## 6. DOĞRUDAN TERMAL FİŞ YAZDIRMA (YAZICI SEÇİM PENCERESİ OLMADAN)

İşletmedeki kasa hızını artırmak için **Doğrudan Sessiz Yazdırma** entegrasyonu mevcuttur:

1. Adisyon ekranında **"Direkt Yazdır & Kapat"** butonuna bastığınızda:
   - Windows yazıcı seçim penceresi **AÇILMAZ**.
   - Fiş doğrudan varsayılan termal fiş yazıcısına (**POS-80C**) iletilir.
   - 1 saniye içinde adisyon penceresi kapanır.
2. **Yazıcı Değiştirme / Kontrol:**
   - **Yönetim Paneli > Donanım Ayarları > Yazıcılar** bölümünden hedef yazıcı seçilebilir.
   - **"Diyalogsuz Test Yazdır"** butonuna basarak yazıcının hazır olduğunu test edebilirsiniz.
3. **Masaüstü Kısayolu:**
   - Kasa terminalindeki `kasa-kiosk-yazici-baslat.bat` veya `baslat.bat` dosyası sistemi doğrudan diyalogsuz yazdırma protokolüyle çalıştırır.

---

## 7. MUTFAK EKRANI (KDS) VE HAZIR ZİLİ

Aşçı ve mutfak personeli için tasarlanmış özel canlı takip ekranıdır:
1. Siparişler masaya göre renkli kartlar halinde görünür.
2. Siparişin geliş saati ve geçen dakika kronometresi canlı akar.
3. Aşçı siparişi hazırlamaya başladığında kart durumu sarıya ("Hazırlanıyor"), tamamlandığında yeşile döner.
4. **"Hazır & Servise Ver"** butonuna basıldığında:
   - Garsonların ekranında ve üst barda **"Masa X Hazır"** uyarısı çıkar.
   - Sesli mutfak zili çalar. Garson yemeği mutfaktan alıp masaya götürür.

---

## 8. STOK, REÇETE VE KRİTİK SEVİYE TAKİBİ

1. **Reçete Entegrasyonu:**
   - Menüdeki bir ürün satıldığında (Örn: 1 Porsiyon Meriç Köfte), reçetesinde tanımlı hammadde gramajları (kıyma, ekmek, garnitür) ana stok deposundan otomatik olarak düşer.
2. **Kritik Stok Uyarısı:**
   - Bir ürünün veya hammadde miktarının belirlenen kritik eşiğin (örn: 5 kg) altına inmesi halinde, üst barda kırmızı **"Kritik Stok"** butonu yanıp söner.
   - Bu butona tıklandığında sipariş verilmesi gereken eksik malzemeler topluca listelenir.

---

## 9. FİŞ / FATURA YÖNETİMİ (ALIŞ & GİDER)

Üst menüdeki hızlı **"+ Fiş / Fatura Ekle"** butonu ile işletmeye ait tüm girişler kayıt altına alınır:
- **Alış Faturası (Mal Alımı):** Toptancıdan gelen et, meşrubat, sebze gibi hammadde irsaliye ve faturaları girildiğinde ilgili stok miktarları otomatik artar.
- **İşletme Gider Faturası:** Elektrik, su, tüp, temizlik, personel avansı veya bakım onarım giderleri kaydedilir.
- Bu veriler ay sonu kâr/zarar ve maliyet analizinde net kârın hesaplanmasını sağlar.

---

## 10. YÖNETİM PANELİ, MENÜ, FİYAT VE Z RAPORU

Yalnızca **Yönetici (Admin)** şifresiyle (1234) erişilebilir:
1. **Fiyat Değiştirme:** Menü Yönetimi sekmesinde ürünün yanındaki düzenle butonuna basıp yeni fiyatı yazın ve kaydedin. Anında tüm tabletlerde güncellenir.
2. **Yeni Masa / Salon:** Salonlar & Masalar sekmesinden yeni masa veya salon eklenebilir. Açık adisyonu olan masalar silinemez.
3. **Personel ve PIN:** Kullanıcılar sekmesinden yeni personel eklenebilir, şifreleri değiştirilebilir veya yetkileri sınırlandırılabilir.
4. **Gün Sonu (Z Raporu):** Raporlar sekmesinden günün toplam cirosu, nakit/kredi kartı dökümü, iadeler ve garson satış performansları tek tıkla termal fiş veya A4 olarak yazdırılabilir.

---

## 11. ÇOKLU CİHAZ, TABLET VE TELEFON ENTEGRASYONU

Garsonların el terminali (tablet veya akıllı telefon) ile çalışabilmesi için:
1. Kasa bilgisayarı ile tabletler aynı tesiste **aynı Wi-Fi** ağına bağlanır.
2. Yönetim Paneli > **Donanım / Ağ Ayarları** sekmesini açın.
3. Ekranda beliren **Yerel Ağ QR Kodunu** garsonun tablet veya telefon kamerasına okutun.
4. Garson kendi PIN kodunu girerek doğrudan sipariş almaya başlayabilir. İnternet kesilse bile yerel ağ üzerinden kesintisiz çalışır.

---

## 12. SIKÇA SORULAN SORULAR & SORUN GİDERME

- **Soru: Fiş yazıcıdan çıkmıyor, ne yapmalıyım?**
  - *Cevap:* Yazıcının açık ve kağıdının ters takılmamış olduğunu kontrol edin. Yönetim Paneli > Donanım Ayarları > Yazıcılar sekmesinde yazıcı adının `POS-80C` olarak seçildiğini teyit edin ve "Diyalogsuz Test Yazdır" butonunu deneyin.
- **Soru: Garson tabletinden sipariş girdiğinde kasa bilgisayarında hemen görünüyor mu?**
  - *Cevap:* Evet. Sistem her 3 saniyede bir çift yönlü otomatik senkronizasyon yapar. Bir masaya girilen sipariş tüm ekranlarda anında güncellenir.
- **Soru: Elektrik kesilirse adisyonlar kaybolur mu?**
  - *Cevap:* Hayır. Veriler anlık olarak yerel SQLite veri tabanına kaydedilir. Bilgisayar yeniden açıldığında tüm açık masalar ve bakiyeler aynen geri yüklenir.
- **Soru: Veritabanı yedeğini nasıl alabilirim?**
  - *Cevap:* Yönetim Paneli > Veritabanı sekmesinden "JSON Yedek İndir" butonuna basarak tüm adisyon, stok ve menü geçmişinizi tek tıkla güvenle saklayabilirsiniz.
