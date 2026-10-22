/* Southwest Design Studio: shared interactions.
   Everything here enhances content that is already readable without JS. */
(function () {
  var d = document, root = d.documentElement;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = matchMedia("(pointer: fine)").matches;
  root.classList.add("js");
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

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

  // reveals (IntersectionObserver keeps content complete at rest if anything fails)
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    $$(".rv").forEach(function (el) { io.observe(el); });
  } else { $$(".rv").forEach(function (el) { el.classList.add("in"); }); }

  if (hasG && !reduce) {
    // hero headline: lines rise in, staggered
    var lines = $$(".hero h1 .ln > span");
    if (lines.length) {
      gsap.from(lines, { yPercent: 110, duration: 1.2, ease: "expo.out", stagger: 0.09, delay: 0.15 });
      gsap.from(".hero .lede, .hero .row, .hero-meta", { y: 24, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.08, delay: 0.55 });
      gsap.to(".hero-media", { yPercent: 14, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    }
    // image parallax inside frames
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

  /* ---- hero film: pause control, reduced-motion shows poster ---- */
  var vid = $(".hero video"), vbtn = $(".hero-ctrl button");
  if (vid) {
    if (reduce) { vid.removeAttribute("autoplay"); vid.pause(); }
    var sync = function () {
      if (!vbtn) return;
      var p = vid.paused;
      vbtn.setAttribute("aria-label", p ? "Play showroom film" : "Pause showroom film");
      vbtn.innerHTML = p ? '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M4 2l10 6-10 6z"/></svg>' : '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M3 2h3.5v12H3zM9.5 2H13v12H9.5z"/></svg>';
      var s = $(".hero-ctrl span"); if (s) s.textContent = p ? "Film paused" : "Showroom film";
    };
    vbtn && vbtn.addEventListener("click", function () { vid.paused ? vid.play() : vid.pause(); sync(); });
    vid.addEventListener("play", sync); vid.addEventListener("pause", sync); sync();
  }

  /* ---- hotspot room ---- */
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

  /* ---- material library ---- */
  var lib = $(".matlib");
  if (lib) {
    var tabs = $$('[role="tab"]', lib), panels = $$(".sws", lib), big = $(".mat-big .sw", lib);
    var capB = $(".mat-big .cap b", lib), capS = $(".mat-big .cap span", lib), note = $(".mat-note", lib);
    var choose = function (btn) {
      var grp = btn.closest(".sws");
      $$(".sw-btn", grp).forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      big.style.opacity = 0; big.style.transform = "scale(1.04) rotateX(6deg)";
      setTimeout(function () {
        big.className = "sw grain " + btn.dataset.tex;
        big.style.opacity = 1; big.style.transform = "";
      }, reduce ? 0 : 220);
      capB.textContent = btn.querySelector("b").textContent;
      capS.textContent = btn.querySelector("span").textContent;
      note.innerHTML = "<b>Where we use it.</b> " + btn.dataset.use;
    };
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () {
        tabs.forEach(function (x, j) { x.setAttribute("aria-selected", j === i ? "true" : "false"); x.tabIndex = j === i ? 0 : -1; panels[j].hidden = j !== i; });
        var on = $('.sw-btn[aria-pressed="true"]', panels[i]) || $(".sw-btn", panels[i]);
        choose(on);
      });
      t.addEventListener("keydown", function (e) {
        var k = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (k) { var n = tabs[(i + k + tabs.length) % tabs.length]; n.focus(); n.click(); }
      });
    });
    $$(".sw-btn", lib).forEach(function (b) { b.addEventListener("click", function () { choose(b); }); });
    // gentle 3D tilt on the big swatch
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
  var quiz = $(".quiz-box");
  if (quiz) {
    var steps = $$(".qstep", quiz), res = $(".qres", quiz), score = {}, at = 0;
    var results = {
      "quiet-suite": { name: "The Quiet Suite", img: "img/bedroom-taupe.jpg", line: "Soft taupe layers, tufted texture, and filtered light. Rooms built to exhale at the end of the day." },
      "desert-modern": { name: "Desert Modern", img: "img/desert-dusk.jpg", line: "Walls of glass, warm stone, and seating that turns toward the view. Indoor and outdoor living as one room." },
      "statement": { name: "The Statement Kitchen", img: "img/kitchen-drama.jpg", line: "Veined marble, sculptural lighting, and high polish. A room that hosts the whole evening." }
    };
    var show = function (i, foc) {
      steps.forEach(function (s, j) { s.classList.toggle("on", j === i); });
      $$(".qbar i", quiz).forEach(function (b, j) { b.classList.toggle("on", j <= i); });
      var h = foc && steps[i] && $("h3", steps[i]); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    };
    $$(".opt", quiz).forEach(function (o) {
      o.addEventListener("click", function () {
        o.dataset.v.split(" ").forEach(function (v) { score[v] = (score[v] || 0) + 1; });
        at++;
        if (at < steps.length) { show(at, true); return; }
        var best = Object.keys(score).sort(function (a, b) { return score[b] - score[a]; })[0];
        var r = results[best];
        steps.forEach(function (s) { s.classList.remove("on"); });
        $("img", res).src = r.img; $("img", res).alt = r.name + " room";
        $("h3", res).textContent = r.name; $(".copy", res).textContent = r.line;
        $(".qgo", res).href = "visit/?style=" + best + "#preview";
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

  /* ---- portfolio filter + lightbox ---- */
  var folio = $(".folio");
  if (folio) {
    var fitems = $$(".fitem", folio);
    $$(".filters button").forEach(function (b, _, all) {
      b.addEventListener("click", function () {
        all.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        var f = b.dataset.f;
        fitems.forEach(function (it) { it.classList.toggle("out", f !== "all" && it.dataset.cat !== f); });
        var c = $(".filters-count"); if (c) c.textContent = fitems.filter(function (i) { return !i.classList.contains("out"); }).length + " rooms shown";
      });
    });
    var lb = $(".lb"), cur = 0, opener = null;
    var vis = function () { return fitems.filter(function (i) { return !i.classList.contains("out"); }); };
    var paint = function () {
      var it = vis()[cur], im = $("img", it);
      $("img", lb).src = im.getAttribute("src"); $("img", lb).alt = im.alt;
      $(".lb-bar b", lb).textContent = $("figcaption b", it).textContent;
      $(".lb-bar span", lb).textContent = it.dataset.note;
    };
    var openLb = function (it) { opener = $("button", it); cur = vis().indexOf(it); paint(); lb.classList.add("open"); d.body.style.overflow = "hidden"; $(".lb-x", lb).focus(); };
    var closeLb = function () { lb.classList.remove("open"); d.body.style.overflow = ""; opener && opener.focus(); };
    var step = function (k) { var v = vis(); cur = (cur + k + v.length) % v.length; paint(); };
    fitems.forEach(function (it) { $("button", it).addEventListener("click", function () { openLb(it); }); });
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
    var names = { "quiet-suite": "The Quiet Suite", "desert-modern": "Desert Modern", "statement": "The Statement Kitchen" };
    var st = new URLSearchParams(location.search).get("style");
    if (st && names[st]) {
      form.message.value = "Style finder result: " + names[st] + ". ";
      var tag = d.getElementById("style-tag");
      if (tag) { tag.hidden = false; tag.querySelector("b").textContent = names[st]; }
    }
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
