(function () {
  "use strict";

  var fonds = window.NPD_FONDS || [];
  var wrap = document.getElementById("shelves-wrap");
  var countEl = document.getElementById("fonds-count");
  var emptyEl = document.getElementById("fonds-empty");
  var filterEl = document.getElementById("fonds-filter");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches || /[?&]static\b/.test(location.search);

  if (/[?&]static\b/.test(location.search)) document.documentElement.classList.add("no-motion");

  var state = { sort: "random", query: "", order: [] };

  function normalize(s) {
    return (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function getPerShelf() {
    var w = wrap.clientWidth || window.innerWidth;
    if (w <= 720) return 999;
    // Deixa folga (~260px) para uma caixa abrir sem empurrar a linha
    return Math.max(4, Math.floor((w - 260) / 86));
  }

  function buildBox(f, idx) {
    var li = document.createElement("div");
    var heightClass = idx % 3 === 0 ? "is-tall" : (idx % 3 === 2 ? "is-short" : "");
    li.className = "shelf-box " + heightClass;
    li.dataset.id = f.ref;

    var shortDates = (f.dates || "").split("–")[0].trim();
    var mediaHtml = f.image
      ? '<img alt="' + f.title + '" loading="lazy" src="' + f.image + '">'
      : '<div class="shelf-box__noimg">' + f.ref + '</div>';

    li.innerHTML =
      '<a class="shelf-box__link" href="#" title="' + f.title + '">' +
        '<div class="shelf-box__spine">' +
          '<span class="shelf-box__hole" aria-hidden="true"></span>' +
          '<span class="shelf-box__spine-name">' + f.title + '</span>' +
          '<span class="shelf-box__spine-tag">' + shortDates + '</span>' +
        '</div>' +
        '<div class="shelf-box__panel">' +
          '<figure class="shelf-box__media">' + mediaHtml + '</figure>' +
          '<div>' +
            '<p class="shelf-box__ref">' + f.ref + '</p>' +
            '<h3 class="shelf-box__title">' + f.title + '</h3>' +
            '<dl class="shelf-box__meta">' +
              '<div><dt>Datas</dt><dd>' + f.dates + '</dd></div>' +
              '<div><dt>Séries</dt><dd>' + f.series + '</dd></div>' +
              '<div><dt>Extensão</dt><dd>' + f.extent + '</dd></div>' +
            '</dl>' +
          '</div>' +
        '</div>' +
      '</a>';

    // Em telas touch, primeiro toque abre a caixa; segundo navega
    li.addEventListener("click", function (e) {
      if (window.matchMedia("(hover: none)").matches && !li.classList.contains("is-open")) {
        e.preventDefault();
        wrap.querySelectorAll(".shelf-box.is-open").forEach(function (b) { b.classList.remove("is-open"); });
        li.classList.add("is-open");
      }
    });

    return li;
  }

  function computeOrder() {
    var list = fonds.slice();
    if (state.sort === "alpha") list.sort(function (a, b) { return a.title.localeCompare(b.title, "pt"); });
    else if (state.sort === "date") list.sort(function (a, b) { return a.start - b.start; });
    else list = shuffle(list);
    state.order = list;
  }

  function render() {
    var filtered = state.order.filter(function (f) {
      if (!state.query) return true;
      return normalize(f.title + " " + f.ref + " " + f.dates + " " + f.kind).indexOf(state.query) !== -1;
    });

    wrap.innerHTML = "";
    countEl.textContent = filtered.length + (filtered.length === 1 ? " fundo" : " fundos");
    emptyEl.hidden = filtered.length !== 0;

    var perShelf = getPerShelf();
    for (var i = 0; i < filtered.length; i += perShelf) {
      var shelf = document.createElement("div");
      shelf.className = "shelf";
      filtered.slice(i, i + perShelf).forEach(function (f, j) {
        shelf.appendChild(buildBox(f, i + j));
      });
      wrap.appendChild(shelf);
    }
  }

  /* Controles */
  document.querySelectorAll("[data-sort]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.sort = btn.dataset.sort;
      document.querySelectorAll("[data-sort]").forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      computeOrder();
      render();
    });
  });

  var debounce;
  filterEl.addEventListener("input", function () {
    clearTimeout(debounce);
    debounce = setTimeout(function () {
      state.query = normalize(filterEl.value.trim());
      render();
    }, 120);
  });

  window.addEventListener("resize", function () {
    clearTimeout(debounce);
    debounce = setTimeout(render, 180);
  });

  /* Dropdown + Menu mobile + Modo Noturno */
  var browseBtn = document.querySelector("#browse-menu .nav-link");
  browseBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    browseBtn.setAttribute("aria-expanded", String(browseBtn.getAttribute("aria-expanded") !== "true"));
  });
  document.addEventListener("click", function () { browseBtn.setAttribute("aria-expanded", "false"); });

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

  var themeBtn = document.getElementById("theme-toggle");
  function setTheme(dark) {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    if (themeBtn) themeBtn.textContent = dark ? "Claro" : "Noturno";
    try { localStorage.setItem("npd-theme", dark ? "dark" : "light"); } catch (e) {}
  }
  var urlDark = /[?&]theme=dark\b/.test(location.search);
  var urlLight = /[?&]theme=light\b/.test(location.search);
  var savedTheme = null;
  try { savedTheme = localStorage.getItem("npd-theme"); } catch (e) {}
  setTheme(urlDark ? true : urlLight ? false : (savedTheme ? savedTheme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches));
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      setTheme(document.documentElement.dataset.theme !== "dark");
    });
  }

  /* Init */
  var starts = fonds.map(function (f) { return f.start; });
  var ends = fonds.map(function (f) { return parseInt(f.dates.split("–").pop(), 10); });
  var range = Math.min.apply(null, starts) + "–" + Math.max.apply(null, ends);
  document.getElementById("fonds-range").textContent = range;
  document.getElementById("fact-range").textContent = range;
  document.getElementById("fact-count").textContent = fonds.length;
  document.getElementById("fact-series").textContent = fonds.reduce(function (n, f) { return n + f.series; }, 0);

  computeOrder();
  render();
})();
