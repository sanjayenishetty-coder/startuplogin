/* Startup Login — registry app */
(function () {
  "use strict";

  var CFG = window.SL_CONFIG || {};
  var DB = window.SL_DB || { enabled: false };
  var ALL = [];
  var bySlug = {};

  var CITY_CODES = {
    Bengaluru: "BLR", Hyderabad: "HYD", Mumbai: "BOM", Pune: "PNQ", Delhi: "DEL",
    Gurugram: "GGN", Noida: "NOI", Chennai: "MAA", Jaipur: "JAI", Ahmedabad: "AMD",
    Indore: "IDR", Kolkata: "CCU", Lucknow: "LKO", Kanpur: "KNP", Faridabad: "FBD",
    Ghaziabad: "GZB", Surat: "STV", Bhubaneswar: "BBI", Roorkee: "RKE",
    Ahmednagar: "ANR", Chandigarh: "IXC", Nashik: "ISK", Kochi: "COK",
    Thiruvananthapuram: "TRV", Boston: "BOS", Kota: "KTT", Goa: "GOI"
  };
  function cityCode(city) {
    return CITY_CODES[city] || (city || "IND").replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase();
  }

  var STAGE_ORDER = ["Pre-seed", "Seed", "Series A", "Series B", "Series C+", "Bootstrapped", "Public", "Acquired"];
  var INVESTOR_CITIES = ["Bengaluru", "Mumbai", "Delhi", "Gurugram", "Pune", "Hyderabad",
    "Kolkata", "Chennai", "Ahmedabad", "Surat", "Lucknow", "Chandigarh"];
  var INVESTOR_CATEGORIES = ["VC Funds", "Angel Networks / Funds", "Family Office",
    "Private Equities", "Micro PE / VC", "Angels"];
  var SECTIONS = {
    startup: { path: "startups", title: "Startups" },
    vc: { path: "investors", title: "Investors" },
    incubator: { path: "incubators", title: "Incubators & Accelerators" },
    event: { path: "events", title: "Events" }
  };
  var PATH_TO_TYPE = { startups: "startup", investors: "vc", incubators: "incubator", events: "event", explore: "startup" };
  var STAGE_COLORS = {
    "Pre-seed": "#9db4ff", "Seed": "#5b82ff", "Series A": "#2456f5", "Series B": "#173cba",
    "Series C+": "#0e2a85", "Bootstrapped": "#0fa36b", "Public": "#0b7f54", "Acquired": "#5a6676"
  };

  /* ---------- state ---------- */
  var state = { q: "", type: "", city: "", stage: "", sector: "", fund: "" };

  var $ = function (id) { return document.getElementById(id); };
  var els = {
    views: { home: $("homeView"), explore: $("exploreView"), profile: $("profileView"), submit: $("submitView") },
    search: $("searchInput"), heroSearch: $("heroSearchInput"),
    city: $("cityFilter"),
    stage: $("stageFilter"), sector: $("sectorFilter"),
    applied: $("appliedRow"), resultLine: $("resultLine"),
    gridRoot: $("gridRoot"), gridCards: $("gridCards"), gridEmpty: $("gridEmpty"),
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
  var FUNDED_STAGES = { "Pre-seed": 1, "Seed": 1, "Series A": 1, "Series B": 1, "Series C+": 1, "Public": 1, "Acquired": 1 };
  function matches(e) {
    if (state.type && e.type !== state.type) return false;
    if (state.city && e.city !== state.city) return false;
    if (state.stage && e.stage !== state.stage) return false;
    if (state.fund === "funded" && !FUNDED_STAGES[e.stage]) return false;
    if (state.fund === "bootstrapped" && e.stage !== "Bootstrapped") return false;
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
    ["q", "city", "stage", "sector", "fund"].forEach(function (k) {
      if (state[k]) qs.push(k + "=" + encodeURIComponent(state[k]));
    });
    if (state.trending && state.sector === "Spacetech") {
      var tqs = qs.filter(function (p) { return p.indexOf("sector=") !== 0; });
      return "#/trending/spacetech" + (tqs.length ? "?" + tqs.join("&") : "");
    }
    var path = (SECTIONS[state.type] || SECTIONS.startup).path;
    return "#/" + path + (qs.length ? "?" + qs.join("&") : "");
  }
  function go(hash) { location.hash = hash; }

  function showView(name) {
    Object.keys(els.views).forEach(function (k) {
      els.views[k].classList.toggle("hidden", k !== name);
    });
    document.querySelectorAll(".site-nav a").forEach(function (a) {
      a.classList.toggle("on", name === "explore" && a.getAttribute("data-nav") === state.type);
    });
    window.scrollTo(0, 0);
  }

  function route() {
    var r = parseHash();
    if (r.path === "trending/spacetech") {
      ["q", "city", "stage", "fund"].forEach(function (k) { state[k] = r.params[k] || ""; });
      state.type = "startup";
      state.sector = "Spacetech";
      state.trending = true;
      syncControls();
      showView("explore");
      renderExplore();
    } else if (PATH_TO_TYPE[r.path]) {
      ["q", "city", "stage", "sector", "fund"].forEach(function (k) {
        state[k] = r.params[k] || "";
      });
      state.type = r.params.type === "vc" ? "vc" : PATH_TO_TYPE[r.path];
      state.trending = false;
      syncControls();
      showView("explore");
      renderExplore();
    } else if (/^startup\//.test(r.path)) {
      var slug = r.path.split("/")[1];
      if (bySlug[slug]) { showView("profile"); renderProfile(bySlug[slug]); }
      else go("#/startups");
    } else if (r.path === "submit") {
      showView("submit");
      resetSubmit();
      applySubmitMode(SUBMIT_MODES[r.params.as] ? r.params.as : "startup");
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
      "<span><b>" + STARTUP_CITIES.filter(function (c) { return cityCount[c]; }).length + "</b> cities</span>" +
      "<span><b>" + Object.keys(sectorCount).length + "</b> sectors</span>" +
      "<span>updated " + new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }).toUpperCase() + "</span>";

    var featured = STARTUP_CITIES.slice().sort(function (a, b) {
      return (cityCount[b] || 0) - (cityCount[a] || 0);
    });
    $("cityGrid").innerHTML = featured.map(function (c) {
      return '<button class="city-tile" data-city="' + esc(c) + '">' +
        '<span class="city-code">' + esc(cityCode(c)) + "</span>" +
        '<span class="city-name">' + esc(c) + "</span>" +
        '<span class="city-count">' + (cityCount[c] || 0) + " startup" + (cityCount[c] === 1 ? "" : "s") + "</span>" +
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
      if (t) go("#/startups?city=" + encodeURIComponent(t.getAttribute("data-city")));
    });
    $("sectorCloud").addEventListener("click", function (ev) {
      var t = ev.target.closest("[data-sector]");
      if (t) go("#/startups?sector=" + encodeURIComponent(t.getAttribute("data-sector")));
    });
    [$("stageBar"), $("stageLegend")].forEach(function (root) {
      root.addEventListener("click", function (ev) {
        var t = ev.target.closest("[data-stage]");
        if (t) go("#/startups?stage=" + encodeURIComponent(t.getAttribute("data-stage")));
      });
    });
    $("freshGrid").addEventListener("click", cardClick);
    $("vcBand").addEventListener("click", function () { go("#/investors"); });
    $("heroSearch").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var q = els.heroSearch.value.trim();
      go(q ? "#/startups?q=" + encodeURIComponent(q) : "#/startups");
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
      (e.timing ? '<span class="tag stage">' + esc(e.timing.toUpperCase()) + "</span>" : "") +
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
    fillSelect(els.city, sortedKeys(counts("city")));
    fillSelect(els.stage, STAGE_ORDER.filter(function (s) {
      return ALL.some(function (e) { return e.stage === s; });
    }));
    fillSelect(els.sector, sortedKeys(counts("sector")));
  }
  function syncControls() {
    els.search.value = state.q;
    els.city.value = state.city;
    els.stage.value = state.stage;
    els.sector.value = state.sector;
  }

  var FILTER_LABELS = { q: "search", city: "city", stage: "stage", sector: "sector" };
  function renderApplied() {
    var chips = [];
    Object.keys(FILTER_LABELS).forEach(function (k) {
      if (!state[k]) return;
      if (k === "sector" && state.trending) return;
      var label = state[k];
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
    if (k === "*") { ["q", "city", "stage", "sector", "fund"].forEach(function (f) { state[f] = ""; }); }
    else state[k] = "";
    history.replaceState(null, "", buildExploreHash());
    syncControls();
    renderExplore();
  });

  function renderExplore() {
    var t = state.type;
    var CTA = {
      startup: ["#/submit", "list your startup →"],
      vc: ["#/submit?as=investor", "list as an investor →"],
      incubator: ["#/submit?as=incubator", "list your incubator or accelerator →"],
      event: ["#/submit?as=event", "list an event →"]
    };
    var spaceCount = ALL.filter(function (e) { return e.type === "startup" && e.sector === "Spacetech"; }).length;
    $("trendBanner").classList.toggle("hidden", !(t === "startup" && !state.trending));
    $("trendCount").textContent = spaceCount;
    $("trendNote").classList.toggle("hidden", !state.trending);
    if (state.trending) {
      $("trendNote").innerHTML = "India's space sector is on a tear — <b>440+ space startups</b> registered, " +
        "private investment past <b>$618M</b> and over <b>$1B</b> raised to date, led from Bengaluru, " +
        "Hyderabad and Chennai. These are the ventures building it.";
    }
    $("exploreTitle").innerHTML = state.trending
      ? '🚀 Spacetech <span class="trend-label" style="vertical-align:middle">TRENDING</span>' +
        ' <a class="rail-more" href="#/submit">list your spacetech startup →</a>'
      : (SECTIONS[t] || SECTIONS.startup).title +
        ' <a class="rail-more" href="' + CTA[t][0] + '">' + CTA[t][1] + "</a>";
    els.stage.classList.toggle("hidden", t !== "startup");
    $("fundToggle").classList.toggle("hidden", t !== "startup");
    document.querySelectorAll("#fundToggle button").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-fund") === state.fund);
    });
    els.sector.classList.toggle("hidden", t === "event" || !!state.trending);
    var subset = ALL.filter(function (e) { return e.type === t; });
    if (t === "vc") {
      fillSelect(els.city, INVESTOR_CITIES);
      fillSelect(els.sector, INVESTOR_CATEGORIES);
      els.sector.options[0].textContent = "Category";
    } else if (t === "incubator") {
      fillSelect(els.city, sortedKeys(counts("city", subset)));
      fillSelect(els.sector, ["Incubator", "Accelerator"]);
      els.sector.options[0].textContent = "Category";
    } else if (t === "event") {
      fillSelect(els.city, sortedKeys(counts("city", subset)));
    } else {
      fillSelect(els.city, sortedKeys(counts("city", subset)));
      fillSelect(els.sector, sortedKeys(counts("sector", subset)));
      els.sector.options[0].textContent = "Sector";
    }
    els.city.value = state.city;
    els.sector.value = state.sector;
    var list = filtered();
    renderApplied();
    var scope = [];
    if (state.city) scope.push(state.city);
    if (state.sector) scope.push(state.sector);
    if (state.stage) scope.push(state.stage);
    els.resultLine.innerHTML = "showing <b>" + list.length + "</b> of " + ALL.length +
      " entries" + (scope.length ? " · " + esc(scope.join(" · ")) : "");

    els.gridCards.innerHTML = list.map(cardHTML).join("");
    if (!list.length) {
      var nouns = { vc: "investors", incubator: "incubators", event: "events" };
      var sub = state.sector || state.stage || nouns[state.type] || "startups";
      els.gridEmpty.innerHTML = "<h3>Nothing here yet.</h3>" +
        "<p>No " + esc(sub) + (state.city ? " in " + esc(state.city) : "") + " on the registry yet — " +
        '<a href="#/explore">browse everything</a> or <a href="#/submit">be the first to list one</a>.</p>';
    }
    els.gridEmpty.classList.toggle("hidden", list.length > 0);
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
  [["city", els.city],
   ["stage", els.stage], ["sector", els.sector]].forEach(function (pair) {
    pair[1].addEventListener("change", function () {
      state[pair[0]] = pair[1].value;
      history.replaceState(null, "", buildExploreHash());
      syncControls();
      renderExplore();
    });
  });

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
    $("cityOther").classList.add("hidden");
    $("sectorOther").classList.add("hidden");
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
  var submitMode = "startup";
  var STARTUP_SECTORS = ["AI", "SaaS", "Fintech", "Edtech", "Healthtech", "Agritech",
    "D2C", "E-commerce", "Consumer", "Deeptech", "Cybersecurity", "Gaming", "Sports",
    "Cleantech", "Logistics", "HRtech", "Foodtech", "Media & Adtech", "Proptech",
    "Traveltech", "Legaltech", "Spacetech", "Manufacturing", "IT Services"];
  var STARTUP_CITIES = ["Bengaluru", "Hyderabad", "Mumbai", "Delhi", "Gurugram",
    "Noida", "Pune", "Chennai", "Ahmedabad", "Jaipur"];
  var SUBMIT_MODES = {
    startup: {
      type: "startup", title: "Log your startup in",
      name: "Company name", tagHint: "what you do, in a sentence",
      cities: STARTUP_CITIES, sectorLabel: "Sector", sectors: STARTUP_SECTORS,
      sectorPlaceholder: "Select a sector…", stage: true, timing: false,
      founders: "Founder name(s)", linkedin: "Founder's LinkedIn"
    },
    investor: {
      type: "vc", title: "List as an investor",
      name: "Fund / firm name", tagHint: "what you invest in, in a sentence",
      cities: null /* INVESTOR_CITIES */, sectorLabel: "Category",
      sectors: INVESTOR_CATEGORIES, sectorPlaceholder: "Select a category…",
      stage: false, timing: false,
      founders: "Partner name(s)", linkedin: "Partner's LinkedIn"
    },
    incubator: {
      type: "incubator", title: "List your incubator or accelerator",
      name: "Incubator / accelerator name", tagHint: "what you offer founders, in a sentence",
      cities: STARTUP_CITIES, sectorLabel: "Category",
      sectors: ["Incubator", "Accelerator"], sectorPlaceholder: "Select a category…",
      stage: false, timing: false,
      founders: "Contact person(s)", linkedin: "Contact's LinkedIn"
    },
    event: {
      type: "event", title: "List an event",
      name: "Event name", tagHint: "what the event is, in a sentence",
      cities: STARTUP_CITIES, sectorLabel: "Event type",
      sectors: ["Conference", "Summit", "Expo", "Meetup", "Demo Day", "Hackathon", "Awards"],
      sectorPlaceholder: "Select a type…", stage: false, timing: true,
      founders: "Organiser", linkedin: "Organiser's LinkedIn"
    }
  };
  function setOptions(sel, values, placeholder, otherLabel) {
    while (sel.options.length) sel.remove(0);
    var p = document.createElement("option");
    p.value = ""; p.textContent = placeholder;
    sel.appendChild(p);
    values.forEach(function (v) {
      var o = document.createElement("option"); o.textContent = v; sel.appendChild(o);
    });
    var oth = document.createElement("option");
    oth.value = "Other"; oth.textContent = otherLabel;
    sel.appendChild(oth);
  }
  function applySubmitMode(mode) {
    submitMode = mode;
    var m = SUBMIT_MODES[mode];
    document.querySelectorAll(".submit-mode button").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-mode") === mode);
    });
    $("submitTitle").innerHTML = m.title + '<span class="accent">.</span>';
    $("lblName").textContent = m.name;
    $("lblTagHint").textContent = m.tagHint;
    $("lblSector").textContent = m.sectorLabel;
    $("lblFounders").textContent = m.founders;
    $("lblLinkedin").textContent = m.linkedin;
    $("stageField").classList.toggle("hidden", !m.stage);
    $("foundedField").classList.toggle("hidden", m.timing);
    $("timingField").classList.toggle("hidden", !m.timing);
    setOptions($("citySelect"), m.cities || INVESTOR_CITIES, "Select your city…", "Other — add your city");
    setOptions($("sectorSelect"), m.sectors, m.sectorPlaceholder, "Other — tell us");
    $("cityOther").classList.add("hidden");
    $("sectorOther").classList.add("hidden");
  }
  document.querySelectorAll(".submit-mode button").forEach(function (b) {
    b.addEventListener("click", function () {
      var mode = b.getAttribute("data-mode");
      history.replaceState(null, "", mode === "startup" ? "#/submit" : "#/submit?as=" + mode);
      applySubmitMode(mode);
    });
  });

  [["citySelect", "cityOther"], ["sectorSelect", "sectorOther"]].forEach(function (pair) {
    $(pair[0]).addEventListener("change", function () {
      var other = $(pair[1]);
      other.classList.toggle("hidden", this.value !== "Other");
      if (this.value === "Other") other.focus();
    });
  });

  els.submitForm.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var f = els.submitForm;
    var city = f.city.value === "Other" ? f.cityOther.value.trim() : f.city.value;
    var sector = f.sector.value === "Other" ? f.sectorOther.value.trim() : f.sector.value;
    var data = {
      type: SUBMIT_MODES[submitMode].type,
      name: f.name.value.trim(), website: f.website.value.trim(),
      tagline: f.tagline.value.trim(), city: city,
      sector: sector, stage: submitMode === "startup" ? f.stage.value : "",
      timing: submitMode === "event" ? f.timing.value.trim() : "",
      founded: f.founded.value.trim(), founders: f.founders.value.trim(),
      linkedin: f.linkedin.value.trim(), email: f.email.value.trim(),
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
      msg.innerHTML = "<b>" + esc(data.name) + "</b> is in the review queue and will be " +
        "live on the registry within 24 hours. We'll send you an email" +
        (data.email ? " at " + esc(data.email) : "") + " once it's listed.";
      msg.classList.remove("hidden");
      toast("submission received");
    }
    if (DB.enabled) {
      var contact = { email: data.email, linkedin: data.linkedin };
      var fields = {
        type: data.type,
        name: data.name, tagline: data.tagline, website: data.website,
        city: data.city, sector: data.sector, stage: data.stage,
        founded: data.founded, founders: data.founders, timing: data.timing
      };
      DB.submit(fields, contact).then(ok).catch(function () {
        msg.textContent = "Couldn't send your submission — check your connection and try again.";
        msg.classList.remove("hidden");
        msg.classList.add("err");
      });
    } else if (CFG.formEndpoint) {
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

  $("fundToggle").addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-fund]");
    if (!b) return;
    state.fund = b.getAttribute("data-fund");
    history.replaceState(null, "", buildExploreHash());
    renderExplore();
  });

  /* ---------- boot ---------- */
  function boot(data) {
    if (!data.some(function (e) { return e.type === "vc"; })) {
      data = data.concat(window.VC_DATA || []);
    }
    if (!data.some(function (e) { return e.type === "incubator"; })) {
      data = data.concat(window.INCUBATOR_DATA || []);
    }
    if (!data.some(function (e) { return e.type === "event"; })) {
      data = data.concat(window.EVENT_DATA || []);
    }
    ALL = data;
    bySlug = {};
    ALL.forEach(function (e) { bySlug[e.slug] = e; });
    initFilters();
    renderHome();
    route();
  }
  var bundled = (window.STARTUP_DATA || []).concat(window.VC_DATA || [], window.INCUBATOR_DATA || []);
  if (DB.enabled) {
    var timeout = new Promise(function (resolve) { setTimeout(function () { resolve(null); }, 3500); });
    Promise.race([DB.fetchListings().catch(function () { return null; }), timeout])
      .then(function (rows) { boot(rows && rows.length ? rows : bundled); });
  } else {
    boot(bundled);
  }
})();
