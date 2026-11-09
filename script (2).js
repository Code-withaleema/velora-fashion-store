/* ==========================================================
   VELORA – Modern Fashion Store · script.js
   Vanilla JS: products, filters, wishlist, cart, newsletter
   ========================================================== */
(function () {
  'use strict';

  /* ---------- Config ---------- */
  var FREE_SHIPPING_AT = 200;
  var SHIPPING_FEE = 12;
  var CART_KEY = 'velora_cart_v1';
  var WISH_KEY = 'velora_wishlist_v1';

  var IMG = function (id, w) {
    return 'https://images.unsplash.com/photo-' + id + '?auto=format&fit=crop&w=' + (w || 700) + '&q=70';
  };

  /* ---------- Product data ---------- */
  var PRODUCTS = [
    { id: 1,  name: 'Linen Wrap Dress',           category: 'Women',       price: 128, oldPrice: 160, collection: 'best', img: '1496747611176-843222e1e57c', img2: '1572804013309-59a88b7e92f1' },
    { id: 2,  name: 'Tailored Wool Blazer',       category: 'Men',         price: 215,                 collection: 'best', img: '1507679799987-c73779587ccf', img2: '1617137968427-85924c800a22' },
    { id: 3,  name: 'Leather Tote Bag',           category: 'Accessories', price: 189,                 collection: 'best', img: '1584917865442-de89df76afd3', img2: '1548036328-c9fa89d128fa' },
    { id: 4,  name: 'Essential Cotton Tee',       category: 'Men',         price: 42,                  collection: 'best', img: '1576566588028-4147f3842f27', img2: '1503342217505-b0a15ec3261c' },
    { id: 5,  name: 'Silk Midi Skirt',            category: 'Women',       price: 96,  oldPrice: 120, collection: 'best', img: '1595777457583-95e059d581b8', img2: '1539109136881-3be0616acf4b' },
    { id: 6,  name: 'Minimal Leather Sneakers',   category: 'Men',         price: 145,                 collection: 'best', img: '1542291026-7eec264c27ff',   img2: '1552374196-1ab2a1c593e8' },
    { id: 7,  name: 'Classic Steel Watch',        category: 'Accessories', price: 230,                 collection: 'best', img: '1524592094714-0f0654e20314', img2: '1523779105320-d1cd346ff52b' },
    { id: 8,  name: 'Oversized Knit Cardigan',    category: 'Women',       price: 118,                 collection: 'best', img: '1434389677669-e08b4cac3105', img2: '1483985988355-763728e1935b' },
    { id: 9,  name: 'Structured Trench Coat',     category: 'Women',       price: 260,                 collection: 'new',  img: '1551028719-00167b16eac5',   img2: '1591047139829-d91aecb6caea' },
    { id: 10, name: 'Relaxed Linen Shirt',        category: 'Men',         price: 84,                  collection: 'new',  img: '1594938298603-c8148c4dae35', img2: '1617137968427-85924c800a22' },
    { id: 11, name: 'Canvas Weekender Bag',       category: 'Accessories', price: 135,                 collection: 'new',  img: '1553062407-98eeb64c6a62',   img2: '1584917865442-de89df76afd3' },
    { id: 12, name: 'Pleated Wide-Leg Trousers',  category: 'Women',       price: 110,                 collection: 'new',  img: '1509631179647-0177331693ae', img2: '1490481651871-ab68de25d43d' }
  ];

  /* ---------- Helpers ---------- */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var money = function (n) { return '$' + n.toFixed(2); };
  var byId = function (id) {
    for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i];
    return null;
  };

  function load(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
  }

  /* ---------- State ---------- */
  var cart = sanitizeCart(load(CART_KEY, []));   // [{id, qty}]
  var wishlist = load(WISH_KEY, []).filter(function (id) { return !!byId(id); });
  var state = { filter: 'All', query: '', sort: 'featured' };

  function sanitizeCart(raw) {
    if (!Array.isArray(raw)) return [];
    return raw.filter(function (it) {
      return it && byId(it.id) && Number.isInteger(it.qty) && it.qty > 0;
    }).map(function (it) { return { id: it.id, qty: Math.min(it.qty, 99) }; });
  }

  /* ---------- Elements ---------- */
  var els = {
    grid: $('#productGrid'),
    newGrid: $('#newGrid'),
    empty: $('#emptyState'),
    note: $('#resultNote'),
    search: $('#searchInput'),
    sort: $('#sortSelect'),
    chips: $$('.chip'),
    cartCount: $('#cartCount'),
    wishCount: $('#wishCount'),
    drawer: $('#cartDrawer'),
    overlay: $('#overlay'),
    cartItems: $('#cartItems'),
    cartFoot: $('#cartFoot'),
    drawerCount: $('#drawerCount'),
    subtotal: $('#subtotal'),
    shipping: $('#shipping'),
    total: $('#total'),
    shipNote: $('#shipNote'),
    toast: $('#toast'),
    menuToggle: $('#menuToggle'),
    nav: $('#primaryNav')
  };

  /* ---------- Image fallback (no broken images) ---------- */
  function fallbackSrc(label) {
    var text = String(label || 'VELORA').replace(/[<>&"']/g, '');
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">' +
      '<rect width="800" height="1000" fill="#e7dfd3"/>' +
      '<text x="400" y="500" text-anchor="middle" font-family="Georgia,serif" font-size="46" letter-spacing="10" fill="#7d7061">' + text.toUpperCase() + '</text>' +
      '</svg>';
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  }
  document.addEventListener('error', function (e) {
    var img = e.target;
    if (!img || img.tagName !== 'IMG' || img.dataset.failed) return;
    img.dataset.failed = '1';
    img.src = fallbackSrc(img.dataset.fallback || img.alt);
  }, true);

  /* ---------- Toast ---------- */
  var toastTimer;
  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { els.toast.classList.remove('show'); }, 2600);
  }

  /* ---------- Product card markup ---------- */
  var HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-9-9.1C1.8 7.8 3.6 5 6.6 5c1.9 0 3.4 1 5.4 3 2-2 3.5-3 5.4-3 3 0 4.8 2.8 3.6 5.9C19 15.6 12 20 12 20z"/></svg>';

  function cardHTML(p) {
    var onSale = !!p.oldPrice;
    var saved = wishlist.indexOf(p.id) !== -1;
    var badge = onSale
      ? '<span class="sale-badge">Sale</span>'
      : (p.collection === 'new' ? '<span class="sale-badge new-badge">New</span>' : '');
    var priceHTML = onSale
      ? '<span class="now-sale">' + money(p.price) + '</span><s>' + money(p.oldPrice) + '</s>'
      : money(p.price);

    return '' +
      '<article class="product-card" data-id="' + p.id + '">' +
        '<div class="media">' +
          badge +
          '<button class="wish-btn" data-action="wish" data-id="' + p.id + '" aria-pressed="' + saved + '" aria-label="' + (saved ? 'Remove ' : 'Save ') + p.name + (saved ? ' from' : ' to') + ' wishlist">' + HEART + '</button>' +
          '<img src="' + IMG(p.img) + '" alt="' + p.name + '" loading="lazy" width="700" height="875" data-fallback="' + p.name + '">' +
          '<img class="img-hover" src="' + IMG(p.img2) + '" alt="" loading="lazy" width="700" height="875" aria-hidden="true" data-fallback="' + p.name + '">' +
          '<button class="quick-add" data-action="add" data-id="' + p.id + '" aria-label="Add ' + p.name + ' to bag">Quick Add</button>' +
        '</div>' +
        '<div class="info">' +
          '<span class="cat">' + p.category + '</span>' +
          '<h3>' + p.name + '</h3>' +
          '<p class="price">' + priceHTML + '</p>' +
        '</div>' +
      '</article>';
  }

  /* ---------- Rendering: shop grid with filters ---------- */
  function getVisibleProducts() {
    var q = state.query.trim().toLowerCase();
    var list = PRODUCTS.filter(function (p) {
      if (p.collection !== 'best') return false;
      if (state.filter === 'Saved') { if (wishlist.indexOf(p.id) === -1) return false; }
      else if (state.filter !== 'All' && p.category !== state.filter) return false;
      if (q && (p.name + ' ' + p.category).toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
    if (state.sort === 'low') list.sort(function (a, b) { return a.price - b.price; });
    if (state.sort === 'high') list.sort(function (a, b) { return b.price - a.price; });
    return list;
  }

  function renderShop() {
    var list = getVisibleProducts();
    els.grid.innerHTML = list.map(cardHTML).join('');
    els.empty.hidden = list.length > 0;
    els.grid.hidden = list.length === 0;

    var label = state.filter === 'All' ? 'all pieces' : (state.filter === 'Saved' ? 'saved pieces' : state.filter.toLowerCase());
    els.note.textContent = 'Showing ' + list.length + ' ' + (list.length === 1 ? 'piece' : 'pieces') +
      ' — ' + label + (state.query.trim() ? ' matching “' + state.query.trim() + '”' : '');

    els.chips.forEach(function (c) {
      var active = c.dataset.filter === state.filter;
      c.classList.toggle('is-active', active);
      c.setAttribute('aria-pressed', String(active));
    });
  }

  function renderNew() {
    els.newGrid.innerHTML = PRODUCTS.filter(function (p) { return p.collection === 'new'; }).map(cardHTML).join('');
  }

  function refreshCards() { renderShop(); renderNew(); }

  /* ---------- Filters ---------- */
  function setFilter(name) {
    state.filter = name;
    renderShop();
  }

  els.chips.forEach(function (chip) {
    chip.addEventListener('click', function () { setFilter(chip.dataset.filter); });
  });
  els.search.addEventListener('input', function () { state.query = els.search.value; renderShop(); });
  els.sort.addEventListener('change', function () { state.sort = els.sort.value; renderShop(); });
  $('#resetFilters').addEventListener('click', function () {
    state.filter = 'All'; state.query = ''; state.sort = 'featured';
    els.search.value = ''; els.sort.value = 'featured';
    renderShop();
  });

  // Links that jump to the shop with a category preselected
  $$('[data-filter-link]').forEach(function (a) {
    a.addEventListener('click', function () {
      state.query = ''; els.search.value = '';
      setFilter(a.dataset.filterLink);
      closeMenu();
    });
  });
  // Nav "Women" / "Men"
  $$('[data-nav="Women"], [data-nav="Men"]').forEach(function (a) {
    a.addEventListener('click', function () {
      state.query = ''; els.search.value = '';
      setFilter(a.dataset.nav);
    });
  });

  // Nav search icon -> scroll to shop and focus search
  $('#searchBtn').addEventListener('click', function () {
    $('#shop').scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(function () { els.search.focus({ preventScroll: true }); }, 450);
  });
  // Nav wishlist icon -> show saved items
  $('#wishlistBtn').addEventListener('click', function () {
    state.query = ''; els.search.value = '';
    setFilter('Saved');
    $('#shop').scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (!wishlist.length) toast('Your wishlist is empty — tap the heart on any piece.');
  });

  /* ---------- Wishlist ---------- */
  function toggleWish(id) {
    var idx = wishlist.indexOf(id);
    var p = byId(id);
    if (idx === -1) { wishlist.push(id); toast('Saved “' + p.name + '” to your wishlist'); }
    else { wishlist.splice(idx, 1); toast('Removed from your wishlist'); }
    save(WISH_KEY, wishlist);
    updateWishCount();
    refreshCards();
  }
  function updateWishCount() { els.wishCount.textContent = wishlist.length; bump(els.wishCount); }

  function bump(el) {
    el.classList.add('bump');
    setTimeout(function () { el.classList.remove('bump'); }, 220);
  }

  /* ---------- Cart ---------- */
  function cartQty() { return cart.reduce(function (n, it) { return n + it.qty; }, 0); }
  function cartSubtotal() {
    return cart.reduce(function (sum, it) { return sum + byId(it.id).price * it.qty; }, 0);
  }
  function findItem(id) {
    for (var i = 0; i < cart.length; i++) if (cart[i].id === id) return cart[i];
    return null;
  }
  function persistCart() { save(CART_KEY, cart); }

  function addToCart(id) {
    var item = findItem(id);
    if (item) item.qty = Math.min(item.qty + 1, 99);
    else cart.push({ id: id, qty: 1 });
    persistCart();
    renderCart();
    bump(els.cartCount);
    toast('Added “' + byId(id).name + '” to your bag');
  }
  function changeQty(id, delta) {
    var item = findItem(id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) return removeFromCart(id);
    item.qty = Math.min(item.qty, 99);
    persistCart();
    renderCart();
  }
  function removeFromCart(id) {
    cart = cart.filter(function (it) { return it.id !== id; });
    persistCart();
    renderCart();
  }

  function renderCart() {
    var qty = cartQty();
    els.cartCount.textContent = qty;
    els.drawerCount.textContent = qty ? '(' + qty + (qty === 1 ? ' item)' : ' items)') : '';

    if (!cart.length) {
      els.cartItems.innerHTML =
        '<div class="cart-empty">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 016 0v2"/></svg>' +
          '<h3>Your bag is empty</h3>' +
          '<p>Discover pieces made to last.</p>' +
          '<button class="btn btn-outline" data-action="continue">Continue shopping</button>' +
        '</div>';
      els.cartFoot.hidden = true;
      return;
    }

    els.cartFoot.hidden = false;
    els.cartItems.innerHTML = cart.map(function (it) {
      var p = byId(it.id);
      return '' +
        '<div class="cart-item" data-id="' + p.id + '">' +
          '<img src="' + IMG(p.img, 240) + '" alt="' + p.name + '" width="84" height="105" data-fallback="' + p.name + '">' +
          '<div>' +
            '<div class="ci-top">' +
              '<div><p class="ci-name">' + p.name + '</p><p class="ci-cat">' + p.category + '</p></div>' +
              '<button class="ci-remove" data-action="remove" data-id="' + p.id + '" aria-label="Remove ' + p.name + ' from bag">Remove</button>' +
            '</div>' +
            '<div class="ci-bottom">' +
              '<div class="qty" role="group" aria-label="Quantity for ' + p.name + '">' +
                '<button data-action="dec" data-id="' + p.id + '" aria-label="Decrease quantity">&minus;</button>' +
                '<span aria-live="polite">' + it.qty + '</span>' +
                '<button data-action="inc" data-id="' + p.id + '" aria-label="Increase quantity">+</button>' +
              '</div>' +
              '<span class="ci-price">' + money(p.price * it.qty) + '</span>' +
            '</div>' +
          '</div>' +
        '</div>';
    }).join('');

    var sub = cartSubtotal();
    var ship = sub >= FREE_SHIPPING_AT ? 0 : SHIPPING_FEE;
    els.subtotal.textContent = money(sub);
    els.shipping.textContent = ship === 0 ? 'Free' : money(ship);
    els.total.textContent = money(sub + ship);
    els.shipNote.textContent = ship === 0
      ? 'You’ve unlocked free shipping.'
      : 'Add ' + money(FREE_SHIPPING_AT - sub) + ' more for free shipping.';
  }

  /* ---------- Drawer open / close ---------- */
  var lastFocus = null;
  function openCart() {
    lastFocus = document.activeElement;
    els.overlay.hidden = false;
    requestAnimationFrame(function () { els.overlay.classList.add('is-open'); });
    els.drawer.classList.add('is-open');
    els.drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    setTimeout(function () { els.drawer.focus(); }, 50);
  }
  function closeCart() {
    els.drawer.classList.remove('is-open');
    els.drawer.setAttribute('aria-hidden', 'true');
    els.overlay.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    setTimeout(function () { els.overlay.hidden = true; }, 350);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function isCartOpen() { return els.drawer.classList.contains('is-open'); }

  $('#cartBtn').addEventListener('click', openCart);
  $('#closeCart').addEventListener('click', closeCart);
  els.overlay.addEventListener('click', function () { closeCart(); closeMenu(); });

  $('#clearCart').addEventListener('click', function () {
    cart = []; persistCart(); renderCart(); toast('Your bag has been cleared');
  });
  $('#checkoutBtn').addEventListener('click', function () {
    toast('Demo store — checkout is not enabled.');
  });

  /* ---------- Delegated clicks (cards + cart) ---------- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var id = parseInt(btn.dataset.id, 10);
    switch (btn.dataset.action) {
      case 'add':    addToCart(id); break;
      case 'wish':   toggleWish(id); break;
      case 'inc':    changeQty(id, 1); break;
      case 'dec':    changeQty(id, -1); break;
      case 'remove': removeFromCart(id); break;
      case 'continue':
        closeCart();
        $('#shop').scrollIntoView({ behavior: 'smooth' });
        break;
    }
  });

  // Keep focus inside the open drawer
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (isCartOpen()) closeCart();
      if (els.nav.classList.contains('is-open')) closeMenu();
      return;
    }
    if (e.key === 'Tab' && isCartOpen()) {
      var f = $$('button, [href], input, [tabindex]:not([tabindex="-1"])', els.drawer)
        .filter(function (n) { return !n.disabled && n.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === els.drawer)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Mobile menu ---------- */
  function openMenu() {
    els.nav.classList.add('is-open');
    els.menuToggle.setAttribute('aria-expanded', 'true');
    els.menuToggle.setAttribute('aria-label', 'Close menu');
    els.overlay.hidden = false;
    requestAnimationFrame(function () { els.overlay.classList.add('is-open'); });
    document.body.classList.add('no-scroll');
  }
  function closeMenu() {
    if (!els.nav.classList.contains('is-open')) return;
    els.nav.classList.remove('is-open');
    els.menuToggle.setAttribute('aria-expanded', 'false');
    els.menuToggle.setAttribute('aria-label', 'Open menu');
    if (!isCartOpen()) {
      els.overlay.classList.remove('is-open');
      document.body.classList.remove('no-scroll');
      setTimeout(function () { if (!isCartOpen()) els.overlay.hidden = true; }, 350);
    }
  }
  els.menuToggle.addEventListener('click', function () {
    els.nav.classList.contains('is-open') ? closeMenu() : openMenu();
  });
  $$('.primary-nav a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  window.addEventListener('resize', function () { if (window.innerWidth > 860) closeMenu(); });

  /* ---------- Active nav link on scroll ---------- */
  var sections = [
    { id: 'home', key: 'home' },
    { id: 'new-arrivals', key: 'new' },
    { id: 'collections', key: 'collections' }
  ];
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var sec = sections.filter(function (s) { return s.id === en.target.id; })[0];
        $$('.primary-nav a').forEach(function (a) { a.classList.toggle('is-current', a.dataset.nav === sec.key); });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { var n = document.getElementById(s.id); if (n) io.observe(n); });
  }

  /* ---------- Placeholder footer links (demo) ---------- */
  $$('[data-demo-link]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); toast('Demo link — this page is not part of the prototype.'); });
  });

  /* ---------- Newsletter ---------- */
  var form = $('#newsletterForm');
  var nlEmail = $('#nlEmail');
  var nlMsg = $('#nlMsg');
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var value = nlEmail.value.trim();
    nlMsg.className = 'nl-msg';
    if (!value) {
      nlEmail.setAttribute('aria-invalid', 'true');
      nlMsg.classList.add('error');
      nlMsg.textContent = 'Please enter your email address.';
      return nlEmail.focus();
    }
    if (!EMAIL_RE.test(value)) {
      nlEmail.setAttribute('aria-invalid', 'true');
      nlMsg.classList.add('error');
      nlMsg.textContent = 'That doesn’t look like a valid email address.';
      return nlEmail.focus();
    }
    nlEmail.removeAttribute('aria-invalid');
    nlMsg.classList.add('success');
    nlMsg.textContent = 'Thank you — demo signup complete. (No email was actually sent.)';
    form.reset();
  });
  nlEmail.addEventListener('input', function () {
    if (nlEmail.getAttribute('aria-invalid')) {
      nlEmail.removeAttribute('aria-invalid');
      nlMsg.textContent = '';
      nlMsg.className = 'nl-msg';
    }
  });

  // Cross-tab sync of cart & wishlist
  window.addEventListener('storage', function (e) {
    if (e.key === CART_KEY) { cart = sanitizeCart(load(CART_KEY, [])); renderCart(); }
    if (e.key === WISH_KEY) { wishlist = load(WISH_KEY, []).filter(function (id) { return !!byId(id); }); updateWishCount(); refreshCards(); }
  });

  /* ---------- Init ---------- */
  els.wishCount.textContent = wishlist.length;
  renderShop();
  renderNew();
  renderCart();
})();
