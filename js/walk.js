/* The walk: real tour footage played by scroll. Scroll is your footsteps.
   223 graded frames per orientation (landscape d/, subject-tracked portrait m/).
   Frames load coarse-to-fine so the walk works within a second and sharpens as it fills.
   Reduced motion: steps between chapter stills, no blending. No JS: poster + text. */
(function () {
  var sec = document.getElementById("walk");
  if (!sec) return;
  var stage = sec.querySelector(".stage"), canvas = stage.querySelector("canvas"), ctx = canvas.getContext("2d");
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var N = 223, BASE = sec.getAttribute("data-base");
  var HOLD = 69, LAST = N - 1, ENDS = { d: N - 1, m: 200 };
  // scroll progress -> frame: hero hold, walk to the kitchen, pause for hotspots, walk to Level 2, arrival hold
  var KEYS = [];
  function keys() { KEYS = [[0, 0], [0.045, 0], [0.34, HOLD], [0.45, HOLD], [0.93, LAST], [1, LAST]]; STEPS[STEPS.length - 1] = LAST; }
  var STEPS = [0, 30, HOLD, 100, 140, 175, 200, LAST];
  // frames with no camera blur (sharpest of their neighbours, scored offline); the walk comes to rest on these
  var SHARP = {"d":[0,2,8,20,23,34,37,44,48,51,55,68,69,78,82,97,105,113,120,129,144,153,164,176,179,184,197,200,202,221,222],"m":[0,6,14,25,34,38,44,51,54,66,69,71,86,91,97,102,105,113,120,129,133,137,146,152,155,160,163,169,176,184,188,197,200,202,208,221,222]};
  function sharpNear(f) {
    var best = Math.round(f), bd = 1e9;
    (SHARP[set] || []).forEach(function (i) { if (i <= LAST && Math.abs(i - f) < bd) { bd = Math.abs(i - f); best = i; } });
    return bd <= 8 ? best : Math.round(f);
  }

  var set = null, imgs = [], ok = [], loading = 0, queue = [], gen = 0;
  function orient() { return innerHeight > innerWidth * 1.05 ? "m" : "d"; }
  function order() {
    var seen = {}, out = [], strides = [32, 16, 8, 4, 2, 1];
    [0, HOLD, LAST].forEach(function (i) { seen[i] = 1; out.push(i); });
    strides.forEach(function (s) { for (var i = 0; i < N; i += s) if (!seen[i]) { seen[i] = 1; out.push(i); } });
    return out;
  }
  function pump() {
    while (loading < 6 && queue.length) {
      if (ok[queue[0]]) { queue.shift(); continue; }
      (function (i, g) {
        loading++;
        var im = new Image();
        im.decoding = "async";
        im.onload = function () { loading--; if (g !== gen) return; imgs[i] = im; ok[i] = 1; if (i === 0 || i === Math.round(cur)) dirty = true; pump(); };
        im.onerror = function () { loading--; pump(); };
        im.src = BASE + set + "/" + ("00" + i).slice(-3) + ".webp";
      })(queue.shift(), gen);
    }
  }
  // pull the frames around where the visitor is to the front of the queue, so a slow scroll stays sharp
  var lastBump = -99;
  function bump(f) {
    var c = Math.round(f);
    if (Math.abs(c - lastBump) < 3) return;
    lastBump = c;
    var want = [];
    for (var d = -3; d <= 10; d++) { var i = c + d; if (i >= 0 && i <= LAST && !ok[i]) want.push(i); }
    if (!want.length) return;
    queue = want.concat(queue.filter(function (i) { return want.indexOf(i) < 0; }));
    pump();
  }
  function useSet(s) {
    if (s === set) return;
    set = s; LAST = ENDS[s]; keys(); gen++; imgs = []; ok = []; queue = order(); loading = 0;
    sec.setAttribute("data-set", s);
    pump();
  }

  // pin positions are in source-frame fractions; map them through the same cover fit as the canvas
  var W = 0, H = 0, dpr = 1, fit = { s: 1, x: 0, y: 0, iw: 1440, ih: 810 };
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = stage.clientWidth; H = stage.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    useSet(orient());
    dirty = true;
  }
  function cover(im, f) {
    var iw = im.naturalWidth, ih = im.naturalHeight, s = Math.max(W / iw, H / ih);
    var fx = set === "m" && f > 184 ? 0.5 + Math.min(1, (f - 184) / 16) * 0.32 : 0.5;  // pan toward the crest on phones
    fit = { s: s, x: (W - iw * s) * fx, y: (H - ih * s) / 2, iw: iw, ih: ih };
    return fit;
  }
  function nearest(i) {
    if (ok[i]) return i;
    for (var d = 1; d < N; d++) { if (ok[i - d]) return i - d; if (ok[i + d]) return i + d; }
    return -1;
  }
  function draw(f) {
    var i = Math.floor(f), a = f - i, j = Math.min(i + 1, LAST);
    var k = nearest(i);
    if (k < 0) return false;
    var im = imgs[k], c = cover(im, f);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1;
    ctx.drawImage(im, c.x, c.y, c.iw * c.s, c.ih * c.s);
    if (!reduce && k === i && a > 0.04 && ok[j] && j !== i) {
      ctx.globalAlpha = a;
      ctx.drawImage(imgs[j], c.x, c.y, c.iw * c.s, c.ih * c.s);
      ctx.globalAlpha = 1;
    }
    return true;
  }

  function progress() {
    var r = sec.getBoundingClientRect(), total = sec.offsetHeight - innerHeight;
    return Math.max(0, Math.min(1, -r.top / Math.max(1, total)));
  }
  function frameAt(p) {
    for (var n = 1; n < KEYS.length; n++) {
      var a = KEYS[n - 1], b = KEYS[n];
      if (p <= b[0]) { var u = (p - a[0]) / Math.max(1e-6, b[0] - a[0]); return a[1] + (b[1] - a[1]) * u; }
    }
    return LAST;
  }

  // overlays
  var hero = stage.querySelector(".w-hero"), chs = [].slice.call(stage.querySelectorAll(".w-ch"));
  var lv = stage.querySelector(".w-lv"), lvb = lv ? lv.querySelectorAll("b") : [], hold = stage.querySelector(".w-hold");
  var arrive = stage.querySelector(".w-arrive"), pins = [].slice.call(stage.querySelectorAll(".pin"));
  var card = stage.querySelector(".w-card");
  function placePins() {
    if (!fit) return;
    pins.forEach(function (p) {
      var v = (p.getAttribute("data-" + set) || "").split(",");
      if (v.length < 2) { p.hidden = true; return; }
      p.hidden = false;
      p.style.left = (fit.x + parseFloat(v[0]) * fit.iw * fit.s) + "px";
      p.style.top = (fit.y + parseFloat(v[1]) * fit.ih * fit.s) + "px";
    });
  }
  function overlays(p, f) {
    if (hero) { var h = Math.max(0, 1 - p / 0.03); hero.style.opacity = h; hero.style.transform = "translateY(" + (-(1 - h) * 40) + "px)"; hero.style.visibility = h < 0.01 ? "hidden" : ""; }
    var inHold = p > 0.345 && p < 0.445;
    chs.forEach(function (c) {
      var a = +c.getAttribute("data-from"), b = +c.getAttribute("data-to");
      c.classList.toggle("on", !inHold && p > 0.03 && p < 0.925 && f >= a && f <= b);
    });
    if (hold) { hold.classList.toggle("on", inHold); if (!inHold && card) closeCard(); }
    if (arrive) arrive.classList.toggle("on", p > 0.935);
    if (lv) {
      lv.classList.toggle("show", p > 0.03 && p < 0.935);
      var two = f >= 196;
      lvb[0].classList.toggle("on", !two); lvb[1].classList.toggle("on", two);
      lv.style.setProperty("--p", (f / LAST).toFixed(3));
    }
  }

  // hotspot card (anchored bottom sheet on phones, side card on desktop)
  var openPin = null;
  function closeCard() { if (!openPin) return; openPin.setAttribute("aria-expanded", "false"); openPin = null; card.classList.remove("open"); }
  pins.forEach(function (p) {
    p.addEventListener("click", function () {
      if (openPin === p) { closeCard(); return; }
      if (openPin) openPin.setAttribute("aria-expanded", "false");
      openPin = p; p.setAttribute("aria-expanded", "true");
      card.querySelector("h3").textContent = p.getAttribute("data-t");
      card.querySelector("p").textContent = p.getAttribute("data-x");
      card.classList.add("open");
    });
  });
  if (card) card.querySelector(".x").addEventListener("click", closeCard);

  var cur = 0, target = 0, dirty = true, visible = true, drawn = false;
  function tick() {
    requestAnimationFrame(tick);
    if (!visible) return;
    var p = progress(), f = frameAt(p);
    if (reduce) { var best = STEPS[0]; STEPS.forEach(function (s) { if (Math.abs(s - f) < Math.abs(best - f)) best = s; }); f = best; }
    if (!reduce && performance.now() - lastScroll > 140) f = sharpNear(f);  // at rest: settle on a clear frame
    target = f;
    bump(f);
    var nxt = reduce ? target : cur + (target - cur) * 0.35;
    if (Math.abs(nxt - target) < 0.02) nxt = target;
    if (nxt !== cur || dirty) {
      cur = nxt; dirty = false;
      if (draw(cur)) { if (!drawn) { drawn = true; stage.classList.add("ready"); } placePins(); }
      overlays(p, cur);
    }
  }
  new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible) dirty = true; }, { rootMargin: "100px 0px" }).observe(sec);
  addEventListener("resize", function () { resize(); });
  var lastScroll = 0;
  addEventListener("scroll", function () { dirty = true; lastScroll = performance.now(); }, { passive: true });
  resize();
  requestAnimationFrame(tick);

  // end of the walk: the Level 02 link jumps to the three rooms below
  var nextLink = stage.querySelector(".w-next");
  if (nextLink) nextLink.addEventListener("click", function (e) {
    var t = document.getElementById("doors"); if (!t) return;
    e.preventDefault();
    if (window.SWDS_LENIS) window.SWDS_LENIS.scrollTo(t, { offset: -20 }); else t.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  });

  // autoplay: glide the page through the walk in ~30s, then land on the next section
  var playBtn = stage.querySelector("[data-play]"), pp = stage.querySelector(".w-pp");
  var playing = false, playFrom = 0, playT0 = 0, playDur = 0, playEnd = 0, autoY = -1;
  function endY() { return sec.offsetTop + sec.offsetHeight; }
  function setY(y) { autoY = Math.round(y); if (window.SWDS_LENIS) window.SWDS_LENIS.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y); }
  function play() {
    playFrom = scrollY; playEnd = endY();
    var total = sec.offsetHeight - innerHeight, left = Math.max(0, playEnd - playFrom);
    if (left < 10) { playFrom = sec.offsetTop; left = playEnd - playFrom; }
    playDur = 30000 * Math.min(1, left / Math.max(1, total + innerHeight));
    playT0 = performance.now(); playing = true;
    pp.hidden = false; pp.classList.remove("paused"); pp.querySelector("b").textContent = "Pause"; pp.setAttribute("aria-label", "Pause the tour");
    requestAnimationFrame(step);
  }
  function stop(done) {
    playing = false;
    if (done) pp.hidden = true;
    else { pp.classList.add("paused"); pp.querySelector("b").textContent = "Play"; pp.setAttribute("aria-label", "Resume the tour"); }
  }
  function step(t) {
    if (!playing) return;
    var u = Math.min(1, (t - playT0) / playDur);
    setY(playFrom + (playEnd - playFrom) * u);
    if (u >= 1) { stop(true); return; }
    requestAnimationFrame(step);
  }
  if (playBtn && pp && !reduce) {
    playBtn.addEventListener("click", play);
    pp.addEventListener("click", function () { if (playing) stop(false); else play(); });
    // any manual scroll or key takes back control
    ["wheel", "touchstart", "keydown"].forEach(function (ev) { addEventListener(ev, function (e) { if (playing && !(ev === "keydown" && e.target === pp)) stop(false); }, { passive: true }); });
    addEventListener("scroll", function () { if (!playing && !pp.hidden && scrollY > endY() - 4) pp.hidden = true; }, { passive: true });
  } else if (playBtn) playBtn.hidden = true;

  window.SWDS_WALK = { firstFrame: function () { return ok[0] === 1; } };
})();
