#!/usr/bin/env python3
"""Régénère sitemap.xml à partir des articles publiés dans Supabase.

Principes (bonnes pratiques Google) :
- uniquement des URLs canoniques et indexables (pas d'anciennes rubriques redirigées, pas de pages légales) ;
- <lastmod> toujours réel : date de dernière modification d'un article, ou de l'article le plus récent
  pour les pages de rubrique et l'accueil (jamais « la date du jour ») ;
- pas de <priority> ni <changefreq> : Google les ignore ;
- sitemap d'images : la couverture de chaque article est déclarée dans son <url>.
Les publications se font côté Supabase (jamais via git) : c'est le workflow planifié qui garde le sitemap à jour.
"""
import json
import ssl
import urllib.request
from datetime import datetime, timezone
from xml.sax.saxutils import escape

SUPABASE_URL = "https://yrgylnmhqcimwgmjponj.supabase.co"
SUPABASE_ANON = "sb_publishable__SdwJpIWNVfPfVNX7eFc-w_mQA8av6H"
SITE = "https://lesheuresflaneuses.fr"
OUT_PATH = "sitemap.xml"

# Rubrique de navigation -> catégories d'articles qu'elle regroupe (doit refléter subcats.js)
GROUPS = {
    "lifestyle": ["mode", "hotels"],
    "sport": ["sport"],  # « Tech » (clé historique conservée pour les URLs déjà indexées)
}
# Sous-rubrique -> rubrique de navigation (doit refléter subcats.js)
SUB_GROUP = {
    "hotels": "lifestyle", "montres": "lifestyle", "accessoires": "lifestyle", "loisirs": "lifestyle",
    "ia-outils": "sport", "veille-techno": "sport", "objets-connectes": "sport",
}
# Pages utiles sans date de modification fiable : on omet <lastmod> plutôt que d'en inventer une
UTILITY_PAGES = ["contact.html", "ecrire.html"]


def fetch_articles():
    url = (
        f"{SUPABASE_URL}/rest/v1/articles"
        "?select=slug,categorie,sous_categorie,image_url,date_creation,date_modification"
        "&statut=eq.publi%C3%A9"
        "&order=date_creation.desc"
    )
    req = urllib.request.Request(
        url,
        headers={"apikey": SUPABASE_ANON, "Authorization": f"Bearer {SUPABASE_ANON}"},
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.URLError as exc:
        # Certificats système absents/incomplets (fréquent avec python.org sur macOS) :
        # on retente avec le magasin de certificats de certifi si disponible.
        if isinstance(exc.reason, ssl.SSLCertVerificationError):
            import certifi
            ctx = ssl.create_default_context(cafile=certifi.where())
            with urllib.request.urlopen(req, context=ctx, timeout=20) as resp:
                return json.loads(resp.read().decode("utf-8"))
        raise


def day(value):
    """'2026-09-28T10:00:00+00:00' -> '2026-09-28' (ou '' si absent)."""
    return value[:10] if value else ""


def article_lastmod(a):
    return max(day(a.get("date_modification")), day(a.get("date_creation")))


def url_block(loc, lastmod="", image=""):
    lines = ["  <url>", f"    <loc>{escape(loc)}</loc>"]
    if lastmod:
        lines.append(f"    <lastmod>{lastmod}</lastmod>")
    if image.startswith("https://"):
        lines.append(f"    <image:image><image:loc>{escape(image)}</image:loc></image:image>")
    lines.append("  </url>")
    return "\n".join(lines)


def build_xml(articles):
    articles = [a for a in articles if a.get("slug")]
    blocks = []

    # Accueil : dernière publication ou mise à jour
    blocks.append(url_block(f"{SITE}/", max((article_lastmod(a) for a in articles), default="")))

    # Rubriques (une page par rubrique de navigation) puis sous-rubriques non vides
    for group, cats in GROUPS.items():
        lm = max((article_lastmod(a) for a in articles if a.get("categorie") in cats), default="")
        if lm:
            blocks.append(url_block(f"{SITE}/categorie.html?cat={group}", lm))
    subs = {}
    for a in articles:
        sub = a.get("sous_categorie")
        if sub in SUB_GROUP:
            subs[sub] = max(subs.get(sub, ""), article_lastmod(a))
    for sub in sorted(subs):
        blocks.append(url_block(f"{SITE}/categorie.html?cat={SUB_GROUP[sub]}&sub={sub}", subs[sub]))

    # Articles
    seen = set()
    for a in articles:
        slug = a["slug"]
        if slug in seen:
            continue
        seen.add(slug)
        blocks.append(url_block(f"{SITE}/article.html?slug={slug}", article_lastmod(a), a.get("image_url") or ""))

    # Pages utiles
    for page in UTILITY_PAGES:
        blocks.append(url_block(f"{SITE}/{page}"))

    header = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
        'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'
    )
    return header + "\n".join(blocks) + "\n</urlset>\n"


def main():
    try:
        articles = fetch_articles()
    except Exception as exc:
        print(f"Erreur lors de la récupération des articles Supabase : {exc}")
        raise SystemExit(1)

    xml = build_xml(articles)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        f.write(xml)

    print(f"[{datetime.now(timezone.utc).isoformat()}] sitemap.xml régénéré : {xml.count('<url>')} URL(s), {len(articles)} article(s).")


if __name__ == "__main__":
    main()
