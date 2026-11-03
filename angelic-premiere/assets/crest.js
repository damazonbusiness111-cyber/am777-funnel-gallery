/* Angelic crest — real-time 3D render of the hexagon logo (Three.js r128).
   Obsidian lacquer slab, gold bevel, gold artwork embossed from the logo file.
   Hover to tilt, drag to spin, tap to flip. Pauses off-screen. */
(() => {
const cv = document.getElementById('crest');
if (!cv || !window.THREE) return;
const wrap = cv.parentElement;
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
catch { return; }
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.45;
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(28, 1, .1, 50);
cam.position.set(0, 0, 5.4);

/* studio environment for metal reflections: warm softboxes in a dark room */
const pm = new THREE.PMREMGenerator(renderer);
const env = new THREE.Scene();
env.add(new THREE.Mesh(new THREE.SphereGeometry(12, 32, 16), new THREE.ShaderMaterial({
  side: THREE.BackSide,
  vertexShader: 'varying vec3 p; void main(){ p = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
  fragmentShader: 'varying vec3 p; void main(){ float h = p.y*.5+.5; vec3 c = mix(vec3(.02,.018,.016), vec3(.30,.22,.14), smoothstep(.35,1.,h)); gl_FragColor = vec4(c,1.); }'
})));
const soft = (w, h, x, y, z, hex, k) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m); };
soft(7, 2.2, 0, 6, 4, 0xfff0d2, 7);
soft(5, 3, -1.5, 1.2, 8, 0xfff3dc, 2.4);
soft(2.2, 7, -7, .5, 3, 0xffd49a, 4.5);
soft(2, 6, 7, 1, 1, 0xd9e2ff, 1.4);
soft(9, 1.2, 0, -6, 5, 0xffe0aa, 1.1);
scene.environment = pm.fromScene(env, .035).texture;

const key = new THREE.PointLight(0xffe2b0, 1.4, 12); key.position.set(2.4, 2, 3.2); scene.add(key);
scene.add(new THREE.AmbientLight(0xffffff, .08));

/* hexagon slab — pointy top, matching the logo */
const R = .985, shape = new THREE.Shape();
for (let i = 0; i < 6; i++) { const a = Math.PI / 2 + i * Math.PI / 3, x = Math.cos(a) * R, y = Math.sin(a) * R; i ? shape.lineTo(x, y) : shape.moveTo(x, y); }
shape.closePath();
const geo = new THREE.ExtrudeGeometry(shape, { depth: .14, bevelEnabled: true, bevelThickness: .05, bevelSize: .03, bevelSegments: 12, curveSegments: 1 });
geo.translate(0, 0, -.07);
/* caps share one group; split it so the back cap gets its own (un-mirrored) material */
{ const [lid, side] = geo.groups, half = lid.count / 2; geo.clearGroups(); geo.addGroup(lid.start, half, 2); geo.addGroup(lid.start + half, half, 0); geo.addGroup(side.start, side.count, 1); }

const rim = new THREE.MeshStandardMaterial({ color: 0xe8cc8e, metalness: 1, roughness: .2, envMapIntensity: 1.25 });
const face = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: 1, envMapIntensity: 1.3, clearcoat: 1, clearcoatRoughness: .06 });
const back = face.clone();
const crest = new THREE.Mesh(geo, [face, rim, back]);
const rig = new THREE.Group(); rig.add(crest); scene.add(rig);

/* a narrow spotlight that sweeps across the face every few seconds — the "glint" */
const sweep = new THREE.SpotLight(0xfff4dc, 0, 14, .32, .65, 1.2);
sweep.position.set(-4, 2.5, 4); sweep.target = rig; scene.add(sweep);

/* gold dust drifting around the crest */
const DUST = 160, dpos = new Float32Array(DUST * 3), dseed = new Float32Array(DUST);
for (let i = 0; i < DUST; i++) {
  const a = Math.random() * Math.PI * 2, r = 1.25 + Math.random() * .9;
  dpos[i * 3] = Math.cos(a) * r; dpos[i * 3 + 1] = (Math.random() - .5) * 2.4; dpos[i * 3 + 2] = Math.sin(a) * r * .5 - .3; dseed[i] = Math.random() * 6.28;
}
const dgeo = new THREE.BufferGeometry(); dgeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
const spr = document.createElement('canvas'); spr.width = spr.height = 64;
{ const g = spr.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,240,200,1)'); gr.addColorStop(.25, 'rgba(240,205,140,.6)'); gr.addColorStop(1, 'rgba(240,205,140,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }
const dmat = new THREE.PointsMaterial({ size: .07, map: new THREE.CanvasTexture(spr), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 });
const dust = new THREE.Points(dgeo, dmat); scene.add(dust);

/* build colour / metal-rough / bump maps from the logo artwork */
const img = new Image();
img.onload = () => {
  const N = 1024, mk = () => { const c = document.createElement('canvas'); c.width = c.height = N; return c; };
  const src = mk(), sx = src.getContext('2d'); sx.drawImage(img, 0, 0, N, N);
  const d = sx.getImageData(0, 0, N, N).data;
  const col = mk(), mr = mk(), bump = mk();
  const cx = col.getContext('2d'), mx = mr.getContext('2d'), bx = bump.getContext('2d');
  const C = cx.createImageData(N, N), Mr = mx.createImageData(N, N), B = bx.createImageData(N, N);
  for (let i = 0; i < d.length; i += 4) {
    const a = d[i + 3] / 255, lum = (d[i] * .4 + d[i + 1] * .45 + d[i + 2] * .15) / 255;
    const t = Math.min(1, Math.max(0, (lum - .16) / .55)) * a;           // 0 = black lacquer, 1 = gold
    C.data[i] = 20 + t * (232 - 20); C.data[i + 1] = 18 + t * (204 - 18); C.data[i + 2] = 16 + t * (150 - 16); C.data[i + 3] = 255;
    Mr.data[i] = 0; Mr.data[i + 1] = 255 * (.34 - t * .1); Mr.data[i + 2] = 255 * (.12 + t * .88); Mr.data[i + 3] = 255;
    B.data[i] = B.data[i + 1] = B.data[i + 2] = t * 255; B.data[i + 3] = 255;
  }
  cx.putImageData(C, 0, 0); mx.putImageData(Mr, 0, 0); bx.putImageData(B, 0, 0);
  const soft = mk(), so = soft.getContext('2d'); so.filter = 'blur(3px)'; so.drawImage(bump, 0, 0);
  const tex = (c, srgb) => { const t = new THREE.CanvasTexture(c); if (srgb) t.encoding = THREE.sRGBEncoding; t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); t.repeat.set(.5, .5); t.offset.set(.5, .5); return t; };
  face.map = tex(col, true); face.metalnessMap = face.roughnessMap = tex(mr); face.bumpMap = tex(soft); face.bumpScale = .018;
  face.needsUpdate = true;
  /* back cap: same artwork, flipped horizontally so it reads correctly from behind */
  const flip = t => { const c = t.clone(); c.repeat.set(-.5, .5); c.offset.set(.5, .5); c.needsUpdate = true; return c; };
  back.map = flip(face.map); back.metalnessMap = back.roughnessMap = flip(face.metalnessMap); back.bumpMap = flip(face.bumpMap); back.bumpScale = face.bumpScale; back.needsUpdate = true;
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
const up = () => { if (!drag) return; if (drag.moved < 4) vel = .32; drag = null; cv.style.cursor = ''; };
cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
cv.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); vel = .32; } });

/* sizing — scale() raises the render resolution while the crest is shown enlarged (intro) */
let resK = 1;
const DPR = () => Math.min(devicePixelRatio || 1, 2);
window.__crest = { scale(k) { resK = Math.max(1, Math.min(2.4, k)); renderer.setPixelRatio(Math.min(3, DPR() * resK)); size(); } };
const size = () => { const w = wrap.clientWidth, h = wrap.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
new ResizeObserver(size).observe(wrap); size();

/* loop — runs only while visible */
let running = false, visible = true, t0 = 0, life = 0, started = false;
const easeOut = x => 1 - Math.pow(1 - x, 4);
function frame(now) {
  if (!running) return;
  const dt = Math.min(.05, (now - t0) / 1000 || .016); t0 = now; life += dt;
  const k = 1 - Math.exp(-dt * 5);
  cxp += (tx - cxp) * k; cyp += (ty - cyp) * k; hv += (hover - hv) * k;
  if (!drag) {
    spin += vel; vel *= Math.pow(.93, dt * 60);
    if (Math.abs(vel) < .002) { const target = Math.round(spin / (Math.PI * 2)) * Math.PI * 2; spin += (target - spin) * (1 - Math.exp(-dt * 3.2)); vel = 0; }
  }
  const intro = RM ? 1 : easeOut(Math.min(1, life / 2.2));
  const idle = RM ? 0 : 1;
  rig.rotation.y = (1 - intro) * -2.4 + spin + Math.sin(life * .45) * .16 * idle + cxp * .45;
  rig.rotation.x = cyp * .32 + Math.sin(life * .6) * .04 * idle;
  rig.position.y = Math.sin(life * .9) * .035 * idle - (1 - intro) * .25;
  const s = (.7 + .3 * intro) * (1 + hv * .035); rig.scale.setScalar(s);
  key.position.x = Math.cos(life * .5) * 3; key.position.y = 1.6 + Math.sin(life * .35) * 1.2;
  key.intensity = 1.1 + hv * .8;
  const sp = (life % 7) / 7;                      // one glint every 7 s
  const g = sp < .32 ? Math.sin(sp / .32 * Math.PI) : 0;
  sweep.position.x = -4 + (sp / .32) * 8; sweep.intensity = RM ? 0 : g * 9;
  dust.rotation.y = life * .06; dust.position.y = Math.sin(life * .4) * .05;
  dmat.opacity = Math.min(.85, life * .5) * (.75 + .25 * Math.sin(life * 1.7));
  renderer.render(scene, cam);
  if (!started) { started = true; wrap.classList.add('live'); }
  requestAnimationFrame(frame);
}
function play() { if (running || !visible || document.hidden || !face.map) return; running = true; t0 = performance.now(); requestAnimationFrame(frame); }
function start() { new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? play() : (running = false); }).observe(wrap); play(); }
document.addEventListener('visibilitychange', () => document.hidden ? (running = false) : play());
})();
