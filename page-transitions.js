/* Reuse the homepage seam only at photographic boundaries. */
(() => {
  const targets = document.querySelectorAll('#festival-videos,#planet-festival-tour-2026,#aerial-footage');
  targets.forEach(section => {
    if (section.previousElementSibling?.classList.contains('photo-transition-seam')) return;
    const seam = document.createElement('div');
    seam.className = 'photo-transition-seam';
    seam.setAttribute('aria-hidden','true');
    section.before(seam);
  });
  // A footer can also mark the end of a photo, including single-section pages.
  const footer = document.querySelector('.site-footer');
  if (!footer || footer.previousElementSibling?.classList.contains('photo-transition-seam')) return;
  const main = document.querySelector('main');
  if (!main || !main.querySelector('#fpv-content,#festival-content,.project-section,.live-productions-page')) return;
  const seam = document.createElement('div');
  seam.className = 'photo-transition-seam';
  seam.setAttribute('aria-hidden','true');
  footer.before(seam);
})();
