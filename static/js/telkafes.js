/* ============================================================================
   ATA CAD sitesi — zemin tel kafes katmanı.

   Sayfanın arkasında, perspektifte ufka doğru uzanan bir arazi yüzeyi: 3B
   tel örgü. Süs değil, programın ürettiği şeyin ta kendisi — sayısal arazi
   modeli. Eşyükselti eğrilerinin (eski `kontur.js`) yerini aldı: eğriler
   arazinin haritası, tel kafes arazinin kendisidir.

   HAREKET ÜÇ KAYNAKTAN GELİR
     · sürekli   — kamera sabit ve çok yavaş bir hızla arazinin üstünde ilerler
     · fare      — kamera yanal olarak hafifçe kayar; yakındaki düğümler çok,
                   uzaktakiler az hareket eder, derinlik bundan doğar
     · kaydırma  — sayfayı kaydırmak ilerlemeyi hızlandırır

   Sürekli akış bilinçli bir karar: eski katman kaydırma durunca donuyordu,
   burada zemin canlı kalsın istendi. Bedeli dikkat çalmak; onu üç şey
   dengeliyor — hız düşük (~0,4 dünya birimi/sn), çizgiler soluk, ufka doğru
   sisle söner. Hareket kısıtı isteyen kullanıcıda ve dar ekranda akış hiç
   çalışmaz, tek kare çizilir.

   Bağımlılık yok, WebGL yok: düğüm ızgarası kaba olduğundan perspektif
   izdüşümü 2B canvas'ta ucuza çıkar ve WebGL'i kapalı kullanıcı da aynı
   şeyi görür.
   ========================================================================== */
(function () {
  'use strict';

  if (!window.requestAnimationFrame || !window.Path2D) { return; }

  // Hareket kısıtlı ya da ekran darsa arazi çizilir ama AKMAZ: tek kare
  // neredeyse bedava, oysa sürekli çizim dar ekranda pil pahalı ve hareket
  // istemeyen kullanıcı için zaten yanlış. İkisinde de zemin boş kalmasın.
  var duragan = window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
                !window.matchMedia('(min-width: 760px)').matches;

  /* --------------------------------------------------------- dünya ölçüleri */
  var SUTUN   = 64;     /* yanal düğüm sayısı — ±32 dünya birimi genişlik */
  var DERINLIK= 32;     /* ileri doğru satır sayısı; sisin söndürdüğü yere kadar */
  var ADIM    = 1;      /* dünya ızgara aralığı — ölçü birimi burada tanımlanır */
  var YAKIN   = 6;      /* kameranın en yakın satıra mesafesi */
  var YUKSEK  = 1.55;   /* arazi genlik çarpanı — Perlin ±0,5 döner */
  var OLCEK   = 0.115;  /* gürültü ölçeği — büyürse arazi sıklaşır */
  var KAMERA_Y= 2.05;   /* kameranın yerden yüksekliği; arazi tepesi ~0,8 */
  var HIZ     = 0.42;   /* dünya birimi / saniye — sürekli akışın hızı */
  var ANA     = 4;      /* her kaçıncı çizgi "ana çizgi" (belirgin çizilir) */

  /* Kaydırma katkısı: tipik bir sayfa boyu (~6000 px) kaydırıldığında kamera
     kabaca bir buçuk menzil ilerler. Daha büyük bir katsayı kaydırma sırasında
     araziyi huzursuz ediyor, daha küçüğü hiç fark edilmiyor. */
  var KAYDIRMA = 0.012;
  var FARE_X   = 1.15;  /* farenin kamerayı yanal kaydırdığı azami dünya birimi */
  var FARE_Y   = 0.035; /* farenin ufku oynattığı azami oran (ekran yüksekliği) */
  var YUMUSAK  = 0.055; /* fare takibinin atalet katsayısı — 0..1, küçük = ağır */

  /* -------------------------------------------------- 2B Perlin gürültüsü */
  /* Ken Perlin'in geliştirilmiş gürültüsü. Tablo sabit bir tohumla karılır:
     arazi her ziyarette aynı olsun — marka zemini, rastgele desen değil.
     Tohum eski kontur katmanından devralındı; iki katman aynı araziyi
     gösteriyor, biri haritası biri yüzeyi. */
  var P = (function () {
    var p = new Uint8Array(512), t = [], s = 20260812;
    function rnd() { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }
    for (var i = 0; i < 256; i++) { t[i] = i; }
    for (var i = 255; i > 0; i--) {
      var j = (rnd() * (i + 1)) | 0, k = t[i]; t[i] = t[j]; t[j] = k;
    }
    for (var i = 0; i < 512; i++) { p[i] = t[i & 255]; }
    return p;
  })();

  function egri(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  function karis(a, b, t) { return a + t * (b - a); }
  function egim(h, x, y) {
    switch (h & 3) {
      case 0: return  x + y;
      case 1: return -x + y;
      case 2: return  x - y;
      default: return -x - y;
    }
  }
  function gurultu(x, y) {
    var X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
    x -= Math.floor(x); y -= Math.floor(y);
    var u = egri(x), v = egri(y);
    var A = P[X] + Y, B = P[X + 1] + Y;
    return karis(karis(egim(P[A],     x,     y),     egim(P[B],     x - 1, y),     u),
                 karis(egim(P[A + 1], x,     y - 1), egim(P[B + 1], x - 1, y - 1), u), v);
  }

  /* İki oktav: geniş sırtlar üstüne daha ince kıvrımlar. Tek oktavla arazi
     düzgün dalgalar hâlinde çıkıyordu — arazi modelinden çok soyut bir desen
     gibi duruyordu. İkinci oktav ona arazi karakteri veriyor. */
  function arazi(x, z) {
    return (gurultu(x, z) * 0.66 + gurultu(x * 2.1, z * 2.1) * 0.34) * YUKSEK;
  }

  /* ---------------------------------------------------------------- katman */
  var tuval = document.createElement('canvas');
  tuval.className = 'telkafes-katman';
  tuval.setAttribute('aria-hidden', 'true');
  var ctx = tuval.getContext('2d', { alpha: true });
  if (!ctx) { return; }
  document.body.insertBefore(tuval, document.body.firstChild);

  var w = 0, h = 0, op = 1;      /* CSS ölçüsü ve sınırlı aygıt piksel oranı */
  var odak = 0, merkezX = 0, ufukY = 0;
  var renkAna = '', renkIor = '';

  /* Yükseklik alanı halka tampon olarak tutulur. Satırlar dünya ızgarasına
     oturduğu için kamera bir ADIM ilerlediğinde yalnızca EN UZAK satır
     yeniden hesaplanır; diğerleri olduğu gibi kayar. Her karede baştan
     hesaplasaydık kare başına ~3000 Perlin çağrısı gerekirdi. */
  var alan = null;               /* (DERINLIK+1) × (SUTUN+1) yükseklik */
  var taban = null;              /* en yakın satırın dünya indeksi; null = boş */

  /* İzdüşüm ara belleği. Boyuna çizgiler bir önceki satırın izdüşümünü
     istediği için iki satır birden tutuluyor; satır bitince diziler
     kopyalanmaz, TAKAS edilir. Kopyalama kare başına iki bin gereksiz
     yazma demekti. `g` satırdaki düğümün ekranda olup olmadığı. */
  var px = null, py = null, pg = null;   /* içinde bulunulan satır */
  var qx = null, qy = null, qg = null;   /* bir önceki satır */

  /* --------------------------------------------------------------- renkler */
  /* Çizgiler ekran boyunca solduğu için düz renk değil, dikey renk geçişi
     kullanılıyor; geçiş rgba durakları ister, tema değişkeni ise hex verir. */
  function ayristir(c) {
    c = (c || '').trim();
    if (c.charAt(0) === '#') {
      if (c.length === 4) {
        c = '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
      }
      var n = parseInt(c.slice(1, 7), 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    var m = c.match(/(\d+(?:\.\d+)?)/g);
    if (m && m.length >= 3) { return [+m[0] | 0, +m[1] | 0, +m[2] | 0]; }
    return [61, 68, 80];
  }

  /* Ana çizgiler --cizgi değil --yazi-3 kullanıyor. Sebebi gri ve açık tema:
     orada --cizgi (#A6ADB8 / #D9DDE3) zemine o kadar yakın ki perspektif
     ızgara ekranda kayboluyordu. --yazi-3 üç temada da zeminden ayrılan en
     soluk renk; ince çizgiler --cizgi ile arkada kalmaya devam ediyor. */
  function renkleriOku() {
    var s = getComputedStyle(document.documentElement);
    renkAna = ayristir(s.getPropertyValue('--yazi-3') || '#7C8390');
    renkIor = ayristir(s.getPropertyValue('--cizgi')  || '#3D4450');
  }

  /* Ufuktan aşağı doğru açılan sis. Ufuk hizasında çizgiler tamamen kaybolur;
     bu, uzaktaki satırların keskin bir kenarla bitmesini engelliyor — kenar
     görününce yüzey "sonsuz arazi" değil "yüzen bir halı" gibi duruyordu.

     Şeffaf bölge geniş tutuluyor (ilk %16). Perspektif uzak satırları ufuk
     hizasında birkaç piksele sıkıştırdığı için orası çizgi değil düz gri bir
     bant olarak okunuyordu; metnin arkasından geçen de tam o banttı. */
  function gecis(renk, katsayi) {
    var g = ctx.createLinearGradient(0, ufukY, 0, h);
    var r = renk[0] + ',' + renk[1] + ',' + renk[2] + ',';
    g.addColorStop(0.00, 'rgba(' + r + '0)');
    g.addColorStop(0.13, 'rgba(' + r + (0.17 * katsayi).toFixed(3) + ')');
    g.addColorStop(0.44, 'rgba(' + r + (0.66 * katsayi).toFixed(3) + ')');
    g.addColorStop(1.00, 'rgba(' + r + (1.00 * katsayi).toFixed(3) + ')');
    return g;
  }

  /* ----------------------------------------------------------------- ölçü */
  function olcule() {
    // 3x DPR ekranlarda tam çözünürlük kare hızını düşürüyor; 1.5 yeter,
    // çizilen şey zaten 1 piksellik soluk çizgiler.
    op = Math.min(window.devicePixelRatio || 1, 1.5);
    w = window.innerWidth;
    h = window.innerHeight;
    tuval.width  = Math.round(w * op);
    tuval.height = Math.round(h * op);
    ctx.setTransform(op, 0, 0, op, 0, 0);

    // Odak uzaklığı ~58° görüş açısına denk gelir. Ekran genişliğine
    // bağlanmasının sebebi: dar pencerede sabit odak araziyi aşırı
    // yakınlaştırıyor, ızgara birkaç dev karesi hâline geliyordu.
    odak    = w * 0.90;
    merkezX = w * 0.5;

    alan = new Float32Array((DERINLIK + 1) * (SUTUN + 1));
    px = new Float32Array(SUTUN + 1); py = new Float32Array(SUTUN + 1);
    qx = new Float32Array(SUTUN + 1); qy = new Float32Array(SUTUN + 1);
    pg = new Uint8Array(SUTUN + 1);   qg = new Uint8Array(SUTUN + 1);
    taban = null;                     /* alan boşaldı, baştan doldurulacak */
  }

  /* ------------------------------------------------------- yükseklik alanı */
  function satirDoldur(j, dz) {
    var t = j * (SUTUN + 1);
    for (var i = 0; i <= SUTUN; i++) {
      alan[t + i] = arazi((i - SUTUN / 2) * ADIM * OLCEK, dz * ADIM * OLCEK);
    }
  }

  function alaniGuncelle(yeniTaban) {
    if (taban === yeniTaban) { return; }

    var kayma = taban === null ? Infinity : yeniTaban - taban;
    var gen = SUTUN + 1;

    if (kayma > 0 && kayma <= DERINLIK) {
      // Kamera ilerledi: satırları öne kaydır, arkadan yenilerini üret.
      alan.copyWithin(0, kayma * gen);
      for (var j = DERINLIK + 1 - kayma; j <= DERINLIK; j++) {
        satirDoldur(j, yeniTaban + j);
      }
    } else if (kayma < 0 && -kayma <= DERINLIK) {
      // Kamera geriledi (sayfa yukarı kaydırıldı).
      alan.copyWithin(-kayma * gen, 0);
      for (var j2 = 0; j2 < -kayma; j2++) {
        satirDoldur(j2, yeniTaban + j2);
      }
    } else {
      // İlk kare ya da sıçrama: tamamını hesapla.
      for (var j3 = 0; j3 <= DERINLIK; j3++) {
        satirDoldur(j3, yeniTaban + j3);
      }
    }
    taban = yeniTaban;
  }

  /* ---------------------------------------------------------------- çizim */
  var kameraZ = 0, kameraX = 0, ufukKay = 0;
  var hedefX = 0, hedefUfuk = 0;

  function cizKare() {
    var yeniTaban = Math.floor(kameraZ / ADIM);
    alaniGuncelle(yeniTaban);

    /* Ufuk ekranın üst üçte birinde. Daha aşağıda tutulduğunda arazi yalnız
       alt bantta kalıyor ve hero'nun metin bloğu tam onun üstüne oturuyordu;
       yukarı alınca yüzey ekranın tamamına yayılır. Aynı oran ata.css'teki
       ufuk ışımasında da geçiyor, ikisi birlikte değişmeli. */
    ufukY = h * 0.34 + ufukKay * h;
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1;
    ctx.lineJoin = 'round';

    var gecisIor = gecis(renkIor, 1);
    var gecisAna = gecis(renkAna, 1);
    var gen = SUTUN + 1;
    var kenar = w * 3;                /* bu kadar dışarısı zaten görünmez */

    // Boyuna çizgiler (sabit x, derinlik boyunca) tek geçişte biriktirilir;
    // enine çizgiler satır satır çizilir. İkisi de aynı izdüşüm değerlerini
    // kullandığı için satırlar tek turda hesaplanıp iki yola da yazılır.
    var yolIor = new Path2D(), yolAna = new Path2D();
    qg.fill(0);                              /* ilk satırın öncesi yok */

    for (var j = 0; j <= DERINLIK; j++) {
      var zd = YAKIN + (yeniTaban + j) * ADIM - kameraZ;
      if (zd <= 0.2) { qg.fill(0); continue; }   /* satır atlanırsa zincir kopar */
      var k = odak / zd;                     /* satırın izdüşüm ölçeği */
      var t = j * gen;

      var enineYol = (j % ANA === 0) ? yolAna : yolIor;
      var ilk = true;

      for (var i = 0; i <= SUTUN; i++) {
        var sx = merkezX + ((i - SUTUN / 2) * ADIM - kameraX) * k;
        var sy = ufukY + (KAMERA_Y - alan[t + i]) * k;
        // Yakın satırlarda kenar sütunlar ekranın on binlerce piksel dışına
        // düşüyor; bunlar yola girmesin, canvas onları kırpmak için de olsa
        // dolaşıyor.
        var gecerli = sx > -kenar && sx < w + kenar;

        px[i] = sx; py[i] = sy; pg[i] = gecerli ? 1 : 0;

        /* enine çizgi */
        if (gecerli) {
          if (ilk) { enineYol.moveTo(sx, sy); ilk = false; }
          else { enineYol.lineTo(sx, sy); }
        } else {
          ilk = true;                        /* ekran dışında kopar */
        }

        /* boyuna çizgi — önceki satırın aynı sütunundan devam eder */
        if (gecerli && qg[i]) {
          var boyunaYol = (i % ANA === 0) ? yolAna : yolIor;
          boyunaYol.moveTo(qx[i], qy[i]);
          boyunaYol.lineTo(sx, sy);
        }
      }

      var ax = qx; qx = px; px = ax;         /* satır tamponlarını takas et */
      var ay = qy; qy = py; py = ay;
      var ag = qg; qg = pg; pg = ag;
    }

    // İnce ağ arkada kalır, ana çizgiler ızgaranın iskeletini taşır. Aradaki
    // fark kapanırsa yüzey tek bir gri bulanıklığa dönüşüyor.
    ctx.strokeStyle = gecisIor;
    ctx.globalAlpha = 0.42;
    ctx.stroke(yolIor);

    ctx.strokeStyle = gecisAna;
    ctx.globalAlpha = 0.62;
    ctx.stroke(yolAna);

    ctx.globalAlpha = 1;
  }

  /* --------------------------------------------------------------- döngü */
  var oncekiAn = 0, kaydirmaZ = 0;

  function kare(an) {
    var dt = oncekiAn ? Math.min((an - oncekiAn) / 1000, 0.1) : 0;
    oncekiAn = an;

    kameraZ += HIZ * dt;

    // Fare takibi atalete bağlı: imleç sıçradığında kamera onunla sıçramasın,
    // arkasından yumuşayarak gelsin. Çerçeveden bağımsız olması için katsayı
    // geçen süreye göre ölçekleniyor.
    var y = 1 - Math.pow(1 - YUMUSAK, dt * 60);
    kameraX += (hedefX - kameraX) * y;
    ufukKay += (hedefUfuk - ufukKay) * y;

    cizKare();
    requestAnimationFrame(kare);
  }

  /* Kaydırma kamerayı ileri iter. Konuma bağlı, hıza değil: sayfada nerede
     olduğun arazide nerede olduğunu belirler, geri kaydırınca arazi de geri
     gelir — ileri/geri arasında tutarsızlık olmuyor. */
  function kaydirmaGuncelle() {
    var s = window.pageYOffset || document.documentElement.scrollTop || 0;
    var yeni = s * KAYDIRMA;
    kameraZ += yeni - kaydirmaZ;
    kaydirmaZ = yeni;
  }

  function fareGuncelle(e) {
    hedefX    = ((e.clientX / w) - 0.5) * 2 * FARE_X;
    hedefUfuk = ((e.clientY / h) - 0.5) * 2 * FARE_Y;
  }

  renkleriOku();
  olcule();
  kaydirmaGuncelle();
  cizKare();

  if (!duragan) {
    window.addEventListener('scroll', kaydirmaGuncelle, { passive: true });
    window.addEventListener('mousemove', fareGuncelle, { passive: true });
    // İmleç pencereyi terk edince kamera ortaya dönsün; yoksa sayfa
    // kenarda kalmış bir imlecin verdiği açıyla donuyor.
    window.addEventListener('mouseleave', function () { hedefX = 0; hedefUfuk = 0; });
    requestAnimationFrame(kare);
  }

  var boyutSayac = null;
  window.addEventListener('resize', function () {
    clearTimeout(boyutSayac);
    boyutSayac = setTimeout(function () { olcule(); cizKare(); }, 180);
  });

  // Sekme görünürlüğünü izlemeye gerek yok: arka plandaki sekmede
  // requestAnimationFrame zaten çalışmaz.

  // Tema düğmesi `data-tema`yı değiştirir; çizgi rengi onunla gelmeli.
  if (window.MutationObserver) {
    new MutationObserver(function () {
      renkleriOku();
      cizKare();
    }).observe(document.documentElement, {
      attributes: true, attributeFilter: ['data-tema']
    });
  }
})();
