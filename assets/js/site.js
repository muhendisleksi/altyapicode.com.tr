/* Site betiği: Ata'nın sayfadaki yerlerini bağlar, dar ekran menüsünü kapatır.
   Betik çalışmazsa içerik eksilmez; menü <details> ile betiksiz açılır. */
(function(){
  'use strict';

  // <svg data-ata data-durum="kur" data-sure="2.8" data-sonra="bakiyor" data-canli data-kucuk>
  if(window.Ata){
    [].forEach.call(document.querySelectorAll('svg[data-ata]'),function(el){
      var ilk=el.getAttribute('data-durum')||'bakiyor',sonra=el.getAttribute('data-sonra'),sure=parseFloat(el.getAttribute('data-sure'));
      // data-bir-kez: açılış hareketi oturumda bir kez oynar; sonraki sayfa açılışlarında Ata hazır bekler.
      if(el.hasAttribute('data-bir-kez')){try{if(sessionStorage.getItem('ataDogdu'))sure=0;else sessionStorage.setItem('ataDogdu','1')}catch(e){}}
      var t=window.Ata.kur(el,{canli:el.hasAttribute('data-canli'),kucuk:el.hasAttribute('data-kucuk'),durum:sonra||ilk});
      if(sonra&&sure>0)t.durum(ilk,sure,sonra);
      el.ataTutamak=t;
    });
    // Sayfada gezen Ata. Eski sakin sürüm (başlıktan başlığa geçen) için: window.Ata.yolcu()
    window.Ata.gezgin();

    // Ata ziyaretçinin yaptığına tepki verir: ana düğmenin üstünde heyecanlanır, ikincil düğmede ve
    // form alanında merak eder (alana bakar). Yakınlık · dokunma · uyku ata.js'in kendi işidir.
    var ustunde=null,odakta=null;
    var guncelle=function(){
      window.Ata.ifade(ustunde?(ustunde.classList.contains('ikincil')?'merak':'heyecan'):(odakta?'merak':null));
      window.Ata.bak(odakta);
    };
    var alanMi=function(n){return n&&n.matches&&n.matches('input,select,textarea')&&!n.disabled};
    // Ata pafta diliyle konuşur: üstüne gelinen düğmenin data-soz metni gösterge çizgili etikette çıkar.
    var soz=document.querySelector('.ata-soz');
    var sozYaz=function(d){
      if(!soz)return;
      var m=d&&d.getAttribute('data-soz');
      if(m)soz.textContent=m;
      soz.classList.toggle('acik',!!m);
    };
    document.addEventListener('pointerover',function(e){var d=e.target.closest&&e.target.closest('.dugme');if(d!==ustunde){ustunde=d;guncelle();sozYaz(d)}});
    document.addEventListener('focusin',function(e){odakta=alanMi(e.target)?e.target:null;guncelle()});
    document.addEventListener('focusout',function(){odakta=null;guncelle()});
  }

  // Demolar: bölüm satırı videoyu o saniyeye atlatır (betik yoksa bağlantı dosyayı #t= ile açar);
  // demo sayfasından ?t=<sn>#<video> ile gelen ziyaretçide video o saniyeden başlar.
  [].forEach.call(document.querySelectorAll('a[data-atla]'),function(a){
    a.addEventListener('click',function(e){
      var kap=a.closest('.uzun-video'),v=kap&&kap.querySelector('video');
      if(!v)return;
      e.preventDefault();
      v.currentTime=+a.getAttribute('data-atla');
      v.play();
    });
  });
  var bas=/[?&]t=(\d+)/.exec(location.search),hedef=location.hash.length>1&&document.getElementById(location.hash.slice(1));
  if(bas&&hedef){var hv=hedef.querySelector('video');if(hv)hv.currentTime=+bas[1]}

  // Deneme formu. Sunucu sözleşmesi: 200 gönderildi · 400 gecersiz(+Alan)/dogrulama · 429 · 503.
  // Ekrana yazılan her şey textContent ile yazılır; ziyaretçinin yazdığı adres HTML olarak yorumlanmaz.
  var form=document.getElementById('deneme-formu');
  if(form&&form.getAttribute('action')&&window.fetch){
    var dugme=form.querySelector('button[type=submit]'),sonuc=document.getElementById('f-sonuc');
    var bitti=document.getElementById('deneme-bitti'),bittiMetin=document.getElementById('deneme-bitti-metin');
    var kap=form.closest('.deneme'),ataEl=kap&&kap.querySelector('svg[data-ata]');
    var dugmeMetni=dugme.textContent,mesgul=false;
    var anahtar=form.getAttribute('data-anahtar'),kutu=document.getElementById('f-dogrulama');
    var belirtec='',bekleyen=false,pencere=null,sayac=0;
    var ataDurum=function(ad,sure,sonra){var t=ataEl&&ataEl.ataTutamak;if(t)t.durum(ad,sure,sonra)};
    var m=function(ad){return form.getAttribute('data-m-'+ad)||''};

    // Şablondaki {adres} düz metin, {iletisim} e-posta bağlantısı olur.
    var yaz=function(el,sablon,adres){
      el.textContent='';
      sablon.split(/(\{adres\}|\{iletisim\})/).forEach(function(p){
        if(p==='{adres}')el.appendChild(document.createTextNode(adres||''));
        else if(p==='{iletisim}'){var a=document.createElement('a'),i=form.getAttribute('data-iletisim');a.href='mailto:'+i;a.textContent=i;el.appendChild(a)}
        else if(p)el.appendChild(document.createTextNode(p));
      });
    };
    var temizle=function(){
      [].forEach.call(form.querySelectorAll('[aria-invalid]'),function(n){n.removeAttribute('aria-invalid')});
      [].forEach.call(form.querySelectorAll('.alan-hata'),function(n){n.parentNode.removeChild(n)});
      sonuc.textContent='';sonuc.removeAttribute('data-durum');
    };
    var birak=function(){mesgul=false;bekleyen=false;dugme.disabled=false;dugme.textContent=dugmeMetni;
      belirtec='';if(pencere!==null&&window.turnstile)window.turnstile.reset(pencere)};
    var hata=function(ad){birak();yaz(sonuc,m(ad));sonuc.setAttribute('data-durum','hata');ataDurum('aykiri',2.6,'bakiyor')};
    var alanHata=function(ad){
      var n=form.elements[ad];
      if(ad==='belirtec')return hata('dogrulama');
      if(!n||n.type==='hidden'||ad==='web')return hata('ag');
      birak();
      n.setAttribute('aria-invalid','true');
      var k=document.createElement('small');k.className='alan-hata';k.textContent=m('alan');
      n.parentNode.appendChild(k);n.focus();
      ataDurum('aykiri',2.6,'bakiyor');
    };
    var deger=function(ad){return form.elements[ad].value.trim()};
    // Sunucudaki kuralların aynısı (Araclar/SiteSunucu/src/dogrula.js); asıl karar sunucunundur.
    var onDenetim=function(){
      var ad=deger('ad'),e=deger('eposta');
      if(ad.length<2||ad.length>80)return 'ad';
      if(e.length>254||!/^[^\s@<>",;:]+@[^\s@<>",;:]+\.[^\s@<>",;:.]{2,}$/.test(e))return 'eposta';
      if(deger('firma').length>120)return 'firma';
      return '';
    };
    var yolla=function(){
      var adres=deger('eposta').toLowerCase();
      // Sunucu takılırsa "Gönderiliyor…" sonsuza dek kalmasın: 20 sn'de istek kesilir, ağ hatası iletisi çıkar.
      var kes=window.AbortController?new AbortController():null;
      if(kes)setTimeout(function(){kes.abort()},20000);
      fetch(form.getAttribute('action'),{method:'POST',signal:kes?kes.signal:undefined,headers:{'Content-Type':'application/json'},body:JSON.stringify({
        ad:deger('ad'),eposta:adres,firma:deger('firma'),alan:form.elements.alan.value,
        dil:form.getAttribute('data-dil'),belirtec:belirtec,web:form.elements.web.value})})
      .then(function(y){return y.json().catch(function(){return {}}).then(function(g){return {kod:y.status,g:g}})})
      .then(function(s){
        if(s.kod===200){
          birak();
          yaz(bittiMetin,m('gitti'),adres);
          form.hidden=true;bitti.hidden=false;bitti.focus();
          ataDurum('gecti',3,'bakiyor');
        }
        else if(s.kod===400&&s.g.Hata==='gecersiz')alanHata(s.g.Alan);
        else if(s.kod===400)hata('dogrulama');
        else if(s.kod===429)hata('cok');
        else if(s.kod===503)hata('dustu');
        else hata('ag');
      },function(){hata('ag')});
    };

    dugme.disabled=false;
    form.addEventListener('submit',function(e){
      e.preventDefault();
      if(mesgul)return;
      temizle();
      var bozuk=onDenetim();
      if(bozuk)return alanHata(bozuk);
      mesgul=true;dugme.disabled=true;dugme.textContent=form.getAttribute('data-gonderiliyor');
      ataDurum('calisiyor');
      if(!anahtar||belirtec)return yolla();
      // Doğrulama kutusu belirteci henüz vermedi: gelince gönderilir, 20 sn içinde gelmezse vazgeçilir.
      bekleyen=true;
      var bu=++sayac;
      setTimeout(function(){if(bekleyen&&bu===sayac)hata('dogrulama')},20000);
    });

    // Doğrulama betiği yalnız form görünür olunca yüklenir; site anahtarı boşsa hiç yüklenmez.
    if(anahtar&&kutu&&window.IntersectionObserver){
      var goz=new IntersectionObserver(function(g){
        if(!g.some(function(x){return x.isIntersecting}))return;
        goz.disconnect();
        window.ataDogrulamaHazir=function(){
          pencere=window.turnstile.render(kutu,{sitekey:anahtar,theme:'dark',appearance:'interaction-only',
            language:form.getAttribute('data-dil'),
            callback:function(t){belirtec=t;if(bekleyen){bekleyen=false;yolla()}},
            'expired-callback':function(){belirtec=''},
            'error-callback':function(){belirtec='';if(bekleyen)hata('dogrulama')}});
        };
        var s=document.createElement('script');
        s.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=ataDogrulamaHazir';
        s.async=true;document.head.appendChild(s);
      });
      goz.observe(form);
    }
  }

  // Kısa demolarda alan süzgeci: basılı düğmeye yeniden basmak hepsini geri getirir.
  var suz=document.querySelector('.suzgec');
  if(suz){
    suz.hidden=false;
    suz.addEventListener('click',function(e){
      var b=e.target.closest('button');
      if(!b)return;
      var ac=b.getAttribute('aria-pressed')!=='true',alan=b.getAttribute('data-alan');
      [].forEach.call(suz.querySelectorAll('button'),function(x){x.setAttribute('aria-pressed',x===b&&ac?'true':'false')});
      [].forEach.call(document.querySelectorAll('.demolar [data-alan]'),function(k){k.hidden=ac&&k.getAttribute('data-alan')!==alan});
    });
  }

  var menu=document.querySelector('.menu-ac');
  if(menu){
    menu.addEventListener('click',function(e){if(e.target.closest('a'))menu.removeAttribute('open')});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')menu.removeAttribute('open')});
  }

  // Pafta ve kesit ayrıntısı sütun genişliğinde okunmuyor: çerçeveli görsel tıklanınca tam ekran görüntüleyici açılır.
  // `src` kaynağın tam genişliğidir (gorsel.html); önce sayfadaki küçük kopya gösterilir, tam boy yüklenince yerine geçer.
  var gorseller=[].filter.call(document.querySelectorAll('.cerceve img'),function(g){return !g.closest('a')});
  if(gorseller.length&&window.HTMLDialogElement){
    var ing=document.documentElement.lang==='en';
    var dokunmatik=window.matchMedia&&matchMedia('(pointer:coarse)').matches;
    var sakin=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
    var kutu=document.createElement('dialog');
    kutu.className='buyut';kutu.tabIndex=-1;
    kutu.innerHTML='<div class="b-sahne"><img alt="" draggable="false"></div>'+
      '<div class="b-ust"><span class="b-sayac"></span><span class="b-arac">'+
      '<button type="button" data-b="eksi" aria-label="'+(ing?'Zoom out':'Uzaklaş')+'">−</button>'+
      '<output></output>'+
      '<button type="button" data-b="arti" aria-label="'+(ing?'Zoom in':'Yakınlaş')+'">+</button>'+
      '<button type="button" data-b="sigdir" class="b-yazi">'+(ing?'Fit':'Sığdır')+'</button>'+
      '<button type="button" data-b="kapat" aria-label="'+(ing?'Close':'Kapat')+'">×</button></span></div>'+
      '<button type="button" class="b-yon b-once" data-b="once" aria-label="'+(ing?'Previous image':'Önceki görsel')+'">‹</button>'+
      '<button type="button" class="b-yon b-sonra" data-b="sonra" aria-label="'+(ing?'Next image':'Sonraki görsel')+'">›</button>'+
      '<p class="b-not"><span></span><i></i></p>';
    document.body.appendChild(kutu);
    var sahne=kutu.querySelector('.b-sahne'),gor=sahne.querySelector('img'),
        notYazi=kutu.querySelector('.b-not span'),ipucu=kutu.querySelector('.b-not i'),
        sayac=kutu.querySelector('.b-sayac'),oran=kutu.querySelector('output');
    ipucu.textContent=dokunmatik
      ?(ing?'pinch: zoom · drag: pan · swipe: next image':'iki parmak: yakınlaş · sürükle: kaydır · kaydır: sonraki görsel')
      :(ing?'wheel: zoom · drag: pan · click: zoom in / fit':'tekerlek: yakınlaş · sürükle: kaydır · tık: yakınlaş / sığdır');

    // Durum görselin kendi pikselindedir: s = ölçek, (x,y) = görselin sol üst köşesinin sahnedeki yeri.
    // `h*` hedef, `s/x/y` çizilen değerdir; çizilen değer her karede hedefe yaklaşır (tekerlek ve bırakma yumuşak biter).
    var gw=1,gh=1,W=1,H=1,s0=1,sMax=1,s=1,x=0,y=0,hs=1,hx=0,hy=0,sira=0,kare=0,sonZaman=0,yukNo=0;
    var UST=58,ALT=64,YAN=16;
    var olc=function(){
      W=sahne.clientWidth||innerWidth;H=sahne.clientHeight||innerHeight;
      s0=Math.min((W-2*YAN)/gw,(H-UST-ALT)/gh,1);
      sMax=Math.max(s0*6,2);
    };
    var sikistir=function(S,X,Y){
      S=Math.max(s0,Math.min(sMax,S));
      var sw=gw*S,sh=gh*S;
      X=sw<=W?(W-sw)/2:Math.max(W-sw,Math.min(0,X));
      Y=sh<=H?(H-sh)/2:Math.max(H-sh,Math.min(0,Y));
      return [S,X,Y];
    };
    var yakin=function(){return hs>s0*1.01};
    var ciz=function(){
      gor.style.transform='translate3d('+x.toFixed(2)+'px,'+y.toFixed(2)+'px,0) scale('+s.toFixed(5)+')';
      oran.textContent=(hs/s0).toFixed(1).replace('.',ing?'.':',')+'×';
      sahne.dataset.yakin=yakin()?'1':'0';
    };
    var adim=function(t){
      var dt=Math.min(64,t-sonZaman||16);sonZaman=t;
      var k=sakin?1:1-Math.exp(-dt/75);
      s+=(hs-s)*k;x+=(hx-x)*k;y+=(hy-y)*k;
      if(Math.abs(hs-s)<s0*5e-4&&Math.abs(hx-x)<.3&&Math.abs(hy-y)<.3){s=hs;x=hx;y=hy;kare=0;ciz();return}
      ciz();kare=requestAnimationFrame(adim);
    };
    var git=function(S,X,Y,aninda){
      var c=sikistir(S,X,Y);hs=c[0];hx=c[1];hy=c[2];
      if(aninda){s=hs;x=hx;y=hy;if(kare){cancelAnimationFrame(kare);kare=0}ciz();return}
      if(!kare){sonZaman=performance.now();kare=requestAnimationFrame(adim)}
    };
    // (px,py) sahne noktası yakınlaşırken yerinde kalır.
    var olcekle=function(yeni,px,py,aninda){
      yeni=Math.max(s0,Math.min(sMax,yeni));
      git(yeni,px-(px-hx)*yeni/hs,py-(py-hy)*yeni/hs,aninda);
    };
    var sigdir=function(aninda){git(s0,0,0,aninda)};
    var nokta=function(e){var r=sahne.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top]};
    var ustunde=function(p){return p[0]>=x&&p[0]<=x+gw*s&&p[1]>=y&&p[1]<=y+gh*s};

    var goster=function(i){
      sira=(i+gorseller.length)%gorseller.length;
      var g=gorseller[sira],no=++yukNo;
      var sekil=g.closest('figure'),parcalar=sekil?sekil.querySelectorAll('figcaption b,figcaption span'):[];
      gw=+g.getAttribute('width')||g.naturalWidth||1600;gh=+g.getAttribute('height')||g.naturalHeight||900;
      gor.style.width=gw+'px';gor.style.height=gh+'px';
      gor.alt=g.alt;
      gor.src=g.currentSrc||g.getAttribute('src');
      var tam=new Image();
      tam.onload=function(){if(no===yukNo)gor.src=tam.src};
      tam.src=g.getAttribute('src');
      notYazi.textContent=[].map.call(parcalar,function(p){return p.textContent.trim()}).join(' · ')||g.alt;
      sayac.textContent=gorseller.length>1?(sira+1)+' / '+gorseller.length:'';
      olc();sigdir(true);
    };
    var buyut=function(g){
      kutu.dataset.tek=gorseller.length>1?'0':'1';
      kutu.showModal();kutu.focus();
      goster(gorseller.indexOf(g));
    };

    sahne.addEventListener('wheel',function(e){
      e.preventDefault();
      var p=nokta(e),hiz=e.deltaMode===1?.05:(e.ctrlKey?.01:.0016);
      olcekle(hs*Math.exp(-e.deltaY*hiz),p[0],p[1]);
    },{passive:false});

    // Tek işaretçi: yakınken kaydırır, sığmışken yatay sürükleme görsel değiştirir. İki işaretçi: kıstırarak yakınlaşır.
    var parmak={},ilk=null,oynadi=false,hiz=[0,0],sonNokta=null,kistir=null;
    var say=function(){return Object.keys(parmak).length};
    sahne.addEventListener('pointerdown',function(e){
      if(e.button>0)return;
      parmak[e.pointerId]=nokta(e);
      try{sahne.setPointerCapture(e.pointerId)}catch(_){}
      if(say()===1){ilk=nokta(e);oynadi=false;hiz=[0,0];sonNokta=[ilk[0],ilk[1],performance.now()];git(hs,hx,hy,true);sahne.dataset.tut='1'}
      else if(say()===2){
        var a=Object.keys(parmak).map(function(k){return parmak[k]});
        kistir={d:Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1])||1,s:hs,m:[(a[0][0]+a[1][0])/2,(a[0][1]+a[1][1])/2]};
        oynadi=true;
      }
    });
    sahne.addEventListener('pointermove',function(e){
      if(!parmak[e.pointerId])return;
      var p=nokta(e),on=parmak[e.pointerId];
      parmak[e.pointerId]=p;
      if(say()===2&&kistir){
        var a=Object.keys(parmak).map(function(k){return parmak[k]});
        var d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1])||1,m=[(a[0][0]+a[1][0])/2,(a[0][1]+a[1][1])/2];
        var yeni=Math.max(s0,Math.min(sMax,kistir.s*d/kistir.d));
        git(yeni,m[0]-(kistir.m[0]-hx)*yeni/hs,m[1]-(kistir.m[1]-hy)*yeni/hs,true);
        kistir.m=m;
        return;
      }
      if(say()!==1||!ilk)return;
      if(Math.abs(p[0]-ilk[0])+Math.abs(p[1]-ilk[1])>5)oynadi=true;
      if(!oynadi)return;
      var t=performance.now(),dt=Math.max(1,t-sonNokta[2]);
      hiz=[(p[0]-sonNokta[0])/dt*.6+hiz[0]*.4,(p[1]-sonNokta[1])/dt*.6+hiz[1]*.4];
      sonNokta=[p[0],p[1],t];
      if(yakin())git(hs,hx+p[0]-on[0],hy+p[1]-on[1],true);
      else if(gorseller.length>1){
        // Sığmış görsel parmağı yarı hızla izler: bırakınca ya sonraki görsele geçer ya yerine döner.
        x=(W-gw*s)/2+(p[0]-ilk[0])*.5;ciz();
      }
    });
    var birak=function(e){
      if(!parmak[e.pointerId])return;
      var p=parmak[e.pointerId];
      delete parmak[e.pointerId];
      if(say()>0){
        // Kıstırma bitti, kalan parmak kaydırmayı sürdürür.
        var k=Object.keys(parmak)[0];ilk=parmak[k];sonNokta=[ilk[0],ilk[1],performance.now()];hiz=[0,0];kistir=null;
        return;
      }
      sahne.dataset.tut='0';kistir=null;
      if(!ilk)return;
      var dx=p[0]-ilk[0],dy=p[1]-ilk[1];
      if(!oynadi){
        if(e.type==='pointerup'){
          if(!ustunde(p))kutu.close();
          else if(yakin())sigdir();
          else olcekle(Math.min(sMax,Math.max(s0*2.5,Math.min(1,s0*4))),p[0],p[1]);
        }
      }else if(yakin()){
        if(performance.now()-sonNokta[2]<80)git(hs,hx+hiz[0]*220,hy+hiz[1]*220);
      }else if(gorseller.length>1&&Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.5){
        goster(sira+(dx<0?1:-1));
      }else git(hs,hx,hy);
      ilk=null;
    };
    sahne.addEventListener('pointerup',birak);
    sahne.addEventListener('pointercancel',birak);

    kutu.addEventListener('click',function(e){
      var d=e.target.closest('[data-b]');
      if(!d)return;
      var b=d.dataset.b;
      if(b==='kapat')kutu.close();
      else if(b==='arti')olcekle(hs*1.5,W/2,H/2);
      else if(b==='eksi')olcekle(hs/1.5,W/2,H/2);
      else if(b==='sigdir')sigdir();
      else if(b==='once')goster(sira-1);
      else if(b==='sonra')goster(sira+1);
    });
    kutu.addEventListener('keydown',function(e){
      var k=e.key,ok={ArrowLeft:[1,0],ArrowRight:[-1,0],ArrowUp:[0,1],ArrowDown:[0,-1]}[k];
      if(k==='+'||k==='=')olcekle(hs*1.5,W/2,H/2);
      else if(k==='-'||k==='_')olcekle(hs/1.5,W/2,H/2);
      else if(k==='0')sigdir();
      else if(ok&&yakin())git(hs,hx+ok[0]*W*.2,hy+ok[1]*H*.2);
      else if(ok&&ok[0]&&gorseller.length>1)goster(sira-ok[0]);
      else return;
      e.preventDefault();
    });
    addEventListener('resize',function(){if(kutu.open){olc();sigdir(true)}});
    kutu.addEventListener('close',function(){yukNo++;gor.removeAttribute('src')});

    gorseller.forEach(function(g){
      g.tabIndex=0;
      g.setAttribute('role','button');
      g.title=ing?'Click to enlarge':'Büyütmek için tıklayın';
      g.addEventListener('click',function(){buyut(g)});
      g.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();buyut(g)}});
    });
  }
})();
