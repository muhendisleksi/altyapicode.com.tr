---
title: "Ekran Görüntüleri"
description: "ATA CAD ekran görüntüleri — şerit sekmeleri, arazi ve yüzey, güzergâh, profil, tip kesit, koridor, kübaj ve kazı tasarımı."
---

Bu sayfada ATA CAD'in başlıca ekranları, örnek bir yol projesi üzerinden
tanıtılmaktadır. İş akışını baştan sona izleyebilirsiniz: ölçüm noktalarından
arazi yüzeyine, yüzeyden güzergâh ve profile, profilden koridora ve koridordan
kübaja.

Görsele tıklayarak tam boyutlu açabilirsiniz.

---

## Şerit sekmeleri

Arayüz klasik CAD düzenini korur: üstte yatay şerit, altında çizim sekmeleri,
solda araç alanı, sağda özellikler paneli, altta durum çubuğu.

{{< sekil genis="1" src="/images/ata-cad/menu-giris.jpg" alt="Giriş sekmesi" not="GİRİŞ — çizim ve düzenleme komutları, katman yönetimi, ölçülendirme, özellik eşleme ve sorgu. Sağ üstte çalışma alanı seçici." >}}

{{< sekil genis="1" src="/images/ata-cad/menu-ekle.jpg" alt="Ekle sekmesi" not="EKLE — blok tanımı ve blok düzenleyici, DWG/DXF referans, içe aktarma, görüntü altlığı." >}}

{{< sekil genis="1" src="/images/ata-cad/menu-arazi-verisi.jpg" alt="Arazi Verisi sekmesi" not="ARAZİ VERİSİ — nokta içe/dışa aktarma, nokta oluşturma ve düzenleme, yüzey kurma ve tazeleme." >}}

{{< sekil genis="1" src="/images/ata-cad/menu-tasarim.jpg" alt="Tasarım sekmesi" not="TASARIM — güzergâh, profil ve kırmızı hat, örnek hatları ve en kesit, tip kesit ve koridor, koridordan yüzey." >}}

{{< sekil genis="1" src="/images/ata-cad/menu-kubaj.jpg" alt="Kübaj sekmesi" not="KÜBAJ — iki yüzeyden ve güzergâhtan hacim, kesitten kübaj, kazı tasarımı, dönemsel kübaj, kübaj panosu ve kütle dağılımı." >}}

{{< sekil genis="1" src="/images/ata-cad/menu-aciklama.jpg" alt="Açıklama sekmesi" not="AÇIKLAMA — çok satırlı yazı, ölçülendirme, oklu açıklama, tablo ve tarama." >}}

{{< sekil genis="1" src="/images/ata-cad/menu-gorunum.jpg" alt="Görünüm sekmesi" not="GÖRÜNÜM — gezinme, hazır görünümler (üst, önden, izometrik), Nesne Görüntüleyici ve görsel stil." >}}

{{< sekil genis="1" src="/images/ata-cad/menu-yonet.jpg" alt="Yönet sekmesi" not="YÖNET — birimler, koordinat sistemi, seçenekler, stil temizleme, takma ad düzenleyici ve komut listesi." >}}

## Arayüz kabuğu

{{< galeri genis="1" baslik="Paneller ve ayarlar" >}}
{{< g set="ata" sig="1" ad="arac-alani-gezgin" not="Araç alanı · Gezgin — çizimdeki her şeyin envanteri: noktalar, nokta grupları, yüzeyler, hacim yüzeyleri, güzergâhlar, koridorlar, altlıklar, bloklar ve katmanlar. Sayılar canlı." >}}
{{< g set="ata" sig="1" ad="arac-alani-ayarlar" not="Araç alanı · Ayarlar — birim, çizim yardımcıları, katman, nokta, açıklama, yüzey, güzergâh, kübaj ve boru ağı ayarları tek ağaçta." >}}
{{< g set="ata" sig="1" ad="ozellikler-paneli" not="Özellikler paneli — seçili nesnenin genel, çıktı stili ve görünüm özellikleri; seçim yokken görünümün kendi değerleri." >}}
{{< g set="ata" sig="1" ad="kenetleme-ayarlari" not="Kenetleme (yakalama) ayarları — uç nokta, orta nokta, merkez, düğüm, kadran, kesişim, uzantı, teğet, dik ve paralel." >}}
{{< g set="ata" sig="1" ad="durum-cubugu" not="Durum çubuğu anahtarları — koordinat, model, yakalama, ızgara, dik açı, kutupsal, kenet izleme, dinamik giriş, çizgi kalınlığı, seçim döngüsü, çizim ölçeği ve temiz ekran." >}}
{{< g set="ata" sig="1" ad="secenekler" not="Seçenekler — arayüz teması (Koyu · Açık · Gri), imleç boyutu, pickbox, imleç ve model arka plan renkleri; canlı önizlemeyle." >}}
{{< /galeri >}}

## Nokta yönetimi

Ölçüm verisi projenin girdisi olduğu için nokta yönetimi toplu işlemeye göre
tasarlandı. Nokta grupları öncelik sırası taşır: bir nokta birden çok gruba
giriyorsa üst sıradaki grup geçerli olur.

{{< galeri genis="1" baslik="Nokta" >}}
{{< g set="ata" sig="1" ad="nokta-editoru" not="Nokta editörü — projedeki tüm noktalar tek tabloda; süzme, toplu kot atama, kot kaydırma, doğu ↔ kuzey takas, yeniden numaralandırma ve açıklamada bul/değiştir." >}}
{{< g set="ata" sig="1" ad="nokta-gruplari" not="Nokta grupları — dahil et / hariç tut kuralları, geçersiz kılmalar ve grup bazlı varsayılan nokta/etiket stili." >}}
{{< g set="ata" sig="1" ad="nokta-olustur" not="Nokta oluşturma yolları — elle (tek/çoklu), nesne üzerinde (eşit bölerek, sabit aralıkla, köşelerinden) ve ilişkiden (kesişimlerde, yüzey kotuyla, eğimle dağıt)." >}}
{{< /galeri >}}

## Arazi ve yüzey

{{< galeri genis="1" baslik="Yüzey" >}}
{{< g set="ata" sig="1" ad="yuzey-tin" not="TIN yüzey — üçgen ağı, dış sınır, kırık çizgiler ve eşyükselti eğrileri; seçili yüzey için açılan bağlam sekmesiyle." >}}
{{< g set="ata" sig="1" ad="yuzey-stili" not="Yüzey stili — bileşen görünürlüğü, eğri renklendirmesi, üçgen ağı rengi ve analiz renklendirmesi (kot / eğim bantları)." >}}
{{< g set="ata" sig="1" ad="ortofoto-altlik" not="Ortofoto altlık — coğrafi konumlu görüntü çizimin altına serilir; eşyükselti eğrileri üstünde kalır." >}}
{{< g set="ata" sig="1" ad="landxml-ice-aktar" not="İçe aktarma — DWG, DXF ve LandXML dosyası mevcut çizimin üstüne eklenir; belge sıfırlanmaz." >}}
{{< /galeri >}}

## Güzergâh, profil ve tip kesit

{{< sekil genis="1" src="/images/ata-cad/boy-profil.jpg" alt="Boyuna profil görünümü" not="Boyuna profil — siyah kot ve kırmızı hat, düşey abartı 10×; altta kırmızı kot, siyah kot, kilometre, yatay geometri ve düşey geometri şeritleri. Düşey kurpların yarıçapı ve uzunluğu şeritte okunuyor." >}}

{{< sekil genis="1" src="/images/ata-cad/tip-kesit.jpg" alt="Tip kesit tanımlama penceresi" not="Tip kesit tanımları — KGM Karayolu Tasarım El Kitabı'ndan TİP3F, 25,30 m. Solda kesit listesi, ortada canlı önizleme ve zincir tablosu, sağda seçili satırın bağlam paneli. “Sağ = Sol” bir kilittir; asimetrik kesitler kendiliğinden simetrikleşmez." >}}

## Koridor

Tip kesit güzergâh boyunca yürütülür; sonuç hem plandaki örnek hatları hem de
üç boyutlu koridor yüzeyidir. Koridor yüzeyi kübajın girdisi olur.

{{< galeri genis="1" baslik="Koridor" >}}
{{< g set="ata" sig="1" ad="koridor-plan" not="Koridor — planda örnek hatları, kazı/dolgu sınırı ve kilometraj etiketleri; arazi yüzeyinin üzerine oturmuş hâlde." >}}
{{< g set="ata" sig="1" ad="koridor-3b" not="Nesne Görüntüleyici — koridorun 3B görünümü; hangi nesnenin görüneceği soldaki listeden, görsel stil ve yüzey bileşenleri sağdaki panelden seçilir." >}}
{{< g set="ata" sig="1" ad="koridor-3b-yakin" not="Koridor 3B, yakın plan — kazı şevleri kırmızı, dolgu şevleri yeşil; kaplama, banket ve refüj ayrı ayrı görünüyor." >}}
{{< /galeri >}}

## Kübaj ve kazı tasarımı

{{< galeri genis="1" baslik="Kübaj" >}}
{{< g set="ata" sig="1" ad="kutle-dagilimi" not="Kütle dağılımı (Brückner) — depo fazlası ve ariyet ayrı taranmış; başlıkta yöntem (prizmoidal) ve malzeme sınıfı, sağ üstte denge." >}}
{{< g set="ata" sig="1" ad="kazi-tasarimi" not="Kazı tasarımı — zemin yüzeyi, taban kotu, şev eğimi ve isteğe bağlı palya; önizlemede düşey fark, plan alanı ve ağ büyüklüğü daha çizime yazmadan görünür." >}}
{{< g set="ata" sig="1" ad="kazi-hacim-yuzeyi" not="Kazı hacim yüzeyi — ortofoto altlık üzerinde şevli kazı sınırı; durum satırında üçgen sayısı, düşey fark ve plan alanı." >}}
{{< g set="ata" sig="1" ad="kubaj-panosu" not="Kübaj panosu — hacim yüzeyi başına kazı, dolgu, net ve alan; yöntem sütunu, net grafiği, eksik bildirimleri ve CSV dışa aktarma." >}}
{{< g set="ata" sig="1" ad="kazi-3b" not="Kazı tasarımının 3B görünümü — taban ve şevler tek yüzey olarak." >}}
{{< /galeri >}}

---

## Planlı modüller

Altyapı (boru ağı, baca, hendek kesiti), havza ve istinat duvarı modülleri henüz
platformda yer almıyor; bu işlevler bugün AutoCAD içinde
[eklentilerle](/eklentiler/) kullanılabilir.
[Modüllerin durumu →](/moduller/)
