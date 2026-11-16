/* Ecos del Paisaje · Monografía: movimiento ligado a la lectura.
   Todo anima solo transform, opacity o clip-path; con «reducir movimiento» queda quieto. */
(function () {
  'use strict';
  const raiz = document.documentElement;
  const calma = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const raton = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  raiz.classList.add('mg-anim');
  // la portada sube por detrás de la barra
  const barra = $('.mg-barra'); const portada = $('#inicio');
  const medir = () => raiz.style.setProperty('--barra-h', barra.offsetHeight + 'px');
  medir(); addEventListener('resize', medir);

  /* ---------- aparición al entrar en pantalla ---------- */
  const aparecen = $$('.mg-manifiesto .mg-etq, .mg-video, .mg-indice__cab, .mg-ind li, .mg-cap__tit > *, .mg-cap__lead, .mg-cap__body, .mg-mas, .mg-gal__cab, .mg-planos__cab, .mg-planchas li, .mg-pie > *');
  aparecen.forEach((el) => el.classList.add('mg-aparece'));
  // dentro de un mismo grupo, retraso escalonado no uniforme
  const pasos = [0, 60, 110, 150, 185, 215, 240, 260];
  [$$('.mg-ind li'), ...$$('.mg-cap__tit').map((l) => [...l.children]), ...$$('.mg-cap__txt').map((l) => [...l.children]), $$('.mg-planchas li')]
    .forEach((grupo) => grupo.forEach((el, i) => el.style.setProperty('--d', pasos[Math.min(i, pasos.length - 1)])));
  const io = new IntersectionObserver((ents) => ents.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add('en');
    io.unobserve(en.target);
    en.target.querySelectorAll && en.target.querySelectorAll('.mg-num').forEach(contar);
  }), { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  [...aparecen, ...$$('.mg-fig, .mg-datos, .mg-cap')].forEach((el) => io.observe(el));
  // las palabras de acento se entintan cuando llegan a la parte media de la pantalla
  const ioAcento = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('en'); ioAcento.unobserve(en.target); } }), { rootMargin: '0px 0px -35% 0px' });
  $$('.mg-acento').forEach((el) => ioAcento.observe(el));

  /* ---------- cifras que cuentan ---------- */
  function contar(el) {
    if (el.dataset.ok) return; el.dataset.ok = '1';
    const txt = el.dataset.n;
    const m = /^(\d{1,3}(?:\.\d{3})*|\d+)(,\d+)?$/.exec(txt);
    if (!m || calma) return;
    const dec = m[2] ? m[2].length - 1 : 0;
    const valor = parseFloat(txt.replace(/\./g, '').replace(',', '.'));
    const fmt = new Intl.NumberFormat('es-CO', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    const t0 = performance.now(); const dur = 1400;
    const paso = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      el.textContent = fmt.format(valor * (1 - Math.pow(1 - k, 4)));
      if (k < 1) requestAnimationFrame(paso); else el.textContent = txt;
    };
    requestAnimationFrame(paso);
  }

  /* ---------- manifiesto: cada palabra se enciende a medida que se lee ---------- */
  const frase = $('#frase');
  const palabras = [];
  // parte el texto en palabras sin perder las cursivas de acento
  (function partir(nodo) {
    [...nodo.childNodes].forEach((h) => {
      if (h.nodeType === 1) { partir(h); return; }
      if (h.nodeType !== 3) return;
      const frag = document.createDocumentFragment();
      h.textContent.split(/(\s+)/).forEach((t) => {
        if (!t) return;
        if (/^\s+$/.test(t)) { frag.append(t); return; }
        const s = document.createElement('span'); s.className = 'w'; s.textContent = t; frag.append(s);
      });
      h.replaceWith(frag);
    });
  })(frase);
  palabras.push(...$$('.w', frase));

  /* ---------- video: se abre su marco al acercarse y solo corre si se ve ---------- */
  const marco = $('.mg-video__marco');
  const video = $('video', marco);
  const btnVideo = $('.mg-video__btn', marco);
  let pausadoAMano = false;
  const ponerBoton = (p) => { btnVideo.setAttribute('aria-pressed', p); btnVideo.textContent = p ? 'Reproducir' : 'Pausar'; };
  btnVideo.addEventListener('click', () => {
    if (video.paused) { video.play(); pausadoAMano = false; ponerBoton(false); } else { video.pause(); pausadoAMano = true; ponerBoton(true); }
  });
  if (calma) ponerBoton(true);
  new IntersectionObserver(([en]) => {
    if (calma || pausadoAMano) return;
    if (en.isIntersecting) { video.preload = 'auto'; video.play().catch(() => {}); } else video.pause();
  }, { threshold: 0.2 }).observe(marco);

  /* ---------- barra: sección actual y avance ---------- */
  const secN = $('#sec-n'); const secT = $('#sec-t'); const sec = $('.mg-barra__sec'); const avance = $('#avance');
  const marcas = [{ el: $('#inicio'), n: '00', t: 'Portada' }, { el: $('#manifiesto'), n: '00', t: 'La idea' },
    { el: $('.mg-indice'), n: '00', t: 'Índice' },
    ...$$('.mg-cap').map((c) => ({ el: c, n: c.dataset.n, t: c.dataset.titulo })),
    { el: $('#renders'), n: 'R', t: 'Renders' }, { el: $('#planos'), n: 'P', t: 'Planchas' }];
  let actual = -1;
  function ponerSeccion(i) {
    if (i === actual) return; actual = i;
    sec.classList.add('cambia');
    setTimeout(() => { secN.textContent = marcas[i].n; secT.textContent = marcas[i].t; sec.classList.remove('cambia'); }, 160);
  }

  /* ---------- todo lo ligado al scroll, en un solo cuadro ---------- */
  const pausas = $$('.mg-pausa__img');
  let pendiente = false;
  function alScroll() {
    pendiente = false;
    const vh = innerHeight; const y = scrollY;
    const alto = document.documentElement.scrollHeight - vh;
    avance.style.transform = 'scaleX(' + (alto > 0 ? y / alto : 0) + ')';
    raiz.classList.toggle('sobre-portada', y < portada.offsetHeight - barra.offsetHeight - 10);

    let i = 0; marcas.forEach((m, k) => { if (m.el.getBoundingClientRect().top < vh * 0.4) i = k; }); ponerSeccion(i);
    if (calma) return;

    const r = frase.getBoundingClientRect();
    const p = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
    const n = palabras.length;
    palabras.forEach((w, k) => { const o = Math.min(1, Math.max(0.16, (p * n - k) * 0.5 + 0.16)); w.style.setProperty('--o', o.toFixed(2)); });

    const rv = marco.getBoundingClientRect();
    const kv = Math.min(1, Math.max(0, (vh - rv.top) / (vh * 0.75)));
    marco.style.setProperty('--v-in', ((1 - kv) * 10).toFixed(2) + '%');
    marco.style.setProperty('--v-lado', ((1 - kv) * 10).toFixed(2) + '%');

    pausas.forEach((p2) => {
      const rp = p2.getBoundingClientRect();
      if (rp.bottom < 0 || rp.top > vh) return;
      const kp = Math.min(1, Math.max(0, (vh - rp.top) / (vh + rp.height)));
      p2.firstElementChild.style.setProperty('--s', (1.12 - kp * 0.12).toFixed(4));
    });
  }
  addEventListener('scroll', () => { if (!pendiente) { pendiente = true; requestAnimationFrame(alScroll); } }, { passive: true });
  addEventListener('resize', alScroll);
  alScroll();

  /* ---------- índice: la lámina sigue al cursor con inercia ---------- */
  const vista = $('.mg-ind__vista');
  if (raton && vista && !calma) {
    const img = $('img', vista);
    let x = 0, y = 0, tx = 0, ty = 0, vivo = false;
    const seguir = () => {
      x += (tx - x) * 0.16; y += (ty - y) * 0.16;
      vista.style.transform = 'translate(' + (x + 24) + 'px,' + (y - 90) + 'px)';
      if (vivo || Math.abs(tx - x) > 0.5) requestAnimationFrame(seguir);
    };
    $$('.mg-ind a').forEach((a) => {
      a.addEventListener('pointerenter', (e) => {
        img.src = a.dataset.img; tx = e.clientX; ty = e.clientY;
        if (!vivo) { x = tx; y = ty; vivo = true; requestAnimationFrame(seguir); }
        vista.classList.add('ver');
      });
      a.addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; });
      a.addEventListener('pointerleave', () => { vista.classList.remove('ver'); vivo = false; });
    });
  }

  /* ---------- galería: desplazamiento nativo, contador y botones ---------- */
  const pista = $('#gal');
  const items = $$('.mg-gal__item', pista);
  $('#gal-total').textContent = String(items.length).padStart(2, '0');
  const galN = $('#gal-n'); const ant = $('#gal-ant'); const sig = $('#gal-sig');
  const enFoco = () => {
    const r0 = pista.getBoundingClientRect().left;
    let mejor = 0, d = Infinity;
    items.forEach((it, i) => { const dd = Math.abs(it.getBoundingClientRect().left - r0 - parseFloat(getComputedStyle(pista).paddingLeft)); if (dd < d) { d = dd; mejor = i; } });
    return mejor;
  };
  const marcar = () => {
    const i = enFoco();
    items.forEach((it, k) => it.classList.toggle('activo', k === i));
    galN.textContent = String(i + 1).padStart(2, '0');
    ant.disabled = i === 0; sig.disabled = i === items.length - 1;
  };
  let tGal = 0;
  pista.addEventListener('scroll', () => { cancelAnimationFrame(tGal); tGal = requestAnimationFrame(marcar); }, { passive: true });
  const ir = (d) => { const i = Math.max(0, Math.min(items.length - 1, enFoco() + d)); items[i].scrollIntoView({ behavior: calma ? 'auto' : 'smooth', block: 'nearest', inline: 'start' }); };
  ant.addEventListener('click', () => ir(-1)); sig.addEventListener('click', () => ir(1));
  pista.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); ir(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); ir(-1); } });
  marcar();

  /* ---------- visor ---------- */
  const visor = $('#visor'); const vimg = $('img', visor);
  $$('.ampliar').forEach((b) => b.addEventListener('click', () => {
    const im = $('img', b); vimg.src = im.currentSrc || im.src; vimg.alt = im.alt; visor.showModal();
  }));
  $('.mg-visor__cerrar', visor).addEventListener('click', () => visor.close());
  visor.addEventListener('click', (e) => { if (e.target === visor) visor.close(); });
})();
