/* Ata — üçgen ağdan köşeli kafa, kırmızı yüzler. Bağımlılıksız; window.Ata.
   Ata.kur(svg, { canli, durum, kucuk, ifade }) → tutamak { durum(ad, sure, sonra), durdur(), baslat() }
   Durumlar (gövde): bakiyor | calisiyor | kur | dogus | gecti | aykiri | uyku
   `dogus`: aynı 17 nokta önce arazi parçası olarak üçgenlenir, sonra katlanıp Ata olur (≈2,6 sn).
   Ata.yolcu(): [data-ata-durak data-ata-ifade] taşıyan başlıkları sırayla gezen tek küçük Ata (`ac` / `kapan`).
   İfadeler (yüz):   hafif | gulus | heyecan | merak | saskin | odak | sevinc | endise | mahmur | uyku
   `bakiyor` durumundaki canlı Ata'nın ifadesi ziyaretçinin yaptığına göre kendiliğinden değişir (ruhHali);
   sayfa ayrıca Ata.ifade(ad, sure) ve Ata.bak(el) ile yön verir. */
(function(){
  'use strict';
  var NS='http://www.w3.org/2000/svg';
  var YESIL='#3CC6A4',SARI='#F2B544';
  var R={koyu:[150,34,20],acik:[244,108,88],cizgi:'#FFF1EC',cizgiO:0.5,dis:'#F2EFEA',goz:'#F2EFEA',hale:'#5E140B',isik:'#FFFFFF'};
  // Durağan çizimde kullanılan süre: her durumun oturmuş hâlini verir (ağ kurulmuş, eğim tamam).
  var DURGUN=10;
  var YAKIN=150,UYKU_SN=30,ESNE_SN=1.8;

  function el(ad,ozn,ebeveyn){var e=document.createElementNS(NS,ad);for(var k in ozn)e.setAttribute(k,ozn[k]);if(ebeveyn)ebeveyn.appendChild(e);return e}
  function kis(v,a,b){return v<a?a:v>b?b:v}
  function dil(t,a,b){return kis((t-a)/(b-a),0,1)}
  function yum(p){return p*p*(3-2*p)}
  function f1(v){return v.toFixed(1)}
  // Zaman tek kaynaktan: rAF'ın verdiği damgayla karışınca durum süreleri atlıyordu (taslak ölçümü 2026-11-10).
  function simdi(){return performance.now()/1000}

  var fare={x:0,y:0,var:false};
  var azHareket=false;
  try{azHareket=window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}

  // Ağ: dış halka 8 (0–7) · iç halka 8 (8–15) · orta (16). Noktalar (MX,MY) merkezlidir, z izleyene doğrudur;
  // baş bu eksenlerde gerçekten döner (dik izdüşüm). YAW/PIT gözün dış çizgiye dayanmadığı sınırdır: göz
  // z≈58'de durur, tam dönüşte ~16 birim kayar (kare ölçümü 2026-11-10: 0,44 rad + Z0 24'te göz kenara çıkıyordu).
  var MX=100,MY=106,Z0=6,YAW=0.27,PIT=0.24;
  var V=[],UCGEN=[],ARAZI=[],ORT=[],KOTLU=[9,13];
  (function(){
    var s1=[1,0.94,1.04,0.97,1.02,0.95,1.03,0.96],s2=[1.06,0.92,1.0,1.08,0.95,1.04,0.9,1.02],k;
    for(k=0;k<8;k++){var a=(-90+45*k)*Math.PI/180;V.push([Math.cos(a)*74*s1[k],-4+Math.sin(a)*70*s1[k],0])}
    for(k=0;k<8;k++){var b=(-90+22.5+45*k)*Math.PI/180;V.push([Math.cos(b)*40*s2[k],-2+Math.sin(b)*38*s2[k],44])}
    V.push([0,0,70]);
    for(k=0;k<8;k++){var n=(k+1)%8;UCGEN.push([k,n,8+k],[n,8+n,8+k],[8+k,8+n,16])}
    // Doğuşun başlangıcı: aynı noktalar plan düzleminde döndürülüp yayılmış, kotlu bir arazi parçasıdır.
    V.forEach(function(p){var x=(p[0]*0.9-p[1]*0.435)*1.35,y=(p[0]*0.435+p[1]*0.9)*1.35;ARAZI.push([x,y,10+26*Math.sin(x/40+0.6)+18*Math.cos(y/33-0.4)])});
    UCGEN.forEach(function(t){ORT.push([(V[t[0]][0]+V[t[1]][0]+V[t[2]][0])/3,(V[t[0]][1]+V[t[1]][1]+V[t[2]][1])/3])});
  })();
  var ISIK=(function(){var v=[-0.45,-0.65,0.62],l=Math.hypot(v[0],v[1],v[2]);return v.map(function(x){return x/l})})();
  // Göz ve kaşın oturduğu yüzey: orta nokta ile iç halka arasındaki yüzler.
  function yuzeyZ(x,y){return 70-26*Math.min(1,Math.hypot(x,y)/39)}
  function ton(parlak){var c=R.koyu,a=R.acik;return 'rgb('+[0,1,2].map(function(i){return Math.round(c[i]+(a[i]-c[i])*parlak)}).join(',')+')'}

  /* Yüz sayısal bir dizidir; ifadeler arası geçiş bu dizi üstünde yumuşatılır.
     0–3 sol göz: en · köşe y · orta y · dolu(1)/çizgi(0)   4–7 sağ göz   8 göz kayması y
     9 kaş görünürlüğü   10–13 kaş y: sol dış · sol iç · sağ iç · sağ dış
     14 baş eğimi (derece)   15 bakışın etkisi (0 = imleci izlemez)   16 canlılık (opaklık) */
  function yz(goz,o){
    o=o||{};var s=o.sag||goz,k=o.kas||[82,82,82,82];
    return [goz[0],goz[1],goz[2],goz[3],s[0],s[1],s[2],s[3],o.gy||0,o.kas?1:0,k[0],k[1],k[2],k[3],
            o.egik||0,o.bakis==null?1:o.bakis,o.canli==null?1:o.canli];
  }
  var KOT=[25,-9.5,9.5,1];
  var IFADE={
    hafif:  yz(KOT),
    gulus:  yz([28,-11,11,1]),
    heyecan:yz([31,-13,13,1]),
    merak:  yz([23,-8.5,8.5,1],{sag:[29,-12,12,1],kas:[79,80,72,70],egik:5}),
    saskin: yz([28,-12,12,1],{kas:[72,70,70,72]}),
    odak:   yz([25,-4,6,1],{kas:[79,82,82,79]}),
    sevinc: yz([20,6,-6,0],{bakis:0}),
    endise: yz([16,-6,6,1],{gy:3,kas:[84,79,79,84],egik:-6,bakis:0}),
    mahmur: yz([25,-2.5,5,1],{gy:2,bakis:0.4,canli:0.9}),
    uyku:   yz([18,-1,2.5,0],{gy:1,bakis:0,canli:0.78})
  };
  var DURUM_IFADE={calisiyor:'odak',kur:'hafif',dogus:'hafif',ac:'hafif',kapan:'hafif',gecti:'sevinc',aykiri:'endise',uyku:'uyku'};

  function govdeKur(svg,kucuk){
    while(svg.firstChild)svg.removeChild(svg.firstChild);
    var g=el('g',{},svg),yuz=el('g',{},g),ust=el('g',{},g),ciz=el('g',{},g);
    var ucg=UCGEN.map(function(){return {
      y:el('polygon',{'stroke-linejoin':'round'},yuz),
      o:el('polygon',{'fill-opacity':0},ust),
      c:el('polygon',{fill:'none',stroke:R.cizgi,'stroke-width':1.6,'stroke-linejoin':'round','stroke-opacity':kucuk?0:R.cizgiO},ciz)}});
    var dis=el('polygon',{fill:'none',stroke:R.dis,'stroke-width':kucuk?10:5.5,'stroke-linejoin':'round'},g);
    var yuvar={'stroke-linecap':'round','stroke-linejoin':'round'};
    function yol(ozn){for(var k in yuvar)ozn[k]=yuvar[k];return el('path',ozn,g)}
    var hale=yol({fill:R.hale,stroke:R.hale,'stroke-width':kucuk?4:7});
    var gozS=yol({fill:R.goz,stroke:R.goz}),gozG=yol({fill:R.goz,stroke:R.goz});
    var kas=yol({fill:'none',stroke:R.goz,'stroke-width':4.5});
    var kot=null,kotIsaret=null,kotYazi=[];
    if(!kucuk){
      kot=el('g',{opacity:0,'font-family':'"IBM Plex Mono",Consolas,monospace','font-size':12,fill:R.dis},g);
      kotIsaret=el('path',{fill:'#131211',stroke:R.dis,'stroke-width':1.6,'stroke-linejoin':'round'},kot);
      KOTLU.forEach(function(i){var t=el('text',{},kot);t.textContent=(100+ARAZI[i][2]/10).toFixed(2);kotYazi.push(t)});
    }
    return {g:g,ucg:ucg,dis:dis,hale:hale,gozS:gozS,gozG:gozG,kas:kas,kucuk:kucuk,kot:kot,kotIsaret:kotIsaret,kotYazi:kotYazi};
  }

  function gozYol(yp,cx,cy,w,k,m){return 'M'+yp(cx-w/2,cy+k)+'L'+yp(cx,cy+m)+'L'+yp(cx+w/2,cy+k)}
  function gozCiz(e,d,dolu){
    e.setAttribute('d',d);
    e.setAttribute('fill-opacity',f1(dolu));
    e.setAttribute('stroke-width',f1(5*(1-dolu)));
  }

  function ciz(o,durum,dt,zm,bak,y){
    var bx=bak[0]*y[15],by=bak[1]*y[15],kirp=false,soluk=y[16],ol=1,ac=0;
    if(durum==='bakiyor')kirp=((zm+0.9)%3.6)<0.13;
    if(durum==='calisiyor'){bx=Math.cos(dt*2.4)*0.5;by=0.6}
    if(durum==='gecti')ol=1+0.06*Math.sin(Math.PI*dil(dt,0.1,0.55));
    // ac: 1 = arazi parçası, 0 = baş.
    if(durum==='dogus')ac=1-yum(dil(dt,1.25,2.2));
    // Yolcu Ata'nın kısa geçişleri: `ac` araziden toplanır, `kapan` araziye yatıp kaybolur.
    var genel=1;
    if(durum==='ac'){ac=1-yum(dil(dt,0.05,0.55));genel=yum(dil(dt,0,0.2))}
    if(durum==='kapan'){ac=yum(dil(dt,0,0.3));genel=1-yum(dil(dt,0.18,0.4))}
    // Uykuda baş öne düşer ve yavaş nefes alır; solukluk yalnız eşlik eder.
    if(soluk<0.95){ol=1+0.02*Math.sin(zm*1.5);by+=(1-soluk)*3.2}
    var kk=(o.kucuk?0.6:1)*(1-ac),yaw=bx*YAW*kk,pit=by*PIT*kk-0.85*ac,z0=Z0*(1-ac),olc=1-0.2*ac;
    var cyw=Math.cos(yaw),syw=Math.sin(yaw),cpt=Math.cos(pit),spt=Math.sin(pit);
    function iz(x,yy,z){z+=z0;var x1=x*cyw+z*syw,z1=-x*syw+z*cyw;return [MX+x1*olc,MY+(yy*cpt+z1*spt)*olc+14*ac,(-yy*spt+z1*cpt)*olc]}
    // cark: gövdenin dış hat ortası (0,-4) çevresinde kendi düzleminde dönüşü (gezgin yuvarlanırken); yüz dönmez.
    var ck=o.cark||0,cck=Math.cos(ck),sck=Math.sin(ck);
    var P=V.map(function(p,i){
      var a=ARAZI[i],px=p[0],py=p[1];
      if(ck){var dy=py+4;py=px*sck+dy*cck-4;px=p[0]*cck-dy*sck}
      return iz(px+(a[0]-px)*ac,py+(a[1]-py)*ac,p[2]+(a[2]-p[2])*ac);
    });
    // Aykırılıkta sararan üçgen, bakılan yöndeki orta halka yüzüdür (Ata hatayı gösterir).
    var sari=4;
    if(durum==='aykiri'&&Math.hypot(bak[0],bak[1])>0.2){var eniyi=-1e9;for(var q=1;q<24;q+=3){var uy=ORT[q][0]*bak[0]+ORT[q][1]*bak[1];if(uy>eniyi){eniyi=uy;sari=q}}}
    // Derinlik tamponu yok: uzaktaki yüz önce çizilsin diye üçgenler her karede yuvalara derinlik sırasıyla dağıtılır.
    var sira=UCGEN.map(function(t,i){return i}).sort(function(a,b){var ta=UCGEN[a],tb=UCGEN[b];return P[ta[0]][2]+P[ta[1]][2]+P[ta[2]][2]-P[tb[0]][2]-P[tb[1]][2]-P[tb[2]][2]});
    sira.forEach(function(idx,yuva){
      var u=o.ucg[yuva],t=UCGEN[idx],p=[P[t[0]],P[t[1]],P[t[2]]];
      var e1=[p[1][0]-p[0][0],p[1][1]-p[0][1],p[1][2]-p[0][2]],e2=[p[2][0]-p[0][0],p[2][1]-p[0][1],p[2][2]-p[0][2]];
      var nn=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]],nl=Math.hypot(nn[0],nn[1],nn[2])||1;
      if(nn[2]<0)nn=[-nn[0],-nn[1],-nn[2]];
      var parlak=kis(0.15+0.95*((nn[0]*ISIK[0]+nn[1]*ISIK[1]+nn[2]*ISIK[2])/nl),0,1);
      var s=p.map(function(q){return q[0].toFixed(1)+','+q[1].toFixed(1)}).join(' ');
      u.y.setAttribute('points',s);u.o.setAttribute('points',s);u.c.setAttribute('points',s);
      var renk=ton(parlak);
      u.y.setAttribute('fill',renk);u.y.setAttribute('stroke',renk);u.y.setAttribute('stroke-width',0.6);
      var gor=1;
      if(durum==='kur')gor=yum(dil(dt,0.1+idx*0.055,0.3+idx*0.055));
      if(durum==='dogus')gor=yum(dil(dt,0.05+idx*0.035,0.2+idx*0.035));
      u.y.setAttribute('opacity',(gor*soluk).toFixed(2));
      if(!o.kucuk)u.c.setAttribute('stroke-opacity',(R.cizgiO*Math.min(1,gor*1.4)*soluk).toFixed(2));
      var f=0,fr=R.isik;
      if(durum==='calisiyor')f=0.38*Math.max(0,Math.sin(dt*6-idx*0.55));
      if(durum==='gecti'){fr=YESIL;f=0.7*Math.max(0,Math.sin(Math.PI*dil(dt,0.05+idx*0.02,0.55+idx*0.02)))}
      if(durum==='aykiri'&&idx===sari){fr=SARI;f=0.55+0.35*Math.sin(dt*4.4)}
      u.o.setAttribute('fill',fr);u.o.setAttribute('fill-opacity',f.toFixed(2));
    });
    o.dis.setAttribute('points',P.slice(0,8).map(function(q){return f1(q[0])+','+f1(q[1])}).join(' '));
    o.dis.setAttribute('stroke-opacity',soluk.toFixed(2));
    var cizim=durum==='kur'?dil(dt,0,0.9):durum==='dogus'?dil(dt,0,0.8):1;
    if(cizim<1)o.dis.setAttribute('stroke-dasharray',(620*yum(cizim)).toFixed(0)+' 700');else o.dis.removeAttribute('stroke-dasharray');
    // ezik: konarken tabana (y≈168) doğru basılma.
    var ez=o.ezik||0,ezik=ez>0.001?'translate(100 168) scale('+(1+0.16*ez).toFixed(3)+' '+(1-0.22*ez).toFixed(3)+') translate(-100 -168) ':'';
    o.g.setAttribute('transform',ezik+'rotate('+y[14].toFixed(1)+' 100 106) translate(100 106) scale('+ol.toFixed(3)+') translate(-100 -106)');
    o.g.setAttribute('opacity',genel.toFixed(2));

    if(o.kot){
      var etiket=durum==='dogus'?yum(dil(dt,0.85,1.05))*(1-yum(dil(dt,1.25,1.5))):0;
      o.kot.setAttribute('opacity',etiket.toFixed(2));
      if(etiket>0.01){
        var isaret='';
        KOTLU.forEach(function(i,n){var k=P[i];o.kotYazi[n].setAttribute('x',f1(k[0]+9));o.kotYazi[n].setAttribute('y',f1(k[1]-4));isaret+='M'+f1(k[0]-5)+' '+f1(k[1]-13)+'h10l-5 10z'});
        o.kotIsaret.setAttribute('d',isaret);
      }
    }

    // Göz ve kaş yüzeyin üstünde durur ve başla birlikte döner; gx/gy yalnız göz bebeği payıdır.
    var gx=bx*2,gy=by*2,gn=durum==='kur'?yum(dil(dt,1.6,1.9)):durum==='dogus'?yum(dil(dt,2.2,2.5)):durum==='ac'?yum(dil(dt,0.5,0.7)):durum==='kapan'?1-dil(dt,0,0.1):1;
    if(gn<=0.05){
      ['hale','gozS','gozG','kas'].forEach(function(a){o[a].setAttribute('d','')});
      return;
    }
    function yp(x,yy){x-=MX;yy-=MY;var k=iz(x,yy,yuzeyZ(x,yy)+2);return f1(k[0])+' '+f1(k[1])}
    var kS=kirp&&y[3]>0.5?0.16:1,kG=kirp&&y[7]>0.5?0.16:1,cy=96+gy+y[8];
    var dS=gozYol(yp,80+gx,cy,y[0]*gn,y[1]*gn*kS,y[2]*gn*kS),dG=gozYol(yp,120+gx,cy,y[4]*gn,y[5]*gn*kG,y[6]*gn*kG);
    gozCiz(o.gozS,dS,y[3]);gozCiz(o.gozG,dG,y[7]);
    var kasGor=o.kucuk?0:y[9]*gn,dK='';
    if(kasGor>0.05)dK='M'+yp(70+gx,y[10]+gy)+'L'+yp(89+gx,y[11]+gy)+'M'+yp(111+gx,y[12]+gy)+'L'+yp(130+gx,y[13]+gy);
    o.kas.setAttribute('d',dK);o.kas.setAttribute('stroke-opacity',(kasGor*soluk).toFixed(2));
    o.hale.setAttribute('d',dS+dG+(kasGor>0.5?dK:''));

  }

  var hepsi=[],dongu=0,dinliyor=false,gozcu=null;
  // kalici: sayfanın verdiği süresiz ifade · anlik: süreli ifadeler · hedef: imleç yerine bakılacak öğe
  var ruh={kalici:null,anlik:[],hedef:null,sonHareket:0};

  function anlikEkle(ad,bas,sure,kim){
    var zm=simdi();kim=kim||null;
    ruh.anlik=ruh.anlik.filter(function(a){return a.bit>zm&&a.kim!==kim});
    ruh.anlik.push({ad:ad,bas:zm+bas,bit:zm+bas+sure,kim:kim});
  }
  function merkez(r){return [r.left+r.width/2,r.top+r.height/2]}
  function ruhHali(t,zm){
    for(var i=0;i<ruh.anlik.length;i++){var a=ruh.anlik[i];if(zm>=a.bas&&zm<a.bit&&(!a.kim||a.kim===t))return a.ad}
    if(ruh.kalici)return ruh.kalici;
    var bos=zm-ruh.sonHareket;
    if(bos>UYKU_SN+ESNE_SN)return 'uyku';
    if(bos>UYKU_SN)return 'mahmur';
    if(fare.var){var m=merkez(t.svg.getBoundingClientRect());if(Math.hypot(fare.x-m[0],fare.y-m[1])<YAKIN)return 'gulus'}
    return t.taban||'hafif';
  }
  function ifadeAdi(t,zm,canli){
    if(t.sabit)return t.sabit;
    if(t.ad!=='bakiyor')return DURUM_IFADE[t.ad]||'gulus';
    return canli?ruhHali(t,zm):'hafif';
  }
  function hareket(){
    var zm=simdi();
    if(zm-ruh.sonHareket>UYKU_SN+ESNE_SN)anlikEkle('saskin',0,0.7);
    ruh.sonHareket=zm;
  }

  function bakis(svg){
    var h=null;
    if(ruh.hedef&&ruh.hedef.isConnected)h=merkez(ruh.hedef.getBoundingClientRect());
    else if(fare.var)h=[fare.x,fare.y];
    if(!h)return [0,0];
    var m=merkez(svg.getBoundingClientRect()),dx=h[0]-m[0],dy=h[1]-m[1],d=Math.hypot(dx,dy)||1,k=Math.min(1,d/260);
    return [dx/d*k,dy/d*k];
  }
  function durgunCiz(t){t.yz=(IFADE[ifadeAdi(t,0,false)]||IFADE.hafif).slice();ciz(t.o,t.ad,DURGUN,1,[0,0],t.yz)}
  function kare(){
    dongu=0;
    if(document.hidden)return;
    var zm=simdi(),surecek=false;
    hepsi.forEach(function(t){
      if(!t.canli||t.durdu||!t.gorunur)return;
      var dt=zm-t.t0;
      if(t.sure&&dt>t.sure){t.ad=t.sonra;t.sure=0;t.sonra=null;t.t0=zm;dt=0}
      var hedef=IFADE[ifadeAdi(t,zm,true)]||IFADE.hafif,k=1-Math.exp(-Math.min(0.1,zm-t.son)*13);
      for(var i=0;i<hedef.length;i++)t.yz[i]+=(hedef[i]-t.yz[i])*k;
      // Bakış yumuşatılır: gezginin verdiği yön ile imleç arasında geçişte baş sıçramasın.
      var hb=t.bakis||bakis(t.svg),kb=1-Math.exp(-Math.min(0.1,zm-t.son)*14);
      t.bs[0]+=(hb[0]-t.bs[0])*kb;t.bs[1]+=(hb[1]-t.bs[1])*kb;
      t.son=zm;
      ciz(t.o,t.ad,dt,zm,t.bs,t.yz);
      surecek=true;
    });
    if(surecek)dongu=requestAnimationFrame(kare);
  }
  function uyandir(){if(!dongu&&!document.hidden)dongu=requestAnimationFrame(kare)}
  function dinle(){
    if(dinliyor)return;dinliyor=true;
    ruh.sonHareket=simdi();
    window.addEventListener('pointermove',function(e){fare.x=e.clientX;fare.y=e.clientY;fare.var=true;hareket()},{passive:true});
    ['pointerdown','keydown','scroll','touchstart'].forEach(function(ad){window.addEventListener(ad,hareket,{passive:true,capture:true})});
    document.addEventListener('visibilitychange',function(){ruh.sonHareket=simdi();uyandir()});
    if('IntersectionObserver' in window){
      gozcu=new IntersectionObserver(function(kayitlar){
        kayitlar.forEach(function(k){
          hepsi.forEach(function(t){if(t.svg===k.target){t.gorunur=k.isIntersecting;t.son=simdi()}});
        });
        uyandir();
      });
    }
  }

  function kur(svg,secenek){
    secenek=secenek||{};
    var t={svg:svg,o:govdeKur(svg,!!secenek.kucuk),ad:secenek.durum||'bakiyor',canli:!!secenek.canli&&!azHareket,
           sabit:secenek.ifade||null,durdu:false,gorunur:true,t0:simdi(),son:simdi(),sure:0,sonra:null,zamanlayici:0,yz:null,bs:[0,0],bakis:null};
    hepsi.push(t);
    if(t.canli){
      dinle();if(gozcu){t.gorunur=false;gozcu.observe(svg)}
      // Dokununca şaşırır, sonra güler.
      svg.addEventListener('pointerdown',function(){anlikEkle('saskin',0,0.35,t);ruh.anlik.push({ad:'sevinc',bas:simdi()+0.35,bit:simdi()+1.6,kim:t})});
      uyandir();
    }
    durgunCiz(t);
    return {
      // sure + sonra verilirse durum o kadar saniye sürer, sonra `sonra` durumuna geçer.
      durum:function(ad,sure,sonra){
        clearTimeout(t.zamanlayici);
        t.t0=simdi();
        if(t.canli&&!t.durdu){t.ad=ad;t.sure=sure||0;t.sonra=sonra||null;uyandir();return}
        t.sure=0;t.sonra=null;
        if(azHareket&&sonra){t.ad=sonra;durgunCiz(t);return}
        t.ad=ad;durgunCiz(t);
        if(sure&&sonra)t.zamanlayici=setTimeout(function(){t.ad=sonra;durgunCiz(t)},sure*1000);
      },
      durdur:function(){t.durdu=true;durgunCiz(t)},
      baslat:function(){t.durdu=false;t.t0=t.son=simdi();if(t.canli)uyandir()},
      // Sakin hâlin ifadesi (yakınlık · dokunuş · uyku bunun üstüne gelir).
      taban:function(ad){t.taban=IFADE[ad]?ad:null},
      // Gezgin için: yüzü ve bakışı dışarıdan sabitler (null → kendi hâline döner), gövdeyi döndürür/ezer.
      yuz:function(ad){t.sabit=ad&&IFADE[ad]?ad:null},
      bak:function(v){t.bakis=v||null},
      govde:function(cark,ezik){t.o.cark=cark;t.o.ezik=ezik}
    };
  }

  /* Yolcu Ata: sayfada [data-ata-durak] taşıyan başlıkları sırayla gezen tek küçük Ata. Aşağı inildikçe
     sıradaki bölümün başlığının solundaki boşluğa konar; geçişte araziye yatıp yeni yerinde toplanır.
     Ekranda tek canlı Ata kalsın diye sayfanın sabit Ata'larından biri görünürken ortada olmaz.
     Sol boşluk dar ise (yaklaşık 1270 px altı), hareket kısıtında ve dokunmatik dar ekranda hiç kurulmaz. */
  var YOLCU_PX=46,YOLCU_ARA=12,YOLCU_UST=24,YOLCU_ESIK=0.62;
  function yolcu(){
    if(azHareket||!('IntersectionObserver' in window))return;
    var duraklar=[].slice.call(document.querySelectorAll('[data-ata-durak]'));
    if(!duraklar.length)return;
    var svg=el('svg',{viewBox:'19 23 162 162',width:YOLCU_PX,height:YOLCU_PX,'aria-hidden':'true','class':'ata'});
    svg.style.cssText='position:fixed;left:0;top:0;z-index:2;visibility:hidden;cursor:default';
    document.body.appendChild(svg);
    var tut=kur(svg,{canli:true}),simdiki=null,mesgul=false,sabit=0,bekleyen=0;
    function yer(d){var r=d.getBoundingClientRect();return [r.left-YOLCU_PX-YOLCU_ARA,Math.max(YOLCU_UST,r.top+2),r]}
    function sec(){
      if(sabit>0)return null;
      var esik=window.innerHeight*YOLCU_ESIK,eniyi=null;
      duraklar.forEach(function(d){if(d.getBoundingClientRect().top<esik)eniyi=d});
      if(!eniyi||yer(eniyi)[0]<8)return null;
      // Bölümü tümüyle geçilmiş son durakta beklemez (sayfa sonu, alt bilgi).
      var bolum=eniyi.closest('section')||eniyi;
      return bolum.getBoundingClientRect().bottom<YOLCU_UST+YOLCU_PX?null:eniyi;
    }
    function konum(){if(!simdiki)return;var k=yer(simdiki);svg.style.transform='translate('+k[0].toFixed(1)+'px,'+k[1].toFixed(1)+'px)'}
    function gec(){
      if(mesgul)return;
      var hedef=sec();
      if(hedef===simdiki)return;
      mesgul=true;
      var var_=function(){
        simdiki=hedef;
        if(!hedef){svg.style.visibility='hidden';mesgul=false;return}
        konum();svg.style.visibility='visible';
        tut.taban(hedef.getAttribute('data-ata-ifade'));
        tut.durum('ac',0.72,'bakiyor');
        setTimeout(function(){mesgul=false;gec()},720);
      };
      if(simdiki){tut.durum('kapan');setTimeout(var_,400)}else var_();
    }
    // Karar yalnız kareye bağlanmaz: arka plandaki sekmede ve başsız tarayıcıda kare gelmeyebilir (ölçüm
    // 2026-11-10: başsız Edge 4 sn'de 4 kare verdi, yolcu hiç yerleşmedi) → zamanlayıcı yedeği.
    function kaydi(){
      if(bekleyen)return;bekleyen=1;
      var bir=function(){if(!bekleyen)return;bekleyen=0;konum();gec()};
      requestAnimationFrame(bir);setTimeout(bir,120);
    }
    var goz=new IntersectionObserver(function(k){
      k.forEach(function(g){g.target.ataGorunur=g.isIntersecting});
      sabit=0;[].forEach.call(document.querySelectorAll('svg[data-ata]'),function(s){if(s.ataGorunur)sabit++});
      kaydi();
    });
    [].forEach.call(document.querySelectorAll('svg[data-ata]'),function(s){goz.observe(s)});
    window.addEventListener('scroll',kaydi,{passive:true});
    window.addEventListener('resize',kaydi);
  }

  /* Gezgin Ata: sayfadaki [data-ata-kenar] öğelerinin üst kenarını zemin sayan tek Ata. Ayağı yoktur; sekizgen
     gövdesi köşe köşe devrilerek yuvarlanır (düzgün sekizgen varsayımı: R dış yarıçap, S bir kenar, tam sayı u =
     bir yüzü yere basmış duruş). Kenar ekrandan çıkınca alttaki görünür kenara düşer, konarken ezilir; yukarı
     kaydırmada sönüp belirerek yer değiştirir. İmleç çok yaklaşınca birkaç köşe öteye yuvarlanır, uzun
     hareketsizlikte mola verir. data-ata-kenar="0.68 1" → kenarın yalnız o aralığında gezer (üstü boş olan kısım).
     Sayfanın sabit Ata'larından biri görünürken, 900 px'ten dar pencerede ve hareket kısıtında ortada yoktur.
     Mizaç sabitleri kullanıcı seçimi "Sakin" (2026-11-10 taslağı: taslak/ata-yuvarlanan.html). */
  var GZ={R:27,PX:60,bekle:[4,8],hiz:2.1,uyku:11,atla:0.45,en:900};
  function gezgin(){
    if(azHareket||!('IntersectionObserver' in window))return;
    var kenarlar=[].slice.call(document.querySelectorAll('[data-ata-kenar]'));
    if(!kenarlar.length)return;
    var R=GZ.R,S=2*R*Math.sin(Math.PI/8),APO=R*Math.cos(Math.PI/8),MXP=GZ.PX*81/162,MYP=GZ.PX*79/162;
    var ing=(document.documentElement.lang||'').slice(0,2)==='en';
    // Katman belge koordinatındadır: Ata kaydırmayla birlikte, betik gecikmesi olmadan taşınır.
    var kat=document.createElement('div'),kutu=document.createElement('div'),yazi=document.createElement('span');
    kat.setAttribute('aria-hidden','true');
    kat.style.cssText='position:absolute;left:0;top:0;width:100%;overflow:hidden;pointer-events:none;z-index:2';
    kutu.style.cssText='position:absolute;left:0;top:0;width:'+GZ.PX+'px;height:'+GZ.PX+'px;opacity:0;will-change:transform';
    yazi.style.cssText='position:absolute;top:'+(MYP-17).toFixed(0)+'px;white-space:nowrap;font:500 11px/1.7 var(--veri);letter-spacing:.06em;text-transform:uppercase;color:var(--yazi);background:rgba(19,18,17,.86);padding:0 7px;opacity:0;transition:opacity .2s';
    var svg=el('svg',{viewBox:'19 23 162 162',width:GZ.PX,height:GZ.PX,'class':'ata'});
    kutu.appendChild(svg);kutu.appendChild(yazi);kat.appendChild(kutu);document.body.appendChild(kat);
    // Gözcü ilk kez haber verene dek sabit Ata'lar görünür sayılır (sayfa başında araya girmesin).
    var tut=kur(svg,{canli:true}),sabit=document.querySelectorAll('svg[data-ata]').length;
    function boy(){var h=document.body.offsetHeight+'px';if(kat.style.height!==h)kat.style.height=h}

    function bilgi(k){
      var r=k.getBoundingClientRect(),o=(k.getAttribute('data-ata-kenar')||'').split(/\s+/),a=parseFloat(o[0]),b=parseFloat(o[1]);
      if(!(a>=0))a=0;if(!(b<=1))b=1;
      var sol=r.left+r.width*a+window.scrollX+R+8,sag=r.left+r.width*b+window.scrollX-R-8;
      return {sol:sol,ust:r.top+window.scrollY,n:Math.max(0,Math.floor((sag-sol)/S)),ekran:r.top};
    }
    function gorunur(k){var u=k.getBoundingClientRect().top;return u>2*R+16&&u<window.innerHeight-34&&bilgi(k).n>=1}
    function acik(){return sabit===0&&window.innerWidth>=GZ.en}
    function gorunenler(){return acik()?kenarlar.filter(gorunur):[]}
    function konumU(u){
      var k=Math.floor(u),f=u-k,fe=f+0.11*Math.sin(2*Math.PI*f),phi=-Math.PI/8+fe*Math.PI/4;
      return {x:S*k+S/2+R*Math.sin(phi),lift:R*Math.cos(phi),cark:(k+fe)*Math.PI/4};
    }
    function rast(a,b){return a+Math.random()*(b-a)}

    var A={durum:'bekle',kenar:null,u:0,hedefU:0,t:0,sonraki:0,cx:0,cy:-999,cark:0,ezik:0,gor:0,acele:false,saskin:0,
           fx:0,fy:0,vx:0,vy:0,sure:0,cark0:0,dCark:0,hedef:null,hedefU2:0,kacSon:0,etiket:''};
    function gecis(k,u){A.durum='gec';A.t=0;A.hedef=k;A.hedefU2=u}
    function atla(k){
      var b=bilgi(k),uT=kis(Math.round((A.cx-b.sol)/S),0,b.n),tx=b.sol+S*uT,ty=b.ust-APO;
      // Ekranın üstünde kaldıysa düşüş ekranın üst kenarından başlar.
      A.fx=A.cx;A.fy=Math.max(A.cy,window.scrollY-R-10);
      var dy=ty-A.fy;
      if(dy<24){gecis(k,uT);return}
      var g=1500,vy0=-190,sure=(-vy0+Math.sqrt(vy0*vy0+2*g*dy))/g;
      A.vx=(tx-A.fx)/sure;A.vy=vy0;A.sure=sure;A.t=0;A.hedef=k;A.hedefU2=uT;
      // Dönüş 45°'nin tam katıdır: konduğunda yeni kenardaki duruşla çakışır.
      A.cark0=A.cark;A.dCark=(A.vx<0?-1:1)*Math.max(2,Math.round(sure*5))*Math.PI/4;
      A.durum='dus';A.kenar=null;A.gor=1;
    }
    function yerDegis(){
      var g=gorunenler();
      if(!g.length){A.durum='bekle';return}
      if(!A.kenar||bilgi(A.kenar).ekran<2*R+16)atla(g[0]);
      else{var k=g[g.length-1],b=bilgi(k);gecis(k,kis(Math.round((A.cx-b.sol)/S),0,b.n))}
    }
    function alttaki(){
      var ust=bilgi(A.kenar).ust,aday=null;
      gorunenler().forEach(function(k){if(k!==A.kenar&&!aday&&bilgi(k).ust>ust+40)aday=k});
      return aday;
    }
    function dinlen(zm,carpan){A.durum='otur';A.sonraki=zm+rast(GZ.bekle[0],GZ.bekle[1])*(carpan||1)}

    function adim(zm,dt){
      var b,bos=zm-ruh.sonHareket;
      switch(A.durum){
        case 'bekle':
          A.gor=Math.max(0,A.gor-dt*5);
          var g=gorunenler();
          if(g.length&&A.gor<=0.01){b=bilgi(g[0]);A.kenar=null;A.cx=b.sol+S*Math.floor(b.n*rast(0.2,0.8));A.cy=window.scrollY-R-10;A.cark=0;atla(g[0])}
          break;
        case 'otur':case 'uyu':case 'kenar':
          if(!acik()||!gorunur(A.kenar)){yerDegis();break}
          b=bilgi(A.kenar);A.u=kis(A.u,0,b.n);
          var ex=A.cx-window.scrollX,ey=A.cy-window.scrollY;
          if(fare.var&&Math.hypot(fare.x-ex,fare.y-ey)<56&&zm-A.kacSon>0.9){
            var yon=ex>=fare.x?1:-1,h=kis(A.u+yon*3,0,b.n);
            if(h===A.u)h=kis(A.u-yon*4,0,b.n);
            if(h!==A.u){A.hedefU=h;A.durum='yuvarlan';A.acele=true;A.saskin=zm+0.5;A.kacSon=zm;break}
          }
          if(A.durum==='uyu'){if(bos<1){dinlen(zm,0.4);A.saskin=zm+0.45}break}
          if(bos>GZ.uyku){A.durum='uyu';break}
          A.t+=dt;
          if(A.durum==='kenar'){
            if(A.t>1.5){var alt=alttaki();if(alt&&Math.random()<GZ.atla)atla(alt);else dinlen(zm)}
            break;
          }
          if(zm>A.sonraki&&b.n>0){
            var uc=Math.random()<0.35?(Math.random()<0.5?0:b.n):Math.round(rast(0,b.n));
            if(uc===A.u)uc=A.u<b.n/2?b.n:0;
            A.hedefU=uc;A.durum='yuvarlan';A.acele=false;
          }
          break;
        case 'yuvarlan':
          if(!acik()||!gorunur(A.kenar)){yerDegis();break}
          b=bilgi(A.kenar);A.hedefU=kis(A.hedefU,0,b.n);
          var d=A.hedefU-A.u,ad=GZ.hiz*(A.acele?1.7:1)*dt;
          if(Math.abs(d)<=ad){
            A.u=A.hedefU;A.t=0;
            if(!A.acele&&(A.u===0||A.u===b.n)&&b.n>2)A.durum='kenar';else dinlen(zm);
            A.acele=false;
          }else A.u+=(d>0?1:-1)*ad;
          break;
        case 'dus':
          A.t+=dt;
          var tt=Math.min(A.t,A.sure);
          A.cx=A.fx+A.vx*tt;A.cy=A.fy+A.vy*tt+750*tt*tt;A.cark=A.cark0+A.dCark*(tt/A.sure);A.gor=1;
          if(A.t>=A.sure){A.kenar=A.hedef;A.u=A.hedefU2;A.ezik=1;A.durum='kon';A.t=0}
          break;
        case 'kon':
          A.t+=dt;A.ezik=Math.max(0,1-A.t/0.34);A.ezik*=A.ezik;
          if(A.t>=0.34)dinlen(zm,0.6);
          break;
        case 'gec':
          A.t+=dt;
          if(A.t<0.2)A.gor=Math.min(A.gor,1-A.t/0.2);
          else{
            if(A.kenar!==A.hedef){A.kenar=A.hedef;A.u=A.hedefU2}
            A.gor=Math.min(1,(A.t-0.2)/0.25);
            if(A.t>=0.45)dinlen(zm,0.4);
          }
          break;
      }
      if(A.kenar&&A.durum!=='dus'){
        b=bilgi(A.kenar);var k=konumU(kis(A.u,0,b.n));
        A.cx=b.sol+k.x;A.cy=b.ust-k.lift;A.cark=k.cark;
        if(A.durum!=='gec'&&A.durum!=='bekle')A.gor=1;
      }
      var yuz=null,bk=null,et='';
      if(A.durum==='yuvarlan')bk=[(A.hedefU>A.u?1:-1)*0.8,0.15];
      if(A.durum==='kenar'){
        bk=[(A.u<=0?-1:1)*0.75,1];yuz='merak';
        var a2=A.t>0.35&&alttaki();
        if(a2){var fark=((bilgi(a2).ust-bilgi(A.kenar).ust)/100).toFixed(2);et='Δh '+(ing?fark:fark.replace('.',','))+' m'}
      }
      if(A.durum==='dus'){yuz='saskin';bk=[A.vx>0?0.5:-0.5,0.6]}
      if(A.durum==='kon')yuz='odak';
      if(A.durum==='uyu'){yuz='uyku';et=ing?'Break':'Mola'}
      if(zm<A.saskin)yuz='saskin';
      tut.yuz(yuz);tut.bak(bk);tut.govde(A.cark,A.ezik);
      if(et&&et!==A.etiket){A.etiket=et;yazi.textContent=et}
      yazi.style.opacity=et?'1':'0';
      var sagda=A.cx-window.scrollX>window.innerWidth-200;
      yazi.style.left=sagda?'auto':(GZ.PX+8)+'px';yazi.style.right=sagda?(GZ.PX+8)+'px':'auto';
      kutu.style.opacity=A.gor.toFixed(2);
      kutu.style.transform='translate('+(A.cx-MXP).toFixed(1)+'px,'+(A.cy-MYP).toFixed(1)+'px)';
    }

    var son=simdi(),sayac=0;
    function dongu(){
      requestAnimationFrame(dongu);
      if(document.hidden)return;
      var zm=simdi(),dt=Math.min(0.05,Math.max(0,zm-son));
      sayac++;
      // Ortada yokken (sabit Ata görünüyor, kenar yok) her kare yerine seyrek yoklar.
      if(A.durum==='bekle'&&A.gor<=0.01&&sayac%8)return;
      son=zm;
      if(sayac%40===1)boy();
      adim(zm,dt);
    }
    var goz=new IntersectionObserver(function(k){
      k.forEach(function(g){g.target.ataGorunur=g.isIntersecting});
      sabit=0;[].forEach.call(document.querySelectorAll('svg[data-ata]'),function(s){if(s.ataGorunur)sabit++});
    });
    [].forEach.call(document.querySelectorAll('svg[data-ata]'),function(s){goz.observe(s)});
    boy();dinle();requestAnimationFrame(dongu);
  }

  window.Ata={
    kur:kur,
    yolcu:yolcu,
    gezgin:gezgin,
    ifadeler:Object.keys(IFADE),
    // sure verilirse o kadar saniyelik anlık ifade; verilmezse süresiz (null → kendi hâline döner).
    ifade:function(ad,sure){if(sure)anlikEkle(ad,0,sure);else ruh.kalici=ad&&IFADE[ad]?ad:null},
    bak:function(oge){ruh.hedef=oge||null}
  };
})();
