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
    // Menüden bir bağlantıya gidilince kapansın.
    Array.prototype.forEach.call(menu.querySelectorAll('a'), function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('acik');
        menuDugme.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ------------------------------------------------- hero görsel dönüşümü */
  // Bir karenin ekranda kalma süresi. CSS'teki süre şeridi de bunu okur —
  // iki yerde ayrı ayrı yazılırsa şerit kareden önce ya da sonra doluyor.
  var SLAYT_SURE = 5000;

  var kareKap = document.getElementById('hero-kareler');
  if (kareKap) {
    var kareler = kareKap.querySelectorAll('.hero-kare');
    var noktalar = document.querySelectorAll('.hero-nokta');
    var dolgu = document.getElementById('hero-sure-dolgu');
    var zincir = document.querySelector('.zincir');
    var adimlar = zincir ? zincir.querySelectorAll('[data-adim]') : [];
    var sira = 0;
    var sayac = null;

    // Ekran kaydı telefonda da oynar — ama hafif sürümüyle. Eskiden dar ekran
    // tamamen dışlanıyordu; bu körlemesine bir kuraldı, Wi-Fi'daki bir telefonu
    // da cezalandırıyordu. Asıl ölçüt bağlantının kendisi: kullanıcı veri
    // tasarrufu açtıysa ya da bağlantı 2G seviyesindeyse video hiç indirilmez,
    // poster JPEG kalır.
    var darEkran = !window.matchMedia('(min-width: 760px)').matches;
    var bag = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var kisitliBaglanti = !!(bag && (bag.saveData ||
        /(^|-)2g$/.test(bag.effectiveType || '')));
    var videoOynat = !azHareket && !kisitliBaglanti;

    document.documentElement.style.setProperty('--slayt-sure', (SLAYT_SURE / 1000) + 's');

    // Zincir vurgusu yalnız kareler gerçekten dönerken anlamlı: hareket
    // kısıtlıysa ilk karede takılı kalır ve halkaların çoğu boş yere söner.
    if (zincir && adimlar.length && !azHareket && kareler.length > 1) {
      zincir.classList.add('baglandi');
    }

    // Süre şeridini baştan başlat. Sınıfı kaldırıp yeniden eklemek yetmez —
    // arada bir yeniden akış (reflow) okunmazsa tarayıcı iki değişikliği
    // birleştirir ve animasyon hiç yeniden başlamaz.
    function sureBasla() {
      if (!dolgu) return;
      dolgu.classList.remove('calisiyor', 'durdu');
      void dolgu.offsetWidth;
      dolgu.classList.add('calisiyor');
    }
    function sureDurdur() { if (dolgu) dolgu.classList.add('durdu'); }

    // Dar ekranda kaynakları hafif sürümle değiştir. MP4 önce geliyor: bu
    // boyutlarda H.264 dosyaları VP9'dan küçük çıkıyor, sıra korunsaydı
    // telefon boşuna büyük olanı indirecekti.
    function kucukKaynak() {
      if (!darEkran) { return; }
      Array.prototype.forEach.call(kareKap.querySelectorAll('video'), function (v) {
        var mp4 = v.getAttribute('data-kucuk-mp4');
        var webm = v.getAttribute('data-kucuk-webm');
        if (!mp4 && !webm) { return; }
        while (v.firstChild) { v.removeChild(v.firstChild); }
        [[mp4, 'video/mp4'], [webm, 'video/webm']].forEach(function (cift) {
          if (!cift[0]) { return; }
          var s = document.createElement('source');
          s.src = cift[0]; s.type = cift[1];
          v.appendChild(s);
        });
      });
    }

    // Ekran kaydı olan kareyi oynat, kalanları durdur. Sıfırlama sönme
    // bitince yapılır: hemen yapılsaydı kare çıkarken görünür biçimde başa
    // sıçrardı. `preload="none"` olduğu için indirme ilk play() ile başlar.
    function videoDuzenle(kare, acikMi) {
      var v = kare.querySelector('video');
      if (!v || !videoOynat) { return; }
      if (acikMi) {
        var s = v.play();
        if (s && s['catch']) { s['catch'](function () { /* otomatik oynatma engeli */ }); }
      } else {
        v.pause();
        setTimeout(function () { if (!kare.classList.contains('etkin')) { v.currentTime = 0; } }, 900);
      }
    }

    function goster(i) {
      sira = (i + kareler.length) % kareler.length;
      var acik = kareler[sira];
      Array.prototype.forEach.call(kareler, function (k, n) {
        k.classList.toggle('etkin', n === sira);
        videoDuzenle(k, n === sira);
      });

      // Sıradaki karenin kaydını şimdiden indirmeye başla — sırası geldiğinde
      // ilk saniyesi takılmasın.
      if (videoOynat) {
        var sonraki = kareler[(sira + 1) % kareler.length].querySelector('video');
        if (sonraki && sonraki.preload === 'none') { sonraki.preload = 'auto'; sonraki.load(); }
      }
      Array.prototype.forEach.call(noktalar, function (n, m) {
        n.setAttribute('aria-selected', m === sira ? 'true' : 'false');
      });

      // Açık karenin gösterdiği zincir halkalarını yak.
      if (adimlar.length) {
        var liste = ' ' + (acik.getAttribute('data-adim') || '') + ' ';
        Array.prototype.forEach.call(adimlar, function (a) {
          a.classList.toggle('etkin', liste.indexOf(' ' + a.getAttribute('data-adim') + ' ') > -1);
        });
      }
    }

    function basla() {
      if (azHareket || kareler.length < 2) return;
      durdur();
      sureBasla();
      sayac = setInterval(function () { goster(sira + 1); sureBasla(); }, SLAYT_SURE);
    }
    function durdur() {
      if (sayac) { clearInterval(sayac); sayac = null; }
      sureDurdur();
    }

    Array.prototype.forEach.call(noktalar, function (n, m) {
      n.addEventListener('click', function () { goster(m); basla(); });
    });

    // Fare üstündeyken durdur — okumaya çalışan kullanıcıyı kaçırma.
    kareKap.addEventListener('mouseenter', durdur);
    kareKap.addEventListener('mouseleave', basla);
    // Sekme arkada iken boşuna dönme.
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { durdur(); } else { basla(); }
    });

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

  /* ------------------------------------------- büyüteç (tam boy görsel) */
  var buyutec = null;

  function buyutecKapat() {
    if (!buyutec) return;
    document.body.removeChild(buyutec);
    buyutec = null;
    document.removeEventListener('keydown', esc);
  }
  function esc(e) { if (e.key === 'Escape') buyutecKapat(); }

  function buyutecAc(kaynak, yazi) {
    buyutecKapat();
    buyutec = document.createElement('div');
    buyutec.className = 'buyutec';
    buyutec.setAttribute('role', 'dialog');
    buyutec.setAttribute('aria-modal', 'true');

    var kapat = document.createElement('button');
    kapat.className = 'buyutec-kapat';
    kapat.setAttribute('aria-label', 'Kapat (Esc)');
    kapat.textContent = '✕';

    var sekil = document.createElement('figure');
    sekil.style.margin = '0';
    var gorsel = document.createElement('img');
    gorsel.src = kaynak;
    gorsel.alt = yazi || '';
    sekil.appendChild(gorsel);
    if (yazi) {
      var alt = document.createElement('figcaption');
      alt.textContent = yazi;
      sekil.appendChild(alt);
    }

    buyutec.appendChild(kapat);
    buyutec.appendChild(sekil);
    buyutec.addEventListener('click', buyutecKapat);
    document.body.appendChild(buyutec);
    document.addEventListener('keydown', esc);
    kapat.focus();
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-buyut]'), function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var kap = a.closest('figure');
      var alt = kap ? kap.querySelector('figcaption') : null;
      buyutecAc(a.getAttribute('href'), alt ? alt.textContent : '');
    });
  });

  /* ---------------------------------------- geniş tabloları yatay kaydır */
  Array.prototype.forEach.call(document.querySelectorAll('.icerik table'), function (t) {
    if (t.parentElement && t.parentElement.classList.contains('tablo-sar')) return;
    var sar = document.createElement('div');
    sar.className = 'tablo-sar';
    t.parentNode.insertBefore(sar, t);
    sar.appendChild(t);
  });
})();
