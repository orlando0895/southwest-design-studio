import { initWalkthrough } from "./walkthrough.js";

const sec = document.querySelector("#walk");
if (sec) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lowEnd = matchMedia("(pointer: coarse)").matches && (navigator.hardwareConcurrency || 8) <= 4;
  const figs = [...sec.querySelectorAll(".rail figure")];
  const rooms = figs.map((f) => ({
    src: f.querySelector("img").getAttribute("src"),
    ratio: parseFloat(f.dataset.ratio) || 1.5,
    name: f.querySelector("b").textContent,
    line: f.querySelector("span").textContent,
  }));
  const hud = sec.querySelector(".hud-card");
  const bars = [...sec.querySelectorAll(".hud-prog i")];

  const start = () => {
    if (reduce || lowEnd) return;
    sec.classList.add("gl-on");
    const onRoom = (i) => {
      hud.querySelector(".idx").textContent = String(i + 1).padStart(2, "0") + " / " + String(rooms.length).padStart(2, "0");
      hud.querySelector("h3").textContent = rooms[i].name;
      hud.querySelector(".desc").textContent = rooms[i].line;
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
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); window.requestIdleCallback ? window.requestIdleCallback(start, { timeout: 800 }) : setTimeout(start, 200); } }, { rootMargin: "120% 0px" });
  io.observe(sec);
}
