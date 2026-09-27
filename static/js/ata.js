/* ============================================================================
   ATA CAD sitesi — tek betik, bağımlılık yok.
   ========================================================================== */
(function () {
  'use strict';

  var kok = document.documentElement;
  var azHareket = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------- üç tema (programınki) */
  var temaDugmeler = document.querySelectorAll('[data-tema-sec]');

  function temaIsaretle(ad) {
    Array.prototype.forEach.call(temaDugmeler, function (d) {
      d.setAttribute('aria-pressed', d.getAttribute('data-tema-sec') === ad ? 'true' : 'false');
    });
  }

  var kayitli = null;
  try { kayitli = localStorage.getItem('tema'); } catch (e) { /* gizli mod */ }
  // Seçim yoksa varsayılan koyudur — programın da varsayılanı koyu.
  temaIsaretle(kayitli || 'koyu');

  Array.prototype.forEach.call(temaDugmeler, function (d) {
    d.addEventListener('click', function () {
      var ad = d.getAttribute('data-tema-sec');
      kok.setAttribute('data-tema', ad);
      temaIsaretle(ad);
      try { localStorage.setItem('tema', ad); } catch (e) { /* gizli mod */ }
    });
  });

  /* --------------------------------------------------- dar ekran menüsü (☰) */
  var menuDugme = document.getElementById('menu-ac');
  var menu = document.getElementById('menu');
  if (menuDugme && menu) {
    menuDugme.addEventListener('click', function () {
      var acik = menu.classList.toggle('acik');
      menuDugme.setAttribute('aria-expanded', acik ? 'true' : 'false');
    });
    var menuKapat = function () {
      menu.classList.remove('acik');
      menuDugme.setAttribute('aria-expanded', 'false');
    };
    // Menüden bir bağlantıya gidilince kapansın.
    Array.prototype.forEach.call(menu.querySelectorAll('a'), function (a) {
      a.addEventListener('click', menuKapat);
    });
    // Telefonda menü sayfanın üstünü örtüyor: dışarı dokunmak ya da Esc
    // kapatır. Esc'te odak düğmeye döner ki klavyeyle gezen yerini yitirmesin.
    document.addEventListener('click', function (e) {
      if (menu.classList.contains('acik') && !menu.contains(e.target) && !menuDugme.contains(e.target)) {
        menuKapat();
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('acik')) {
        menuKapat();
        menuDugme.focus();
      }
    });
  }

  /* ------------------------------------------------------- hero ürün turu */
  // Kareler ürünün ekran kayıtlarıdır. Kare süresi sabit değil, kaydın kendi
  // süresidir: kayıt bitince bir sonraki kareye geçilir, süre şeridi kaydın
  // ilerlemesini gösterir. Video oynatılmıyorsa (veri tasarrufu, 2G) kareler
  // posterleriyle SLAYT_SURE aralıkla döner; hareket kısıtında hiç dönmez,
  // tur ancak "Oynat" ya da bir zincir halkasıyla elle başlar.
  var SLAYT_SURE = 5000;

  var kareKap = document.getElementById('hero-kareler');
  if (kareKap) {
    var kareler = kareKap.querySelectorAll('.hero-kare');
    var dolgu = document.getElementById('hero-sure-dolgu');
    var heroDugme = document.getElementById('hero-dugme');
    var zincir = document.querySelector('.zincir');
    var adimlar = zincir ? zincir.querySelectorAll('[data-adim]') : [];
    var sira = 0;
    var sayac = null;
    var sureKare = null;
    var kullaniciDurdurdu = false;
    var heroGorunur = true;

    // Telefonda da video oynar, ama hafif sürümüyle. Ölçüt ekran değil
    // bağlantı: veri tasarrufu açıksa ya da bağlantı 2G seviyesindeyse video
    // hiç indirilmez, poster kalır.
    var darEkran = !window.matchMedia('(min-width: 760px)').matches;
    var bag = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var kisitliBaglanti = !!(bag && (bag.saveData ||
        /(^|-)2g$/.test(bag.effectiveType || '')));
    var videoOynat = !azHareket && !kisitliBaglanti;

    document.documentElement.style.setProperty('--slayt-sure', (SLAYT_SURE / 1000) + 's');

    // Halkalar tıklanabildiği için vurgu her durumda anlamlı: hareket
    // kısıtlıyken de okuyucu halkaya basıp o kareyi açabiliyor.
    if (zincir && adimlar.length) { zincir.classList.add('baglandi'); }

    var acikVideo = function () { return kareler[sira].querySelector('video'); };
    var oynat = function (v) {
      if (!v) { return; }
      var s = v.play();
      if (s && s['catch']) { s['catch'](function () { /* otomatik oynatma engeli */ }); }
    };
    var oynamali = function () {
      return videoOynat && !kullaniciDurdurdu && heroGorunur && !document.hidden;
    };

    // Poster kipi: süre şeridi CSS animasyonuyla dolar. Sınıfı kaldırıp yeniden
    // eklemek yetmez — arada bir yeniden akış okunmazsa tarayıcı iki değişikliği
    // birleştirir ve animasyon yeniden başlamaz.
    var sureBasla = function () {
      if (!dolgu) { return; }
      dolgu.style.transform = '';
      dolgu.classList.remove('calisiyor', 'durdu');
      void dolgu.offsetWidth;
      dolgu.classList.add('calisiyor');
    };
    var sureDurdur = function () { if (dolgu) { dolgu.classList.add('durdu'); } };

    /* Kare geçişi: tarama. Yeni kayıt eskisinin üzerine soldan sağa, km
       ilerler gibi açılır. Açılma kenarı düz değil, eşyükselti eğrisi gibi
       kıvrılır; kenarda vurgu renginde tarama çizgisi, arkasında soluk bir
       ara eğri yürür. Kenar yeni karenin clip-path çokgeni, çizgiler aynı
       noktalardan geçen bir SVG; ikisi de her karede buradan yazılır.
       WebGL değil: iki kayıt da geçiş boyunca kendi hızında oynar, doku
       kopyalamak gerekmez. Hareket kısıtında ya da clip-path yoksa eski
       sönme geçişi kalır (ata.css ▸ .hero-kare). */
    var TARAMA_SURE = 1100;     /* ms */
    var TARAMA_GENLIK = 0.07;   /* kenar kıvrımı, genişliğin oranı */
    var TARAMA_IZ = 0.05;       /* ara eğrinin kenardan geriliği */
    var TARAMA_NOKTA = 40;      /* kenar boyunca nokta sayısı */
    var taramaVar = !azHareket && !!(window.CSS && CSS.supports &&
        CSS.supports('clip-path', 'polygon(0 0, 100% 0, 0 100%)'));
    var tarama = null;          /* sürmekte olan geçiş */
    var taramaSvg = null, taramaYol = [];
    if (taramaVar) {
      var svgNs = 'http://www.w3.org/2000/svg';
      taramaSvg = document.createElementNS(svgNs, 'svg');
      taramaSvg.setAttribute('class', 'hero-tarama');
      taramaSvg.setAttribute('viewBox', '0 0 1000 1000');
      taramaSvg.setAttribute('preserveAspectRatio', 'none');
      taramaSvg.setAttribute('aria-hidden', 'true');
      ['ht-iz', 'ht-isik', 'ht-cizgi'].forEach(function (sinif) {
        var yol = document.createElementNS(svgNs, 'path');
        yol.setAttribute('class', sinif);
        taramaSvg.appendChild(yol);
        taramaYol.push(yol);
      });
      kareKap.appendChild(taramaSvg);
    }

    // Kenarın y'deki (0–1) yatay konumu, genişliğin oranı olarak. Üç sinüs:
    // biri geniş kıvrım, ikisi ince; genlikleri toplamı 1, kenar ±GENLIK
    // içinde kalır. u = 0'da kenar tümüyle solda, u = 1'de tümüyle sağda.
    // Fazlar her geçişte yeniden çekilir, eğri her seferinde başka olur.
    var kenarX = function (u, y, t, f) {
      var n = 0.55 * Math.sin(6.2832 * (1.1 * y + f[0]) + 1.3 * t) +
              0.30 * Math.sin(6.2832 * (2.7 * y + f[1]) - 2.1 * t) +
              0.15 * Math.sin(6.2832 * (5.3 * y + f[2]) + 3.0 * t);
      return u * (1 + 2 * TARAMA_GENLIK) - TARAMA_GENLIK + n * TARAMA_GENLIK;
    };

    // Geçişi bitmiş hâline getirir: sonunda da, yenisi araya girince de.
    var taramaBitir = function () {
      var g = tarama;
      if (!g) { return; }
      tarama = null;
      cancelAnimationFrame(g.kare);
      g.gir.classList.remove('giriyor');
      g.gir.style.clipPath = '';
      g.cik.classList.remove('cikiyor');
      taramaSvg.classList.remove('calisiyor');
      // Çıkan kaydı başa sar. videoDuzenle bunu çıkan kare görünürken
      // yapmıyor (bkz. orada `cikiyor`); görünmez olduğu an burası.
      var v = g.cik.querySelector('video');
      if (v && !g.cik.classList.contains('etkin')) { v.currentTime = 0; }
    };

    var taramaKare = function (simdi) {
      var g = tarama;
      if (!g) { return; }
      var gecen = Math.max(0, simdi - g.bas), p = Math.min(1, gecen / TARAMA_SURE);
      var e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(2 - 2 * p, 3) / 2;
      var u = e * (1 + TARAMA_IZ), t = gecen / 1000;
      var cokgen = ['0% 0%'], ana = '', iz = '';
      for (var i = 0; i <= TARAMA_NOKTA; i++) {
        var y = i / TARAMA_NOKTA;
        var x = kenarX(u, y, t, g.faz), xi = kenarX(u - TARAMA_IZ, y, t + 0.6, g.faz);
        var harf = i ? 'L' : 'M', yk = (y * 1000).toFixed(1);
        cokgen.push((x * 100).toFixed(2) + '% ' + (y * 100).toFixed(2) + '%');
        ana += harf + (x * 1000).toFixed(1) + ' ' + yk;
        iz += harf + (xi * 1000).toFixed(1) + ' ' + yk;
      }
      cokgen.push('0% 100%');
      g.gir.style.clipPath = 'polygon(' + cokgen.join(',') + ')';
      taramaYol[0].setAttribute('d', iz);
      taramaYol[1].setAttribute('d', ana);
      taramaYol[2].setAttribute('d', ana);
      if (p >= 1) { taramaBitir(); } else { g.kare = requestAnimationFrame(taramaKare); }
    };

    // Video kipi: şerit kaydın oynayan oranını kare kare izler.
    var sureIzle = function () {
      var v = acikVideo();
      if (dolgu && v && v.duration) {
        dolgu.style.transform = 'scaleX(' + (v.currentTime / v.duration).toFixed(4) + ')';
      }
      sureKare = (v && !v.paused) ? requestAnimationFrame(sureIzle) : null;
    };

    var dugmeYaz = function () {
      if (!heroDugme) { return; }
      var v = acikVideo();
      heroDugme.textContent = (videoOynat && v && !v.paused) ? 'Durdur' : 'Oynat';
    };

    // Dar ekranda kaynakları hafif sürümle değiştir.
    var kucukKaynak = function () {
      if (!darEkran) { return; }
      Array.prototype.forEach.call(kareKap.querySelectorAll('video'), function (v) {
        var mp4 = v.getAttribute('data-kucuk-mp4');
        if (!mp4) { return; }
        while (v.firstChild) { v.removeChild(v.firstChild); }
        var s = document.createElement('source');
        s.src = mp4; s.type = 'video/mp4';
        v.appendChild(s);
      });
    };

    // Açılan karenin kaydını baştan oynat, kalanları durdur. Başa sarma sönme
    // bitince yapılır: hemen yapılsaydı kare çıkarken görünür biçimde sıçrardı.
    // Tarama sürerken çıkan kare hâlâ görünür; onu taramaBitir sarar.
    var videoDuzenle = function (kare, acikMi) {
      var v = kare.querySelector('video');
      if (!v) { return; }
      if (acikMi) {
        if (oynamali()) { oynat(v); }
      } else if (!v.paused || v.currentTime) {
        v.pause();
        setTimeout(function () {
          if (!kare.classList.contains('etkin') && !kare.classList.contains('cikiyor')) { v.currentTime = 0; }
        }, 900);
      }
    };

    var goster = function (i) {
      var eski = sira;
      sira = (i + kareler.length) % kareler.length;
      var acik = kareler[sira];
      if (videoOynat && dolgu) {
        dolgu.classList.remove('calisiyor', 'durdu');
        dolgu.style.transform = 'scaleX(0)';
      }
      // Önceki tarama sürüyorsa bitmiş say; yenisi o karenin üstünden başlar.
      taramaBitir();
      // Gizli sekmede kare çizilmez; tarama orada yarıda asılı kalırdı.
      var tara = taramaVar && eski !== sira && !document.hidden;
      if (tara) {
        kareler[eski].classList.add('cikiyor');
        acik.classList.add('giriyor');
        acik.style.clipPath = 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)';
      }
      Array.prototype.forEach.call(kareler, function (k, n) {
        k.classList.toggle('etkin', n === sira);
        videoDuzenle(k, n === sira);
      });
      if (tara) {
        tarama = { gir: acik, cik: kareler[eski], bas: performance.now(),
                   faz: [Math.random(), Math.random(), Math.random()] };
        taramaSvg.classList.add('calisiyor');
        tarama.kare = requestAnimationFrame(taramaKare);
      }

      // Sıradaki karenin kaydını şimdiden indirmeye başla — sırası gelince
      // ilk saniyesi takılmasın.
      if (videoOynat) {
        var sonraki = kareler[(sira + 1) % kareler.length].querySelector('video');
        if (sonraki && sonraki.preload === 'none') { sonraki.preload = 'auto'; sonraki.load(); }
      }

      // Açık karenin gösterdiği zincir halkalarını yak.
      var liste = ' ' + (acik.getAttribute('data-adim') || '') + ' ';
      Array.prototype.forEach.call(adimlar, function (a) {
        a.classList.toggle('etkin', liste.indexOf(' ' + a.getAttribute('data-adim') + ' ') > -1);
      });
      dugmeYaz();
    };

    // Poster kipinin zamanlayıcısı. Video kipinde geçişi kaydın bitişi yapar.
    var durdur = function () {
      if (sayac) { clearInterval(sayac); sayac = null; }
      sureDurdur();
    };
    var basla = function () {
      if (videoOynat || azHareket || kareler.length < 2) { return; }
      durdur();
      sureBasla();
      sayac = setInterval(function () { goster(sira + 1); sureBasla(); }, SLAYT_SURE);
    };

    Array.prototype.forEach.call(kareKap.querySelectorAll('video'), function (v) {
      v.addEventListener('ended', function () {
        if (v === acikVideo()) { goster(sira + 1); }
      });
      v.addEventListener('play', function () {
        dugmeYaz();
        if (!sureKare) { sureKare = requestAnimationFrame(sureIzle); }
      });
      v.addEventListener('pause', dugmeYaz);
    });

    // Durdur / Oynat. Hareket kısıtlı ya da bağlantı kısıtlıysa "Oynat"
    // turu kullanıcının isteğiyle video kipine geçirir.
    if (heroDugme) {
      heroDugme.hidden = false;
      heroDugme.addEventListener('click', function () {
        var v = acikVideo();
        // Yazı hemen değişir; pause/play olayları geldiğinde yeniden yazılır.
        if (videoOynat && v && !v.paused) {
          kullaniciDurdurdu = true;
          v.pause();
          heroDugme.textContent = 'Oynat';
        } else {
          kullaniciDurdurdu = false;
          if (!videoOynat) { videoOynat = true; durdur(); }
          if (dolgu) { dolgu.classList.remove('calisiyor', 'durdu'); }
          oynat(v);
          heroDugme.textContent = 'Durdur';
        }
      });
    }

    // Zincir halkası: o halkayı gösteren ilk kareyi aç.
    Array.prototype.forEach.call(adimlar, function (a) {
      var dugme = a.querySelector('button');
      if (!dugme) { return; }
      dugme.addEventListener('click', function () {
        var aranan = ' ' + a.getAttribute('data-adim') + ' ';
        for (var m = 0; m < kareler.length; m++) {
          if ((' ' + kareler[m].getAttribute('data-adim') + ' ').indexOf(aranan) > -1) {
            kullaniciDurdurdu = false;
            goster(m);
            basla();
            break;
          }
        }
      });
    });

    // Ekrandan çıkınca ya da sekme arkaya düşünce dur, dönünce devam et.
    var gorunurlukDegisti = function () {
      var v = acikVideo();
      if (videoOynat) {
        if (oynamali()) { oynat(v); } else if (v && !v.paused) { v.pause(); }
      } else if (document.hidden) { durdur(); } else { basla(); }
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (girisler) {
        heroGorunur = girisler[0].isIntersecting;
        gorunurlukDegisti();
      }, { threshold: 0.2 }).observe(kareKap);
    }
    document.addEventListener('visibilitychange', gorunurlukDegisti);

    // Poster kipinde fare üstündeyken dur — okumaya çalışanı kaçırma.
    kareKap.addEventListener('mouseenter', function () { if (!videoOynat) { durdur(); } });
    kareKap.addEventListener('mouseleave', function () { if (!videoOynat) { basla(); } });

    kucukKaynak();
    goster(0);
    basla();
  }

  /* ------------------------------------------- kademeli giriş (stagger) */
  // `data-kademe` verilen kabın çocuklarına sırayla gecikme dağıtılır.
  // Gözcü kurulmadan ÖNCE çalışmalı: `.ac` sınıfı buradan geliyor.
  Array.prototype.forEach.call(document.querySelectorAll('[data-kademe]'), function (kap) {
    var adim = parseFloat(kap.getAttribute('data-kademe')) || 0.06;
    Array.prototype.forEach.call(kap.children, function (cocuk, i) {
      cocuk.classList.add('ac');
      cocuk.style.setProperty('--g', (i * adim).toFixed(2) + 's');
    });
  });

  /* ------------------------------------------------- kaydırınca açılma */
  var acilacak = document.querySelectorAll('.ac');

  if (azHareket || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(acilacak, function (n) { n.classList.add('gor'); });
  } else {
    var gozcu = new IntersectionObserver(function (girisler) {
      girisler.forEach(function (g) {
        if (g.isIntersecting) { g.target.classList.add('gor'); gozcu.unobserve(g.target); }
      });
      // Eşik 0 + pozitif alt kenar payı: eleman ekrana GİRMEDEN önce tetiklenir.
      // Negatif payla denendi, hızlı kaydırmada bölümler bir an boş görünüyordu.
    }, { threshold: 0, rootMargin: '0px 0px 120px 0px' });
    Array.prototype.forEach.call(acilacak, function (n) { gozcu.observe(n); });
  }

  /* ---------------------------------------------- kanıt şeridi sayaçları */
  // Rakamlar şeride girerken sayarak yükselir. HTML'de doğru değer yazılıdır;
  // burada sıfırlanır. Sıfırlama gözle görülmez, çünkü şerit `data-kademe`
  // yüzünden o anda zaten saydam — betik yoksa da metin olduğu gibi kalır.
  var sayilar = document.querySelectorAll('[data-sayac]');
  if (sayilar.length && !azHareket &&
      'IntersectionObserver' in window && 'requestAnimationFrame' in window) {

    var sayarakGoster = function (oge) {
      var hedef = parseFloat(oge.getAttribute('data-sayac')) || 0;
      var ek = oge.getAttribute('data-ek') || '';
      // Tek haneli hedefler yuvarlanınca sürenin çoğunda 0 görünüyor; şeritte
      // dört sıfır yan yana kalıp "0 bağımlılık" iddiasıyla karışıyordu.
      // Yukarı yuvarlama sayıyı ilk karede 1 yapar, kısa süre de bekletmez.
      var sure = hedef < 100 ? 650 : 1100;
      var bas = null;
      function adim(t) {
        if (bas === null) { bas = t; }
        var o = Math.min((t - bas) / sure, 1);
        var y = 1 - Math.pow(1 - o, 3);            // sona doğru yavaşlar
        oge.textContent = Math.ceil(hedef * y).toLocaleString('tr-TR') + ek;
        if (o < 1) { requestAnimationFrame(adim); }
      }
      requestAnimationFrame(adim);
    };

    var sayiGozcu = new IntersectionObserver(function (girisler) {
      girisler.forEach(function (g) {
        if (g.isIntersecting) { sayiGozcu.unobserve(g.target); sayarakGoster(g.target); }
      });
    }, { threshold: 0.55 });

    Array.prototype.forEach.call(sayilar, function (o) {
      o.textContent = '0' + (o.getAttribute('data-ek') || '');
      sayiGozcu.observe(o);
    });
  }

  /* ------------------------------------ nasıl çalışır: boyuna profil */
  // Profilin üzerinde bir istasyon imleci. Konumunu iki kaynaktan alır:
  // kaydırma (bölüm ekrandan geçerken soldan sağa ilerler) ve fare/parmak
  // (profilin üzerinde gezinirken). İmlecin geçtiği yere kadar proje hattı ve
  // kazı/dolgu açılır; açılan kısım geri kapanmaz — yukarı kaydırıp dönen
  // okuyucu yarım çizim görmesin. Hareket kısıtlıysa çizim baştan tamdır,
  // imleç yalnız fareyle çıkar.
  var profil = document.querySelector('[data-profil]');
  if (profil) {
    var her = function (liste, fn) { Array.prototype.forEach.call(liste, fn); };
    var pUzun = parseFloat(profil.getAttribute('data-uzunluk')) || 400;
    var pAdim = parseFloat(profil.getAttribute('data-adim')) || 5;
    var kotAlt = parseFloat(profil.getAttribute('data-kot-alt'));
    var kotUst = parseFloat(profil.getAttribute('data-kot-ust'));
    var diziOku = function (ad) { return profil.getAttribute(ad).split(',').map(parseFloat); };
    var arazi = diziOku('data-arazi');
    var proje = diziOku('data-proje');
    var cizim = profil.querySelector('.profil-cizim');
    var kirp = profil.querySelector('.profil-kirp');
    var imlec = profil.querySelector('.profil-imlec');
    var noktaA = profil.querySelector('.pi-arazi');
    var noktaP = profil.querySelector('.pi-proje');
    var farkKap = profil.querySelector('[data-pi-tur]');
    var yaz = {};
    her(profil.querySelectorAll('[data-pi]'), function (o) { yaz[o.getAttribute('data-pi')] = o; });
    var adimListe = document.querySelector('.adimlar');
    var adimOgeler = adimListe ? adimListe.querySelectorAll('li[data-bas]') : [];

    var acilan = azHareket ? pUzun : 0;   // proje hattının açıldığı uzunluk (m)
    var kaydirmaKm = 0;
    var fareKm = null;

    var sayi = function (v) {
      return v.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };
    // 137,5 → "0+137,50". Yüzler hanesi hep üç basamak — kilometre taşı yazımı.
    var kmYaz = function (km) {
      var tam = Math.floor(km / 1000);
      var parca = sayi(km - tam * 1000).split(',');
      while (parca[0].length < 3) { parca[0] = '0' + parca[0]; }
      return tam + '+' + parca[0] + ',' + parca[1];
    };
    var kot = function (dizi, km) {
      var i = km / pAdim;
      var a = Math.min(Math.floor(i), dizi.length - 1);
      var b = Math.min(a + 1, dizi.length - 1);
      return dizi[a] + (dizi[b] - dizi[a]) * (i - a);
    };
    // profil.html'deki kot → y dönüşümünün aynısı: y = 226 − (z − alt)/(üst − alt) × 212,
    // görünüm kutusunun yüksekliği 240. Nokta yüzdeyle yerleşir, çizimle birlikte esner.
    var ustYuzde = function (z) { return (226 - (z - kotAlt) / (kotUst - kotAlt) * 212) / 240 * 100; };

    var ciz = function () {
      var km = Math.max(0, Math.min(pUzun, fareKm !== null ? fareKm : kaydirmaKm));
      if (km > acilan) { acilan = km; }
      kirp.setAttribute('width', (acilan / pUzun * 1200).toFixed(1));

      var za = kot(arazi, km);
      var zp = kot(proje, km);
      var fark = za - zp;
      imlec.style.left = (km / pUzun * 100) + '%';
      imlec.classList.toggle('sol', km > pUzun * 0.62);
      noktaA.style.top = ustYuzde(za) + '%';
      noktaP.style.top = ustYuzde(zp) + '%';
      yaz.km.textContent = kmYaz(km);
      yaz.arazi.textContent = sayi(za);
      yaz.proje.textContent = sayi(zp);
      yaz.fark.textContent = sayi(Math.abs(fark)) + ' m';
      farkKap.firstChild.nodeValue = fark >= 0 ? 'Kazı ' : 'Dolgu ';
      farkKap.classList.toggle('kazi', fark >= 0);
      farkKap.classList.toggle('dolgu', fark < 0);

      her(adimOgeler, function (li) {
        var bas = parseFloat(li.getAttribute('data-bas'));
        var son = parseFloat(li.getAttribute('data-son'));
        li.classList.toggle('etkin', km >= bas && (km < son || son >= pUzun));
        li.classList.toggle('ulasti', acilan >= bas);
      });

      // Zemin katmanı (zemin.js) aynı istasyonu 3B güzergâhta işaretler.
      document.dispatchEvent(new CustomEvent('ata:profil', { detail: { km: km } }));
    };

    // Sabitlenmiş sahnede imleç rayın boyunca yürür: sahne yerine oturmadan
    // ekranın %20'si kadar önce yola çıkar, ray bitince 0+400'e varır.
    // Sabitleme kapalıysa (dar/kısa ekran, hareket kısıtı) eski eşleme:
    // profil ekranın %85'ine girdiğinde imleç başta, %25'ine çıktığında sonda.
    var ray = document.querySelector('[data-profil-ray]');
    var sahne = ray ? ray.querySelector('.profil-sahne') : null;
    var kaydirmaOku = function () {
      var vh = window.innerHeight || 800, o;
      var ss = sahne ? getComputedStyle(sahne) : null;
      if (ss && ss.position === 'sticky') {
        var rr = ray.getBoundingClientRect(), ust = parseFloat(ss.top) || 0;
        var yol = rr.height - sahne.offsetHeight;
        o = (ust + vh * 0.2 - rr.top) / (yol + vh * 0.2);
      } else {
        var r = cizim.getBoundingClientRect();
        o = (vh * 0.85 - r.top) / (vh * 0.6);
      }
      kaydirmaKm = Math.max(0, Math.min(1, o)) * pUzun;
    };
    var cizimBekliyor = false;
    var kaydirinca = function () {
      if (cizimBekliyor) { return; }
      cizimBekliyor = true;
      requestAnimationFrame(function () {
        cizimBekliyor = false;
        kaydirmaOku();
        if (fareKm === null) { ciz(); }
      });
    };

    var fareOku = function (e) {
      var r = cizim.getBoundingClientRect();
      fareKm = (e.clientX - r.left) / r.width * pUzun;
      profil.classList.add('imlecli');
      ciz();
    };
    var fareBirak = function () {
      fareKm = null;
      if (azHareket) { profil.classList.remove('imlecli'); } else { ciz(); }
    };
    cizim.addEventListener('pointermove', fareOku);
    cizim.addEventListener('pointerdown', fareOku);
    cizim.addEventListener('pointerleave', fareBirak);
    cizim.addEventListener('pointercancel', fareBirak);

    if (!azHareket) {
      profil.classList.add('imlecli');
      if (adimListe) { adimListe.classList.add('bagli'); }
      kaydirmaOku();
      ciz();
      window.addEventListener('scroll', kaydirinca, { passive: true });
      window.addEventListener('resize', kaydirinca);
    }
  }

  /* ------------------------------------------------------ başvuru formu */
  // Form bir mesaj hazırlar ve seçilen kanalda açar: WhatsApp (wa.me) ya da
  // e-posta programı. Gönderme kararı kullanıcıda kalır; site hiçbir şey
  // saklamaz. Zorunlu alan denetimi tarayıcının kendi denetimidir — `submit`
  // olayı ancak form geçerliyse gelir.
  var form = document.getElementById('basvuru-form');
  if (form) {
    var kanal = 'whatsapp';
    var durum = form.querySelector('.bf-durum');
    Array.prototype.forEach.call(form.querySelectorAll('[data-kanal]'), function (d) {
      d.addEventListener('click', function () { kanal = d.getAttribute('data-kanal'); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (e.submitter && e.submitter.getAttribute('data-kanal')) {
        kanal = e.submitter.getAttribute('data-kanal');
      }
      var deger = function (ad) {
        var alan = form.elements[ad];
        return alan && alan.value ? String(alan.value).trim() : '';
      };
      var secili = function (ad) {
        return Array.prototype.map.call(
          form.querySelectorAll('input[name="' + ad + '"]:checked'),
          function (i) { return i.value; }).join(', ');
      };

      var konu = deger('Konu') || 'ATA CAD erken erişim';
      var satirlar = ['Merhaba, ' + konu + ' için yazıyorum.', ''];
      [['Ad', deger('Ad')], ['Firma', deger('Firma')], ['Çalışma alanı', secili('Alan')],
       ['İdare', secili('İdare')], ['CAD programı', deger('CAD')], ['Ekip', deger('Ekip')],
       ['Not', deger('Not')]].forEach(function (s) {
        if (s[1]) { satirlar.push(s[0] + ': ' + s[1]); }
      });
      var metin = satirlar.join('\n');

      if (kanal === 'eposta') {
        var eposta = form.getAttribute('data-eposta');
        window.location.href = 'mailto:' + eposta +
          '?subject=' + encodeURIComponent(konu + ' — ' + deger('Ad')) +
          '&body=' + encodeURIComponent(metin);
        durum.textContent = 'Mesaj e-posta programınızda hazırlandı. Program açılmadıysa ' +
          eposta + ' adresine yazabilirsiniz.';
      } else {
        window.open('https://wa.me/' + form.getAttribute('data-tel') +
          '?text=' + encodeURIComponent(metin), '_blank', 'noopener');
        durum.textContent = 'WhatsApp yeni sekmede açıldı. Mesajınız hazır; göndermek için gönder tuşuna basın.';
      }
    });
  }

  /* ------------------------------------------------ sahne (iki kare) */
  // Kareler süre dolunca kendiliğinden döner; süreyi CSS'teki --sahne-sure
  // tutar, şerit de oradan dolar. Fare üstündeyken ya da sahne ekran
  // dışındayken durur. Hareket kısıtlıysa hiç dönmez, sekmelerle elle geçilir.
  Array.prototype.forEach.call(document.querySelectorAll('[data-sahne-kare]'), function (sahne) {
    var kareler = sahne.querySelectorAll('.sahne-kare');
    var sekmeler = sahne.querySelectorAll('.sahne-sekmeler li');
    if (kareler.length < 2) return;
    var sure = (parseFloat(getComputedStyle(sahne).getPropertyValue('--sahne-sure')) || 7) * 1000;
    var sira = 0, sayac = null, gorunur = false, ustte = false;

    var goster = function (i) {
      sira = (i + kareler.length) % kareler.length;
      Array.prototype.forEach.call(kareler, function (k, n) { k.classList.toggle('etkin', n === sira); });
      Array.prototype.forEach.call(sekmeler, function (s, n) {
        s.classList.toggle('etkin', n === sira);
        s.querySelector('button').setAttribute('aria-current', n === sira ? 'true' : 'false');
      });
    };
    // Şerit animasyonu sınıf yeniden eklenince baştan başlar.
    var seritYenile = function () {
      sahne.classList.remove('oynuyor');
      void sahne.offsetWidth;
      sahne.classList.add('oynuyor');
    };
    var durdur = function () {
      clearTimeout(sayac); sayac = null;
      sahne.classList.add('durdu');
    };
    var ilerle = function () {
      sayac = setTimeout(function () { goster(sira + 1); seritYenile(); ilerle(); }, sure);
    };
    var basla = function () {
      if (azHareket || !gorunur || ustte || sayac) return;
      sahne.classList.remove('durdu');
      seritYenile();
      ilerle();
    };

    Array.prototype.forEach.call(sekmeler, function (s, n) {
      s.querySelector('button').addEventListener('click', function () {
        durdur(); goster(n); basla();
      });
    });
    sahne.addEventListener('mouseenter', function () { ustte = true; durdur(); });
    sahne.addEventListener('mouseleave', function () { ustte = false; basla(); });

    if (azHareket) return;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (girisler) {
        gorunur = girisler[0].isIntersecting;
        if (gorunur) { basla(); } else { durdur(); }
      }, { threshold: 0.4 }).observe(sahne);
    } else {
      gorunur = true; basla();
    }
  });

  /* ------------------------------------------- büyüteç (tam boy görsel) */
  // Sayfadaki bütün büyütülebilir görseller tek dizi: açılan görselden
  // oklarla (ekrandaki ‹ › ya da klavyede ← →) veya parmakla yana
  // kaydırarak öncekine/sonrakine geçilir, sona gelince başa sarar. Ana
  // sayfa şeridinin ikinci kopyası (aria-hidden) diziye girmez; aynı adres
  // iki kez sayılmaz.
  var buyutec = null, buyutecDizi = [], buyutecSira = 0, buyutecGoster = null;

  function buyutecKapat() {
    if (!buyutec) return;
    document.body.removeChild(buyutec);
    buyutec = null;
    document.removeEventListener('keydown', buyutecTus);
  }
  function buyutecTus(e) {
    if (e.key === 'Escape') { buyutecKapat(); }
    else if (e.key === 'ArrowRight' && buyutecGoster) { e.preventDefault(); buyutecGoster(buyutecSira + 1); }
    else if (e.key === 'ArrowLeft' && buyutecGoster) { e.preventDefault(); buyutecGoster(buyutecSira - 1); }
  }

  function buyutecYazi(a) {
    var kap = a.closest('figure');
    var alt = kap ? kap.querySelector('figcaption') : null;
    return alt ? alt.textContent.replace(/\s+/g, ' ').trim() : '';
  }

  function buyutecAc(sira) {
    buyutecKapat();
    buyutecSira = sira;
    var cok = buyutecDizi.length > 1;

    buyutec = document.createElement('div');
    buyutec.className = cok ? 'buyutec cok' : 'buyutec';
    buyutec.setAttribute('role', 'dialog');
    buyutec.setAttribute('aria-modal', 'true');

    var kapat = document.createElement('button');
    kapat.className = 'buyutec-kapat';
    kapat.setAttribute('aria-label', 'Kapat (Esc)');
    kapat.textContent = '✕';

    var sekil = document.createElement('figure');
    sekil.style.margin = '0';
    var gorsel = document.createElement('img');
    var alt = document.createElement('figcaption');
    var sayac = document.createElement('span');
    sayac.className = 'buyutec-sayac';
    sekil.appendChild(gorsel);
    sekil.appendChild(alt);

    buyutecGoster = function (i) {
      var n = buyutecDizi.length;
      buyutecSira = (i + n) % n;
      var a = buyutecDizi[buyutecSira];
      var yazi = buyutecYazi(a);
      gorsel.src = a.getAttribute('href');
      gorsel.alt = yazi;
      alt.textContent = yazi;
      alt.style.display = yazi ? '' : 'none';
      sayac.textContent = (buyutecSira + 1) + ' / ' + n;
      // Komşuları önceden indir: geçişte boş kare görünmesin.
      [buyutecSira + 1, buyutecSira - 1].forEach(function (k) {
        new Image().src = buyutecDizi[(k + n) % n].getAttribute('href');
      });
    };

    buyutec.appendChild(kapat);
    buyutec.appendChild(sekil);
    if (cok) {
      [['geri', -1, 'Önceki görsel (←)', '‹'], ['ileri', 1, 'Sonraki görsel (→)', '›']].forEach(function (o) {
        var d = document.createElement('button');
        d.className = 'buyutec-ok ' + o[0];
        d.setAttribute('aria-label', o[2]);
        d.textContent = o[3];
        d.addEventListener('click', function (e) { e.stopPropagation(); buyutecGoster(buyutecSira + o[1]); });
        buyutec.appendChild(d);
      });
      buyutec.appendChild(sayac);

      // Parmakla yana kaydırma. Kaydırma sonrası gelen tıklama kapatmasın.
      var dokunus = null, kaydirildi = false;
      buyutec.addEventListener('touchstart', function (e) {
        if (e.touches.length !== 1) { dokunus = null; return; }
        dokunus = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }, { passive: true });
      buyutec.addEventListener('touchend', function (e) {
        if (!dokunus) return;
        var dx = e.changedTouches[0].clientX - dokunus.x;
        var dy = e.changedTouches[0].clientY - dokunus.y;
        dokunus = null;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) {
          kaydirildi = true;
          buyutecGoster(buyutecSira + (dx < 0 ? 1 : -1));
        }
      });
      buyutec.addEventListener('click', function (e) {
        if (kaydirildi) { kaydirildi = false; e.stopImmediatePropagation(); }
      }, true);
    }
    buyutecGoster(sira);

    // Görselin kendisine tıklamak kapatmaz; zemine ve ✕'e tıklamak kapatır.
    gorsel.addEventListener('click', function (e) { if (cok) e.stopPropagation(); });
    buyutec.addEventListener('click', buyutecKapat);
    document.body.appendChild(buyutec);
    document.addEventListener('keydown', buyutecTus);
    kapat.focus();
  }

  (function () {
    var gorulen = {};
    Array.prototype.forEach.call(document.querySelectorAll('[data-buyut]'), function (a) {
      var adres = a.getAttribute('href');
      if (!a.closest('[aria-hidden="true"]') && !gorulen[adres]) {
        gorulen[adres] = true;
        buyutecDizi.push(a);
      }
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var sira = 0;
        for (var k = 0; k < buyutecDizi.length; k++) {
          if (buyutecDizi[k].getAttribute('href') === adres) { sira = k; break; }
        }
        buyutecAc(sira);
      });
    });
  })();

  /* ---------------------------------------- geniş tabloları yatay kaydır */
  Array.prototype.forEach.call(document.querySelectorAll('.icerik table'), function (t) {
    if (t.parentElement && t.parentElement.classList.contains('tablo-sar')) return;
    var sar = document.createElement('div');
    sar.className = 'tablo-sar';
    t.parentNode.insertBefore(sar, t);
    sar.appendChild(t);
  });
})();
