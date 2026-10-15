Dès que tu fais un nouveau brouillon de démarchage, tu l'intègres au excel de suivi

Dès que tu fais une action sur une collaboration, tu fais une mise à jour du excel de suivi 
## Règles pour les mails de démarchage
- Expéditeur : toujours contact@lesheuresflaneuses.fr (adresse par défaut dans Gmail depuis le 29/09 ; vérifier que le brouillon affiche bien cet expéditeur).
- Création des brouillons : TOUJOURS via le script `scripts/gmail_drafts.py` (API Gmail officielle), jamais via le connecteur Gmail (create_draft/update_draft), qui réécrit les liens en redirections google.com/url expirant sous 24 h. Procédure : écrire `outreach/drafts.json` (liste de {to, subject, body}), puis `python3 scripts/gmail_drafts.py outreach/drafts.json --replace`. Dans le body, `[[texte|URL]]` crée un lien ; la ligne de signature « Les Heures Flâneuses » est liée automatiquement au site. Jeton OAuth déjà en place dans `outreach/` (ignoré par git) ; si l'autorisation a expiré, le script rouvre la fenêtre Google. Le connecteur Gmail reste utilisable pour LIRE les mails/brouillons.
- Liens obligatoires dans chaque mail : « Baltic Hermétique Tourer » (article) pointe vers https://lesheuresflaneuses.fr/article.html?slug=avis-baltic-hermetique-tourer-beige-notre-test-honnete ; la signature « Les Heures Flâneuses » pointe vers https://lesheuresflaneuses.fr. Pas d'autre lien ni URL affichée en clair (liens uniquement sous forme de texte cliquable).
- Finir par « Bien à vous, » (ou « Best regards, » en anglais), puis la signature texte :
  Marius Masoch - Fondateur
  Les Heures Flâneuses
- Jamais de mention de « sport », ni de « photos réutilisables », ni d'« aperçu IA ». Ne PAS proposer spontanément le media kit ou des exemples d'articles. Ne jamais deviner une adresse email : utiliser une adresse trouvée sur une page officielle ou fournie par Marius.
- Template : v4 (validé par Marius le 12/10, remplace le v3). Ton d'égal à égal, complet, pas quémandeur. Structure :
  1. Présentation du blog : Marius, fondateur des Heures Flâneuses, média indépendant mode, tech, hôtels & voyages ; tests longs, en conditions réelles et sur plusieurs semaines, avec nos propres photos et un avis sans filtre, pensés pour répondre à la question du lecteur avant d'acheter.
  2. Durabilité / preuve : nos articles ne sont pas faits pour un pic de 24h, ils sont référencés sur Google et lus longtemps après publication ; preuve : notre avis sur la Baltic Hermétique Tourer est en première page sur « avis baltic hermétique ». Visibilité durable sur le nom même du produit.
  3. Pourquoi CE produit (personnalisé, précis : ce qui rend le produit intéressant + ce qu'on testerait concrètement).
  4. Proposition simple : « dotation produit » (FR) / « product to review, complimentary unit » (EN) en échange d'un article de test complet et honnête. Préciser : aucune commission ni facturation de part et d'autre, le produit est la seule contrepartie ; contenu éditorial (on dit ce qui marche et ce qui marche moins bien) ; transmission de l'article à la publication.
  5. CTA fermé : « Seriez-vous ouverts à une dotation du [produit] pour ce test ? »

  Exemple FR (Garmin CIRQA) :
  Objet : Les Heures Flâneuses × [Marque] : un test du [produit] dans la durée

  Bonjour [Prénom / rien si adresse générique],

  Je me présente : Marius, fondateur des Heures Flâneuses, un média indépendant consacré à la mode, à la tech et aux hôtels & voyages. Nous publions des tests longs, réalisés en conditions réelles et sur plusieurs semaines, avec nos propres photos et un avis sans filtre, pour répondre à la question que se pose le lecteur avant d'acheter.

  Nos articles ne sont pas conçus pour un pic d'attention de 24h. Ils sont référencés sur Google et continuent d'être lus longtemps après leur publication : notre avis sur la Baltic Hermétique Tourer, par exemple, est en première page sur « avis baltic hermétique ». C'est cette visibilité durable, sur le nom même du produit, que nous apportons aux marques avec lesquelles nous travaillons.

  Le [produit] nous intéresse particulièrement : [ce qui le rend intéressant]. Nous aimerions le tester au quotidien ([critères]) pour en tirer un avis détaillé.

  Notre proposition est simple : une dotation produit (un [produit] à tester) en échange d'un article de test complet et honnête. Aucune commission ni facturation de part et d'autre, le produit est la seule contrepartie. Le contenu reste éditorial : nous disons ce qui fonctionne et ce qui fonctionne moins bien. À la publication, je vous transmets l'article.

  Seriez-vous ouverts à une dotation du [produit] pour ce test ?

  Bien à vous,
  Marius Masoch - Fondateur
  Les Heures Flâneuses

  Version EN : même structure, objet « [Brand] x Les Heures Flâneuses: a long-term test of the [product] », « product to review (complimentary unit) » à la place de « dotation », CTA « Would you be open to providing a [product] for this review? », « Best regards, ».

## Obligation légale : mention des produits offerts
- Tout article portant sur un produit offert, prêté ou rémunéré DOIT afficher la mention légale en haut de l'article (encadré « Produit offert / prêté / Contenu sponsorisé »). Elle est pilotée par les colonnes `type_partenariat` ('offert' | 'pret' | 'remunere', NULL = achat personnel) et `partenaire` (nom de la marque) de la table `articles` ; le sélecteur « Partenariat » de l'admin les renseigne.
- Quand je crée ou modifie un article (SQL ou admin), je renseigne toujours ces deux champs si la marque a fourni le produit, et je mentionne aussi la dotation dans le texte (ex. « offerte par [marque] pour ce test »).
- Quand une dotation est confirmée dans l'Excel (Collaboration en cours), je le rappelle pour l'article correspondant. Ne jamais publier un article de produit offert sans cette mention.
