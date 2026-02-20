/* ══════════════════════════════════════
   AltyapıCode — Product Detail Modal
   "Detaylı İncele" — Pure JS Implementation
   ══════════════════════════════════════ */
(function () {
  'use strict';

  /* ── PRODUCT DATA ── */
  var productData = {
    1: {
      name: 'Altyapı Asistanı',
      description: 'Kanalizasyon, yağmursuyu ve içmesuyu projeleriniz için otomatik hendek kesiti, metraj tablosu ve hacim hesabı.',
      features: [
        'Otomatik hendek kesiti oluşturma',
        'İller Bankası / İSKİ standartlarına uygun metraj',
        'Çoklu boru desteği (HDPE, Korige, Sünek Döküm)',
        'Excel rapor çıktısı',
        'Boyuna profil üzerinde otomatik çizim'
      ],
      categories: [
        {
          name: 'Çizim Sekmesi',
          images: [
            '/images/product-screenshots/cizim-sekmesi-genel.jpg',
            '/images/product-screenshots/cizim-sekmesi-ikazlar.jpg',
            '/images/product-screenshots/yenileme-butonu.jpg'
          ]
        },
        {
          name: 'Kütüphane',
          images: [
            '/images/product-screenshots/borular.jpg',
            '/images/product-screenshots/bacalar.jpg',
            '/images/product-screenshots/parca-ekleme-sekmesi.jpg',
            '/images/product-screenshots/parca-ekleme-2.jpg',
            '/images/product-screenshots/kurum-secim-secenegi.jpg'
          ]
        },
        {
          name: 'Kübaj Hesaplama',
          images: [
            '/images/product-screenshots/yuzey-secim-1.jpg',
            '/images/product-screenshots/yuzey-secim-2.jpg',
            '/images/product-screenshots/kazi-kismi-genel.jpg',
            '/images/product-screenshots/kazi-kismi-ayrintili.jpg',
            '/images/product-screenshots/yataklama-kismi-genel.jpg',
            '/images/product-screenshots/yataklama-kismi-ayrintili.jpg',
            '/images/product-screenshots/havza-1.jpg',
            '/images/product-screenshots/havza-2.jpg',
            '/images/product-screenshots/havza-3.jpg'
          ]
        },
        {
          name: 'Kesitler',
          images: [
            '/images/product-screenshots/en-kesit-1.jpg',
            '/images/product-screenshots/en-kesit-2.jpg',
            '/images/product-screenshots/ekran-goruntusu-kesit.jpg'
          ]
        },
        {
          name: 'Excel Raporları',
          images: [
            '/images/product-screenshots/excel-1.jpg',
            '/images/product-screenshots/excel-2.jpg',
            '/images/product-screenshots/excel-3.jpg',
            '/images/product-screenshots/excel-4.jpg',
            '/images/product-screenshots/excel-5.jpg',
            '/images/product-screenshots/excel-6-1.jpg',
            '/images/product-screenshots/excel-6-2.jpg'
          ]
        },
        {
          name: 'Kayıtlar',
          images: [
            '/images/product-screenshots/kayitlar-borular.jpg',
            '/images/product-screenshots/kayitlar-bacalar.jpg'
          ]
        }
      ]
    },
    2: {
      name: 'İstinat Duvarı Asistanı',
      description: 'Konsol ve ağırlık tipi istinat duvarlarının stabilite kontrolü, kesit çizimi ve metraj hesabı.',
      features: [
        'Devrilme, kayma ve taşıma gücü kontrolü',
        'TBDY-2018 deprem hesabı',
        'Otomatik kesit çizimi',
        'Kazı, beton, dolgu, kalıp metrajı',
        'Rankine & Coulomb toprak basıncı'
      ],
      categories: []
    },
    3: {
      name: 'Özel Eklenti Geliştirme',
      description: 'İhtiyacınıza özel AutoCAD & Civil 3D eklentisi geliştirilmesi. Tekrarlayan işlerinizi otomasyona dönüştürün.',
      features: [
        'İhtiyaç analizi ve tasarım',
        'C# / AutoCAD .NET API ile geliştirme',
        'Test ve kurulum desteği',
        'Belirli standartlara özel çözümler',
        'Eğitim ve dokümantasyon'
      ],
      categories: []
    }
  };

  /* ── STATE ── */
  var state = {
    isOpen: false,
    productId: null,
    activeTab: 'gallery', // 'gallery' | 'features'
    activeCategory: 0,
    currentImageIndex: 0,
    lightboxOpen: false
  };

  /* ── DOM REFERENCES ── */
  var overlay, modal, lightbox;

  /* ── HELPERS ── */
  function currentProduct() {
    return state.productId ? productData[state.productId] : null;
  }
  function currentImages() {
    var p = currentProduct();
    if (!p || !p.categories[state.activeCategory]) return [];
    return p.categories[state.activeCategory].images;
  }

  /* ── BUILD MODAL HTML ── */
  function createModalDOM() {
    // Overlay
    overlay = document.createElement('div');
    overlay.className = 'pm-overlay';
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });

    // Modal container
    modal = document.createElement('div');
    modal.className = 'pm-modal';
    overlay.appendChild(modal);

    // Lightbox
    lightbox = document.createElement('div');
    lightbox.className = 'pm-lightbox';
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox || e.target.classList.contains('pm-lb-close')) {
        closeLightbox();
      }
    });

    document.body.appendChild(overlay);
    document.body.appendChild(lightbox);
  }

  /* ── RENDER ── */
  function render() {
    var p = currentProduct();
    if (!p) return;

    var imgs = currentImages();
    var html = '';

    // Header
    html += '<div class="pm-header">';
    html += '<h2 class="pm-title">' + p.name + '</h2>';
    html += '<button class="pm-close" aria-label="Kapat">&times;</button>';
    html += '</div>';

    // Tabs
    html += '<div class="pm-tabs">';
    html += '<button class="pm-tab' + (state.activeTab === 'gallery' ? ' active' : '') + '" data-tab="gallery">';
    html += '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>';
    html += ' Ekran Görüntüleri</button>';
    html += '<button class="pm-tab' + (state.activeTab === 'features' ? ' active' : '') + '" data-tab="features">';
    html += '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>';
    html += ' Özellikler</button>';
    html += '</div>';

    // Tab content
    html += '<div class="pm-body">';

    if (state.activeTab === 'gallery') {
      // Category buttons
      if (p.categories.length > 1) {
        html += '<div class="pm-categories">';
        p.categories.forEach(function (cat, idx) {
          html += '<button class="pm-cat-btn' + (state.activeCategory === idx ? ' active' : '') + '" data-cat="' + idx + '">' + cat.name + '</button>';
        });
        html += '</div>';
      }

      // Image viewer
      html += '<div class="pm-viewer">';
      if (imgs.length > 0) {
        html += '<div class="pm-main-image" data-action="lightbox">';
        html += '<img src="' + imgs[state.currentImageIndex] + '" alt="' + p.name + ' - ' + p.categories[state.activeCategory].name + '" onerror="this.style.display=\'none\'">';
        html += '</div>';

        // Nav arrows
        if (imgs.length > 1) {
          html += '<button class="pm-nav-btn pm-nav-prev" data-action="prev" aria-label="Önceki">&#8249;</button>';
          html += '<button class="pm-nav-btn pm-nav-next" data-action="next" aria-label="Sonraki">&#8250;</button>';
        }

        // Counter
        html += '<div class="pm-counter">' + (state.currentImageIndex + 1) + ' / ' + imgs.length + '</div>';
      } else {
        html += '<div class="pm-no-image">Bu kategoride görsel bulunmuyor</div>';
      }
      html += '</div>';

      // Thumbnails
      if (imgs.length > 1) {
        html += '<div class="pm-thumbs">';
        imgs.forEach(function (img, idx) {
          html += '<button class="pm-thumb' + (state.currentImageIndex === idx ? ' active' : '') + '" data-thumb="' + idx + '">';
          html += '<img src="' + img + '" alt="Küçük resim ' + (idx + 1) + '" onerror="this.parentElement.style.display=\'none\'">';
          html += '</button>';
        });
        html += '</div>';
      }
    } else {
      // Features tab
      html += '<div class="pm-features-panel">';
      html += '<p class="pm-desc">' + p.description + '</p>';
      html += '<h4 class="pm-features-title">Özellikler:</h4>';
      html += '<ul class="pm-features-list">';
      p.features.forEach(function (f) {
        html += '<li>';
        html += '<span class="pm-check"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg></span>';
        html += '<span>' + f + '</span>';
        html += '</li>';
      });
      html += '</ul>';
      html += '</div>';
    }

    html += '</div>'; // pm-body

    // CTA
    html += '<div class="pm-cta">';
    html += '<a href="/iletisim/" class="pm-cta-primary">Demo Talep Et</a>';
    html += '<a href="/urunler/" class="pm-cta-secondary">Daha Fazla Bilgi</a>';
    html += '</div>';

    modal.innerHTML = html;

    // Attach events
    attachModalEvents();
  }

  /* ── EVENT HANDLERS ── */
  function attachModalEvents() {
    // Close button
    var closeBtn = modal.querySelector('.pm-close');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Tabs
    modal.querySelectorAll('.pm-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.activeTab = this.dataset.tab;
        render();
      });
    });

    // Category buttons
    modal.querySelectorAll('.pm-cat-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.activeCategory = parseInt(this.dataset.cat);
        state.currentImageIndex = 0;
        render();
      });
    });

    // Navigation arrows
    var prevBtn = modal.querySelector('[data-action="prev"]');
    var nextBtn = modal.querySelector('[data-action="next"]');
    if (prevBtn) prevBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var imgs = currentImages();
      state.currentImageIndex = (state.currentImageIndex - 1 + imgs.length) % imgs.length;
      render();
    });
    if (nextBtn) nextBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var imgs = currentImages();
      state.currentImageIndex = (state.currentImageIndex + 1) % imgs.length;
      render();
    });

    // Thumbnails
    modal.querySelectorAll('.pm-thumb').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.currentImageIndex = parseInt(this.dataset.thumb);
        render();
      });
    });

    // Lightbox trigger
    var mainImg = modal.querySelector('[data-action="lightbox"]');
    if (mainImg) mainImg.addEventListener('click', function () {
      var imgs = currentImages();
      if (imgs.length > 0) openLightbox(imgs[state.currentImageIndex]);
    });
  }

  /* ── OPEN / CLOSE ── */
  function openModal(productId) {
    state.isOpen = true;
    state.productId = productId;
    state.activeTab = 'gallery';
    state.activeCategory = 0;
    state.currentImageIndex = 0;
    state.lightboxOpen = false;

    render();
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    state.isOpen = false;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function openLightbox(imageSrc) {
    state.lightboxOpen = true;
    lightbox.innerHTML = '<button class="pm-lb-close" aria-label="Kapat">&times;</button><img src="' + imageSrc + '" alt="Tam ekran görüntü" onclick="event.stopPropagation()">';
    lightbox.classList.add('open');
  }

  function closeLightbox() {
    state.lightboxOpen = false;
    lightbox.classList.remove('open');
    lightbox.innerHTML = '';
  }

  /* ── KEYBOARD ── */
  document.addEventListener('keydown', function (e) {
    if (!state.isOpen) return;

    if (state.lightboxOpen) {
      if (e.key === 'Escape') closeLightbox();
      return;
    }

    if (e.key === 'Escape') {
      closeModal();
    } else if (e.key === 'ArrowLeft') {
      var imgs = currentImages();
      if (imgs.length > 1) {
        state.currentImageIndex = (state.currentImageIndex - 1 + imgs.length) % imgs.length;
        render();
      }
    } else if (e.key === 'ArrowRight') {
      var imgs = currentImages();
      if (imgs.length > 1) {
        state.currentImageIndex = (state.currentImageIndex + 1) % imgs.length;
        render();
      }
    }
  });

  /* ── INIT ── */
  function init() {
    createModalDOM();

    // Attach click handlers to all [data-product-modal] buttons
    document.querySelectorAll('[data-product-modal]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var id = parseInt(this.dataset.productModal);
        if (productData[id]) openModal(id);
      });
    });
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
