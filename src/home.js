import { initWalkthrough } from "./walkthrough.js";

const sec = document.querySelector("#walk");
if (sec) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lowEnd = matchMedia("(pointer: coarse)").matches && (navigator.hardwareConcurrency || 8) <= 2;
  const figs = [...sec.querySelectorAll(".rail figure")];
  const rooms = figs.map((f) => ({
    src: f.dataset.poster || f.querySelector("img, video").getAttribute(f.querySelector("img") ? "src" : "poster"),
    video: f.dataset.video || null,
    ratio: parseFloat(f.dataset.ratio) || 1.78,
    level: parseInt(f.dataset.level || "1", 10),
    stairs: f.hasAttribute("data-stairs"),
    name: f.querySelector("b").textContent,
    line: f.querySelector("span").textContent,
  }));
  const hud = sec.querySelector(".hud-card");
  const bars = [...sec.querySelectorAll(".hud-prog i")];
  const lvl = sec.querySelector(".hud-level");
  const flash = sec.querySelector(".level-flash");
  let lastLevel = 1;

  const start = () => {
    if (reduce || lowEnd) return;
    sec.classList.add("gl-on");
    const onRoom = (i) => {
      const r = rooms[i];
      hud.querySelector(".idx").textContent = String(i + 1).padStart(2, "0") + " / " + String(rooms.length).padStart(2, "0");
      hud.querySelector("h3").textContent = r.name;
      hud.querySelector(".desc").textContent = r.line;
      const L = r.level === 2 ? 2 : 1;
      lvl.textContent = r.stairs ? "Staircase" : "Level " + L;
      if (L !== lastLevel && flash) {
        flash.textContent = "Level " + L;
        flash.animate([{ opacity: 0, transform: "translate(-50%,-40%) scale(.96)" }, { opacity: 1, transform: "translate(-50%,-50%) scale(1)", offset: 0.25 }, { opacity: 1, offset: 0.7 }, { opacity: 0, transform: "translate(-50%,-56%) scale(1.02)" }], { duration: 1800, easing: "cubic-bezier(.16,1,.3,1)" });
        lastLevel = L;
      }
      hud.animate([{ opacity: 0.2, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 700, easing: "cubic-bezier(.16,1,.3,1)" });
    };
    onRoom.progress = (p) => {
      const f = p * (rooms.length - 1);
      bars.forEach((b, j) => b.style.setProperty("--p", Math.max(0, Math.min(1, f - j + 1))));
    };
    const ok = initWalkthrough(sec, rooms, onRoom);
    if (!ok) sec.classList.remove("gl-on");
    else window.dispatchEvent(new Event("walk:ready"));
  };
  // load the 3D after first paint, when the visitor is near it
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { io.disconnect(); window.requestIdleCallback ? window.requestIdleCallback(start, { timeout: 800 }) : setTimeout(start, 200); }
  }, { rootMargin: "120% 0px" });
  io.observe(sec);
}
