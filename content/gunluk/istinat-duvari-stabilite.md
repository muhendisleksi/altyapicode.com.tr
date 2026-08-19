---
title: "Stabilite, kesit ve metraj tek panelde"
description: "İstinat duvarı tasarımında hesap, çizim ve metrajın üç ayrı araca dağılması sorununun tek akışta çözülmesi."
ref: "Vaka 02 · İstinat Duvarı Asistanı"
kapak: "/images/kucuk/en-kesit-2.jpg"
weight: 20
---

## Problem

İstinat duvarı tasarımı pratikte üç ayrı yerde yapılıyor: stabilite hesabı bir
hesap tablosunda, kesit çizimi CAD'de, metraj yine ayrı bir tabloda. Üçü arasında
veri elle taşınıyor.

Bunun bilinen sonucu: **bir parametre değişince üçünün de güncellenmesi gerekiyor,**
ve pratikte biri unutuluyor. Duvar yüksekliği revize edildiğinde çizim güncelleniyor
ama metraj eski kalıyor — ya da tersi.

## Yaklaşım

Üç işi tek veri modeline bağladık. Panelde parametreler bir kez giriliyor:
zemin parametreleri, duvar geometrisi, deprem bölgesi katsayıları. Aynı modelden:

- **Stabilite kontrolü** — devrilme, kayma, taşıma gücü
- **Deprem hesabı** — TBDY-2018, Mononobe-Okabe yöntemiyle
- **Toprak basıncı** — Rankine veya Coulomb, seçime göre
- **Kesit çizimi** — plana ve profile
- **Metraj** — kazı, beton, dolgu, kalıp

Parametre değiştiğinde üçü birden yeniden üretiliyor. Ano bazlı çalışıldığı için
duvar boyunca değişen yükseklikler ayrı ayrı hesaplanıp Brückner tablosuna dökülüyor.

{{< sekil src="/images/kucuk/en-kesit-2.jpg" tam="/images/product-screenshots/en-kesit-2.jpg" alt="Ano bazlı en kesit çıktısı" no="1" not="Ano bazlı en kesit — duvar boyunca değişen yükseklikler ayrı hesaplanır" >}}

## Çıktı

- Stabilite raporu — hangi kontrolün hangi güvenlik sayısıyla sağlandığı
- Duvar kesitleri, çizim üzerinde
- Ano bazlı metraj ve hacim cetveli
- Brückner tablosu

## Kazanılan süre

Asıl kazanç sürede değil, **tutarlılıkta.** Revizyon sonrası çizim ile metrajın
birbirini tutmaması, klasik bir hakediş sorunu. Tek modelden üretildiklerinde
bu ihtimal ortadan kalkıyor.

Süre tarafında: bir duvarın parametre girişinden metrajına kadar geçen süre,
elle çalışmaya kıyasla **saatler mertebesinden dakikalar mertebesine** iniyor.

> Not: Bu ürün Altyapı Asistanı'na kıyasla daha yenidir ve sahada daha az
> kullanılmıştır; pilot programın hedeflerinden biri ürünün gerçek projelerde
> denenmesidir.
