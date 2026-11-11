---
title: "Hakkında"
description: "ATA CAD'i kim geliştiriyor, neden bir CAD platformu yazıldı ve nasıl çalışılıyor."
aliases:
  - /hakkimda/
  - /gunluk/
  - /gunluk/modiler-cad-cekirdegi/
  - /gunluk/as-built-kanalizasyon-metraji/
  - /gunluk/civil3d-metraj-otomasyonu/
  - /gunluk/istinat-duvari-stabilite/
---

Ben Abdulbaki Atakan. ATA CAD'i tek başıma geliştiriyorum. Altyapı mühendisliği geçmişim ve CAD yazılımı geliştirme deneyimim programın temelini oluşturuyor.

## Neden bir CAD platformu

Altyapı projelerinde iki temel sorun öne çıkıyordu.

Birincisi tekrar eden işler: her hat için ayrı kesit çizmek, kesişimlerde çift sayımı elle ayıklamak, metrajı kurumun istediği biçime elle dökmek ve her revizyonda bunların tümünü yeniden güncellemek.

İkincisi maliyet: bu işler için pahalı bir CAD aboneliği gerekmemeliydi. Ofisler kullanmadıkları pek çok özelliğe her yıl ödeme yapıyordu.

Bu yüzden ATA CAD, başka bir CAD lisansına ihtiyaç duymadan kendi başına çalışan bir platform olarak geliştiriliyor.

## Çalışma ilkeleri

- **Doğrudan iletişim.** Destek ekibi veya aracı olmadan doğrudan bana ulaşırsınız.
- **Yanıt süresi genellikle aynı iş günüdür.**
- **Hesap doğruluğu önceliklidir.** Sonuçlar, bilinen değerler ve referans verilerle doğrulanmadan yayınlanmaz.
- **Geri bildirim dikkate alınır.** Kullanıcıdan gelen talepler ürünün yol haritasını doğrudan etkiler.

## Çekirdek sıfırdan yazıldı

Çekirdek sıfırdan yazıldı; üçüncü taraf bir CAD motoru kullanılmadı. Güzergâh, yüzey, profil, en kesit, kübaj ve LandXML aktarımı kendi geometri ve veri modeli üzerinde çalışır.

Geometri mantığı saf fonksiyonlara ayrıldı ve ekrandan bağımsız otomatik testlerle doğrulandı. Bu yaklaşım, arayüzden fark edilemeyecek hataları yakaladı: güncelliğini yitirmiş veri gösteren bir ofset bağı, bir öğeyi atlayan LandXML okuyucusu ve sıfırdan başlamayan güzergâhta yanlış konumlanan kilometraj işaretleri bu testlerle bulundu.

[İletişim →]({{< relref "/iletisim" >}})
