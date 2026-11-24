/* Photographic foreground layers, controlled by native scroll and subtle pointer depth. */
(() => {
  const hero = document.querySelector('.cutout-hero');
  const scenes = [...document.querySelectorAll('[data-flight-scene]')];
  if (!hero && !scenes.length) return;
  const person = hero?.querySelector('.hero-person-motion');
  const copy = hero?.querySelector('.hero-copy');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const small = matchMedia('(max-width: 600px)');
  const finePointer = matchMedia('(pointer: fine)');
  let frame = 0;
  let pointerX = 0;
  let pointerY = 0;
  const visible = new Set();
  const clamp = (x, min, max) => Math.max(min, Math.min(max, x));
  function render() {
    frame = 0;
    if (reduced.matches) return;
    const strength = small.matches ? 0.45 : 1;
    const height = innerHeight;
    const heroRect = hero?.getBoundingClientRect();
    const progress = heroRect ? clamp(-heroRect.top / Math.max(1, heroRect.height), 0, 1) : 0;
    const reads = [...visible].map(scene => ({scene, rect: scene.getBoundingClientRect()}));
    if (heroRect && heroRect.bottom > 0) {
      person.style.setProperty('--person-transform', `perspective(1400px) translate3d(${(pointerX * 13 * strength).toFixed(2)}px, ${(progress * 90 * strength + pointerY * 6).toFixed(2)}px, ${(progress * 80 * strength).toFixed(2)}px) rotateY(${(pointerX * 7 * strength - progress * 7 * strength).toFixed(2)}deg) rotateZ(${(-progress * 3 * strength).toFixed(2)}deg) scale(${(1 + progress * 0.14 * strength).toFixed(3)})`);
      copy.style.transform = `translate3d(0,${(-progress * 48 * strength).toFixed(2)}px,0)`;
    }
    reads.forEach(({scene, rect}, index) => {
      const distance = clamp((rect.top + rect.height/2 - height/2) / ((height+rect.height)/2), -1, 1);
      const side = scenes.indexOf(scene) % 2 ? -1 : 1;
      scene.querySelector('.drone-flight').style.setProperty('--drone-transform', `perspective(1300px) translate3d(${(distance * side * 48 * strength).toFixed(2)}px,${(-distance * 48 * strength).toFixed(2)}px,${((1-Math.abs(distance))*80*strength).toFixed(2)}px) rotateX(${(distance * 13 * strength).toFixed(2)}deg) rotateY(${(distance * side * 20 * strength).toFixed(2)}deg) rotateZ(${(distance * side * 9 * strength).toFixed(2)}deg)`);
    });
  }
  function schedule() { if (!frame && !reduced.matches) frame = requestAnimationFrame(render); }
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
    schedule();
  }, { rootMargin: '100px 0px' }) : null;
  scenes.forEach(scene => observer?.observe(scene));
  // A closed disclosure has no scene area; observing it works again when opened.
  document.querySelector('.equipment-disclosure')?.addEventListener('toggle', schedule);
  hero?.addEventListener('pointermove', event => {
    if (!finePointer.matches || reduced.matches) return;
    const r = hero.getBoundingClientRect();
    pointerX = clamp((event.clientX-r.left)/r.width*2-1,-1,1);
    pointerY = clamp((event.clientY-r.top)/r.height*2-1,-1,1);
    schedule();
  });
  hero?.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; schedule(); });
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  reduced.addEventListener('change', () => {
    if (reduced.matches) {
      cancelAnimationFrame(frame); frame = 0;
      person?.style.removeProperty('--person-transform'); copy?.style.removeProperty('transform');
      scenes.forEach(scene => scene.querySelector('.drone-flight').style.removeProperty('--drone-transform'));
    } else schedule();
  });
  schedule();
})();
