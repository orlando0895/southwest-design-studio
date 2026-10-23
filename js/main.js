/* Southwest Design Studio: shared interactions.
   Everything here enhances content that is already readable without JS. */
(function () {
  var d = document, root = d.documentElement;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = matchMedia("(pointer: fine)").matches;
  root.classList.add("js");
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var brandHref = ($(".hd .brand") || {}).getAttribute ? $(".hd .brand").getAttribute("href") : "./";
  var BASE = brandHref === "./" ? "" : brandHref;      // "" on home, "../" on inner pages
  var ARROW = '<span class="ar" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 8h10M9 4l4 4-4 4"/></svg></span>';
  var safePlay = function (v) { try { var p = v.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {} };

  /* ---- mobile menu ---- */
  var menu = $(".menu"), mnav = $(".mnav");
  if (menu && mnav) {
    var setMenu = function (open) {
      mnav.classList.toggle("open", open);
      menu.setAttribute("aria-expanded", open ? "true" : "false");
      menu.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      d.body.style.overflow = open ? "hidden" : "";
      mnav.toggleAttribute("inert", !open);
      if (open) { var f = $("a", mnav); f && f.focus(); }
    };
    mnav.setAttribute("inert", "");
    menu.addEventListener("click", function () { setMenu(!mnav.classList.contains("open")); });
    d.addEventListener("keydown", function (e) { if (e.key === "Escape" && mnav.classList.contains("open")) { setMenu(false); menu.focus(); } });
  }

  /* ---- header hides on scroll down, returns on scroll up ---- */
  var hd = $(".hd"), lastY = 0;
  addEventListener("scroll", function () {
    var y = scrollY;
    if (hd) hd.classList.toggle("hide", y > 240 && y > lastY && !(mnav && mnav.classList.contains("open")));
    lastY = y;
  }, { passive: true });

  /* ---- smooth scroll + GSAP choreography ---- */
  var hasG = window.gsap && window.ScrollTrigger;
  if (hasG) gsap.registerPlugin(ScrollTrigger);
  if (hasG && !reduce && window.Lenis) {
    var lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) { var t = $(a.getAttribute("href")); if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -20 }); } });
    });
  }

  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    $$(".rv").forEach(function (el) { io.observe(el); });
  } else { $$(".rv").forEach(function (el) { el.classList.add("in"); }); }

  if (hasG && !reduce) {
    var lines = $$(".hero h1 .ln > span");
    if (lines.length) {
      gsap.from(lines, { yPercent: 110, duration: 1.2, ease: "expo.out", stagger: 0.09, delay: 0.15 });
      gsap.from(".hero .lede, .hero .row, .hero-meta", { y: 24, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.08, delay: 0.55 });
      gsap.to(".hero-media", { yPercent: 14, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    }
    $$(".ph img[data-par], .wide-ph img").forEach(function (img) {
      gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: img.parentNode, start: "top bottom", end: "bottom top", scrub: true } });
    });
    window.addEventListener("walk:ready", function () { ScrollTrigger.refresh(); });
  }

  /* ---- magnetic CTAs ---- */
  if (fine && !reduce) {
    $$(".btn.mag").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18) + "px," + ((e.clientY - r.top - r.height / 2) * 0.28) + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }

  /* ---- lazy videos: load near the viewport, play only while visible ---- */
  var lvs = $$("video.lv");
  if (lvs.length && "IntersectionObserver" in window) {
    var vio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          if (!v.src && v.dataset.src) v.src = v.dataset.src;
          if (!reduce || v.dataset.peek === "on") safePlay(v);
        } else if (!v.paused) v.pause();
      });
    }, { rootMargin: "200px 0px", threshold: 0.15 });
    lvs.forEach(function (v) { vio.observe(v); });
  }

  /* ---- hero film: portrait cut on tall screens, chapter caption, pause control ---- */
  var vid = $(".hero-film"), vbtn = $(".hero-ctrl button"), chap = $(".hero-chapter");
  if (vid) {
    vid.src = (vid.dataset.portrait && innerHeight > innerWidth * 1.05) ? vid.dataset.portrait : vid.dataset.landscape;
    vid.preload = "auto";
    if (!reduce) safePlay(vid);
    var chapters = [];
    try { chapters = JSON.parse(vid.dataset.chapters || "[]"); } catch (e) {}
    var lastC = "";
    vid.addEventListener("timeupdate", function () {
      if (!chap || !chapters.length) return;
      var t = vid.currentTime, c = chapters[0][1];
      chapters.forEach(function (x) { if (t >= x[0]) c = x[1]; });
      if (c !== lastC) { lastC = c; chap.style.opacity = 0; setTimeout(function () { chap.textContent = c; chap.style.opacity = 1; }, 250); }
    });
    var sync = function () {
      if (!vbtn) return;
      var p = vid.paused;
      vbtn.setAttribute("aria-label", p ? "Play showroom film" : "Pause showroom film");
      vbtn.innerHTML = p ? '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M4 2l10 6-10 6z"/></svg>' : '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M3 2h3.5v12H3zM9.5 2H13v12H9.5z"/></svg>';
    };
    vbtn && vbtn.addEventListener("click", function () { vid.paused ? safePlay(vid) : vid.pause(); sync(); });
    vid.addEventListener("play", sync); vid.addEventListener("pause", sync); sync();
  }

  /* ---- visit list: rooms and finishes the visitor wants waiting for them ---- */
  var KEY = "swds-visit";
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
      pill.classList.toggle("show", n > 0);
      $(".ct", pill).textContent = n;
      if (bump && !reduce) { pill.classList.remove("bump"); void pill.offsetWidth; pill.classList.add("bump"); }
      var ul = $("ul", drawer); ul.innerHTML = "";
      this.items.forEach(function (x) {
        var li = d.createElement("li"); li.textContent = x.label;
        var b = d.createElement("button"); b.type = "button"; b.textContent = "Remove"; b.setAttribute("aria-label", "Remove " + x.label);
        b.addEventListener("click", function () { VL.remove(x.id); });
        li.appendChild(b); ul.appendChild(li);
      });
      if (!n) drawer.classList.remove("open");
      d.dispatchEvent(new CustomEvent("vl:change"));
    }
  };
  var pill = d.createElement("button");
  pill.type = "button"; pill.className = "vl-pill"; pill.setAttribute("aria-expanded", "false");
  pill.innerHTML = '<span class="ct">0</span><span class="lbl">My visit list</span>'; pill.setAttribute("aria-label", "My visit list");
  var drawer = d.createElement("div");
  drawer.className = "vl-drawer"; drawer.setAttribute("role", "dialog"); drawer.setAttribute("aria-label", "My visit list");
  drawer.innerHTML = '<h4>Your visit list</h4><p class="s">We will have these pulled and waiting when you arrive.</p><ul></ul><a class="btn" href="' + BASE + 'visit/#preview">Send to a designer' + ARROW + '</a>';
  d.body.appendChild(drawer); d.body.appendChild(pill);
  pill.addEventListener("click", function () { var o = drawer.classList.toggle("open"); pill.setAttribute("aria-expanded", o ? "true" : "false"); });
  d.addEventListener("keydown", function (e) { if (e.key === "Escape" && drawer.classList.contains("open")) { drawer.classList.remove("open"); pill.setAttribute("aria-expanded", "false"); pill.focus(); } });
  VL.load(); VL.paint();
  window.SWDS_VL = VL;
  var bindSave = function (btn, getId, getLabel) {
    var refresh = function () { var id = getId(); btn.setAttribute("aria-pressed", id && VL.has(id) ? "true" : "false"); if (btn.dataset.l0 === undefined) btn.dataset.l0 = btn.textContent; btn.textContent = VL.has(id) ? "Saved to my visit" : btn.dataset.l0; };
    btn.addEventListener("click", function () { var id = getId(); if (id) VL.toggle(id, getLabel()); refresh(); });
    d.addEventListener("vl:change", refresh); refresh();
    return refresh;
  };

  /* ---- floor guide ---- */
  var guide = $(".guide");
  if (guide) {
    var Z = {}; try { Z = JSON.parse($("#zones").textContent); } catch (e) {}
    var ltabs = $$(".levels [role=tab]", guide), plans = $$(".plan", guide), zones = $$(".zone", guide);
    var panel = $(".zpanel", guide), zm = $(".zmedia", panel), cur = null;
    var pickZone = function (key, quiet) {
      var z = Z[key]; if (!z) return; cur = key;
      zones.forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.z === key ? "true" : "false"); b.classList.toggle("saved", VL.has("zone:" + b.dataset.z)); });
      var html = z.v ? '<video muted loop playsinline autoplay preload="metadata" poster="' + BASE + z.p + '" src="' + BASE + z.v + '" aria-hidden="true"></video>' : '<img src="' + BASE + z.p + '" alt="' + z.t + '">';
      zm.innerHTML = html; zm.classList.toggle("held", !!z.held);
      var v = $("video", zm); if (v) { if (reduce) v.removeAttribute("autoplay"); else safePlay(v); }
      $(".zlevel", panel).textContent = "Level " + z.lv;
      $(".ztitle", panel).textContent = z.t;
      $(".zdesc", panel).textContent = z.d;
      $(".zbrands", panel).textContent = z.b ? "On display: " + z.b : "";
      if (!quiet && !reduce) panel.animate([{ opacity: 0.4, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 600, easing: "cubic-bezier(.16,1,.3,1)" });
      refreshZoneSave();
    };
    var refreshZoneSave = bindSave($("[data-save]", panel), function () { return cur && "zone:" + cur; }, function () { return Z[cur].t; });
    d.addEventListener("vl:change", function () { zones.forEach(function (b) { b.classList.toggle("saved", VL.has("zone:" + b.dataset.z)); }); });
    zones.forEach(function (b) { b.addEventListener("click", function () { pickZone(b.dataset.z); if (innerWidth < 980) panel.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" }); }); });
    ltabs.forEach(function (t, i) {
      t.addEventListener("click", function () {
        ltabs.forEach(function (x, j) { x.setAttribute("aria-selected", j === i ? "true" : "false"); x.tabIndex = j === i ? 0 : -1; plans[j].hidden = j !== i; });
        pickZone($(".zone", plans[i]).dataset.z);
      });
      t.addEventListener("keydown", function (e) {
        var k = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (k) { var n = ltabs[(i + k + ltabs.length) % ltabs.length]; n.focus(); n.click(); }
      });
    });
    pickZone("kitchens", true);
  }

  /* ---- held-back rooms: press and hold to peek ---- */
  $$(".held-card").forEach(function (card) {
    var btn = $(".peek", card), v = $("video", card), timer = null, key = card.dataset.z;
    var on = function (e) { if (e) e.preventDefault(); clearTimeout(timer); card.classList.add("peeking"); btn.textContent = "Peeking..."; if (v) { v.dataset.peek = "on"; if (!v.src && v.dataset.src) v.src = v.dataset.src; safePlay(v); } };
    var off = function () { timer = setTimeout(function () { card.classList.remove("peeking"); btn.textContent = "Hold to peek"; }, 900); };
    btn.addEventListener("pointerdown", on);
    btn.addEventListener("pointerup", off); btn.addEventListener("pointerleave", off); btn.addEventListener("pointercancel", off);
    btn.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    btn.addEventListener("keydown", function (e) { if ((e.key === " " || e.key === "Enter") && !e.repeat) on(e); });
    btn.addEventListener("keyup", function (e) { if (e.key === " " || e.key === "Enter") off(); });
    var title = $("h3", card).textContent;
    bindSave($("[data-save]", card), function () { return "zone:" + key; }, function () { return title; });
  });

  /* ---- hotspot kitchen ---- */
  var spot = $(".spot");
  if (spot) {
    var pins = $$(".pin", spot), items = $$(".spot-list button");
    var pick = function (i) {
      pins.forEach(function (p, j) { p.setAttribute("aria-pressed", j === i ? "true" : "false"); });
      items.forEach(function (b, j) { b.setAttribute("aria-expanded", j === i ? "true" : "false"); });
    };
    pins.forEach(function (p, i) { p.addEventListener("click", function () { pick(i); }); p.addEventListener("pointerenter", function () { if (fine) pick(i); }); });
    items.forEach(function (b, i) { b.addEventListener("click", function () { pick(i); }); });
    pick(0);
  }

  /* ---- finish library ---- */
  var lib = $(".matlib");
  if (lib) {
    var tabs = $$('[role="tab"]', lib), panels = $$(".sws", lib), big = $(".mat-big .sw", lib);
    var capB = $(".mat-big .cap b", lib), capS = $(".mat-big .cap span", lib), note = $(".mat-note", lib), curSw = $('.sw-btn[aria-pressed="true"]', lib);
    var refreshFinish = function () {};
    var choose = function (btn) {
      curSw = btn;
      var grp = btn.closest(".sws");
      $$(".sw-btn", grp).forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      big.style.opacity = 0; big.style.transform = "scale(1.04) rotateX(6deg)";
      setTimeout(function () { big.className = "sw grain " + btn.dataset.tex; big.style.opacity = 1; big.style.transform = ""; }, reduce ? 0 : 220);
      capB.textContent = $("b", btn).textContent;
      capS.textContent = $("span", btn).textContent;
      note.innerHTML = "<b>Where we use it.</b> " + btn.dataset.use;
      refreshFinish();
    };
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () {
        tabs.forEach(function (x, j) { x.setAttribute("aria-selected", j === i ? "true" : "false"); x.tabIndex = j === i ? 0 : -1; panels[j].hidden = j !== i; });
        choose($('.sw-btn[aria-pressed="true"]', panels[i]) || $(".sw-btn", panels[i]));
      });
      t.addEventListener("keydown", function (e) {
        var k = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (k) { var n = tabs[(i + k + tabs.length) % tabs.length]; n.focus(); n.click(); }
      });
    });
    $$(".sw-btn", lib).forEach(function (b) { b.addEventListener("click", function () { choose(b); }); });
    var fsave = $("[data-save-finish]", lib);
    if (fsave) refreshFinish = bindSave(fsave, function () { return "finish:" + curSw.dataset.tex; }, function () { return $("b", curSw).textContent + " (" + $("span", curSw).textContent + ")"; });
    var mb = $(".mat-big", lib);
    if (fine && !reduce) {
      mb.addEventListener("pointermove", function (e) {
        var r = mb.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        big.style.transform = "rotateY(" + x * 6 + "deg) rotateX(" + -y * 6 + "deg) scale(1.03)";
      });
      mb.addEventListener("pointerleave", function () { big.style.transform = ""; });
    }
  }

  /* ---- style finder ---- */
  var STYLES = {
    "black-brass": { name: "Black & Brass", img: "img/showroom/zline-kitchen.jpg", line: "White shaker cabinetry, a brass-banded hood, a black range with brass knobs, and a dark veined slab." },
    "bright-marble": { name: "Bright Marble", img: "img/showroom/marble-hood-kitchen.jpg", line: "A hood and backsplash wrapped in gold-veined white stone over a pro-style range. Light on every surface." },
    "warm-charcoal": { name: "Warm Charcoal", img: "img/showroom/viking-kitchen.jpg", line: "Charcoal-stained wood, stainless appliances and a soft white quartz island. Warm, grounded and built for a busy family." }
  };
  var quiz = $(".quiz-box");
  if (quiz) {
    var steps = $$(".qstep", quiz), res = $(".qres", quiz), score = {}, at = 0;
    var show = function (i, foc) {
      steps.forEach(function (s, j) { s.classList.toggle("on", j === i); });
      $$(".qbar i", quiz).forEach(function (b, j) { b.classList.toggle("on", j <= i); });
      var h = foc && steps[i] && $("h3", steps[i]); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    };
    $$(".opt", quiz).forEach(function (o) {
      o.addEventListener("click", function () {
        score[o.dataset.v] = (score[o.dataset.v] || 0) + 1;
        at++;
        if (at < steps.length) { show(at, true); return; }
        var best = Object.keys(score).sort(function (a, b) { return score[b] - score[a]; })[0];
        var r = STYLES[best];
        steps.forEach(function (s) { s.classList.remove("on"); });
        $("img", res).src = BASE + r.img; $("img", res).alt = r.name + " kitchen";
        $("h3", res).textContent = r.name; $(".copy", res).textContent = r.line;
        $(".qgo", res).href = BASE + "visit/?style=" + best + "#preview";
        VL.add("style:" + best, "Kitchen style: " + r.name);
        res.classList.add("on");
        var h = $("h3", res); h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true });
      });
    });
    $(".qback", quiz).addEventListener("click", function () { score = {}; at = 0; res.classList.remove("on"); show(0, true); });
    show(0);
  }

  /* ---- process: sticky image follows the active step ---- */
  var psteps = $$(".pstep"), pimgs = $$(".proc-vis img");
  if (psteps.length && "IntersectionObserver" in window) {
    var pio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var i = psteps.indexOf(e.target);
        psteps.forEach(function (s, j) { s.classList.toggle("on", j === i); });
        pimgs.forEach(function (im, j) { im.classList.toggle("on", j === i); });
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    psteps.forEach(function (s) { pio.observe(s); });
  }

  /* ---- services: sticky visual swaps with the active service ---- */
  var sv = $$(".svc-list > li"), simg = $$(".svc-vis img");
  if (sv.length && "IntersectionObserver" in window) {
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var i = sv.indexOf(e.target);
        sv.forEach(function (s, j) { s.classList.toggle("on", j === i); });
        simg.forEach(function (im, j) { im.classList.toggle("on", j === i); });
      });
    }, { rootMargin: "-40% 0px -50% 0px" });
    sv.forEach(function (s) { sio.observe(s); });
  }

  /* ---- portfolio filter + lightbox (photos and tour clips) ---- */
  var folio = $(".folio");
  if (folio) {
    var fitems = $$(".fitem", folio);
    $$(".filters button").forEach(function (b, _, all) {
      b.addEventListener("click", function () {
        all.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        var f = b.dataset.f;
        fitems.forEach(function (it) { it.classList.toggle("out", f !== "all" && it.dataset.cat !== f); });
        var c = $(".filters-count"); if (c) c.textContent = fitems.filter(function (i) { return !i.classList.contains("out"); }).length + " shown";
      });
    });
    var lb = $(".lb"), fig = $("figure", lb), cur2 = 0, opener = null;
    var vis = function () { return fitems.filter(function (i) { return !i.classList.contains("out"); }); };
    var paint = function () {
      var it = vis()[cur2], im = $("img", it), vv = $("video", it);
      if (vv) fig.innerHTML = '<video src="' + vv.dataset.src + '" poster="' + vv.getAttribute("poster") + '" muted loop playsinline controls autoplay></video>';
      else fig.innerHTML = '<img src="' + im.getAttribute("src") + '" alt="' + im.alt.replace(/"/g, "&quot;") + '">';
      $(".lb-bar b", lb).textContent = $("figcaption b", it).textContent;
      $(".lb-bar span", lb).textContent = it.dataset.note;
    };
    var openLb = function (it) { opener = $("button", it); cur2 = vis().indexOf(it); paint(); lb.classList.add("open"); d.body.style.overflow = "hidden"; $(".lb-x", lb).focus(); };
    var closeLb = function () { lb.classList.remove("open"); fig.innerHTML = ""; d.body.style.overflow = ""; opener && opener.focus(); };
    var step = function (k) { var v = vis(); cur2 = (cur2 + k + v.length) % v.length; paint(); };
    fitems.forEach(function (it) {
      $("button", it).addEventListener("click", function () { openLb(it); });
      var tv = $("video", it);
      if (tv && fine && !reduce) {
        it.addEventListener("pointerenter", function () { if (!tv.src) tv.src = tv.dataset.src; safePlay(tv); });
        it.addEventListener("pointerleave", function () { tv.pause(); });
      }
    });
    $(".lb-x", lb).addEventListener("click", closeLb);
    $(".lb-prev", lb).addEventListener("click", function () { step(-1); });
    $(".lb-next", lb).addEventListener("click", function () { step(1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
    d.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "Tab") { var f = $$("button", lb), first = f[0], lastB = f[f.length - 1]; if (e.shiftKey && d.activeElement === first) { e.preventDefault(); lastB.focus(); } else if (!e.shiftKey && d.activeElement === lastB) { e.preventDefault(); first.focus(); } }
    });
    var sx = 0; lb.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) { var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); });
  }

  /* ---- private preview form (fields and endpoint unchanged) ---- */
  var form = d.getElementById("preview-form");
  if (form) {
    var note = d.getElementById("form-note");
    var st = new URLSearchParams(location.search).get("style");
    if (st && STYLES[st]) VL.add("style:" + st, "Kitchen style: " + STYLES[st].name);
    var chips = d.getElementById("vl-chips"), wrap = d.getElementById("vl-wrap");
    var listLine = function () { return VL.items.length ? "My visit list: " + VL.items.map(function (x) { return x.label; }).join("; ") + "." : ""; };
    var paintChips = function () {
      if (!chips) return;
      chips.innerHTML = "";
      VL.items.forEach(function (x) { var s = d.createElement("span"); s.textContent = x.label; chips.appendChild(s); });
      wrap.hidden = !VL.items.length;
      var cur = form.message.value;
      if (!cur || cur.indexOf("My visit list:") === 0) form.message.value = listLine() ? listLine() + " " : "";
    };
    d.addEventListener("vl:change", paintChips); paintChips();
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      if (!name || !email || email.indexOf("@") < 0) {
        note.textContent = "Please add your name and a valid email so we can reach you.";
        (!name ? form.name : form.email).focus();
        return;
      }
      note.textContent = "Sending your request...";
      var btn = form.querySelector("button[type=submit]"); btn.disabled = true;
      var data = {
        name: name,
        phone: form.phone.value.trim(),
        email: email,
        message: form.message.value.trim(),
        _subject: "Private preview request - Southwest Design Studio"
      };
      fetch("https://formsubmit.co/ajax/sbankosz@swcorridor.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      }).then(function (r) { return r.json(); })
        .then(function () {
          note.textContent = "Thank you, " + name.split(" ")[0] + ". Your preview request is on its way. We will be in touch shortly.";
          form.reset();
        })
        .catch(function () {
          note.textContent = "Something did not go through. Please call us at (877) 646-0167 instead.";
        })
        .then(function () { btn.disabled = false; });
    });
  }
})();
