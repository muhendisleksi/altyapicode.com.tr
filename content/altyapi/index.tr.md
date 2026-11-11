---
title: "Altyapı"
type: alan
description: "Kanalizasyon, yağmursuyu ve içmesuyu ağlarını bacadan hendek kübajına kadar tek çizimde kurun, denetleyin ve paftalayın."
ustEtiket: "Çalışma alanı"
ozet: "Kanalizasyon, yağmursuyu ve içmesuyu ağları bacadan hendek kübajına kadar aynı çizimde kurulur. Kotlar kurum kuralından gelir, hata tek tıkla düzelir."
kapakSekil:
  dosya: "img/sekil/g02.png"
  alt: "Üç altyapı ağının boruları ve bacaları, arazi gizlenmiş 3B görünüm"
  not: "Üç ağ aynı çizimde · baca ve boru gövdeleri, arazi gizlenmiş 3B görünüm"
bolumler:
  - baslik: "Ağ kurma"
    metin: "Baca ve boru ağı çizimde kurulur. Kotlar seçtiğiniz kurumun kuralından alınır. Birden çok ağ aynı çizimde yan yana durur."
    maddeler:
      - { ad: "Baca ve boru", yazi: "Hat boyunca baca ve borular yerleştirilir" }
      - { ad: "Kotlar", yazi: "Akar kotları kurum kuralından gelir" }
      - { ad: "Birden çok ağ", yazi: "Kanalizasyon, yağmursuyu ve içmesuyu aynı çizimde" }
      - { ad: "Katalog", yazi: "Baca ve boru ürünleri katalogdan seçilir" }
    sekil:
      dosya: "img/sekil/a01.png"
      alt: "Planda altyapı ağı: bacalar, borular ve etiketleri"
      not: "Ağ planı · baca ve boru etiketleriyle"
  - baslik: "Hazır veriden ağ"
    metin: "Ağı baştan çizmek gerekmez. Elinizdeki veriden kurulur."
    maddeler:
      - { ad: "Eski çizim", yazi: "Eski çizimin çizgi ve yazılarından ağ çıkarılır" }
      - { ad: "Saha alımı", yazi: "GSI, CSV ve Excel dosyalarından" }
      - { ad: "LandXML", yazi: "LandXML dosyasındaki boru ağından" }
    sekil:
      dosya: "img/sekil/a02.png"
      alt: "Eski çizimin çizgileri üstünde kurulmuş baca ve boru ağı"
      not: "Eski çizimden kurulan ağ"
  - baslik: "Kural denetimi"
    metin: "Ağ, seçilen kurumun kuralına göre denetlenir. Aykırı olanlar listelenir; hata tek tıkla düzelir."
    maddeler:
      - { ad: "Eğim ve örtü", yazi: "Kural sınırlarıyla karşılaştırılır" }
      - { ad: "Hız ve düşü", yazi: "Kural sınırlarıyla karşılaştırılır" }
      - { ad: "Baca aralığı", yazi: "Kural sınırlarıyla karşılaştırılır" }
      - { ad: "Ağ kayıtları", yazi: "Baca ve borular tabloda; bulgular başlık başlık" }
    sekil:
      dosya: "img/sekil/a03.png"
      alt: "Ağ kayıtları penceresinde bulgular: kategori, başlık ve satırlar önem rengiyle"
      not: "Bulgular · kurala aykırı baca ve borular"
  - baslik: "3B ve çakışma"
    metin: "Baca ve boru gövdeleri arazinin altında 3B görünür. Röntgen görünümüyle toprağın içi okunur."
    maddeler:
      - { ad: "Röntgen görünümü", yazi: "Ağ, arazinin altında görünür" }
      - { ad: "Ağ ağ göster-gizle", yazi: "Her ağ ayrı açılıp kapanır" }
      - { ad: "Çakışma", yazi: "Ağlar arası kesişimler 3B'de işaretlenir ve bulgu listesine düşer" }
    sekil:
      dosya: "img/sekil/a04.png"
      alt: "Ağların kesiştiği yer, 3B görünüm; çakışma işaretli, üstüne gelince açıklaması çıkıyor"
      not: "Ağlar arası çakışma · 3B'de işaretli"
  - baslik: "Hendek kübajı"
    metin: "Hendek kazısı, yatak, gömlek, baca ve geri dolgu ayrı ayrı hesaplanır. Birden çok ağ aynı hendekte birlikte ele alınır."
    maddeler:
      - { ad: "Kalemler", yazi: "Kazı, yatak, gömlek, baca, geri dolgu" }
      - { ad: "Ortak hendek", yazi: "Seki ve yan eğimli arazi dahil" }
      - { ad: "Ağ tablosu", yazi: "Excel dosyası olarak verilir" }
    sekil:
      dosya: "img/sekil/g03.png"
      alt: "Yamaçta ortak hendek en kesiti: içmesuyu borusu sekideki kendi yuvasında, baca hendek tabanında; altında alan tablosu"
      not: "Yamaçta ortak hendek en kesiti · içmesuyu Ø250 kendi yuvasında, baca tabanda · km 0+000"
  - baslik: "Boy profili"
    metin: "Hattın boy profili arazi, boru ve bacalarla birlikte pafta olarak çizilir."
    maddeler:
      - { ad: "Arazi ve boru", yazi: "Aynı profilde" }
      - { ad: "Bacalar", yazi: "Yerleri ve kotlarıyla" }
      - { ad: "Çıktı", yazi: "DXF" }
    sekil:
      dosya: "img/sekil/a05.png"
      alt: "Boru hattının boy profili paftası: arazi, boru, bacalar ve kot bantları"
      not: "Boy profili paftası"
  - baslik: "Hendek en kesiti ve baca detayı"
    metin: "Hendek en kesiti ve baca detayı çizimden pafta olarak çıkar."
    maddeler:
      - { ad: "Hendek en kesiti", yazi: "Hendeğin kesit paftası" }
      - { ad: "Baca detayı", yazi: "Kesitler, plan ve parça listesi" }
      - { ad: "Çıktı", yazi: "DXF" }
    sekil:
      dosya: "img/sekil/g05.png"
      alt: "Baca detay paftası: iki kesit, plan ve parça listesi"
      not: "Baca detay paftası · A-A ve B-B kesiti, plan, parça listesi"
ciktilar:
  - { ad: "Boy profili paftası", bicim: "DXF" }
  - { ad: "Hendek en kesiti · baca detayı", bicim: "DXF" }
  - { ad: "Altyapı ağ tablosu", bicim: "XLSX" }
  - { ad: "Güzergâh ve yüzey verisi", bicim: "LandXML" }
yapmaz:
  - "Boru çapını ve debiyi hesaplamaz (hidrolik hesap yoktur)."
  - "Havza hesabı yoktur."
  - "Kurum hakediş cetveli üretmez."
demolar: ["d09", "v-sogutlu"]
sorular: ["kurum", "dwg"]
---
