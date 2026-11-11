---
title: "Yol ve arazi"
type: alan
description: "Ölçüm noktasından kütle dağılımına kadar yol projesi: arazi, güzergâh, profil, tip kesit, koridor ve kübaj tek programda."
ustEtiket: "Çalışma alanı"
ozet: "Ölçüm noktasından kütle dağılımına kadar yol projesinin tamamı aynı dosyada yürür. Dever ve geçiş eğrisi KGM'ye göre gelir."
kapakSekil:
  dosya: "img/sekil/y01.png"
  alt: "Dağlık araziye oturmuş yol koridoru, 3B görünüm"
  not: "Tepe Geçidi · yol dağlık araziye oturmuş, yarma ve dolgu şevleriyle"
bolumler:
  - baslik: "Arazi"
    metin: "Arazi yüzeyi eldeki veriden kurulur. Uydu ve kurum altlığı çizimin arkasına konur."
    maddeler:
      - { ad: "Nokta ve TIN", yazi: "Ölçüm noktalarından yüzey" }
      - { ad: "Nokta bulutu", yazi: "LAS ve LAZ dosyaları" }
      - { ad: "Altlık", yazi: "Uydu görüntüsü ve kurum altlığı" }
    sekil:
      dosya: "img/sekil/g07.png"
      alt: "Dağlık arazinin üçgen ağ yüzeyi, yüksekliğe göre renkli 3B görünüm"
      not: "Dağlık arazi · üçgen ağ yüzey, yüksekliğe göre renkli"
  - baslik: "Nokta ve yüzey"
    metin: "Ölçüm noktaları tek tabloda yönetilir. Yüzey, eldeki veri neyse ondan kurulur."
    maddeler:
      - { ad: "Nokta editörü", yazi: "Süzme, toplu kot atama, yeniden numaralama" }
      - { ad: "Nokta grupları", yazi: "Kurala göre gruplar, grup başına görünüm" }
      - { ad: "Yüzey kaynakları", yazi: "Nokta, kot yazıları, üçgenler, DEM ve LandXML" }
      - { ad: "Yüzey araçları", yazi: "Eş yükselti ve sınır çizgisi çıkarma, yüzey öteleme" }
    sekil:
      dosya: "img/sekil/y04.png"
      alt: "Nokta editörü penceresi: nokta tablosu ve toplu işlem satırı"
      not: "Nokta editörü · süzme, toplu kot, yeniden numaralama"
  - baslik: "Zemin araştırması"
    metin: "Sondaj kuyuları çizime işlenir. Tabakalar ve yeraltı suyu boy profilinde kuyuların yerinde görünür."
    maddeler:
      - { ad: "Veri", yazi: "Excel, CSV ve AGS4 dosyalarından" }
      - { ad: "Profilde kolonlar", yazi: "Tabaka, SPT ve yeraltı suyu kuyu kolonunda" }
      - { ad: "Tabaka yüzeyi", yazi: "Kuyular arasında tabaka yüzeyi kurulur" }
    sekil:
      dosya: "img/sekil/y02.png"
      alt: "Boy profilinde sekiz sondaj kolonu: tabaka taramaları, kuyular arası tabaka sınırları ve yeraltı suyu çizgisi"
      not: "Sondaj kolonları boy profilinde · tabakalar ve yeraltı suyu"
  - baslik: "Sondaj logu"
    metin: "Her kuyunun logu pafta olarak çizilir: tabakalar, deneyler ve yeraltı suyu derinliğe göre aynı sayfada."
    maddeler:
      - { ad: "Tabakalar", yazi: "Derinlik cetveliyle, zemin sınıfı taramasıyla" }
      - { ad: "Deneyler", yazi: "SPT, numune ve karot değerleri" }
      - { ad: "Yeraltı suyu", yazi: "Ölçülen seviyeler" }
    sekil:
      dosya: "img/sekil/y05.png"
      alt: "Sondaj log paftası: derinlik cetveli, tabaka sütunu, SPT ve karot değerleri"
      not: "Sondaj logu · tabakalar ve deneyler derinliğe göre"
  - baslik: "Güzergâh"
    metin: "Yatay geometri kurp ve klotoidle kurulur. Dever ve plan gösterimi KGM'nin diliyle gelir."
    maddeler:
      - { ad: "Kurp ve klotoid", yazi: "Geçiş eğrisi klotoiddir" }
      - { ad: "Dever", yazi: "KGM'ye göre hesaplanır" }
      - { ad: "Plan gösterimi", yazi: "Some bloğu ve dever bandı" }
    sekil:
      dosya: "img/sekil/y06.png"
      alt: "Planda güzergâh: kurp, örnek hatları, şev sınırı ve some bloğu"
      not: "Tepe Geçidi güzergâhı · kurp, örnek hatları ve some bloğu"
  - baslik: "Profil ve kırmızı hat"
    metin: "Boyuna profil üzerinde kırmızı hat çizilir. Düşey kurp değerleri KGM El Kitabı tablolarından gelir."
    maddeler:
      - { ad: "Boyuna profil", yazi: "Arazi profili üzerinde" }
      - { ad: "Kırmızı hat", yazi: "Düşey kurpla birlikte" }
      - { ad: "Dever bandı", yazi: "Profilin altında, kilometreye göre" }
    sekil:
      dosya: "img/sekil/y08.png"
      alt: "Boyuna profil: arazi çizgisi ve kırmızı hat; altta kot, kilometre, yatay ve düşey geometri ile dever bantları"
      not: "Tepe Geçidi boy profili · kotlar, geometri ve dever bantlarıyla"
  - baslik: "Tip kesit"
    metin: "Yolun en kesiti parça parça tanımlanır: şerit, banket, bisiklet yolu, kaldırım, şev, duvar. Hazır kesitler KGM kütüphanesinden gelir."
    maddeler:
      - { ad: "Kütüphane", yazi: "KGM tip kesit kütüphanesi" }
      - { ad: "Önizleme", yazi: "Kesit, değiştirildikçe çizilir" }
      - { ad: "Çizimden kesit", yazi: "Eldeki kesit çiziminden tanım çıkarılır" }
    sekil:
      dosya: "img/sekil/y09.png"
      alt: "Tip kesit penceresi: bisiklet yollu şehir içi yol kesitinin önizlemesi; altta kazı ve dolgu şevinin eğimi"
      not: "Tip kesit · bisiklet yollu şehir içi yol, şev eğimleri"
  - baslik: "Koridor"
    metin: "Güzergâh, kırmızı hat ve tip kesit birleşince 3B yol modeli, yani koridor oluşur."
    maddeler:
      - { ad: "3B model", yazi: "Şerit, kaldırım, şev ve duvar araziye oturur" }
      - { ad: "Kavşak", yazi: "Eşdüzey ve dönel kavşak" }
      - { ad: "Koridor yüzeyi", yazi: "Koridordan yüzey ve çizgi çıkarılır" }
    sekil:
      dosya: "img/sekil/y10.png"
      alt: "Yol koridoru yakından: şeritler, bisiklet yolu, kaldırım, yarma duvarı ve şev"
      not: "Koridor yakından · duvarlı yarma kesimi"
  - baslik: "Kübaj"
    metin: "Kazı ve dolgu hacmi yol modelinden hesaplanır."
    maddeler:
      - { ad: "Kazı ve dolgu", yazi: "Zemin sınıfına göre" }
      - { ad: "Kütle dağılımı", yazi: "Taşıma dengeli" }
      - { ad: "Dönemsel kübaj", yazi: "Excel dosyası olarak verilir" }
      - { ad: "Kübaj panosu", yazi: "Bütün hacim sonuçları tek tabloda" }
      - { ad: "İki yüzeyden hacim", yazi: "İki yüzey arasındaki kazı ve dolgu" }
    sekil:
      dosya: "img/sekil/g10.png"
      alt: "Kütle dağılımı diyagramı: kazı fazlası ve dolgu açığı"
      not: "Vadi Yolu kütle dağılımı · kazı fazlası ve dolgu açığı"
  - baslik: "Kazı tasarımı ve tesviye"
    metin: "Temel çukuru, platform ya da saha tesviyesi taban kotu ve şevle tanımlanır; hacim hemen hesaplanır."
    maddeler:
      - { ad: "Kazı tasarımı", yazi: "Taban kotu, şev eğimi ve palye" }
      - { ad: "Saha tesviyesi", yazi: "Saha için kazı ve dolgu" }
      - { ad: "3B sonuç", yazi: "Taban ve şevler arazide görünür" }
    sekil:
      dosya: "img/sekil/y13.png"
      alt: "Yamaçta tesviye platformu: şevler ve palye, 3B görünüm"
      not: "Saha tesviyesi · şev ve palye"
  - baslik: "Paftalar"
    metin: "Teslim edilecek paftalar DXF olarak çıkar."
    maddeler:
      - { ad: "Boyuna profil", yazi: "DXF" }
      - { ad: "En kesit", yazi: "DXF" }
      - { ad: "Kübaj cetveli", yazi: "XLSX veya CSV" }
    sekil:
      dosya: "img/sekil/y11.png"
      alt: "En kesit paftasından dört istasyon: kazı ve dolgu, istinat duvarı, bisiklet yolu; kotlar ve alanlar kesitin altında"
      not: "Tepe Geçidi en kesit paftası · kazı, dolgu ve duvarlı kesitler"
ciktilar:
  - { ad: "Boyuna profil paftası", bicim: "DXF" }
  - { ad: "En kesit paftaları", bicim: "DXF" }
  - { ad: "Kübaj cetveli", bicim: "XLSX · CSV" }
  - { ad: "Kütle dağılımı", bicim: "DXF" }
  - { ad: "Dönemsel kübaj", bicim: "XLSX" }
  - { ad: "Güzergâh ve yüzey verisi", bicim: "LandXML" }
yapmaz:
  - "DWG'ye yazmaz (çizim DXF verilir)."
  - "Pafta PDF'i üretmez."
  - "İstinat duvarını hesaplamaz; kesitteki duvar gösterimi temsilîdir."
  - "Yol rehabilitasyonu kapsam dışıdır."
demolar: ["d07", "d08", "d10", "d11", "d12"]
sorular: ["dwg", "kurum"]
---
