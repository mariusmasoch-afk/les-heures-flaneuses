#!/usr/bin/env python3
"""Crée (ou remplace) des brouillons Gmail avec de vrais liens propres, via l'API Gmail officielle.

Le connecteur Gmail de Claude réécrit les liens en redirections google.com/url qui expirent ; l'API Gmail,
elle, stocke le HTML tel quel. Usage :
    python3 scripts/gmail_drafts.py outreach/drafts.json            # crée les brouillons
    python3 scripts/gmail_drafts.py outreach/drafts.json --replace  # remplace les brouillons de même objet

drafts.json : liste de {"to": "...", "subject": "...", "body": "texte, avec [[texte du lien|URL]] pour un lien"}
La ligne de signature « Les Heures Flâneuses » est automatiquement liée au site.
Première utilisation : placer le client OAuth « Application de bureau » dans outreach/client_secret.json
(le navigateur s'ouvre une seule fois pour autoriser ; le jeton est gardé dans outreach/token.json).
Ces deux fichiers sont ignorés par git.
"""
import base64, html, json, re, sys
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

DIR = Path(__file__).resolve().parent.parent / "outreach"
SCOPES = ["https://www.googleapis.com/auth/gmail.compose"]
SENDER = "Les Heures Flâneuses <contact@lesheuresflaneuses.fr>"
SITE = "https://lesheuresflaneuses.fr"
LINK = re.compile(r"\[\[(.+?)\|(.+?)\]\]")


def service():
    tok = DIR / "token.json"
    creds = Credentials.from_authorized_user_file(tok, SCOPES) if tok.exists() else None
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            creds = InstalledAppFlow.from_client_secrets_file(DIR / "client_secret.json", SCOPES).run_local_server(port=0)
        tok.write_text(creds.to_json())
    return build("gmail", "v1", credentials=creds)


def render(body):
    plain = LINK.sub(lambda m: f"{m[1]} ({m[2]})", body)
    links = []

    def stash(m):
        links.append((m[1], m[2]))
        return f"\x00{len(links) - 1}\x00"

    h = html.escape(LINK.sub(stash, body))
    h = re.sub("\x00(\\d+)\x00", lambda m: f'<a href="{html.escape(links[int(m[1])][1])}">{html.escape(links[int(m[1])][0])}</a>', h)
    h = re.sub(r"(?m)^Les Heures Flâneuses$", f'<a href="{SITE}">Les Heures Flâneuses</a>', h)
    return plain, '<div dir="ltr">' + h.replace("\n", "<br>\n") + "</div>"


def main():
    path, replace = sys.argv[1], "--replace" in sys.argv
    svc = service()
    existing = {}
    if replace:
        for d in svc.users().drafts().list(userId="me").execute().get("drafts", []):
            m = svc.users().drafts().get(userId="me", id=d["id"], format="metadata").execute()["message"]
            subj = next((h["value"] for h in m["payload"]["headers"] if h["name"] == "Subject"), "")
            existing[subj] = d["id"]
    for item in json.loads(Path(path).read_text(encoding="utf-8")):
        plain, rich = render(item["body"])
        msg = MIMEMultipart("alternative")
        msg["To"], msg["From"], msg["Subject"] = item["to"], SENDER, item["subject"]
        msg.attach(MIMEText(plain, "plain", "utf-8"))
        msg.attach(MIMEText(rich, "html", "utf-8"))
        raw = {"message": {"raw": base64.urlsafe_b64encode(msg.as_bytes()).decode()}}
        if item["subject"] in existing:
            svc.users().drafts().update(userId="me", id=existing[item["subject"]], body=raw).execute()
            print("remplacé :", item["subject"])
        else:
            svc.users().drafts().create(userId="me", body=raw).execute()
            print("créé     :", item["subject"])


if __name__ == "__main__":
    main()
