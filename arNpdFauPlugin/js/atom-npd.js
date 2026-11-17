(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Modo Noturno em todas as páginas ---------- */
  function setTheme(dark) {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    var btn = document.getElementById("npd-theme-toggle");
    if (btn) {
      btn.setAttribute("aria-label", dark ? "Alternar modo claro" : "Alternar modo noturno");
      btn.setAttribute("title", dark ? "Modo claro" : "Modo noturno");
    }
    try { localStorage.setItem("npd-theme", dark ? "dark" : "light"); } catch (e) {}
  }

  var urlDark = /[?&]theme=dark\b/.test(location.search);
  var urlLight = /[?&]theme=light\b/.test(location.search);
  var savedTheme = null;
  try { savedTheme = localStorage.getItem("npd-theme"); } catch (e) {}
  var initDark = urlDark ? true : urlLight ? false : (savedTheme ? savedTheme === "dark" : true);
  setTheme(initDark);

  var navContainer = document.getElementById("npd-right-nav") || document.querySelector("#top-bar .navbar-nav");
  if (navContainer && !document.getElementById("npd-theme-toggle")) {
    var li = document.createElement("li");
    li.className = "nav-item d-flex align-items-center";
    var btn = document.createElement("button");
    btn.id = "npd-theme-toggle";
    btn.type = "button";
    btn.setAttribute("aria-label", initDark ? "Alternar modo claro" : "Alternar modo noturno");
    btn.setAttribute("title", initDark ? "Modo claro" : "Modo noturno");
    btn.innerHTML =
      '<svg class="icon-moon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>' +
      '<svg class="icon-sun" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77"/></svg>';
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

  /* ---------- 3. Fundos na Home: Prateleira (principal) + Grade (secundária) ---------- */
  var shelfWrap = document.getElementById("shelves-wrap");
  var grid = document.getElementById("fonds-grid");
  if (!shelfWrap || !grid) return;

  var countEl = document.getElementById("fonds-count");
  var emptyEl = document.getElementById("fonds-empty");
  var filterEl = document.getElementById("fonds-filter");

  var boxes = Array.prototype.slice.call(shelfWrap.querySelectorAll(".shelf-box"));
  var cards = Array.prototype.slice.call(grid.querySelectorAll(".fonds-card"));

  function normalize(s) {
    return (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function shuffleIndices(n) {
    var arr = [];
    for (var i = 0; i < n; i++) arr.push(i);
    for (var j = n - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var tmp = arr[j]; arr[j] = arr[k]; arr[k] = tmp;
    }
    return arr;
  }

  function getPerShelf() {
    var w = shelfWrap.clientWidth || window.innerWidth;
    if (w <= 720) return 5;
    // Caixas mais grossas (116px) + folga (~240px) para abrir no hover sem quebrar a linha
    return Math.max(3, Math.floor((w - 240) / 128));
  }

  var state = { sort: "alpha", view: "shelf", query: "", order: [] };

  function computeOrder() {
    var n = boxes.length;
    var indices = [];
    for (var i = 0; i < n; i++) indices.push(i);

    if (state.sort === "date") {
      indices.sort(function (ia, ib) {
        return (parseInt(boxes[ia].dataset.start, 10) || 9999) - (parseInt(boxes[ib].dataset.start, 10) || 9999);
      });
    } else {
      indices.sort(function (ia, ib) {
        return (boxes[ia].dataset.title || "").localeCompare(boxes[ib].dataset.title || "", "pt");
      });
    }
    state.order = indices;
  }

  function matchesEl(el) {
    if (!state.query) return true;
    var hay = normalize((el.dataset.title || "") + " " + (el.dataset.ref || "") + " " + (el.dataset.dates || ""));
    return hay.indexOf(state.query) !== -1;
  }

  function renderShelf() {
    var filtered = [];
    state.order.forEach(function (idx) {
      var box = boxes[idx];
      if (box && matchesEl(box)) filtered.push(box);
    });

    shelfWrap.innerHTML = "";
    var perShelf = getPerShelf();
    for (var i = 0; i < filtered.length; i += perShelf) {
      var shelf = document.createElement("div");
      shelf.className = "shelf";
      filtered.slice(i, i + perShelf).forEach(function (el) { shelf.appendChild(el); });
      shelfWrap.appendChild(shelf);
    }
    return filtered.length;
  }

  function renderGrid(animate) {
    var first = new Map();
    if (animate && !reduceMotion) {
      cards.forEach(function (el) {
        if (!el.hidden) first.set(el, el.getBoundingClientRect());
      });
    }

    var visible = 0;
    state.order.forEach(function (idx) {
      var el = cards[idx];
      if (!el) return;
      var show = matchesEl(el);
      el.hidden = !show;
      el.classList.add("is-visible");
      grid.appendChild(el);
      if (show) visible++;
    });

    if (animate && !reduceMotion) {
      cards.forEach(function (el) {
        if (el.hidden) return;
        var last = el.getBoundingClientRect();
        var prev = first.get(el);
        if (prev) {
          var dx = prev.left - last.left;
          var dy = prev.top - last.top;
          if (dx || dy) {
            el.animate(
              [{ transform: "translate(" + dx + "px," + dy + "px)" }, { transform: "none" }],
              { duration: 500, easing: "cubic-bezier(.2,.7,.2,1)" }
            );
          }
        }
      });
    }
    return visible;
  }

  function render(animate) {
    shelfWrap.hidden = state.view !== "shelf";
    grid.hidden = state.view !== "grid";

    var visible = state.view === "shelf" ? renderShelf() : renderGrid(animate);
    if (countEl) countEl.textContent = visible + (visible === 1 ? " fundo" : " fundos");
    if (emptyEl) emptyEl.hidden = visible !== 0;
  }

  // Em telas touch, primeiro toque abre a caixa na prateleira
  boxes.forEach(function (box) {
    box.addEventListener("click", function (e) {
      if (window.matchMedia("(hover: none)").matches && !box.classList.contains("is-open")) {
        e.preventDefault();
        boxes.forEach(function (b) { b.classList.remove("is-open"); });
        box.classList.add("is-open");
        if (box.scrollIntoView) {
          setTimeout(function () {
            box.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
          }, 120);
        }
      }
    });
  });

  document.querySelectorAll("[data-sort]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.sort = btn.dataset.sort;
      document.querySelectorAll("[data-sort]").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === btn));
      });
      computeOrder();
      render(true);
    });
  });

  document.querySelectorAll("[data-view]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.view = btn.dataset.view;
      document.querySelectorAll("[data-view]").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === btn));
      });
      var go = function () { render(false); };
      if (document.startViewTransition && !reduceMotion) document.startViewTransition(go); else go();
    });
  });

  if (filterEl) {
    var debounce;
    filterEl.addEventListener("input", function () {
      clearTimeout(debounce);
      debounce = setTimeout(function () {
        state.query = normalize(filterEl.value.trim());
        render(true);
      }, 120);
    });
  }

  var resizeTimer;
  window.addEventListener("resize", function () {
    if (state.view !== "shelf") return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { render(false); }, 180);
  });

  computeOrder();
  render(false);
})();
