/* Angelic crest — real-time 3D render of the hexagon logo (Three.js r128).
   Obsidian lacquer slab, gold bevel, gold artwork embossed from the logo file.
   Hover to tilt, drag to spin, tap to flip. Pauses off-screen. */
(() => {
const cv = document.getElementById('crest');
if (!cv || !window.THREE) return;
const wrap = cv.parentElement;
const GLASS = parseFloat(cv.dataset.glass || '.14');   // face opacity of the glass: .14 = clear smoked glass, ~.8 = near-solid lacquer (for light pages)
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
catch { return; }
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(28, 1, .1, 50);
cam.position.set(0, 0, 5.4);

/* studio environment for metal reflections.
   Built as a plain 8-bit cube map from canvases — no PMREM / half-float render targets,
   which some integrated GPUs (Intel Iris / ANGLE) fail on, leaving metals pure black. */
const cubeFace = (top) => {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  g.fillStyle = top === 'py' ? '#2a241c' : top === 'ny' ? '#0d0b09' : '#16130f'; g.fillRect(0, 0, 256, 256);
  const strip = (x, y, w, h, a) => { const gr = g.createLinearGradient(x, 0, x + w, 0); gr.addColorStop(0, `rgba(255,244,222,0)`); gr.addColorStop(.5, `rgba(255,246,228,${a})`); gr.addColorStop(1, `rgba(255,244,222,0)`); g.fillStyle = gr; g.fillRect(x, y, w, h); };
  if (top === 'pz') { strip(40, 20, 46, 216, 1); strip(170, 30, 30, 200, .7); }     // front: two tall strips (the clean double highlight)
  else if (top === 'nx') { strip(90, 30, 70, 196, .9); }                              // key side
  else if (top === 'px') { strip(110, 60, 40, 140, .45); }                            // fill side
  else if (top === 'py') { const gr = g.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, 'rgba(255,240,210,.85)'); gr.addColorStop(1, 'rgba(255,240,210,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }
  else if (top === 'nz') { strip(100, 50, 56, 150, .35); }
  return c;
};
const envMap = new THREE.CubeTexture(['px', 'nx', 'py', 'ny', 'pz', 'nz'].map(cubeFace));
envMap.encoding = THREE.sRGBEncoding; envMap.needsUpdate = true;

const key = new THREE.PointLight(0xffe2b0, 1.1, 12); key.position.set(2.4, 2, 3.2); scene.add(key);
const sun = new THREE.DirectionalLight(0xfff0d6, 1.5); sun.position.set(-2, 3, 4); scene.add(sun);
const fill = new THREE.DirectionalLight(0xffe2b8, .55); fill.position.set(3, -1, 3); scene.add(fill);
scene.add(new THREE.AmbientLight(0xfff2dc, .35));

/* hexagon slab — pointy top, matching the logo */
const R = .985, shape = new THREE.Shape();
for (let i = 0; i < 6; i++) { const a = Math.PI / 2 + i * Math.PI / 3, x = Math.cos(a) * R, y = Math.sin(a) * R; i ? shape.lineTo(x, y) : shape.moveTo(x, y); }
shape.closePath();
const geo = new THREE.ExtrudeGeometry(shape, { depth: .14, bevelEnabled: true, bevelThickness: .06, bevelSize: .045, bevelSegments: 6, curveSegments: 1 });
geo.translate(0, 0, -.07);
/* caps share one group; split it so the back cap gets its own (un-mirrored) material */
{ const [lid, side] = geo.groups, half = lid.count / 2; geo.clearGroups(); geo.addGroup(lid.start, half, 2); geo.addGroup(lid.start + half, half, 0); geo.addGroup(side.start, side.count, 1); }

const rim = new THREE.MeshStandardMaterial({ color: 0xdcb86e, metalness: 1, roughness: .16, envMap, envMapIntensity: 1.9, emissive: 0x2a1c08, emissiveIntensity: .45 });
const face = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 1, envMap, envMapIntensity: 1.3, emissive: 0xffffff, emissiveIntensity: .28 });
const back = face.clone();
const crest = new THREE.Mesh(geo, [face, rim, back]);
const rig = new THREE.Group(); rig.add(crest); scene.add(rig);

/* a narrow spotlight that sweeps across the face every few seconds — the "glint" */
const sweep = new THREE.SpotLight(0xfff4dc, 0, 14, .32, .65, 1.2);
sweep.position.set(-4, 2.5, 4); sweep.target = rig; scene.add(sweep);

/* build colour / metal-rough / bump maps from the logo artwork */
const img = new Image();
img.onload = () => {
  const N = 768, mk = () => { const c = document.createElement('canvas'); c.width = c.height = N; return c; };
  const src = mk(), sx = src.getContext('2d'); sx.drawImage(img, 0, 0, N, N);
  const d = sx.getImageData(0, 0, N, N).data;
  const col = mk(), mr = mk(), bump = mk();
  const cx = col.getContext('2d'), mx = mr.getContext('2d'), bx = bump.getContext('2d');
  const C = cx.createImageData(N, N), Mr = mx.createImageData(N, N), B = bx.createImageData(N, N);
  for (let i = 0; i < d.length; i += 4) {
    const a = d[i + 3] / 255, lum = (d[i] * .4 + d[i + 1] * .45 + d[i + 2] * .15) / 255;
    const t = Math.min(1, Math.max(0, (lum - .16) / .55)) * a;           // 0 = black lacquer, 1 = gold
    C.data[i] = 26 + t * (232 - 26); C.data[i + 1] = 23 + t * (204 - 23); C.data[i + 2] = 20 + t * (150 - 20); C.data[i + 3] = 255;
    Mr.data[i] = 0; Mr.data[i + 1] = 255 * (.4 - t * .18); Mr.data[i + 2] = 255 * (.05 + t * .83); Mr.data[i + 3] = 255;
    B.data[i] = B.data[i + 1] = B.data[i + 2] = t * 255; B.data[i + 3] = 255;
  }
  cx.putImageData(C, 0, 0); mx.putImageData(Mr, 0, 0); bx.putImageData(B, 0, 0);
  const em = mk(), ex = em.getContext('2d'), E = ex.createImageData(N, N);
  for (let i = 0; i < d.length; i += 4) { const k = C.data[i] > 60 ? (C.data[i] - 20) / 212 : 0; E.data[i] = 150 * k; E.data[i + 1] = 118 * k; E.data[i + 2] = 64 * k; E.data[i + 3] = 255; }
  ex.putImageData(E, 0, 0);
  const al = mk(), ax = al.getContext('2d'), A = ax.createImageData(N, N);
  for (let i = 0; i < d.length; i += 4) { const t = (C.data[i] - 26) / (232 - 26); const v = 255 * Math.max(GLASS, Math.min(1, t * 1.15)); A.data[i] = A.data[i + 1] = A.data[i + 2] = v; A.data[i + 3] = 255; }
  ax.putImageData(A, 0, 0);
  const soft = mk(), so = soft.getContext('2d'); so.filter = 'blur(3px)'; so.drawImage(bump, 0, 0);
  const tex = (c, srgb) => { const t = new THREE.CanvasTexture(c); if (srgb) t.encoding = THREE.sRGBEncoding; t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); t.repeat.set(.5, .5); t.offset.set(.5, .5); return t; };
  face.map = tex(col, true); face.alphaMap = tex(al); face.transparent = true; face.emissiveMap = tex(em, true); face.metalnessMap = face.roughnessMap = tex(mr); face.bumpMap = tex(soft); face.bumpScale = .022;
  face.needsUpdate = true;
  /* back cap: same artwork, flipped horizontally so it reads correctly from behind */
  const flip = t => { const c = t.clone(); c.repeat.set(-.5, .5); c.offset.set(.5, .5); c.needsUpdate = true; return c; };
  back.map = flip(face.map); back.emissiveMap = flip(face.emissiveMap); back.alphaMap = flip(face.alphaMap); back.transparent = true; back.metalnessMap = back.roughnessMap = flip(face.metalnessMap); back.bumpMap = flip(face.bumpMap); back.bumpScale = face.bumpScale; back.needsUpdate = true;
  start();
};
img.src = cv.dataset.src || 'img/crest.png';

/* interaction */
let tx = 0, ty = 0, cxp = 0, cyp = 0, spin = 0, vel = 0, drag = null, hover = 0, hv = 0;
const onMove = e => { const r = wrap.getBoundingClientRect(); const px = (e.clientX - (r.left + r.width / 2)) / Math.max(innerWidth * .5, 1), py = (e.clientY - (r.top + r.height / 2)) / Math.max(innerHeight * .5, 1); tx = Math.max(-1, Math.min(1, px)); ty = Math.max(-1, Math.min(1, py)); };
addEventListener('pointermove', onMove, { passive: true });
cv.addEventListener('pointerenter', () => hover = 1); cv.addEventListener('pointerleave', () => hover = 0);
cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, t: performance.now(), moved: 0 }; cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; });
cv.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.x, now = performance.now(); drag.moved += Math.abs(dx); spin += dx * .012; vel = dx * .012 / Math.max(1, now - drag.t) * 16; drag.x = e.clientX; drag.t = now; });
let turnAt = -1, turnDur = 2, glintAt = -10;
const turn = (d = 2) => { turnAt = life; turnDur = d; glintAt = life + d * .35; };
const up = () => { if (!drag) return; if (drag.moved < 4 && turnAt < 0) turn(1.8); drag = null; cv.style.cursor = ''; };
cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
cv.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (turnAt < 0) turn(1.8); } });

/* sizing — scale() raises the render resolution while the crest is shown enlarged (intro) */
let resK = 1;
const DPR = () => Math.min(devicePixelRatio || 1, 1.5);
window.__crest = { turn: d => turn(d), scale(k) { resK = Math.max(1, Math.min(1.6, k)); renderer.setPixelRatio(Math.min(2, DPR() * resK)); size(); } };
const size = () => { const w = wrap.clientWidth, h = wrap.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
new ResizeObserver(size).observe(wrap); size();

/* loop — runs only while visible */
let running = false, visible = true, t0 = 0, life = 0, started = false;
const easeOut = x => 1 - Math.pow(1 - x, 5);
const easeIO = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
function frame(now) {
  if (!running) return;
  const dt = Math.min(.05, (now - t0) / 1000 || .016); t0 = now; life += dt;
  const k = 1 - Math.exp(-dt * 5);
  cxp += (tx - cxp) * k; cyp += (ty - cyp) * k; hv += (hover - hv) * k;
  if (!drag) {
    spin += vel; vel *= Math.pow(.93, dt * 60);
    if (Math.abs(vel) < .002) { const target = Math.round(spin / (Math.PI * 2)) * Math.PI * 2; spin += (target - spin) * (1 - Math.exp(-dt * 3.2)); vel = 0; }
  }
  const intro = RM ? 1 : easeOut(Math.min(1, life / 3.4));
  renderer.toneMappingExposure = .3 + .85 * intro;
  let tw = 0;
  if (turnAt >= 0) { const u = Math.min(1, (life - turnAt) / turnDur); tw = easeIO(u) * Math.PI * 2; if (u >= 1) { turnAt = -1; tw = 0; } }
  const idle = RM ? 0 : 1;
  const sc = Math.min(1, scrollY / Math.max(1, innerHeight));
  rig.rotation.y = (1 - intro) * -1.5 + spin + tw + sc * .9 + Math.sin(life * .28) * .12 * idle + cxp * .38;
  rig.rotation.x = cyp * .26 + Math.sin(life * .4) * .03 * idle;
  rig.position.y = Math.sin(life * .6) * .03 * idle - (1 - intro) * .18;
  const s = (.86 + .14 * intro) * (1 + hv * .025); rig.scale.setScalar(s);
  key.position.x = Math.cos(life * .3) * 3; key.position.y = 1.6 + Math.sin(life * .22) * 1.1;
  key.intensity = .9 + hv * .5;
  // one slow glint every 9 s, plus one during each cinematic turn
  const gl = life - glintAt;
  const sp = gl >= 0 && gl < 2.6 ? gl / 2.6 : ((life % 9) / 9) / .3;
  const g = sp < 1 ? Math.sin(sp * Math.PI) : 0;
  sweep.position.x = -4 + Math.min(1, sp) * 8; sweep.intensity = RM ? 0 : g * 7;
  renderer.render(scene, cam);
  if (!started) { started = true; wrap.classList.add('live'); }
  requestAnimationFrame(frame);
}
function play() { if (running || !visible || document.hidden || !face.map) return; running = true; t0 = performance.now(); requestAnimationFrame(frame); }
function start() { new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? play() : (running = false); }).observe(wrap); play(); }
document.addEventListener('visibilitychange', () => document.hidden ? (running = false) : play());
})();
