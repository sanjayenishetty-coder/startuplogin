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
    "sector,industry,stage,founded,founders,investors,funding,lat,lng";

  window.SL_DB = {
    enabled: !!client,
    client: client,

    // All live listings, shaped exactly like the bundled data files.
    fetchListings: function () {
      if (!client) return Promise.reject(new Error("db not configured"));
      return client.from("listings").select(PUBLIC_COLS).eq("status", "live")
        .order("created_at", { ascending: true }).limit(5000)
        .then(function (res) {
          if (res.error) throw res.error;
          return res.data || [];
        });
    },

    // Founder submission -> pending listing + private contact row.
    submit: function (fields, contact) {
      if (!client) return Promise.reject(new Error("db not configured"));
      var id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : null;
      var row = Object.assign({ status: "pending" }, fields);
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
    reject: function (id) {
      return client.from("listings").update({ status: "rejected" }).eq("id", id)
        .then(function (res) { if (res.error) throw res.error; });
    },
    liveSlugs: function () {
      return client.from("listings").select("slug").then(function (res) {
        return (res.data || []).map(function (r) { return r.slug; });
      });
    }
  };
})();
