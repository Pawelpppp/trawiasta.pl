/*
 * Niewidoczne statystyki odwiedzin (GoatCounter, bez cookies).
 * Wymaga wcześniej /assets/statystyki-config.js.
 * Udostępnia window.trawiastaZdarzenie(nazwa, tytul) do liczenia zdarzeń.
 */
(function () {
  var cfg = window.TRAWIASTA_STATYSTYKI || {};
  var url = cfg.goatcounter || '';
  var kolejka = [];

  window.trawiastaZdarzenie = function (nazwa, tytul) {
    if (window.goatcounter && window.goatcounter.count) {
      try { window.goatcounter.count({ path: nazwa, title: tytul || nazwa, event: true }); } catch (e) {}
    } else {
      kolejka.push([nazwa, tytul]);
    }
  };

  var host = location.hostname;
  var lokalnie = host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host === '' ||
    /^192\.168\./.test(host) || /^10\./.test(host) || location.protocol === 'file:';
  if (!url || /TWOJ-KOD/.test(url) || lokalnie) return;

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://gc.zgo.at/count.js';
  s.setAttribute('data-goatcounter', url);
  s.onload = function () {
    var q = kolejka; kolejka = [];
    for (var i = 0; i < q.length; i++) window.trawiastaZdarzenie(q[i][0], q[i][1]);
  };
  document.head.appendChild(s);
})();
