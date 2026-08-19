---
title: "Sıfırdan modüler CAD çekirdeği"
description: "Güzergâh, yüzey, profil, kübaj ve LandXML aktarımını kendi çizim motoru üzerinde çalıştıran bir CAD platformunun geliştirilmesi."
ref: "Vaka 03 · ATA CAD"
kapak: "/images/tech_specs.jpg"
weight: 30
---

## Problem

Altyapı projelendirmesinde kullanılan araçlar ya çok genel ya da çok pahalı ve
hiçbiri Türk kurum standartlarını yerleşik olarak desteklemiyor. Eklenti
yaklaşımının da sınırı var: ev sahibi programın veri modeline bağımlı
kalınıyor.

Bu nedenle çekirdek geometri ve çizim altyapısının sıfırdan geliştirilmesine
karar verildi.

## Yaklaşım

Çekirdek sıfırdan yazıldı — üçüncü parti CAD motoru kullanılmadan.

**Geometri ve veri modeli**
- Güzergâh: yatay geometri, PI ekleme / silme / ayırma, kilometraj denklemleri
- Ofset güzergâh ve kısıt tabanlı parça üretimi
- Yüzey modeli
- Boyuna profil ve en kesit
- Kübaj hesabı

**Birlikte çalışabilirlik**
- LandXML okuma ve yazma — güzergâh ve yüzey aktarımı
- XREF desteği

**Arayüz**
- Kendi şerit (ribbon) altyapısı, seçime göre değişen bağlam sekmeleri
- Üç tema: koyu, açık, gri
- Kendi çizim ve tarama motoru

**Doğrulama**
Geometri mantığı saf fonksiyonlara ayrıldı ve ekrandan bağımsız otomatik
testlerle doğrulandı. Bu yaklaşım, arayüz üzerinden fark edilemeyecek hataları
yakaladı: ofset bağının güncelliğini yitirmiş veri göstermesi, LandXML
okuyucusunun bir öğeyi atlaması ve kilometraj işaretlerinin sıfırdan başlamayan
güzergâhta yanlış konumlanması bu testlerle tespit edildi.

## Sonuç

Güzergâh tasarımı, yüzey, profil, en kesit, kübaj, LandXML aktarımı ve kendi
kullanıcı arayüzüyle çalışan modüler bir CAD platformu ortaya çıktı. Ürünün
güncel durumu [ürün sayfasında](/urun/) ve
[ekran görüntülerinde](/ekran-goruntuleri/) izlenebilir.
