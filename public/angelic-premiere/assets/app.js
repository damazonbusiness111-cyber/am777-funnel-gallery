(() => {
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const M = !RM && window.Motion ? window.Motion : null;
const EASE = [0.22, 1, 0.36, 1];
const SPRING = { type: 'spring', stiffness: 380, damping: 34 };
if ($('.hero2')) document.body.classList.add('has-hero');
const anim = (el, kf, opt) => M ? M.animate(el, kf, opt) : (Object.entries(kf).forEach(([k, v]) => { const last = Array.isArray(v) ? v[v.length - 1] : v; if (k === 'opacity') el.style && (el.style.opacity = last); }), { finished: Promise.resolve() });
const DATA = JSON.parse($('#site-data').textContent);
const UNITS = DATA.units, ORDER = DATA.order;
const PHONE = DATA.phone, PHONE_RAW = DATA.phoneRaw, EMAIL = DATA.email;
const peso = n => '₱' + n.toLocaleString('en-PH');
const ICON = {
  check: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6.5l2.2 2.2L9.5 3.8"/></svg>',
  l: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3L5 8l5 5"/></svg>',
  r: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3l5 5-5 5"/></svg>',
};

/* ---------- toast ---------- */
let toastEl;
function toast(t) {
  toastEl?.remove(); toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); toastEl.textContent = t; document.body.appendChild(toastEl);
  const el = toastEl; anim(el, { opacity: [0, 1], y: [-10, 0] }, { duration: .4, ease: EASE });
  setTimeout(() => anim(el, { opacity: 0, y: -8 }, { duration: .3 }).finished.then(() => el.remove()), 1800);
}
async function copyText(text, target) {
  try { await navigator.clipboard.writeText(text); toast('Copied'); }
  catch { if (target) { const r = document.createRange(); r.selectNodeContents(target); const s = getSelection(); s.removeAllRanges(); s.addRange(r); } toast('Selected — copy with your keyboard'); }
}
$$('[data-copy]').forEach(b => b.addEventListener('click', () => { const t = $('#' + b.dataset.copy); copyText(t.textContent.trim(), t); }));

/* ---------- menu ---------- */
const mb = $('.menu-btn'), links = $('.links');
if (mb) mb.addEventListener('click', () => {
  const open = !links.classList.contains('open'); links.classList.toggle('open', open); mb.setAttribute('aria-expanded', open);
  if (open) anim(links, { opacity: [0, 1], scale: [.94, 1] }, { duration: .35, ease: EASE });
});
$$('.links a').forEach(a => a.addEventListener('click', () => { links.classList.remove('open'); mb?.setAttribute('aria-expanded', false); }));
document.addEventListener('click', e => { if (links?.classList.contains('open') && !e.target.closest('.links,.menu-btn')) { links.classList.remove('open'); mb.setAttribute('aria-expanded', false); } });

/* ---------- segmented controls ---------- */
function seg(el, onChange) {
  const btns = $$('button', el); let thumb = $('.thumb', el);
  if (!thumb) { thumb = document.createElement('span'); thumb.className = 'thumb'; thumb.setAttribute('aria-hidden', 'true'); el.prepend(thumb); }
  const attr = el.getAttribute('role') === 'tablist' ? 'aria-selected' : 'aria-checked';
  const place = (b, instant) => {
    const x = b.offsetLeft, w = b.offsetWidth;
    if (M && !instant) M.animate(thumb, { left: x + 'px', width: w + 'px' }, SPRING); else { thumb.style.width = w + 'px'; thumb.style.left = x + 'px'; }
  };
  const select = (b, focus, silent) => {
    btns.forEach(x => { const on = x === b; x.setAttribute(attr, on); x.tabIndex = on ? 0 : -1; });
    place(b); if (focus) b.focus(); if (!silent) onChange?.(b.dataset.v, b);
  };
  btns.forEach((b, i) => {
    b.addEventListener('click', () => select(b));
    b.addEventListener('keydown', e => { const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (d) { e.preventDefault(); select(btns[(i + d + btns.length) % btns.length], true); } });
  });
  const cur = btns.find(b => b.getAttribute(attr) === 'true') || btns[0];
  requestAnimationFrame(() => place(cur, true));
  new ResizeObserver(() => place(btns.find(b => b.getAttribute(attr) === 'true'), true)).observe(el);
  return { set: (v, silent) => { const b = btns.find(x => x.dataset.v === v); if (b) select(b, false, silent); } };
}

/* ---------- reveal with staggered delay ---------- */
if (M) {
  $$('[data-r]').forEach(group => {
    const items = group.hasAttribute('data-r-children') ? [...group.children] : [group];
    if (group.getBoundingClientRect().top < innerHeight * .92) return; // already on screen: stay put
    items.forEach(i => { i.style.opacity = 0; i.style.transform = 'translateY(28px)'; });
    M.inView(group, () => { M.animate(items, { opacity: 1, y: [28, 0] }, { duration: 1, ease: EASE, delay: M.stagger(.09) }); }, { amount: .15 });
  });
  // hero entrance
  window.__heroIn = () => {
    const hero = $$('.hero-top > :not(.crest-wrap), .hero2 .slide-dots, .hero2 .scroll-cue');
    if (hero.length) M.animate(hero, { opacity: [0, 1], y: [22, 0], filter: ['blur(6px)', 'blur(0px)'] }, { duration: 1.1, ease: EASE, delay: M.stagger(.1, { startDelay: .05 }) });
  };
  if (!$('#intro')) window.__heroIn();
  const hi = $('.hero-img img');
  if (hi) {
    M.animate($('.hero-img'), { opacity: [0, 1], scale: [.97, 1] }, { duration: 1.4, ease: EASE, delay: .25 });
    M.scroll(M.animate(hi, { scale: [1.12, 1], y: ['-4%', '6%'] }, { ease: 'linear' }), { target: $('.hero-img'), offset: ['start end', 'end start'] });
  }
  const qbEl = $('.qb'); if (qbEl) M.animate(qbEl, { opacity: [0, 1], y: [30, 0] }, { duration: 1, ease: EASE, delay: .55 });
  // gentle press feedback on pills
  $$('.pill').forEach(p => p.addEventListener('pointerdown', () => M.animate(p, { scale: .96 }, { duration: .12 })));
  $$('.pill').forEach(p => ['pointerup', 'pointerleave'].forEach(ev => p.addEventListener(ev, () => M.animate(p, { scale: 1 }, { type: 'spring', stiffness: 500, damping: 18 }))));
}

/* ---------- full-bleed hero slider + header over hero ---------- */
const slides = $$('.slides img');
if (slides.length) {
  let i = 0; slides[0].classList.add('on');
  const dots = $$('.slide-dots button');
  const show = n => { slides[i].classList.remove('on'); dots[i]?.setAttribute('aria-current', 'false'); i = (n + slides.length) % slides.length; slides[i].classList.add('on'); dots[i]?.setAttribute('aria-current', 'true'); };
  let timer = RM ? null : setInterval(() => show(i + 1), 6500);
  dots.forEach((d, n) => d.addEventListener('click', () => { show(n); clearInterval(timer); timer = RM ? null : setInterval(() => show(i + 1), 6500); }));
  if (M) M.scroll(M.animate($('.slides'), { y: ['0%', '18%'], scale: [1, 1.06] }, { ease: 'linear' }), { target: $('.hero'), offset: ['start start', 'end start'] });
}
const hdr = $('.hdr');
if (document.body.classList.contains('has-hero') && hdr) {
  const upd = () => hdr.classList.toggle('solid', scrollY > 40); addEventListener('scroll', upd, { passive: true }); upd();
}

/* ---------- residences explorer ---------- */
const ex = $('#explorer');
if (ex) {
  const stage = $('.ex-stage', ex), thumbs = $('.ex-thumbs', ex);
  let cur = ORDER[0], photo = 0, busy = false;
  const setPhoto = (src, alt, dir = 1) => {
    const old = $('img', stage), img = new Image(); img.src = src; img.alt = alt; img.decoding = 'async';
    stage.appendChild(img);
    if (!M) { old?.remove(); return; }
    M.animate(img, { opacity: [0, 1], scale: [1.06, 1] }, { duration: .9, ease: EASE }).finished.then(() => old?.remove());
  };
  const renderThumbs = u => {
    thumbs.innerHTML = u.photos.map((p, i) => `<button type="button" aria-label="Photo ${i + 1} of ${u.photos.length}" aria-current="${i === 0}"><img src="${p}" alt="" loading="lazy"></button>`).join('');
    $$('button', thumbs).forEach((b, i) => b.addEventListener('click', () => {
      if (i === photo) return; photo = i; $$('button', thumbs).forEach((x, j) => x.setAttribute('aria-current', j === i));
      setPhoto(u.photos[i], `${u.name}, photo ${i + 1}`);
    }));
  };
  const render = k => {
    const u = UNITS[k]; cur = k; photo = 0;
    $('#ex-name').textContent = u.name; $('#ex-meta').textContent = `${u.area} sqm · ${u.floors}`;
    $('#ex-blurb').textContent = u.blurb; $('#ex-price').textContent = peso(u.from);
    $('#ex-rows').innerHTML = u.variants.map(v => `<div class="row"><span class="k">${v[0]}</span><span class="v tnum">${v[1]}</span></div>`).join('');
    $('#ex-link').href = u.slug + '.html'; $('#ex-book').href = 'book.html#' + k;
    setPhoto(u.photos[0], `${u.name} at Angelic Premiere Residences`); renderThumbs(u);
    if (M) M.animate($$('.ex-title > *, .ex-price, #ex-blurb, #ex-rows .row, .ex-info .acts', ex), { opacity: [0, 1], y: [12, 0] }, { duration: .6, ease: EASE, delay: M.stagger(.05) });
  };
  seg($('#ex-seg'), render);
  render(cur);
}

/* ---------- amenities rail ---------- */
$$('[data-rail]').forEach(wrap => {
  const rail = $('.rail', wrap.parentElement) || $('.rail'); const [prev, next] = $$('.rail-nav button', wrap);
  const step = () => (rail.querySelector('.slide')?.offsetWidth || 300) + 22;
  const upd = () => { prev.disabled = rail.scrollLeft < 8; next.disabled = rail.scrollLeft + rail.clientWidth > rail.scrollWidth - 8; };
  prev.addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: RM ? 'auto' : 'smooth' }));
  next.addEventListener('click', () => rail.scrollBy({ left: step(), behavior: RM ? 'auto' : 'smooth' }));
  rail.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
});

/* ---------- unit gallery dots ---------- */
const gal = $('.gal');
if (gal) {
  const figs = $$('figure', gal), dots = $('.pdots'), [gp, gn] = $$('.gal-ctl .rail-nav button');
  dots.innerHTML = figs.map(() => '<i></i>').join('');
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && e.intersectionRatio > .6) { const i = figs.indexOf(e.target); $$('i', dots).forEach((d, j) => d.classList.toggle('on', j === i)); gp.disabled = i === 0; gn.disabled = i === figs.length - 1; } }), { root: gal, threshold: [.6] });
  figs.forEach(f => io.observe(f));
  const w = () => figs[0].offsetWidth + 14;
  gp.addEventListener('click', () => gal.scrollBy({ left: -w(), behavior: RM ? 'auto' : 'smooth' }));
  gn.addEventListener('click', () => gal.scrollBy({ left: w(), behavior: RM ? 'auto' : 'smooth' }));
}

/* ================= BOOKING PAGE (book.html) ================= */
const booker = $('#booker');
const INTENTS = [
  { v: 'short', t: 'Short stay', s: 'A few nights or weeks · quoted on request' },
  { v: 'monthly', t: 'Monthly rental', s: 'From ₱35,000 a month · utilities billed separately' },
  { v: 'buy', t: 'Buy a residence', s: 'Book a viewing with the team' },
  { v: 'manage', t: 'Full Management', s: 'For owners · maintenance, rentals, payments, tax' },
];
const st = { intent: null, unit: null, start: null, end: null, guests: 2, name: '', contact: '', notes: '', step: 0 };
const STEPS = ['Booking type', 'Residence', 'Dates', 'Your details', 'Review'];
let calMonth;
const iso = d => d.toISOString().slice(0, 10);
const today0 = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const fmtD = d => d ? d.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' }) : '—';
const nights = () => st.start && st.end ? Math.round((st.end - st.start) / 864e5) : 0;
const rangeMode = () => st.intent === 'short';
const dateLabel = () => ({ short: 'Check-in', monthly: 'Move-in', buy: 'Viewing date', manage: 'Call-back date' })[st.intent] || 'Date';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function summary() {
  const u = st.unit && UNITS[st.unit], it = INTENTS.find(i => i.v === st.intent);
  const img = $('#sum-img');
  if (img) { const src = u ? u.photos[0] : 'img/slide-pool.webp'; if (img.getAttribute('src') !== src) { img.src = src; if (M) M.animate(img, { opacity: [0, 1], scale: [1.05, 1] }, { duration: .8, ease: EASE }); } }
  const set = (id, v) => { const el = $('#' + id); if (el && el.textContent !== v) { el.textContent = v; if (M) M.animate(el, { opacity: [0, 1] }, { duration: .4 }); } };
  set('sum-name', u ? u.name : 'Choose a residence');
  set('sum-meta', u ? `${u.area} sqm · ${u.floors}` : 'Studio to penthouse');
  set('sum-type', it ? it.t : '—');
  set('sum-dates', st.start ? (rangeMode() ? `${fmtD(st.start)} – ${fmtD(st.end)}` : fmtD(st.start)) : '—');
  set('sum-dl', dateLabel());
  set('sum-guests', (st.intent === 'short' || st.intent === 'monthly') ? String(st.guests) : '—');
  set('sum-rate', u ? (st.intent === 'short' ? 'Quoted on request' : `from ${peso(u.from)}/mo`) : '—');
}
function go(n, dir = 1) {
  if (n < 0) return;
  const el = $('.step', booker);
  const swap = () => { st.step = n; renderStep(dir); };
  if (!M) return swap();
  M.animate(el, { opacity: 0, x: -24 * dir }, { duration: .18, ease: 'easeIn' }).finished.then(swap);
}
function validate() {
  if (st.step === 0 && !st.intent) return 'Choose what you would like to book.';
  if (st.step === 1 && !st.unit) return 'Choose a residence to continue.';
  if (st.step === 2 && !st.start) return `Pick a ${dateLabel().toLowerCase()} to continue.`;
  if (st.step === 2 && rangeMode() && !st.end) return 'Pick your check-out date.';
  if (st.step === 3 && (!st.name.trim() || !st.contact.trim())) return 'Add your name and a mobile number or email.';
  return '';
}
function next() {
  if (st.step === 4) { Object.assign(st, { intent: null, unit: null, start: null, end: null, guests: 2, notes: '' }); return go(0, -1); }
  const msg = validate(), err = $('.err', booker);
  if (msg) { if (err) { err.textContent = msg; err.hidden = false; if (M) M.animate(err, { x: [0, -6, 6, -4, 4, 0] }, { duration: .4 }); } return; }
  go(st.step + 1, 1);
}
function renderStep(dir) {
  const s = st.step, el = $('.step', booker);
  $$('.dots i', booker).forEach((d, i) => d.classList.toggle('on', i === s));
  $$('.steps-nav li', booker.parentElement).forEach((d, i) => { d.classList.toggle('on', i === s); d.classList.toggle('done', i < s); });
  $('.sh-back', booker).hidden = s === 0;
  $('#sh-title').textContent = `Step ${s + 1} of 5 · ${STEPS[s]}`;
  const nb = $('.sh-next', booker); nb.textContent = s === 3 ? 'Review request' : s === 4 ? 'Start a new request' : 'Continue';
  nb.classList.toggle('ghost', s === 4);
  el.innerHTML = [stepType, stepUnit, stepDates, stepDetails, stepReview][s]();
  wire[s]?.();
  summary();
  if (dir !== 0) booker.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'nearest' });
  if (M && dir !== 0) {
    M.animate(el, { opacity: [0, 1], x: [24 * dir, 0] }, { duration: .45, ease: EASE });
    M.animate(el.children, { opacity: [0, 1], y: [10, 0] }, { duration: .5, ease: EASE, delay: M.stagger(.05, { startDelay: .05 }) });
  }
}
const err = () => '<p class="err" hidden role="alert"></p>';
function stepType() {
  return `<h3>What would you like to book?</h3><div class="group" role="radiogroup" aria-label="Booking type">${INTENTS.map(i =>
    `<button type="button" class="opt" role="radio" aria-checked="${st.intent === i.v}" data-v="${i.v}"><span class="t"><span>${i.t}</span><small>${i.s}</small></span><span class="chk">${ICON.check}</span></button>`).join('')}</div>${err()}`;
}
function stepUnit() {
  return `<h3>Choose a residence</h3><p class="sub">${st.intent === 'short' ? 'Nightly rates are quoted when the team confirms your dates.' : 'Published monthly rates. Utilities are billed separately.'}</p>
  <div class="group" role="radiogroup" aria-label="Residence">${ORDER.map(k => { const u = UNITS[k];
    return `<button type="button" class="opt" role="radio" aria-checked="${st.unit === k}" data-v="${k}"><img src="${u.photos[0]}" alt=""><span class="t"><span>${u.name}</span><small class="tnum">${u.area} sqm · ${u.floors}</small></span><span class="p tnum">${st.intent === 'short' ? '' : 'from ' + peso(u.from)}</span><span class="chk">${ICON.check}</span></button>`; }).join('')}</div>${err()}`;
}
function stepDates() {
  calMonth = calMonth || new Date((st.start || today0()).getFullYear(), (st.start || today0()).getMonth(), 1);
  const guests = st.intent === 'short' || st.intent === 'monthly';
  return `<h3>${rangeMode() ? 'When are you staying?' : st.intent === 'monthly' ? 'When do you move in?' : st.intent === 'buy' ? 'When can you view?' : 'When should we call?'}</h3>
  <p class="sub">${rangeMode() ? 'Tap your check-in, then your check-out.' : 'Pick one date. The team will confirm the time.'}</p>
  <div class="cal" id="cal"></div>
  <div class="group">
    <div class="row"><span class="k">${dateLabel()}</span><span class="v tnum" id="d-start">${fmtD(st.start)}</span></div>
    ${rangeMode() ? `<div class="row"><span class="k">Check-out</span><span class="v tnum" id="d-end">${fmtD(st.end)}${nights() ? ` · ${nights()} night${nights() > 1 ? 's' : ''}` : ''}</span></div>` : ''}
    ${guests ? `<div class="row"><span class="k">Guests</span><span class="stepper"><button type="button" aria-label="Fewer guests" data-g="-1">−</button><output id="g-out" aria-live="polite">${st.guests}</output><button type="button" aria-label="More guests" data-g="1">+</button></span></div>` : ''}
  </div>${err()}`;
}
function stepDetails() {
  return `<h3>How can the team reach you?</h3><p class="sub">They'll reply with availability and a quote.</p>
  <div class="group">
    <div class="fieldrow"><label for="b-name">Name</label><input id="b-name" autocomplete="name" placeholder="Required" value="${esc(st.name)}"></div>
    <div class="fieldrow"><label for="b-contact">Mobile or email</label><input id="b-contact" autocomplete="tel" placeholder="Required" value="${esc(st.contact)}"></div>
    <div class="fieldrow col"><label for="b-notes">Notes</label><textarea id="b-notes" placeholder="Airport pickup, parking, long-stay rate…">${esc(st.notes)}</textarea></div>
  </div>${err()}`;
}
function message() {
  const u = UNITS[st.unit], it = INTENTS.find(i => i.v === st.intent).t;
  const L = ['Hi Angelic Premiere Residences,', '', `Booking: ${it}`, `Residence: ${u.name} (${u.area} sqm)`];
  if (rangeMode()) L.push(`Dates: ${fmtD(st.start)} to ${fmtD(st.end)} (${nights()} night${nights() > 1 ? 's' : ''})`);
  else L.push(`${dateLabel()}: ${fmtD(st.start)}`);
  if (st.intent === 'short' || st.intent === 'monthly') L.push(`Guests: ${st.guests}`);
  if (st.notes.trim()) L.push(`Notes: ${st.notes.trim()}`);
  L.push('', `Name: ${st.name.trim()}`, `Contact: ${st.contact.trim()}`);
  return L.join('\n');
}
function stepReview() {
  const u = UNITS[st.unit], m = message();
  return `<div class="success"><span class="tick">${ICON.check}</span><h3>Your request is ready</h3><p class="sub" style="margin:0">Send it to the team and they'll confirm availability.</p></div>
  <pre class="msg" id="b-msg">${esc(m)}</pre>
  <div class="group">
    <button type="button" class="opt" id="b-copy"><span class="t"><span>Copy message</span><small>Paste into Viber, Messenger or email</small></span></button>
    <a class="opt" href="sms:${PHONE_RAW}?&body=${encodeURIComponent(m)}" style="text-decoration:none"><span class="t"><span>Send by text</span><small class="tnum">${PHONE}</small></span></a>
    <a class="opt" href="mailto:${EMAIL}?subject=${encodeURIComponent('Booking request · ' + u.name)}&body=${encodeURIComponent(m)}" style="text-decoration:none"><span class="t"><span>Send by email</span><small>${EMAIL}</small></span></a>
  </div>
  <p class="sub" style="margin:0">Nothing is sent until you send it from your phone or email.</p>`;
}
function radio(cb) {
  $$('.opt[role=radio]', booker).forEach(b => b.addEventListener('click', () => {
    $$('.opt[role=radio]', booker).forEach(x => x.setAttribute('aria-checked', x === b)); cb(b.dataset.v); summary();
    if (M) M.animate($('.chk', b), { scale: [.7, 1.15, 1] }, { duration: .4 });
    setTimeout(() => go(st.step + 1, 1), RM ? 0 : 280);
  }));
}
const syncG = () => { const [m, p] = $$('[data-g]', booker); if (m) { m.disabled = st.guests <= 1; p.disabled = st.guests >= 10; } };
const wire = {
  0: () => radio(v => { if (v !== st.intent) { st.start = st.end = null; } st.intent = v; }),
  1: () => radio(v => st.unit = v),
  2: () => { drawCal(); $$('[data-g]', booker).forEach(b => b.addEventListener('click', () => { st.guests = Math.min(10, Math.max(1, st.guests + +b.dataset.g)); $('#g-out').textContent = st.guests; syncG(); summary(); })); syncG(); },
  3: () => { [['b-name', 'name'], ['b-contact', 'contact'], ['b-notes', 'notes']].forEach(([id, k]) => $('#' + id).addEventListener('input', e => st[k] = e.target.value)); },
  4: () => { $('#b-copy').addEventListener('click', () => copyText(message(), $('#b-msg'))); },
};
function drawCal() {
  const c = $('#cal'); const t0 = today0(); const y = calMonth.getFullYear(), m = calMonth.getMonth();
  const first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate();
  const canPrev = new Date(y, m, 1) > new Date(t0.getFullYear(), t0.getMonth(), 1);
  let h = `<div class="cal-h"><b>${calMonth.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}</b><div><button type="button" data-m="-1" aria-label="Previous month" ${canPrev ? '' : 'disabled'}>${ICON.l}</button><button type="button" data-m="1" aria-label="Next month">${ICON.r}</button></div></div><div class="cal-g" role="grid">`;
  h += ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => `<span class="dw" aria-hidden="true">${d}</span>`).join('');
  for (let i = 0; i < first; i++) h += '<span></span>';
  for (let d = 1; d <= days; d++) {
    const dt = new Date(y, m, d), past = dt < t0, cls = [];
    if (+dt === +t0) cls.push('today');
    if (st.start && +dt === +st.start) cls.push('s');
    if (st.end && +dt === +st.end) cls.push('e');
    if (!rangeMode() && st.start && +dt === +st.start) cls.push('e');
    if (st.start && st.end && dt > st.start && dt < st.end) cls.push('in');
    h += `<button type="button" class="${cls.join(' ')}" data-d="${iso(new Date(Date.UTC(y, m, d)))}" ${past ? 'disabled' : ''} aria-label="${dt.toDateString()}" aria-pressed="${cls.includes('s') || cls.includes('e')}"><span>${d}</span></button>`;
  }
  c.innerHTML = h + '</div>';
  $$('[data-m]', c).forEach(b => b.addEventListener('click', () => { calMonth = new Date(y, m + +b.dataset.m, 1); drawCal(); if (M) M.animate($('.cal-g', c), { opacity: [0, 1], x: [14 * +b.dataset.m, 0] }, { duration: .35, ease: EASE }); }));
  $$('[data-d]', c).forEach(b => b.addEventListener('click', () => {
    const [Y, Mo, D] = b.dataset.d.split('-').map(Number); const dt = new Date(Y, Mo - 1, D);
    if (!rangeMode()) { st.start = dt; st.end = null; }
    else if (!st.start || st.end || dt <= st.start) { st.start = dt; st.end = null; }
    else st.end = dt;
    drawCal();
    $('#d-start').textContent = fmtD(st.start);
    const de = $('#d-end'); if (de) de.textContent = fmtD(st.end) + (nights() ? ` · ${nights()} night${nights() > 1 ? 's' : ''}` : '');
    $('.err', booker).hidden = true; summary();
    $(`[data-d="${b.dataset.d}"]`, c)?.focus();
  }));
}
if (booker) {
  // book.html#two, #buy, #two-buy … preselects residence and booking type
  location.hash.slice(1).split('-').forEach(t => { if (UNITS[t]) st.unit = t; if (INTENTS.some(i => i.v === t)) st.intent = t; });
  st.step = st.intent ? (st.unit ? 2 : 1) : 0;
  $('.sh-back', booker).addEventListener('click', () => go(st.step - 1, -1));
  $('.sh-next', booker).addEventListener('click', next);
  renderStep(0);
}


/* ================= INTRO: 3D crest splash → transition into the site ================= */
(() => {
  const intro = $('#intro'), cw = $('.crest-wrap');
  if (!intro || !cw) return;
  const H = document.documentElement;
  const heldItems = () => $$('.hero2 .hero-top > :not(.crest-wrap), .hero2 .slide-dots, .hero2 .scroll-cue');
  let seen = false; try { seen = sessionStorage.getItem('angelic-intro') === '1'; } catch {}
  const finish = () => { intro.remove(); cw.style.transform = ''; H.classList.remove('intro-on', 'intro-lock'); window.__crest?.scale(1); window.__heroIn?.(); };
  if (!M || seen) { intro.remove(); window.__heroIn?.(); return; }

  H.classList.add('intro-on', 'intro-lock'); scrollTo(0, 0);
  const slot = $('.intro-slot', intro), bar = $('.intro-bar i', intro);
  let leaving = false, timer = null, barAnim = null;

  const place = () => {
    if (leaving) return;
    cw.style.transform = 'none';
    const n = cw.getBoundingClientRect(), t = slot.getBoundingClientRect();
    const k = t.width / n.width;
    const x = (t.left + t.width / 2) - (n.left + n.width / 2), y = (t.top + t.height / 2) - (n.top + n.height / 2);
    cw.style.transform = `translate(${x}px, ${y}px) scale(${k})`;
    intro.style.setProperty('--hx', (n.left + n.width / 2) + 'px');
    intro.style.setProperty('--hy', (n.top + n.height / 2) + 'px');
    window.__crest?.scale(k);
  };
  place(); addEventListener('resize', place);

  // entrance: letters rise in one by one, then the subtitle and controls
  M.animate($$('.intro-word span', intro), { opacity: [0, 1], y: [24, 0], filter: ['blur(10px)', 'blur(0px)'] }, { duration: 1.1, ease: EASE, delay: M.stagger(.07, { startDelay: .6 }) });
  M.animate($$('.intro-sub, .intro-foot, .intro-skip', intro), { opacity: [0, 1], y: [12, 0] }, { duration: 1, ease: EASE, delay: M.stagger(.12, { startDelay: 1.2 }) });

  const AUTO = 5.2;
  const arm = () => {
    clearTimeout(timer); barAnim?.cancel?.();
    barAnim = M.animate(bar, { scaleX: [0, 1] }, { duration: AUTO, ease: 'linear' });
    timer = setTimeout(enter, AUTO * 1000);
  };
  const hold = () => { clearTimeout(timer); barAnim?.cancel?.(); bar.style.transform = 'scaleX(0)'; };
  cw.addEventListener('pointerdown', () => { if (!leaving) hold(); });
  cw.addEventListener('pointerup', () => { if (!leaving) setTimeout(arm, 1200); });

  // wait until the crest has rendered and no view chooser is open
  const t0 = performance.now();
  (function wait() {
    if (leaving) return;
    if ($('.shell')) { leaving = true; return finish(); }        // a device preview took over: let the framed page run its own intro
    if ($('.vp') || (!cw.classList.contains('live') && performance.now() - t0 < 4000)) return setTimeout(wait, 150);
    arm();
  })();

  function enter() {
    if (leaving) return; leaving = true;
    clearTimeout(timer); removeEventListener('resize', place);
    try { sessionStorage.setItem('angelic-intro', '1'); } catch {}
    heldItems().forEach(el => el.style.opacity = 0);
    M.animate($$('.intro-brand, .intro-foot, .intro-skip', intro), { opacity: 0, y: -14, filter: 'blur(8px)' }, { duration: .5, ease: EASE });
    const from = cw.style.transform || 'none';
    M.animate(cw, { transform: [from, 'translate(0px, 0px) scale(1)'] }, { duration: 1.5, ease: [.7, 0, .2, 1], delay: .2 });
    M.animate(0, 1, { duration: 1.6, ease: [.7, 0, .2, 1], delay: .35, onUpdate: v => intro.style.setProperty('--hole', (v * 170).toFixed(2) + 'vmax') });
    setTimeout(() => H.classList.remove('intro-on'), 900);
    setTimeout(() => window.__heroIn?.(), 1250);
    setTimeout(() => { intro.remove(); cw.style.transform = ''; H.classList.remove('intro-lock'); window.__crest?.scale(1); }, 2100);
  }
  $('.intro-enter', intro).addEventListener('click', enter);
  $('.intro-skip', intro).addEventListener('click', enter);
  addEventListener('keydown', e => { if (!leaving && (e.key === 'Enter' || e.key === 'Escape') && !$('.vp')) { e.preventDefault(); enter(); } });
})();


/* ================= BOOK TRANSITION: the tapped button opens into the booking page ================= */
(() => {
  const KEY = 'angelic-pt';
  const shell = cx => {
    const ov = document.createElement('div'); ov.className = 'pt'; ov.setAttribute('aria-hidden', 'true');
    ov.innerHTML = '<div class="pt-in"><span class="pt-mk"></span><small>Angelic Premiere Residences</small><b>Reserve your stay.</b><i class="pt-line"></i></div>';
    document.body.appendChild(ov); return ov;
  };
  // leaving: circle grows out of the tapped button, then navigate
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="book.html"]');
    if (!a || booker || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    try { sessionStorage.setItem(KEY, '1'); } catch {}
    if (!M) { location.href = a.href; return; }
    const r = a.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const R = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy)) + 20;
    const ov = shell(); ov.style.clipPath = `circle(0px at ${cx}px ${cy}px)`;
    M.animate(a, { scale: [1, .92, 1] }, { duration: .4, ease: EASE });
    M.animate(0, R, { duration: .8, ease: [.7, 0, .2, 1], onUpdate: v => ov.style.clipPath = `circle(${v}px at ${cx}px ${cy}px)` });
    M.animate($$('.pt-in > *', ov), { opacity: [0, 1], y: [18, 0], filter: ['blur(6px)', 'blur(0px)'] }, { duration: .6, ease: EASE, delay: M.stagger(.07, { startDelay: .38 }) });
    M.animate($('.pt-line', ov), { scaleX: [0, 1] }, { duration: .7, ease: EASE, delay: .55 });
    setTimeout(() => { location.href = a.href; }, 1050);
  });
  addEventListener('pageshow', e => { if (e.persisted) $$('.pt').forEach(x => x.remove()); });
  // arriving on the booking page: the curtain lifts, the booking panels rise in
  let arriving = false; try { arriving = sessionStorage.getItem(KEY) === '1'; sessionStorage.removeItem(KEY); } catch {}
  if (booker && arriving && M) {
    const ov = shell(); $$('.pt-in > *', ov).forEach(x => x.style.opacity = 1); $('.pt-line', ov).style.transform = 'scaleX(1)';
    const items = $$('.book-sum > *, .booker'); items.forEach(x => x.style.opacity = 0);
    M.animate($('.pt-in', ov), { opacity: [1, 0], y: [0, -30] }, { duration: .5, ease: EASE, delay: .15 });
    M.animate(ov, { y: ['0%', '-100%'] }, { duration: 1, ease: [.7, 0, .2, 1], delay: .35 }).finished.then(() => ov.remove());
    M.animate(items, { opacity: [0, 1], y: [40, 0] }, { duration: 1, ease: EASE, delay: M.stagger(.07, { startDelay: .75 }) });
  }
})();


/* ================= THEME TOGGLE: light by default, dark on request, circular reveal ================= */
(() => {
  const H = document.documentElement;
  const btns = $$('[data-theme-toggle]');
  const label = () => btns.forEach(b => { const d = H.dataset.theme === 'dark'; b.setAttribute('aria-label', d ? 'Switch to light mode' : 'Switch to dark mode'); b.setAttribute('aria-pressed', d); });
  if (!H.dataset.theme) H.dataset.theme = 'light';
  label();
  const apply = t => { H.dataset.theme = t; try { localStorage.setItem('angelic-theme', t); } catch {} label();
    $$('meta[name="theme-color"]').forEach(m => m.content = t === 'dark' ? '#0b0b0a' : '#f6f5f2');
    try { $$('iframe.view-frame').forEach(f => f.contentDocument.documentElement.dataset.theme = t); } catch {}
  };
  btns.forEach(b => b.addEventListener('click', () => {
    const next = H.dataset.theme === 'dark' ? 'light' : 'dark';
    const r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    const rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    if (M) M.animate(b.querySelectorAll('svg'), { rotate: [-90, 0], scale: [.5, 1] }, { type: 'spring', stiffness: 300, damping: 18 });
    if (!document.startViewTransition || RM) return apply(next);
    const vt = document.startViewTransition(() => apply(next));
    vt.ready.then(() => H.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${rad}px at ${x}px ${y}px)`] },
      { duration: 750, easing: 'cubic-bezier(.7,0,.2,1)', pseudoElement: '::view-transition-new(root)' })).catch(() => {});
  }));
})();

/* floating book pill: shows after the quick booking bar leaves view */
const fab = $('.fab');
if (fab) {
  const target = $('.hero') || $('.u-title');
  let shown = !target;
  const show = on => { if (on === shown) return; shown = on; fab.style.pointerEvents = on ? '' : 'none';
    if (M) M.animate(fab, { opacity: on ? 1 : 0, y: on ? 0 : 24 }, { type: 'spring', stiffness: 320, damping: 30 }); else fab.style.opacity = on ? 1 : 0; };
  if (target) { fab.style.opacity = 0; fab.style.pointerEvents = 'none'; new IntersectionObserver(([e]) => show(!e.isIntersecting && e.boundingClientRect.top < 0)).observe(target); }
}
})();

/* ================= VIEW PICKER: desktop or mobile experience ================= */
(() => {
const $ = (s, r = document) => r.querySelector(s);
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const M = !RM && window.Motion ? window.Motion : null;
const EASE = [0.22, 1, 0.36, 1];
const KEY = 'angelic-view';
let inShell = false;
try { inShell = !!(window.frameElement && window.frameElement.classList.contains('view-frame')); } catch {}
if (inShell) {
  document.documentElement.classList.add('in-shell');
  try { if (window.frameElement.closest('.phone')) document.documentElement.classList.add('in-phone'); } catch {}
  document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => { try { window.parent.__angelicView.open(); } catch {} }));
  return;
}
const get = () => { try { return localStorage.getItem(KEY) || sessionStorage.getItem(KEY); } catch { return null; } };
const save = v => { try { localStorage.setItem(KEY, v); } catch {} try { sessionStorage.setItem(KEY, v); } catch {} };
const narrow = () => innerWidth < 760;
const ICON = {
  desk: '<svg viewBox="0 0 52 52" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="9" width="42" height="27" rx="3"/><path d="M19 44h14M26 36v8"/></svg>',
  phone: '<svg viewBox="0 0 52 52" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="15" y="4" width="22" height="44" rx="5"/><path d="M23 9h6"/></svg>',
};
const LOCK = 'body > header, body > main, body > footer, .fab';
const lock = on => { document.documentElement.style.overflow = on ? 'hidden' : ''; document.querySelectorAll(LOCK).forEach(x => x.inert = on); };
let shell, picker, ro;

function closeShell() { if (!shell) return; shell.remove(); shell = null; removeEventListener('resize', fit); lock(false); }
function fit() {
  if (!shell) return;
  const box = $('.device-box', shell), dev = $('.device', shell);
  const side = innerWidth >= 1000 ? 0 : 90;
  const availW = innerWidth - 48, availH = innerHeight - 48 - side;
  if (dev.classList.contains('desk')) { // fill the available height at desktop width
    const sw = Math.min(1, availW / 1280), ih = Math.max(560, Math.min(2400, availH / sw - 36));
    $('iframe', dev).style.height = ih + 'px'; dev.style.height = ih + 36 + 'px';
  }
  const w = dev.offsetWidth, h = dev.offsetHeight;
  const s = Math.min(1, availW / w, availH / h);
  dev.style.transform = `scale(${s})`; box.style.width = w * s + 'px'; box.style.height = h * s + 'px';
}
function openShell(mode) {
  closeShell();
  const src = location.href.split('#')[0];
  const hero = document.querySelector('.slides img, .hero-img img, .gal img')?.getAttribute('src') || 'img/hero.webp';
  shell = document.createElement('div'); shell.className = 'shell'; shell.setAttribute('role', 'region'); shell.setAttribute('aria-label', mode === 'mobile' ? 'Mobile preview' : 'Desktop preview');
  shell.innerHTML = `<div class="shell-bg" aria-hidden="true"><img src="${hero}" alt=""></div>
    <aside class="shell-side"><span class="kicker">Angelic Premiere Residences</span>
      <h2>${mode === 'mobile' ? 'Mobile experience' : 'Desktop experience'}</h2>
      <p>${mode === 'mobile' ? 'How guests see Angelic on their phone. Scroll, tap and book inside the screen.' : 'The full-width layout, scaled to fit your screen.'}</p>
      <div class="seg" role="radiogroup" aria-label="View"><button type="button" role="radio" data-m="desktop" aria-checked="${mode === 'desktop'}">Desktop</button><button type="button" role="radio" data-m="mobile" aria-checked="${mode === 'mobile'}">Mobile</button></div>
    </aside>
    <div class="device-box"><div class="device ${mode === 'mobile' ? 'phone' : 'desk'}">${mode === 'desktop' ? '<div class="bar" aria-hidden="true"><i></i><i></i><i></i><span>angelicpremierestaycation.com</span></div>' : ''}<iframe class="view-frame" title="Angelic Premiere Residences, ${mode} view" src="${src}"></iframe></div></div>
    <p class="shell-tip">${mode === 'mobile' ? 'Tip: the booking sheet slides up from the bottom, like an app.' : ''}</p>`;
  document.body.appendChild(shell); lock(true);
  // segmented thumb
  const seg = $('.seg', shell), btns = [...seg.querySelectorAll('button')], thumb = document.createElement('span'); thumb.className = 'thumb'; seg.prepend(thumb);
  const cur = btns.find(b => b.getAttribute('aria-checked') === 'true');
  requestAnimationFrame(() => { thumb.style.left = cur.offsetLeft + 'px'; thumb.style.width = cur.offsetWidth + 'px'; });
  btns.forEach(b => b.addEventListener('click', () => choose(b.dataset.m)));
  addEventListener('resize', fit); fit();
  if (M) { M.animate($('.device-box', shell), { opacity: [0, 1], y: [40, 0], scale: [.96, 1] }, { duration: 1, ease: EASE }); M.animate($('.shell-side', shell).children, { opacity: [0, 1], y: [14, 0] }, { duration: .8, ease: EASE, delay: M.stagger(.07, { startDelay: .15 }) }); }
}
function apply(mode) {
  if ((mode === 'mobile' && !narrow()) || (mode === 'desktop' && narrow())) openShell(mode);
  else closeShell();
}
function choose(mode) {
  save(mode);
  const done = () => { picker?.remove(); picker = null; if (!shell) lock(false); apply(mode); };
  if (picker && M) M.animate(picker, { opacity: 0 }, { duration: .3 }).finished.then(done); else done();
}
function openPicker() {
  if (picker) return;
  const rec = narrow() ? 'mobile' : 'desktop', cur = get();
  picker = document.createElement('div'); picker.className = 'vp';
  picker.innerHTML = `<div class="vp-bg"></div><div class="vp-panel" role="dialog" aria-modal="true" aria-labelledby="vp-t">
    <span class="kicker">Angelic Premiere Residences</span><h2 id="vp-t">How would you like to view?</h2>
    <p class="muted">You can switch any time from the top bar.</p>
    <div class="vp-opts">
      <button type="button" class="vp-opt" data-mode="desktop">${ICON.desk}<b>Desktop</b><small>Full-width layout</small>${rec === 'desktop' ? '<em>This device</em>' : ''}</button>
      <button type="button" class="vp-opt" data-mode="mobile">${ICON.phone}<b>Mobile</b><small>App-style phone layout</small>${rec === 'mobile' ? '<em>This device</em>' : ''}</button>
    </div></div>`;
  document.body.appendChild(picker); lock(true);
  picker.querySelectorAll('.vp-opt').forEach(b => b.addEventListener('click', () => choose(b.dataset.mode)));
  picker.addEventListener('keydown', e => { if (e.key === 'Escape' && cur) choose(cur); });
  if (M) { M.animate($('.vp-bg', picker), { opacity: [0, 1] }, { duration: .4 }); M.animate($('.vp-panel', picker), { opacity: [0, 1], y: [24, 0], scale: [.96, 1] }, { type: 'spring', stiffness: 260, damping: 28 }); M.animate(picker.querySelectorAll('.vp-opt'), { opacity: [0, 1], y: [12, 0] }, { duration: .6, ease: EASE, delay: M.stagger(.08, { startDelay: .15 }) }); }
  setTimeout(() => picker?.querySelector(`[data-mode="${cur || rec}"]`)?.focus({ preventScroll: true }), 50);
}
window.__angelicView = { open: () => { closeShell(); openPicker(); } };
document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => window.__angelicView.open()));
const saved = get();
if (saved) apply(saved); else openPicker();
})();
