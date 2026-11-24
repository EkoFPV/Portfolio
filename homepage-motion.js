/* Homepage choreography: progressive enhancement, native scrolling. */
(() => {
  if (!document.querySelector('.cutout-hero')) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = matchMedia('(max-width: 600px)');
  const mobileLayout = matchMedia('(max-width: 900px), (hover: none), (pointer: coarse)');
  const animations = new Set();
  const played = new WeakSet();
  const hero = document.querySelector('.cutout-hero');
  const copy = hero.querySelector('.hero-copy');
  const bar = document.createElement('div');
  bar.className = 'reading-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.append(bar);
  function reveal(element, delay = 0) {
    if (played.has(element) || reduced.matches || mobileLayout.matches || !element.animate) return;
    played.add(element);
    const image = element.matches('.category-image');
    const animation = element.animate(image ? [
      { clipPath: 'inset(12% 0 12% 0)', opacity: .35 },
      { clipPath: 'inset(0% 0 0% 0)', opacity: 1 }
    ] : [
      { opacity: 0, transform: `translate3d(0,${narrow.matches ? 18 : 38}px,0)` },
      { opacity: 1, transform: 'translate3d(0,0,0)' }
    ], { duration: image ? 1100 : 850, delay: narrow.matches ? 0 : delay, easing: 'cubic-bezier(.22,1,.36,1)' });
    animations.add(animation);
    animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
  }
  const targets = [...document.querySelectorAll('.content-header h2, .category-image, .work-category h3, .portfolio-label, .selected-project-grid article > h3, .selected-project-grid article > p, .selected-project-grid .project-detail-link, .about-content, .service-summary-grid > div, .service-actions, .contact-content')];
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      const siblings = [...element.parentElement.children];
      const card = element.closest('.work-category, .selected-project-grid article');
      const index = card ? [...card.parentElement.children].indexOf(card) : siblings.indexOf(element);
      reveal(element, Math.min(index, 3) * 90);
      observer.unobserve(element);
    });
  }, { threshold: .12 }) : null;
  targets.forEach(element => observer?.observe(element));
  [hero.querySelector('h1'),hero.querySelector('.hero-disciplines'),hero.querySelector('.hero-project-link')].forEach((element,index) => reveal(element,index*150));
  let frame = 0;
  function render() {
    frame = 0;
    const rect = hero.getBoundingClientRect();
    const max = document.documentElement.scrollHeight - innerHeight;
    const progress = Math.max(0,Math.min(1,scrollY / Math.max(1,max)));
    const fade = Math.max(0,Math.min(1,-rect.top / Math.max(1,rect.height)));
    bar.style.transform = `scaleX(${progress})`;
    copy.style.opacity = reduced.matches || mobileLayout.matches ? '1' : String(1-Math.min(.9,fade*1.25));
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(render); }
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule,{passive:true});
  function resetAnimations() {
    animations.forEach(animation => animation.cancel());
    animations.clear();
    schedule();
  }
  reduced.addEventListener('change', resetAnimations);
  mobileLayout.addEventListener('change', resetAnimations);
  schedule();
})();
