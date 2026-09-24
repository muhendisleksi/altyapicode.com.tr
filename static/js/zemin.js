/* ============================================================================
   ATA CAD sitesi — zemin katmanı: sayfa boyunca yapılan örnek proje.

   Sayfanın arkasında bir arazi var ve okuyucu aşağı indikçe o arazide bir
   yol projesi baştan sona yapılıyor. Zemin süs değil, sayfanın anlattığı iş
   akışının kendisi. Olaylar bölümlerin arasındaki metinsiz sahne
   aralarında olur (a değerleri ▸ SAHNE):

     hero                   ölçüm noktaları araziye düşer, TIN örülür (açılışta)
     ara 1  → kimler için   yüzeye eşyükselti eğrileri serilir (su seviyesi gibi)
     ara 2  → nasıl çalışır güzergâh araziye kendini çizer, km işaretleriyle
     nasıl çalışır          profil bölümündeki imleç, 3B güzergâhta da gezer
     ara 3  → ürünler       koridor araziye oyulur; öndeki kesit canlı kübaj okur
     ara 4  → ekranda       kamera yana döner, en kesitler dikilir (alanlarıyla)
     ara 5  → karşılaştırma kamera yükselir, sahne kuşbakışı plana döner, pafta

   Profil bölümündeki kotlar (profil.html ▸ data-arazi / data-proje) bu
   arazinin gerçekten boyuna kesitidir: güzergâh ekseni boyunca arazi o
   diziye oturtuldu, koridorun proje kotu da o diziden gelir. Aşağıdaki
   ARAZI/PROJE dizileri profil.html'deki dizilerin kopyasıdır — biri
   değişirse öteki de değişmeli (profil olmayan sayfalar da aynı projeyi
   göstersin diye buraya gömüldü).

   NEDEN WEBGL. Eski katman (telkafes.js) 2B canvas ile çiziliyordu ve bu
   doğruydu: tel kafes saydamdı, derinlik gerekmiyordu. Burada üç şey
   gerekiyor: gizli çizgi (tepenin arkasındaki çizgi görünmemeli, yoksa yüzey
   katı değil çizgi yumağı gibi okunuyor), yüzeye serilen eşyükselti eğrileri
   ve araziye oyulan koridor. Üçü de derinlik tamponu ve piksel başına
   hesap ister; 2B canvas'ta ancak üçgenleri her karede sıralayarak olur.
   WebGL2 yoksa eski telkafes.js yüklenir — zemin hiç boş kalmaz.

   GÖRSEL DİL — "gizli çizgi" çizimi: yüzeyler zemin rengiyle doldurulur,
   yalnız çizgiler görünür. Dolgu zeminle aynı renkte olduğu için ağdaki
   küçük boşluklar görünmez; yüzeyi ele veren tek şey çizgilerin kesilmesi.
   ========================================================================== */
(function () {
  'use strict';

  if (!window.requestAnimationFrame || !window.Float32Array) { return; }

  function yedegeDon() {
    document.documentElement.classList.remove('zemin-oynar');
    var s = document.createElement('script');
    s.src = '/js/telkafes.js';
    document.body.appendChild(s);
  }

  var tuval = document.createElement('canvas');
  var gl = null;
  try {
    gl = tuval.getContext('webgl2', {
      alpha: true, premultipliedAlpha: true, antialias: true,
      depth: true, powerPreference: 'low-power'
    });
  } catch (e) { gl = null; }
  if (!gl) { yedegeDon(); return; }

  // Hareket kısıtlı ya da ekran darsa sahne çizilir ama OYNAMAZ: bitmiş
  // projenin tek karesi. Dar ekranda sürekli çizim pil pahalı, hareket
  // istemeyen kullanıcı için zaten yanlış. İkisinde de zemin boş kalmasın.
  var duragan = window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
                !window.matchMedia('(min-width: 760px)').matches;

  /* ========================================================= PROJE VERİSİ */
  var TABAN   = 818;    /* kot ekseninin sıfırı (m) */
  var ABARTMA = 2.5;    /* düşey abartma — profilde olduğu gibi; 1:1 arazi
                           kameradan dümdüz görünüyor, tepeler kayboluyordu */
  var UZUNLUK = 400;    /* güzergâh boyu (m) — profil bölümüyle aynı */
  var P_ADIM  = 5;      /* profil kot dizilerinin aralığı (m) */

  var ARAZI = [822.226,822.887,823.095,823.023,822.922,822.880,822.765,822.387,821.736,821.051,820.659,820.711,821.051,821.346,821.352,821.097,820.806,820.670,820.662,820.574,820.249,819.768,819.428,819.510,820.036,820.743,821.286,821.500,821.483,821.447,821.476,821.425,821.062,820.308,819.364,818.581,818.193,818.138,818.129,817.905,817.439,816.924,816.555,816.325,816.026,815.459,814.660,813.921,813.589,813.796,814.375,815.013,815.518,815.943,816.478,817.208,817.983,818.519,818.650,818.494,818.384,818.601,819.162,819.828,820.327,820.582,820.746,821.006,821.364,821.597,821.444,820.856,820.080,819.487,819.301,819.454,819.694,819.838,819.929,820.166,820.673];
  var PROJE = [816.900,817.140,817.380,817.620,817.860,818.100,818.340,818.580,818.820,819.060,819.300,819.540,819.780,820.020,820.260,820.500,820.740,820.966,821.163,821.331,821.471,821.582,821.665,821.719,821.744,821.741,821.709,821.649,821.560,821.442,821.296,821.121,820.918,820.686,820.425,820.150,819.875,819.600,819.325,819.050,818.775,818.500,818.225,817.950,817.675,817.411,817.170,816.950,816.753,816.578,816.426,816.296,816.188,816.102,816.039,815.998,815.979,815.982,816.008,816.056,816.126,816.219,816.333,816.459,816.585,816.711,816.837,816.963,817.089,817.215,817.341,817.467,817.593,817.719,817.844,817.970,818.096,818.222,818.348,818.474,818.600];

  function kotAl(dizi, s) {
    var i = Math.max(0, Math.min(UZUNLUK, s)) / P_ADIM;
    var a = Math.min(Math.floor(i), dizi.length - 1);
    var b = Math.min(a + 1, dizi.length - 1);
    return dizi[a] + (dizi[b] - dizi[a]) * (i - a);
  }

  /* ------------------------------------------------------ yatay geometri */
  /* Doğru – kurp – doğru – ters kurp – doğru. Kurplar sağa (+1) ve sola (−1).
     Başlangıç ve bitişin ötesi aynı doğrultuda uzatılır: kamera projeye
     gelmeden önce de, bittikten sonra da bir eksen üzerinde durabilsin. */
  var ELEMANLAR = [
    { L: 90 },
    { L: 110, R: 260, yon:  1 },
    { L: 70 },
    { L: 90,  R: 230, yon: -1 },
    { L: 40 }
  ];
  var ILK_ACI = -0.16;          /* başlangıç doğrultusu, kuzeyden (rad) */
  var S_MIN = -400, S_MAX = 800;
  var AN = S_MAX - S_MIN + 1;   /* 1 m aralıklı eksen örnekleri */
  var GX = new Float64Array(AN), GZ = new Float64Array(AN), GT = new Float64Array(AN);

  // Doğrultu açısı kuzeyden (+z) doğuya (+x) ölçülür: yön = (sin t, cos t),
  // sağ normal = (cos t, −sin t). Açı artarsa eksen sağa döner.
  function ilerle(p, u) {
    if (!p.k) { return [p.x + Math.sin(p.t) * u, p.z + Math.cos(p.t) * u, p.t]; }
    var t2 = p.t + p.k * u;
    return [p.x + (Math.cos(p.t) - Math.cos(t2)) / p.k,
            p.z + (Math.sin(t2) - Math.sin(p.t)) / p.k, t2];
  }

  (function () {
    var parca = [], x = 0, z = 0, t = ILK_ACI, s0 = 0;
    ELEMANLAR.forEach(function (e) {
      var p = { s0: s0, L: e.L, x: x, z: z, t: t, k: e.R ? e.yon / e.R : 0 };
      parca.push(p);
      var q = ilerle(p, e.L);
      x = q[0]; z = q[1]; t = q[2]; s0 += e.L;
    });
    var bas = { x: 0, z: 0, t: ILK_ACI, k: 0 };
    var son = { x: x, z: z, t: t, k: 0 };
    for (var i = 0; i < AN; i++) {
      var s = S_MIN + i, q;
      if (s < 0) { q = ilerle(bas, s); }
      else if (s >= UZUNLUK) { q = ilerle(son, s - UZUNLUK); }
      else {
        for (var j = 0; j < parca.length; j++) {
          if (s < parca[j].s0 + parca[j].L) { q = ilerle(parca[j], s - parca[j].s0); break; }
        }
      }
      GX[i] = q[0]; GZ[i] = q[1]; GT[i] = q[2];
    }
  })();

  // s istasyonundaki eksen noktası ve doğrultusu (örnekler arası doğrusal).
  var _x = 0, _z = 0, _t = 0;
  function eksen(s) {
    var f = Math.max(0, Math.min(AN - 1.001, s - S_MIN));
    var i = Math.floor(f), u = f - i;
    _x = GX[i] + (GX[i + 1] - GX[i]) * u;
    _z = GZ[i] + (GZ[i + 1] - GZ[i]) * u;
    _t = GT[i] + (GT[i + 1] - GT[i]) * u;
  }
  // (s, d) → düzlem koordinatı; d sağa pozitif.
  function konum(s, d) {
    eksen(s);
    return [_x + d * Math.cos(_t), _z - d * Math.sin(_t)];
  }

  // Bir noktanın eksene en yakın istasyonu ve eksenden uzaklığı (işaretli).
  // Önce 10 m'de bir kaba tarama, sonra bulunan yerin çevresinde parça
  // parça dik izdüşüm. Sonuç _s ve _d'ye yazılır.
  var _s = 0, _d = 0;
  function enYakin(x, z) {
    var en = Infinity, ei = 0, i, dx, dz, q;
    for (i = 0; i < AN; i += 10) {
      dx = x - GX[i]; dz = z - GZ[i]; q = dx * dx + dz * dz;
      if (q < en) { en = q; ei = i; }
    }
    var a = Math.max(0, ei - 11), b = Math.min(AN - 2, ei + 11);
    en = Infinity;
    for (var j = a; j <= b; j++) {
      var ax = GX[j], az = GZ[j], vx = GX[j + 1] - ax, vz = GZ[j + 1] - az;
      var L2 = vx * vx + vz * vz;
      var u = ((x - ax) * vx + (z - az) * vz) / L2;
      u = u < 0 ? 0 : (u > 1 ? 1 : u);
      dx = x - (ax + vx * u); dz = z - (az + vz * u);
      q = dx * dx + dz * dz;
      if (q < en) { en = q; _s = S_MIN + j + u; _d = (dx * vz - dz * vx) / Math.sqrt(L2); }
    }
  }

  /* ------------------------------------------------ 2B Perlin gürültüsü */
  /* Ken Perlin'in geliştirilmiş gürültüsü, sabit tohumla: arazi her ziyarette
     aynı olsun. Tohum eski kontur/tel kafes katmanlarından devralındı. */
  var PT = (function () {
    var p = new Uint8Array(512), t = [], s = 20260812, i;
    function rnd() { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }
    for (i = 0; i < 256; i++) { t[i] = i; }
    for (i = 255; i > 0; i--) { var j = (rnd() * (i + 1)) | 0, k = t[i]; t[i] = t[j]; t[j] = k; }
    for (i = 0; i < 512; i++) { p[i] = t[i & 255]; }
    return p;
  })();
  function egri(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  function karis(a, b, t) { return a + t * (b - a); }
  function egim(h, x, y) {
    switch (h & 3) { case 0: return x + y; case 1: return -x + y; case 2: return x - y; default: return -x - y; }
  }
  function gurultu(x, y) {
    var X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
    x -= Math.floor(x); y -= Math.floor(y);
    var u = egri(x), v = egri(y), A = PT[X] + Y, B = PT[X + 1] + Y;
    return karis(karis(egim(PT[A], x, y), egim(PT[B], x - 1, y), u),
                 karis(egim(PT[A + 1], x, y - 1), egim(PT[B + 1], x - 1, y - 1), u), v);
  }

  /* -------------------------------------------------------------- arazi */
  // Ham arazi: iki oktav. Geniş sırtlar ve üstünde daha ince kıvrımlar.
  function hamArazi(x, z) {
    return TABAN + (gurultu(x / 150 + 3.7, z / 150 + 1.3) * 0.66 +
                    gurultu(x / 58 + 11.1, z / 58 + 7.9) * 0.34) * 14;
  }

  // Eksen boyunca ham arazi, profildeki arazi kotuna oturtulur. Düzeltme
  // eksende tam, 18 m'den sonra azalır, 110 m'de sıfırdır; projenin iki
  // ucundan sonra da 120 m içinde söner. Böylece profil bölümündeki arazi
  // çizgisi bu yüzeyin gerçek boyuna kesiti olur.
  function yumusak(a, b, x) {
    var t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }
  var DUZ = new Float64Array(AN);
  (function () {
    for (var i = 0; i < AN; i++) {
      var s = S_MIN + i;
      if (s >= 0 && s <= UZUNLUK) { DUZ[i] = kotAl(ARAZI, s) - hamArazi(GX[i], GZ[i]); }
    }
    var d0 = DUZ[-S_MIN], d1 = DUZ[UZUNLUK - S_MIN];
    for (var j = 0; j < AN; j++) {
      var s2 = S_MIN + j;
      if (s2 < 0) { DUZ[j] = d0 * (1 - yumusak(0, 120, -s2)); }
      else if (s2 > UZUNLUK) { DUZ[j] = d1 * (1 - yumusak(0, 120, s2 - UZUNLUK)); }
    }
  })();
  function duzeltme(s) {
    var f = Math.max(0, Math.min(AN - 1.001, s - S_MIN)), i = Math.floor(f);
    return DUZ[i] + (DUZ[i + 1] - DUZ[i]) * (f - i);
  }
  // Yan eğim: eksene dik, istasyon boyunca yönü ve şiddeti değişen bir
  // yamaç. Olmadan arazi eksene dik neredeyse düzdü; kesitlerin çoğu saf
  // kazı ya da saf dolgu çıkıyor, alanların yarısı "0,0" okuyordu. Gerçek
  // bir yamaç yolunda kesit çoğu yerde karışıktır: bir yanı yarma, öbür
  // yanı dolgu. Eksende (d = 0) terim sıfır — profil kotları değişmez.
  function yanEgim(s) { return 0.18 * Math.sin(s / 52 + 0.6) + 0.07 * Math.sin(s / 21 + 2.1); }
  function araziKot(x, z, s, d) {
    return hamArazi(x, z) + duzeltme(s) * (1 - yumusak(18, 110, Math.abs(d))) +
           d * yanEgim(s) * (1 - yumusak(25, 80, Math.abs(d)));
  }
  function araziSD(s, d) {
    var p = konum(s, d);
    return araziKot(p[0], p[1], s, d);
  }

  /* ------------------------------------------------------ tip en kesit */
  /* İki şeritli yol: 2 × 3,5 m şerit (%2,5) + 1,5 m banket (%4), yarmada
     1/1, dolguda 2/3 şev. Kotlar metre; abartma yalnız çizimde uygulanır. */
  var SERIT = 3.5, BANKET = 5.0, EGIM_S = 0.025, EGIM_B = 0.04;
  var SEV_YARMA = 1.0, SEV_DOLGU = 1 / 1.5, SEV_MAKS = 60;

  function platformKot(p, a) {
    return a <= SERIT ? p - a * EGIM_S : p - SERIT * EGIM_S - (a - SERIT) * EGIM_B;
  }
  // Bitmiş yüzeyin kotu. Yarma mı dolgu mu olduğuna banket ucundaki arazi
  // karar verir; şev araziyi kestiği yerden sonra bitmiş yüzey arazinin
  // kendisidir.
  function bitmisKot(s, d, g) {
    var p = kotAl(PROJE, s), a = Math.abs(d);
    if (a <= BANKET) { return platformKot(p, a); }
    var yb = platformKot(p, BANKET), gb = araziSD(s, d < 0 ? -BANKET : BANKET);
    return gb >= yb ? Math.min(g, yb + (a - BANKET) * SEV_YARMA)
                    : Math.max(g, yb - (a - BANKET) * SEV_DOLGU);
  }

  /* ------------------------------------------------------------- koridor */
  /* 2 m'de bir en kesit: şev topuğu (arazi kesişimi), banket ucu, şerit
     kenarı, eksen ve karşı taraf. Her kesitin kazı/dolgu alanı ve baştan o
     kesite kadar biriken hacim (ortalama alan yöntemi) burada hesaplanır —
     yapım sırasında öndeki kesitin okuduğu değerler bunlar. */
  var K_ADIM = 2, KN = UZUNLUK / K_ADIM + 1;
  var KES = [];   /* { s, sol, sag, kazi, dolgu, vKazi, vDolgu } */

  function topuk(s, yon) {
    var p = kotAl(PROJE, s), yb = platformKot(p, BANKET);
    var yarma = araziSD(s, yon * BANKET) >= yb;
    var once = 0;
    for (var a = BANKET; a <= SEV_MAKS; a += 0.25) {
      var cizgi = yarma ? yb + (a - BANKET) * SEV_YARMA : yb - (a - BANKET) * SEV_DOLGU;
      var fark = araziSD(s, yon * a) - cizgi;
      if (a > BANKET && (yarma ? fark <= 0 : fark >= 0)) {
        return a - 0.25 * fark / (fark - once);   /* son adımda doğrusal ara değer */
      }
      once = fark;
    }
    return SEV_MAKS;
  }

  (function () {
    var vK = 0, vD = 0;
    for (var i = 0; i < KN; i++) {
      var s = i * K_ADIM, sol = topuk(s, -1), sag = topuk(s, 1), kazi = 0, dolgu = 0;
      for (var d = -sol; d <= sag; d += 0.25) {
        var g = araziSD(s, d), f = bitmisKot(s, d, g);
        if (g > f) { kazi += (g - f) * 0.25; } else { dolgu += (f - g) * 0.25; }
      }
      if (i > 0) {
        vK += (kazi + KES[i - 1].kazi) / 2 * K_ADIM;
        vD += (dolgu + KES[i - 1].dolgu) / 2 * K_ADIM;
      }
      KES.push({ s: s, sol: sol, sag: sag, kazi: kazi, dolgu: dolgu, vKazi: vK, vDolgu: vD });
    }
  })();
  function kesitAra(s, alan) {
    var f = Math.max(0, Math.min(KN - 1.001, s / K_ADIM)), i = Math.floor(f), u = f - i;
    return KES[i][alan] + (KES[i + 1][alan] - KES[i][alan]) * u;
  }

  /* ============================================================ GEOMETRİ */
  var geo = {};

  /* --------------------------------------------------- arazi TIN ağı */
  /* Titretilmiş ızgara: her düğüm hücresi içinde rastgele kaydırılır, her
     hücre KISA köşegeninden bölünür. Sonuç düzenli ızgara değil, ölçüm
     noktalarından örülmüş bir TIN gibi okunur — inşaat mühendisinin gözünde
     arazi modeli üçgen ağdır, kare ağ "soyut desen" der.

     Üçgenler ortak düğüm paylaşmaz (her üçgenin kendi üç köşesi var):
     tel çizgiyi piksel gölgelendirici köşe ağırlıklarından çiziyor ve köşe
     ağırlığı ancak böyle üçgene özel olur. */
  (function () {
    var ARALIK = 7, PAY = 380;
    var x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (var i = -300 - S_MIN; i <= 700 - S_MIN; i += 5) {
      x0 = Math.min(x0, GX[i]); x1 = Math.max(x1, GX[i]);
      z0 = Math.min(z0, GZ[i]); z1 = Math.max(z1, GZ[i]);
    }
    x0 -= PAY; x1 += PAY; z0 -= PAY; z1 += PAY;
    var nx = Math.ceil((x1 - x0) / ARALIK), nz = Math.ceil((z1 - z0) / ARALIK);
    var n = (nx + 1) * (nz + 1);
    var dx = new Float32Array(n), dz = new Float32Array(n), dh = new Float32Array(n);
    var ds = new Float32Array(n), dm = new Float32Array(n), dr = new Float32Array(n);

    var tohum = 777;
    function rnd() { tohum = (tohum * 1103515245 + 12345) & 0x7fffffff; return tohum / 0x7fffffff; }

    for (var j = 0; j <= nz; j++) {
      for (var ii = 0; ii <= nx; ii++) {
        var k = j * (nx + 1) + ii;
        var ic = ii > 0 && ii < nx && j > 0 && j < nz;
        var x = x0 + ii * ARALIK + (ic ? (rnd() - 0.5) * 0.72 * ARALIK : 0);
        var z = z0 + j * ARALIK + (ic ? (rnd() - 0.5) * 0.72 * ARALIK : 0);
        enYakin(x, z);
        dx[k] = x; dz[k] = z; ds[k] = _s; dr[k] = rnd();
        dh[k] = araziKot(x, z, _s, _d);
        // Koridor izi payı: şev topuğuna olan uzaklık. Negatifse düğüm
        // koridorun içinde kalır ve koridor yapıldığında o bölge çizilmez.
        dm[k] = (_s > 0 && _s < UZUNLUK) ? Math.abs(_d) - kesitAra(_s, _d < 0 ? 'sol' : 'sag') : 99;
      }
    }

    var ucgen = nx * nz * 2, v = new Float32Array(ucgen * 3 * 6), o = 0;
    function koy(k, r) {
      v[o++] = dx[k]; v[o++] = dz[k]; v[o++] = dh[k]; v[o++] = ds[k]; v[o++] = dm[k]; v[o++] = r;
    }
    function uzak(a, b) { var X = dx[a] - dx[b], Z = dz[a] - dz[b]; return X * X + Z * Z; }
    for (var jj = 0; jj < nz; jj++) {
      for (var i2 = 0; i2 < nx; i2++) {
        var a = jj * (nx + 1) + i2, b = a + 1, c = a + nx + 1, e = c + 1;
        var r1 = rnd(), r2 = rnd();
        if (uzak(a, e) < uzak(b, c)) {
          koy(a, r1); koy(b, r1); koy(e, r1);
          koy(a, r2); koy(e, r2); koy(c, r2);
        } else {
          koy(a, r1); koy(b, r1); koy(c, r1);
          koy(b, r2); koy(e, r2); koy(c, r2);
        }
      }
    }
    geo.arazi = v; geo.araziSayi = ucgen * 3;

    // Ölçüm noktaları: düğümlerin kendisi.
    var p = new Float32Array(n * 4);
    for (var q = 0; q < n; q++) {
      p[q * 4] = dx[q]; p[q * 4 + 1] = dz[q]; p[q * 4 + 2] = dh[q]; p[q * 4 + 3] = dr[q];
    }
    geo.nokta = p; geo.noktaSayi = n;
  })();

  /* ------------------------------------------------------ koridor ağı */
  /* Her kesitte yedi nokta: sol topuk, sol banket, sol şerit, eksen, sağ
     şerit, sağ banket, sağ topuk. `k` sütun sırasıdır; gölgelendirici
     tamsayı k'larda boyuna çizgiyi (banket, şerit kenarı, topuk) çizer. */
  (function () {
    var v = new Float32Array(KN * 7 * 6), o = 0;
    for (var i = 0; i < KN; i++) {
      var K = KES[i], p = kotAl(PROJE, K.s);
      var dler = [-K.sol, -BANKET, -SERIT, 0, SERIT, BANKET, K.sag];
      for (var c = 0; c < 7; c++) {
        var d = dler[c], xz = konum(K.s, d), g = araziKot(xz[0], xz[1], K.s, d);
        var h = (c === 0 || c === 6) ? bitmisKot(K.s, d, g) : platformKot(p, Math.abs(d));
        v[o++] = xz[0]; v[o++] = xz[1]; v[o++] = h; v[o++] = K.s; v[o++] = g; v[o++] = c;
      }
    }
    var ind = new Uint16Array((KN - 1) * 6 * 6), m = 0;
    for (var j = 0; j < KN - 1; j++) {
      for (var cc = 0; cc < 6; cc++) {
        var a = j * 7 + cc, b = a + 1, e = a + 7, f = e + 1;
        ind[m++] = a; ind[m++] = b; ind[m++] = e;
        ind[m++] = b; ind[m++] = f; ind[m++] = e;
      }
    }
    geo.koridor = v; geo.koridorInd = ind;
  })();

  /* ------------------------------------------ güzergâh şeridi ve km işaretleri */
  /* Eksen, 1 m genişliğinde bir şerit olarak yüzeye yatırılır; WebGL çizgisi
     her zaman 1 piksel, eksen ise sahnenin en belirgin çizgisi olmalı.
     Her köşe hem arazi hem bitmiş kotu taşır: koridor o istasyona
     ulaştığında şerit arazi yüzeyinden yol yüzeyine iner. */
  (function () {
    var liste = [];
    function nokta(s, d, kalk) {
      var xz = konum(s, d), g = araziKot(xz[0], xz[1], s, d);
      liste.push(xz[0], xz[1], g, bitmisKot(s, d, g), s, kalk);
    }
    function dortgen(s0, d0, s1, d1, en, kalk) {
      // s0→s1 boyunca, d0→d1 enine; `en` şeridin genişliği.
      var y = en / 2;
      if (s0 === s1) {
        nokta(s0 - y, d0, kalk); nokta(s0 + y, d0, kalk); nokta(s0 + y, d1, kalk);
        nokta(s0 - y, d0, kalk); nokta(s0 + y, d1, kalk); nokta(s0 - y, d1, kalk);
      } else {
        nokta(s0, -y, kalk); nokta(s1, -y, kalk); nokta(s1, y, kalk);
        nokta(s0, -y, kalk); nokta(s1, y, kalk); nokta(s0, y, kalk);
      }
    }
    for (var s = 0; s < UZUNLUK; s += 1) { dortgen(s, 0, s + 1, 0, 0.7, 0.9); }
    geo.eksenSayi = liste.length / 6;
    for (var t = 0; t <= UZUNLUK; t += 20) {
      var uzun = t % 100 === 0 ? 7 : 3.5;
      dortgen(t, -uzun, t, uzun, 0.45, 1.0);
    }
    geo.serit = new Float32Array(liste); geo.seritSayi = liste.length / 6;
  })();

  /* ------------------------------------------------------ en kesit perdesi */
  /* Bir istasyonda dikey bir perde: arazi çizgisi, proje çizgisi ve aradaki
     alan (kazı kırmızı, dolgu yeşil) — programın en kesit görünümü sahnenin
     içinde dikilmiş hâli. Köşe: x, kot, z, fark (arazi − proje). */
  function kesitYap(s) {
    var sol = kesitAra(s, 'sol'), sag = kesitAra(s, 'sag');
    var alan = [], arazi = [], proje = [], dA = 0.5;
    var enAlt = Infinity, enUst = -Infinity, onceki = null;
    for (var d = -sol - 4; d <= sag + 4 + 1e-6; d += dA) {
      var xz = konum(s, d), g = araziKot(xz[0], xz[1], s, d), f = bitmisKot(s, d, g);
      var ic = d >= -sol - 1e-6 && d <= sag + 1e-6;
      if (!ic) { f = g; }
      enAlt = Math.min(enAlt, g, f); enUst = Math.max(enUst, g, f);
      arazi.push(xz[0], g, xz[1], 0);
      if (ic) { proje.push(xz[0], f, xz[1], 0); }
      var simdi = [xz[0], xz[1], g, f];
      if (onceki) {
        var fa = onceki[2] - onceki[3], fb = g - f;
        alan.push(onceki[0], onceki[2], onceki[1], fa, onceki[0], onceki[3], onceki[1], fa,
                  xz[0], g, xz[1], fb,
                  onceki[0], onceki[3], onceki[1], fa, xz[0], f, xz[1], fb, xz[0], g, xz[1], fb);
      }
      onceki = simdi;
    }
    // Kesit görünümünün çerçevesi: programdaki kesit penceresi gibi.
    var a = konum(s, -sol - 4), b = konum(s, sag + 4), alt = enAlt - 1.2, ust = enUst + 1.6;
    var cerceve = [a[0], alt, a[1], 0, b[0], alt, b[1], 0, b[0], ust, b[1], 0,
                   a[0], ust, a[1], 0, a[0], alt, a[1], 0];
    return { alan: alan, arazi: arazi, proje: proje, cerceve: cerceve, ust: ust };
  }

  var KESITLER = [50, 100, 150, 200, 250, 300, 350];
  (function () {
    var hepsi = [], parca = [];
    KESITLER.forEach(function (s) {
      var k = kesitYap(s), bas = hepsi.length / 4, p = { s: s, ust: k.ust };
      p.alan = [bas, k.alan.length / 4]; hepsi.push.apply(hepsi, k.alan);
      p.arazi = [hepsi.length / 4, k.arazi.length / 4]; hepsi.push.apply(hepsi, k.arazi);
      p.proje = [hepsi.length / 4, k.proje.length / 4]; hepsi.push.apply(hepsi, k.proje);
      p.cerceve = [hepsi.length / 4, k.cerceve.length / 4]; hepsi.push.apply(hepsi, k.cerceve);
      parca.push(p);
    });
    geo.kesit = new Float32Array(hepsi); geo.kesitParca = parca;
  })();

  // Plan görünümünün merkezi: projenin sınır kutusunun ortası.
  var MERKEZ = (function () {
    var a = Infinity, b = -Infinity, c = Infinity, d = -Infinity;
    for (var s = 0; s <= UZUNLUK; s += 10) {
      eksen(s); a = Math.min(a, _x); b = Math.max(b, _x); c = Math.min(c, _z); d = Math.max(d, _z);
    }
    return [(a + b) / 2, (c + d) / 2];
  })();

  /* ======================================================== GÖLGELENDİRİCİ */
  var ORTAK =
    '#version 300 es\nprecision highp float;\n' +
    'uniform mat4 uVP; uniform vec3 uGoz; uniform vec2 uSis; uniform float uPlan;\n' +
    'uniform vec2 uMerkez; uniform vec2 uPlanR; uniform float uTaban; uniform float uAbartma;\n' +
    'float sisAl(vec3 p){\n' +
    '  float o = 1.0 - smoothstep(uSis.x, uSis.y, distance(p, uGoz));\n' +
    '  float r = 1.0 - smoothstep(uPlanR.x, uPlanR.y, distance(p.xz, uMerkez));\n' +
    '  return mix(o, r, uPlan);\n}\n' +
    'vec3 yukselt(vec2 xz, float h, float kalk){ return vec3(xz.x, (h - uTaban) * uAbartma + kalk, xz.y); }\n';

  /* Arazi: gizli çizgi dolgusu + TIN + eşyükselti + tepe gölgesi. */
  var ARAZI_VS =
    'in vec2 aXZ; in float aH; in float aS; in float aM; in float aR;\n' +
    'out vec3 vP; out float vH; out float vS; out float vM; out float vR; out vec3 vB;\n' +
    'void main(){\n' +
    '  vec3 p = yukselt(aXZ, aH, 0.0);\n' +
    '  vP = p; vH = aH; vS = aS; vM = aM; vR = aR;\n' +
    '  int k = gl_VertexID % 3;\n' +
    '  vB = vec3(k == 0 ? 1.0 : 0.0, k == 1 ? 1.0 : 0.0, k == 2 ? 1.0 : 0.0);\n' +
    '  gl_Position = uVP * vec4(p, 1.0);\n}\n';
  var ARAZI_FS =
    'uniform vec3 uZemin; uniform vec3 uInce; uniform vec3 uAna; uniform vec3 uVurgu;\n' +
    'uniform float uYapim; uniform float uTinR; uniform vec2 uTinMerkez; uniform float uTelAlfa;\n' +
    'uniform float uKontur; uniform float uSeviye; uniform float uDolgu;\n' +
    'in vec3 vP; in float vH; in float vS; in float vM; in float vR; in vec3 vB;\n' +
    'out vec4 renk;\n' +
    'void main(){\n' +
    // Koridorun yapıldığı yerde arazi kalkar; altından koridor ağı görünür.
    '  if (vS > 0.0 && vS < uYapim && vM < 0.0) discard;\n' +
    '  float sis = sisAl(vP);\n' +
    '  if (sis < 0.003) discard;\n' +
    // TIN, bir merkezden halka hâlinde örülür; kenarı üçgen başına titrer.
    '  float r = distance(vP.xz, uTinMerkez) - vR * 45.0;\n' +
    '  float ac = 1.0 - smoothstep(uTinR - 10.0, uTinR, r);\n' +
    '  vec3 fw = fwidth(vB);\n' +
    '  vec3 kb = smoothstep(vec3(0.0), fw * 1.15, vB);\n' +
    '  float tel = 1.0 - min(min(kb.x, kb.y), kb.z);\n' +
    // Üçgenler ekranda birkaç piksele inince tel çizgi söner: uzakta ağ gri
    // bir bant olarak okunuyordu.
    '  tel *= 1.0 - smoothstep(0.10, 0.32, max(max(fw.x, fw.y), fw.z));\n' +
    '  tel *= ac * uTelAlfa;\n' +
    '  vec3 n = normalize(cross(dFdx(vP), dFdy(vP)));\n' +
    '  if (n.y < 0.0) n = -n;\n' +
    '  float isik = clamp(dot(n, normalize(vec3(-0.45, 0.8, 0.35))), 0.0, 1.0);\n' +
    '  vec3 c = mix(uZemin, uAna, (1.0 - isik) * 0.24 * ac);\n' +
    // Eşyükselti: 1 m ara, 5 m ana eğri. Eğriler sıklaşınca söner.
    '  float fh = max(fwidth(vH), 1e-4);\n' +
    '  float e1 = abs(fract(vH - 0.5) - 0.5) / fh;\n' +
    '  float e5 = abs(fract(vH / 5.0 - 0.5) - 0.5) * 5.0 / fh;\n' +
    '  float k1 = (1.0 - smoothstep(0.4, 1.3, e1)) * (1.0 - smoothstep(0.16, 0.42, fh));\n' +
    '  float k5 = (1.0 - smoothstep(0.55, 1.6, e5)) * (1.0 - smoothstep(0.9, 2.4, fh));\n' +
    '  float kac = 1.0 - smoothstep(uSeviye - 0.4, uSeviye, vH);\n' +
    // Yükselen seviye çizgisi piksel kalınlığında: metre cinsinden bir bant
    // düzlükte ekranın yarısını boyuyordu.
    '  float dalga = (1.0 - smoothstep(1.0, 3.0, abs(vH - uSeviye) / fh)) * step(0.001, uKontur) * step(uKontur, 0.999);\n' +
    '  c = mix(c, uInce, tel);\n' +
    '  c = mix(c, uAna, k1 * kac * 0.42);\n' +
    '  c = mix(c, uAna, k5 * kac * 0.85);\n' +
    '  c = mix(c, uVurgu, dalga * 0.7);\n' +
    '  float a = uDolgu * sis;\n' +
    '  renk = vec4(c * a, a);\n}\n';

  /* Koridor: şevler kazı/dolgu tonunda, platform nötr; boyuna çizgiler,
     10 m'de bir enine çizgi ve yapım cephesinde vurgu. */
  var KORIDOR_VS =
    'in vec2 aXZ; in float aH; in float aS; in float aG; in float aK;\n' +
    'out vec3 vP; out float vS; out float vF; out float vK;\n' +
    'void main(){\n' +
    '  vec3 p = yukselt(aXZ, aH, 0.0);\n' +
    '  vP = p; vS = aS; vF = aG - aH; vK = aK;\n' +
    '  gl_Position = uVP * vec4(p, 1.0);\n}\n';
  var KORIDOR_FS =
    'uniform vec3 uZemin; uniform vec3 uInce; uniform vec3 uAna; uniform vec3 uVurgu;\n' +
    'uniform vec3 uKazi; uniform vec3 uDolguR; uniform float uYapim; uniform float uDolgu;\n' +
    'in vec3 vP; in float vS; in float vF; in float vK;\n' +
    'out vec4 renk;\n' +
    'void main(){\n' +
    '  if (vS > uYapim) discard;\n' +
    '  float sis = sisAl(vP);\n' +
    '  if (sis < 0.003) discard;\n' +
    '  bool plat = vK > 1.0 && vK < 5.0;\n' +
    '  vec3 ton = vF >= 0.0 ? uKazi : uDolguR;\n' +
    '  float fk = clamp(abs(vF) / 2.5, 0.35, 1.0);\n' +
    '  vec3 c = plat ? mix(uZemin, uAna, 0.13) : mix(uZemin, ton, 0.26 * fk);\n' +
    '  float ki = floor(vK + 0.5);\n' +
    '  float ek = abs(vK - ki) / max(fwidth(vK), 1e-4);\n' +
    '  float kenar = 1.0 - smoothstep(0.5, 1.4, ek);\n' +
    '  bool topuk = ki < 0.5 || ki > 5.5;\n' +
    '  float ka = topuk ? 0.95 : ((ki == 1.0 || ki == 5.0) ? 0.75 : (ki == 3.0 ? 0.0 : 0.4));\n' +
    '  float fs = max(fwidth(vS), 1e-4);\n' +
    '  float es = abs(fract(vS / 10.0 - 0.5) - 0.5) * 10.0 / fs;\n' +
    '  float frek = (1.0 - smoothstep(0.4, 1.3, es)) * (1.0 - smoothstep(1.2, 3.5, fs));\n' +
    '  c = mix(c, uAna, frek * 0.45);\n' +
    '  c = mix(c, topuk ? ton : uAna, kenar * ka);\n' +
    '  float on = (1.0 - smoothstep(0.0, 5.0, uYapim - vS)) * (1.0 - step(399.9, uYapim));\n' +
    '  c = mix(c, uVurgu, on * 0.6);\n' +
    '  float a = uDolgu * sis;\n' +
    '  renk = vec4(c * a, a);\n}\n';

  /* Güzergâh şeridi ve km işaretleri. */
  var SERIT_VS =
    'in vec2 aXZ; in float aG; in float aF; in float aS; in float aKalk;\n' +
    'uniform float uYapim;\n' +
    'out vec3 vP; out float vS;\n' +
    'void main(){\n' +
    '  vec3 p = yukselt(aXZ, aS <= uYapim ? aF : aG, aKalk);\n' +
    '  vP = p; vS = aS;\n' +
    '  gl_Position = uVP * vec4(p, 1.0);\n}\n';
  var SERIT_FS =
    'uniform vec3 uRenk; uniform float uAlfa; uniform float uSinir;\n' +
    'in vec3 vP; in float vS;\n' +
    'out vec4 renk;\n' +
    'void main(){\n' +
    '  if (vS > uSinir) discard;\n' +
    '  float a = uAlfa * sisAl(vP);\n' +
    '  renk = vec4(uRenk * a, a);\n}\n';

  /* Ölçüm noktaları: artı işaretli nokta imleri. */
  var NOKTA_VS =
    'in vec2 aXZ; in float aH; in float aR;\n' +
    'uniform float uNoktaR; uniform vec2 uTinMerkez; uniform float uBoyut;\n' +
    'out vec3 vP; out float vA;\n' +
    'void main(){\n' +
    '  vec3 p = yukselt(aXZ, aH, 0.3);\n' +
    '  vA = 1.0 - smoothstep(uNoktaR - 8.0, uNoktaR, distance(p.xz, uTinMerkez) - aR * 45.0);\n' +
    '  vP = p;\n' +
    '  if (aR > 0.55 || vA <= 0.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); gl_PointSize = 1.0; return; }\n' +
    '  gl_Position = uVP * vec4(p, 1.0);\n' +
    '  gl_PointSize = clamp(uBoyut * 110.0 / gl_Position.w, 2.0, uBoyut);\n}\n';
  var NOKTA_FS =
    'uniform vec3 uRenk; uniform float uAlfa;\n' +
    'in vec3 vP; in float vA;\n' +
    'out vec4 renk;\n' +
    'void main(){\n' +
    '  vec2 q = abs(gl_PointCoord - 0.5);\n' +
    '  if (min(q.x, q.y) > 0.09) discard;\n' +
    '  float a = vA * uAlfa * sisAl(vP);\n' +
    '  renk = vec4(uRenk * a, a);\n}\n';

  /* Kesit perdeleri: alan (işarete göre kazı/dolgu) ve çizgiler. */
  var DUZ_VS =
    'in vec4 aP;\n' +
    'out vec3 vP; out float vF;\n' +
    'void main(){\n' +
    '  vec3 p = vec3(aP.x, (aP.y - uTaban) * uAbartma, aP.z);\n' +
    '  vP = p; vF = aP.w;\n' +
    '  gl_Position = uVP * vec4(p, 1.0);\n}\n';
  var DUZ_FS =
    'uniform vec3 uRenk; uniform vec3 uKazi; uniform vec3 uDolguR;\n' +
    'uniform float uAlfa; uniform float uIsaret;\n' +
    'in vec3 vP; in float vF;\n' +
    'out vec4 renk;\n' +
    'void main(){\n' +
    '  vec3 c = uIsaret > 0.5 ? (vF >= 0.0 ? uKazi : uDolguR) : uRenk;\n' +
    '  float a = uAlfa * sisAl(vP);\n' +
    '  renk = vec4(c * a, a);\n}\n';

  /* ============================================================ GL KURULUM */
  function derle(tur, kaynak) {
    var s = gl.createShader(tur);
    gl.shaderSource(s, kaynak);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { throw new Error(gl.getShaderInfoLog(s)); }
    return s;
  }
  function program(vs, fs) {
    var p = gl.createProgram();
    gl.attachShader(p, derle(gl.VERTEX_SHADER, ORTAK + vs));
    gl.attachShader(p, derle(gl.FRAGMENT_SHADER, ORTAK + fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { throw new Error(gl.getProgramInfoLog(p)); }
    var u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < n; i++) {
      var ad = gl.getActiveUniform(p, i).name;
      u[ad] = gl.getUniformLocation(p, ad);
    }
    return { p: p, u: u };
  }
  // Ara bellek + köşe dizisi nesnesi. `duzen`: [[ad, boy], ...] sırasıyla.
  function vao(pr, veri, duzen, indis, dinamik) {
    var v = gl.createVertexArray();
    gl.bindVertexArray(v);
    var b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, veri, dinamik ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
    var adim = 0, kay = 0;
    duzen.forEach(function (d) { adim += d[1] * 4; });
    duzen.forEach(function (d) {
      var yer = gl.getAttribLocation(pr.p, d[0]);
      if (yer >= 0) {
        gl.enableVertexAttribArray(yer);
        gl.vertexAttribPointer(yer, d[1], gl.FLOAT, false, adim, kay);
      }
      kay += d[1] * 4;
    });
    if (indis) {
      var ib = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indis, gl.STATIC_DRAW);
    }
    gl.bindVertexArray(null);
    return { v: v, b: b };
  }

  var PR = {}, VA = {};
  var onKesitVeri = null, onKesitS = -1;

  function kur() {
    PR.arazi = program(ARAZI_VS, ARAZI_FS);
    PR.koridor = program(KORIDOR_VS, KORIDOR_FS);
    PR.serit = program(SERIT_VS, SERIT_FS);
    PR.nokta = program(NOKTA_VS, NOKTA_FS);
    PR.duz = program(DUZ_VS, DUZ_FS);
    VA.arazi = vao(PR.arazi, geo.arazi, [['aXZ', 2], ['aH', 1], ['aS', 1], ['aM', 1], ['aR', 1]]);
    VA.nokta = vao(PR.nokta, geo.nokta, [['aXZ', 2], ['aH', 1], ['aR', 1]]);
    VA.koridor = vao(PR.koridor, geo.koridor, [['aXZ', 2], ['aH', 1], ['aS', 1], ['aG', 1], ['aK', 1]], geo.koridorInd);
    VA.serit = vao(PR.serit, geo.serit, [['aXZ', 2], ['aG', 1], ['aF', 1], ['aS', 1], ['aKalk', 1]]);
    VA.kesit = vao(PR.duz, geo.kesit, [['aP', 4]]);
    VA.on = vao(PR.duz, new Float32Array(4096), [['aP', 4]], null, true);
    onKesitS = -1;
  }

  try { kur(); } catch (e) {
    if (window.console) { console.warn('zemin: WebGL kurulamadı, eski katmana dönülüyor', e); }
    yedegeDon();
    return;
  }

  /* ============================================================== KATMAN */
  // GL tuvali eski katmanın sınıfını taşır: ufuktaki ışıma (ata.css) onun
  // arka planında. Yazılar ayrı bir 2B tuvalde, GL'nin üstünde.
  tuval.className = 'telkafes-katman';
  tuval.setAttribute('aria-hidden', 'true');
  var yaziTuval = document.createElement('canvas');
  yaziTuval.className = 'zemin-yazi';
  yaziTuval.setAttribute('aria-hidden', 'true');
  var ox = yaziTuval.getContext('2d');
  document.body.insertBefore(yaziTuval, document.body.firstChild);
  document.body.insertBefore(tuval, document.body.firstChild);

  /* Kübaj göstergesi — yapım boyunca sol altta duran küçük bir durum
     çubuğu. Yapım cephesinin kendi etiketi 3B sahnede yolun üstünde; yapım
     aşaması ürün ve modül kartlarının arkasına düştüğü için o etiket çoğu an
     kartların altında kalıyordu ve rakamlar hiç değişmiyormuş gibi
     okunuyordu. Gösterge içeriğin ÜSTÜNDE, her zaman okunur. */
  var gosterge = document.createElement('div');
  gosterge.className = 'zemin-durum';
  gosterge.setAttribute('aria-hidden', 'true');
  gosterge.innerHTML =
    '<span class="zd-bas"><b>KÜBAJ</b><span data-zd="km"></span></span>' +
    '<span data-zd="kesit"></span><span data-zd="toplam"></span>' +
    '<i class="zd-cubuk"><b data-zd="cubuk"></b></i>';
  document.body.appendChild(gosterge);
  var zd = {};
  Array.prototype.forEach.call(gosterge.querySelectorAll('[data-zd]'), function (e) {
    zd[e.getAttribute('data-zd')] = e;
  });

  var w = 0, h = 0, op = 1;
  function olcule() {
    // 3x DPR'de tam çözünürlük gereksiz pahalı; 1,5 yeter.
    op = Math.min(window.devicePixelRatio || 1, 1.5);
    w = window.innerWidth; h = window.innerHeight;
    tuval.width = Math.round(w * op); tuval.height = Math.round(h * op);
    yaziTuval.width = Math.round(w * op); yaziTuval.height = Math.round(h * op);
    gl.viewport(0, 0, tuval.width, tuval.height);
  }

  /* --------------------------------------------------------------- renkler */
  var R = {}, RC = {}, yaziFont = 'monospace';
  function ayristir(c) {
    c = (c || '').trim();
    if (c.charAt(0) === '#') {
      if (c.length === 4) { c = '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3]; }
      var n = parseInt(c.slice(1, 7), 16);
      return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
    }
    var m = c.match(/(\d+(?:\.\d+)?)/g);
    if (m && m.length >= 3) { return [m[0] / 255, m[1] / 255, m[2] / 255]; }
    return [0.5, 0.5, 0.5];
  }
  function karistir(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function css(c) { return 'rgb(' + Math.round(c[0] * 255) + ',' + Math.round(c[1] * 255) + ',' + Math.round(c[2] * 255) + ')'; }

  /* TIN teli --cizgi ile --yazi-3 arasında: yalnız --cizgi açık ve gri
     temada zemine çok yakın kalıyor, yalnız --yazi-3 ise koyu temada eğrilerle
     yarışıyor. Eğriler --yazi-3, yazılar --yazi-2. */
  function renkleriOku() {
    var s = getComputedStyle(document.documentElement);
    function al(ad, yedek) { return ayristir(s.getPropertyValue(ad) || yedek); }
    R.zemin = al('--zemin', '#1A1D23');
    R.ana = al('--yazi-3', '#7C8390');
    R.ince = karistir(al('--cizgi', '#3D4450'), R.ana, 0.4);
    R.yazi = al('--yazi-2', '#AAB1BC');
    R.vurgu = al('--vurgu', '#4C8DFF');
    R.kazi = al('--kirmizi', '#FF5C57');
    R.dolgu = al('--yesil', '#3FCB6E');
    R.arazi = al('--yazi', '#E8EBEF');
    for (var k in R) { if (R.hasOwnProperty(k)) { RC[k] = css(R[k]); } }
    var f = s.getPropertyValue('--f-veri');
    if (f) { yaziFont = f.trim(); }
  }

  /* ============================================================== SAHNE */
  /* Sayfa kaydırması tek bir sayıya iner: `a`. Sahnedeki her şey `a`nın
     fonksiyonudur, zamana değil: yukarı kaydıran okuyucu projenin geri
     sarıldığını görür, ileri-geri arasında tutarsızlık olmaz.

     SAHNE ARALARI. Eskiden `a` bölüm sınırlarına bağlıydı ve sahnenin büyük
     olayları bölüm metni ekrandayken oluyordu: okumak için kaydıran okuyucu
     hikâyeyi de ilerletiyor, gözü yazı ile zemin arasında bölünüyordu.
     Şimdi anasayfada bölümlerin arasında metinsiz aralar var
     (index.html ▸ .sahne-arasi, data-sahne="a0,a1"). `a` yalnız bir aranın
     içinde ilerler; metin ekrandayken sahne son aranın sonunda bekler.
     Okuyucu ya okur ya izler, ikisi aynı anda istenmez.

     Aranın yolu: üst kenarı ekranın %40'ına geldiğinde başlar, alt kenarı
     %60'a çıktığında biter. Bu arada ekranın en az %60'ı metinsizdir. */
  var aralar = null;       /* anasayfa değilse null: "gezinti" kipi */

  function bolumleriOlc() {
    var y = window.pageYOffset || 0, liste = [];
    var el = document.querySelectorAll('.sahne-arasi[data-sahne]');
    for (var i = 0; i < el.length; i++) {
      var r = el[i].getBoundingClientRect(), a = el[i].getAttribute('data-sahne').split(',');
      if (!r.height) { continue; }        /* ara gizli: zemin oynamıyor */
      liste.push({ ust: r.top + y, boy: r.height, a0: +a[0], a1: +a[1] });
    }
    aralar = liste.length ? liste : null;
    kirli = true;
  }

  function aHesapla() {
    var sy = window.pageYOffset || 0, vh = h || 800;
    if (!aralar) {                                  /* gezinti: 0..1 */
      return sy / Math.max(1, document.documentElement.scrollHeight - vh);
    }
    var a = aralar[0].a0;
    for (var i = 0; i < aralar.length; i++) {
      var r = aralar[i];
      var t = (vh * 0.4 - (r.ust - sy)) / Math.max(1, r.boy - vh * 0.2);
      if (t <= 0) { break; }
      a = r.a0 + (r.a1 - r.a0) * Math.min(1, t);
    }
    return a;
  }

  // a → sahne durumu. Her aşama bir aralığa bağlı; aralıklar örtüşmez ki
  // okuyucu hangi bölümdeyse zeminde de tek bir iş olsun.
  function ara(a, b, x) { return yumusak(a, b, x); }

  /* a, göz istasyonu, göz ofseti, göz yüksekliği, hedef ist., hedef ofseti.
     Ofset sağa (doğuya) pozitif: kamera baştan sona yolun doğu yanında
     kalır, böylece yan görünümde ve planda km soldan sağa artar. */
  var KAMERA = [
    [0.00, -170,   6,  56,  60,   0],
    [1.00, -150,  40,  82,  90,  -8],
    [2.00, -120,  75, 108, 170, -12],
    [3.00,  -95,  60,  96, 190,   0],
    [3.85,  -55, 105,  82,  25,   0]
  ];
  var YAPIM_BAS = 3.85, YAPIM_SON = 5.9;
  var YAN = [7.2, 205, 150, 92, 205, 0];
  var SON = [YAPIM_SON, 345, 105, 82, 425, 0];

  function kameraAnahtar(a) {
    var k;
    if (a <= KAMERA[KAMERA.length - 1][0]) {
      for (var i = 0; i < KAMERA.length - 1; i++) {
        var p = KAMERA[i], q = KAMERA[i + 1];
        if (a <= q[0]) {
          var t = ara(p[0], q[0], a);
          return p.map(function (v, n) { return v + (q[n] - v) * t; });
        }
      }
      return KAMERA[0];
    }
    if (a <= YAPIM_SON) {
      // Yapım sırasında kamera cepheyi sağ-arkadan, çaprazdan izler. Tam
      // arkadan bakınca yol ekranda dikey uzanıyor ve ürün/modül kartlarının
      // arkasında kayboluyordu; çaprazdan ekranı boydan boya geçer, bölüm
      // aralarındaki boşluklarda da görünür. Öndeki kesit perdesi de bu
      // açıdan yüzüyle okunur.
      var Y = ara(YAPIM_BAS, YAPIM_SON, a) * UZUNLUK;
      return [a, Y - 55, 105, 82, Y + 25, 0];
    }
    k = ara(6.05, YAN[0], a);
    return SON.map(function (v, n) { return v + (YAN[n] - v) * k; });
  }

  function durumHesapla(a, zaman) {
    var d = {};
    if (!aralar) {
      // Gezinti kipi (anasayfa dışı ve duran zemin): bitmiş projenin
      // üzerinde, kaydırmayla ilerleyen alçak bir uçuş.
      d.kontur = 1; d.guzergah = UZUNLUK; d.yapim = UZUNLUK; d.kesit = 0;
      d.plan = 0; d.pafta = 0; d.onKesit = 0; d.pin = 0; d.etiket = 1; d.gezinti = 1;
      // Çaprazdan ve yol ekranın sağ yarısında: alt sayfaların metin sütunu
      // solda, eksen onun altından geçince okumayı bölüyordu. Dikey telefon
      // ekranında kayma sıfırlanır, yoksa yol kadrajdan çıkar.
      var es = -40 + a * 300, kay = -45 * yumusak(0.9, 1.5, w / Math.max(1, h));
      d.kam = [0, es, -75, 80, es + 110, kay];
    } else {
      d.kontur = ara(0.55, 1.9, a);
      d.guzergah = ara(1.9, 2.9, a) * UZUNLUK;
      d.yapim = ara(YAPIM_BAS, YAPIM_SON, a) * UZUNLUK;
      d.kesit = ara(6.0, 7.2, a);
      d.plan = ara(7.6, 9.0, a);
      d.pafta = ara(8.7, 9.6, a);
      d.onKesit = ara(YAPIM_BAS, YAPIM_BAS + 0.12, a) * (1 - ara(YAPIM_SON - 0.05, YAPIM_SON + 0.12, a));
      d.pin = ara(2.6, 3.0, a) * (1 - ara(4.1, 4.5, a));
      d.etiket = ara(1.9, 2.2, a);
      d.kam = kameraAnahtar(a);
    }
    // Açılış: noktalar düşer, sonra TIN örülür — zamana bağlı, bir kez.
    d.noktaR = duragan ? 1e5 : ara(0.1, 2.6, zaman) * 1400;
    d.tinR = duragan ? 1e5 : ara(0.9, 3.8, zaman) * 1400;
    d.noktaAlfa = duragan ? 0 : (1 - ara(0.3, 1.2, a)) * 0.9 + 0.1 * (1 - d.kontur);
    // Eğriler geldikçe TIN geri çekilir; planda daha da: kuşbakışı bütün
    // yüzey tel ile dolu görünüyor, eğrileri boğuyordu.
    d.telAlfa = (0.62 - 0.3 * d.kontur) * (1 - 0.45 * d.plan);
    return d;
  }

  /* ------------------------------------------------------------ matrisler */
  function perspektif(fov, asp, n, f) {
    var t = 1 / Math.tan(fov / 2), nf = 1 / (n - f);
    return [t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) * nf, -1, 0, 0, 2 * f * n * nf, 0];
  }
  function birim(v) { var l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
  function capraz(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function nokta3(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function bak(g, hd, yukari) {
    var z = birim([g[0] - hd[0], g[1] - hd[1], g[2] - hd[2]]);
    var x = birim(capraz(yukari, z)), y = capraz(z, x);
    return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0,
            -nokta3(x, g), -nokta3(y, g), -nokta3(z, g), 1];
  }
  function carp(a, b) {
    var o = new Float32Array(16);
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        var s = 0;
        for (var k = 0; k < 4; k++) { s += a[k * 4 + j] * b[i * 4 + k]; }
        o[i * 4 + j] = s;
      }
    }
    return o;
  }

  /* -------------------------------------------------------------- kamera */
  var VP = null, GOZ = [0, 0, 0], SIS = [120, 560], PLANR = [1e4, 2e4], KAM_SAG = [1, 0, 0];

  function yuzeyY(s, d) {
    var g = araziSD(s, d);
    return (g - TABAN) * ABARTMA;
  }

  function kameraKur(d) {
    var k = d.kam, asp = w / Math.max(1, h);
    // Kamera yalnız kaydırmayla oynar. Eskiden boşta salınıyor ve fareyi
    // izliyordu; okumak için duran okuyucunun gözünün kenarında hep bir
    // kıpırtı kalıyor, fareyi satır boyunca gezdiren okuyucuda sahne tam
    // okunan yerin arkasında kayıyordu. Okuyucunun kendi elinden gelen
    // hareket göz ardı edilebiliyor, kendiliğinden olan edilemiyor.
    var gp = konum(k[1], k[2]), hp = konum(k[4], k[5]);
    var goz = [gp[0], k[3], gp[1]], hedef = [hp[0], 0, hp[1]];

    // Plan: projenin ortasının tam üstü. Ekranın yukarısı yan görünümün
    // bakış yönü olur, böylece dönüş saf bir eğilme hareketidir, dönme yok;
    // güzergâh da geniş ekranda yatay uzanır.
    var yanH = konum(YAN[4], YAN[5]), yanG = konum(YAN[1], YAN[2]);
    var planYuk = birim([yanH[0] - yanG[0], 0, yanH[1] - yanG[1]]);
    var planSag = [-planYuk[2], 0, planYuk[0]];
    var fov = (50 + (30 - 50) * d.plan) * Math.PI / 180, tn = Math.tan(fov / 2);
    var yG = 0, yY = 0;
    for (var s = 0; s <= UZUNLUK; s += 25) {
      eksen(s);
      var vx = _x - MERKEZ[0], vz = _z - MERKEZ[1];
      yG = Math.max(yG, Math.abs(vx * planSag[0] + vz * planSag[2]));
      yY = Math.max(yY, Math.abs(vx * planYuk[0] + vz * planYuk[2]));
    }
    yG += 70; yY += 70;
    var planH = Math.max(yG / (Math.tan(15 * Math.PI / 180) * asp), yY / Math.tan(15 * Math.PI / 180));
    var p = d.plan;
    if (p > 0) {
      var pg = [MERKEZ[0] - planYuk[0] * 0.01, planH, MERKEZ[1] - planYuk[2] * 0.01];
      for (var i = 0; i < 3; i++) {
        goz[i] += (pg[i] - goz[i]) * p;
        hedef[i] += ([MERKEZ[0], 0, MERKEZ[1]][i] - hedef[i]) * p;
      }
    }
    var yukari = birim([planYuk[0] * p, 1 - p, planYuk[2] * p]);
    if (p > 0.999) { yukari = planYuk; }
    var V = bak(goz, hedef, yukari);
    var P = perspektif(fov, asp, 1.5, 5000);
    // Dünya solak (x doğu, y yukarı, z kuzey), izdüşüm sağlak varsayar:
    // ekranın x'i çevrilmezse sahne aynalanır — sağa dönen kurp sola döner,
    // plan ters harita olur.
    P[0] = -P[0];
    VP = carp(P, V);
    GOZ = goz;
    KAM_SAG = [V[0], V[4], V[8]];
    var r = Math.max(yG, yY);
    PLANR = [r * 1.1, r * 1.6];
    SIS = [120, 560];
  }

  // Dünya → ekran. [x, y, görünürlük] ya da null.
  function ekran(x, y, z) {
    var m = VP;
    var cx = m[0] * x + m[4] * y + m[8] * z + m[12];
    var cy = m[1] * x + m[5] * y + m[9] * z + m[13];
    var cw = m[3] * x + m[7] * y + m[11] * z + m[15];
    if (cw <= 0.5) { return null; }
    var sx = (cx / cw * 0.5 + 0.5) * w, sy = (1 - (cy / cw * 0.5 + 0.5)) * h;
    return [sx, sy, cw];
  }
  function sisJs(x, y, z, plan) {
    var o = 1 - yumusak(SIS[0], SIS[1], Math.hypot(x - GOZ[0], y - GOZ[1], z - GOZ[2]));
    var r = 1 - yumusak(PLANR[0], PLANR[1], Math.hypot(x - MERKEZ[0], z - MERKEZ[1]));
    return o + (r - o) * plan;
  }

  /* ================================================================ ÇİZİM */
  function ortak(pr, d) {
    var u = pr.u;
    gl.uniformMatrix4fv(u.uVP, false, VP);
    gl.uniform3fv(u.uGoz, GOZ);
    gl.uniform2fv(u.uSis, SIS);
    gl.uniform1f(u.uPlan, d.plan);
    gl.uniform2fv(u.uMerkez, MERKEZ);
    gl.uniform2fv(u.uPlanR, PLANR);
    gl.uniform1f(u.uTaban, TABAN);
    gl.uniform1f(u.uAbartma, ABARTMA);
    if (u.uZemin) { gl.uniform3fv(u.uZemin, R.zemin); }
    if (u.uInce) { gl.uniform3fv(u.uInce, R.ince); }
    if (u.uAna) { gl.uniform3fv(u.uAna, R.ana); }
    if (u.uVurgu) { gl.uniform3fv(u.uVurgu, R.vurgu); }
    if (u.uKazi) { gl.uniform3fv(u.uKazi, R.kazi); }
    if (u.uDolguR) { gl.uniform3fv(u.uDolguR, R.dolgu); }
    if (u.uYapim) { gl.uniform1f(u.uYapim, d.yapim); }
    if (u.uDolgu) { gl.uniform1f(u.uDolgu, 0.93); }
  }

  var TIN_MERKEZ = konum(-20, 0);

  function onKesitGuncelle(s) {
    if (Math.abs(s - onKesitS) < 0.05) { return; }
    onKesitS = s;
    var k = kesitYap(s), hepsi = [];
    onKesitVeri = { ust: k.ust };
    onKesitVeri.alan = [0, k.alan.length / 4]; hepsi = hepsi.concat(k.alan);
    onKesitVeri.arazi = [hepsi.length / 4, k.arazi.length / 4]; hepsi = hepsi.concat(k.arazi);
    onKesitVeri.proje = [hepsi.length / 4, k.proje.length / 4]; hepsi = hepsi.concat(k.proje);
    onKesitVeri.cerceve = [hepsi.length / 4, k.cerceve.length / 4]; hepsi = hepsi.concat(k.cerceve);
    gl.bindBuffer(gl.ARRAY_BUFFER, VA.on.b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(hepsi), gl.DYNAMIC_DRAW);
  }

  function kesitCiz(p, alfa) {
    var u = PR.duz.u;
    gl.uniform1f(u.uIsaret, 1);
    gl.uniform1f(u.uAlfa, alfa * 0.28);
    gl.drawArrays(gl.TRIANGLES, p.alan[0], p.alan[1]);
    gl.uniform1f(u.uIsaret, 0);
    gl.uniform3fv(u.uRenk, R.ana);
    gl.uniform1f(u.uAlfa, alfa * 0.5);
    gl.drawArrays(gl.LINE_STRIP, p.cerceve[0], p.cerceve[1]);
    gl.uniform3fv(u.uRenk, R.arazi);
    gl.uniform1f(u.uAlfa, alfa * 0.9);
    gl.drawArrays(gl.LINE_STRIP, p.arazi[0], p.arazi[1]);
    gl.uniform3fv(u.uRenk, R.kazi);
    gl.drawArrays(gl.LINE_STRIP, p.proje[0], p.proje[1]);
  }

  function glCiz(d) {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(true);

    // 1. Arazi
    var pr = PR.arazi, u = pr.u;
    gl.useProgram(pr.p); ortak(pr, d);
    gl.uniform1f(u.uTinR, d.tinR);
    gl.uniform2fv(u.uTinMerkez, TIN_MERKEZ);
    gl.uniform1f(u.uTelAlfa, d.telAlfa);
    gl.uniform1f(u.uKontur, d.kontur);
    gl.uniform1f(u.uSeviye, 806 + d.kontur * 26);
    gl.bindVertexArray(VA.arazi.v);
    gl.drawArrays(gl.TRIANGLES, 0, geo.araziSayi);

    // 2. Koridor — arazinin önünde kalsın diye derinlik kaydırmalı.
    gl.enable(gl.POLYGON_OFFSET_FILL);
    if (d.yapim > 0) {
      pr = PR.koridor;
      gl.useProgram(pr.p); ortak(pr, d);
      gl.polygonOffset(-1, -4);
      gl.bindVertexArray(VA.koridor.v);
      gl.drawElements(gl.TRIANGLES, geo.koridorInd.length, gl.UNSIGNED_SHORT, 0);
    }

    // 3. Güzergâh şeridi ve km işaretleri
    if (d.guzergah > 0) {
      pr = PR.serit; u = pr.u;
      gl.useProgram(pr.p); ortak(pr, d);
      gl.polygonOffset(-2, -8);
      gl.uniform1f(u.uSinir, d.guzergah);
      gl.uniform3fv(u.uRenk, R.vurgu);
      gl.bindVertexArray(VA.serit.v);
      gl.uniform1f(u.uAlfa, 0.95);
      gl.drawArrays(gl.TRIANGLES, 0, geo.eksenSayi);
      gl.uniform1f(u.uAlfa, 0.7);
      gl.drawArrays(gl.TRIANGLES, geo.eksenSayi, geo.seritSayi - geo.eksenSayi);
    }
    gl.disable(gl.POLYGON_OFFSET_FILL);

    // 4. Ölçüm noktaları
    gl.depthMask(false);
    if (d.noktaAlfa > 0.01) {
      pr = PR.nokta; u = pr.u;
      gl.useProgram(pr.p); ortak(pr, d);
      gl.uniform1f(u.uNoktaR, d.noktaR);
      gl.uniform2fv(u.uTinMerkez, TIN_MERKEZ);
      gl.uniform1f(u.uBoyut, 7 * op);
      gl.uniform3fv(u.uRenk, R.ana);
      gl.uniform1f(u.uAlfa, d.noktaAlfa);
      gl.bindVertexArray(VA.nokta.v);
      gl.drawArrays(gl.POINTS, 0, geo.noktaSayi);
    }

    // 5. Kesit perdeleri — derinlik sınaması kapalı: dolgu alanı yolun
    // ALTINDA kalıyor, sınansa yol gövdesi onu hep örterdi.
    gl.disable(gl.DEPTH_TEST);
    pr = PR.duz;
    gl.useProgram(pr.p); ortak(pr, d);
    if (d.kesit > 0.001) {
      gl.bindVertexArray(VA.kesit.v);
      geo.kesitParca.forEach(function (p, i) {
        var al = ara(i * 0.07, i * 0.07 + 0.5, d.kesit);
        if (al > 0.001) { kesitCiz(p, al); }
      });
    }
    if (d.onKesit > 0.001 && d.yapim > 0.5) {
      onKesitGuncelle(Math.min(UZUNLUK - 0.01, d.yapim));
      gl.bindVertexArray(VA.on.v);
      kesitCiz(onKesitVeri, d.onKesit);
    }
    gl.bindVertexArray(null);
  }

  /* ---------------------------------------------------------- yazı katmanı */
  function kmYaz(km) {
    var tam = Math.floor(km / 1000), kalan = km - tam * 1000;
    var p = kalan.toFixed(2).split('.');
    while (p[0].length < 3) { p[0] = '0' + p[0]; }
    return tam + '+' + p[0] + ',' + p[1];
  }
  function kmKisa(km) { return kmYaz(km).split(',')[0]; }
  function sayi(v, b) {
    return v.toLocaleString('tr-TR', { minimumFractionDigits: b, maximumFractionDigits: b });
  }

  function etiket(metin, x, y, renk, alfa, hiza, boy) {
    if (alfa < 0.02) { return; }
    ox.font = (boy || 11) + 'px ' + yaziFont;
    ox.textAlign = hiza || 'left';
    ox.globalAlpha = alfa;
    ox.lineWidth = 3;
    ox.strokeStyle = RC.zemin;
    ox.strokeText(metin, x, y);
    ox.fillStyle = renk;
    ox.fillText(metin, x, y);
  }

  // İstasyondaki yüzey noktası (koridor oraya ulaştıysa yol, yoksa arazi).
  function yuzeyNokta(s, dOff, yapim) {
    var xz = konum(s, dOff), g = araziKot(xz[0], xz[1], s, dOff);
    var hh = s <= yapim ? bitmisKot(s, dOff, g) : g;
    return [xz[0], (hh - TABAN) * ABARTMA, xz[1]];
  }

  var pinKm = null;

  function yaziCiz(d) {
    ox.setTransform(op, 0, 0, op, 0, 0);
    ox.clearRect(0, 0, w, h);
    ox.textBaseline = 'middle';

    // Km etiketleri ve kurp yarıçapları
    if (d.etiket > 0.01) {
      for (var s = 0; s <= UZUNLUK; s += 100) {
        if (d.guzergah < s) { break; }
        var n = yuzeyNokta(s, 9, d.yapim), e = ekran(n[0], n[1] + 1, n[2]);
        if (e) {
          etiket(kmKisa(s), e[0] + 4, e[1], RC.yazi,
                 d.etiket * ara(s, s + 12, d.guzergah) * sisJs(n[0], n[1], n[2], d.plan) * 0.95);
        }
      }
      [[145, 'R=260'], [315, 'R=230']].forEach(function (r) {
        if (d.guzergah < r[0]) { return; }
        var n2 = yuzeyNokta(r[0], -16, d.yapim), e2 = ekran(n2[0], n2[1] + 1, n2[2]);
        if (e2) {
          etiket(r[1], e2[0], e2[1], RC.ana,
                 d.etiket * ara(r[0], r[0] + 20, d.guzergah) * sisJs(n2[0], n2[1], n2[2], d.plan) * 0.85, 'right');
        }
      });
    }

    // Profil bölümündeki imleç, 3B güzergâhta: dikey iğne + km.
    if (d.pin > 0.01 && pinKm !== null) {
      var pn = yuzeyNokta(pinKm, 0, d.yapim), alt = ekran(pn[0], pn[1] + 0.9, pn[2]),
          ust = ekran(pn[0], pn[1] + 26, pn[2]);
      if (alt && ust) {
        var pa = d.pin * sisJs(pn[0], pn[1], pn[2], d.plan);
        ox.globalAlpha = pa;
        ox.strokeStyle = RC.vurgu; ox.lineWidth = 1.2;
        ox.beginPath(); ox.moveTo(alt[0], alt[1]); ox.lineTo(ust[0], ust[1]); ox.stroke();
        ox.beginPath(); ox.arc(alt[0], alt[1], 4, 0, Math.PI * 2); ox.stroke();
        ox.fillStyle = RC.vurgu;
        ox.beginPath(); ox.arc(ust[0], ust[1], 2.5, 0, Math.PI * 2); ox.fill();
        etiket('Km ' + kmYaz(pinKm), ust[0] + 8, ust[1], RC.vurgu, pa);
        // Profil kutusu kotları okur; 3B iğne aynı km'nin kesit alanlarını.
        etiket('K ' + sayi(kesitAra(pinKm, 'kazi'), 1) + ' · D ' + sayi(kesitAra(pinKm, 'dolgu'), 1) + ' m²',
               ust[0] + 8, ust[1] + 15, RC.yazi, pa, 'left', 10);
      }
    }

    // Yapım cephesi: öndeki kesitin alanı ve o ana kadar biriken hacim.
    if (d.onKesit > 0.01 && d.yapim > 0.5 && onKesitVeri) {
      var Y = Math.min(UZUNLUK, d.yapim), on = yuzeyNokta(Y, 0, d.yapim);
      var e3 = ekran(on[0], (onKesitVeri.ust - TABAN) * ABARTMA + 5, on[2]);
      if (e3) {
        var fa = d.onKesit;
        etiket('Km ' + kmYaz(Y), e3[0], e3[1] - 30, RC.vurgu, fa, 'center', 12);
        etiket('Kesit  K ' + sayi(kesitAra(Y, 'kazi'), 1) + ' m²  ·  D ' + sayi(kesitAra(Y, 'dolgu'), 1) + ' m²',
               e3[0], e3[1] - 14, RC.yazi, fa, 'center');
        etiket('Toplam  Kazı ' + sayi(kesitAra(Y, 'vKazi'), 0) + ' m³  ·  Dolgu ' + sayi(kesitAra(Y, 'vDolgu'), 0) + ' m³',
               e3[0], e3[1] + 2, RC.yazi, fa, 'center');
      }
    }

    // Gezinti (alt sayfalar): kameranın baktığı istasyonun kesit alanları.
    // Hedef istasyon kaydırmayla sürekli ilerlediği için rakamlar da akar.
    if (d.gezinti) {
      var gs = d.kam[4];
      var ga = ara(0, 12, gs) * (1 - ara(388, UZUNLUK, gs));
      if (ga > 0.01) {
        var gn = yuzeyNokta(gs, 0, d.yapim), gAlt = ekran(gn[0], gn[1] + 0.9, gn[2]),
            gUst = ekran(gn[0], gn[1] + 18, gn[2]);
        if (gAlt && gUst) {
          ga *= sisJs(gn[0], gn[1], gn[2], 0);
          ox.globalAlpha = ga * 0.8;
          ox.strokeStyle = RC.vurgu; ox.lineWidth = 1;
          ox.beginPath(); ox.moveTo(gAlt[0], gAlt[1]); ox.lineTo(gUst[0], gUst[1]); ox.stroke();
          ox.beginPath(); ox.arc(gAlt[0], gAlt[1], 3.5, 0, Math.PI * 2); ox.stroke();
          etiket('Km ' + kmYaz(gs), gUst[0] + 7, gUst[1], RC.vurgu, ga);
          etiket('K ' + sayi(kesitAra(gs, 'kazi'), 1) + ' · D ' + sayi(kesitAra(gs, 'dolgu'), 1) + ' m²',
                 gUst[0] + 7, gUst[1] + 15, RC.yazi, ga, 'left', 10);
        }
      }
    }

    // Dikili kesitlerin başlıkları
    if (d.kesit > 0.01) {
      geo.kesitParca.forEach(function (p, i) {
        var al = ara(i * 0.07 + 0.2, i * 0.07 + 0.6, d.kesit);
        var kn = konum(p.s, 0), yy = (p.ust - TABAN) * ABARTMA + 4, e4 = ekran(kn[0], yy, kn[1]);
        if (!e4 || al < 0.02) { return; }
        var f = al * sisJs(kn[0], yy, kn[1], d.plan);
        // 100'lük istasyonların km'si zaten güzergâh etiketinde yazıyor.
        if (p.s % 100) { etiket(kmKisa(p.s), e4[0], e4[1] - 14, RC.yazi, f, 'center'); }
        // Alanlar perde dikilirken sıfırdan sayar: hesaplanıyormuş gibi
        // gelir, hazır yazılmış bir sayı gibi değil.
        var say = ara(i * 0.07 + 0.25, i * 0.07 + 0.8, d.kesit);
        etiket('K ' + sayi(kesitAra(p.s, 'kazi') * say, 1) + ' · D ' + sayi(kesitAra(p.s, 'dolgu') * say, 1) + ' m²',
               e4[0], e4[1], RC.ana, f, 'center', 10);
      });
    }

    // Pafta: çift çerçeve, kuzey oku, ölçek çubuğu, antet.
    if (d.pafta > 0.01) {
      var A = d.pafta * 0.9;
      ox.globalAlpha = A;
      ox.strokeStyle = RC.ana; ox.lineWidth = 1;
      ox.strokeRect(14.5, 14.5, w - 29, h - 29);
      ox.lineWidth = 2;
      ox.strokeRect(22, 22, w - 44, h - 44);

      var m0 = ekran(MERKEZ[0], 0, MERKEZ[1]), mk = ekran(MERKEZ[0], 0, MERKEZ[1] + 40);
      var mx = ekran(MERKEZ[0] + KAM_SAG[0] * 100, 0, MERKEZ[1] + KAM_SAG[2] * 100);
      if (m0 && mk && mx) {
        // Kuzey oku (dünyada +z kuzey)
        var kx = mk[0] - m0[0], ky = mk[1] - m0[1], kl = Math.hypot(kx, ky) || 1;
        kx /= kl; ky /= kl;
        var ax = 64, ay = h - 96;
        ox.lineWidth = 1.4; ox.strokeStyle = RC.yazi; ox.fillStyle = RC.yazi;
        ox.beginPath(); ox.moveTo(ax - kx * 20, ay - ky * 20); ox.lineTo(ax + kx * 20, ay + ky * 20); ox.stroke();
        ox.beginPath();
        ox.moveTo(ax + kx * 24, ay + ky * 24);
        ox.lineTo(ax + kx * 12 - ky * 6, ay + ky * 12 + kx * 6);
        ox.lineTo(ax + kx * 12 + ky * 6, ay + ky * 12 - kx * 6);
        ox.closePath(); ox.fill();
        etiket('K', ax + kx * 36, ay + ky * 36, RC.yazi, A, 'center', 12);

        // Ölçek çubuğu: 100 m kaç piksel ediyorsa, 120–240 px arası bir boy.
        var pp = Math.hypot(mx[0] - m0[0], mx[1] - m0[1]) / 100;
        var boy = [25, 50, 100, 200].filter(function (m) { return m * pp >= 110; })[0] || 200;
        var bx = 104, by = h - 60, bl = boy * pp;
        ox.globalAlpha = A;
        ox.strokeStyle = RC.yazi; ox.lineWidth = 1;
        ox.strokeRect(bx + 0.5, by + 0.5, bl, 5);
        ox.fillStyle = RC.yazi;
        ox.fillRect(bx + 0.5, by + 0.5, bl / 2, 5);
        etiket('0', bx, by - 9, RC.yazi, A, 'center', 10);
        etiket(boy + ' m', bx + bl, by - 9, RC.yazi, A, 'center', 10);
      }
      // Antet
      // Antet — son satır projenin toplam kübajı, pafta gelirken sayar.
      var tw = 290, th = 81, tx = w - 22 - tw, ty = h - 22 - th, top = KES[KN - 1];
      ox.globalAlpha = A;
      ox.fillStyle = RC.zemin; ox.fillRect(tx, ty, tw, th);
      ox.strokeStyle = RC.ana; ox.lineWidth = 1;
      ox.strokeRect(tx + 0.5, ty + 0.5, tw, th);
      ox.beginPath();
      ox.moveTo(tx, ty + 27.5); ox.lineTo(tx + tw, ty + 27.5);
      ox.moveTo(tx, ty + 54.5); ox.lineTo(tx + tw, ty + 54.5);
      ox.stroke();
      etiket('ÖRNEK GÜZERGÂH  ·  PLAN', tx + 12, ty + 14, RC.yazi, A, 'left', 11);
      etiket('Km 0+000 – 0+400  ·  ATA CAD', tx + 12, ty + 41, RC.ana, A, 'left', 10);
      etiket('Kazı ' + sayi(top.vKazi * d.pafta, 0) + ' m³  ·  Dolgu ' + sayi(top.vDolgu * d.pafta, 0) + ' m³',
             tx + 12, ty + 68, RC.yazi, A, 'left', 10);
    }
    ox.globalAlpha = 1;
  }

  /* ================================================================ DÖNGÜ */
  var aSahne = 0, oncekiAn = 0, basAn = 0;

  // Metin yalnız değiştiğinde yazılır: her karede DOM'a dokunmak boşuna
  // yeniden düzen hesabı demek.
  var zdOnce = {};
  function zdYaz(ad, metin) {
    if (zdOnce[ad] !== metin) { zdOnce[ad] = metin; zd[ad].textContent = metin; }
  }
  function gostergeYaz(d) {
    var a = d.yapim > 0.5 ? d.onKesit : 0;
    var sa = a.toFixed(2);
    if (zdOnce.alfa !== sa) {
      zdOnce.alfa = sa;
      gosterge.style.opacity = sa;
      gosterge.style.visibility = a > 0.005 ? 'visible' : 'hidden';
    }
    if (a <= 0.005) { return; }
    var Y = Math.min(UZUNLUK, d.yapim);
    zdYaz('km', 'Km ' + kmYaz(Y));
    zdYaz('kesit', 'Kesit   K ' + sayi(kesitAra(Y, 'kazi'), 1) + ' m²  ·  D ' + sayi(kesitAra(Y, 'dolgu'), 1) + ' m²');
    zdYaz('toplam', 'Toplam  K ' + sayi(kesitAra(Y, 'vKazi'), 0) + ' m³  ·  D ' + sayi(kesitAra(Y, 'vDolgu'), 0) + ' m³');
    zd.cubuk.style.transform = 'scaleX(' + (Y / UZUNLUK).toFixed(4) + ')';
  }

  function ciz(zaman) {
    var d = durumHesapla(aSahne, zaman);
    kameraKur(d);
    glCiz(d);
    yaziCiz(d);
    gostergeYaz(d);
  }

  // Sahne yalnız bir şey değiştiğinde çizilir: kaydırma, profil imleci,
  // boyut ya da tema. Okuyucu dururken kare kare aynı resmi çizmek pil
  // harcamaktan başka bir şey yapmıyordu.
  var kirli = true, sonA = null;
  function kare(an) {
    if (!basAn) { basAn = an; }
    var dt = oncekiAn ? Math.min((an - oncekiAn) / 1000, 0.5) : 0;
    oncekiAn = an;
    // Kaydırma atalete bağlı: tekerlek adım adım sıçratsa da sahne yumuşak
    // akar. Tarayıcı kareleri seyreltirse (düşük güç, arka pencere) takip
    // geçen süreyle ölçeklendiği için sahne geride kalmaz.
    var y = 1 - Math.pow(1 - 0.075, dt * 60);
    var hedef = aHesapla();
    aSahne += (hedef - aSahne) * y;
    if (Math.abs(hedef - aSahne) < 1e-4) { aSahne = hedef; }
    var zaman = (an - basAn) / 1000;
    if (kirli || aSahne !== sonA || zaman < 4) {
      kirli = false; sonA = aSahne;
      ciz(zaman);
    }
    requestAnimationFrame(kare);
  }

  function durganCiz() {
    // Duran zemin: bitmiş proje, gezinti kipinde, tek kare.
    var yedek = aralar;
    aralar = null;
    aSahne = 0.3;
    ciz(10);
    aralar = yedek;
  }

  renkleriOku();
  olcule();
  bolumleriOlc();
  aSahne = aHesapla();

  // Tuval boyutlanınca ya da renkler değişince resim yeniden çizilmeli.
  function tazele() { if (duragan) { durganCiz(); } else { kirli = true; } }

  if (duragan) {
    durganCiz();
  } else {
    requestAnimationFrame(kare);
  }

  // Profil bölümü imlecinin istasyonu (ata.js ▸ profil).
  document.addEventListener('ata:profil', function (e) {
    if (e.detail && typeof e.detail.km === 'number') { pinKm = e.detail.km; kirli = true; }
  });

  // Bölüm konumları görseller ve videolar yüklendikçe değişir.
  window.addEventListener('load', bolumleriOlc);
  if (window.ResizeObserver) { new ResizeObserver(bolumleriOlc).observe(document.body); }

  var boyutSayac = null;
  window.addEventListener('resize', function () {
    clearTimeout(boyutSayac);
    boyutSayac = setTimeout(function () {
      olcule(); bolumleriOlc(); tazele();
    }, 180);
  });

  if (window.MutationObserver) {
    new MutationObserver(function () {
      renkleriOku(); tazele();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-tema'] });
  }

  // Bağlam kaybı (sürücü sıfırlaması, çok sekme): kaynakları yeniden kur.
  tuval.addEventListener('webglcontextlost', function (e) { e.preventDefault(); });
  tuval.addEventListener('webglcontextrestored', function () {
    try { kur(); olcule(); tazele(); } catch (e) { /* zemin boş kalır */ }
  });
})();
