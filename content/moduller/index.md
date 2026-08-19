---
title: "Modüller"
description: "ATA CAD modülleri ve güncel durumları — çekirdek, arazi ve yüzey, güzergâh, profil, tip kesit ve koridor, kübaj, altyapı, havza ve istinat duvarı."
---

Her modülün güncel durumu aşağıda belirtilmiştir:

| Durum | Anlamı |
|---|---|
| **çalışıyor** | Kullanıma hazır |
| **yapılıyor** | Geliştirme sürüyor, bazı işlevler kullanılabilir |
| **planlı** | Yol haritasında, henüz kullanıma açık değil |

---

## CAD Çekirdeği {#cekirdek}

**Durum: çalışıyor**

Genel çizim ve düzenleme altyapısı.

- Geometrik nesneler ve düzenleme komutları
- Belge yönetimi ve geri al / yinele
- Seçim, filtre, kenetleme ve grip
- Katman, renk, çizgi tipi, çizgi kalınlığı, stil
- Metin, ölçü, tarama ve blok
- Komut arama, özellik paneli, durum şeridi
- Render, görünüm, baskı, içe/dışa aktarma
- XREF desteği ve DWG/DXF/LandXML içe aktarma
- Coğrafi konumlu görüntü (ortofoto/pafta) altlığı
- Nesne Görüntüleyici — çizimi bozmadan 3B bakış
- Üç tema (Koyu · Açık · Gri) ve ayarlanabilir imleç/pickbox/zemin

## Arazi ve Yüzey {#arazi}

**Durum: çalışıyor**

Ölçüm verisinden yüzey kurma ve analiz.

- Ölçüm noktaları, nokta editörü ve toplu nokta işlemleri
- Öncelik sıralı nokta grupları — dahil et / hariç tut / geçersiz kıl
- TIN yüzey üçgenlemesi
- Eşyükselti eğrileri, üçgen ağı, sınır, kırık çizgi, analiz bantları
- Nokta stili, nokta etiket stili, açıklama anahtarı
- Yüzey kaynakları, yeniden kurma ve otomatik yeniden kurma

## Güzergâh {#guzergah}

**Durum: çalışıyor**

Yatay geometri ve kilometraj; profil ve kübaj hesaplarının temelini oluşturur.

- Yatay geometri, PI ekleme / silme / ayırma
- Kilometraj denklemleri
- Ofset güzergâh ve ofset koparma
- Kısıt tabanlı parça üretimi
- LandXML güzergâh okuma ve yazma
- Seçime göre açılan bağlam şeridi

## Profil ve En Kesit {#profil}

**Durum: çalışıyor**

Güzergâh ve arazi yüzeyinden boyuna profil ve en kesit üretimi.

- Yüzeyden boyuna profil üretimi ve profil görünümü
- Kırmızı hat — düşey kurplar, eğim ve kot şeritleri
- Örnek hatları ve hatlardan en kesit üretimi
- Kesit görünümleri ve profil üzerinde ek açıklama

[Boy profilin ekran görüntüsü →](/ekran-goruntuleri/)

## Tip Kesit ve Koridor {#koridor}

**Durum: çalışıyor**

Tanımlanan tip kesit güzergâh boyunca uygulanır; sonuçta plandaki örnek hatlar
ve üç boyutlu koridor yüzeyi elde edilir. Bu yüzey kübaj hesabında kullanılır.

- Zincir tabanlı tip kesit tanımı — Δx + eğim, Δz (dik) ve kapalı form girdileri
- Ölçü penceresi: her ölçü detay paftasındaki adıyla, canlı önizlemede ölçü oklarıyla
- Üstyapı katmanları (aşınma, binder, bitümlü temel, temel, alttemel) ve kilittaş paketleri
- Kademeli şev, banket, refüj, bordür ve kaldırım
- KGM tip kesit kütüphanesi — hazır kesitler kütüphaneden kopyalanır
- "Sağ = Sol" kilidi — asimetrik kesitler kendiliğinden simetrikleşmez
- Koridor modeli, koridordan proje yüzeyi ve 3B görünüm

## Kübaj {#kubaj}

**Durum: çalışıyor**

- İki yüzeyden hacim ve güzergâhtan hacim hesabı
- Kesitten kübaj ve dönemsel kübaj
- Kazı tasarımı — taban kotu, şev eğimi, palya; sonucu bir hacim yüzeyi
- Kütle dağılımı (Brückner) — depo fazlası, ariyet ve denge
- Kübaj panosu — kazı, dolgu, net, alan, yöntem ve eksik bildirimleri; CSV çıktısı
- Zemin sınıfı ayrımı

## Altyapı {#altyapi}

**Durum: planlı** — ilk geliştirilecek uzmanlık modülü

Kanalizasyon, yağmursuyu ve içmesuyu. Bu işlevler bugün
[Altyapı Asistanı](/eklentiler/altyapi-asistani/) eklentisiyle AutoCAD içinde
kullanılabilir.

- Boru ağı ve baca
- Hendek kesiti ve tip enkesitler
- Kesişen hendek birleştirme
- Kurum kontrolleri — İller Bankası, İSKİ, DSİ
- İller Bankası formatında Excel metraj
- Basınçlı ağlar

## Havza {#havza}

**Durum: planlı**

- Havza tanımı ve sınırı
- Akış hesabı
- Yağmursuyu debisi
- Yağmursuyu kontrolleri

## İstinat Duvarı {#istinat}

**Durum: planlı**

Bu işlevler bugün [İstinat Duvarı Asistanı](/eklentiler/istinat-duvari/)
eklentisiyle AutoCAD içinde kullanılabilir.

- Devrilme, kayma, taşıma gücü kontrolü
- TBDY-2018 deprem hesabı — Mononobe-Okabe
- Rankine ve Coulomb toprak basıncı
- Ano bazlı hesap ve Brückner tablosu
- Kazı, beton, dolgu, kalıp metrajı

---

Modüler yapının ayrıntıları [ürün sayfasında](/urun/#mimari) anlatılmıştır.
Bu yapı sayesinde yeni modüller, mevcut projelerinizi etkilemeden platforma
eklenir.
