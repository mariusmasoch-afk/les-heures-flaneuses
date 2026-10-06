// subcats.js — rubriques et sous-rubriques du site (source unique : navbar, pages catégorie, admin).
// Une rubrique de navigation regroupe une ou plusieurs catégories d'articles (articles.categorie : mode, hotels, sport)
// et ses sous-rubriques correspondent à articles.sous_categorie.
window.SUBCATS = {
  lifestyle: {
    label: 'Lifestyle',
    desc: 'Montres, accessoires, escapades et loisirs : ce qui rend le quotidien plus beau.',
    cats: ['mode', 'hotels'],
    subs: [
      { id: 'hotels',      label: 'Hôtels',      desc: 'Nos coups de cœur pour dormir et séjourner.' },
      { id: 'montres',     label: 'Montres',     desc: 'Tests, guides de taille et conseils d’entretien.' },
      { id: 'accessoires', label: 'Accessoires', desc: 'Bracelets, soins et petites pièces du quotidien.' },
      { id: 'loisirs',     label: 'Loisirs',     desc: 'Escapades, sorties et guides pratiques.' }
    ]
  },
  sport: {
    label: 'Tech',
    desc: 'Des outils et des objets connectés, testés pour de vrai.',
    cats: ['sport'],
    subs: [
      { id: 'ia-outils',        label: 'IA & outils',      desc: 'Des outils pour mieux utiliser sa technologie.' },
      { id: 'veille-techno',    label: 'Veille techno',    desc: 'Smartphones et nouveautés : ce qui change vraiment.' },
      { id: 'objets-connectes', label: 'Objets connectés', desc: 'Montres, écouteurs et capteurs testés.' }
    ]
  }
};

// Rubrique de navigation qui contient une catégorie d'article (ex. 'mode' → 'lifestyle')
window.groupOfCat = function (cat) {
  var keys = Object.keys(window.SUBCATS);
  for (var i = 0; i < keys.length; i++) {
    var g = window.SUBCATS[keys[i]];
    if (keys[i] === cat || g.cats.indexOf(cat) !== -1) return keys[i];
  }
  return null;
};
