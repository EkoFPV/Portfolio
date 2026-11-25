/* Small entry animations on phones; no mobile parallax, masking or layout changes. */
(() => {
 const hero = document.querySelector('.cutout-hero');
 if (!hero) return;
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const mobile = matchMedia('(max-width: 900px), (hover: none), (pointer: coarse)');
 const animations = new Set(); const played = new WeakSet();
 const copy = hero.querySelector('.hero-copy');
 const bar = document.createElement('div');
 bar.className = 'reading-progress'; bar.setAttribute('aria-hidden','true'); document.body.append(bar);
 function animate(element, keyframes, options) {
  if (!element?.animate || reduced.matches) return;
  const animation = element.animate(keyframes, options);
  animations.add(animation);
  animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
 }
 function reveal(element, delay = 0) {
  if (!element || played.has(element) || reduced.matches) return;
  played.add(element);
  const image = !mobile.matches && element.matches('.category-image');
  const frames = image ? [{clipPath:'inset(8% 0 8% 0)',opacity:.5},{clipPath:'inset(0)',opacity:1}] :
   [{opacity:0,transform:`translateY(${mobile.matches ? 12 : 30}px)`},{opacity:1,transform:'translateY(0)'}];
  animate(element,frames,{duration:mobile.matches?620:850,delay:mobile.matches?Math.min(delay,120):delay,easing:'cubic-bezier(.22,1,.36,1)'});
 }
 function start() {
  if (reduced.matches) return;
  [hero.querySelector('h1'),hero.querySelector('.hero-disciplines'),hero.querySelector('.hero-project-link')].forEach((el,i)=>reveal(el, i*90));
  if (mobile.matches) animate(hero.querySelector('.hero-person-motion img'),
   [{transform:'translateX(-50%) scale(1.035)'},{transform:'translateX(-50%) scale(1)'}],
   {duration:1100,easing:'cubic-bezier(.22,1,.36,1)'});
  const selector = mobile.matches ? '.content-header h2,.work-category,.about-content,.service-summary-grid > div,.service-actions,.contact-content' :
   '.content-header h2,.category-image,.work-category h3,.about-content,.service-summary-grid > div,.service-actions,.contact-content';
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
   entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    reveal(entry.target); observer.unobserve(entry.target);
   });
  },{threshold:.1});
  document.querySelectorAll(selector).forEach(el=>observer.observe(el));
 }
 if (document.documentElement.dataset.pageReady === 'true' || !document.documentElement.classList.contains('is-loading')) start();
 else addEventListener('portfolio:ready',start,{once:true});
 let frame=0;
 function render() {
  frame=0;
  const max=document.documentElement.scrollHeight-innerHeight;
  const progress=Math.max(0,Math.min(1,scrollY/Math.max(1,max)));
  bar.style.transform=`scaleX(${progress})`;
  if (!mobile.matches && !reduced.matches) {
   const rect=hero.getBoundingClientRect();
   const fade=Math.max(0,Math.min(1,-rect.top/Math.max(1,rect.height)));
   copy.style.opacity=String(1-Math.min(.9,fade*1.25));
  }
 }
 function schedule() { if (!frame) frame=requestAnimationFrame(render); }
 addEventListener('scroll',schedule,{passive:true}); addEventListener('resize',schedule,{passive:true});
 function resetAnimations() {
  animations.forEach(animation=>animation.cancel()); animations.clear();
  copy.style.removeProperty('opacity'); schedule();
 }
 reduced.addEventListener('change',resetAnimations); mobile.addEventListener('change',resetAnimations); schedule();
})();
