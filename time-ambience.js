// time-ambience.js — "Les Heures" prises au mot : l'ambiance du site dérive
// selon l'heure réelle du visiteur plutôt qu'un simple bouton jour/nuit.
(function () {
  'use strict';

  function band(hour) {
    if (hour >= 5 && hour < 11)  return 'morning';
    if (hour >= 11 && hour < 17) return 'midday';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  function apply() {
    document.documentElement.setAttribute('data-daytime', band(new Date().getHours()));
  }

  apply();
  // Revérifie régulièrement pour capter un changement de tranche horaire
  // pendant qu'un onglet reste ouvert (peu coûteux, pas besoin de plus fréquent).
  setInterval(apply, 5 * 60 * 1000);
})();
