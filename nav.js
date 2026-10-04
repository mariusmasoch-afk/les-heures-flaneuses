// nav.js — le soleil de la navbar suit l'heure réelle et glisse sous la rubrique survolée.
(function () {
  'use strict';
  var header = document.getElementById('site-header');
  if (!header) return;

  var BANDS = { morning: 'Matin', midday: 'Journée', evening: 'Soirée', night: 'Nuit' };
  var clock = document.getElementById('nav-clock');
  var timeEl = clock && clock.querySelector('.nav-time');
  var bandEl = clock && clock.querySelector('.nav-band');

  // Journée affichée de 5 h à 23 h sur toute la largeur de l'écran.
  function timeX() {
    var d = new Date();
    var h = d.getHours() + d.getMinutes() / 60;
    return 1.5 + Math.min(1, Math.max(0, (h - 5) / 18)) * 97 + '%';
  }

  function tick() {
    var d = new Date();
    if (timeEl) timeEl.textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    if (bandEl) bandEl.textContent = BANDS[document.documentElement.getAttribute('data-daytime')] || '';
    if (!hovering) header.style.setProperty('--sun-x', timeX());
  }

  var hovering = false;
  var links = header.querySelectorAll('.nav-link');

  function goTo(el) {
    var r = el.getBoundingClientRect();
    hovering = true;
    header.style.setProperty('--sun-x', (r.left + r.width / 2) + 'px');
  }
  function rest() { hovering = false; header.style.setProperty('--sun-x', timeX()); }

  links.forEach(function (a) {
    a.addEventListener('mouseenter', function () { goTo(a); });
    a.addEventListener('focus', function () { goTo(a); });
    a.addEventListener('mouseleave', rest);
    a.addEventListener('blur', rest);
  });

  var cat = new URLSearchParams(location.search).get('cat');
  if (cat && /categorie/.test(location.pathname)) {
    var cur = header.querySelector('.nav-link[data-cat="' + cat + '"]');
    if (cur) cur.setAttribute('aria-current', 'page');
  }

  function onScroll() { header.classList.toggle('is-condensed', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  tick();
  setInterval(tick, 30000);
})();
