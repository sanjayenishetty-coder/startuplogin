/* Startup Login — review console */
(function () {
  "use strict";

  /* ---------- access gate ---------- */
  var CFG = window.SL_CONFIG || {};
  var gateWrap = document.getElementById("gateWrap");
  var consoleWrap = document.getElementById("consoleWrap");
  function sha256hex(text) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) {
        return b.toString(16).padStart(2, "0");
      }).join("");
    });
  }
  function unlock() {
    gateWrap.classList.add("hidden");
    consoleWrap.classList.remove("hidden");
  }
  var DB = window.SL_DB || { enabled: false };
  if (DB.enabled) {
    // Database mode: real email + password sign-in (Supabase Auth).
    document.getElementById("gateEmail").classList.remove("hidden");
    document.getElementById("gateEmailLabel").classList.remove("hidden");
    document.getElementById("gatePassLabel").textContent = "Password";
    document.getElementById("gateDesc").textContent =
      "Sign in with your admin email and password to open the review queue.";
    gateWrap.classList.remove("hidden");
    DB.getSession().then(function (session) {
      if (session) { unlock(); onDbUnlock(); }
    });
    document.getElementById("gateForm").addEventListener("submit", function (ev) {
      ev.preventDefault();
      DB.signIn(document.getElementById("gateEmail").value.trim(),
                document.getElementById("gatePass").value)
        .then(function () { unlock(); onDbUnlock(); })
        .catch(function () {
          document.getElementById("gateErr").textContent =
            "Sign-in failed — check the email and password.";
          document.getElementById("gateErr").classList.remove("hidden");
        });
    });
  } else {
    var unlocked = false;
    try { unlocked = sessionStorage.getItem("sl_admin_ok") === "1"; } catch (e) {}
    if (!CFG.adminPassHash || unlocked || !window.crypto || !crypto.subtle) {
      unlock(); // no passcode configured (or no WebCrypto) — open console directly
    } else {
      gateWrap.classList.remove("hidden");
      document.getElementById("gateForm").addEventListener("submit", function (ev) {
        ev.preventDefault();
        var pass = document.getElementById("gatePass").value;
        sha256hex(pass).then(function (hex) {
          if (hex === CFG.adminPassHash) {
            try { sessionStorage.setItem("sl_admin_ok", "1"); } catch (e) {}
            unlock();
          } else {
            document.getElementById("gateErr").classList.remove("hidden");
            document.getElementById("gatePass").select();
          }
        });
      });
    }
  }

  var EXISTING = window.STARTUP_DATA || [];
  var ALL = EXISTING.concat(window.VC_DATA || []);

  function onDbUnlock() {
    document.getElementById("dbModeNote").classList.remove("hidden");
    document.getElementById("exportBar").classList.add("hidden");
    document.querySelector(".export-steps").classList.add("hidden");
    document.getElementById("refreshDbBtn").classList.remove("hidden");
    document.getElementById("loadLocalBtn").classList.add("hidden");
    DB.fetchListings().then(function (rows) {
      if (rows && rows.length) ALL = rows;   // dup-check against the real registry
    }).catch(function () {});
    loadPendingFromDb();
  }
  function loadPendingFromDb() {
    DB.fetchPending().then(function (rows) {
      queue = rows.map(function (r) {
        return { data: r, status: "pending", dbid: r.id };
      });
      selected = -1;
      renderQueue();
      toast(rows.length ? rows.length + " submission" + (rows.length === 1 ? "" : "s") + " waiting for review"
                        : "No pending submissions right now");
    }).catch(function () { toast("Couldn't load submissions — check your connection"); });
  }

  // city -> [state, lat, lng] (mirrors scripts/transform_data.py)
  var CITY_INFO = {
    "Bengaluru": ["Karnataka", 12.9716, 77.5946], "Bangalore": ["Karnataka", 12.9716, 77.5946],
    "Hyderabad": ["Telangana", 17.426, 78.452], "Mumbai": ["Maharashtra", 19.076, 72.8777],
    "Pune": ["Maharashtra", 18.5204, 73.8567], "Delhi": ["Delhi NCR", 28.6139, 77.209],
    "New Delhi": ["Delhi NCR", 28.6139, 77.209], "Gurugram": ["Delhi NCR", 28.4595, 77.0266],
    "Gurgaon": ["Delhi NCR", 28.4595, 77.0266], "Noida": ["Delhi NCR", 28.5355, 77.391],
    "Faridabad": ["Delhi NCR", 28.4089, 77.3178], "Ghaziabad": ["Delhi NCR", 28.6692, 77.4538],
    "Chennai": ["Tamil Nadu", 13.0827, 80.2707], "Coimbatore": ["Tamil Nadu", 11.0168, 76.9558],
    "Jaipur": ["Rajasthan", 26.9124, 75.7873], "Kota": ["Rajasthan", 25.2138, 75.8648],
    "Ahmedabad": ["Gujarat", 23.0225, 72.5714], "Surat": ["Gujarat", 21.1702, 72.8311],
    "Indore": ["Madhya Pradesh", 22.7196, 75.8577], "Bhopal": ["Madhya Pradesh", 23.2599, 77.4126],
    "Kolkata": ["West Bengal", 22.5726, 88.3639], "Lucknow": ["Uttar Pradesh", 26.8467, 80.9462],
    "Kanpur": ["Uttar Pradesh", 26.4499, 80.3319], "Bhubaneswar": ["Odisha", 20.2961, 85.8245],
    "Roorkee": ["Uttarakhand", 29.8543, 77.888], "Dehradun": ["Uttarakhand", 30.3165, 78.0322],
    "Ahmednagar": ["Maharashtra", 19.0948, 74.748], "Nagpur": ["Maharashtra", 21.1458, 79.0882],
    "Nashik": ["Maharashtra", 19.9975, 73.7898], "Chandigarh": ["Chandigarh", 30.7333, 76.7794],
    "Mohali": ["Punjab", 30.7046, 76.7179], "Kochi": ["Kerala", 9.9312, 76.2673],
    "Thiruvananthapuram": ["Kerala", 8.5241, 76.9366], "Visakhapatnam": ["Andhra Pradesh", 17.6868, 83.2185],
    "Vijayawada": ["Andhra Pradesh", 16.5062, 80.648], "Guwahati": ["Assam", 26.1445, 91.7362],
    "Patna": ["Bihar", 25.5941, 85.1376], "Ranchi": ["Jharkhand", 23.3441, 85.3096],
    "Goa": ["Goa", 15.4909, 73.8278]
  };
  var STAGES = ["Pre-seed", "Seed", "Series A", "Series B", "Series C+", "Bootstrapped", "Public", "Acquired"];

  var $ = function (id) { return document.getElementById(id); };
  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  var MONO_COLORS = ["#2456f5", "#7048e8", "#0ca678", "#e8590c", "#c2255c", "#1098ad",
    "#5f3dc4", "#e67700", "#2f9e44", "#d6336c", "#3b5bdb", "#0b7285"];
  function colorFor(name) {
    var h = 0;
    for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return MONO_COLORS[h % MONO_COLORS.length];
  }
  function toast(msg) {
    var t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(function () { t.classList.remove("show"); }, 2400);
  }
  function slugify(name) {
    var s = String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return s || "startup";
  }
  function normName(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, ""); }

  /* ---------- queue ---------- */
  var queue = [];   // {data:{...}, status:'pending'|'approved'|'rejected', entry?}
  var selected = -1;

  var KEY_MAP = {
    name: "name", "company name": "name", company: "name", startup: "name",
    website: "website", weblink: "website", url: "website",
    tagline: "tagline", "one-line description": "tagline", "one liner": "tagline", oneliner: "tagline",
    description: "description",
    city: "city", location: "city",
    sector: "sector", industry: "sector",
    stage: "stage",
    email: "email", "your email": "email", "submitter email": "email",
    linkedin: "linkedin", "founder linkedin": "linkedin",
    "founder's linkedin": "linkedin", "founder linkedin profile": "linkedin",
    founded: "founded", "founded year": "founded",
    founders: "founders", founder: "founders",
    timing: "timing", "when does it happen?": "timing",
    submittedat: "submittedAt", date: "submittedAt"
  };

  function normalizeKeys(obj) {
    var out = {};
    Object.keys(obj).forEach(function (k) {
      var mk = KEY_MAP[k.trim().toLowerCase()];
      if (mk && obj[k] != null && String(obj[k]).trim() !== "") out[mk] = String(obj[k]).trim();
    });
    return out;
  }

  function parsePaste(text) {
    text = text.trim();
    if (!text) return [];
    // JSON: object or array
    try {
      var j = JSON.parse(text);
      var arr = Array.isArray(j) ? j : [j];
      return arr.map(normalizeKeys).filter(function (o) { return o.name; });
    } catch (e) { /* fall through */ }
    // key: value lines; blank line separates multiple submissions
    var blocks = text.split(/\n\s*\n/);
    var out = [];
    blocks.forEach(function (block) {
      try {
        var jb = JSON.parse(block);
        (Array.isArray(jb) ? jb : [jb]).forEach(function (o) {
          var n = normalizeKeys(o);
          if (n.name) out.push(n);
        });
        return;
      } catch (e) { /* not JSON — parse as key: value lines */ }
      var obj = {};
      block.split("\n").forEach(function (line) {
        var m = line.match(/^\s*"?([A-Za-z][A-Za-z /-]{0,30})"?\s*[:=]\s*(.+?)\s*,?\s*$/);
        if (m) obj[m[1]] = m[2].replace(/^"|"$/g, "");
      });
      var n = normalizeKeys(obj);
      if (n.name) out.push(n);
    });
    return out;
  }

  function addToQueue(items) {
    items.forEach(function (d) { queue.push({ data: d, status: "pending" }); });
    renderQueue();
    if (items.length) {
      selectItem(queue.length - items.length);
      toast(items.length + " submission" + (items.length === 1 ? "" : "s") + " added to the queue");
    } else {
      toast("Couldn't find a submission in that text — it needs at least a name");
    }
  }

  function renderQueue() {
    var html = queue.map(function (q, i) {
      return '<div class="queue-item' + (i === selected ? " sel" : "") + '" data-i="' + i + '">' +
        "<div><div class=\"q-name\">" + esc(q.data.name) + "</div>" +
        '<div class="q-meta">' + esc([q.data.city, q.data.stage].filter(Boolean).join(" · ") || "—") + "</div></div>" +
        '<span class="q-status ' + q.status + '">' + q.status.toUpperCase() + "</span></div>";
    }).join("");
    $("queueList").innerHTML = html;
    $("queueEmpty").classList.toggle("hidden", queue.length > 0);
    var approved = queue.filter(function (q) { return q.status === "approved"; }).length;
    $("approvedCount").textContent = approved;
  }
  $("queueList").addEventListener("click", function (ev) {
    var t = ev.target.closest("[data-i]");
    if (t) selectItem(+t.getAttribute("data-i"));
  });

  /* ---------- editor ---------- */
  var FIELDS = ["name", "website", "city", "sector", "stage", "founded", "timing", "founders", "linkedin", "email", "tagline", "description"];
  function selectItem(i) {
    selected = i;
    var q = queue[i];
    $("editorEmpty").classList.add("hidden");
    $("editorBody").classList.remove("hidden");
    FIELDS.forEach(function (f) { $("f_" + f).value = q.data[f] || ""; });
    if (q.entry) FIELDS.forEach(function (f) {
      if (f !== "email" && q.entry[f] != null) $("f_" + f).value = q.entry[f];
    });
    renderQueue();
    refreshPreview();
  }
  function readEditor() {
    var d = {};
    FIELDS.forEach(function (f) { d[f] = $("f_" + f).value.trim(); });
    return d;
  }

  function dupCheck(name) {
    var v = normName(name);
    var hit = v.length >= 3 && ALL.find(function (e) { return normName(e.name) === v; });
    var w = $("dupWarn");
    if (hit) {
      w.innerHTML = "Already on the registry as <b>" + esc(hit.name) + "</b> (" +
        esc(hit.city || "—") + "). Approving this will add a duplicate — treat it as an update instead: " +
        "edit the existing entry in <span style=\"font-family:var(--font-mono)\">data/startups.js</span>.";
      w.classList.remove("hidden");
    } else {
      w.classList.add("hidden");
    }
    return !!hit;
  }

  function buildEntry(d) {
    var cityKey = Object.keys(CITY_INFO).find(function (c) {
      return c.toLowerCase() === d.city.toLowerCase();
    });
    var info = cityKey ? CITY_INFO[cityKey] : null;
    var slug = slugify(d.name);
    var slugs = {};
    ALL.forEach(function (e) { slugs[e.slug] = 1; });
    queue.forEach(function (q) { if (q.entry) slugs[q.entry.slug] = 1; });
    while (slugs[slug]) slug += "-2";
    var srcType = (selected >= 0 && queue[selected] && queue[selected].data.type) || "startup";
    var entry = {
      name: d.name, type: srcType === "vc" ? "vc" : srcType,
      tagline: d.tagline, description: d.description || "",
      website: d.website && !/^https?:/.test(d.website) ? "https://" + d.website : d.website,
      city: cityKey || (d.city || ""), state: info ? info[0] : (d.city ? "India" : ""),
      sector: d.sector || "Others", industry: "",
      stage: d.stage || "", founded: (d.founded.match(/\d{4}/) || [""])[0],
      timing: d.timing || "",
      founders: d.founders || "", investors: "", funding: "",
      slug: slug
    };
    if (info) {
      entry.lat = +(info[1] + (Math.random() - 0.5) * 0.09).toFixed(5);
      entry.lng = +(info[2] + (Math.random() - 0.5) * 0.09).toFixed(5);
    }
    return entry;
  }

  function refreshPreview() {
    var d = readEditor();
    dupCheck(d.name);
    var e = buildEntry(d);
    var meta = [];
    if (e.city) meta.push('<span class="code">' + esc(e.city.slice(0, 3).toUpperCase()) + "</span>");
    if (e.sector) meta.push(esc(e.sector));
    if (e.stage) meta.push(esc(e.stage.toUpperCase()));
    $("previewCard").innerHTML =
      '<article class="reg-card">' +
      '<div class="card-top"><div class="monogram" style="background:' + colorFor(e.name || "?") + '">' +
      esc((e.name || "?").charAt(0).toUpperCase()) + "</div>" +
      "<div><div class=\"card-name\">" + esc(e.name || "…") + "</div>" +
      '<div class="card-meta">' + meta.join(" · ") + "</div></div></div>" +
      '<p class="card-tagline">' + esc(e.tagline || "…") + "</p>" +
      '<div class="card-foot">' +
      (e.founded ? '<span class="tag">EST ' + esc(e.founded) + "</span>" : "") +
      "</div></article>";
  }
  FIELDS.forEach(function (f) {
    $("f_" + f).addEventListener("input", refreshPreview);
  });

  $("approveBtn").addEventListener("click", function () {
    if (selected < 0) return;
    var d = readEditor();
    if (!d.name || !d.tagline) { toast("Name and one-liner are required before approving"); return; }
    if (!d.city || !Object.keys(CITY_INFO).some(function (c) { return c.toLowerCase() === d.city.toLowerCase(); })) {
      if (!d.city) { toast("Add a city so the startup appears on the map and city pages"); return; }
    }
    var entry = buildEntry(d);
    var item = queue[selected];
    if (item.dbid) {
      DB.approve(item.dbid, entry).then(function () {
        item.entry = entry;
        item.status = "approved";
        Object.assign(item.data, d);
        renderQueue();
        toast(d.name + " is LIVE on the registry");
      }).catch(function () { toast("Couldn't publish — check your connection and try again"); });
      return;
    }
    item.entry = entry;
    item.status = "approved";
    Object.assign(item.data, d);
    renderQueue();
    toast(d.name + " approved — export when you're done reviewing");
  });
  $("rejectBtn").addEventListener("click", function () {
    if (selected < 0) return;
    var item = queue[selected];
    if (item.dbid) {
      DB.reject(item.dbid).then(function () {
        item.status = "rejected"; item.entry = null;
        renderQueue();
        toast("Rejected — it won't appear on the registry");
      }).catch(function () { toast("Couldn't update — try again"); });
      return;
    }
    item.status = "rejected";
    item.entry = null;
    renderQueue();
    toast("Rejected — it won't be included in the export");
  });

  /* ---------- ingest ---------- */
  $("parseBtn").addEventListener("click", function () {
    addToQueue(parsePaste($("pasteBox").value));
    $("pasteBox").value = "";
  });
  $("refreshDbBtn").addEventListener("click", loadPendingFromDb);
  $("loadLocalBtn").addEventListener("click", function () {
    var box = [];
    try { box = JSON.parse(localStorage.getItem("sl_submissions") || "[]"); } catch (e) {}
    if (!box.length) { toast("No test submissions found in this browser"); return; }
    addToQueue(box.map(normalizeKeys));
  });

  /* ---------- export ---------- */
  function approvedEntries() {
    return queue.filter(function (q) { return q.status === "approved" && q.entry; })
      .map(function (q) { return q.entry; });
  }
  $("exportBtn").addEventListener("click", function () {
    var add = approvedEntries();
    if (!add.length) { toast("Nothing approved yet — approve a submission first"); return; }
    var all = EXISTING.concat(add);
    var js = "// Auto-generated by scripts/transform_data.py — do not edit by hand.\n" +
      "// Regenerate: python3 scripts/transform_data.py <sheet1.csv> [sheet2.xlsx ...]\n" +
      "// (" + add.length + " entr" + (add.length === 1 ? "y" : "ies") + " added via the review console on " +
      new Date().toISOString().slice(0, 10) + ")\n" +
      "window.STARTUP_DATA = " + JSON.stringify(all, null, 1) + ";\n";
    var blob = new Blob([js], { type: "text/javascript" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "startups.js";
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast("startups.js downloaded — commit it to data/startups.js to publish");
  });
  $("copyBtn").addEventListener("click", function () {
    var add = approvedEntries();
    if (!add.length) { toast("Nothing approved yet"); return; }
    var text = JSON.stringify(add, null, 1);
    (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject())
      .then(function () { toast(add.length + " entr" + (add.length === 1 ? "y" : "ies") + " copied as JSON"); })
      .catch(function () { toast("Copy failed — use the download instead"); });
  });

  /* ---------- boot ---------- */
  var cityDl = $("cityList");
  Object.keys(CITY_INFO).sort().forEach(function (c) {
    var o = document.createElement("option"); o.value = c; cityDl.appendChild(o);
  });
  var secDl = $("sectorList");
  var sectors = { "Others": 1, "VC Funds": 1, "Angel Networks / Funds": 1, "Family Office": 1,
    "Private Equities": 1, "Micro PE / VC": 1, "Angels": 1, "Incubator": 1, "Accelerator": 1 };
  EXISTING.forEach(function (e) { if (e.sector) sectors[e.sector] = 1; });
  Object.keys(sectors).sort().forEach(function (s) {
    var o = document.createElement("option"); o.value = s; secDl.appendChild(o);
  });
  var stSel = $("f_stage");
  STAGES.forEach(function (s) {
    var o = document.createElement("option"); o.textContent = s; stSel.appendChild(o);
  });
})();
