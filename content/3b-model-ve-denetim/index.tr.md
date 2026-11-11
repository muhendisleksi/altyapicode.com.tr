---
title: "3B model ve denetim"
type: alan
description: "Bina, tesisat ve peyzaj tek 3B modelde. Model kural paketiyle denetlenir; aykırı olan kırmızı görünür. İlk paket peyzaj."
ustEtiket: "Çalışma alanı"
ozet: "Bina, tesisat ve peyzaj tek modelde çizilir. Model kural paketiyle denetlenir; her kural kaynağını ve madde numarasını taşır."
kapakSekil:
  dosya: "img/sekil/g12.png"
  alt: "İki kule, podyum ve peyzaj; ATA CAD 3B modeli"
  not: "Erguvan · iki kule, 96 daire, podyum ve peyzaj"
bolumler:
  - baslik: "Yapı"
    metin: "Bina elemanları 3B olarak çizilir ve katlara dağılır."
    maddeler:
      - { ad: "Taşıyıcı", yazi: "Duvar, döşeme, kolon, kiriş" }
      - { ad: "Düşey ve üst", yazi: "Merdiven ve çatı" }
      - { ad: "Kat", yazi: "Elemanlar kat kat düzenlenir" }
      - { ad: "Açıklık", yazi: "Kapı, pencere, boşluk ve şaft" }
      - { ad: "Mekân", yazi: "Mahal ve alan" }
    sekil:
      dosya: "img/sekil/m01.png"
      alt: "Villanın zemin katı kesitle açılmış: duvarlar, merdiven, mobilya, garaj ve teras"
      not: "Zeytinli Ev · zemin kat, kesitle açılmış"
  - baslik: "Tesisat"
    metin: "Bina içi tesisat hatları modelin parçasıdır."
    maddeler:
      - { ad: "Su", yazi: "Temiz su ve pis su hatları" }
      - { ad: "Yağmur", yazi: "Yağmur suyu hatları" }
      - { ad: "Isıtma", yazi: "Isıtma hatları" }
  - baslik: "Dışa aktarma"
    metin: "Model başka programlarda açılabilsin diye açık biçimlerde verilir."
    maddeler:
      - { ad: "IFC 4.3", yazi: "Bina bilgi modeli biçimi" }
      - { ad: "glTF", yazi: "3B görüntüleme biçimi" }
  - baslik: "Kütle ve bileşen"
    metin: "Yapı, kütleden başlayıp ayrıntıya iner. Hazır bileşenler modele yerleştirilir; dış modeller içe alınır."
    maddeler:
      - { ad: "Kütle", yazi: "Prizma çizilir, yüzeyi itilip çekilir" }
      - { ad: "Bileşen kütüphanesi", yazi: "Mobilya, ağaç ve donatı yerleştirilir" }
      - { ad: "Model içe alma", yazi: "glTF, OBJ ve STL dosyaları" }
      - { ad: "Plandan çıkarma", yazi: "Kat planı çiziminden duvar, kolon ve açıklık" }
    sekil:
      dosya: "img/sekil/m03.png"
      alt: "Bileşenler modelde: mobilyalı ev, ağaçlar, araç, bank ve aydınlatma"
      not: "Bileşenler modelde · mobilya, ağaç ve donatı"
  - baslik: "Peyzaj"
    metin: "Yol, otopark, yeşil alan, oyun ve spor alanları araziye oturur."
    sekil:
      dosya: "img/sekil/g14.png"
      alt: "Kulelerin önünde ağaçlı yaya yolu, yeşil alan ve podyum meydanı; 3B görünüm"
      not: "Erguvan peyzajı · ağaçlı yaya yolu, yeşil alan, meydan"
  - baslik: "Yönetmelik denetimi"
    metin: "Model kural paketine göre denetlenir. Kurallar program kodunda değil veri dosyasındadır. Aykırı olan kırmızı görünür."
    maddeler:
      - { ad: "Kaynak", yazi: "Her kural kaynağını, madde numarasını ve tarihini taşır" }
      - { ad: "Peyzaj paketi", yazi: "Otopark Yönetmeliği, Planlı Alanlar İmar Yönetmeliği ve iki rehber" }
      - { ad: "Rapor", yazi: "Denetim raporu XLSX, PDF ve DXF olarak verilir" }
      - { ad: "Tür eşleme", yazi: "Çizimin katmanları nesne türlerine eşlenir" }
    sekil:
      dosya: "img/sekil/m04.png"
      alt: "Denetim sonucu: aykırı olan kırmızı, uyarı turuncu; ölçülen değer, eşik ve kaynak aynı satırda"
      not: "Denetim sonucu · aykırı olan kırmızı"
  - baslik: "Kesit, kat planı, inşaat filmi"
    metin: "Kesit, kat planı ve inşaat filmi aynı modelden üretilir."
    sekil:
      dosya: "img/sekil/g16.png"
      alt: "Yatay kesitle açılmış bina: duvarlar, kolonlar, kapı ve pencereler içeriden görünüyor"
      not: "Kesitle açılmış bina · duvar, kolon, kapı ve pencere"
ciktilar:
  - { ad: "3B model", bicim: "IFC 4.3 · glTF" }
  - { ad: "Denetim raporu", bicim: "XLSX · PDF · DXF" }
yapmaz:
  - "Yapısal (statik) hesap yapmaz."
  - "IFC dosyası içe almaz."
  - "Teknik sorumlunun yerine geçmez: denetim sonucu mühendisin onayına sunulur."
demolar: ["d01", "d02", "d03", "d04", "d05", "d06"]
sorular: ["kurum", "dwg"]
---
