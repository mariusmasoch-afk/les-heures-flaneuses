// subcats.js — rubriques et sous-rubriques du site (source unique : navbar, pages catégorie, admin).
// La clé de rubrique est celle stockée dans articles.categorie ; l'id d'une sous-rubrique est celui de articles.sous_categorie.
window.SUBCATS = {
  mode: {
    label: 'Mode',
    desc: 'Des pièces choisies pour durer, testées et racontées sans filtre.',
    subs: [
      { id: 'montres',     label: 'Montres',           desc: 'Tests, guides de taille et de style.' },
      { id: 'accessoires', label: 'Accessoires',       desc: 'Bracelets et petites pièces du quotidien.' },
      { id: 'soins',       label: 'Soins & entretien', desc: 'Faire durer ses montres et ses chaussures.' }
    ]
  },
  sport: {
    label: 'Tech',
    desc: 'Des objets connectés et des idées pour mieux les utiliser.',
    subs: [
      { id: 'smartphones',         label: 'Smartphones',         desc: 'Réparables, originaux, durables.' },
      { id: 'sport-connecte',      label: 'Sport connecté',      desc: 'Montres GPS et capteurs pour courir mieux.' },
      { id: 'audio',               label: 'Audio',               desc: 'Écouteurs et casques, sans se tromper.' },
      { id: 'bien-etre-numerique', label: 'Bien-être numérique', desc: 'Reprendre la main sur ses écrans.' }
    ]
  },
  hotels: {
    label: 'Hôtels & Voyages',
    desc: 'Escapades, adresses et conseils pour partir l’esprit léger.',
    subs: [
      { id: 'escapades',    label: 'Escapades',        desc: 'Week-ends et city trips, itinéraires prêts à partir.' },
      { id: 'parcs',        label: 'Parcs & sorties',  desc: 'Visites et sorties : nos retours et conseils.' },
      { id: 'bien-voyager', label: 'Bien voyager',     desc: 'Valise, applis et astuces pour voyager léger.' },
      { id: 'adresses',     label: 'Hôtels & adresses', desc: 'Nos coups de cœur pour dormir et séjourner.' }
    ]
  }
};
