document.documentElement.classList.add('js');

// Imagen que todavía no está en /img: mostrar un recuadro con el nombre del archivo esperado
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

// Menú en celular
const toggle = document.querySelector('.nav__toggle');
const menu = document.getElementById('menu');
toggle.addEventListener('click', () => {
  const abierto = menu.classList.toggle('abierto');
  toggle.setAttribute('aria-expanded', abierto);
});
menu.addEventListener('click', (e) => {
  if (e.target.closest('a')) {
    menu.classList.remove('abierto');
    toggle.setAttribute('aria-expanded', 'false');
  }
});

// Sección activa en el menú
const enlaces = [...menu.querySelectorAll('a')];
const obsMenu = new IntersectionObserver((entradas) => {
  entradas.forEach((en) => {
    if (!en.isIntersecting) return;
    enlaces.forEach((a) => {
      if (a.getAttribute('href') === '#' + en.target.id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-45% 0px -50% 0px' });
enlaces.forEach((a) => {
  const s = document.querySelector(a.getAttribute('href'));
  if (s) obsMenu.observe(s);
});

// Aparición suave al hacer scroll
const objetivos = document.querySelectorAll('.capitulo__cab, .prosa, .figura, .tarjetas, .ejes, .clima, .leyenda, .volumenes, .secuencia, .planchas, .cita, .lema, .barras, .datos, .presupuesto');
objetivos.forEach((el) => { if (!el.classList.contains('barras')) el.classList.add('aparece'); });
const obsVer = new IntersectionObserver((entradas, o) => {
  entradas.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('visto'); o.unobserve(en.target); }
  });
}, { threshold: 0.12 });
objetivos.forEach((el) => obsVer.observe(el));

// Visor para ver planos y láminas en grande
const visor = document.getElementById('visor');
const visorImg = visor.querySelector('img');
document.querySelectorAll('.ampliar').forEach((btn) => {
  btn.addEventListener('click', () => {
    const img = btn.querySelector('img');
    if (!img) return; // la imagen aún no existe
    visorImg.src = img.src;
    visorImg.alt = img.alt;
    visor.showModal();
  });
});
visor.querySelector('.visor__cerrar').addEventListener('click', () => visor.close());
visor.addEventListener('click', (e) => { if (e.target === visor) visor.close(); });
