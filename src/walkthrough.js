// Showroom Walkthrough: a dark gallery corridor through the real showroom.
// Level 1 frames sit on the ground; at the staircase the camera climbs to Level 2.
// The frame you arrive at plays its tour footage; every other frame shows a still.
// Budget (DESIGN.md): DPR clamp, renders only on screen, one video decoding at a time,
// poster + rail fallbacks, reduced-motion skip handled by the caller.
import {
  WebGLRenderer, Scene, PerspectiveCamera, PlaneGeometry, MeshBasicMaterial, Mesh,
  TextureLoader, VideoTexture, SRGBColorSpace, Color, Fog, BufferGeometry, Float32BufferAttribute,
  Points, PointsMaterial, CanvasTexture, Group, AdditiveBlending, MathUtils, LinearFilter
} from "three";

export function initWalkthrough(section, rooms, onRoom) {
  const canvas = section.querySelector("canvas");
  const sticky = section.querySelector(".walk-sticky");
  const stage = section.querySelector(".walk-stage");
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  } catch (e) { return false; }
  const coarse = matchMedia("(pointer: coarse)").matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio, coarse ? 1.5 : 1.75));
  renderer.outputColorSpace = SRGBColorSpace;

  const BG = new Color("#14100c");
  const scene = new Scene();
  scene.background = BG;
  scene.fog = new Fog(BG, 6, 22);
  const camera = new PerspectiveCamera(42, 1, 0.1, 80);

  const GAP = 7.5, RISE = 3.4;
  const loader = new TextureLoader();
  const frames = [];
  const world = new Group();
  scene.add(world);

  rooms.forEach((r, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    const g = new Group();
    const h = 3.0, w = h * r.ratio;
    const poster = loader.load(r.src, (t) => { t.colorSpace = SRGBColorSpace; t.anisotropy = 4; t.needsUpdate = true; });
    const picMat = new MeshBasicMaterial({ map: poster, color: 0x777777, fog: true });
    const pic = new Mesh(new PlaneGeometry(w, h), picMat);
    const mat = new Mesh(new PlaneGeometry(w + 0.3, h + 0.3), new MeshBasicMaterial({ color: 0xf2ece2, fog: true }));
    const back = new Mesh(new PlaneGeometry(w + 0.46, h + 0.46), new MeshBasicMaterial({ color: 0x2a221b, fog: true }));
    mat.position.z = -0.01; back.position.z = -0.02;
    g.add(back, mat, pic);
    const y = r.level === 2 ? RISE : r.stairs ? RISE * 0.5 : 0;
    g.position.set(side * 1.55, 0.15 + y, -i * GAP);
    g.rotation.y = -side * 0.22;
    world.add(g);
    frames.push({ g, pic, picMat, poster, side, y, video: r.video, vt: null, el: null });
  });

  // one video decoding at a time: the frame you are standing at
  let playing = null;
  function activate(F) {
    if (playing === F) return;
    if (playing) { playing.el && playing.el.pause(); playing.picMat.map = playing.poster; playing.picMat.needsUpdate = true; }
    playing = F;
    if (!F || !F.video) return;
    if (!F.el) {
      const v = document.createElement("video");
      v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true;
      v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.preload = "auto";
      v.src = F.video;
      F.el = v;
      F.vt = new VideoTexture(v); F.vt.colorSpace = SRGBColorSpace; F.vt.minFilter = LinearFilter;
      v.addEventListener("playing", () => { if (playing === F) { F.picMat.map = F.vt; F.picMat.needsUpdate = true; } });
    }
    const p = F.el.play(); if (p && p.catch) p.catch(() => {});
    if (!F.el.paused) { F.picMat.map = F.vt; F.picMat.needsUpdate = true; }
  }

  // drifting dust: atmosphere, not decoration
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const x = c.getContext("2d"); const grd = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(227,166,79,1)"); grd.addColorStop(1, "rgba(227,166,79,0)");
  x.fillStyle = grd; x.fillRect(0, 0, 64, 64);
  const dot = new CanvasTexture(c);
  const N = coarse ? 260 : 600, pos = [];
  let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const len = rooms.length * GAP + 6;
  for (let i = 0; i < N; i++) pos.push((rnd() - 0.5) * 9, (rnd() - 0.4) * 5 + rnd() * RISE, 4 - rnd() * len);
  const dg = new BufferGeometry(); dg.setAttribute("position", new Float32BufferAttribute(pos, 3));
  const dust = new Points(dg, new PointsMaterial({ size: 0.06, map: dot, transparent: true, opacity: 0.5, depthWrite: false, blending: AdditiveBlending, fog: true }));
  scene.add(dust);

  // two floors
  const stairsAt = Math.max(0, rooms.findIndex((r) => r.stairs));
  const l1len = stairsAt * GAP + 8, l2len = (rooms.length - stairsAt) * GAP + 10;
  const floorMat = new MeshBasicMaterial({ color: 0x1d1712, fog: true });
  const f1 = new Mesh(new PlaneGeometry(14, l1len), floorMat);
  f1.rotation.x = -Math.PI / 2; f1.position.set(0, -1.9, 6 - l1len / 2); scene.add(f1);
  const f2 = new Mesh(new PlaneGeometry(14, l2len), floorMat);
  f2.rotation.x = -Math.PI / 2; f2.position.set(0, -1.9 + RISE, -stairsAt * GAP - l2len / 2 + 2); scene.add(f2);

  function resize() {
    const w = sticky.clientWidth, h = sticky.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 0.8 ? 60 : 42;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(sticky); resize();

  let prog = 0, smooth = 0;
  function readScroll() {
    const r = stage.getBoundingClientRect();
    const total = r.height - innerHeight;
    prog = MathUtils.clamp(-r.top / total, 0, 1);
  }
  addEventListener("scroll", readScroll, { passive: true }); readScroll();

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  if (!coarse) addEventListener("pointermove", (e) => { mouse.tx = (e.clientX / innerWidth - 0.5); mouse.ty = (e.clientY / innerHeight - 0.5); }, { passive: true });

  let visible = false, current = -1;
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (!visible && playing) { playing.el && playing.el.pause(); }
    else if (visible && playing && playing.el) { const p = playing.el.play(); p && p.catch && p.catch(() => {}); }
  }).observe(sticky);

  const last = rooms.length - 1;
  let t0 = performance.now();
  renderer.setAnimationLoop(() => {
    if (!visible || document.hidden) return;
    const now = performance.now(), dt = Math.min((now - t0) / 1000, 0.05); t0 = now;
    smooth += (prog - smooth) * Math.min(1, dt * 5);
    mouse.x += (mouse.tx - mouse.x) * dt * 3; mouse.y += (mouse.ty - mouse.y) * dt * 3;

    // hold briefly at each room, then glide (eased stepping)
    const f = smooth * last, i = Math.min(Math.floor(f), last), k = f - i;
    const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    const eased = i + e;
    const z = 5.2 - eased * GAP;
    const a = Math.min(Math.round(eased), last);
    const A = frames[a];
    const ya = frames[i].y, yb = frames[Math.min(i + 1, last)].y;
    const camY = MathUtils.lerp(ya, yb, e);
    camera.position.set(A.side * 0.55 + mouse.x * 0.5, 0.15 + camY - mouse.y * 0.3, z);
    camera.lookAt(MathUtils.lerp(camera.position.x, A.side * 1.1, 0.6), 0.15 + camY + (yb - ya) * 0.25, z - 6);

    frames.forEach((F, j) => {
      const d = Math.abs(eased - j);
      F.picMat.color.setScalar(MathUtils.clamp(1 - d * 0.9, 0.3, 1));
      F.g.rotation.y = -F.side * (0.22 + MathUtils.clamp(d, 0, 1) * 0.25);
    });
    dust.rotation.y = Math.sin(now * 0.00005) * 0.05;
    dust.position.y = Math.sin(now * 0.0003) * 0.08;

    if (a !== current) { current = a; onRoom(a, smooth); }
    // start the arriving room's footage once the camera has nearly settled
    if (Math.abs(eased - a) < 0.18) activate(A); else if (playing && Math.abs(eased - frames.indexOf(playing)) > 0.6) activate(null);
    onRoom.progress && onRoom.progress(smooth);
    renderer.render(scene, camera);
  });

  canvas.addEventListener("webglcontextlost", (ev) => { ev.preventDefault(); section.classList.remove("gl-on"); });
  return true;
}
