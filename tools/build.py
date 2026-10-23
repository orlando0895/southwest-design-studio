#!/usr/bin/env python3
"""Builds the five static pages from src/pages/*.html + one shared layout.
Run: python3 tools/build.py   (then commit the generated index.html files)
3D bundle: npx esbuild src/home.js --bundle --minify --format=esm --outfile=js/home.min.js
"""
import pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
ARROW = '<span class="ar" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 8h10M9 4l4 4-4 4"/></svg></span>'

PAGES = {
    "home":      {"out": "index.html",           "pre": "",    "nav": "",          "title": "Southwest Design Studio | Interior Design Showroom, Scottsdale AZ",
                  "desc": "A two-floor interior design showroom in Scottsdale, AZ: working kitchens, baths, stone, cabinetry, a wine room and more. Walk it online, then in person on Hayden Road."},
    "about":     {"out": "about/index.html",     "pre": "../", "nav": "about",     "title": "The Studio | Southwest Design Studio, Scottsdale AZ",
                  "desc": "The interior design showroom of Southwest Corridor, Scottsdale's design-build group. One address on Hayden Road for homeowners and the trade."},
    "portfolio": {"out": "portfolio/index.html", "pre": "../", "nav": "portfolio", "title": "Portfolio | Southwest Design Studio, Scottsdale AZ",
                  "desc": "Photographs and video from the Southwest Design Studio showroom floor in Scottsdale: kitchens, baths, finishes and rooms."},
    "services":  {"out": "services/index.html",  "pre": "../", "nav": "services",  "title": "Services | Southwest Design Studio, Scottsdale AZ",
                  "desc": "Full-home design, kitchens and baths, furnishing and styling for Valley homes, launching with the Scottsdale showroom."},
    "visit":     {"out": "visit/index.html",     "pre": "../", "nav": "visit",     "title": "Visit | Southwest Design Studio, Scottsdale AZ",
                  "desc": "Visit Southwest Design Studio at 15001 Hayden Rd Ste 111, Scottsdale, AZ 85260. Request a private preview with a designer."},
}
NAV = [("", "Home"), ("about", "The Studio"), ("portfolio", "Portfolio"), ("services", "Services"), ("visit", "Visit")]

LAYOUT = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#1B1612">
<meta property="og:type" content="website">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{pre}media/og.jpg">
<link rel="preload" href="{pre}fonts/bodoni-moda-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="{pre}fonts/manrope-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="{pre}css/style.css">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='16' fill='%231B1612'/%3E%3Ctext x='16' y='22' font-family='Georgia' font-style='italic' font-size='17' fill='%23E0A27E' text-anchor='middle'%3ES%3C/text%3E%3C/svg%3E">
<script type="application/ld+json">{{"@context":"https://schema.org","@type":"HomeAndConstructionBusiness","name":"Southwest Design Studio","description":"Interior design showroom","telephone":"+1-877-646-0167","address":{{"@type":"PostalAddress","streetAddress":"15001 Hayden Rd Ste 111","addressLocality":"Scottsdale","addressRegion":"AZ","postalCode":"85260","addressCountry":"US"}},"openingHours":"Mo-Fr 09:00-17:00","parentOrganization":{{"@type":"Organization","name":"Southwest Corridor"}}}}</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="hd">
  <div class="hd-in">
    <a class="brand" href="{pre}">Southwest <em>Design Studio</em></a>
    <nav class="nav" aria-label="Primary">{nav}</nav>
    <a class="btn mag" href="{pre}visit/">Plan Your Visit{arrow}</a>
    <button class="menu" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mnav"><span></span><span></span></button>
  </div>
</header>
<nav class="mnav" id="mnav" aria-label="Mobile">
  {mnav}
  <p class="mfoot">15001 Hayden Rd Ste 111, Scottsdale<br><a href="tel:+18776460167">(877) 646-0167</a></p>
</nav>
<main id="main">
{body}
</main>
<footer class="ft dark">
  <div class="wrap">
    <p class="ft-big" aria-hidden="true">Come walk<br>through it <em>in person.</em></p>
    <div class="ft-grid">
      <div>
        <p class="brand" style="font-size:1.4rem;color:var(--on-dark)">Southwest <em style="color:var(--clay-light)">Design Studio</em></p>
        <p style="margin-top:.7rem;max-width:22rem">An interior design showroom in Scottsdale, Arizona. Part of the Southwest Corridor group.</p>
      </div>
      <div><h4>Visit</h4><p>15001 Hayden Rd Ste 111<br>Scottsdale, AZ 85260</p><p style="margin-top:.6rem"><a class="tlink" href="https://maps.google.com?q=Southwest+Design+Studio,+LLC,+15001+Hayden+Rd+Ste+111,+Scottsdale,+AZ+85260" target="_blank" rel="noopener">Get directions</a></p></div>
      <div><h4>Contact</h4><p><a href="tel:+18776460167">(877) 646-0167</a><br>Mon to Fri, 9 AM to 5 PM</p></div>
      <div><h4>Explore</h4><nav aria-label="Footer">{fnav}</nav></div>
    </div>
    <div class="ft-base"><p>&copy; 2026 Southwest Design Studio, LLC. All rights reserved.</p><p>Opening soon on Hayden Road.</p></div>
  </div>
</footer>
<script src="{pre}js/vendor/gsap.min.js" defer></script>
<script src="{pre}js/vendor/ScrollTrigger.min.js" defer></script>
<script src="{pre}js/vendor/lenis.min.js" defer></script>
<script src="{pre}js/main.js" defer></script>
{extra}
</body>
</html>
"""

def links(pre, cur, cls=""):
    out = []
    for slug, label in NAV:
        href = pre + (slug + "/" if slug else "")
        if not href: href = "./"
        on = ' aria-current="page"' if slug == cur else ""
        out.append(f'<a href="{href}"{on}>{label}</a>')
    return "".join(out)

for key, p in PAGES.items():
    pre = p["pre"]
    body = (ROOT / "src/pages" / f"{key}.html").read_text()
    body = body.replace("{pre}", pre).replace("{arrow}", ARROW)
    extra = f'<script type="module" src="{pre}js/home.min.js"></script>' if key == "home" else ""
    html = LAYOUT.format(title=p["title"], desc=p["desc"], pre=pre, arrow=ARROW,
                         nav=links(pre, p["nav"]), mnav=links(pre, p["nav"]), fnav=links(pre, p["nav"]),
                         body=body.strip(), extra=extra)
    html = html.replace('href=""', 'href="./"')
    out = ROOT / p["out"]; out.parent.mkdir(parents=True, exist_ok=True); out.write_text(html)
    print("built", p["out"], len(html), "bytes")
