/* Şantiye sahnesi: Ata araziyi üçgenler, yolu açar, kübajı çıkarır, altyapıyı döşer, binayı diker, denetler.
   <div data-santiye="oto|kaydir"> içinde <canvas> + <svg data-ata> bekler; sayaç hücreleri [data-a] en yakın
   [data-santiye-kok] içinde aranır. "oto" kendiliğinden döner; "kaydir" [data-santiye-kok]'ün kaydırma
   ilerlemesine bağlıdır ve o kökteki .akis-adim'lerden etkin olanı işaretler.
   Çizilen her şey aynı geometriden gelir: kübaj sayıları ve kesit alanları o yüzeyden hesaplanır.
   #p40 gibi bir çapa bütün sahneleri o yüzdeye sabitler (kare denetimi). */
(function(){
'use strict';
var ING=(document.documentElement.lang||'').slice(0,2)==='en';
var M=ING?{asama:['Terrain · triangulated surface','Alignment · centreline','Corridor · cut and fill','Utilities · pipes and manholes','Building · grading and mass','Compliance check'],
           cetvel:'SECTION AREAS · m²',y:'C ',d:'F ',kat:'floors',akar:'invert ',boru:'Ø300 · 0.6%',calisiyor:'working',taraniyor:'scanning',temiz:'no violations'}
         :{asama:['Arazi · üçgen ağ','Güzergâh · eksen','Koridor · yarma ve dolgu','Altyapı · boru ve baca','Yapı · tesviye ve kütle','Denetim'],
           cetvel:'KÜBAJ CETVELİ · m²',y:'Y ',d:'D ',kat:'kat',akar:'akar ',boru:'Ø300 · %0,6',calisiyor:'çalışıyor',taraniyor:'taranıyor',temiz:'aykırılık yok'};
function ond(v,n){var t=v.toFixed(n);return ING?t:t.replace('.',',')}
var W=640,H=450,R=2,GX=17,GY=11,NX=GX*R+1,NY=GY*R+1,A=20.5,B=11.5,ZS=3.6,OX=258,OY=92,HUCRE=10;
var azHareket=false;try{azHareket=matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}
function kis(v,a,b){return v<a?a:v>b?b:v}
function dil(t,a,b){return kis((t-a)/(b-a),0,1)}
function yum(p){return p*p*(3-2*p)}
function kar(a,b,t){return a+(b-a)*t}
function iz(x,y,z){return [OX+(x-y)*A,OY+(x+y)*B-(z-100)*ZS]}
var SAYI=new Intl.NumberFormat(ING?'en-US':'tr-TR');

/* Arazi ve tasarım: düğüm başına doğal kot, yol kotu ve tesviye kotu bir kez hesaplanır. */
function h0(x,y){return 100+6*Math.sin(x*0.42+0.5)+2*Math.cos(y*0.5+0.3)+0.8*Math.sin(x*0.9+y*0.7)}
function yr(x){return 5.1+1.1*Math.sin(x*0.3)}
function zr(x){return 100.3-0.06*x}
var YARI=1.0,SEV=5;                       // platform yarı genişliği (hücre) · şev: hücre başına 5 m (1:2)
var PAD={x0:11,x1:14,y0:8,y1:10},BINA={x0:11.5,x1:13.5,y0:8.5,y1:9.6,kat:6,katY:3.2};
var D=[],padKot=0,padN=0,i,j;
for(i=0;i<NX;i++){D.push([]);for(j=0;j<NY;j++){
  var wx=i/R,wy=j/R,h=h0(wx,wy),d=Math.abs(wy-yr(wx)),r=zr(wx),zm,tur=0;
  if(d<=YARI){zm=r;tur=1}
  else{var f=(d-YARI)*SEV;zm=h>r?Math.min(h,r+f):Math.max(h,r-f);if(Math.abs(zm-h)>0.05)tur=2}
  var pad=wx>=PAD.x0&&wx<=PAD.x1&&wy>=PAD.y0&&wy<=PAD.y1;
  if(pad){padKot+=h;padN++}
  D[i].push({h:h,zm:zm,tur:tur,pad:pad,z:h,k:0,x:wx,y:wy});
}}
padKot/=padN;
function zmF(x,y){var h=h0(x,y),d=Math.abs(y-yr(x)),r=zr(x);if(d<=YARI)return r;var f=(d-YARI)*SEV;return h>r?Math.min(h,r+f):Math.max(h,r-f)}
// Enkesitler: 20 m'de bir, eksene dik. Alanlar 1 m adımla toplanır (m²).
var KESIT=[1,3,5,7,9,11,13,15].map(function(x){var y,ya=0,da=0,f,a0=yr(x)-YARI,a1=yr(x)+YARI;for(y=yr(x)-3.4;y<=yr(x)+3.4;y+=0.1){f=h0(x,y)-zmF(x,y);if(f>0)ya+=f;else da-=f;if(Math.abs(f)>0.03){a0=Math.min(a0,y);a1=Math.max(a1,y)}}return {x:x,yarma:ya,dolgu:da,y0:a0-0.4,y1:a1+0.4}});
var KESIT_MAX=KESIT.reduce(function(m,k){return Math.max(m,k.yarma,k.dolgu)},1);

var ASAMA=[[0,0,0.14],[1,0.14,0.26],[2,0.26,0.52],[3,0.52,0.66],[4,0.66,0.88],[5,0.88,1]];
var KOTLU=[[2,1],[9,2],[15,8],[5,10]];
var ISIK=(function(){var v=[-0.5,-0.25,0.83],l=Math.hypot(v[0],v[1],v[2]);return [v[0]/l,v[1]/l,v[2]/l]})();
var RENK={dogal:[[30,29,27],[84,79,71]],yarma:[[112,54,18],[240,138,60]],dolgu:[[18,82,68],[60,198,164]],yol:[[30,29,28],[58,56,53]],pad:[[52,49,45],[104,98,89]]};
function ton(c,l){return [kar(c[0][0],c[1][0],l),kar(c[0][1],c[1][1],l),kar(c[0][2],c[1][2],l)]}

function Sahne(kap){
  var cv=kap.querySelector('canvas'),ctx=cv.getContext('2d'),svg=kap.querySelector('.ata'),kok=kap.closest('[data-santiye-kok]')||kap;
  var ata=svg.ataTutamak||null;
  var hucre={},son={},asamaNo=-1,ap=null,yaziPx=11;
  [].forEach.call(kok.querySelectorAll('[data-a]'),function(e){hucre[e.getAttribute('data-a')]=e});
  function yaz(ad,deger){if(son[ad]!==deger&&hucre[ad]){son[ad]=deger;hucre[ad].textContent=deger}}
  function boyut(){
    var en=cv.getBoundingClientRect().width||W,dpr=Math.min(2,window.devicePixelRatio||1);
    yaziPx=Math.round(Math.max(11,9.5*W/en));
    cv.width=Math.round(en*dpr);cv.height=Math.round(en*H/W*dpr);
    ctx.setTransform(cv.width/W,0,0,cv.height/H,0,0);
  }
  function yazi(t,x,y,renk,hiza){
    ctx.font='500 '+yaziPx+'px "IBM Plex Mono",Consolas,monospace';ctx.textAlign=hiza||'left';
    ctx.lineWidth=3;ctx.strokeStyle='rgba(19,18,17,.85)';ctx.strokeText(t,x,y);ctx.fillStyle=renk;ctx.fillText(t,x,y);
  }
  function yuzeyZ(x,y){              // düğümler arasında çift doğrusal
    x*=R;y*=R;var i0=kis(Math.floor(x),0,NX-2),j0=kis(Math.floor(y),0,NY-2),fx=kis(x-i0,0,1),fy=kis(y-j0,0,1);
    return kar(kar(D[i0][j0].z,D[i0+1][j0].z,fx),kar(D[i0][j0+1].z,D[i0+1][j0+1].z,fx),fy);
  }
  function ciz(p,zm){
    var a=[],n;for(n=0;n<6;n++)a.push(dil(p,ASAMA[n][1],ASAMA[n][2]));
    var no=0;for(n=0;n<6;n++)if(p>=ASAMA[n][1])no=n;
    var agD=a[0],eksen=yum(a[1]),on=-2+a[2]*(GX+4),boru=yum(a[3]),tesviye=yum(dil(a[4],0,0.28)),yuksel=dil(a[4],0.3,1),tarama=a[5];
    var yarma=0,dolgu=0,i,j,dg;
    for(i=0;i<NX;i++)for(j=0;j<NY;j++){
      dg=D[i][j];dg.k=yum(kis((on-dg.x)/1.6,0,1));dg.z=kar(dg.h,dg.zm,dg.k);
      if(dg.h>dg.zm)yarma+=dg.k*(dg.h-dg.zm)*HUCRE*HUCRE/(R*R);else dolgu+=dg.k*(dg.zm-dg.h)*HUCRE*HUCRE/(R*R);
      if(dg.pad)dg.z=kar(dg.z,padKot,tesviye);
    }
    var araziA=1-0.55*yum(dil(a[3],0,0.15))*(1-yum(dil(a[4],0,0.25)));
    ctx.clearRect(0,0,W,H);
    ctx.lineJoin='round';ctx.lineCap='round';

    // 1 · ölçüm noktaları: ağ dalgası geçene kadar görünür
    var dalga=-3+yum(dil(agD,0.18,1))*(GX+GY+6),nokta=yum(dil(agD,0,0.2));
    if(agD<1)for(i=0;i<NX;i++)for(j=0;j<NY;j++){
      var g=nokta*(1-kis((dalga-(i+j)/R)/2,0,1));if(g<0.02)continue;
      var q=iz(i/R,j/R,D[i][j].z);ctx.fillStyle='rgba(242,239,234,'+(0.75*g).toFixed(2)+')';ctx.fillRect(q[0]-1,q[1]-1,2,2);
    }
    // üçgenler: uzaktan yakına
    for(var s=0;s<=NX+NY-4;s++)for(i=Math.max(0,s-(NY-2));i<=Math.min(NX-2,s);i++){
      j=s-i;
      var gor=agD>=1?1:yum(kis((dalga-s/R)/2.5,0,1));if(gor<0.01)continue;
      var k=[[D[i][j],i,j],[D[i+1][j],i+1,j],[D[i+1][j+1],i+1,j+1],[D[i][j+1],i,j+1]];
      [[0,1,2],[0,2,3]].forEach(function(u){
        var t=[k[u[0]],k[u[1]],k[u[2]]],e1=[(t[1][1]-t[0][1])*HUCRE/R,(t[1][2]-t[0][2])*HUCRE/R,t[1][0].z-t[0][0].z],e2=[(t[2][1]-t[0][1])*HUCRE/R,(t[2][2]-t[0][2])*HUCRE/R,t[2][0].z-t[0][0].z];
        var nx=e1[1]*e2[2]-e1[2]*e2[1],ny=e1[2]*e2[0]-e1[0]*e2[2],nz=e1[0]*e2[1]-e1[1]*e2[0],nl=Math.hypot(nx,ny,nz)||1;
        if(nz<0){nx=-nx;ny=-ny;nz=-nz}
        var isik=kis(0.12+1.05*((nx*ISIK[0]+ny*ISIK[1]+nz*ISIK[2])/nl-0.55)/0.45,0,1);
        var kk=(t[0][0].k+t[1][0].k+t[2][0].k)/3,yolN=0,padN2=0,fark=0;
        t.forEach(function(v){if(v[0].tur===1)yolN++;if(v[0].pad)padN2++;fark+=(v[0].h-v[0].zm)/3});
        var renk=ton(RENK.dogal,isik),hedef=null;
        // Şev rengi kazı/dolgu derinliğiyle açılır: doğal zemine kavuşma çizgisi testere dişi yerine yumuşak biter.
        if(yolN===3)hedef=ton(RENK.yol,isik);
        else if(Math.abs(fark)>0.02){hedef=ton(fark>0?RENK.yarma:RENK.dolgu,isik);kk*=kis(Math.abs(fark)/0.9,0,1)}
        if(hedef)renk=[kar(renk[0],hedef[0],kk),kar(renk[1],hedef[1],kk),kar(renk[2],hedef[2],kk)];
        if(padN2===3&&tesviye>0){var pr=ton(RENK.pad,isik);renk=[kar(renk[0],pr[0],tesviye),kar(renk[1],pr[1],tesviye),kar(renk[2],pr[2],tesviye)]}
        if(tarama>0&&tarama<1){var tg=Math.max(0,1-Math.abs((i+j)/R-(-2+tarama*(GX+GY+4)))/2.2)*0.75;renk=[kar(renk[0],60,tg),kar(renk[1],198,tg),kar(renk[2],164,tg)]}
        var c='rgb('+Math.round(renk[0])+','+Math.round(renk[1])+','+Math.round(renk[2])+')';
        ctx.globalAlpha=gor*araziA;ctx.beginPath();
        t.forEach(function(v,m){var q=iz(v[1]/R,v[2]/R,v[0].z);if(m)ctx.lineTo(q[0],q[1]);else ctx.moveTo(q[0],q[1])});
        ctx.closePath();ctx.fillStyle=c;ctx.fill();ctx.strokeStyle='rgba(242,239,234,.09)';ctx.lineWidth=0.6;ctx.stroke();
      });
    }
    ctx.globalAlpha=1;
    // tesviye sınırı: bina düzlenmiş parselin üstüne oturur
    if(tesviye>0){ctx.beginPath();[[PAD.x0,PAD.y0],[PAD.x1,PAD.y0],[PAD.x1,PAD.y1],[PAD.x0,PAD.y1]].forEach(function(v,m){var w=iz(v[0],v[1],kar(yuzeyZ(v[0],v[1]),padKot,tesviye)+0.15);if(m)ctx.lineTo(w[0],w[1]);else ctx.moveTo(w[0],w[1])});
      ctx.closePath();ctx.fillStyle='rgba(120,113,102,'+(0.35*tesviye).toFixed(2)+')';ctx.fill();ctx.strokeStyle='rgba(242,239,234,'+(0.7*tesviye).toFixed(2)+')';ctx.lineWidth=1;ctx.setLineDash([5,3]);ctx.stroke();ctx.setLineDash([])}
    // kot etiketleri: ağ kurulurken belirir, güzergâh başlayınca çekilir
    var kotG=yum(dil(agD,0.55,0.8))*(1-yum(dil(a[1],0,0.3)));
    if(kotG>0.02){ctx.globalAlpha=kotG;KOTLU.forEach(function(v){var dk=D[v[0]*R][v[1]*R],q=iz(v[0],v[1],dk.z);
      ctx.beginPath();ctx.moveTo(q[0]-4,q[1]-10);ctx.lineTo(q[0]+4,q[1]-10);ctx.lineTo(q[0],q[1]-2);ctx.closePath();ctx.fillStyle='#131211';ctx.fill();ctx.strokeStyle='#F2EFEA';ctx.lineWidth=1.2;ctx.stroke();
      yazi(ond(dk.h,2),q[0]+8,q[1]-5,'#F2EFEA')});ctx.globalAlpha=1}

    // 2 · eksen
    var uc=eksen*GX,x,q;
    if(eksen>0){
      ctx.beginPath();for(x=0;x<=uc+0.001;x+=0.25){q=iz(x,yr(x),yuzeyZ(x,yr(x))+0.3);if(x)ctx.lineTo(q[0],q[1]);else ctx.moveTo(q[0],q[1])}
      ctx.strokeStyle='#E0412F';ctx.lineWidth=1.8;ctx.setLineDash([9,4,2,4]);ctx.stroke();ctx.setLineDash([]);
      [0,5,10,15].forEach(function(km){if(km>uc)return;var z=yuzeyZ(km,yr(km)),u=iz(km,yr(km)-0.7,z),v=iz(km,yr(km)+0.7,z);
        ctx.beginPath();ctx.moveTo(u[0],u[1]);ctx.lineTo(v[0],v[1]);ctx.strokeStyle='#F2EFEA';ctx.lineWidth=1.2;ctx.stroke();
        yazi('0+'+('00'+km*10).slice(-3),u[0]+5,u[1]-5,'#F2EFEA')});
    }
    // 3 · yol kenar çizgileri (koridorun geçtiği yerde)
    if(a[2]>0)[-0.85,0.85].forEach(function(o){ctx.beginPath();var ilk=true;for(x=0;x<=Math.min(GX,on-0.8);x+=0.25){q=iz(x,yr(x)+o,zr(x)+0.2);if(ilk){ctx.moveTo(q[0],q[1]);ilk=false}else ctx.lineTo(q[0],q[1])}
      ctx.strokeStyle='rgba(242,239,234,.8)';ctx.lineWidth=1.1;ctx.stroke()});

    // 3b · enkesit levhaları: doğal zemin (beyaz) ile proje kotu (kırmızı) arasındaki alan; kübaj bu alanlardan çıkar
    var kesitA=1-0.7*yum(dil(a[3],0,0.2)),yeni=null;
    if(a[2]>0)KESIT.forEach(function(ks){
      var e=yum(dil(on-ks.x,0.2,1.6));if(e<=0)return;
      var y,y0=ks.y0,y1=ks.y1,h,z,u1,u2,v1,v2,oh,oz;
      for(y=y0;y<y1;y+=0.1){
        h=h0(ks.x,y);z=zmF(ks.x,y);var h2=h0(ks.x,y+0.1),z2=zmF(ks.x,y+0.1);
        if(Math.abs(h-z)<0.03&&Math.abs(h2-z2)<0.03)continue;
        u1=iz(ks.x,y,z);u2=iz(ks.x,y+0.1,z2);v1=iz(ks.x,y,kar(z,h,e));v2=iz(ks.x,y+0.1,kar(z2,h2,e));
        ctx.beginPath();ctx.moveTo(u1[0],u1[1]);ctx.lineTo(u2[0]-0.6,u2[1]);ctx.lineTo(v2[0]-0.6,v2[1]);ctx.lineTo(v1[0],v1[1]);ctx.closePath();
        ctx.fillStyle=(h+h2>z+z2?'rgba(240,138,60,':'rgba(60,198,164,')+(0.62*e*kesitA).toFixed(2)+')';ctx.fill();
      }
      ctx.globalAlpha=e*kesitA;
      ctx.beginPath();for(y=y0;y<=y1+0.01;y+=0.1){oh=iz(ks.x,y,kar(zmF(ks.x,y),h0(ks.x,y),e));if(y===y0)ctx.moveTo(oh[0],oh[1]);else ctx.lineTo(oh[0],oh[1])}
      ctx.strokeStyle='#F2EFEA';ctx.lineWidth=1.3;ctx.stroke();
      ctx.beginPath();for(y=y0;y<=y1+0.01;y+=0.1){oz=iz(ks.x,y,zmF(ks.x,y));if(y===y0)ctx.moveTo(oz[0],oz[1]);else ctx.lineTo(oz[0],oz[1])}
      ctx.strokeStyle='#E0412F';ctx.lineWidth=1.3;ctx.stroke();
      ctx.globalAlpha=1;
      yeni=[ks,e];
    });

    // 4 · altyapı ağı: arazi saydamlaşır, ana hat + kollar + baca gövdeleri görünür; hatta akış yürür
    if(a[3]>0){
      var ofs=0.55,anaP=dil(a[3],0,0.6),kolP=yum(dil(a[3],0.6,1));
      function akar(xx){return zr(xx)-2.6}
      function anaN(xx){return [xx,yr(xx)+ofs,akar(xx)]}
      var ana=[];for(x=1;x<=1+anaP*15+0.001;x+=0.5)ana.push(anaN(x));
      var kollar=[[anaN(6),[6.3,yr(6)+3.7,akar(6)+0.7]],[anaN(11),[10.6,yr(11)-3.3,akar(11)+0.7]],[anaN(11),[12.5,8.4,akar(11)+0.6]]];
      function tup(n3,kalin){
        var pp=n3.map(function(v){return iz(v[0],v[1],v[2])});
        function yol(){ctx.beginPath();pp.forEach(function(w,m){if(m)ctx.lineTo(w[0],w[1]);else ctx.moveTo(w[0],w[1])})}
        yol();ctx.strokeStyle='rgba(10,20,28,.9)';ctx.lineWidth=kalin+3;ctx.stroke();
        yol();ctx.strokeStyle='#3F8FC4';ctx.lineWidth=kalin;ctx.stroke();
        yol();ctx.strokeStyle='#BFE3FA';ctx.lineWidth=kalin*0.26;ctx.stroke();
        return pp;
      }
      function akis(pp,ters){
        var uz=[0],m;for(m=1;m<pp.length;m++)uz.push(uz[m-1]+Math.hypot(pp[m][0]-pp[m-1][0],pp[m][1]-pp[m-1][1]));
        var top=uz[uz.length-1];if(top<14)return;
        for(var s0=((zm||0)*24)%22;s0<top;s0+=22){var sd=ters?top-s0:s0;for(m=1;m<pp.length;m++)if(uz[m]>=sd){var f=(sd-uz[m-1])/((uz[m]-uz[m-1])||1);
          ctx.fillStyle='#F2EFEA';ctx.beginPath();ctx.arc(kar(pp[m-1][0],pp[m][0],f),kar(pp[m-1][1],pp[m][1],f),1.6,0,7);ctx.fill();break}}
      }
      function baca(bx,by,ustZ,altZ,ad){
        var u=iz(bx,by,ustZ),al=iz(bx,by,altZ),rx=6.5,ry=3.2;
        ctx.fillStyle='rgba(63,143,196,.3)';ctx.fillRect(u[0]-rx,u[1],rx*2,al[1]-u[1]);
        ctx.strokeStyle='#6FB7E8';ctx.lineWidth=1.2;
        ctx.beginPath();ctx.moveTo(u[0]-rx,u[1]);ctx.lineTo(al[0]-rx,al[1]);ctx.moveTo(u[0]+rx,u[1]);ctx.lineTo(al[0]+rx,al[1]);ctx.stroke();
        ctx.beginPath();ctx.ellipse(al[0],al[1],rx,ry,0,0,Math.PI);ctx.stroke();
        ctx.beginPath();ctx.ellipse(u[0],u[1],rx,ry,0,0,7);ctx.fillStyle='#131211';ctx.fill();ctx.lineWidth=1.6;ctx.stroke();
        if(ad)yazi(ad,u[0],u[1]-8,'#BFE3FA','center');
      }
      var kolPP=[];
      if(kolP>0)kollar.forEach(function(kl){var b0=kl[0],b1=kl[1],uc3=[kar(b0[0],b1[0],kolP),kar(b0[1],b1[1],kolP),kar(b0[2],b1[2],kolP)];kolPP.push(tup([b0,uc3],3))});
      var anaPP=tup(ana,4.6);
      if(!azHareket){akis(anaPP,false);kolPP.forEach(function(pp){akis(pp,true)})}
      if(kolP>0.92)kollar.forEach(function(kl){var b1=kl[1];baca(b1[0],b1[1],yuzeyZ(b1[0],b1[1])+0.2,b1[2])});
      [1,6,11,16].forEach(function(bx,m){if(bx>1+anaP*15+0.01)return;baca(bx,yr(bx)+ofs,zr(bx)+0.2,akar(bx),'B'+(m+1))});
      if(anaP>0.3){q=iz(3.5,yr(3.5)+ofs,akar(3.5));ctx.globalAlpha=yum(dil(anaP,0.3,0.5));yazi(M.boru,q[0]-10,q[1]+22,'#BFE3FA','right');ctx.globalAlpha=1}
      if(anaP>=1){q=iz(16,yr(16)+ofs,akar(16));ctx.globalAlpha=yum(dil(a[3],0.6,0.75));yazi(M.akar+ond(akar(16),2),q[0]+12,q[1]+6,'#BFE3FA');ctx.globalAlpha=1}
    }
    // 5 · bina: kat kat yükselen kütle (izleyene bakan iki yüz + çatı)
    var binaUst=null;
    if(yuksel>0){
      var kat=yuksel*BINA.kat,yk=kat*BINA.katY,b=BINA,z0=padKot,z1=padKot+yk;
      function yuz(kose,renk){ctx.beginPath();kose.forEach(function(v,m){var w=iz(v[0],v[1],v[2]);if(m)ctx.lineTo(w[0],w[1]);else ctx.moveTo(w[0],w[1])});ctx.closePath();ctx.fillStyle=renk;ctx.fill();ctx.strokeStyle='#F2EFEA';ctx.lineWidth=1.1;ctx.stroke()}
      yuz([[b.x0,b.y1,z0],[b.x1,b.y1,z0],[b.x1,b.y1,z1],[b.x0,b.y1,z1]],'#3A3733');
      yuz([[b.x1,b.y0,z0],[b.x1,b.y1,z0],[b.x1,b.y1,z1],[b.x1,b.y0,z1]],'#57534D');
      yuz([[b.x0,b.y0,z1],[b.x1,b.y0,z1],[b.x1,b.y1,z1],[b.x0,b.y1,z1]],'#8C867C');
      ctx.strokeStyle='rgba(242,239,234,.45)';ctx.lineWidth=0.8;
      for(var kn=1;kn<kat;kn++){var zk=z0+kn*BINA.katY,p1=iz(b.x0,b.y1,zk),p2=iz(b.x1,b.y1,zk),p3=iz(b.x1,b.y0,zk);ctx.beginPath();ctx.moveTo(p1[0],p1[1]);ctx.lineTo(p2[0],p2[1]);ctx.lineTo(p3[0],p3[1]);ctx.stroke()}
      binaUst=iz((b.x0+b.x1)/2,(b.y0+b.y1)/2,z1);
      if(yuksel>0.15){var kn2=Math.max(1,Math.round(kat)),ky=kn2*BINA.katY;q=iz(b.x0,b.y0,z1);yazi(kn2+' '+M.kat+' · '+ond(ky,1)+' m',q[0],q[1]-8,'#F2EFEA','center')}
    }

    // Kübaj cetveli: kesit başına yarma (yukarı) ve dolgu (aşağı) alanı
    if(a[2]>0){
      var cx0=448,cy0=76,cg=13,ca=6,cm=30;
      ctx.globalAlpha=yum(dil(a[2],0,0.08));
      yazi(M.cetvel,cx0,cy0-cm-10,'#B3ADA3');
      ctx.strokeStyle='rgba(242,239,234,.5)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(cx0,cy0+0.5);ctx.lineTo(cx0+KESIT.length*(cg+ca)-ca,cy0+0.5);ctx.stroke();
      KESIT.forEach(function(ks,m){var e=yum(dil(on-ks.x,0.2,1.6)),bx=cx0+m*(cg+ca),yb=cm*ks.yarma/KESIT_MAX*e,db=cm*ks.dolgu/KESIT_MAX*e;
        ctx.fillStyle='rgba(242,239,234,.12)';ctx.fillRect(bx,cy0-cm,cg,cm*2);
        ctx.fillStyle='#F08A3C';ctx.fillRect(bx,cy0-yb,cg,yb);ctx.fillStyle='#3CC6A4';ctx.fillRect(bx,cy0,cg,db)});
      if(yeni&&a[2]<1){var yk0=yeni[0];ctx.globalAlpha=1;
        yazi('0+'+('00'+yk0.x*10).slice(-3),cx0,cy0+cm+17,'#F2EFEA');
        yazi(M.y+ond(yk0.yarma,1)+' m²',cx0+42,cy0+cm+17,'#F08A3C');
        yazi(M.d+ond(yk0.dolgu,1)+' m²',cx0+112,cy0+cm+17,'#3CC6A4')}
      ctx.globalAlpha=1;
    }

    // Ata'nın iş noktası
    var hedef;
    if(no===0){var dx=kis(dalga/2,0,GX),dy=kis(dalga/2,0,GY);hedef=iz(dx,dy,yuzeyZ(dx,dy))}
    else if(no===1)hedef=iz(uc,yr(uc),yuzeyZ(uc,yr(uc)));
    else if(no===2){var ox=kis(on,0,GX);hedef=iz(ox,yr(ox),yuzeyZ(ox,yr(ox)))}
    else if(no===3){var px=1+dil(a[3],0,0.6)*15;hedef=iz(px,yr(px)+0.55,zr(px))}
    else if(no===4)hedef=binaUst||iz(12.5,9,padKot);
    else hedef=iz(8.5,5.5,116);
    var havada=no===5?0:66,yer=[kis(hedef[0],44,W-44),Math.max(46,hedef[1]-havada)];
    if(!ap)ap=yer.slice();else{ap[0]+=(yer[0]-ap[0])*0.16;ap[1]+=(yer[1]-ap[1])*0.16}
    if(no<5){
      ctx.beginPath();ctx.moveTo(ap[0],ap[1]+26);ctx.lineTo(hedef[0],hedef[1]);ctx.strokeStyle='rgba(242,239,234,.75)';ctx.lineWidth=1;ctx.setLineDash([3,3]);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle='#F2EFEA';ctx.fillRect(hedef[0]-2.5,hedef[1]-2.5,5,5);
    }
    var en=svg.getBoundingClientRect().width,olc=(cv.getBoundingClientRect().width||W)/W;
    svg.style.transform='translate('+(ap[0]*olc-en/2).toFixed(1)+'px,'+(ap[1]*olc-en/2).toFixed(1)+'px)';

    if(no!==asamaNo){asamaNo=no;if(ata)ata.durum(no===5?'gecti':'calisiyor',no===5?1.4:0,no===5?'bakiyor':null)}
    yaz('is',M.asama[no]);
    yaz('yarma',SAYI.format(Math.round(yarma/10)*10)+' m³');
    yaz('dolgu',SAYI.format(Math.round(dolgu/10)*10)+' m³');
    yaz('durum',no===5?(tarama>0.85?M.temiz:M.taraniyor):M.calisiyor);
  }
  boyut();
  return {ciz:ciz,boyut:boyut,kap:kap,kok:kok,gorunur:true};
}

var IS=22,BEKLE=4,t0=performance.now();
var sahneler=[].map.call(document.querySelectorAll('[data-santiye]'),function(kap){
  var s=Sahne(kap);s.kip=kap.getAttribute('data-santiye');s.son=-1;
  s.adimlar=[].slice.call(s.kok.querySelectorAll('.akis-adim'));
  kap.classList.add('canli');s.kok.classList.add('canli');
  return s;
});
if(!sahneler.length)return;
if('IntersectionObserver' in window){
  var goz=new IntersectionObserver(function(k){k.forEach(function(g){sahneler.forEach(function(s){if(s.kap===g.target)s.gorunur=g.isIntersecting})})},{rootMargin:'80px'});
  sahneler.forEach(function(s){goz.observe(s.kap)});
}
// Sahnedeki aşama, ekranın %45 çizgisindeki adımla aynıdır; adımın içindeki yol o aşamanın ilerlemesidir.
function ilerleme(s){
  if(!s.adimlar.length)return 0;
  var orta=window.innerHeight*(window.innerWidth<=860?0.72:0.45),i,r; // dar ekranda sahne üstte yapışık durur, metin onun altından okunur
  for(i=0;i<s.adimlar.length&&i<6;i++){r=s.adimlar[i].getBoundingClientRect();
    if(orta<r.top)return i?ASAMA[i][1]:0;
    if(orta<r.bottom)return ASAMA[i][1]+(ASAMA[i][2]-ASAMA[i][1])*kis((orta-r.top)/Math.max(1,r.height),0,0.999)}
  return 1;
}
function kare(){
  var zmn=performance.now()/1000,t=(zmn-t0/1000)%(IS+BEKLE);
  var sabit=/^#p(\d+)$/.exec(location.hash),sp=sabit?Math.min(1,sabit[1]/100):-1;
  sahneler.forEach(function(s){
    if(!s.gorunur&&sp<0&&!azHareket)return;
    var p=sp>=0?sp:azHareket?1:s.kip==='kaydir'?ilerleme(s):Math.min(1,t/IS);
    s.ciz(p,zmn);
    if(!s.adimlar.length)return;
    var no=0;for(var n=0;n<6;n++)if(p>=ASAMA[n][1])no=n;
    if(no!==s.son){s.son=no;s.adimlar.forEach(function(e,m){e.classList.toggle('etkin',azHareket||m===no)})}
  });
  if(!azHareket&&!document.hidden)requestAnimationFrame(kare);
}
window.addEventListener('resize',function(){sahneler.forEach(function(s){s.boyut()});if(azHareket)kare()});
document.addEventListener('visibilitychange',function(){if(!document.hidden&&!azHareket)requestAnimationFrame(kare)});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){if(azHareket)kare()});
kare();
})();
