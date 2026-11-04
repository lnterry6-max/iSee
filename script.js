'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const menuButton = $('.menu-toggle');
const mobileMenu = $('#mobile-menu');
function closeMenu() {
  if (!menuButton || !mobileMenu) return;
  mobileMenu.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
}
if (menuButton && mobileMenu) {
  menuButton.addEventListener('click', () => {
    const opening = mobileMenu.hidden;
    mobileMenu.hidden = !opening;
    menuButton.setAttribute('aria-expanded', String(opening));
    menuButton.setAttribute('aria-label', opening ? 'Close navigation' : 'Open navigation');
  });
  $$('a', mobileMenu).forEach(link => link.addEventListener('click', closeMenu));
  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeMenu();
  });
}

const finishNames = {
  natural: 'Natural Metal',
  graphite: 'Graphite',
  sky: 'Soft Sky · Air direction',
  coral: 'Soft Coral · Air direction'
};
$$('.swatch').forEach(button => {
  button.addEventListener('click', () => {
    const finish = button.dataset.finish;
    if (!(finish in finishNames)) return;
    $$('.swatch').forEach(other => {
      const active = other === button;
      other.classList.toggle('active', active);
      other.setAttribute('aria-pressed', String(active));
    });
    $('#finish-name').textContent = finishNames[finish];
    $('.design-picture').dataset.finishPreview = finish;
  });
});

const modeDescriptions = {
  natural: 'Natural: preserve the scene and save an untouched original.',
  soft: 'Soft: separate the subject and soften the surroundings to draw the eye.',
  clean: 'Clean: preview a conceptual AI-assisted background removal. The original stays untouched.'
};
$$('.mode-button').forEach(button => {
  button.addEventListener('click', () => {
    const mode = button.dataset.mode;
    if (!(mode in modeDescriptions)) return;
    $$('.mode-button').forEach(other => {
      const active = other === button;
      other.classList.toggle('active', active);
      other.setAttribute('aria-pressed', String(active));
    });
    $('#scene').dataset.mode = mode;
    $('#scene-bottom').textContent = {natural:'ORIGINAL VIEW',soft:'SOFT BACKGROUND',clean:'CLEAN PREVIEW'}[mode];
    $('#mode-explainer').textContent = modeDescriptions[mode];
  });
});

$('#grid-toggle').addEventListener('change', event => {
  $('#vf-grid').classList.toggle('hidden', !event.target.checked);
});
$('#minimal-toggle').addEventListener('change', event => {
  $('#os-viewfinder').classList.toggle('minimal', event.target.checked);
});

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, {threshold: .08});
  $$('.reveal').forEach(element => observer.observe(element));
} else {
  $$('.reveal').forEach(element => element.classList.add('visible'));
}