/* Startup Login — Supabase data layer.
   When config.js has supabaseUrl + supabaseAnonKey, the site reads live
   listings from the database and submissions insert straight into it.
   Without keys (or if the database is unreachable) everything falls back
   to the bundled data files, so the site never breaks. */
(function () {
  "use strict";
  var CFG = window.SL_CONFIG || {};
  var client = null;

  if (CFG.supabaseUrl && CFG.supabaseAnonKey && window.supabase) {
    try {
      client = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey);
    } catch (e) { client = null; }
  }

  var PUBLIC_COLS = "slug,name,type,tagline,description,website,city,state," +
    "sector,industry,stage,founded,founders,investors,funding,lat,lng,timing";

  window.SL_DB = {
    enabled: !!client,
    client: client,

    // All live listings, shaped exactly like the bundled data files.
    // Supabase caps every response at 1000 rows, so page until a short page.
    fetchListings: function () {
      if (!client) return Promise.reject(new Error("db not configured"));
      var PAGE = 1000;
      function page(from, acc) {
        return client.from("listings").select(PUBLIC_COLS).eq("status", "live")
          .order("created_at", { ascending: true })
          .range(from, from + PAGE - 1)
          .then(function (res) {
            if (res.error) throw res.error;
            var rows = res.data || [];
            acc = acc.concat(rows);
            if (rows.length < PAGE) return acc;
            return page(from + PAGE, acc);
          });
      }
      return page(0, []);
    },

    // Founder submission -> pending listing + private contact row.
    submit: function (fields, contact) {
      if (!client) return Promise.reject(new Error("db not configured"));
      var id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : null;
      var row = Object.assign({ status: "pending" }, fields);
      if (!row.timing) delete row.timing;   // column exists only after events.sql
      if (id) row.id = id;
      return client.from("listings").insert(row).then(function (res) {
        if (res.error) throw res.error;
        if (id && (contact.email || contact.linkedin)) {
          return client.from("contacts").insert({
            listing_id: id, email: contact.email || "", linkedin: contact.linkedin || ""
          }).then(function () { /* contact failure shouldn't fail the submission */ });
        }
      });
    },

    /* ---- admin (requires signed-in session; enforced by RLS) ---- */
    signIn: function (email, password) {
      return client.auth.signInWithPassword({ email: email, password: password })
        .then(function (res) {
          if (res.error) throw res.error;
          return res.data;
        });
    },
    getSession: function () {
      return client.auth.getSession().then(function (res) {
        return res.data ? res.data.session : null;
      });
    },
    signOut: function () { return client.auth.signOut(); },

    fetchPending: function () {
      return client.from("listings").select("*").eq("status", "pending")
        .order("created_at", { ascending: true })
        .then(function (res) {
          if (res.error) throw res.error;
          var listings = res.data || [];
          if (!listings.length) return listings;
          return client.from("contacts").select("listing_id,email,linkedin")
            .in("listing_id", listings.map(function (l) { return l.id; }))
            .then(function (cres) {
              var byId = {};
              (cres.data || []).forEach(function (c) { byId[c.listing_id] = c; });
              listings.forEach(function (l) {
                var c = byId[l.id] || {};
                l.email = c.email || "";
                l.linkedin = c.linkedin || "";
              });
              return listings;
            });
        });
    },
    approve: function (id, fields) {
      var row = Object.assign({}, fields, { status: "live" });
      return client.from("listings").update(row).eq("id", id).then(function (res) {
        if (res.error) throw res.error;
      });
    },
    // Fire the approval email (Edge Function). Resolves {sent, ...}; never throws
    // in a way that should block the approval itself.
    notifyApproved: function (id) {
      if (!client || !client.functions) return Promise.resolve({ sent: false });
      return client.functions.invoke("notify-approved", { body: { id: id } })
        .then(function (res) {
          if (res.error) throw res.error;
          return res.data || { sent: false };
        });
    },

    reject: function (id) {
      return client.from("listings").update({ status: "rejected" }).eq("id", id)
        .then(function (res) { if (res.error) throw res.error; });
    },
    // Admin: push every bundled listing into the database (insert or update
    // by slug), so a deploy + one click replaces running SQL migrations.
    syncBundled: function (rows, onProgress) {
      if (!client) return Promise.reject(new Error("db not configured"));
      var clean = rows.map(function (r) {
        var row = {
          slug: r.slug, name: r.name, type: r.type, tagline: r.tagline || "",
          description: r.description || "", website: r.website || "",
          city: r.city || "", state: r.state || "", sector: r.sector || "",
          industry: r.industry || "", stage: r.stage || "",
          founded: r.founded || "", founders: r.founders || "",
          investors: r.investors || "", funding: r.funding || "",
          lat: (typeof r.lat === "number") ? r.lat : null,
          lng: (typeof r.lng === "number") ? r.lng : null,
          timing: r.timing || "", status: "live"
        };
        return row;
      });
      var CHUNK = 100, done = 0;
      function step() {
        if (done >= clean.length) return Promise.resolve(clean.length);
        var part = clean.slice(done, done + CHUNK);
        return client.from("listings").upsert(part, { onConflict: "slug" })
          .then(function (res) {
            if (res.error) throw res.error;
            done += part.length;
            if (onProgress) onProgress(done, clean.length);
            return step();
          });
      }
      return step();
    },

    liveSlugs: function () {
      return client.from("listings").select("slug").then(function (res) {
        return (res.data || []).map(function (r) { return r.slug; });
      });
    }
  };
})();
