#!/usr/bin/env python3
"""Régénère sitemap.xml à partir des articles publiés dans Supabase.

Les pages statiques ci-dessous sont toujours incluses ; les URLs d'articles
sont récupérées dynamiquement (les publications se font uniquement côté
Supabase, jamais via git, donc rien d'autre ne peut garder le sitemap à jour).
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

STATIC_PAGES = [
    (f"{SITE}/", "daily", "1.0", None),
    (f"{SITE}/categorie.html?cat=mode", "weekly", "0.8", None),
    (f"{SITE}/categorie.html?cat=sport", "weekly", "0.8", None),
    (f"{SITE}/categorie.html?cat=hotels", "weekly", "0.8", None),
    (f"{SITE}/contact.html", "monthly", "0.5", None),
    (f"{SITE}/ecrire.html", "monthly", "0.5", None),
    (f"{SITE}/mentions-legales.html", "yearly", "0.3", None),
    (f"{SITE}/confidentialite.html", "yearly", "0.3", None),
]


def fetch_articles():
    url = (
        f"{SUPABASE_URL}/rest/v1/articles"
        "?select=slug,date_creation"
        "&statut=eq.publi%C3%A9"
        "&order=date_creation.desc"
    )
    req = urllib.request.Request(
        url,
        headers={
            "apikey": SUPABASE_ANON,
            "Authorization": f"Bearer {SUPABASE_ANON}",
        },
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


def lastmod_from(date_creation):
    if not date_creation:
        return None
    try:
        return date_creation[:10]
    except Exception:
        return None


def build_xml(static_pages, articles):
    lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ""]

    for loc, changefreq, priority, lastmod in static_pages:
        lines.append("  <url>")
        lines.append(f"    <loc>{escape(loc)}</loc>")
        if lastmod:
            lines.append(f"    <lastmod>{lastmod}</lastmod>")
        lines.append(f"    <changefreq>{changefreq}</changefreq>")
        lines.append(f"    <priority>{priority}</priority>")
        lines.append("  </url>")
        lines.append("")

    for a in articles:
        slug = a.get("slug")
        if not slug:
            continue
        loc = f"{SITE}/article.html?slug={slug}"
        lastmod = lastmod_from(a.get("date_creation"))
        lines.append("  <url>")
        lines.append(f"    <loc>{escape(loc)}</loc>")
        if lastmod:
            lines.append(f"    <lastmod>{lastmod}</lastmod>")
        lines.append("    <changefreq>weekly</changefreq>")
        lines.append("    <priority>0.7</priority>")
        lines.append("  </url>")
        lines.append("")

    lines.append("</urlset>")
    lines.append("")
    return "\n".join(lines)


def main():
    try:
        articles = fetch_articles()
    except Exception as exc:
        print(f"Erreur lors de la récupération des articles Supabase : {exc}")
        raise SystemExit(1)

    xml = build_xml(STATIC_PAGES, articles)

    with open(OUT_PATH, "w", encoding="utf-8") as f:
        f.write(xml)

    print(f"[{datetime.now(timezone.utc).isoformat()}] sitemap.xml régénéré avec {len(articles)} article(s).")


if __name__ == "__main__":
    main()
