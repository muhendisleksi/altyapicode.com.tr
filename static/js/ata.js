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
    var videoDuzenle = function (kare, acikMi) {
      var v = kare.querySelector('video');
      if (!v) { return; }
      if (acikMi) {
        if (oynamali()) { oynat(v); }
      } else if (!v.paused || v.currentTime) {
        v.pause();
        setTimeout(function () { if (!kare.classList.contains('etkin')) { v.currentTime = 0; } }, 900);
      }
    };

    var goster = function (i) {
      sira = (i + kareler.length) % kareler.length;
      var acik = kareler[sira];
      if (videoOynat && dolgu) {
        dolgu.classList.remove('calisiyor', 'durdu');
        dolgu.style.transform = 'scaleX(0)';
      }
      Array.prototype.forEach.call(kareler, function (k, n) {
        k.classList.toggle('etkin', n === sira);
        videoDuzenle(k, n === sira);
      });

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
