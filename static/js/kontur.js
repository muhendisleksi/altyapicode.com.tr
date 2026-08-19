/* ============================================================================
   ATA CAD sitesi — zemin kontur katmanı.

   Sayfanın arkasında, sanal bir arazi yüzeyinin eşyükselti eğrileri. Süs
   değil: programın ürettiği şeyin ta kendisi. Yükseklik alanı 3B Perlin
   gürültüsüdür — üçüncü boyut yüzeyin biçim ekseni.

   HAREKET KULLANICIYA BAĞLI. Arazi kendi kendine akmıyor; üçüncü boyutta
   nerede olduğunu sayfanın kaydırma konumu belirliyor. Sen kaydırdıkça
   yüzey biçim değiştirir, durduğun anda donar.

   Önce otonom bir akış denendi ve yanlıştı: kullanıcı hiçbir şey yapmazken
   kıpırdayan bir zemin, çevresel görüşte dikkat çalıyor — okumaya çalışan
   göz istemsizce oraya dönüyordu. Sorun hızda değil hareketin kaynağındaydı.
   Kaydırmaya bağlanınca okuma anında zemin taş gibi duruyor, hareket ancak
   zaten hareket beklenen anda görünüyor. Boştaki işlemci maliyeti de sıfır.

   Bağımlılık yok. WebGL yok: alan ızgarası kaba (≈34 px hücre) olduğundan
   marching squares 2B canvas'ta ucuza çalışır ve WebGL'i kapalı olan
   kullanıcı da aynı şeyi görür.
   ========================================================================== */
(function () {
  'use strict';

  if (!window.requestAnimationFrame) { return; }

  // Hareket kısıtlı ya da ekran darsa arazi çizilir ama AKMAZ: tek kare
  // neredeyse bedava, oysa sürekli çizim dar ekranda pil pahalı ve hareket
  // istemeyen kullanıcı için zaten yanlış. İkisinde de zemin boş kalmasın.
  var duragan = window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
                !window.matchMedia('(min-width: 760px)').matches;

  var HUCRE   = 26;      /* alan ızgarası, CSS pikseli — küçüldükçe eğri yumuşar */
  var OLCEK   = 0.16;    /* gürültü ölçeği — büyürse arazi sıklaşır */
  /* Kaydırma → biçim ekseni dönüşümü. Tipik bir sayfa boyu (~6000 px)
     kaydırıldığında arazi kabaca iki tam biçim değişimi geçirir; daha
     büyük bir katsayı yüzeyi kaydırma sırasında huzursuz ediyor. */
  var Z_OLCEK = 0.0004;
  var PAN_OLCEK = 0.00015; /* aynı anda çok hafif yanal sürüklenme */
  var SEVIYE  = 11;      /* eşyükselti sayısı */
  var ANA     = 3;       /* her kaçıncı eğri "ana eğri" (kalın çizilir) */
  var UC      = 0.42;    /* en alt/üst eşik — alanın gerçek genliğine göre */

  /* ------------------------------------------------- 3B Perlin gürültüsü */
  /* Ken Perlin'in geliştirilmiş gürültüsü. Tablo sabit bir tohumla karılır:
     arazi her ziyarette aynı olsun — marka zemini, rastgele desen değil. */
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
  function egim(h, x, y, z) {
    h &= 15;
    var u = h < 8 ? x : y;
    var v = h < 4 ? y : (h === 12 || h === 14 ? x : z);
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }
  function gurultu(x, y, z) {
    var X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
    x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
    var u = egri(x), v = egri(y), w = egri(z);
    var A = P[X] + Y, AA = P[A] + Z, AB = P[A + 1] + Z;
    var B = P[X + 1] + Y, BA = P[B] + Z, BB = P[B + 1] + Z;
    return karis(
      karis(karis(egim(P[AA], x, y, z),         egim(P[BA], x - 1, y, z), u),
            karis(egim(P[AB], x, y - 1, z),     egim(P[BB], x - 1, y - 1, z), u), v),
      karis(karis(egim(P[AA + 1], x, y, z - 1), egim(P[BA + 1], x - 1, y, z - 1), u),
            karis(egim(P[AB + 1], x, y - 1, z - 1), egim(P[BB + 1], x - 1, y - 1, z - 1), u), v),
      w);
  }

  /* İki oktav: geniş sırtlar üstüne daha ince kıvrımlar. Tek oktavla arazi
     düzgün dalgalar hâlinde çıkıyordu — topografik haritadan çok soyut bir
     desen gibi duruyordu. İkinci oktav ona arazi karakteri veriyor. */
  function arazi(x, y, z) {
    return gurultu(x, y, z) * 0.66 + gurultu(x * 2.1, y * 2.1, z * 1.4) * 0.34;
  }

  /* ------------------------------------------------------------- katman */
  var tuval = document.createElement('canvas');
  tuval.className = 'kontur-katman';
  tuval.setAttribute('aria-hidden', 'true');
  var ctx = tuval.getContext('2d', { alpha: true });
  if (!ctx) { return; }
  document.body.insertBefore(tuval, document.body.firstChild);

  var g = 0, y = 0;          /* ızgara ölçüsü: sütun, satır */
  var alan = null;           /* yükseklik değerleri */
  var op = 1;                /* aygıt piksel oranı, sınırlı */
  var renkIor = '', renkAna = '';

  /* Renk temadan gelir; tema değişince yeniden okunur — üç temada da
     zemin kendi çizgi rengini kullanır. */
  function renkleriOku() {
    var s = getComputedStyle(document.documentElement);
    var c = s.getPropertyValue('--cizgi-2').trim() || '#2E333C';
    var a = s.getPropertyValue('--cizgi').trim() || '#3D4450';
    renkIor = c;
    renkAna = a;
  }

  function olcule() {
    // 3x DPR ekranlarda tam çözünürlük kare hızını düşürüyor; 1.5 yeter,
    // çizilen şey zaten 1 piksellik soluk çizgiler.
    op = Math.min(window.devicePixelRatio || 1, 1.5);
    var w = window.innerWidth, h = window.innerHeight;
    tuval.width = Math.round(w * op);
    tuval.height = Math.round(h * op);
    ctx.setTransform(op, 0, 0, op, 0, 0);
    g = Math.ceil(w / HUCRE) + 1;
    y = Math.ceil(h / HUCRE) + 1;
    alan = new Float32Array((g + 1) * (y + 1));
  }

  /* --------------------------------------------------- marching squares */
  /* Bir hücrenin dört köşesi eşiğin altında mı üstünde mü — dört bit bir kod
     verir, kod hangi kenarların kesileceğini söyler. Kesişim noktası kenar
     üzerinde doğrusal aradeğerlemeyle bulunur; bu olmadan eğriler hücreden
     hücreye zikzak yapıyor. */
  /* Kesişim noktaları skaler değişkenlerde tutulur, dizi döndürülmez:
     karede binlerce segment çiziliyor, her biri için nesne ayırmak çöp
     toplayıcıyı boş yere çalıştırıyordu. */
  function seviyeCiz(th) {
    var gen = g + 1;
    for (var j = 0; j < y; j++) {
      for (var i = 0; i < g; i++) {
        var a = alan[j * gen + i];
        var b = alan[j * gen + i + 1];
        var c = alan[(j + 1) * gen + i + 1];
        var d = alan[(j + 1) * gen + i];
        var ua = a > th, ub = b > th, uc = c > th, ud = d > th;
        var kod = (ua ? 8 : 0) | (ub ? 4 : 0) | (uc ? 2 : 0) | (ud ? 1 : 0);
        if (kod === 0 || kod === 15) { continue; }

        var x0 = i * HUCRE, y0 = j * HUCRE, x1 = x0 + HUCRE, y1 = y0 + HUCRE;
        var ustX = 0, sagY = 0, altX = 0, solY = 0, t;

        if (ua !== ub) { t = (th - a) / (b - a); ustX = x0 + HUCRE * t; }
        if (ub !== uc) { t = (th - b) / (c - b); sagY = y0 + HUCRE * t; }
        if (ud !== uc) { t = (th - d) / (c - d); altX = x0 + HUCRE * t; }
        if (ua !== ud) { t = (th - a) / (d - a); solY = y0 + HUCRE * t; }

        switch (kod) {
          case 1: case 14: ctx.moveTo(x0, solY);   ctx.lineTo(altX, y1); break;
          case 2: case 13: ctx.moveTo(altX, y1);   ctx.lineTo(x1, sagY); break;
          case 3: case 12: ctx.moveTo(x0, solY);   ctx.lineTo(x1, sagY); break;
          case 4: case 11: ctx.moveTo(ustX, y0);   ctx.lineTo(x1, sagY); break;
          case 6: case 9:  ctx.moveTo(ustX, y0);   ctx.lineTo(altX, y1); break;
          case 7: case 8:  ctx.moveTo(ustX, y0);   ctx.lineTo(x0, solY); break;
          // Köşegen belirsizlik: hücreden iki ayrı eğri geçer.
          case 5:
            ctx.moveTo(ustX, y0); ctx.lineTo(x0, solY);
            ctx.moveTo(altX, y1); ctx.lineTo(x1, sagY); break;
          case 10:
            ctx.moveTo(ustX, y0); ctx.lineTo(x1, sagY);
            ctx.moveTo(x0, solY); ctx.lineTo(altX, y1); break;
        }
      }
    }
  }

  /* --------------------------------------------------------------- çizim */
  var z = 0, kaydir = 0;

  function cizKare() {
    var gen = g + 1;
    for (var j = 0; j <= y; j++) {
      for (var i = 0; i <= g; i++) {
        alan[j * gen + i] = arazi(i * OLCEK + kaydir, j * OLCEK, z);
      }
    }

    ctx.clearRect(0, 0, tuval.width, tuval.height);
    ctx.lineWidth = 1;
    // Eşikler alanın gerçek genliğine göre: Perlin teorik olarak ±1'e
    // uzanır ama pratikte ±0,5 bandında gezinir. Aralık geniş tutulunca
    // uçtaki seviyeler hiçbir hücreyi kesmiyor, boşa dönüyordu.
    for (var s = 0; s < SEVIYE; s++) {
      var th = -UC + s * (2 * UC / (SEVIYE - 1));
      var anaMi = s % ANA === 0;
      ctx.strokeStyle = anaMi ? renkAna : renkIor;
      ctx.globalAlpha = anaMi ? 0.85 : 0.5;
      ctx.beginPath();
      seviyeCiz(th);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  /* Kaydırma konumunu biçim eksenine bağlar. Çizim rAF'a ertelenir: kaydırma
     olayı kareden çok daha sık gelir, her birinde çizmek boşa iş olurdu. */
  var bekliyor = false;

  function kaydirmaGuncelle() {
    if (bekliyor) { return; }
    bekliyor = true;
    requestAnimationFrame(function () {
      bekliyor = false;
      var s = window.pageYOffset || document.documentElement.scrollTop || 0;
      z = s * Z_OLCEK;
      kaydir = s * PAN_OLCEK;
      cizKare();
    });
  }

  renkleriOku();
  olcule();
  cizKare();

  // Duran zeminde kaydırma da bir şey değiştirmez: hareket kısıtı olan
  // kullanıcı ve dar ekran, arazinin donmuş hâlini görür.
  if (!duragan) {
    window.addEventListener('scroll', kaydirmaGuncelle, { passive: true });
    kaydirmaGuncelle();   // sayfa kaydırılmış hâlde açılmış olabilir
  }

  var boyutSayac = null;
  window.addEventListener('resize', function () {
    clearTimeout(boyutSayac);
    boyutSayac = setTimeout(function () { olcule(); cizKare(); }, 180);
  });

  // Sekme görünürlüğünü izlemeye gerek yok: arka plandaki sekme kaydırılmaz,
  // kaydırılmayan sayfa da çizim yapmaz.

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
