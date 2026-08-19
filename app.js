/* Startup Login — registry app */
(function () {
  "use strict";

  var CFG = window.SL_CONFIG || {};
  var ALL = (window.STARTUP_DATA || []).concat(window.VC_DATA || []);
  var bySlug = {};
  ALL.forEach(function (e) { bySlug[e.slug] = e; });

  var CITY_CODES = {
    Bengaluru: "BLR", Hyderabad: "HYD", Mumbai: "BOM", Pune: "PNQ", Delhi: "DEL",
    Gurugram: "GGN", Noida: "NOI", Chennai: "MAA", Jaipur: "JAI", Ahmedabad: "AMD",
    Indore: "IDR", Kolkata: "CCU", Lucknow: "LKO", Kanpur: "KNP", Faridabad: "FBD",
    Ghaziabad: "GZB", Surat: "STV", Bhubaneswar: "BBI", Roorkee: "RKE",
    Ahmednagar: "ANR", Chandigarh: "IXC", Nashik: "ISK", Kochi: "COK",
    Thiruvananthapuram: "TRV", Boston: "BOS", Kota: "KTT", Goa: "GOI"
  };
  var CITY_COORDS = {
    Bengaluru: [12.9716, 77.5946], Hyderabad: [17.426, 78.452], Mumbai: [19.076, 72.8777],
    Pune: [18.5204, 73.8567], Delhi: [28.6139, 77.209], Gurugram: [28.4595, 77.0266],
    Noida: [28.5355, 77.391], Chennai: [13.0827, 80.2707], Jaipur: [26.9124, 75.7873],
    Ahmedabad: [23.0225, 72.5714], Indore: [22.7196, 75.8577], Kolkata: [22.5726, 88.3639],
    Lucknow: [26.8467, 80.9462], Kanpur: [26.4499, 80.3319], Surat: [21.1702, 72.8311],
    Bhubaneswar: [20.2961, 85.8245], Chandigarh: [30.7333, 76.7794], Kota: [25.2138, 75.8648]
  };
  function cityCode(city) {
    return CITY_CODES[city] || (city || "IND").replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase();
  }

  var STAGE_ORDER = ["Pre-seed", "Seed", "Series A", "Series B", "Series C+", "Bootstrapped", "Public", "Acquired"];
  var STAGE_COLORS = {
    "Pre-seed": "#9db4ff", "Seed": "#5b82ff", "Series A": "#2456f5", "Series B": "#173cba",
    "Series C+": "#0e2a85", "Bootstrapped": "#0fa36b", "Public": "#0b7f54", "Acquired": "#5a6676"
  };

  /* ---------- state ---------- */
  var state = { q: "", type: "", state: "", city: "", stage: "", sector: "", view: "list" };

  var $ = function (id) { return document.getElementById(id); };
  var els = {
    views: { home: $("homeView"), explore: $("exploreView"), profile: $("profileView"), submit: $("submitView") },
    search: $("searchInput"), heroSearch: $("heroSearchInput"),
    type: $("typeFilter"), st: $("stateFilter"), city: $("cityFilter"),
    stage: $("stageFilter"), sector: $("sectorFilter"),
    listBtn: $("listViewBtn"), mapBtn: $("mapViewBtn"),
    applied: $("appliedRow"), resultLine: $("resultLine"),
    gridRoot: $("gridRoot"), gridCards: $("gridCards"), gridEmpty: $("gridEmpty"),
    mapRoot: $("mapRoot"),
    profileBody: $("profileBody"),
    submitForm: $("submitForm"), submitMsg: $("submitMsg"), dupHint: $("dupHint"),
    statusTrack: $("statusTrack"), toast: $("toast")
  };

  /* ---------- helpers ---------- */
  var MONO_COLORS = ["#2456f5", "#7048e8", "#0ca678", "#e8590c", "#c2255c", "#1098ad",
    "#5f3dc4", "#e67700", "#2f9e44", "#d6336c", "#3b5bdb", "#0b7285"];
  function colorFor(name) {
    var h = 0;
    for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return MONO_COLORS[h % MONO_COLORS.length];
  }
  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function domainOf(url) {
    try { return new URL(url).hostname.replace(/^www\./, ""); } catch (e) { return ""; }
  }
  function monogram(e) {
    var letter = e.name.charAt(0).toUpperCase();
    var fallback = '<div class="monogram" style="background:' + colorFor(e.name) + '">' + letter + "</div>";
    var d = e.website ? domainOf(e.website) : "";
    if (!d) return fallback;
    return '<div class="monogram" style="background:' + colorFor(e.name) + ';position:relative">' + letter +
      '<img src="https://www.google.com/s2/favicons?domain=' + encodeURIComponent(d) +
      '&sz=128" alt="" loading="lazy" onerror="this.remove()" style="position:absolute;inset:0">' + "</div>";
  }
  function metaLine(e) {
    var bits = [];
    if (e.city) bits.push('<span class="code">' + esc(cityCode(e.city)) + "</span>");
    if (e.sector) bits.push(esc(e.sector));
    if (e.stage) bits.push(esc(e.stage.toUpperCase()));
    else if (e.type === "vc") bits.push("INVESTOR");
    return bits.join(" · ");
  }
  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(function () { els.toast.classList.remove("show"); }, 2200);
  }

  /* ---------- filtering ---------- */
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

  function counts(field, subset) {
    var m = {};
    (subset || ALL).forEach(function (e) { if (e[field]) m[e[field]] = (m[e[field]] || 0) + 1; });
    return m;
  }
  function sortedKeys(m) {
    return Object.keys(m).sort(function (a, b) { return m[b] - m[a] || a.localeCompare(b); });
  }

  /* ---------- routing ---------- */
  function parseHash() {
    var h = location.hash.replace(/^#\/?/, "");
    var parts = h.split("?");
    var path = parts[0].replace(/\/$/, "");
    var params = {};
    (parts[1] || "").split("&").forEach(function (kv) {
      if (!kv) return;
      var p = kv.split("=");
      params[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || "");
    });
    return { path: path, params: params };
  }
  function buildExploreHash() {
    var qs = [];
    ["q", "type", "state", "city", "stage", "sector"].forEach(function (k) {
      if (state[k]) qs.push(k + "=" + encodeURIComponent(state[k]));
    });
    if (state.view === "map") qs.push("view=map");
    return "#/explore" + (qs.length ? "?" + qs.join("&") : "");
  }
  function go(hash) { location.hash = hash; }

  function showView(name) {
    Object.keys(els.views).forEach(function (k) {
      els.views[k].classList.toggle("hidden", k !== name);
    });
    document.querySelectorAll(".site-nav a").forEach(function (a) {
      var nav = a.getAttribute("data-nav");
      a.classList.toggle("on", (name === "explore" &&
        ((nav === "map" && state.view === "map") || (nav === "explore" && state.view !== "map"))));
    });
    window.scrollTo(0, 0);
  }

  function route() {
    var r = parseHash();
    if (r.path === "explore") {
      ["q", "type", "state", "city", "stage", "sector"].forEach(function (k) {
        state[k] = r.params[k] || "";
      });
      state.view = r.params.view === "map" ? "map" : "list";
      syncControls();
      showView("explore");
      renderExplore();
    } else if (/^startup\//.test(r.path)) {
      var slug = r.path.split("/")[1];
      if (bySlug[slug]) { showView("profile"); renderProfile(bySlug[slug]); }
      else go("#/explore");
    } else if (r.path === "submit") {
      showView("submit");
      resetSubmit();
    } else {
      showView("home");
    }
  }
  window.addEventListener("hashchange", route);

  /* ---------- home ---------- */
  function renderHome() {
    var startups = ALL.filter(function (e) { return e.type === "startup"; });
    var vcs = ALL.filter(function (e) { return e.type === "vc"; });
    var cityCount = counts("city", startups);
    var sectorCount = counts("sector", startups);
    var stageCount = counts("stage", startups);

    $("statStrip").innerHTML =
      '<span><span class="live-dot"></span><b>' + startups.length + "</b> startups</span>" +
      "<span><b>" + vcs.length + "</b> investors</span>" +
      "<span><b>" + Object.keys(cityCount).length + "</b> cities</span>" +
      "<span><b>" + Object.keys(sectorCount).length + "</b> sectors</span>" +
      "<span>updated " + new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }).toUpperCase() + "</span>";

    $("cityGrid").innerHTML = sortedKeys(cityCount).slice(0, 10).map(function (c) {
      return '<button class="city-tile" data-city="' + esc(c) + '">' +
        '<span class="city-code">' + esc(cityCode(c)) + "</span>" +
        '<span class="city-name">' + esc(c) + "</span>" +
        '<span class="city-count">' + cityCount[c] + " startup" + (cityCount[c] === 1 ? "" : "s") + "</span>" +
        "</button>";
    }).join("");

    $("sectorCloud").innerHTML = sortedKeys(sectorCount).map(function (s) {
      return '<button class="sector-chip" data-sector="' + esc(s) + '">' + esc(s) +
        '<span class="n">' + sectorCount[s] + "</span></button>";
    }).join("");

    var totalStaged = STAGE_ORDER.reduce(function (n, s) { return n + (stageCount[s] || 0); }, 0);
    $("stageNote").textContent = totalStaged + " startups with a known stage";
    $("stageBar").innerHTML = STAGE_ORDER.filter(function (s) { return stageCount[s]; }).map(function (s) {
      var pct = (stageCount[s] / totalStaged * 100).toFixed(2);
      return '<button class="stage-seg" data-stage="' + esc(s) + '" style="width:' + pct +
        "%;background:" + STAGE_COLORS[s] + '" title="' + esc(s) + " · " + stageCount[s] + '"></button>';
    }).join("");
    $("stageLegend").innerHTML = STAGE_ORDER.filter(function (s) { return stageCount[s]; }).map(function (s) {
      return '<button data-stage="' + esc(s) + '"><span class="sw" style="background:' + STAGE_COLORS[s] + '"></span>' +
        esc(s) + " · " + stageCount[s] + "</button>";
    }).join("");

    var fresh = startups.filter(function (e) { return e.founded; })
      .sort(function (a, b) { return b.founded - a.founded; }).slice(0, 6);
    $("freshGrid").innerHTML = fresh.map(cardHTML).join("");

    $("vcBand").innerHTML = '<div class="vc-band-inner" id="vcBandBtn">' +
      "<h3>The investors are here too.</h3>" +
      '<span class="mono">' + vcs.length + " funds &amp; angel networks on the registry →</span>" +
      '<div class="vc-logos">' + vcs.slice(0, 6).map(function (v) {
        return '<div class="monogram" style="background:' + colorFor(v.name) + '">' + v.name.charAt(0) + "</div>";
      }).join("") + "</div></div>";

    // delegates
    $("cityGrid").addEventListener("click", function (ev) {
      var t = ev.target.closest("[data-city]");
      if (t) go("#/explore?city=" + encodeURIComponent(t.getAttribute("data-city")));
    });
    $("sectorCloud").addEventListener("click", function (ev) {
      var t = ev.target.closest("[data-sector]");
      if (t) go("#/explore?sector=" + encodeURIComponent(t.getAttribute("data-sector")));
    });
    [$("stageBar"), $("stageLegend")].forEach(function (root) {
      root.addEventListener("click", function (ev) {
        var t = ev.target.closest("[data-stage]");
        if (t) go("#/explore?stage=" + encodeURIComponent(t.getAttribute("data-stage")));
      });
    });
    $("freshGrid").addEventListener("click", cardClick);
    $("vcBand").addEventListener("click", function () { go("#/explore?type=vc"); });
    $("heroSearch").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var q = els.heroSearch.value.trim();
      go(q ? "#/explore?q=" + encodeURIComponent(q) : "#/explore");
    });
  }

  /* ---------- cards ---------- */
  function cardHTML(e) {
    return '<article class="reg-card" data-slug="' + esc(e.slug) + '" tabindex="0">' +
      '<span class="card-open">open →</span>' +
      '<div class="card-top">' + monogram(e) +
      "<div><div class=\"card-name\">" + esc(e.name) + "</div>" +
      '<div class="card-meta">' + metaLine(e) + "</div></div></div>" +
      '<p class="card-tagline">' + esc(e.tagline || e.description || "") + "</p>" +
      '<div class="card-foot">' +
      (e.type === "vc" ? '<span class="tag vc">INVESTOR</span>' : "") +
      (e.founded ? '<span class="tag">EST ' + esc(e.founded) + "</span>" : "") +
      (e.funding && /\d/.test(e.funding) ? '<span class="tag stage">' + esc(e.funding) + " RAISED</span>" : "") +
      "</div></article>";
  }
  function cardClick(ev) {
    var card = ev.target.closest(".reg-card");
    if (card) go("#/startup/" + card.getAttribute("data-slug"));
  }

  /* ---------- explore ---------- */
  function fillSelect(sel, values, label) {
    var current = sel.value;
    while (sel.options.length > 1) sel.remove(1);
    values.forEach(function (v) {
      var o = document.createElement("option");
      o.value = v; o.textContent = v;
      sel.appendChild(o);
    });
    sel.value = values.indexOf(current) !== -1 ? current : "";
  }
  function initFilters() {
    fillSelect(els.st, sortedKeys(counts("state")));
    fillSelect(els.city, sortedKeys(counts("city")));
    fillSelect(els.stage, STAGE_ORDER.filter(function (s) {
      return ALL.some(function (e) { return e.stage === s; });
    }));
    fillSelect(els.sector, sortedKeys(counts("sector")));
    var dl = $("cityList");
    sortedKeys(counts("city")).forEach(function (c) {
      var o = document.createElement("option"); o.value = c; dl.appendChild(o);
    });
    var secSel = els.submitForm.querySelector('select[name="sector"]');
    sortedKeys(counts("sector")).filter(function (s) {
      return s !== "Venture Capital" && s !== "Incubator";
    }).forEach(function (s) {
      var o = document.createElement("option"); o.textContent = s; secSel.appendChild(o);
    });
  }
  function syncControls() {
    els.search.value = state.q;
    els.type.value = state.type;
    els.st.value = state.state;
    if (state.state) {
      fillSelect(els.city, sortedKeys(counts("city", ALL.filter(function (e) { return e.state === state.state; }))));
    } else {
      fillSelect(els.city, sortedKeys(counts("city")));
    }
    els.city.value = state.city;
    els.stage.value = state.stage;
    els.sector.value = state.sector;
    els.listBtn.classList.toggle("active", state.view !== "map");
    els.mapBtn.classList.toggle("active", state.view === "map");
  }

  var FILTER_LABELS = { q: "search", type: "type", state: "state", city: "city", stage: "stage", sector: "sector" };
  function renderApplied() {
    var chips = [];
    Object.keys(FILTER_LABELS).forEach(function (k) {
      if (!state[k]) return;
      var label = k === "type" ? (state[k] === "vc" ? "Investors" : "Startups") : state[k];
      if (k === "q") label = "“" + label + "”";
      chips.push('<button class="applied-chip" data-clear="' + k + '">' + esc(label) + '<span class="x">✕</span></button>');
    });
    if (chips.length) chips.push('<button class="clear-all" data-clear="*">clear all</button>');
    els.applied.innerHTML = chips.join("");
  }
  els.applied.addEventListener("click", function (ev) {
    var t = ev.target.closest("[data-clear]");
    if (!t) return;
    var k = t.getAttribute("data-clear");
    if (k === "*") { ["q", "type", "state", "city", "stage", "sector"].forEach(function (f) { state[f] = ""; }); }
    else state[k] = "";
    history.replaceState(null, "", buildExploreHash());
    syncControls();
    renderExplore();
  });

  function renderExplore() {
    var list = filtered();
    renderApplied();
    var scope = [];
    if (state.city) scope.push(state.city);
    else if (state.state) scope.push(state.state);
    if (state.sector) scope.push(state.sector);
    if (state.stage) scope.push(state.stage);
    els.resultLine.innerHTML = "showing <b>" + list.length + "</b> of " + ALL.length +
      " entries" + (scope.length ? " · " + esc(scope.join(" · ")) : "");

    els.gridRoot.classList.toggle("hidden", state.view === "map");
    els.mapRoot.classList.toggle("hidden", state.view !== "map");

    if (state.view === "map") {
      ensureMap();
      renderMap(list);
    } else {
      els.gridCards.innerHTML = list.map(cardHTML).join("");
      if (!list.length) {
        var sub = state.sector || state.stage || "startups";
        els.gridEmpty.innerHTML = "<h3>Nothing here yet.</h3>" +
          "<p>No " + esc(sub) + (state.city ? " in " + esc(state.city) : "") + " on the registry yet — " +
          '<a href="#/explore">browse everything</a> or <a href="#/submit">be the first to list one</a>.</p>';
      }
      els.gridEmpty.classList.toggle("hidden", list.length > 0);
    }
  }
  els.gridCards.addEventListener("click", cardClick);
  els.gridCards.addEventListener("keydown", function (ev) {
    if (ev.key === "Enter") cardClick(ev);
  });

  /* explore control events */
  var debounce;
  els.search.addEventListener("input", function () {
    clearTimeout(debounce);
    debounce = setTimeout(function () {
      state.q = els.search.value.trim();
      history.replaceState(null, "", buildExploreHash());
      renderExplore();
    }, 160);
  });
  [["type", els.type], ["state", els.st], ["city", els.city],
   ["stage", els.stage], ["sector", els.sector]].forEach(function (pair) {
    pair[1].addEventListener("change", function () {
      state[pair[0]] = pair[1].value;
      if (pair[0] === "state") {
        var cities = sortedKeys(counts("city", state.state ? ALL.filter(function (e) { return e.state === state.state; }) : null));
        fillSelect(els.city, cities);
        if (cities.indexOf(state.city) === -1) state.city = "";
      }
      history.replaceState(null, "", buildExploreHash());
      syncControls();
      renderExplore();
      if (state.view === "map") zoomToSelection();
    });
  });
  els.listBtn.addEventListener("click", function () {
    state.view = "list";
    history.replaceState(null, "", buildExploreHash());
    syncControls(); renderExplore();
  });
  els.mapBtn.addEventListener("click", function () {
    state.view = "map";
    history.replaceState(null, "", buildExploreHash());
    syncControls(); renderExplore();
  });

  /* ---------- map ---------- */
  var map, cluster, labelLayer;
  function ensureMap() {
    if (map) { setTimeout(function () { map.invalidateSize(); }, 60); return; }
    map = L.map("map", { zoomControl: false }).setView([21.8, 79.5], 5);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer(CFG.tileUrl, { attribution: CFG.tileAttribution, maxZoom: 19, subdomains: "abcd" }).addTo(map);
    labelLayer = L.layerGroup().addTo(map);
    Object.keys(CITY_COORDS).forEach(function (c) {
      L.marker(CITY_COORDS[c], {
        icon: L.divIcon({
          html: '<div class="city-label">' + esc(cityCode(c)) + " · " + esc(c.toUpperCase()) + "</div>",
          className: "", iconSize: [120, 16], iconAnchor: [-14, 8]
        }),
        interactive: false, keyboard: false
      }).addTo(labelLayer);
    });
    cluster = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 46,
      spiderfyOnMaxZoom: true,
      iconCreateFunction: function (c) {
        var n = c.getChildCount();
        var size = n < 10 ? 34 : n < 50 ? 42 : 50;
        return L.divIcon({
          html: '<div class="cluster" style="width:' + size + "px;height:" + size + 'px">' + n + "</div>",
          className: "", iconSize: [size, size]
        });
      }
    });
    map.addLayer(cluster);
  }
  function renderMap(list) {
    if (!cluster) return;
    cluster.clearLayers();
    cluster.addLayers(list.filter(function (e) { return e.lat != null; }).map(function (e) {
      var letter = e.name.charAt(0).toUpperCase();
      var d = e.website ? domainOf(e.website) : "";
      var inner = '<div class="avatar" style="background:' + colorFor(e.name) + '">' +
        (d ? '<img src="https://www.google.com/s2/favicons?domain=' + encodeURIComponent(d) +
          '&sz=64" alt="" onerror="this.remove()" style="position:absolute;inset:0">' : "") + letter + "</div>";
      var m = L.marker([e.lat, e.lng], {
        icon: L.divIcon({
          html: '<div class="pin" title="' + esc(e.name) + '" style="position:relative">' + inner + "</div>",
          className: "", iconSize: [36, 36], iconAnchor: [18, 18]
        }),
        title: e.name
      });
      m.on("click", function () { go("#/startup/" + e.slug); });
      return m;
    }));
  }
  function zoomToSelection() {
    if (!map) return;
    var pts = filtered().filter(function (e) { return e.lat != null; });
    if ((state.city || state.state) && pts.length) {
      map.fitBounds(L.latLngBounds(pts.map(function (e) { return [e.lat, e.lng]; })).pad(0.25), { maxZoom: 12 });
    } else if (!state.city && !state.state) {
      map.setView([21.8, 79.5], 5);
    }
  }

  /* ---------- profile ---------- */
  function renderProfile(e) {
    var fields = "";
    function row(k, v) {
      if (v) fields += '<div class="field-row"><dt>' + k + "</dt><dd>" + esc(v) + "</dd></div>";
    }
    row("Founders", e.founders);
    row("Industry", e.industry && e.industry !== e.sector ? e.industry : "");
    row("Key investors", e.investors);
    row("Total funding", e.funding);
    row("Founded", e.founded);
    row("Headquarters", e.city ? e.city + (e.state && e.state !== "India" ? ", " + e.state : "") : "");
    row("Website", e.website ? domainOf(e.website) : "");

    els.profileBody.innerHTML =
      '<a class="back-link" href="javascript:history.back()">&larr; back to the registry</a>' +
      '<div class="profile-head">' + monogram(e) +
      "<div><h1 class=\"profile-name\">" + esc(e.name) + "</h1>" +
      '<p class="profile-meta">' + metaLine(e) + (e.founded ? " · EST " + esc(e.founded) : "") + "</p></div></div>" +
      '<div class="profile-badges">' +
      '<span class="badge-live">LIVE ON THE REGISTRY</span>' +
      (e.type === "startup" ? '<span class="badge-unclaimed">UNCLAIMED</span>' : "") +
      "</div>" +
      (e.tagline ? '<p class="profile-tagline">' + esc(e.tagline) + ".</p>" : "") +
      (e.description ? '<p class="profile-desc">' + esc(e.description) + "</p>" : "") +
      (fields ? '<dl class="field-table">' + fields + "</dl>" : "") +
      '<div class="profile-actions">' +
      (e.website ? '<a class="btn-cta" href="' + esc(e.website) + '" target="_blank" rel="noopener">Visit website ↗</a>' : "") +
      '<button class="btn-ghost" id="copyLinkBtn">Copy link</button>' +
      '<a class="btn-ghost" href="#/submit">Suggest an edit</a>' +
      "</div>" +
      (e.type === "startup"
        ? '<p class="claim-note">Run ' + esc(e.name) + "? This profile was built from public data — " +
          '<a href="#/submit">claim it</a> to keep it accurate, add your logo and mark yourself hiring. Free, always.</p>'
        : "");
    $("copyLinkBtn").addEventListener("click", function () {
      var url = location.origin + location.pathname + "#/startup/" + e.slug;
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject())
        .then(function () { toast("link copied to clipboard"); })
        .catch(function () { toast(url); });
    });
  }

  /* ---------- submit ---------- */
  function resetSubmit() {
    els.submitForm.reset();
    els.submitMsg.classList.add("hidden");
    els.dupHint.classList.add("hidden");
    els.statusTrack.querySelectorAll("li").forEach(function (li, i) {
      li.classList.toggle("on", i === 0);
      li.classList.remove("done");
    });
  }
  els.submitForm.name.addEventListener("input", function () {
    var v = els.submitForm.name.value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    var hit = v.length >= 3 && ALL.find(function (e) {
      return e.name.toLowerCase().replace(/[^a-z0-9]/g, "") === v;
    });
    if (hit) {
      els.dupHint.innerHTML = "Heads up — <a href=\"#/startup/" + esc(hit.slug) + '">' +
        esc(hit.name) + "</a> is already on the registry. Submitting again suggests an update.";
      els.dupHint.classList.remove("hidden");
    } else {
      els.dupHint.classList.add("hidden");
    }
  });
  els.submitForm.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var f = els.submitForm;
    var data = {
      name: f.name.value.trim(), website: f.website.value.trim(),
      tagline: f.tagline.value.trim(), city: f.city.value.trim(),
      sector: f.sector.value, stage: f.stage.value, email: f.email.value.trim(),
      submittedAt: new Date().toISOString()
    };
    var msg = els.submitMsg;
    msg.classList.add("hidden");
    if (!data.name || !data.tagline) {
      msg.textContent = "The company name and one-line description are required — everything else is optional.";
      msg.classList.remove("hidden");
      msg.classList.add("err");
      return;
    }
    msg.classList.remove("err");
    function ok() {
      f.reset();
      els.dupHint.classList.add("hidden");
      var steps = els.statusTrack.querySelectorAll("li");
      steps[0].classList.remove("on"); steps[0].classList.add("done");
      steps[1].classList.add("on");
      msg.innerHTML = "<b>" + esc(data.name) + "</b> is in the review queue. " +
        "Listings usually go live within a few days — we'll email you" +
        (data.email ? " at " + esc(data.email) : "") + " when it's up.";
      msg.classList.remove("hidden");
      toast("submission received");
    }
    if (CFG.formEndpoint) {
      fetch(CFG.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data)
      }).then(function (r) { if (r.ok) ok(); else throw new Error("HTTP " + r.status); })
        .catch(function () {
          msg.textContent = "Couldn't send your submission — check your connection and try again.";
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

  /* ---------- theme ---------- */
  var themeBtn = $("themeToggle");
  function applyTheme(t) {
    if (t) document.documentElement.setAttribute("data-theme", t);
    else document.documentElement.removeAttribute("data-theme");
  }
  try { applyTheme(localStorage.getItem("sl_theme") || ""); } catch (e) {}
  themeBtn.addEventListener("click", function () {
    var cur = document.documentElement.getAttribute("data-theme");
    var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var next = cur ? (cur === "dark" ? "light" : "dark") : (systemDark ? "light" : "dark");
    applyTheme(next);
    try { localStorage.setItem("sl_theme", next); } catch (e) {}
    toast(next + " mode");
  });

  /* ---------- boot ---------- */
  initFilters();
  renderHome();
  route();
})();
