#!/usr/bin/env python3
"""Génère site/index.html (fr) et site/en/index.html (en). Usage : python3 site/build.py"""
import html
import json
import pathlib

ROOT = pathlib.Path(__file__).parent
APP_URL = "https://apps.apple.com/app/id6762572011"
APP_ID = "6762572011"
CONTACT = "dbellaiche@davisor.fr"
SITE = "__SITE_URL__"  # remplacé par scripts/set-domain.sh au moment de la mise en ligne

T = {
    "fr": {
        "lang": "fr", "path": "/", "other": ("English", "en/"), "prefix": "",
        "title": "Objectif 10K Pas — Suis ton rythme de pas par jour, mois et année",
        "desc": "Tu marches déjà. Objectif 10K Pas te dit si tu es dans le rythme pour tenir ton objectif de pas sur le mois et sur l'année. Gratuit, sans pub, aucune donnée collectée. iPhone.",
        "eyebrow": "App iPhone · gratuite",
        "h1": "Tiens ton objectif de pas, jour après jour.",
        "lead": "Tu marches déjà. Objectif 10K Pas te dit en un coup d'œil si tu es dans le rythme pour tenir ton objectif sur le mois et sur l'année.",
        "cta": "Télécharger sur l'App Store",
        "fine": "Gratuit · Sans publicité · Aucune donnée collectée",
        "feat_h": "Pensée pour le long terme",
        "feat_sub": "Un compteur de pas dit où tu en es aujourd'hui. 10K te dit si tu tiens la trajectoire.",
        "features": [
            ("Le rythme du mois", "Ton total, ta moyenne par jour, les pas restants et la moyenne requise pour finir le mois à temps, avec ou sans aujourd'hui."),
            ("Ton avance ou ton retard", "Une barre de progression avec le rythme idéal en repère, et un état clair : dans les temps, en avance ou en retard sur ton objectif."),
            ("Simple et respectueux", "Lit directement l'app Santé, sans saisie. Aucune publicité, aucune donnée collectée : tes pas restent sur ton iPhone."),
        ],
        "gal_h": "Un historique qui parle",
        "gal_sub": "Jour par jour, mois par mois, année par année. Touche une barre pour voir le total exact, le pourcentage de l'objectif et la moyenne quotidienne.",
        "gallery": [
            ("screen-1.jpg", "Le tableau de bord : pas du jour et rythme du mois"),
            ("screen-2.jpg", "L'historique par jour avec calendrier"),
            ("screen-3.jpg", "Les mois : combien tu as atteint l'objectif"),
            ("screen-5.jpg", "Ton objectif quotidien, entièrement personnalisable"),
        ],
        "faq_h": "Questions fréquentes",
        "faq": [
            ("L'application est-elle vraiment gratuite ?", "Oui. Elle est gratuite, sans publicité et sans achat intégré."),
            ("Quelles données utilise-t-elle ?", "Uniquement tes pas, lus dans l'app Santé d'Apple avec ton autorisation, en lecture seule. Ils ne quittent jamais ton iPhone et rien n'est collecté."),
            ("Puis-je changer mon objectif de 10 000 pas ?", "Oui. Tu peux choisir un objectif rapide (de 5 000 à 15 000 pas) ou saisir le tien. L'objectif du mois se calcule tout seul."),
            ("Existe-t-elle sur Android ?", "Pas pour l'instant : l'application est uniquement disponible sur iPhone."),
            ("En quelles langues est-elle disponible ?", "En français et en anglais, selon la langue de ton iPhone."),
        ],
        "band_h": "Prêt à tenir ton rythme ?",
        "band_p": "Installe l'application et vois tout de suite où tu en es sur le mois.",
        "privacy": "Confidentialité", "contact": "Contact",
        "alt_icon": "Icône de l'application Objectif 10K Pas",
    },
    "en": {
        "lang": "en", "path": "/en/", "other": ("Français", "../"), "prefix": "../",
        "title": "Objectif 10K Pas — Track your step pace by day, month and year",
        "desc": "You already walk. Objectif 10K Pas tells you whether you're on pace to hit your step goal this month and this year. Free, no ads, no data collected. iPhone.",
        "eyebrow": "iPhone app · free",
        "h1": "Hit your step goal, day after day.",
        "lead": "You already walk. Objectif 10K Pas shows at a glance whether you're on pace to reach your goal this month and this year.",
        "cta": "Download on the App Store",
        "fine": "Free · No ads · No data collected",
        "feat_h": "Built for the long run",
        "feat_sub": "A step counter tells you where you are today. 10K tells you whether you're on track.",
        "features": [
            ("Your monthly pace", "Your total, daily average, steps still to go, and the average you need to finish the month on track, with or without today."),
            ("Your lead or lag", "A progress bar with the ideal pace as a marker, and a clear status: on track, ahead or behind your goal."),
            ("Simple and respectful", "Reads straight from Apple Health, no manual entry. No ads and no data collected: your steps stay on your iPhone."),
        ],
        "gal_h": "A history that talks",
        "gal_sub": "Day by day, month by month, year by year. Tap a bar to see the exact total, the percentage of your goal and the daily average.",
        "gallery": [
            ("screen-1.jpg", "The dashboard: today's steps and monthly pace"),
            ("screen-2.jpg", "Daily history with a calendar"),
            ("screen-3.jpg", "Months: how often you reached your goal"),
            ("screen-5.jpg", "Your daily goal, fully customizable"),
        ],
        "faq_h": "Frequently asked questions",
        "faq": [
            ("Is the app really free?", "Yes. It's free, with no ads and no in-app purchases."),
            ("What data does it use?", "Only your steps, read from Apple Health with your permission, read-only. They never leave your iPhone and nothing is collected."),
            ("Can I change my 10,000-step goal?", "Yes. Pick a quick goal (5,000 to 15,000 steps) or enter your own. The monthly goal is calculated for you."),
            ("Is it available on Android?", "Not yet: the app is currently available on iPhone only."),
            ("Which languages does it support?", "English and French, depending on your iPhone's language."),
        ],
        "band_h": "Ready to keep your pace?",
        "band_p": "Install the app and see right away where you stand this month.",
        "privacy": "Privacy (in French)", "contact": "Contact",
        "alt_icon": "Objectif 10K Pas app icon",
    },
}


def e(s):
    return html.escape(s, quote=True)


def page(c):
    p = c["prefix"]
    other_label, other_href = c["other"]
    fr_url, en_url = f"{SITE}/", f"{SITE}/en/"
    canonical = fr_url if c["lang"] == "fr" else en_url
    ld = {
        "@context": "https://schema.org",
        "@type": "MobileApplication",
        "name": "Objectif 10K Pas",
        "operatingSystem": "iOS",
        "applicationCategory": "HealthApplication",
        "description": c["desc"],
        "offers": {"@type": "Offer", "price": "0", "priceCurrency": "EUR"},
        "downloadUrl": APP_URL,
        "inLanguage": c["lang"],
    }
    feats = "".join(f'<div class="card"><h3>{e(h)}</h3><p>{e(t)}</p></div>' for h, t in c["features"])
    gal = "".join(
        f'<figure><div class="shot"><img src="{p}img/{f}" alt="{e(cap)}" loading="lazy" width="508" height="1100"></div>'
        f"<figcaption>{e(cap)}</figcaption></figure>"
        for f, cap in c["gallery"]
    )
    faq = "".join(f"<details><summary>{e(q)}</summary><p>{e(a)}</p></details>" for q, a in c["faq"])
    return f"""<!DOCTYPE html>
<html lang="{c['lang']}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(c['title'])}</title>
<meta name="description" content="{e(c['desc'])}">
<meta name="apple-itunes-app" content="app-id={APP_ID}">
<meta name="theme-color" content="#0a0a0f">
<link rel="canonical" href="{canonical}">
<link rel="alternate" hreflang="fr" href="{fr_url}">
<link rel="alternate" hreflang="en" href="{en_url}">
<link rel="alternate" hreflang="x-default" href="{fr_url}">
<link rel="icon" type="image/png" href="{p}favicon.png">
<link rel="apple-touch-icon" href="{p}img/apple-touch-icon.png">
<meta property="og:type" content="website">
<meta property="og:title" content="{e(c['title'])}">
<meta property="og:description" content="{e(c['desc'])}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{SITE}/img/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="{p}style.css">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
</head>
<body>
<div class="wrap">
<header class="top">
  <a class="brand" href="{p or './'}"><img src="{p}img/icon.png" alt="{e(c['alt_icon'])}" width="34" height="34"><span>Objectif 10K Pas</span></a>
  <a class="lang" href="{other_href}" hreflang="{'en' if c['lang']=='fr' else 'fr'}">{other_label}</a>
</header>
<main>
<div class="hero">
  <div>
    <div class="eyebrow">{e(c['eyebrow'])}</div>
    <h1>{e(c['h1'])}</h1>
    <p class="lead">{e(c['lead'])}</p>
    <a class="cta" href="{APP_URL}">{e(c['cta'])}</a>
    <p class="fine">{e(c['fine'])}</p>
  </div>
  <div class="shot"><img src="{p}img/screen-1.jpg" alt="{e(c['gallery'][0][1])}" width="508" height="1100"></div>
</div>
<section>
  <h2>{e(c['feat_h'])}</h2>
  <p class="sub">{e(c['feat_sub'])}</p>
  <div class="features">{feats}</div>
</section>
<section>
  <h2>{e(c['gal_h'])}</h2>
  <p class="sub">{e(c['gal_sub'])}</p>
  <div class="gallery">{gal}</div>
</section>
<section class="faq">
  <h2>{e(c['faq_h'])}</h2>
  {faq}
</section>
<section>
  <div class="band">
    <h2>{e(c['band_h'])}</h2>
    <p class="sub" style="margin-inline:auto">{e(c['band_p'])}</p>
    <a class="cta" href="{APP_URL}">{e(c['cta'])}</a>
  </div>
</section>
</main>
</div>
<footer>
  <div class="wrap">
    <span>© 2026 BELLASOR</span>
    <span><a href="{p}privacy/">{e(c['privacy'])}</a> · <a href="mailto:{CONTACT}">{e(c['contact'])}</a></span>
  </div>
</footer>
</body>
</html>
"""


def main():
    (ROOT / "index.html").write_text(page(T["fr"]), encoding="utf-8")
    (ROOT / "en").mkdir(exist_ok=True)
    (ROOT / "en" / "index.html").write_text(page(T["en"]), encoding="utf-8")
    print("ok")


if __name__ == "__main__":
    main()
