# AltyapiCode — Hugo + GitHub Pages Kurulum Rehberi

## 🔴 Önce: Domain Al
1. https://dash.cloudflare.com adresine git, hesap aç
2. Sol menüden "Domain Registration" → "Register Domains"
3. `altyapicode.com` ara ve satın al (~$10.44/yıl)
4. DNS ayarını şimdilik bırak, siteyi kurunca bağlayacağız

---

## Adım 1: Hugo Kur (Windows)

### Seçenek A — Winget ile (en kolay)
```powershell
winget install Hugo.Hugo.Extended
```

### Seçenek B — Chocolatey ile
```powershell
choco install hugo-extended
```

### Seçenek C — Manuel
1. https://github.com/gohugoio/hugo/releases adresinden "hugo_extended_0.xxx_windows-amd64.zip" indir
2. Zip'i bir klasöre çıkar (örn: C:\Hugo\bin)
3. Bu klasörü sistem PATH'ine ekle

### Kontrol
```powershell
hugo version
# hugo v0.xxx... extended ... şeklinde çıktı almalısın
```

---

## Adım 2: GitHub Repo Oluştur

1. https://github.com/new adresine git
2. Repository name: `altyapicode.com`
3. Public seç
4. "Add a README file" işaretle
5. Create repository

### Bilgisayarına klonla
```powershell
cd C:\Projeler  # veya istediğin klasör
git clone https://github.com/KULLANICI_ADIN/altyapicode.com.git
cd altyapicode.com
```

---

## Adım 3: Hugo Sitesi Oluştur

```powershell
# Mevcut repo klasöründe Hugo sitesi oluştur
hugo new site . --force
```

Bu komut şu yapıyı oluşturur:
```
altyapicode.com/
├── archetypes/
├── assets/
├── content/         ← İçerikler buraya (Markdown)
├── data/
├── layouts/         ← Özel şablonlar
├── static/          ← Görseller, CSS, JS
├── themes/          ← Tema klasörü
└── hugo.toml        ← Ana ayar dosyası
```

---

## Adım 4: Tema Ekle

Sana en uygun tema: **hugo-blox (eski adı Wowchemy)** veya **PaperMod**.
Minimal ve hızlı başlangıç için PaperMod öneriyorum:

```powershell
git submodule add https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod
```

> NOT: İleride özel tema yazacağız (taslaktaki tasarım gibi). 
> Şimdilik PaperMod ile hızlı başla, sonra custom temaya geçeriz.

---

## Adım 5: hugo.toml Ayarla

Bu klasördeki `hugo.toml` dosyasını, sana verdiğim hazır dosyayla değiştir.

---

## Adım 6: İçerikleri Yerleştir

Bu klasördeki `content/` dizinindeki dosyaları projeye kopyala.

---

## Adım 7: Yerel Test

```powershell
hugo server -D
```

Tarayıcıda http://localhost:1313 adresine git. Siteyi göreceksin.
Değişiklik yaptıkça otomatik yenilenir.

---

## Adım 8: GitHub Pages İçin Dağıtım

### GitHub Actions workflow ekle:
`.github/workflows/hugo.yml` dosyasını bu klasörden kopyala.

### GitHub Ayarları:
1. Repo → Settings → Pages
2. Source: "GitHub Actions" seç
3. Kaydet

### Push et:
```powershell
git add .
git commit -m "İlk kurulum: AltyapiCode sitesi"
git push origin main
```

Birkaç dakika içinde site yayında olacak:
`https://KULLANICI_ADIN.github.io/altyapicode.com/`

---

## Adım 9: Custom Domain Bağla

### GitHub tarafı:
1. Repo → Settings → Pages → Custom domain
2. `altyapicode.com` yaz ve kaydet
3. "Enforce HTTPS" işaretle

### Cloudflare tarafı:
1. Cloudflare Dashboard → DNS
2. Şu kayıtları ekle:

| Tip   | Ad    | Değer                        |
|-------|-------|------------------------------|
| A     | @     | 185.199.108.153              |
| A     | @     | 185.199.109.153              |
| A     | @     | 185.199.110.153              |
| A     | @     | 185.199.111.153              |
| CNAME | www   | KULLANICI_ADIN.github.io     |

3. Cloudflare SSL/TLS → "Full" seç

### CNAME dosyası:
`static/CNAME` dosyası zaten hazır, içinde `altyapicode.com` yazıyor.

---

## Adım 10: Kontrol

5-10 dakika bekle, sonra:
- https://altyapicode.com açılmalı ✓
- https://www.altyapicode.com yönlendirmeli ✓
- HTTPS aktif olmalı ✓

---

## Sonraki Adımlar
- [ ] Ekran görüntüleri ekle (static/images/ klasörüne)
- [ ] Hakkımda sayfasını özelleştir
- [ ] Blog yazıları ekle (SEO için)
- [ ] Google Search Console'a kayıt ol
- [ ] Custom temaya geç (taslaktaki tasarıma uygun)
