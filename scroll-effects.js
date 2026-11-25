/* Scroll-linked depth. Native scrolling, no external animation library. */
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileLayout = window.matchMedia('(max-width: 900px), (hover: none), (pointer: coarse)');
  let dispose = () => {};
  function enableDepth() {
    if (!('IntersectionObserver' in window)) return () => {};
    const backgrounds = [];
    const active = new Set();
    const cards = [...document.querySelectorAll('.media-row .media-box, .video-container .video-box, .camera-item, .livestream-list .media-box, .work-category, .selected-project-grid .media-box')];
    const serviceImages = [...document.querySelectorAll('#services-details .image:not(.drone-scene)')];
    const hero = document.querySelector('#home');
    const title = hero?.querySelector('h1');
    const narrow = window.matchMedia('(max-width: 600px)');
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    let frame = 0;
    const types = new Map();
    document.querySelectorAll('#home, #about, #content, #aerial-footage, #services, #contact, #fpv-content, #festival-hero').forEach(section => {
      const style = getComputedStyle(section);
      if (style.backgroundImage === 'none' || section.classList.contains('cutout-hero')) return;
      const layer = document.createElement('div');
      layer.className = 'depth-background';
      layer.setAttribute('aria-hidden', 'true');
      layer.style.backgroundImage = style.backgroundImage;
      layer.style.backgroundPosition = style.backgroundPosition;
      section.prepend(layer);
      section.classList.add('has-depth-background');
      backgrounds.push({ section, layer });
      types.set(section, { type: 'background', layer });
    });
    cards.forEach((card, index) => {
      card.classList.add('depth-card');
      types.set(card, { type: 'card', side: index % 2 ? 1 : -1 });
    });
    serviceImages.forEach(image => {
      image.classList.add('depth-service-image');
      types.set(image, { type: 'service' });
    });
    if (hero && title && !hero.classList.contains('cutout-hero')) types.set(hero, { ...types.get(hero), title });
    document.documentElement.classList.add('fpv-scroll');
    function render() {
      frame = 0;
      const height = window.innerHeight;
      const strength = narrow.matches ? 0.55 : 1;
      // Read geometry first, then write transforms, to avoid layout thrashing.
      const updates = [...active].map(element => {
        const rect = element.getBoundingClientRect();
        const distance = clamp((rect.top + rect.height / 2 - height / 2) / ((height + rect.height) / 2), -1, 1);
        return { element, rect, distance, entry: types.get(element) };
      });
      updates.forEach(({ element, rect, distance, entry }) => {
        if (entry.layer) {
          entry.layer.style.transform = `translate3d(0, ${(-distance * 58 * strength).toFixed(2)}px, 0) scale(1.04)`;
        }
        if (entry.title) {
          const progress = clamp(-rect.top / Math.max(1, rect.height * 0.85), 0, 1);
          entry.title.style.transform = `perspective(900px) translate3d(0, ${(-progress * 100 * strength).toFixed(2)}px, ${(progress * 85 * strength).toFixed(2)}px) rotateX(${(progress * 22 * strength).toFixed(2)}deg)`;
        }
        if (entry.type === 'card') {
          const playing = [...element.querySelectorAll('video')].some(video => !video.paused);
          const focusInside = element.matches(':focus-within');
          const transform = playing || focusInside ? 'none' : `perspective(1200px) translate3d(0, ${(distance * 28 * strength).toFixed(2)}px, 0) rotateX(${(-distance * 14 * strength).toFixed(2)}deg) rotateY(${(entry.side * Math.abs(distance) * 8 * strength).toFixed(2)}deg)`;
          element.style.setProperty('--depth-transform', transform);
        }
        if (entry.type === 'service') {
          element.style.setProperty('--depth-pan', `${(-distance * 24 * strength).toFixed(2)}px`);
        }
      });
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(render); }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) active.add(entry.target);
        else active.delete(entry.target);
      });
      schedule();
    }, { rootMargin: '150px 0px' });
    types.forEach((_, element) => observer.observe(element));
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    document.addEventListener('focusin', schedule);
    document.addEventListener('focusout', schedule);
    document.addEventListener('play', schedule, true);
    document.addEventListener('pause', schedule, true);
    schedule();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('focusin', schedule);
      document.removeEventListener('focusout', schedule);
      document.removeEventListener('play', schedule, true);
      document.removeEventListener('pause', schedule, true);
      document.documentElement.classList.remove('fpv-scroll');
      backgrounds.forEach(({section, layer}) => { layer.remove(); section.classList.remove('has-depth-background'); });
      cards.forEach(card => { card.classList.remove('depth-card'); card.style.removeProperty('--depth-transform'); });
      serviceImages.forEach(image => { image.classList.remove('depth-service-image'); image.style.removeProperty('--depth-pan'); });
      if (title) title.style.removeProperty('transform');
    };
  }
  function sync() {
    dispose();
    dispose = reducedMotion.matches || mobileLayout.matches ? () => {} : enableDepth();
  }
  reducedMotion.addEventListener('change', sync);
  mobileLayout.addEventListener('change', sync);
  sync();
})();
