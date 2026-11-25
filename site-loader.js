/* Propeller entry: first paint is covered; third-party embeds never hold it open. */
(() => {
 const root = document.documentElement;
 if (root.dataset.pageReady === 'true') return;
 const started = Number(root.dataset.loadStarted) || Date.now();
 let deadline; let revealTimer; let finished = false;
 function finish() {
  if (finished) return;
  finished = true;
  clearTimeout(deadline); clearTimeout(revealTimer);
  root.dataset.pageReady = 'true';
  root.classList.remove('is-loading');
  dispatchEvent(new Event('portfolio:ready'));
 }
 addEventListener('pageshow', event => { if (event.persisted) finish(); });
 addEventListener('pagehide', finish);
 root.classList.add('is-loading');
 deadline = setTimeout(finish, Math.max(0, 2400 - (Date.now() - started)));
 const firstImage = [...document.querySelectorAll('main img')].find(image => {
  const bounds = image.getBoundingClientRect();
  return bounds.top < innerHeight && bounds.bottom > 0;
 });
 const imageReady = !firstImage || firstImage.complete ? Promise.resolve() : new Promise(resolve => {
  firstImage.addEventListener('load', resolve, {once:true});
  firstImage.addEventListener('error', resolve, {once:true});
 });
 Promise.all([imageReady, document.fonts ? document.fonts.ready : Promise.resolve()]).then(() => {
  if (finished) return;
  revealTimer = setTimeout(finish, Math.max(0, 800 - (Date.now() - started)));
 }, finish);
})();
