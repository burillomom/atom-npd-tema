(function () {
  "use strict";

  var fonds = window.NPD_FONDS || [];
  var grid = document.getElementById("fonds-grid");
  var countEl = document.getElementById("fonds-count");
  var emptyEl = document.getElementById("fonds-empty");
  var filterEl = document.getElementById("fonds-filter");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches || /[?&]static\b/.test(location.search);

  if (/[?&]static\b/.test(location.search)) document.documentElement.classList.add("no-motion");

  var state = { sort: "random", query: "", order: [] };
  var nodes = new Map();

  /* ---------- utilidades ---------- */
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }
  function normalize(s) {
    return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  /* ---------- arte gerada (substitui a miniatura quando não há objeto digital) ----------
     Proporções variadas, como as miniaturas reais do AtoM, em tons de cinza. */
  var ratios = [[4, 3], [3, 4], [1, 1], [3, 2], [4, 5], [16, 10], [2, 3]];
  function art(seed) {
    var r = rng(seed), rt = ratios[seed % ratios.length];
    var W = 400, H = Math.round(W * rt[1] / rt[0]), s = [], f = function (n) { return n.toFixed(1); };
    var type = seed % 3;
    var light = 200 + Math.floor(r() * 30), mid = 120 + Math.floor(r() * 50);
    var g = function (v) { return "rgb(" + v + "," + v + "," + v + ")"; };
    s.push('<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + g(light) + '"/><stop offset="1" stop-color="' + g(mid) + '"/></linearGradient></defs>');

    if (type === 0) { // edifício sobre pilotis, foto
      var hz = H * (0.62 + r() * 0.12);
      s.push('<rect width="100%" height="100%" fill="url(#g)"/>');
      s.push('<rect y="' + f(hz) + '" width="100%" height="' + f(H - hz) + '" fill="' + g(mid - 40) + '"/>');
      var bx = W * (0.05 + r() * 0.15), bw = W * (0.7 + r() * 0.2), bt = H * (0.18 + r() * 0.2), pil = (hz - bt) * 0.28;
      s.push('<rect x="' + f(bx) + '" y="' + f(bt) + '" width="' + f(bw) + '" height="' + f(hz - bt - pil) + '" fill="' + g(235) + '"/>');
      var n = 10 + Math.floor(r() * 14);
      for (var i = 0; i < n; i++) s.push('<rect x="' + f(bx + i * bw / n + 2) + '" y="' + f(bt + 4) + '" width="' + f(bw / n - 4) + '" height="' + f(hz - bt - pil - 8) + '" fill="' + g(60) + '" fill-opacity=".55"/>');
      s.push('<rect x="' + f(bx) + '" y="' + f(hz - pil) + '" width="' + f(bw) + '" height="' + f(pil) + '" fill="' + g(40) + '" fill-opacity=".85"/>');
      for (var k = 0; k <= 5; k++) s.push('<rect x="' + f(bx + k * (bw - 8) / 5) + '" y="' + f(hz - pil) + '" width="8" height="' + f(pil) + '" fill="' + g(220) + '"/>');
    } else if (type === 1) { // desenho técnico sobre papel
      s.push('<rect width="100%" height="100%" fill="' + g(244) + '"/>');
      var m = W * 0.1, ox = m + r() * m, oy = m + r() * m, w = W - 2 * m - r() * m, h = H - 2 * m - r() * m;
      s.push('<rect x="' + f(ox) + '" y="' + f(oy) + '" width="' + f(w) + '" height="' + f(h) + '" fill="none" stroke="#222" stroke-width="4"/>');
      for (var j = 0; j < 5; j++) {
        var vx = ox + r() * w, vy = oy + r() * h;
        if (j % 2) s.push('<line x1="' + f(vx) + '" y1="' + f(oy) + '" x2="' + f(vx) + '" y2="' + f(oy + h * (0.3 + r() * 0.7)) + '" stroke="#222" stroke-width="2"/>');
        else s.push('<line x1="' + f(ox) + '" y1="' + f(vy) + '" x2="' + f(ox + w * (0.3 + r() * 0.7)) + '" y2="' + f(vy) + '" stroke="#222" stroke-width="2"/>');
      }
      s.push('<path d="M' + f(ox + w * 0.4) + ' ' + f(oy + h) + ' a' + f(w * .12) + ' ' + f(w * .12) + ' 0 0 1 ' + f(w * .12) + ' -' + f(w * .12) + '" fill="none" stroke="#222" stroke-width="1"/>');
      s.push('<line x1="' + f(ox) + '" y1="' + f(oy + h + 18) + '" x2="' + f(ox + w) + '" y2="' + f(oy + h + 18) + '" stroke="#555" stroke-width="1"/>');
    } else { // fachada com brise-soleil, recorte
      s.push('<rect width="100%" height="100%" fill="url(#g)"/>');
      var cols = 6 + Math.floor(r() * 10), step = W / cols;
      for (var c = 0; c < cols; c++) s.push('<rect x="' + f(c * step) + '" y="0" width="' + f(step * (0.25 + r() * 0.2)) + '" height="' + H + '" fill="' + g(30 + Math.floor(r() * 30)) + '"/>');
      var rows = 3 + Math.floor(r() * 4);
      for (var q = 1; q < rows; q++) s.push('<rect x="0" y="' + f(q * H / rows - 3) + '" width="100%" height="6" fill="' + g(230) + '" fill-opacity=".9"/>');
      s.push('<rect width="100%" height="100%" fill="url(#g)" fill-opacity=".35"/>');
    }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">' + s.join("") + "</svg>";
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  /* ---------- render ---------- */
  function createCard(f) {
    var li = document.createElement("li");
    li.className = "fonds-card";
    li.dataset.id = f.ref;
    li.innerHTML =
      '<a class="fonds-card__link" href="#" title="' + f.title + ' (' + f.ref + ')">' +
        '<figure class="fonds-card__media"><img alt="' + f.title + '" loading="lazy" src="' + (f.image || art(hash(f.ref))) + '"></figure>' +
        '<p class="fonds-card__title"><span>' + f.title + '</span></p>' +
        '<p class="fonds-card__sub">' + f.dates.replace(/\s*–\s*/, "–") + ' · ' + f.series + ' séries</p>' +
        '<span class="fonds-card__cell muted-cell">' + f.ref + '</span>' +
        '<span class="fonds-card__cell c-dates">' + f.dates.replace(/\s*–\s*/, "–") + '</span>' +
        '<span class="fonds-card__cell">' + f.series + '</span>' +
        '<span class="fonds-card__cell muted-cell">' + f.extent + '</span>' +
      '</a>';
    return li;
  }

  fonds.forEach(function (f) { nodes.set(f.ref, createCard(f)); });

  function computeOrder() {
    var list = fonds.slice();
    if (state.sort === "alpha") list.sort(function (a, b) { return a.title.localeCompare(b.title, "pt"); });
    else if (state.sort === "date") list.sort(function (a, b) { return a.start - b.start; });
    else list = shuffle(list);
    state.order = list.map(function (f) { return f.ref; });
  }

  function matches(f) {
    if (!state.query) return true;
    return normalize(f.title + " " + f.ref + " " + f.dates + " " + f.kind).indexOf(state.query) !== -1;
  }

  /* FLIP: anima cada cartão da posição antiga para a nova */
  function apply(animate) {
    var first = new Map();
    if (animate && !reduceMotion) nodes.forEach(function (el, id) {
      if (!el.hidden && el.isConnected) first.set(id, el.getBoundingClientRect());
    });

    var visible = 0;
    state.order.forEach(function (id) {
      var f = fonds.find(function (x) { return x.ref === id; });
      var el = nodes.get(id);
      var show = matches(f);
      el.hidden = !show;
      grid.appendChild(el);
      if (show) visible++;
    });

    countEl.textContent = visible + (visible === 1 ? " fundo" : " fundos");
    emptyEl.hidden = visible !== 0;

    if (!animate || reduceMotion) return;
    var i = 0;
    nodes.forEach(function (el, id) {
      if (el.hidden) return;
      var last = el.getBoundingClientRect();
      var prev = first.get(id);
      if (prev) {
        var dx = prev.left - last.left, dy = prev.top - last.top;
        if (dx || dy) el.animate(
          [{ transform: "translate(" + dx + "px," + dy + "px)" }, { transform: "none" }],
          { duration: 520, easing: "cubic-bezier(.2,.7,.2,1)" }
        );
      } else {
        el.animate(
          [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }],
          { duration: 420, delay: (i++ % 6) * 40, easing: "cubic-bezier(.2,.7,.2,1)", fill: "backwards" }
        );
      }
    });
  }

  /* Entrada escalonada ao rolar */
  function setupReveal() {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      nodes.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var batch = 0, timer;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.style.transitionDelay = (Math.min(batch++, 8) * 60) + "ms";
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
        clearTimeout(timer);
        timer = setTimeout(function () { batch = 0; }, 120);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    nodes.forEach(function (el) {
      grid.classList.add("reveal");
      io.observe(el);
      el.addEventListener("transitionend", function clear(ev) {
        if (ev.propertyName === "opacity") { el.style.transitionDelay = ""; el.removeEventListener("transitionend", clear); }
      });
    });
  }

  /* ---------- controles ---------- */
  document.querySelectorAll("[data-sort]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      // "Aleatória" pode ser clicada de novo para reembaralhar
      state.sort = btn.dataset.sort;
      document.querySelectorAll("[data-sort]").forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      computeOrder();
      apply(true);
    });
  });

  document.querySelectorAll("[data-view]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var list = btn.dataset.view === "list";
      document.querySelectorAll("[data-view]").forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      var go = function () { grid.classList.toggle("is-list", list); document.getElementById("fonds").classList.toggle("is-list-mode", list); };
      if (document.startViewTransition && !reduceMotion) document.startViewTransition(go); else go();
    });
  });

  var debounce;
  filterEl.addEventListener("input", function () {
    clearTimeout(debounce);
    debounce = setTimeout(function () { state.query = normalize(filterEl.value.trim()); apply(true); }, 120);
  });

  /* dropdown "Navegar" */
  var browseBtn = document.querySelector("#browse-menu .nav-link");
  browseBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    var open = browseBtn.getAttribute("aria-expanded") === "true";
    browseBtn.setAttribute("aria-expanded", String(!open));
  });
  document.addEventListener("click", function () { browseBtn.setAttribute("aria-expanded", "false"); });

  /* ---------- init ---------- */
  var fondsRangeEl = document.getElementById("fonds-range");
  var factRangeEl = document.getElementById("fact-range");
  var factCountEl = document.getElementById("fact-count");
  var factSeriesEl = document.getElementById("fact-series");
  if (fondsRangeEl || factRangeEl) {
    var starts = fonds.map(function (f) { return f.start; });
    var ends = fonds.map(function (f) { return parseInt(f.dates.split("–").pop(), 10); });
    var range = Math.min.apply(null, starts) + "–" + Math.max.apply(null, ends);
    if (fondsRangeEl) fondsRangeEl.textContent = range;
    if (factRangeEl) factRangeEl.textContent = range;
  }
  if (factCountEl) factCountEl.textContent = fonds.length;
  if (factSeriesEl) factSeriesEl.textContent = fonds.reduce(function (n, f) { return n + f.series; }, 0);

  /* top bar: linha fina ao rolar + menu compacto em telas menores */
  var topBar = document.getElementById("top-bar");
  var onScroll = function () { topBar.classList.toggle("is-scrolled", window.scrollY > 8); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  var menuBtn = document.getElementById("menu-toggle");
  menuBtn.addEventListener("click", function () {
    var open = !topBar.classList.contains("menu-open");
    topBar.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.textContent = open ? "Fechar" : "Menu";
  });

  /* modo claro (padrão) / modo noturno */
  var themeBtn = document.getElementById("theme-toggle");
  function setTheme(dark) {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    if (themeBtn) {
      themeBtn.setAttribute("aria-label", dark ? "Alternar modo claro" : "Alternar modo noturno");
      themeBtn.setAttribute("title", dark ? "Modo claro" : "Modo noturno");
    }
    try {
      localStorage.removeItem("npd-theme");
      localStorage.setItem("npd-theme-mode", dark ? "dark" : "light");
    } catch (e) {}
  }
  var urlDark = /[?&]theme=dark\b/.test(location.search);
  var urlLight = /[?&]theme=light\b/.test(location.search);
  var savedTheme = null;
  try { savedTheme = localStorage.getItem("npd-theme-mode"); } catch (e) {}
  var initDark = urlDark ? true : urlLight ? false : (savedTheme ? savedTheme === "dark" : false);
  setTheme(initDark);
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      setTheme(document.documentElement.dataset.theme !== "dark");
    });
  }

  computeOrder();
  apply(false);
  setupReveal();
})();
