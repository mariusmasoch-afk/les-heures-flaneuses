#!/usr/bin/env python3
"""Crée (ou remplace) des brouillons Gmail avec de vrais liens propres, via l'API Gmail officielle.

Le connecteur Gmail de Claude réécrit les liens en redirections google.com/url qui expirent ; l'API Gmail,
elle, stocke le HTML tel quel. Usage :
    python3 scripts/gmail_drafts.py outreach/drafts.json          # crée les brouillons
    python3 scripts/gmail_drafts.py outreach/drafts.json --replace  # supprime avant les brouillons de même objet

drafts.json : liste de {"to": "...", "subject": "...", "body": "texte avec [[Baltic Hermétique Tourer|URL]] pour un lien"}
La signature « Les Heures Flâneuses » est automatiquement liée au site.
Première utilisation : place le client OAuth « Application de bureau » dans outreach/client_secret.json
(navigateur ouvert une seule fois pour autoriser, jeton gardé dans outreach/token.json). Ces deux fichiers sont ignorés par git.
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
    h = html.escape(LINK.sub("\x00\\1|\\2\x01", body))
    h = re.sub("\x00(.+?)\\|(.+?)\x01", lambda m: f'<a href="{html.unescape(m[2])}">{m[1]}</a>', h)
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
        if item.get("cc"):  # optionnel : copie
            msg["Cc"] = item["cc"]
        msg.attach(MIMEText(plain, "plain", "utf-8"))
        msg.attach(MIMEText(rich, "html", "utf-8"))
        raw = {"message": {"raw": base64.urlsafe_b64encode(msg.as_bytes()).decode()}}
        if item.get("threadId"):  # optionnel : brouillon rattaché à un fil existant (l'objet doit rester « Re: … »)
            raw["message"]["threadId"] = item["threadId"]
        if item["subject"] in existing:
            svc.users().drafts().update(userId="me", id=existing[item["subject"]], body=raw).execute()
            print("remplacé :", item["subject"])
        else:
            svc.users().drafts().create(userId="me", body=raw).execute()
            print("créé     :", item["subject"])


if __name__ == "__main__":
    main()
