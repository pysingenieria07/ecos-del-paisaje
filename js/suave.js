/* Scroll con inercia (Lenis). Solo con ratón o trackpad; en pantallas táctiles queda el scroll nativo.
   Con «reducir movimiento» no se activa. */
(function () {
  if (!window.Lenis || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const barra = document.querySelector('.nav, .mg-barra');
  const lenis = new window.Lenis({
    lerp: 0.11,
    wheelMultiplier: 0.9,
    anchors: { offset: -(barra ? barra.offsetHeight : 72) },
    autoRaf: true,
  });
  window.lenis = lenis;
})();
