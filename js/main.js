const raiz = document.documentElement;
raiz.classList.add('js');
const calma = matchMedia('(prefers-reduced-motion: reduce)').matches;
const escritorio = () => innerWidth > 960;

/* ---------- imágenes que faltan ---------- */
function marcarFalta(img) {
  const caja = document.createElement('div');
  caja.className = 'falta';
  caja.innerHTML = '<span>Falta la imagen. Guárdala como<code>img/' + img.dataset.falta + '</code></span>';
  img.replaceWith(caja);
}
document.querySelectorAll('img[data-falta]').forEach((img) => {
  if (img.complete && img.naturalWidth === 0) marcarFalta(img);
  else img.addEventListener('error', () => marcarFalta(img), { once: true });
});

/* ---------- menú ---------- */
const nav = document.getElementById('nav');
const toggle = nav.querySelector('.nav__toggle');
const menu = document.getElementById('menu');
toggle.addEventListener('click', () => {
  const abierto = menu.classList.toggle('abierto');
  toggle.setAttribute('aria-expanded', abierto);
});
menu.addEventListener('click', (e) => {
  if (e.target.closest('a')) { menu.classList.remove('abierto'); toggle.setAttribute('aria-expanded', 'false'); }
});
const borde = document.querySelector('.borde');
const bordeNum = document.getElementById('borde-actual');
const enlaces = [...menu.querySelectorAll('a'), ...(borde ? borde.querySelectorAll('a') : [])];
const obsMenu = new IntersectionObserver((entradas) => {
  entradas.forEach((en) => {
    if (!en.isIntersecting) return;
    enlaces.forEach((a) => {
      if (a.getAttribute('href') === '#' + en.target.id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    if (borde) {
      const i = [...borde.querySelectorAll('a')].findIndex((a) => a.getAttribute('href') === '#' + en.target.id);
      if (i >= 0) bordeNum.textContent = String(i + 1).padStart(2, '0');
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
enlaces.forEach((a) => { const s = document.querySelector(a.getAttribute('href')); if (s) obsMenu.observe(s); });

/* ---------- títulos palabra por palabra ---------- */
function partirEnPalabras(el) {
  let i = 0;
  [...el.childNodes].forEach((nodo) => {
    if (nodo.nodeType !== 3) return;
    const frag = document.createDocumentFragment();
    nodo.textContent.split(/(\s+)/).forEach((trozo) => {
      if (!trozo) return;
      if (/^\s+$/.test(trozo)) { frag.append(' '); return; }
      const caja = document.createElement('span');
      caja.className = 'palabra';
      caja.innerHTML = '<span style="--i:' + i++ + '"></span>';
      caja.firstChild.textContent = trozo;
      frag.append(caja);
    });
    nodo.replaceWith(frag);
  });
}
const titulos = document.querySelectorAll('.hero h1, .capitulo h2');
titulos.forEach(partirEnPalabras);

/* ---------- aparición al entrar en pantalla ---------- */
const textos = document.querySelectorAll('.kicker, .prosa, .hero__lead, .hero__datos, .tarjetas, .ejes, .clima, .leyenda, .volumenes, .cita, .lema, .datos, .presupuesto, .secuencia__pie, .cifras, .figura figcaption, .sub');
// La imagen nunca se oculta: una tapa del color del fondo se retira encima de ella.
const imagenes = [...new Set([...document.querySelectorAll('.figura img, .mosaico img, .planchas img')]
  .map((img) => img.closest('.ampliar') || img.parentElement))];
textos.forEach((el) => el.classList.add('aparece'));
imagenes.forEach((el) => el.classList.add('revela'));

const obsVer = new IntersectionObserver((entradas, o) => {
  entradas.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add('visto');
    if (en.target.matches('.cifra-grande span, .datos dt, .presupuesto__cifra')) contar(en.target);
    o.unobserve(en.target);
  });
}, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
[...textos, ...imagenes, ...titulos, document.querySelector('.barras')].forEach((el) => el && obsVer.observe(el));
document.querySelectorAll('.cifra-grande span, .datos dt, .presupuesto__cifra').forEach((el) => obsVer.observe(el));

/* ---------- contadores ---------- */
function contar(el) {
  if (el.dataset.contado) return;
  el.dataset.contado = '1';
  const original = el.textContent;
  const m = original.match(/\d[\d.]*(,\d+)?/);
  if (!m) return;
  const texto = m[0];
  const decimales = m[1] ? m[1].length - 1 : 0;
  const valor = parseFloat(texto.replace(/\./g, '').replace(',', '.'));
  const formato = new Intl.NumberFormat('es-CO', { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
  const antes = original.slice(0, m.index);
  const despues = original.slice(m.index + texto.length);
  const dur = 1600;
  const t0 = performance.now();
  const paso = (t) => {
    const k = Math.min(1, (t - t0) / dur);
    const suave = 1 - Math.pow(1 - k, 4);
    el.textContent = antes + formato.format(valor * suave) + despues;
    if (k < 1) requestAnimationFrame(paso); else el.textContent = original;
  };
  requestAnimationFrame(paso);
}

/* ---------- riel horizontal de planos ---------- */
const riel = document.querySelector('.riel');
const pista = riel && riel.querySelector('.planchas');
let tramo = null;
function armarRiel() {
  const usar = escritorio();
  raiz.classList.toggle('js-riel', usar);
  if (!pista) return;
  if (!usar) {
    pista.style.transform = '';
    if (tramo) tramo.style.height = '';
    return;
  }
  if (!tramo) {
    tramo = document.createElement('div');
    tramo.className = 'riel-tramo';
    riel.before(tramo);
    tramo.append(riel);
  }
  const sobra = Math.max(0, pista.scrollWidth - innerWidth + 56);
  tramo.style.height = (riel.offsetHeight + sobra) + 'px';
}

/* ---------- efectos ligados al scroll ---------- */
const barra = document.querySelector('.progreso');
const heroImg = document.querySelector('.hero__img img');
const numerales = document.querySelectorAll('.capitulo__num');
const secuencia = document.querySelector('.secuencia');
const pasos = secuencia ? [...secuencia.children] : [];
let ultimoY = scrollY;
let pendiente = false;

function alScroll() {
  pendiente = false;
  const y = scrollY;
  const alto = document.documentElement.scrollHeight - innerHeight;
  barra.style.transform = 'scaleX(' + (alto > 0 ? y / alto : 0) + ')';

  // el menú se esconde al bajar y vuelve al subir
  if (y > 400 && y > ultimoY + 4) nav.classList.add('oculta');
  else if (y < ultimoY - 4 || y < 400) nav.classList.remove('oculta');
  ultimoY = y;
  if (borde) {
    borde.classList.toggle('activa', y > innerHeight * 0.8);
    const marcas = [...borde.querySelectorAll('a')];
    let actual = -1;
    marcas.forEach((a, i) => { const sec = document.querySelector(a.getAttribute('href')); if (sec && sec.getBoundingClientRect().top < innerHeight * 0.5) actual = i; });
    marcas.forEach((a, i) => { if (i === actual) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    bordeNum.textContent = String(actual + 1).padStart(2, '0');
  }

  // respaldo por si el navegador no avisa que algo entró en pantalla
  document.querySelectorAll('.aparece:not(.visto), .revela:not(.visto), .hero h1:not(.visto), .capitulo h2:not(.visto), .barras:not(.visto)').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight * 0.95 && r.bottom > 0 && r.left < innerWidth && r.right > 0) el.classList.add('visto');
  });

  if (!calma && heroImg && y < innerHeight * 1.2) heroImg.style.transform = 'translateY(' + (y * 0.18) + 'px)';

  if (!calma) numerales.forEach((n) => {
    const r = n.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const centro = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
    n.style.transform = 'translateY(' + (centro * -40) + 'px)';
  });

  if (secuencia) {
    const r = secuencia.getBoundingClientRect();
    const avance = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (innerHeight * 0.5)));
    secuencia.style.setProperty('--avance', avance.toFixed(3));
    pasos.forEach((li, i) => li.classList.toggle('activo', avance >= (i + 0.5) / pasos.length));
  }

  if (tramo && raiz.classList.contains('js-riel')) {
    const r = tramo.getBoundingClientRect();
    const recorrido = tramo.offsetHeight - riel.offsetHeight;
    const k = recorrido > 0 ? Math.min(1, Math.max(0, -r.top / recorrido)) : 0;
    pista.style.transform = 'translateX(' + (-k * Math.max(0, pista.scrollWidth - innerWidth + 56)) + 'px)';
  }
}
addEventListener('scroll', () => { if (!pendiente) { pendiente = true; requestAnimationFrame(alScroll); } }, { passive: true });
addEventListener('resize', () => { armarRiel(); alScroll(); });
addEventListener('load', () => { armarRiel(); alScroll(); });
armarRiel();
alScroll();

/* ---------- curvas de nivel en la portada ---------- */
(function topografia() {
  const lienzo = document.querySelector('.topo');
  if (!lienzo) return;
  const ctx = lienzo.getContext('2d');
  const hero = lienzo.parentElement;
  let w = 0, h = 0, dpr = 1, t = 0, visible = true, mx = 0.5, my = 0.5;
  const colores = ['rgba(164, 88, 59, ', 'rgba(107, 30, 43, ', 'rgba(92, 52, 38, '];

  function medir() {
    dpr = Math.min(2, devicePixelRatio || 1);
    w = hero.clientWidth; h = hero.clientHeight;
    lienzo.width = w * dpr; lienzo.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  // altura del terreno: suma de ondas, inclinada como una ladera
  function terreno(x, fila) {
    const u = x / w;
    return Math.sin(u * 5.1 + fila * 0.33 + t * 0.6) * 14
      + Math.sin(u * 11.7 - fila * 0.21 + t * 0.35) * 6
      + Math.sin(u * 2.3 + fila * 0.12 - t * 0.2 + mx * 2) * 22
      - u * h * 0.18;
  }
  function dibujar() {
    ctx.clearRect(0, 0, w, h);
    const filas = Math.ceil(h / 16) + 8;
    for (let f = 0; f < filas; f++) {
      const base = f * 16 + h * 0.05;
      const maestra = f % 5 === 0;
      ctx.beginPath();
      for (let x = -10; x <= w + 10; x += 12) {
        const y = base + terreno(x, f) + (my - 0.5) * 18;
        if (x === -10) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = colores[f % 3] + (maestra ? 0.22 : 0.09) + ')';
      ctx.lineWidth = maestra ? 1.2 : 0.7;
      ctx.stroke();
    }
  }
  function bucle() {
    if (visible) { t += 0.004; dibujar(); }
    requestAnimationFrame(bucle);
  }
  medir(); dibujar();
  addEventListener('resize', () => { medir(); dibujar(); });
  if (calma) return;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(hero);
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    mx += ((e.clientX - r.left) / r.width - mx) * 0.08;
    my += ((e.clientY - r.top) / r.height - my) * 0.08;
  });
  requestAnimationFrame(bucle);
})();

/* ---------- visor para ver planos en grande ---------- */
const visor = document.getElementById('visor');
const visorImg = visor.querySelector('img');
document.querySelectorAll('.ampliar').forEach((btn) => {
  btn.addEventListener('click', () => {
    const img = btn.querySelector('img');
    if (!img) return;
    visorImg.src = img.src;
    visorImg.alt = img.alt;
    visor.showModal();
  });
});
visor.querySelector('.visor__cerrar').addEventListener('click', () => visor.close());
visor.addEventListener('click', (e) => { if (e.target === visor) visor.close(); });
