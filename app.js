/* Startup Login — app logic */
(function () {
  "use strict";

  var CFG = window.SL_CONFIG || {};
  var ALL = (window.STARTUP_DATA || []).concat(window.VC_DATA || []);
  var bySlug = {};
  ALL.forEach(function (e) { bySlug[e.slug] = e; });

  /* ---------- state ---------- */
  var state = { q: "", type: "", state: "", city: "", stage: "", sector: "", view: "map" };

  /* ---------- els ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var els = {
    search: $("searchInput"), type: $("typeFilter"), state: $("stateFilter"),
    city: $("cityFilter"), stage: $("stageFilter"), sector: $("sectorFilter"),
    mapBtn: $("mapViewBtn"), gridBtn: $("gridViewBtn"), submitBtn: $("submitBtn"),
    map: $("map"), gridRoot: $("gridRoot"), gridCards: $("gridCards"),
    gridEmpty: $("gridEmpty"), count: $("resultsCount"),
    detail: $("detailPanel"), detailBody: $("detailBody"), detailClose: $("detailClose"),
    submitRoot: $("submitRoot"), submitForm: $("submitForm"), submitMsg: $("submitMsg")
  };

  /* ---------- avatar colors ---------- */
  var COLORS = ["#7c5cff", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#ec4899",
    "#8b5cf6", "#06b6d4", "#84cc16", "#f97316", "#6366f1", "#14b8a6", "#e11d48"];
  function colorFor(name) {
    var h = 0;
    for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return COLORS[h % COLORS.length];
  }
  function domainOf(url) {
    try { return new URL(url).hostname.replace(/^www\./, ""); } catch (e) { return ""; }
  }
  function logoHTML(e, cls) {
    var letter = e.name.charAt(0).toUpperCase();
    var avatar = '<div class="avatar" style="background:' + colorFor(e.name) + '">' + letter + "</div>";
    var d = e.website ? domainOf(e.website) : "";
    if (d) {
      return '<img src="https://www.google.com/s2/favicons?domain=' + encodeURIComponent(d) +
        '&sz=128" alt="" loading="lazy" onerror="this.outerHTML=\'' +
        avatar.replace(/"/g, "&quot;") + "'\">";
    }
    return avatar;
  }
  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- filters ---------- */
  function uniqueSorted(field, subset) {
    var m = {};
    (subset || ALL).forEach(function (e) { if (e[field]) m[e[field]] = (m[e[field]] || 0) + 1; });
    return Object.keys(m).sort(function (a, b) { return m[b] - m[a] || a.localeCompare(b); });
  }
  function fillSelect(sel, values, keepValue) {
    var current = keepValue ? sel.value : "";
    while (sel.options.length > 1) sel.remove(1);
    values.forEach(function (v) {
      var o = document.createElement("option");
      o.value = v; o.textContent = v;
      sel.appendChild(o);
    });
    if (current && values.indexOf(current) !== -1) sel.value = current;
  }
  function initFilters() {
    fillSelect(els.state, uniqueSorted("state"));
    fillSelect(els.city, uniqueSorted("city"));
    fillSelect(els.stage, ["Pre-seed", "Seed", "Series A", "Series B", "Series C+", "Bootstrapped", "Public", "Acquired"].filter(function (s) {
      return ALL.some(function (e) { return e.stage === s; });
    }));
    fillSelect(els.sector, uniqueSorted("sector"));
    // submit form helpers
    var dl = $("cityList");
    uniqueSorted("city").forEach(function (c) {
      var o = document.createElement("option"); o.value = c; dl.appendChild(o);
    });
    var secSel = els.submitForm.querySelector('select[name="sector"]');
    uniqueSorted("sector").filter(function (s) { return s !== "Venture Capital" && s !== "Incubator"; })
      .forEach(function (s) {
        var o = document.createElement("option"); o.textContent = s; secSel.appendChild(o);
      });
  }

  function matches(e) {
    if (state.type && e.type !== state.type) return false;
    if (state.state && e.state !== state.state) return false;
    if (state.city && e.city !== state.city) return false;
    if (state.stage && e.stage !== state.stage) return false;
    if (state.sector && e.sector !== state.sector) return false;
    if (state.q) {
      var q = state.q.toLowerCase();
      var hay = (e.name + " " + (e.tagline || "") + " " + (e.sector || "") + " " +
        (e.industry || "") + " " + (e.city || "") + " " + (e.state || "") + " " +
        (e.founders || "")).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  }
  function filtered() { return ALL.filter(matches); }

  /* ---------- map ---------- */
  var map, cluster;
  function initMap() {
    map = L.map("map", { zoomControl: false, attributionControl: true })
      .setView([21.5, 79.5], 5);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer(CFG.tileUrl, { attribution: CFG.tileAttribution, maxZoom: 19, subdomains: "abcd" }).addTo(map);
    if (CFG.tileLabelsUrl) {
      L.tileLayer(CFG.tileLabelsUrl, { maxZoom: 19, subdomains: "abcd", pane: "shadowPane" }).addTo(map);
    }
    cluster = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 46,
      spiderfyOnMaxZoom: true,
      iconCreateFunction: function (c) {
        var n = c.getChildCount();
        var cls = n < 10 ? "" : n < 50 ? " md" : " lg";
        var size = n < 10 ? 34 : n < 50 ? 40 : 48;
        return L.divIcon({
          html: '<div class="cluster' + cls + '" style="width:' + size + "px;height:" + size + 'px">' + n + "</div>",
          className: "", iconSize: [size, size]
        });
      }
    });
    map.addLayer(cluster);
  }
  function renderMap(list) {
    cluster.clearLayers();
    var markers = list.filter(function (e) { return e.lat != null; }).map(function (e) {
      var icon = L.divIcon({
        html: '<div class="pin' + (e.type === "vc" ? " vc-pin" : "") + '" title="' + esc(e.name) + '">' + logoHTML(e) + "</div>",
        className: "", iconSize: [38, 38], iconAnchor: [19, 19]
      });
      var m = L.marker([e.lat, e.lng], { icon: icon, title: e.name });
      m.on("click", function () { openDetail(e.slug); });
      return m;
    });
    cluster.addLayers(markers);
  }

  /* ---------- grid ---------- */
  function renderGrid(list) {
    var html = list.map(function (e) {
      return '<article class="card" data-slug="' + esc(e.slug) + '">' +
        '<div class="card-head">' +
        '<div class="card-logo">' + logoHTML(e) + "</div>" +
        "<div><div class=\"card-title\">" + esc(e.name) + "</div>" +
        '<div class="card-city">' + esc(e.city || "India") + (e.state && e.state !== "India" ? " · " + esc(e.state) : "") + "</div></div>" +
        "</div>" +
        '<p class="card-tagline">' + esc(e.tagline || e.description || "") + "</p>" +
        '<div class="chip-row">' +
        (e.type === "vc" ? '<span class="chip vc">VC</span>' : "") +
        (e.sector ? '<span class="chip">' + esc(e.sector) + "</span>" : "") +
        (e.stage ? '<span class="chip stage">' + esc(e.stage) + "</span>" : "") +
        (e.founded ? '<span class="chip">Est. ' + esc(e.founded) + "</span>" : "") +
        "</div></article>";
    }).join("");
    els.gridCards.innerHTML = html;
    els.gridEmpty.classList.toggle("hidden", list.length > 0);
  }
  els.gridCards && els.gridCards.addEventListener("click", function (ev) {
    var card = ev.target.closest(".card");
    if (card) openDetail(card.getAttribute("data-slug"));
  });

  /* ---------- detail panel ---------- */
  function openDetail(slug) {
    var e = bySlug[slug];
    if (!e) return;
    var meta = "";
    if (e.founders) meta += '<div class="meta-item"><b>Founders</b>' + esc(e.founders) + "</div>";
    if (e.industry && e.industry !== e.sector) meta += '<div class="meta-item"><b>Industry</b>' + esc(e.industry) + "</div>";
    if (e.investors) meta += '<div class="meta-item"><b>Key investors</b>' + esc(e.investors) + "</div>";
    if (e.funding) meta += '<div class="meta-item"><b>Total funding</b>' + esc(e.funding) + "</div>";
    els.detailBody.innerHTML =
      '<div class="detail-head">' +
      '<div class="detail-logo">' + logoHTML(e) + "</div>" +
      "<div><div class=\"detail-name\">" + esc(e.name) + "</div>" +
      '<div class="detail-city">' + esc(e.city || "India") + (e.state && e.state !== "India" ? " · " + esc(e.state) : "") + "</div></div>" +
      "</div>" +
      '<div class="detail-chips">' +
      (e.type === "vc" ? '<span class="chip vc">VC</span>' : "") +
      (e.sector ? '<span class="chip">' + esc(e.sector) + "</span>" : "") +
      (e.stage ? '<span class="chip stage">' + esc(e.stage) + "</span>" : "") +
      (e.founded ? '<span class="chip">Founded ' + esc(e.founded) + "</span>" : "") +
      "</div>" +
      (e.tagline ? '<p class="detail-tagline">' + esc(e.tagline) + "</p>" : "") +
      (e.description ? '<p class="detail-desc">' + esc(e.description) + "</p>" : "") +
      (meta ? '<div class="detail-meta">' + meta + "</div>" : "") +
      (e.website ? '<a class="btn-website" href="' + esc(e.website) + '" target="_blank" rel="noopener">Visit website &nearr;</a>' : "") +
      '<button class="detail-share" id="shareBtn">Copy link</button>';
    els.detail.classList.add("open");
    els.detail.setAttribute("aria-hidden", "false");
    if (location.hash !== "#/startup/" + slug) {
      history.replaceState(null, "", "#/startup/" + slug);
    }
    var share = $("shareBtn");
    share.addEventListener("click", function () {
      var url = location.origin + location.pathname + "#/startup/" + slug;
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject())
        .then(function () { share.textContent = "Link copied ✓"; })
        .catch(function () { share.textContent = url; });
    });
  }
  function closeDetail() {
    els.detail.classList.remove("open");
    els.detail.setAttribute("aria-hidden", "true");
    if (/^#\/startup\//.test(location.hash)) history.replaceState(null, "", "#/");
  }
  els.detailClose.addEventListener("click", closeDetail);
  document.addEventListener("keydown", function (ev) { if (ev.key === "Escape") closeDetail(); });

  /* ---------- views ---------- */
  function setView(v) {
    state.view = v;
    els.mapBtn.classList.toggle("active", v === "map");
    els.gridBtn.classList.toggle("active", v === "grid");
    els.gridRoot.classList.toggle("hidden", v !== "grid");
    if (v === "map") { map.invalidateSize(); }
  }
  function showSubmit(show) {
    els.submitRoot.classList.toggle("hidden", !show);
    if (show && location.hash !== "#/submit") history.replaceState(null, "", "#/submit");
    if (!show && location.hash === "#/submit") history.replaceState(null, "", "#/");
  }

  /* ---------- render ---------- */
  function render() {
    var list = filtered();
    renderMap(list);
    renderGrid(list);
    els.count.innerHTML = "<b>" + list.length + "</b> <span>result" + (list.length === 1 ? "" : "s") + "</span>";
  }

  /* ---------- events ---------- */
  var debounce;
  els.search.addEventListener("input", function () {
    clearTimeout(debounce);
    debounce = setTimeout(function () { state.q = els.search.value.trim(); render(); }, 160);
  });
  [["type", els.type], ["state", els.state], ["city", els.city],
   ["stage", els.stage], ["sector", els.sector]].forEach(function (pair) {
    pair[1].addEventListener("change", function () {
      state[pair[0]] = pair[1].value;
      if (pair[0] === "state") {
        // narrow city list to the chosen state
        var cities = uniqueSorted("city", state.state ? ALL.filter(function (e) { return e.state === state.state; }) : null);
        fillSelect(els.city, cities, true);
        if (cities.indexOf(state.city) === -1) { state.city = ""; els.city.value = ""; }
      }
      render();
      // zoom map to city / state selection
      var target = ALL.filter(matches).filter(function (e) { return e.lat != null; });
      if ((pair[0] === "city" || pair[0] === "state") && pair[1].value && target.length) {
        var b = L.latLngBounds(target.map(function (e) { return [e.lat, e.lng]; }));
        map.fitBounds(b.pad(0.25), { maxZoom: 12 });
      }
    });
  });
  els.mapBtn.addEventListener("click", function () { setView("map"); });
  els.gridBtn.addEventListener("click", function () { setView("grid"); });
  els.submitBtn.addEventListener("click", function () { showSubmit(true); });
  $("backLink").addEventListener("click", function () { showSubmit(false); });
  $("brandLink").addEventListener("click", function () { showSubmit(false); closeDetail(); });
  els.submitRoot.querySelector(".cancel-link").addEventListener("click", function () { showSubmit(false); });

  /* ---------- submit form ---------- */
  els.submitForm.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var f = els.submitForm;
    var data = {
      name: f.name.value.trim(),
      website: f.website.value.trim(),
      tagline: f.tagline.value.trim(),
      city: f.city.value.trim(),
      sector: f.sector.value,
      stage: f.stage.value,
      email: f.email.value.trim(),
      submittedAt: new Date().toISOString()
    };
    var msg = els.submitMsg;
    msg.classList.add("hidden");
    if (!data.name || !data.tagline) {
      msg.textContent = "Please fill in the company name and one-line description.";
      msg.classList.remove("hidden");
      msg.classList.add("err");
      return;
    }
    msg.classList.remove("err");
    function ok() {
      f.reset();
      msg.textContent = "Thanks! " + data.name + " has been submitted. We review every submission before it goes live on the map.";
      msg.classList.remove("hidden");
    }
    if (CFG.formEndpoint) {
      fetch(CFG.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (r.ok) ok();
        else throw new Error("HTTP " + r.status);
      }).catch(function () {
        msg.textContent = "Something went wrong sending your submission. Please try again in a bit.";
        msg.classList.remove("hidden");
        msg.classList.add("err");
      });
    } else {
      try {
        var box = JSON.parse(localStorage.getItem("sl_submissions") || "[]");
        box.push(data);
        localStorage.setItem("sl_submissions", JSON.stringify(box));
      } catch (e) { /* private mode */ }
      ok();
    }
  });

  /* ---------- routing ---------- */
  function route() {
    var h = location.hash || "#/";
    if (h === "#/submit") { showSubmit(true); return; }
    showSubmit(false);
    var m = h.match(/^#\/startup\/([a-z0-9-]+)/);
    if (m && bySlug[m[1]]) openDetail(m[1]);
  }
  window.addEventListener("hashchange", route);

  /* ---------- boot ---------- */
  initFilters();
  initMap();
  render();
  route();
})();
