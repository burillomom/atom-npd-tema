(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Modo Noturno em todas as páginas ---------- */
  function setTheme(dark) {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    var btn = document.getElementById("npd-theme-toggle");
    if (btn) btn.textContent = dark ? "Claro" : "Noturno";
    try { localStorage.setItem("npd-theme", dark ? "dark" : "light"); } catch (e) {}
  }

  var urlDark = /[?&]theme=dark\b/.test(location.search);
  var urlLight = /[?&]theme=light\b/.test(location.search);
  var savedTheme = null;
  try { savedTheme = localStorage.getItem("npd-theme"); } catch (e) {}
  var initDark = urlDark ? true : urlLight ? false : (savedTheme ? savedTheme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches);
  setTheme(initDark);

  // Substitui a logo padrão do AtoM pela logo do NPD (versão clara + noturna)
  var brand = document.querySelector("#top-bar .navbar-brand");
  if (brand && !brand.querySelector(".npd-logo-light")) {
    var oldImg = brand.querySelector("img");
    if (oldImg) oldImg.remove();
    var lImg = document.createElement("img");
    lImg.src = "/plugins/arNpdFauPlugin/images/logo-npd.png";
    lImg.alt = "NPD · FAU UFRJ";
    lImg.className = "npd-brand-logo npd-logo-light my-1 me-3";
    var dImg = document.createElement("img");
    dImg.src = "/plugins/arNpdFauPlugin/images/logo-npd-dark.png";
    dImg.alt = "NPD · FAU UFRJ";
    dImg.className = "npd-brand-logo npd-logo-dark my-1 me-3";
    brand.insertBefore(dImg, brand.firstChild);
    brand.insertBefore(lImg, brand.firstChild);
  }

  // Insere o botão discretamente na barra nativa do AtoM (#top-bar)
  var navContainer = document.querySelector("#top-bar .navbar-nav");
  if (navContainer && !document.getElementById("npd-theme-toggle")) {
    var li = document.createElement("li");
    li.className = "nav-item d-flex align-items-center";
    var btn = document.createElement("button");
    btn.id = "npd-theme-toggle";
    btn.type = "button";
    btn.setAttribute("aria-label", "Alternar modo noturno");
    btn.textContent = initDark ? "Claro" : "Noturno";
    btn.addEventListener("click", function () {
      setTheme(document.documentElement.dataset.theme !== "dark");
    });
    li.appendChild(btn);
    navContainer.appendChild(li);
  }

  /* ---------- 2. Linha discreta no topo ao rolar ---------- */
  var topBar = document.getElementById("top-bar");
  if (topBar) {
    var onScroll = function () { topBar.classList.toggle("is-scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 3. Grade de Fundos na página inicial ---------- */
  var grid = document.getElementById("fonds-grid");
  if (!grid) return;

  var countEl = document.getElementById("fonds-count");
  var emptyEl = document.getElementById("fonds-empty");
  var filterEl = document.getElementById("fonds-filter");
  var cards = Array.prototype.slice.call(grid.querySelectorAll(".fonds-card"));

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

  var state = { sort: "random", query: "" };

  function apply(animate) {
    var first = new Map();
    if (animate && !reduceMotion) {
      cards.forEach(function (el) {
        if (!el.hidden) first.set(el, el.getBoundingClientRect());
      });
    }

    var ordered = cards.slice();
    if (state.sort === "alpha") {
      ordered.sort(function (a, b) {
        return (a.dataset.title || "").localeCompare(b.dataset.title || "", "pt");
      });
    } else if (state.sort === "date") {
      ordered.sort(function (a, b) {
        return (parseInt(a.dataset.start, 10) || 9999) - (parseInt(b.dataset.start, 10) || 9999);
      });
    } else {
      ordered = shuffle(ordered);
    }

    var visible = 0;
    ordered.forEach(function (el) {
      var hay = normalize((el.dataset.title || "") + " " + (el.dataset.ref || "") + " " + (el.dataset.dates || ""));
      var show = !state.query || hay.indexOf(state.query) !== -1;
      el.hidden = !show;
      grid.appendChild(el);
      if (show) visible++;
    });

    if (countEl) countEl.textContent = visible + (visible === 1 ? " fundo" : " fundos");
    if (emptyEl) emptyEl.hidden = visible !== 0;

    if (!animate || reduceMotion) return;
    ordered.forEach(function (el) {
      if (el.hidden) return;
      var last = el.getBoundingClientRect();
      var prev = first.get(el);
      if (prev) {
        var dx = prev.left - last.left;
        var dy = prev.top - last.top;
        if (dx || dy) {
          el.animate(
            [{ transform: "translate(" + dx + "px," + dy + "px)" }, { transform: "none" }],
            { duration: 520, easing: "cubic-bezier(.2,.7,.2,1)" }
          );
        }
      }
    });
  }

  // Reveal escalonado ao rolar
  if (!reduceMotion && "IntersectionObserver" in window) {
    grid.classList.add("reveal");
    var batch = 0, timer;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.style.transitionDelay = (Math.min(batch++, 8) * 55) + "ms";
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
        clearTimeout(timer);
        timer = setTimeout(function () { batch = 0; }, 120);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.1 });
    cards.forEach(function (el) { io.observe(el); });
  } else {
    cards.forEach(function (el) { el.classList.add("is-visible"); });
  }

  document.querySelectorAll("[data-sort]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.sort = btn.dataset.sort;
      document.querySelectorAll("[data-sort]").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === btn));
      });
      apply(true);
    });
  });

  document.querySelectorAll("[data-view]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var list = btn.dataset.view === "list";
      document.querySelectorAll("[data-view]").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === btn));
      });
      var go = function () {
        grid.classList.toggle("is-list", list);
        var section = document.getElementById("fonds");
        if (section) section.classList.toggle("is-list-mode", list);
      };
      if (document.startViewTransition && !reduceMotion) document.startViewTransition(go); else go();
    });
  });

  if (filterEl) {
    var debounce;
    filterEl.addEventListener("input", function () {
      clearTimeout(debounce);
      debounce = setTimeout(function () {
        state.query = normalize(filterEl.value.trim());
        apply(true);
      }, 120);
    });
  }

  apply(false);
})();
