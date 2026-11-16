(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Modo Noturno e Logo do NPD em todas as páginas ---------- */
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

  var brand = document.querySelector("#top-bar .navbar-brand");
  if (brand && !brand.querySelector(".npd-logo-light")) {
    var oldImg = brand.querySelector("img");
    if (oldImg) oldImg.remove();
    var lImg = document.createElement("img");
    lImg.src = "/plugins/arNpdFauShelfPlugin/images/logo-npd.png";
    lImg.alt = "NPD · FAU UFRJ";
    lImg.className = "npd-brand-logo npd-logo-light my-1 me-3";
    var dImg = document.createElement("img");
    dImg.src = "/plugins/arNpdFauShelfPlugin/images/logo-npd-dark.png";
    dImg.alt = "NPD · FAU UFRJ";
    dImg.className = "npd-brand-logo npd-logo-dark my-1 me-3";
    brand.insertBefore(dImg, brand.firstChild);
    brand.insertBefore(lImg, brand.firstChild);
  }

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

  var topBar = document.getElementById("top-bar");
  if (topBar) {
    var onScroll = function () { topBar.classList.toggle("is-scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 2. Prateleiras de Caixas-Arquivo na Home ---------- */
  var wrap = document.getElementById("shelves-wrap");
  if (!wrap) return;

  var countEl = document.getElementById("fonds-count");
  var emptyEl = document.getElementById("fonds-empty");
  var filterEl = document.getElementById("fonds-filter");
  var boxes = Array.prototype.slice.call(wrap.querySelectorAll(".shelf-box"));

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
    return Math.max(4, Math.floor((w - 260) / 86));
  }

  var state = { sort: "random", query: "", ordered: boxes.slice() };

  function sortBoxes() {
    var arr = boxes.slice();
    if (state.sort === "alpha") {
      arr.sort(function (a, b) { return (a.dataset.title || "").localeCompare(b.dataset.title || "", "pt"); });
    } else if (state.sort === "date") {
      arr.sort(function (a, b) { return (parseInt(a.dataset.start, 10) || 9999) - (parseInt(b.dataset.start, 10) || 9999); });
    } else {
      arr = shuffle(arr);
    }
    state.ordered = arr;
  }

  function render() {
    var filtered = state.ordered.filter(function (el) {
      if (!state.query) return true;
      var hay = normalize((el.dataset.title || "") + " " + (el.dataset.ref || "") + " " + (el.dataset.dates || ""));
      return hay.indexOf(state.query) !== -1;
    });

    wrap.innerHTML = "";
    if (countEl) countEl.textContent = filtered.length + (filtered.length === 1 ? " fundo" : " fundos");
    if (emptyEl) emptyEl.hidden = filtered.length !== 0;

    var perShelf = getPerShelf();
    for (var i = 0; i < filtered.length; i += perShelf) {
      var shelf = document.createElement("div");
      shelf.className = "shelf";
      filtered.slice(i, i + perShelf).forEach(function (el) { shelf.appendChild(el); });
      wrap.appendChild(shelf);
    }
  }

  boxes.forEach(function (box) {
    box.addEventListener("click", function (e) {
      if (window.matchMedia("(hover: none)").matches && !box.classList.contains("is-open")) {
        e.preventDefault();
        boxes.forEach(function (b) { b.classList.remove("is-open"); });
        box.classList.add("is-open");
      }
    });
  });

  document.querySelectorAll("[data-sort]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.sort = btn.dataset.sort;
      document.querySelectorAll("[data-sort]").forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      sortBoxes();
      render();
    });
  });

  if (filterEl) {
    var debounce;
    filterEl.addEventListener("input", function () {
      clearTimeout(debounce);
      debounce = setTimeout(function () {
        state.query = normalize(filterEl.value.trim());
        render();
      }, 120);
    });
  }

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(render, 180);
  });

  sortBoxes();
  render();
})();
