// nav.js — le soleil de la navbar suit l'heure réelle et glisse sous la rubrique survolée ;
// un panneau de sous-rubriques "se lève" depuis le soleil (clip-path circulaire + halo + éléments qui montent).
(function () {
  'use strict';
  var header = document.getElementById('site-header');
  if (!header) return;

  var BANDS = { morning: 'Matin', midday: 'Journée', evening: 'Soirée', night: 'Nuit' };
  var SUBS = window.SUBCATS || {};
  var SUPABASE_URL = 'https://yrgylnmhqcimwgmjponj.supabase.co';
  var SUPABASE_ANON = 'sb_publishable__SdwJpIWNVfPfVNX7eFc-w_mQA8av6H';

  var clock = document.getElementById('nav-clock');
  var timeEl = clock && clock.querySelector('.nav-time');
  var bandEl = clock && clock.querySelector('.nav-band');
  var panel = document.getElementById('nav-panel');
  var links = header.querySelectorAll('.nav-link');
  var hovering = false, panelOpen = false, openTimer = null, closeTimer = null;

  var params = new URLSearchParams(location.search);
  var curCat = /categorie/.test(location.pathname) ? params.get('cat') : null;
  var curSub = curCat ? params.get('sub') : null;

  /* ---------- Soleil : heure réelle + glisse sous le lien ---------- */
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
  function goTo(el) {
    var r = el.getBoundingClientRect();
    hovering = true;
    header.style.setProperty('--sun-x', (r.left + r.width / 2) + 'px');
  }
  function rest() { hovering = false; header.style.setProperty('--sun-x', timeX()); }

  /* ---------- Panneau de sous-rubriques ---------- */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function subUrl(cat, id) { return 'categorie.html?cat=' + cat + '&sub=' + id; }

  function buildPanel() {
    if (!panel) return;
    var html = '<div class="np-glow"></div><div class="max-w-7xl mx-auto px-4 sm:px-6">';
    Object.keys(SUBS).forEach(function (cat) {
      var c = SUBS[cat];
      html += '<section class="np-section" data-cat="' + cat + '" aria-label="' + esc(c.label) + '">'
        + '<div class="np-intro"><p class="np-eyebrow">Rubrique</p>'
        + '<a class="np-title font-display" href="categorie.html?cat=' + cat + '">' + esc(c.label) + '</a>'
        + '<p class="np-desc">' + esc(c.desc) + '</p>'
        + '<a class="np-all" href="categorie.html?cat=' + cat + '">Tous les articles <span aria-hidden="true">→</span></a></div>'
        + '<ul class="np-subs">';
      c.subs.forEach(function (s, i) {
        html += '<li style="--i:' + i + '" data-sub="' + s.id + '"><a href="' + subUrl(cat, s.id) + '"'
          + (curCat === cat && curSub === s.id ? ' aria-current="page"' : '') + '>'
          + '<span class="np-sub-top"><span class="np-sub-label font-display">' + esc(s.label) + '</span><span class="np-sub-count" data-count></span></span>'
          + '<span class="np-sub-desc">' + esc(s.desc) + '</span></a></li>';
      });
      html += '</ul></section>';
    });
    panel.innerHTML = html + '</div>';
  }

  function openFor(cat, link) {
    if (!panel || !SUBS[cat]) return;
    panel.querySelectorAll('.np-section').forEach(function (s) { s.classList.toggle('is-active', s.getAttribute('data-cat') === cat); });
    if (link) goTo(link);
    panelOpen = true;
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    header.classList.add('panel-open');
    links.forEach(function (a) { a.setAttribute('aria-expanded', String(a.getAttribute('data-cat') === cat)); });
  }
  function closePanel() {
    clearTimeout(openTimer);
    if (!panelOpen) return;
    panelOpen = false;
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    header.classList.remove('panel-open');
    links.forEach(function (a) { a.setAttribute('aria-expanded', 'false'); });
    rest();
  }

  links.forEach(function (a) {
    var cat = a.getAttribute('data-cat');
    a.setAttribute('aria-haspopup', 'true');
    a.setAttribute('aria-expanded', 'false');
    a.addEventListener('mouseenter', function () {
      clearTimeout(closeTimer);
      goTo(a);
      clearTimeout(openTimer);
      openTimer = setTimeout(function () { openFor(cat, a); }, panelOpen ? 0 : 220);
    });
    a.addEventListener('focus', function () { goTo(a); });
    a.addEventListener('mouseleave', function () { clearTimeout(openTimer); if (!panelOpen) rest(); });
    a.addEventListener('blur', function () { if (!panelOpen) rest(); });
    a.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        openFor(cat, a);
        var first = panel.querySelector('.np-section.is-active .np-subs a');
        if (first) first.focus();
      }
    });
  });

  header.addEventListener('mouseleave', function () { clearTimeout(openTimer); closeTimer = setTimeout(closePanel, 160); });
  header.addEventListener('mouseenter', function () { clearTimeout(closeTimer); });
  header.addEventListener('mouseover', function (e) {
    if (panelOpen && e.target.closest && e.target.closest('.nc-top')) closePanel();
  });
  header.addEventListener('focusout', function (e) {
    if (panelOpen && e.relatedTarget && !header.contains(e.relatedTarget)) closePanel();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panelOpen) {
      var cat = panel.querySelector('.np-section.is-active');
      closePanel();
      var back = cat && header.querySelector('.nav-link[data-cat="' + cat.getAttribute('data-cat') + '"]');
      if (back) back.focus();
    }
  });

  /* ---------- Compteurs d'articles par sous-rubrique (cache 10 min) ---------- */
  function applyCounts(counts) {
    document.querySelectorAll('[data-cat] .np-subs li, #mobile-menu .mm-subs li').forEach(function (li) {
      var cat = li.closest('[data-cat]').getAttribute('data-cat');
      var n = (counts[cat] && counts[cat][li.getAttribute('data-sub')]) || 0;
      li.hidden = n === 0;
      var c = li.querySelector('[data-count]');
      if (c) c.textContent = n || '';
    });
  }
  function loadCounts() {
    var cached = null;
    try { cached = JSON.parse(sessionStorage.getItem('lhf_subcounts') || 'null'); } catch (e) {}
    if (cached && Date.now() - cached.t < 600000) { applyCounts(cached.c); return; }
    fetch(SUPABASE_URL + '/rest/v1/articles?select=categorie,sous_categorie&statut=eq.publi%C3%A9', {
      headers: { apikey: SUPABASE_ANON, Authorization: 'Bearer ' + SUPABASE_ANON }
    }).then(function (r) { return r.json(); }).then(function (rows) {
      if (!Array.isArray(rows)) return;
      var counts = {};
      rows.forEach(function (a) {
        if (!a.categorie || !a.sous_categorie) return;
        counts[a.categorie] = counts[a.categorie] || {};
        counts[a.categorie][a.sous_categorie] = (counts[a.categorie][a.sous_categorie] || 0) + 1;
      });
      try { sessionStorage.setItem('lhf_subcounts', JSON.stringify({ t: Date.now(), c: counts })); } catch (e) {}
      applyCounts(counts);
    }).catch(function () {});
  }

  /* ---------- Menu mobile : rubriques dépliables ---------- */
  function buildMobileMenu() {
    var m = document.getElementById('mobile-menu');
    if (!m || !Object.keys(SUBS).length) return;
    var sub = m.querySelector('a[href*="newsletter"]');
    var subHref = sub ? sub.getAttribute('href') : '/#newsletter';
    var html = '';
    Object.keys(SUBS).forEach(function (cat) {
      var c = SUBS[cat];
      html += '<div class="mm-group" data-cat="' + cat + '"><div class="mm-row"><a href="categorie.html?cat=' + cat + '">' + esc(c.label) + '</a>'
        + '<button type="button" class="mm-toggle" aria-expanded="false" aria-label="Sous-rubriques : ' + esc(c.label) + '"><span aria-hidden="true">+</span></button></div>'
        + '<ul class="mm-subs">';
      c.subs.forEach(function (s) {
        html += '<li data-sub="' + s.id + '"><a href="' + subUrl(cat, s.id) + '">' + esc(s.label) + ' <span class="np-sub-count" data-count></span></a></li>';
      });
      html += '</ul></div>';
    });
    html += '<a href="' + subHref + '" class="mm-cta">S\'abonner</a>';
    m.innerHTML = html;
    m.querySelectorAll('.mm-toggle').forEach(function (b) {
      b.addEventListener('click', function () {
        var ul = b.closest('.mm-group').querySelector('.mm-subs');
        var open = b.getAttribute('aria-expanded') !== 'true';
        b.setAttribute('aria-expanded', String(open));
        b.firstElementChild.textContent = open ? '−' : '+';
        ul.style.maxHeight = open ? ul.scrollHeight + 'px' : '0px';
      });
    });
  }

  buildPanel();
  buildMobileMenu();
  loadCounts();

  if (curCat) {
    var cur = header.querySelector('.nav-link[data-cat="' + curCat + '"]');
    if (cur) cur.setAttribute('aria-current', 'page');
  }

  function onScroll() { header.classList.toggle('is-condensed', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  tick();
  setInterval(tick, 30000);
})();
