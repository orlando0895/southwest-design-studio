#!/usr/bin/env python3
"""Builds the five static pages from src/pages/*.html + one shared layout.
Run: python3 tools/build.py   (then commit the generated index.html files)
data-hf="path" on media becomes data-src only when that Higgsfield file exists.
"""
import pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
ARROW = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>'

PAGES = {
    "home":      {"out": "index.html",           "pre": "",    "nav": "",          "title": "Southwest Design Studio | Interior Design Showroom, Scottsdale AZ",
                  "desc": "Walk through a two-floor interior design showroom in Scottsdale, AZ: working kitchens, baths, stone, cabinetry, a wine room and more on Hayden Road."},
    "about":     {"out": "about/index.html",     "pre": "../", "nav": "about",     "title": "The Studio | Southwest Design Studio, Scottsdale AZ",
                  "desc": "The interior design showroom of Southwest Corridor, Scottsdale's design-build group. One address on Hayden Road for homeowners and the trade."},
    "portfolio": {"out": "portfolio/index.html", "pre": "../", "nav": "portfolio", "title": "Portfolio | Southwest Design Studio, Scottsdale AZ",
                  "desc": "Photographs and video from the Southwest Design Studio showroom floor in Scottsdale: kitchens, baths, finishes and rooms."},
    "services":  {"out": "services/index.html",  "pre": "../", "nav": "services",  "title": "Services | Southwest Design Studio, Scottsdale AZ",
                  "desc": "Full-home design, kitchens and baths, furnishing and styling for Valley homes, launching with the Scottsdale showroom."},
    "visit":     {"out": "visit/index.html",     "pre": "../", "nav": "visit",     "title": "Visit | Southwest Design Studio, Scottsdale AZ",
                  "desc": "Visit Southwest Design Studio at 15001 N Hayden Rd Ste 111, Scottsdale, AZ 85260. Request a private preview with a designer."},
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
<meta name="theme-color" content="#0E0B09">
<meta property="og:type" content="website">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{pre}media/og.jpg">
<link rel="preload" href="{pre}fonts/bodoni-moda-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="{pre}fonts/bodoni-moda-latin-400-italic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="{pre}fonts/manrope-latin-500-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="{pre}css/style.css">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%230E0B09'/%3E%3Crect x='7' y='7' width='8' height='8' fill='%23E3A64F'/%3E%3Crect x='17' y='7' width='8' height='8' fill='%23F1E9DC'/%3E%3Crect x='7' y='17' width='8' height='8' fill='%23F1E9DC'/%3E%3Crect x='17' y='17' width='8' height='8' fill='%23E3A64F'/%3E%3C/svg%3E">
<script>document.documentElement.classList.add("js");try{{if(sessionStorage.getItem("swds-tr"))document.documentElement.classList.add("tr-in")}}catch(e){{}}</script>
<script type="application/ld+json">{{"@context":"https://schema.org","@type":"HomeAndConstructionBusiness","name":"Southwest Design Studio","description":"Interior design showroom","telephone":"+1-877-646-0167","address":{{"@type":"PostalAddress","streetAddress":"15001 N Hayden Rd Ste 111","addressLocality":"Scottsdale","addressRegion":"AZ","postalCode":"85260","addressCountry":"US"}},"openingHours":"Mo-Fr 09:00-17:00","parentOrganization":{{"@type":"Organization","name":"Southwest Corridor"}}}}</script>
</head>
<body class="pg-{key}">
<a class="skip" href="#main">Skip to content</a>
<div class="tiles" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><span class="tl-word">{word}</span></div>
<header class="hd">
  <a class="brand" href="{pre}" aria-label="Southwest Design Studio, home">Southwest <i>Design Studio</i></a>
  <nav class="nav" aria-label="Primary">{nav}</nav>
  <div class="hd-r">
    <a class="btn" href="{pre}visit/">Plan Your Visit{arrow}</a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu"><i aria-hidden="true"></i>Menu</button>
  </div>
</header>
<div class="menu-ov" id="menu" aria-label="Menu">
  <nav aria-label="Mobile">{mnav}</nav>
  <div class="mfoot"><span>15001 N Hayden Rd Ste 111, Scottsdale</span><a href="tel:+18776460167">(877) 646-0167</a><span>Mon to Fri, 9 AM to 5 PM</span></div>
</div>
<main id="main">
{body}
</main>
<footer class="ft">
  <div class="wrap">
    <div class="ft-grid">
      <div><a class="brand" href="{pre}">Southwest <i>Design Studio</i></a><p style="margin-top:.6rem;max-width:22rem">An interior design showroom in Scottsdale, Arizona. Part of the Southwest Corridor group.</p></div>
      <div><p>15001 N Hayden Rd Ste 111<br>Scottsdale, AZ 85260</p><p style="margin-top:.5rem"><a href="tel:+18776460167">(877) 646-0167</a> &middot; Mon to Fri, 9 to 5</p></div>
      <nav aria-label="Footer">{fnav}</nav>
    </div>
    <p class="ft-base">&copy; 2026 Southwest Design Studio, LLC. All rights reserved.</p>
  </div>
</footer>
<script src="{pre}js/vendor/lenis.min.js" defer></script>
<script src="{pre}js/main.js" defer></script>
{extra}
</body>
</html>
"""
WORDS = {"home": "Step inside", "about": "The Studio", "portfolio": "The floor", "services": "Services", "visit": "Hayden Road"}

def ver(html, pre):
    """Stamp css/js links with a content hash so phones fetch fresh copies after every update."""
    import hashlib
    def sub(m):
        path = m.group(2); rel = path[len(pre):] if pre and path.startswith(pre) else path
        f = ROOT / rel
        if not f.exists(): return m.group(0)
        return m.group(1) + path + "?v=" + hashlib.md5(f.read_bytes()).hexdigest()[:8] + m.group(3)
    return re.sub(r'((?:href|src)=")([^"?]+\.(?:css|js))(")', sub, html)

def links(pre, cur, num=False):
    out = []
    for i, (slug, label) in enumerate(NAV):
        href = pre + (slug + "/" if slug else "")
        if not href: href = "./"
        on = ' aria-current="page"' if slug == cur else ""
        n = f"<small>0{i+1}</small>" if num else ""
        out.append(f'<a href="{href}"{on}>{n}{label}</a>')
    return "".join(out)

def hf(body, pre):
    def sub(m):
        path = m.group(1)
        rel = path[len(pre):] if pre and path.startswith(pre) else path
        return f'data-src="{path}"' if (ROOT / rel).exists() else ""
    return re.sub(r'data-hf="([^"]+)"', sub, body)

for key, p in PAGES.items():
    pre = p["pre"]
    body = (ROOT / "src/pages" / f"{key}.html").read_text()
    body = body.replace("{pre}", pre).replace("{arrow}", ARROW)
    body = hf(body, pre)
    extra = f'<script src="{pre}js/walk.js" defer></script>' if key == "home" else ""
    html = LAYOUT.format(title=p["title"], desc=p["desc"], pre=pre, arrow=ARROW, key=key, word=WORDS[key],
                         nav=links(pre, p["nav"]), mnav=links(pre, p["nav"], True), fnav=links(pre, p["nav"]),
                         body=body.strip(), extra=extra)
    html = html.replace('href=""', 'href="./"')
    html = ver(html, pre)
    out = ROOT / p["out"]; out.parent.mkdir(parents=True, exist_ok=True); out.write_text(html)
    print("built", p["out"], len(html), "bytes")
