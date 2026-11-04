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

// Phase 2.1: improve mobile navigation, reading feedback, and cameraOS exploration.
if (menuButton && mobileMenu) {
  document.addEventListener('pointerdown', event => {
    if (!mobileMenu.hidden && !mobileMenu.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
  });
  mobileMenu.addEventListener('keydown', event => {
    if (event.key === 'Tab' && event.shiftKey && event.target === mobileMenu.querySelector('a')) {
      event.preventDefault();
      menuButton.focus();
    }
  });
}

const progressBar = $('#read-progress-bar');
let scrollPending = false;
function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(100, Math.max(0, window.scrollY / scrollable * 100)) : 0;
  if (progressBar) progressBar.style.width = progress.toFixed(2) + '%';
  scrollPending = false;
}
window.addEventListener('scroll', () => {
  if (!scrollPending) {
    scrollPending = true;
    requestAnimationFrame(updateProgress);
  }
}, {passive:true});
window.addEventListener('resize', updateProgress, {passive:true});
updateProgress();

const shutterButton = $('#shutter-button');
const galleryButton = $('#gallery-button');
const galleryDialog = $('#capture-dialog');
const cameraStatus = $('#os-status');
let captures = 0;
let flashTimer;
function showCapturedImage() {
  if (!galleryDialog) return;
  if (typeof galleryDialog.showModal === 'function') galleryDialog.showModal();
  else galleryDialog.setAttribute('open','');
}
if (shutterButton && galleryButton && cameraStatus) {
  shutterButton.addEventListener('click', () => {
    captures += 1;
    $('#photo-count').textContent = String(captures);
    galleryButton.disabled = false;
    cameraStatus.textContent = captures === 1
      ? 'Concept photograph saved. Open the gallery to view it.'
      : captures + ' simulated photographs captured. Open the gallery.';
    const cameraBody = $('.os-device');
    cameraBody.classList.remove('is-capturing');
    void cameraBody.offsetWidth;
    cameraBody.classList.add('is-capturing');
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => cameraBody.classList.remove('is-capturing'), 400);
  });
  galleryButton.addEventListener('click', showCapturedImage);
  ['#close-preview','#close-preview-bottom'].forEach(id => {
    $(id)?.addEventListener('click', () => {
      if (typeof galleryDialog.close === 'function') galleryDialog.close();
      else galleryDialog.removeAttribute('open');
    });
  });
  galleryDialog?.addEventListener('click', event => {
    if (event.target === galleryDialog) galleryDialog.close();
  });
}
