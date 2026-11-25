/* A short, non-blocking cue for critical content — never waits for embeds. */
(() => {
  const root = document.documentElement;
  let deadline;
  let finished = false;
  function finish() {
    finished = true;
    root.classList.remove('is-loading');
    clearTimeout(deadline);
  }
  addEventListener('pageshow', event => { if (event.persisted) finish(); });
  addEventListener('pagehide', finish);
  const firstImage = [...document.querySelectorAll('main img')].find(image => {
    const bounds = image.getBoundingClientRect();
    return bounds.top < innerHeight && bounds.bottom > 0;
  });
  const fonts = document.fonts;
  if ((!firstImage || firstImage.complete) && (!fonts || fonts.status === 'loaded')) return;
  root.classList.add('is-loading');
  deadline = setTimeout(finish, 1400);
  const imageReady = !firstImage || firstImage.complete ? Promise.resolve() : new Promise(resolve => {
    firstImage.addEventListener('load', resolve, {once: true});
    firstImage.addEventListener('error', resolve, {once: true});
  });
  Promise.all([imageReady, fonts ? fonts.ready : Promise.resolve()]).then(() => {
    if (!finished) finish();
  }, finish);
})();
