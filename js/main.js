/* Southwest Design Studio: shared interactions (v3).
   Content is complete without JS; everything here layers motion, saving and players on top. */
(function () {
  var d = document, root = d.documentElement, body = d.body;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = matchMedia("(pointer: fine)").matches;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var brand = $(".hd .brand"), BASE = brand && brand.getAttribute("href") !== "./" ? brand.getAttribute("href") : "";
  var ARROW = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
  var X = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13"/></svg>';
  var play = function (v) { if (!v) return; if (!v.getAttribute("src") && v.dataset.src) v.src = v.dataset.src; v.muted = true; try { var p = v.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {} };
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  /* ---- tile mosaic: loader on home, transitions between pages ---- */
  var tiles = $(".tiles");
  function tileDelays() {
    if (!tiles) return;
    var cols = innerWidth >= 1000 ? 8 : 4;
    $$("i", tiles).forEach(function (t, k) { var c = k % cols, r = Math.floor(k / cols); t.style.setProperty("--d", ((c + r) * 0.035).toFixed(3) + "s"); });
  }
  tileDelays();
  var revealed = false;
  function revealTiles() {
    if (revealed || !tiles) return; revealed = true;
    try { sessionStorage.removeItem("swds-tr"); } catch (e) {}
    requestAnimationFrame(function () { tiles.classList.add("gone"); setTimeout(function () { root.classList.remove("tr-in"); body.classList.add("tiles-done"); }, 1200); });
  }
  var startedCovered = root.classList.contains("tr-in") || body.classList.contains("pg-home");
  if (reduce || !startedCovered) revealTiles();
  else if (body.classList.contains("pg-home")) {
    var t0 = Date.now();
    (function wait() { var w = window.SWDS_WALK; if ((w && w.firstFrame()) || Date.now() - t0 > 1600) setTimeout(revealTiles, Math.max(0, 650 - (Date.now() - t0))); else setTimeout(wait, 60); })();
  } else { (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(function () { setTimeout(revealTiles, 80); }); setTimeout(revealTiles, 900); }
  addEventListener("pageshow", function (e) { if (e.persisted && tiles) { tiles.classList.remove("cover"); tiles.classList.add("gone"); } });
  if (tiles && !reduce) {
    d.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button || a.target === "_blank") return;
      var url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.protocol.indexOf("http") !== 0) return;
      if (url.pathname === location.pathname && url.hash) return;
      e.preventDefault();
      try { sessionStorage.setItem("swds-tr", "1"); } catch (er) {}
      tiles.classList.remove("gone");
      var word = $(".tl-word", tiles), lab = (a.textContent || "").replace(/\s+/g, " ").replace(/^0\d/, "").trim();
      if (word && lab && lab.length < 28) word.textContent = lab;
      tiles.classList.add("cover");
      setTimeout(function () { location.href = url.href; }, 620);
    });
  }

  /* ---- header + menu ---- */
  var hd = $(".hd"), lastY = scrollY, mb = $(".menu-btn"), menu = $("#menu");
  addEventListener("scroll", function () {
    var y = scrollY;
    if (hd && !(menu && menu.classList.contains("open"))) { if (y > 160 && y > lastY + 2) hd.classList.add("hide"); else if (y < lastY - 2 || y < 160) hd.classList.remove("hide"); }
    lastY = y;
  }, { passive: true });
  if (mb && menu) {
    menu.setAttribute("inert", "");
    var setMenu = function (open) {
      menu.classList.toggle("open", open); mb.setAttribute("aria-expanded", open ? "true" : "false");
      body.style.overflow = open ? "hidden" : ""; open ? menu.removeAttribute("inert") : menu.setAttribute("inert", "");
      if (open) { var f = $("a", menu); f && f.focus(); }
    };
    mb.addEventListener("click", function () { setMenu(!menu.classList.contains("open")); });
    d.addEventListener("keydown", function (e) { if (e.key === "Escape" && menu.classList.contains("open")) { setMenu(false); mb.focus(); } });
  }

  /* ---- smooth scroll on desktop only (touch keeps native momentum) ---- */
  var lenis = null;
  if (fine && !reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95 });
    window.SWDS_LENIS = lenis;
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
  }

  /* ---- reveals ---- */
  if (!reduce && "IntersectionObserver" in window) {
    var rio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); if (e.target.classList.contains("crafts")) e.target.classList.add("wave"); rio.unobserve(e.target); } }); }, { rootMargin: "0px 0px -6% 0px" });
    $$(".rv, .crafts").forEach(function (el) { rio.observe(el); });
  } else $$(".rv").forEach(function (el) { el.classList.add("in"); });

  /* ---- custom cursor ---- */
  if (fine && !reduce) {
    var cur = d.createElement("div"); cur.className = "cur"; cur.setAttribute("aria-hidden", "true"); cur.innerHTML = "<span></span>"; body.appendChild(cur);
    var cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy, lab = $("span", cur);
    addEventListener("pointermove", function (e) {
      tx = e.clientX; ty = e.clientY;
      var t = e.target.closest && e.target.closest("[data-cursor]");
      var hit = e.target.closest && e.target.closest("a,button,input,textarea");
      if (t && (!hit || hit === t || hit.classList.contains("st-tap"))) { lab.textContent = t.getAttribute("data-cursor"); cur.classList.add("lab"); } else cur.classList.remove("lab");
      cur.style.opacity = hit && !cur.classList.contains("lab") ? ".45" : "";
    }, { passive: true });
    d.addEventListener("pointerleave", function () { cur.classList.add("hide"); });
    d.addEventListener("pointerenter", function () { cur.classList.remove("hide"); });
    (function loop() { cx += (tx - cx) * 0.25; cy += (ty - cy) * 0.25; cur.style.transform = "translate3d(" + cx + "px," + cy + "px,0)"; requestAnimationFrame(loop); })();
  }

  /* ---- lazy ambient video: load near view, play only while visible ---- */
  var lvs = $$("video.lv");
  if (lvs.length && "IntersectionObserver" in window) {
    var vio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { var v = e.target; if (e.isIntersecting) { if (!reduce) play(v); } else if (!v.paused) v.pause(); });
    }, { rootMargin: "150px 0px", threshold: 0.12 });
    lvs.forEach(function (v) { vio.observe(v); });
  }

  /* ---- sheet (bottom sheet on phones, centered drawer on wider screens) ---- */
  var bd = d.createElement("div"); bd.className = "sheet-bd";
  var sheet = d.createElement("div"); sheet.className = "sheet"; sheet.setAttribute("role", "dialog"); sheet.setAttribute("aria-modal", "true");
  body.appendChild(bd); body.appendChild(sheet);
  var opener = null;
  function openSheet(html, label) {
    opener = d.activeElement;
    sheet.setAttribute("aria-label", label || "Details");
    sheet.innerHTML = '<div class="grab" aria-hidden="true"></div><div class="sheet-in"><button class="s-x" type="button" aria-label="Close">' + X + "</button>" + html + "</div>";
    sheet.scrollTop = 0;
    bd.classList.add("open"); sheet.classList.add("open");
    if (lenis) lenis.stop(); body.style.overflow = "hidden";
    $(".s-x", sheet).addEventListener("click", closeSheet);
    bindSaves(sheet);
    $$("video", sheet).forEach(function (v) { if (!reduce) play(v); });
    setTimeout(function () { var f = $(".s-x", sheet); f && f.focus({ preventScroll: true }); }, 80);
  }
  function closeSheet() {
    if (!sheet.classList.contains("open")) return;
    sheet.classList.remove("open"); bd.classList.remove("open");
    if (lenis) lenis.start(); body.style.overflow = "";
    $$("video", sheet).forEach(function (v) { v.pause(); });
    opener && opener.focus && opener.focus({ preventScroll: true });
  }
  bd.addEventListener("click", closeSheet);
  d.addEventListener("keydown", function (e) { if (e.key === "Escape") closeSheet(); });
  var sy = 0; sheet.addEventListener("touchstart", function (e) { sy = e.touches[0].clientY; }, { passive: true });
  sheet.addEventListener("touchend", function (e) { if (sheet.scrollTop <= 0 && e.changedTouches[0].clientY - sy > 80) closeSheet(); });

  /* ---- visit list ---- */
  var KEY = "swds-visit";
  var vbar = d.createElement("div"); vbar.className = "vbar";
  vbar.innerHTML = '<span class="ct">0</span><span class="lb">saved for your visit</span><button class="go" type="button">View list</button>';
  body.appendChild(vbar);
  var VL = {
    items: [],
    load: function () { try { this.items = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { this.items = []; } },
    save: function () { try { localStorage.setItem(KEY, JSON.stringify(this.items)); } catch (e) {} },
    has: function (id) { return this.items.some(function (x) { return x.id === id; }); },
    add: function (id, label) { if (!this.has(id)) { this.items.push({ id: id, label: label }); this.save(); this.paint(true); } },
    remove: function (id) { this.items = this.items.filter(function (x) { return x.id !== id; }); this.save(); this.paint(); },
    toggle: function (id, label) { this.has(id) ? this.remove(id) : this.add(id, label); },
    paint: function (bump) {
      var n = this.items.length;
      vbar.classList.toggle("show", n > 0 && !body.classList.contains("pg-visit"));
      $(".ct", vbar).textContent = n;
      if (bump && !reduce) { vbar.classList.remove("bump"); void vbar.offsetWidth; vbar.classList.add("bump"); }
      $$(".y-count").forEach(function (c) { c.textContent = n; });
      d.dispatchEvent(new CustomEvent("vl:change"));
    }
  };
  function listSheet() {
    var rows = VL.items.map(function (x) { return '<li><span>' + esc(x.label) + '</span><button type="button" data-rm="' + esc(x.id) + '" aria-label="Remove ' + esc(x.label) + '">Remove</button></li>'; }).join("");
    openSheet('<h3>Your visit list</h3><p class="s-sub">We will have these pulled and waiting when you arrive.</p><ul>' + (rows || '<li><span>Nothing saved yet.</span></li>') + '</ul><a class="btn" href="' + BASE + 'visit/#preview">Send to a designer' + ARROW + "</a>", "Your visit list");
    $$("[data-rm]", sheet).forEach(function (b) { b.addEventListener("click", function () { VL.remove(b.getAttribute("data-rm")); b.closest("li").remove(); if (!VL.items.length) closeSheet(); }); });
  }
  $(".go", vbar).addEventListener("click", listSheet);
  function bindSaves(scope) {
    $$("[data-save]", scope).forEach(function (b) {
      if (b._sv) return; b._sv = 1;
      var paint = function () {
        var on = VL.has(b.getAttribute("data-save"));
        b.setAttribute("aria-pressed", on ? "true" : "false");
        if (b.hasAttribute("data-on")) { var t = $(".t", b) || b; t.textContent = b.getAttribute(on ? "data-on" : "data-off"); }
      };
      b.addEventListener("click", function () { VL.toggle(b.getAttribute("data-save"), b.getAttribute("data-label")); });
      d.addEventListener("vl:change", paint); paint();
    });
  }
  VL.load(); VL.paint(); bindSaves(d);
  window.SWDS_VL = VL;

  /* ---- doors: tap to peek, tap again to close; one open at a time ---- */
  var doors = $$(".door");
  function shut(door) {
    if (!door.classList.contains("peek")) return;
    door.classList.remove("peek");
    var btn = $(".hold", door), v = $("video", door);
    btn.textContent = "Peek inside"; btn.setAttribute("aria-expanded", "false");
    if (v) v.pause();
  }
  // wide doors (desktop) get the landscape cut, tall doors (phones) the portrait cut
  var fitDoor = function (door) {
    var v = $("video", door); if (!v || !v.dataset.srcL) return;
    var wide = door.clientWidth > door.clientHeight;
    if (!v._p) { v._p = v.getAttribute("poster"); v._s = v.dataset.src; }
    var want = wide ? v.dataset.srcL : v._s, pos = wide ? v.dataset.posterL : v._p;
    if (v.getAttribute("poster") !== pos) v.setAttribute("poster", pos);
    if (v.dataset.src !== want) { v.dataset.src = want; if (v.getAttribute("src")) { v.removeAttribute("src"); v.load(); } }
  };
  doors.forEach(fitDoor);
  addEventListener("resize", function () { doors.forEach(fitDoor); });
  doors.forEach(function (door) {
    var btn = $(".hold", door), media = $(".door-media", door), v = $("video", door);
    var toggle = function () {
      if (door.classList.contains("peek")) { shut(door); return; }
      doors.forEach(function (o) { if (o !== door) shut(o); });
      door.classList.add("peek"); btn.textContent = "Close"; btn.setAttribute("aria-expanded", "true");
      fitDoor(door); if (v) play(v);
    };
    btn.addEventListener("click", toggle);
    media.addEventListener("click", toggle);
  });

  /* ---- stories ---- */
  var st = $(".st-card");
  if (st) {
    var slides = $$(".st-s", st), bars = $$(".st-bars b", st), sv = $(".st-foot .save", st), idx = 0, startT = 0, held = false, inView = false, dur = 5000, pausedAt = 0;
    var slideV = function (i) { return $("video", slides[i]); };
    var show = function (i) {
      idx = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle("on", k === idx); var v = $("video", s); if (v && k !== idx) v.pause(); });
      bars.forEach(function (b, k) { b.style.setProperty("--p", k < idx ? 1 : 0); });
      var s = slides[idx]; sv.setAttribute("data-save", s.getAttribute("data-id")); sv.setAttribute("data-label", s.getAttribute("data-label"));
      sv.setAttribute("aria-pressed", VL.has(s.getAttribute("data-id")) ? "true" : "false");
      var v = slideV(idx); dur = 5000; startT = performance.now();
      if (v) { if (!v.getAttribute("src")) v.src = v.dataset.src; try { v.currentTime = 0; } catch (e) {} if (inView && !reduce) play(v); v.onloadedmetadata = function () { dur = Math.max(3500, Math.min(7000, (v.duration || 5) * 1000)); }; if (v.duration) dur = Math.max(3500, Math.min(7000, v.duration * 1000)); }
      var next = slideV((idx + 1) % slides.length); if (next && !next.getAttribute("src")) { next.preload = "auto"; next.src = next.dataset.src; }
    };
    sv._sv = 1;
    sv.addEventListener("click", function () { VL.toggle(sv.getAttribute("data-save"), sv.getAttribute("data-label")); });
    d.addEventListener("vl:change", function () { sv.setAttribute("aria-pressed", VL.has(sv.getAttribute("data-save")) ? "true" : "false"); });
    (function loop(now) {
      requestAnimationFrame(loop);
      if (!inView || held || reduce) return;
      var p = Math.min(1, (now - startT) / dur);
      bars[idx].style.setProperty("--p", p.toFixed(3));
      if (p >= 1) show(idx + 1);
    })(performance.now());
    $(".st-tap.prev", st).addEventListener("click", function () { show(idx - 1); });
    $(".st-tap.next", st).addEventListener("click", function () { show(idx + 1); });
    st.addEventListener("pointerdown", function (e) { if (e.target.closest(".save")) return; held = true; pausedAt = performance.now(); var v = slideV(idx); v && v.pause(); });
    var resume = function () { if (!held) return; held = false; startT += performance.now() - pausedAt; var v = slideV(idx); if (v && inView && !reduce) play(v); };
    st.addEventListener("pointerup", resume); st.addEventListener("pointerleave", resume); st.addEventListener("pointercancel", resume);
    st.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    st.setAttribute("tabindex", "0");
    st.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") show(idx + 1); if (e.key === "ArrowLeft") show(idx - 1); });
    new IntersectionObserver(function (es) {
      inView = es[0].isIntersecting;
      var v = slideV(idx);
      if (inView) { startT = performance.now() - (parseFloat(bars[idx].style.getPropertyValue("--p")) || 0) * dur; if (v && !reduce) play(v); } else if (v) v.pause();
    }, { threshold: 0.45 }).observe(st);
    show(0);
    if (reduce) $(".st-hint", st).textContent = "Tap for the next";
  }

  /* ---- make it yours: one kitchen, any finishes ---- */
  var kcards = $$(".k-card");
  kcards.forEach(function (c) {
    var id = "kitchen:" + c.getAttribute("data-k"), v = $("video", c);
    if (v) v.addEventListener("playing", function () { v.classList.add("ready"); });
    var paint = function () { var on = VL.has(id); c.setAttribute("aria-pressed", on ? "true" : "false"); if (on && v && v.dataset.src && !reduce) play(v); else if (v) v.pause(); };
    c.addEventListener("click", function () {
      var was = VL.has(id);
      kcards.forEach(function (o) { var oid = "kitchen:" + o.getAttribute("data-k"); if (oid !== id && VL.has(oid)) VL.remove(oid); });
      if (was) VL.remove(id); else VL.add(id, c.getAttribute("data-label"));
    });
    d.addEventListener("vl:change", paint); paint();
  });

  /* ---- make it yours: pick a room, then its finishes; tap a finish to see it up close ---- */
  var roomsEl = $("#rooms"), grid = $("#sw-grid");
  if (roomsEl && grid) {
    var ROOMS = JSON.parse(roomsEl.textContent), tabs = $$(".r-tab"), kstep = $(".y-kitchen"), flab = $(".y-flab"), curRoom = "kitchen";
    var CHECK = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5"/></svg>';
    var fid = function (room, k) { return "finish:" + room + ":" + k; };
    var flabel = function (room, label) { return label + " (" + ROOMS[room].t + ")"; };
    var paintGrid = function () { $$(".sw", grid).forEach(function (b) { b.setAttribute("aria-pressed", VL.has(b.getAttribute("data-id")) ? "true" : "false"); }); };
    var openFinish = function (room, it) {
      var id = fid(room, it[0]);
      openSheet('<div class="s-media"><img src="' + BASE + 'img/materials/' + esc(it[0]) + '.webp" alt="' + esc(it[1]) + '"></div><p class="num">' + esc(ROOMS[room].t) + '</p><h3 style="margin-top:.5rem">' + esc(it[1]) + '</h3><p class="s-sub">' + esc(it[2]) + ' Ask to see it on the showroom floor.</p>' +
        '<button class="btn add" type="button" data-save="' + esc(id) + '" data-label="' + esc(flabel(room, it[1])) + '" data-on="Saved to your visit. Tap to remove" data-off="Add to my visit"><span class="t">Add to my visit</span>' + CHECK + '</button>', it[1]);
    };
    var render = function (room) {
      curRoom = room;
      tabs.forEach(function (t) { var on = t.getAttribute("data-room") === room; t.setAttribute("aria-selected", on ? "true" : "false"); t.tabIndex = on ? 0 : -1; });
      if (kstep) kstep.hidden = room !== "kitchen";
      d.querySelector(".y-grid").classList.toggle("no-k", room !== "kitchen");
      if (flab) flab.textContent = (room === "kitchen" ? "3" : "2") + " \u00b7 " + (room === "kitchen" ? "FINISHES & APPLIANCES" : "FINISHES");
      grid.innerHTML = "";
      ROOMS[room].items.forEach(function (it) {
        var b = d.createElement("button");
        b.className = "sw"; b.type = "button"; b.setAttribute("data-id", fid(room, it[0])); b.setAttribute("aria-label", it[1] + ", see it up close");
        b.innerHTML = '<img src="' + BASE + 'img/materials/' + esc(it[0]) + '.webp" alt="" loading="lazy"><b>' + esc(it[1]) + '</b>';
        b.addEventListener("click", function () { openFinish(room, it); });
        grid.appendChild(b);
      });
      paintGrid();
    };
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { render(t.getAttribute("data-room")); });
      t.addEventListener("keydown", function (e) {
        var n = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (!n) return;
        var nx = tabs[(i + n + tabs.length) % tabs.length]; nx.focus(); render(nx.getAttribute("data-room"));
      });
    });
    d.addEventListener("vl:change", paintGrid);
    render("kitchen");
  }

  /* ---- about: film ---- */
  var film = $(".film");
  if (film) {
    var fv = $("video", film);
    $(".film-play", film).addEventListener("click", function () {
      fv.src = innerHeight > innerWidth * 1.05 && fv.dataset.portrait ? fv.dataset.portrait : fv.dataset.src;
      fv.controls = true; fv.loop = true; film.classList.add("playing"); play(fv);
    });
  }

  /* ---- portfolio gallery ---- */
  var track = $(".gal-track");
  if (track) {
    var gs = $$(".gal-s", track), gi = $(".gi"), gn = $(".gn"), active = null;
    var vis = function () { return gs.filter(function (s) { return !s.classList.contains("out"); }); };
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    var setActive = function (s) {
      if (!s || active === s) return; active = s;
      gs.forEach(function (o) { var v = $("video", o); if (v && o !== s) v.pause(); });
      var v = $("video", s); if (v && !reduce) play(v);
      gi.textContent = pad(vis().indexOf(s) + 1);
    };
    var gio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && e.intersectionRatio >= 0.6) setActive(e.target); }); }, { root: track, threshold: [0.6] });
    gs.forEach(function (s) { gio.observe(s); });
    var go = function (k) {
      var v = vis(), i = Math.max(0, v.indexOf(active)), n = v[Math.min(v.length - 1, Math.max(0, i + k))];
      if (n) track.scrollTo({ left: n.offsetLeft - (track.clientWidth - n.clientWidth) / 2, behavior: reduce ? "auto" : "smooth" });
    };
    $(".gp").addEventListener("click", function () { go(-1); });
    $(".gx").addEventListener("click", function () { go(1); });
    track.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") { e.preventDefault(); go(1); } if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); } });
    $$(".chips button").forEach(function (b, _, all) {
      b.addEventListener("click", function () {
        all.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        var f = b.getAttribute("data-f");
        gs.forEach(function (s) { s.classList.toggle("out", f !== "all" && s.getAttribute("data-cat") !== f); });
        gn.textContent = pad(vis().length); active = null; track.scrollLeft = 0; setActive(vis()[0]);
      });
    });
    gn.textContent = pad(gs.length); setActive(gs[0]);
    if (fine) {
      var down = false, sx0 = 0, sl0 = 0, moved = false;
      track.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") return; down = true; moved = false; sx0 = e.clientX; sl0 = track.scrollLeft; track.style.scrollSnapType = "none"; });
      addEventListener("pointermove", function (e) { if (!down) return; var dx = e.clientX - sx0; if (Math.abs(dx) > 4) moved = true; track.scrollLeft = sl0 - dx; });
      addEventListener("pointerup", function (e) { if (!down) return; down = false; track.style.scrollSnapType = ""; var dx = e.clientX - sx0; if (moved) go(dx < -40 ? 1 : dx > 40 ? -1 : 0); });
      track.setAttribute("data-cursor", "Drag");
    }
  }

  /* ---- visit: two-floor guide ---- */
  var zjson = $("#zones");
  if (zjson) {
    var Z = {}; try { Z = JSON.parse(zjson.textContent); } catch (e) {}
    var iso = $(".iso"), tabs = $$(".lvl-tabs [role=tab]"), lists = $$(".zlist");
    var light = function (k) { $$(".plate .zn").forEach(function (z) { z.classList.toggle("on", z.getAttribute("data-z") === k); }); $$(".zlist button").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-z") === k); }); };
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () {
        tabs.forEach(function (x, j) { x.setAttribute("aria-selected", j === i ? "true" : "false"); x.tabIndex = j === i ? 0 : -1; lists[j].hidden = j !== i; });
        iso.classList.toggle("l1", i === 0); iso.classList.toggle("l2", i === 1); light(null);
      });
      t.addEventListener("keydown", function (e) { var k = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (k) { var n = tabs[(i + k + tabs.length) % tabs.length]; n.focus(); n.click(); } });
    });
    $$(".zlist button").forEach(function (b) {
      b.addEventListener("pointerenter", function () { if (fine) light(b.getAttribute("data-z")); });
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-z"), z = Z[k]; if (!z) return; light(k);
        var media = z.v ? '<video muted loop playsinline poster="' + BASE + z.p + '" src="' + BASE + z.v + '"></video>' : '<img src="' + BASE + z.p + '" alt="">';
        openSheet('<div class="s-media' + (z.held ? " held" : "") + '">' + media + '</div><p class="num">Level 0' + z.lv + '</p><h3 style="margin-top:.5rem">' + esc(z.t) + '</h3><p class="s-sub">' + esc(z.d) + "</p>" + (z.b ? '<p class="s-brand">On display: ' + esc(z.b) + "</p>" : "") + '<button class="save" type="button" data-save="zone:' + k + '" data-label="' + esc(z.t) + '">Save to my visit</button>', z.t);
      });
    });
  }

  /* ---- private preview form (fields and endpoint unchanged) ---- */
  var form = d.getElementById("preview-form");
  if (form) {
    var note = d.getElementById("form-note");
    var legacy = { "black-brass": "Black & Brass kitchen", "bright-marble": "Bright Marble kitchen", "warm-charcoal": "Warm Charcoal kitchen" };
    var stp = new URLSearchParams(location.search).get("style");
    if (stp && legacy[stp]) VL.add("kitchen:" + stp, legacy[stp]);
    var chips = d.getElementById("vl-chips"), wrap = d.getElementById("vl-wrap");
    var line = function () { return VL.items.length ? "My visit list: " + VL.items.map(function (x) { return x.label; }).join("; ") + "." : ""; };
    var paintChips = function () {
      if (!chips) return;
      chips.innerHTML = ""; VL.items.forEach(function (x) { var s = d.createElement("span"); s.textContent = x.label; chips.appendChild(s); });
      wrap.hidden = !VL.items.length;
      var cv = form.message.value;
      if (!cv || cv.indexOf("My visit list:") === 0) form.message.value = line() ? line() + " " : "";
    };
    d.addEventListener("vl:change", paintChips); paintChips();
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.name.value.trim(), email = form.email.value.trim();
      if (!name || !email || email.indexOf("@") < 0) { note.textContent = "Please add your name and a valid email so we can reach you."; (!name ? form.name : form.email).focus(); return; }
      note.textContent = "Sending your request...";
      var btn = form.querySelector("button[type=submit]"); btn.disabled = true;
      var data = { name: name, phone: form.phone.value.trim(), email: email, message: form.message.value.trim(), _subject: "Private preview request - Southwest Design Studio" };
      fetch("https://formsubmit.co/ajax/orlando0895@yahoo.com", { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(data) })
        .then(function (r) { return r.json(); })
        .then(function () { note.textContent = "Thank you, " + name.split(" ")[0] + ". Your preview request is on its way. We will be in touch shortly."; form.reset(); })
        .catch(function () { note.textContent = "Something did not go through. Please call us at (877) 646-0167 instead."; })
        .then(function () { btn.disabled = false; });
    });
  }

  /* ---- walk hero: headline lines rise in as the tiles clear ---- */
  var lines = $$(".w-hero h1 .ln > span");
  if (lines.length && !reduce && lines[0].animate) {
    lines.forEach(function (s) { s.style.transform = "translateY(110%)"; });
    var iv = setInterval(function () {
      if (!revealed) return; clearInterval(iv);
      lines.forEach(function (s, k) { s.animate([{ transform: "translateY(110%)" }, { transform: "none" }], { duration: 1200, delay: 260 + k * 110, easing: "cubic-bezier(.16,1,.3,1)", fill: "forwards" }); });
    }, 50);
  }
  addEventListener("resize", tileDelays);
})();
