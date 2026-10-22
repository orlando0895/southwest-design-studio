// Showroom Walkthrough: a dark gallery corridor of five rooms. Scroll flies the camera
// forward; each room sharpens as it arrives. Built to the DEPTH budget in DESIGN.md:
// DPR clamp, renders only on screen, poster + rail fallbacks, reduced-motion skip.
import {
  WebGLRenderer, Scene, PerspectiveCamera, PlaneGeometry, MeshBasicMaterial, Mesh,
  TextureLoader, SRGBColorSpace, Color, Fog, BufferGeometry, Float32BufferAttribute,
  Points, PointsMaterial, CanvasTexture, Group, AdditiveBlending, MathUtils
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

  const GAP = 7.5;                 // distance between rooms along -z
  const loader = new TextureLoader();
  const frames = [];
  const world = new Group();
  scene.add(world);

  rooms.forEach((r, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    const g = new Group();
    const h = 3.0, w = h * r.ratio;
    const tex = loader.load(r.src, (t) => { t.colorSpace = SRGBColorSpace; t.anisotropy = 4; t.needsUpdate = true; });
    const pic = new Mesh(new PlaneGeometry(w, h), new MeshBasicMaterial({ map: tex, color: 0x777777, fog: true }));
    const mat = new Mesh(new PlaneGeometry(w + 0.34, h + 0.34), new MeshBasicMaterial({ color: 0xefe7da, fog: true }));
    const back = new Mesh(new PlaneGeometry(w + 0.5, h + 0.5), new MeshBasicMaterial({ color: 0x2a221b, fog: true }));
    mat.position.z = -0.01; back.position.z = -0.02;
    g.add(back, mat, pic);
    g.position.set(side * 1.55, 0.15, -i * GAP);
    g.rotation.y = -side * 0.22;
    world.add(g);
    frames.push({ g, pic, side });
  });

  // floor glow and drifting dust: atmosphere, not decoration
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const x = c.getContext("2d"); const grd = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(224,162,126,1)"); grd.addColorStop(1, "rgba(224,162,126,0)");
  x.fillStyle = grd; x.fillRect(0, 0, 64, 64);
  const dot = new CanvasTexture(c);
  const N = coarse ? 260 : 600, pos = [];
  let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < N; i++) pos.push((rnd() - 0.5) * 9, (rnd() - 0.4) * 5, 4 - rnd() * (rooms.length * GAP + 6));
  const dg = new BufferGeometry(); dg.setAttribute("position", new Float32BufferAttribute(pos, 3));
  const dust = new Points(dg, new PointsMaterial({ size: 0.06, map: dot, transparent: true, opacity: 0.55, depthWrite: false, blending: AdditiveBlending, fog: true }));
  scene.add(dust);
  const floor = new Mesh(new PlaneGeometry(14, rooms.length * GAP + 20), new MeshBasicMaterial({ color: 0x1d1712, fog: true }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, -1.9, -(rooms.length * GAP) / 2); scene.add(floor);

  // sizing
  function resize() {
    const w = sticky.clientWidth, h = sticky.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 0.8 ? 58 : 42;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(sticky); resize();

  // scroll progress 0..1 across the tall stage
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
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(sticky);

  const last = rooms.length - 1;
  let t0 = performance.now();
  renderer.setAnimationLoop(() => {
    if (!visible || document.hidden) return;
    const now = performance.now(), dt = Math.min((now - t0) / 1000, 0.05); t0 = now;
    smooth += (prog - smooth) * Math.min(1, dt * 5);
    mouse.x += (mouse.tx - mouse.x) * dt * 3; mouse.y += (mouse.ty - mouse.y) * dt * 3;

    // stops: hold briefly at each room, then glide (eased stepping)
    const f = smooth * last, i = Math.floor(f), k = f - i;
    const eased = i + (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
    const z = 5.2 - eased * GAP;
    const a = Math.min(Math.round(eased), last);
    const fr = frames[a];
    camera.position.set(fr.side * 0.55 + mouse.x * 0.5, 0.15 - mouse.y * 0.3, z);
    camera.lookAt(MathUtils.lerp(camera.position.x, fr.side * 1.1, 0.6), 0.15, z - 6);

    frames.forEach((F, j) => {
      const d = Math.abs(eased - j);
      const lit = MathUtils.clamp(1 - d * 0.9, 0.32, 1);
      F.pic.material.color.setScalar(lit);
      F.g.rotation.y = -F.side * (0.22 + MathUtils.clamp(d, 0, 1) * 0.25);
    });
    dust.rotation.y = Math.sin(now * 0.00005) * 0.05;
    dust.position.y = Math.sin(now * 0.0003) * 0.08;

    if (a !== current) { current = a; onRoom(a, smooth); }
    onRoom.progress && onRoom.progress(smooth);
    renderer.render(scene, camera);
  });

  canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); section.classList.remove("gl-on"); });
  return true;
}
