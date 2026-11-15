/* Página de síntesis: menú, video de la portada, imágenes ampliables y aparición suave. */
(function () {
  'use strict';
  const calma = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const toggle = document.querySelector('.nav__toggle');
  const menu = document.getElementById('menu');
  toggle.addEventListener('click', () => {
    const abierto = menu.classList.toggle('abierto');
    toggle.setAttribute('aria-expanded', abierto);
  });
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) { menu.classList.remove('abierto'); toggle.setAttribute('aria-expanded', 'false'); } });

  const caja = document.querySelector('.bento__video');
  if (caja) {
    const video = caja.querySelector('video');
    const boton = caja.querySelector('.bento__pausa');
    let manual = false;
    const poner = (p) => { boton.setAttribute('aria-pressed', p); boton.textContent = p ? 'Reproducir video' : 'Pausar video'; };
    if (calma) { video.removeAttribute('autoplay'); video.pause(); poner(true); }
    boton.addEventListener('click', () => { if (video.paused) { video.play(); poner(false); manual = false; } else { video.pause(); poner(true); manual = true; } });
    new IntersectionObserver(([en]) => { if (calma || manual) return; if (en.isIntersecting) video.play().catch(() => {}); else video.pause(); }, { threshold: 0.05 }).observe(caja);
  }

  const visor = document.getElementById('visor');
  const vimg = visor.querySelector('img');
  document.querySelectorAll('.ampliar').forEach((b) => b.addEventListener('click', () => {
    const img = b.querySelector('img'); if (!img) return;
    vimg.src = img.src; vimg.alt = img.alt; visor.showModal();
  }));
  visor.querySelector('.visor__cerrar').addEventListener('click', () => visor.close());
  visor.addEventListener('click', (e) => { if (e.target === visor) visor.close(); });

  if (!calma && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('sx-anim');
    const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('visto'); io.unobserve(en.target); } }), { threshold: 0.12 });
    document.querySelectorAll('.sx, .cierre').forEach((el) => io.observe(el));
  }
})();
