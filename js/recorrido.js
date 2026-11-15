/* Recorrido guiado de Ecos del Paisaje: una idea por pantalla, preguntas, pausas voluntarias y repaso final. */
(function () {
  'use strict';
  const D = window.RECORRIDO;
  const CAPS = D.capitulos;
  const IDEAS = CAPS.flatMap((c) => c.ideas.map((i) => Object.assign(i, { cap: c })));
  const TOTAL = IDEAS.length;
  const CLAVE = 'ecos-recorrido-v1';
  const $ = (s, r) => (r || document).querySelector(s);
  const el = (tag, attrs, hijos) => {
    const n = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    });
    [].concat(hijos || []).forEach((h) => h && n.append(h));
    return n;
  };

  /* Cómo se relaciona cada carpeta con la anterior (consolidación) */
  const PUENTES = {
    comunidad: 'En «Leer el lugar» viste un borde que se ocupa sin control. Aquí viste quiénes viven en él y por qué el edificio debe servirles toda la vida.',
    clima: 'Ya sabes para quién es el proyecto. El clima explica cómo debe ser el edificio para que esa gente esté cómoda sin máquinas.',
    idea: 'El lugar, la gente y el clima piden lo mismo: un edificio que no se separe de la ladera. De ahí sale la idea del paisaje como estructura.',
    programa: 'La idea del paisaje se vuelve concreta: los cuatro ejes de «Conocer a la gente» se reparten en volúmenes alrededor del agua.',
    recorrido: 'Los volúmenes del programa se unen con un recorrido que sigue las terrazas y termina en el paisaje.',
    proyecto: 'El recorrido, visto de lado, es la sección. Y el muro que guarda calor en «Entender el clima» es el mismo que sostiene la ladera.',
    estructura: 'La cubierta que da sombra y recoge la lluvia —dos ideas del clima— es también la pieza que más se ve del proyecto.'
  };

  /* ---------- estado guardado en el dispositivo ---------- */
  let S = { vistas: {}, resp: {}, fallos: {}, final: null, foco: false };
  try { Object.assign(S, JSON.parse(localStorage.getItem(CLAVE) || '{}')); } catch (e) { /* sin almacenamiento: se sigue en memoria */ }
  const guardar = () => { try { localStorage.setItem(CLAVE, JSON.stringify(S)); } catch (e) { /* nada */ } };
  const vistasDe = (cap) => cap.ideas.filter((i) => S.vistas[i.id]).length;

  /* ---------- avance ---------- */
  function pintarAvance() {
    const n = IDEAS.filter((i) => S.vistas[i.id]).length;
    $('#avance-txt').textContent = n + ' de ' + TOTAL + ' ideas';
    $('#avance-barra').style.transform = 'scaleX(' + n / TOTAL + ')';
  }

  /* ---------- vistas y rutas ---------- */
  const vistas = ['inicio', 'mesa', 'cap', 'final'];
  function mostrar(nombre) {
    vistas.forEach((v) => { $('#v-' + v).hidden = v !== nombre; });
    document.body.dataset.vista = nombre;
    window.scrollTo(0, 0);
  }
  function enfocar(nodo) {
    if (!nodo) return;
    nodo.setAttribute('tabindex', '-1');
    nodo.focus({ preventScroll: true });
  }
  const ir = (hash) => { if (location.hash === hash) ruta(); else location.hash = hash; };

  function ruta() {
    const h = location.hash.replace('#', '') || 'inicio';
    const m = /^c-([a-z]+)-(\d+)$/.exec(h);
    if (m && CAPS.some((c) => c.id === m[1])) return abrirCap(CAPS.find((c) => c.id === m[1]), +m[2]);
    if (h === 'mesa') { pintarMesa(); mostrar('mesa'); return enfocar($('#v-mesa h2')); }
    if (h === 'final') { pintarExamen(); mostrar('final'); return enfocar($('#v-final h2')); }
    mostrar('inicio');
  }

  /* ---------- mesa de carpetas ---------- */
  const BACK = 'M0 56A22 22 0 0 1 22 34L146 34C170 34 172 0 198 0L318 0A22 22 0 0 1 340 22L340 250A22 22 0 0 1 318 272L22 272A22 22 0 0 1 0 250Z';
  const FRONT = 'M0 22A22 22 0 0 1 22 0L118 0C144 0 146 32 172 32L318 32A22 22 0 0 1 340 54L340 176A22 22 0 0 1 318 198L22 198A22 22 0 0 1 0 176Z';

  function carpeta(cap, orden) {
    const v = vistasDe(cap);
    const estado = v === 0 ? 'nueva' : v < cap.ideas.length ? 'curso' : 'lista';
    const meta = estado === 'nueva' ? cap.ideas.length + ' ideas' : estado === 'lista' ? 'Completa' : v + ' de ' + cap.ideas.length + ' ideas';
    const hojas = cap.ideas.map((idea, i) => {
      const slot = cap.ideas.length <= 1 ? 0 : (i / (cap.ideas.length - 1)) * 2 - 1;
      const hoja = el('span', { class: 'gf-sheet' + (idea.img ? ' gf-sheet--art' : ''), style: '--slot:' + slot + ';--depth:' + (cap.ideas.length - 1 - i) + ';--jr:' + ((i * 37 + orden * 11) % 5 - 2) * 0.7 + 'deg' });
      if (idea.img) hoja.append(el('img', { src: 'img/' + idea.img, alt: '', loading: 'lazy', draggable: 'false' }));
      else hoja.append(el('span', { class: 'gf-lines' }, [0, 1, 2, 3].map(() => el('i'))));
      hoja.append(el('span', { class: 'gf-sheet-head', text: idea.titulo }));
      return hoja;
    });
    const frente = el('button', {
      type: 'button', class: 'gf-front', style: "clip-path:path('" + FRONT + "')",
      'aria-label': 'Abrir carpeta ' + cap.n + ', ' + cap.titulo + '. ' + meta,
      onclick: () => {
        const raiz = frente.closest('.gf');
        raiz.dataset.open = '';
        const pendiente = cap.ideas.findIndex((i) => !S.vistas[i.id]);
        setTimeout(() => ir('#c-' + cap.id + '-' + (estado === 'curso' ? pasosDe(cap).findIndex((p) => p.idea === cap.ideas[pendiente]) : 0)), matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 520);
      }
    }, [
      el('span', { class: 'gf-tint' }),
      el('span', { class: 'gf-label' }, [el('span', { class: 'gf-num', text: cap.n }), el('span', { class: 'gf-title', text: cap.titulo }), el('span', { class: 'gf-meta', text: meta })]),
      estado === 'lista' ? el('span', { class: 'gf-check', 'aria-hidden': 'true', text: '✓' }) : null
    ]);
    return el('div', { class: 'gf-wrap', style: '--orden:' + orden }, el('div', { class: 'gf', 'data-estado': estado }, [
      el('span', { class: 'gf-shadow' }),
      el('span', { class: 'gf-back', style: "clip-path:path('" + BACK + "')" }, el('img', { class: 'gf-art', src: 'img/' + cap.portada, alt: '', loading: 'lazy', draggable: 'false' })),
      el('span', { class: 'gf-files', 'aria-hidden': 'true' }, hojas),
      frente
    ]));
  }

  function pintarMesa() {
    $('#carpetas').replaceChildren(...CAPS.map(carpeta));
    const paraRepasar = IDEAS.filter((i) => S.fallos[i.id]);
    $('#repaso').hidden = !paraRepasar.length;
    $('#repaso-lista').replaceChildren(...paraRepasar.map((i) => el('li', {}, el('a', {
      href: '#c-' + i.cap.id + '-' + pasosDe(i.cap).findIndex((p) => p.idea === i), text: i.cap.n + ' · ' + i.titulo
    }))));
    const todas = IDEAS.every((i) => S.vistas[i.id]);
    $('#btn-final').textContent = todas ? 'Ir al repaso final' : 'Ir al repaso final (aún te faltan carpetas)';
  }

  /* ---------- un capítulo: pasos ---------- */
  function recuerdoPara(cap) {
    // repetición espaciada: antes de empezar, una pregunta de una carpeta anterior (primero las que se fallaron)
    const antes = CAPS.slice(0, CAPS.indexOf(cap)).flatMap((c) => c.ideas).filter((i) => i.q && S.vistas[i.id]);
    if (!antes.length) return null;
    return antes.find((i) => S.fallos[i.id]) || antes[(CAPS.indexOf(cap) * 2) % antes.length];
  }
  const cachePasos = new Map();
  function pasosDe(cap) {
    if (cachePasos.has(cap.id)) return cachePasos.get(cap.id);
    const pasos = [];
    const rec = recuerdoPara(cap);
    if (rec) pasos.push({ tipo: 'recuerdo', idea: null, de: rec });
    cap.ideas.forEach((idea) => pasos.push({ tipo: 'idea', idea }));
    pasos.push({ tipo: 'resumen', idea: null });
    cachePasos.set(cap.id, pasos);
    return pasos;
  }

  let actual = { cap: null, paso: 0 };
  function abrirCap(cap, paso) {
    const pasos = pasosDe(cap);
    paso = Math.max(0, Math.min(pasos.length - 1, paso || 0));
    actual = { cap, paso };
    $('#cap-n').textContent = cap.n;
    $('#cap-titulo').textContent = cap.titulo;
    $('#pasos').replaceChildren(...pasos.map((p, i) => el('li', {
      class: (i === paso ? 'activo ' : '') + (p.idea && S.vistas[p.idea.id] ? 'visto' : ''),
      'aria-current': i === paso ? 'step' : null
    }, el('a', { href: '#c-' + cap.id + '-' + i, 'aria-label': p.tipo === 'idea' ? p.idea.titulo : p.tipo === 'resumen' ? 'Resumen' : 'Antes de seguir' }))));
    const p = pasos[paso];
    const tarjeta = $('#tarjeta');
    tarjeta.replaceChildren(p.tipo === 'idea' ? vistaIdea(p.idea, cap) : p.tipo === 'recuerdo' ? vistaRecuerdo(p.de) : vistaResumen(cap));
    tarjeta.classList.remove('entra');
    void tarjeta.offsetWidth;
    tarjeta.classList.add('entra');
    if (p.tipo === 'idea' && !S.vistas[p.idea.id]) { S.vistas[p.idea.id] = true; guardar(); }
    pintarAvance();
    $('#btn-ant').disabled = paso === 0;
    const ultimo = paso === pasos.length - 1;
    const sigCap = CAPS[CAPS.indexOf(cap) + 1];
    $('#btn-sig').textContent = !ultimo ? (p.tipo === 'recuerdo' ? 'Empezar la carpeta' : pasos[paso + 1].tipo === 'resumen' ? 'Ver el resumen' : 'Siguiente idea') : sigCap ? 'Siguiente carpeta: ' + sigCap.titulo : 'Ir al repaso final';
    mostrar('cap');
    enfocar($('h2', tarjeta));
  }
  function mover(d) {
    const pasos = pasosDe(actual.cap);
    const n = actual.paso + d;
    if (n < 0) return;
    if (n < pasos.length) return ir('#c-' + actual.cap.id + '-' + n);
    const sig = CAPS[CAPS.indexOf(actual.cap) + 1];
    ir(sig ? '#c-' + sig.id + '-0' : '#final');
  }

  /* ---------- piezas de una idea ---------- */
  function figura(idea) {
    if (idea.barras) {
      const max = Math.max(...idea.barras.filas.map((f) => f[1]));
      const fmt = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 });
      return el('div', { class: 'rc-barras', role: 'img', 'aria-label': idea.barras.titulo + ': ' + idea.barras.filas.map((f) => f[0] + ' ' + fmt.format(f[1]) + (idea.barras.sufijo || '')).join(', ') }, [
        el('p', { class: 'rc-barras__t', text: idea.barras.titulo }),
        ...idea.barras.filas.map((f) => el('div', { class: 'rc-barras__fila' }, [
          el('span', { class: 'rc-barras__et', text: f[0] }),
          el('span', { class: 'rc-barras__riel' }, el('span', { style: 'width:' + (f[1] / max) * 100 + '%' })),
          el('span', { class: 'rc-barras__v', text: fmt.format(f[1]) + (idea.barras.sufijo || '') })
        ]))
      ]);
    }
    const img = el('img', { src: 'img/' + idea.img, alt: idea.alt || '' });
    return el('figure', { class: 'rc-idea__img' }, [
      el('button', { type: 'button', class: 'rc-ampliar', 'aria-label': 'Ampliar imagen: ' + idea.titulo, onclick: () => ampliar(img) }, img),
      el('figcaption', { text: 'Toca la imagen para verla grande.' })
    ]);
  }

  function pregunta(idea, alResponder) {
    let intentos = 0;
    const aviso = el('p', { class: 'rc-q__aviso', role: 'status' });
    const botones = idea.ops.map((op, i) => el('button', {
      type: 'button', class: 'rc-op', text: op,
      onclick: (e) => {
        const b = e.currentTarget;
        if (i === idea.r) {
          botones.forEach((x) => { x.disabled = true; });
          b.classList.add('bien');
          aviso.className = 'rc-q__aviso bien';
          aviso.textContent = (intentos ? 'Ahora sí. ' : 'Correcto. ') + (idea.porque || '');
          S.resp[idea.id] = true;
          if (!intentos) delete S.fallos[idea.id];
        } else {
          intentos++;
          b.classList.add('mal');
          b.disabled = true;
          aviso.className = 'rc-q__aviso mal';
          aviso.textContent = 'Todavía no. Vuelve al texto de arriba y prueba otra opción.';
          S.resp[idea.id] = false;
          S.fallos[idea.id] = (S.fallos[idea.id] || 0) + 1;
        }
        guardar();
        if (alResponder) alResponder(i === idea.r);
      }
    }));
    return el('div', { class: 'rc-q' }, [el('p', { class: 'rc-q__t', text: idea.q }), el('div', { class: 'rc-q__ops' }, botones), aviso]);
  }

  function asociar(idea) {
    const A = idea.asociar;
    const aviso = el('p', { class: 'rc-q__aviso', role: 'status' });
    let elegido = null;
    let hechos = 0;
    const der = A.pares.map((p) => p[1]).sort((a, b) => a.localeCompare(b, 'es'));
    const izq = A.pares.map((p) => el('button', { type: 'button', class: 'rc-op', text: p[0], 'aria-pressed': 'false', onclick: (e) => {
      izq.forEach((x) => x.setAttribute('aria-pressed', 'false'));
      elegido = p; e.currentTarget.setAttribute('aria-pressed', 'true');
      aviso.className = 'rc-q__aviso'; aviso.textContent = 'Ahora elige el espacio que le corresponde a «' + p[0] + '».';
    } }));
    const dcha = der.map((txt) => el('button', { type: 'button', class: 'rc-op', text: txt, onclick: (e) => {
      if (!elegido) { aviso.textContent = 'Primero elige un eje de la columna izquierda.'; return; }
      if (elegido[1] === txt) {
        const bi = izq[A.pares.indexOf(elegido)];
        [bi, e.currentTarget].forEach((b) => { b.disabled = true; b.classList.add('bien'); b.setAttribute('aria-pressed', 'false'); });
        hechos++; elegido = null;
        aviso.className = 'rc-q__aviso bien';
        aviso.textContent = hechos === A.pares.length ? 'Listo: uniste los cuatro ejes con sus espacios.' : 'Bien. Sigue con otro eje.';
        if (hechos === A.pares.length) { S.resp[idea.id] = true; guardar(); }
      } else {
        aviso.className = 'rc-q__aviso mal';
        aviso.textContent = 'Ese espacio es de otro eje. Prueba de nuevo.';
        S.fallos[idea.id] = (S.fallos[idea.id] || 0) + 1; guardar();
      }
    } }));
    return el('div', { class: 'rc-q' }, [el('p', { class: 'rc-q__t', text: A.pregunta }), el('div', { class: 'rc-asociar' }, [el('div', {}, izq), el('div', {}, dcha)]), aviso]);
  }

  function vistaIdea(idea, cap) {
    const n = cap.ideas.indexOf(idea) + 1;
    return el('article', { class: 'rc-idea' }, [
      figura(idea),
      el('div', { class: 'rc-idea__txt' }, [
        el('p', { class: 'kicker', text: 'Idea ' + n + ' de ' + cap.ideas.length }),
        el('h2', { text: idea.titulo }),
        el('p', { class: 'rc-idea__p', text: idea.texto }),
        el('p', { class: 'rc-ejemplo' }, [el('b', { text: 'Ejemplo' }), document.createTextNode(idea.ejemplo)]),
        idea.mas ? el('details', { class: 'rc-mas' }, [el('summary', { text: 'Quiero más detalle' }), el('p', { text: idea.mas })]) : null,
        idea.asociar ? asociar(idea) : pregunta(idea)
      ])
    ]);
  }

  function vistaRecuerdo(idea) {
    return el('article', { class: 'rc-recuerdo' }, [
      el('p', { class: 'kicker', text: 'Antes de seguir · opcional' }),
      el('h2', { text: '¿Te acuerdas?' }),
      el('p', { class: 'rc-idea__p', text: 'Una pregunta de «' + idea.cap.titulo + '», la carpeta ' + idea.cap.n + '. Recordar algo un rato después ayuda a que no se borre.' }),
      pregunta(idea),
      el('p', { class: 'rc-nota' }, [document.createTextNode('Si no te acuerdas, '), el('a', { href: '#c-' + idea.cap.id + '-' + pasosDe(idea.cap).findIndex((p) => p.idea === idea), text: 'vuelve a esa idea' }), document.createTextNode(' o sigue adelante.')])
    ]);
  }

  function vistaResumen(cap) {
    const fallidas = cap.ideas.filter((i) => S.fallos[i.id]);
    const sig = CAPS[CAPS.indexOf(cap) + 1];
    return el('article', { class: 'rc-resumen' }, [
      el('p', { class: 'kicker', text: 'Resumen de la carpeta ' + cap.n }),
      el('h2', { text: cap.titulo + ', en tres ideas' }),
      el('ol', { class: 'rc-resumen__lista' }, cap.ideas.map((i, k) => el('li', {}, [
        el('a', { href: '#c-' + cap.id + '-' + pasosDe(cap).findIndex((p) => p.idea === i), text: i.titulo }),
        el('span', { text: i.ejemplo }),
        el('em', { class: S.fallos[i.id] ? 'mal' : S.resp[i.id] ? 'bien' : '', text: S.fallos[i.id] ? 'Para repasar' : S.resp[i.id] ? 'Comprendida' : 'Sin responder' })
      ]))),
      PUENTES[cap.id] ? el('p', { class: 'rc-puente' }, [el('b', { text: 'Cómo se conecta con lo anterior' }), document.createTextNode(PUENTES[cap.id])]) : null,
      fallidas.length ? el('p', { class: 'rc-nota', text: 'Te recomiendo volver a: ' + fallidas.map((i) => i.titulo).join(' · ') + '. Toca el título para abrirla.' }) : null,
      el('div', { class: 'rc-resumen__acc' }, [
        el('button', { type: 'button', class: 'rc-btn rc-btn--linea', text: 'Tomar una pausa', onclick: () => abrirPausa('respirar') }),
        el('a', { class: 'rc-btn rc-btn--linea', href: '#mesa', text: 'Volver a las carpetas' }),
        el('a', { class: 'rc-btn rc-btn--fuerte', href: sig ? '#c-' + sig.id + '-0' : '#final', text: sig ? 'Seguir con ' + sig.titulo : 'Ir al repaso final' })
      ])
    ]);
  }

  /* ---------- repaso final ---------- */
  function pintarExamen() {
    const f = $('#examen');
    $('#resultado').hidden = true;
    f.hidden = false;
    f.replaceChildren(...D.final.map((p, i) => {
      const cap = CAPS.find((c) => c.id === p.cap);
      return el('fieldset', { class: 'rc-examen__p' }, [
        el('legend', {}, [el('span', { text: cap.n + ' · ' + cap.titulo }), document.createTextNode(p.q)]),
        ...p.ops.map((op, k) => el('label', { class: 'rc-radio' }, [el('input', { type: 'radio', name: 'f' + i, value: k }), el('span', { text: op })]))
      ]);
    }), el('button', { type: 'submit', class: 'rc-btn rc-btn--fuerte', text: 'Ver mi resultado' }));
  }
  function corregir(e) {
    e.preventDefault();
    const datos = new FormData($('#examen'));
    const res = D.final.map((p, i) => ({ p, cap: CAPS.find((c) => c.id === p.cap), dada: datos.get('f' + i), ok: datos.get('f' + i) !== null && +datos.get('f' + i) === p.r }));
    S.final = Object.fromEntries(res.map((r) => [r.p.cap, r.ok])); guardar();
    const bien = res.filter((r) => r.ok);
    const mal = res.filter((r) => !r.ok);
    const fila = (r) => el('li', {}, [
      el('a', { href: '#c-' + r.cap.id + '-0', text: r.cap.n + ' · ' + r.cap.titulo }),
      el('span', { text: r.ok ? r.p.ops[r.p.r] : r.dada === null ? 'Sin responder. La respuesta es: ' + r.p.ops[r.p.r] : 'La respuesta es: ' + r.p.ops[r.p.r] })
    ]);
    const caja = $('#resultado');
    caja.replaceChildren(
      el('h3', { text: bien.length + ' de ' + res.length + ' ideas relacionadas' }),
      bien.length ? el('div', { class: 'rc-resultado__col bien' }, [el('h4', { text: 'Lo que comprendiste' }), el('ul', {}, bien.map(fila))]) : null,
      mal.length ? el('div', { class: 'rc-resultado__col mal' }, [el('h4', { text: 'Para repasar' }), el('p', { class: 'rc-nota', text: 'Toca la carpeta para volver a verla.' }), el('ul', {}, mal.map(fila))]) : el('p', { class: 'rc-puente', text: 'Relacionaste las ocho carpetas. Si quieres ver todos los planos y láminas, pasa a la versión completa.' }),
      el('label', { class: 'rc-reflexion' }, [el('span', { text: 'Para cerrar (no se guarda ni se envía): ¿qué idea te llevas?' }), el('textarea', { rows: '3' })]),
      el('div', { class: 'rc-resumen__acc' }, [
        el('button', { type: 'button', class: 'rc-btn rc-btn--linea', text: 'Responder de nuevo', onclick: () => { pintarExamen(); enfocar($('#v-final h2')); } }),
        el('a', { class: 'rc-btn rc-btn--linea', href: '#mesa', text: 'Volver a las carpetas' }),
        el('a', { class: 'rc-btn rc-btn--fuerte', href: 'index.html', text: 'Ver la versión completa' })
      ])
    );
    $('#examen').hidden = true;
    caja.hidden = false;
    enfocar($('h3', caja));
  }

  /* ---------- pausa voluntaria ---------- */
  const pausa = $('#pausa');
  function cuerpoPausa(tipo) {
    const azar = (a) => a[Math.floor(Math.random() * a.length)];
    if (tipo === 'respirar') return [
      el('div', { class: 'rc-respira', 'aria-hidden': 'true' }, el('span')),
      el('p', { text: 'Inhala mientras el círculo crece. Exhala mientras se encoge. Quédate el tiempo que quieras.' })
    ];
    if (tipo === 'observar') { const o = azar(D.pausas.observar); return [el('img', { class: 'rc-pausa__img', src: 'img/' + o.img, alt: o.alt }), el('p', { text: o.reto })]; }
    if (tipo === 'pensar') return [el('p', { class: 'rc-pausa__grande', text: azar(D.pausas.reflexion) }), el('p', { class: 'rc-nota', text: 'No hay que escribir nada. Solo piénsalo un momento.' })];
    const vistos = CAPS.filter((c) => vistasDe(c));
    return vistos.length ? [el('ul', { class: 'rc-pausa__resumen' }, vistos.map((c) => el('li', {}, [el('b', { text: c.n + ' ' + c.titulo }), el('span', { text: c.ideas.filter((i) => S.vistas[i.id]).map((i) => i.titulo).join(' · ') })])))] : [el('p', { text: 'Todavía no has abierto ninguna carpeta.' })];
  }
  function abrirPausa(tipo) {
    pausa.querySelectorAll('[role=tab]').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.pausa === tipo)));
    $('#pausa-cuerpo').replaceChildren(...cuerpoPausa(tipo));
    if (!pausa.open) pausa.showModal();
  }
  pausa.querySelectorAll('[role=tab]').forEach((t) => t.addEventListener('click', () => abrirPausa(t.dataset.pausa)));
  $('#pausa-cerrar').addEventListener('click', () => pausa.close());
  pausa.addEventListener('click', (e) => { if (e.target === pausa) pausa.close(); });

  /* ---------- visor de imágenes ---------- */
  const visor = $('#visor');
  function ampliar(img) { const v = $('img', visor); v.src = img.src; v.alt = img.alt; visor.showModal(); }
  $('.visor__cerrar', visor).addEventListener('click', () => visor.close());
  visor.addEventListener('click', (e) => { if (e.target === visor) visor.close(); });

  /* ---------- controles generales ---------- */
  function ponerFoco(v) {
    S.foco = v; guardar();
    document.body.classList.toggle('rc-foco', v);
    $('#btn-foco').setAttribute('aria-pressed', String(v));
  }
  $('#btn-foco').addEventListener('click', () => ponerFoco(!S.foco));
  $('#btn-pausa').addEventListener('click', () => abrirPausa('respirar'));
  $('#btn-mesa').addEventListener('click', () => ir('#mesa'));
  $('#btn-volver').addEventListener('click', () => ir('#mesa'));
  $('#btn-empezar').addEventListener('click', () => ir('#mesa'));
  $('#btn-final').addEventListener('click', () => ir('#final'));
  $('#btn-ant').addEventListener('click', () => mover(-1));
  $('#btn-sig').addEventListener('click', () => mover(1));
  $('#examen').addEventListener('submit', corregir);
  $('#btn-reiniciar').addEventListener('click', () => {
    if (!confirm('¿Borrar tu avance y tus respuestas en este dispositivo?')) return;
    S = { vistas: {}, resp: {}, fallos: {}, final: null, foco: S.foco };
    cachePasos.clear(); guardar(); pintarAvance(); pintarMesa();
  });
  addEventListener('hashchange', ruta);

  if (IDEAS.some((i) => S.vistas[i.id])) $('#btn-empezar').textContent = 'Continuar donde iba';
  ponerFoco(!!S.foco);
  pintarAvance();
  ruta();
})();
