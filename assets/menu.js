/* trawiasta.pl – wspólne menu (hamburger). Wstawia się samo; jeśli strona ma
   element [data-site-menu], menu trafia do niego (w nagłówku), inaczej jest
   przypięte w prawym górnym rogu. */
(function () {
  var LINKS = [
    ['/', 'Strona główna'],
    ['/energia/', 'Energia'],
    ['/gra/', 'Gra'],
    ['/licznik/', 'Licznik'],
    ['/logowanie/', 'Logowanie']
  ];
  function norm(p) { p = (p || '/').replace(/index\.html$/, ''); return p.charAt(p.length - 1) === '/' ? p : p + '/'; }
  function init() {
    if (document.getElementById('menuToggle')) return;
    var here = norm(location.pathname);
    var nav = document.createElement('nav');
    nav.className = 'site-menu';
    nav.setAttribute('aria-label', 'Menu główne');
    var items = LINKS.map(function (l) {
      return '<li><a href="' + l[0] + '"' + (norm(l[0]) === here ? ' aria-current="page"' : '') + '>' + l[1] + '</a></li>';
    }).join('');
    nav.innerHTML =
      '<button type="button" class="menu-toggle" id="menuToggle" aria-expanded="false" aria-controls="menuPanel" aria-label="Otwórz menu">' +
      '<span class="menu-icon" aria-hidden="true"></span></button>' +
      '<div class="menu-panel" id="menuPanel"><ul>' + items + '</ul></div>';
    var slot = document.querySelector('[data-site-menu]');
    if (slot) { nav.classList.add('inline'); slot.appendChild(nav); }
    else document.body.insertBefore(nav, document.body.firstChild);

    var btn = nav.querySelector('#menuToggle');
    var panel = nav.querySelector('#menuPanel');
    function isOpen() { return btn.getAttribute('aria-expanded') === 'true'; }
    function setOpen(open, focusBtn) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
      panel.classList.toggle('open', open);
      if (open) { var first = panel.querySelector('a'); if (first) first.focus(); }
      else if (focusBtn) btn.focus();
    }
    btn.addEventListener('click', function () { setOpen(!isOpen()); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) setOpen(false, true);
    });
    document.addEventListener('click', function (e) {
      if (isOpen() && !nav.contains(e.target)) setOpen(false);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
