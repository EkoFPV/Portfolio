/* Progressive enhancement: content and links work without JavaScript. */
document.documentElement.classList.add('js');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');
const backdrop = document.querySelector('.menu-backdrop');
const submenuButton = document.querySelector('.submenu-toggle');
const submenu = document.querySelector('#portfolio-links');
const mobile = window.matchMedia('(max-width: 900px)');
const main = document.querySelector('main');
const footer = document.querySelector('.site-footer');
function setSubmenu(open) {
  submenuButton.setAttribute('aria-expanded', String(open));
  submenu.classList.toggle('is-open', open);
  submenuButton.querySelector('span').textContent = open ? '−' : '+';
}
function setMenu(open, restoreFocus = false) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.querySelector('.menu-label').textContent = open ? 'Schließen' : 'Menü';
  nav.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open);
  backdrop.hidden = !open;
  [main, footer].forEach(el => { if (el) el.inert = open; });
  if (!open) setSubmenu(false);
  if (open) nav.querySelector('a').focus();
  else if (restoreFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
submenuButton.addEventListener('click', () => setSubmenu(submenuButton.getAttribute('aria-expanded') !== 'true'));
const portfolioMenu = document.querySelector('.portfolio-menu');
portfolioMenu.addEventListener('pointerenter', event => {
  if (!mobile.matches && event.pointerType === 'mouse') setSubmenu(true);
});
portfolioMenu.addEventListener('pointerleave', event => {
  if (!mobile.matches && event.pointerType === 'mouse' && !portfolioMenu.contains(document.activeElement)) setSubmenu(false);
});
backdrop.addEventListener('click', () => setMenu(false, true));
nav.addEventListener('click', event => {
  if (event.target.closest('a')) {
    const wasOpen = menuButton.getAttribute('aria-expanded') === 'true';
    setMenu(false);
    if (wasOpen) {
      const url = new URL(event.target.closest('a').href, location.href);
      if (url.pathname === location.pathname && url.hash) {
        const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
        if (target) { target.tabIndex = -1; target.focus({ preventScroll: true }); }
      }
    }
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.portfolio-menu')) setSubmenu(false);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (submenuButton.getAttribute('aria-expanded') === 'true') {
      setSubmenu(false); submenuButton.focus();
    } else if (menuButton.getAttribute('aria-expanded') === 'true') {
      setMenu(false, true);
    }
  }
  if (event.key === 'Tab' && mobile.matches && menuButton.getAttribute('aria-expanded') === 'true') {
    const focusable = [menuButton, ...nav.querySelectorAll('a,button')].filter(el => el.getClientRects().length);
    const first = focusable[0]; const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
nav.addEventListener('focusout', event => {
  if (!mobile.matches && !nav.contains(event.relatedTarget)) setSubmenu(false);
});
mobile.addEventListener('change', () => {
  const focused = document.activeElement;
  const focusWasInNav = nav.contains(focused);
  const focusWasInSubmenu = submenu.contains(focused);
  const focusWasMenuButton = focused === menuButton;
  setMenu(false);
  if (mobile.matches && focusWasInNav) {
    menuButton.focus();
  } else if (!mobile.matches && focusWasInSubmenu) {
    submenuButton.focus();
  } else if (!mobile.matches && focusWasMenuButton) {
    nav.querySelector('a').focus();
  }
});

/* Keep large festival collections light until a viewer chooses a film. */
document.querySelectorAll('[data-youtube]').forEach(link => {
  link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const frame = document.createElement('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(link.dataset.youtube)}?autoplay=1&rel=0`;
    if (link.dataset.start) frame.src += `&start=${encodeURIComponent(link.dataset.start)}`;
    frame.title = link.dataset.title;
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    link.replaceWith(frame);
    frame.focus();
  });
});
