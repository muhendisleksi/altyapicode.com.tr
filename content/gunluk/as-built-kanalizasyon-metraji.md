---
title: "610 bacalı as-built şebekede metraj"
description: "İçe aktarılmış as-built veriyle gelen bir kanalizasyon şebekesinde tüm hendek kesitleri, hacimler ve metraj tablosu tek işlemde üretildi."
ref: "Vaka 01 · Altyapı Asistanı"
kapak: "/images/kucuk/excel-3.jpg"
weight: 10
---

## Problem

As-built veriden içe aktarılmış bir kanalizasyon şebekesi: **610 baca**, aralarında
farklı çaplarda ve malzemelerde hatlar, birbirini kesen hendekler. Metrajın elle
çıkarılması demek, her hat için ayrı kesit çizmek, kesişimlerde çift sayımı elle
ayıklamak ve sonucu İller Bankası formatına elle dökmek demekti.

Bu tür bir şebekede elle çalışmanın iki maliyeti var: **süre** ve **kesişimlerde
gözden kaçan çift sayım.** İkincisi daha pahalı, çünkü hakediş aşamasında çıkıyor.

## Yaklaşım

Şebeke Altyapı Asistanı'na yüklendi. Eklenti:

1. Her hattın boyuna profilini ve baca kotlarını okudu
2. Kurum standardına göre tip hendek kesitini her istasyonda oluşturdu
3. Kesişen hendekleri tespit edip birleştirdi — kesişim hacmi bir kez sayıldı
4. Kazı, dolgu, yataklama ve beton gömlekleme hacimlerini ayrı ayrı hesapladı
5. Sonucu İller Bankası formatında Excel metraj tablosuna yazdı

{{< sekil src="/images/kucuk/kayitlar-bacalar.jpg" tam="/images/product-screenshots/kayitlar-bacalar.jpg" alt="Baca kayıtları tablosu" no="1" not="Şebekedeki bacalar, kotlarıyla birlikte kayıt tablosunda" >}}

## Çıktı

- Tüm hatlar için hendek kesitleri, çizim üzerinde
- Kazı / dolgu / yataklama / gömlekleme hacim cetveli
- İller Bankası formatında Excel metraj tablosu
- Boyuna profil üzerinde otomatik anotasyon

{{< sekil src="/images/kucuk/excel-3.jpg" tam="/images/product-screenshots/excel-3.jpg" alt="İller Bankası formatında Excel metraj tablosu" no="2" not="Üretilen metraj tablosu — doğrudan idareye teslim edilen format" >}}

## Kazanılan süre

Aynı işin elle yapımı, kesişim ayıklaması ve format dökümü dahil **yaklaşık üç
iş günü** sürüyordu. Eklentiyle hesaplama dakikalar içinde tamamlandı; kalan iş,
çıktının gözle doğrulanması oldu.

> Not: Bu süre kendi proje deneyimimize dayanmaktadır; pilot firmalarda ölçülen
> süreler bu sayfaya eklenecektir.

## Teknik bulgu

610 bacalı dosya, geliştirme sırasında kilitli katman kaynaklı bir hata ortaya
çıkardı: yeniden oluşturma akışı, model uzayındaki her nesneyi yazma modunda
açıyordu ve as-built veriyle gelen nesnelerden biri kilitli bir katmandaydı.
Akış, yalnızca kendi ürettiği nesneleri yazma modunda açacak şekilde
değiştirildi; bu değişiklik hem hatayı giderdi hem de işlemi hızlandırdı.
