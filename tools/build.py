#!/usr/bin/env python3
"""Builds the five static pages from src/pages/*.html + one shared layout.
Run: python3 tools/build.py   (then commit the generated index.html files)
data-hf="path" on media becomes data-src only when that Higgsfield file exists.
"""
import pathlib, re

# Launch switch: set LAUNCH = True once the custom domain is connected.
SITE = "https://orlando0895.github.io/southwest-design-studio"
LAUNCH = False
ROOT = pathlib.Path(__file__).resolve().parent.parent
ARROW = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>'

PAGES = {
    "home":      {"out": "index.html",           "pre": "",    "nav": "",          "title": "Southwest Design Studio | Luxury Interior Design Showroom, Greater Phoenix",
                  "desc": "Walk through a two-floor luxury interior design showroom on Hayden Road: working kitchens, baths, stone, cabinetry and a wine room, for homes in Paradise Valley, North Scottsdale, Arcadia, Fountain Hills, Carefree and the East Valley."},
    "about":     {"out": "about/index.html",     "pre": "../", "nav": "about",     "title": "The Studio | Southwest Design Studio",
                  "desc": "The interior design showroom of Southwest Corridor, the Valley's design-build group. One address on Hayden Road for homeowners and the trade."},
    "portfolio": {"out": "portfolio/index.html", "pre": "../", "nav": "portfolio", "title": "Portfolio | Southwest Design Studio",
                  "desc": "Kitchens, baths, living spaces, casitas, pools and garages built by Southwest Builders &amp; Design, with finishes chosen on the Southwest Design Studio floor."},
    "services":  {"out": "services/index.html",  "pre": "../", "nav": "services",  "title": "Services | Southwest Design Studio",
                  "desc": "Full-home design, kitchens and baths, furnishing and styling for Valley homes, starting on the Scottsdale showroom floor."},
    "visit":     {"out": "visit/index.html",     "pre": "../", "nav": "visit",     "title": "Visit | Southwest Design Studio",
                  "desc": "Visit Southwest Design Studio at 15001 N Hayden Rd Ste 111, Scottsdale, AZ 85260. Request a private preview with a designer."},
}
NAV = [("", "Home"), ("about", "The Studio"), ("portfolio", "Portfolio"), ("services", "Services"), ("visit", "Visit")]

LAYOUT = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
{robots}
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#0A0A0A">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Southwest Design Studio">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{site}/media/og.jpg">
<meta property="og:url" content="{site}/{outurl}">
<link rel="canonical" href="{site}/{outurl}">
<link rel="stylesheet" href="{pre}css/style.css">
<link rel="icon" type="image/png" href="{pre}img/brand/favicon.png">
<link rel="apple-touch-icon" href="{pre}img/brand/mark-180.png">
<script>document.documentElement.classList.add("js");</script>
<script type="application/ld+json">{{"@context":"https://schema.org","@type":"HomeAndConstructionBusiness","name":"Southwest Design Studio","description":"Interior design showroom","telephone":"+1-877-646-0167","address":{{"@type":"PostalAddress","streetAddress":"15001 N Hayden Rd Ste 111","addressLocality":"Scottsdale","addressRegion":"AZ","postalCode":"85260","addressCountry":"US"}},"openingHours":"Mo-Fr 09:00-17:00","areaServed":["Paradise Valley","Scottsdale","Phoenix","Fountain Hills","Carefree","Cave Creek","Mesa","Chandler","Gilbert"],"logo":"{site}/img/brand/logo.png","parentOrganization":{{"@type":"Organization","name":"Southwest Corridor"}}}}</script>
</head>
<body class="pg-{key}">
<a class="skip" href="#main">Skip to content</a>
<header class="hd">
  <div class="brand-w"><a class="brand" href="{pre}" aria-label="Southwest Design Studio, home"><img src="{pre}img/brand/logo-sm.png" alt="Southwest Design Studio, LLC" width="562" height="165"></a><a class="div-of" href="https://swcorridor.com" target="_blank" rel="noopener">A Division of Southwest Corridor, LLC</a></div>
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
      <div><div class="brand-w"><a class="brand" href="{pre}" aria-label="Southwest Design Studio, home"><img src="{pre}img/brand/logo-sm.png" alt="Southwest Design Studio, LLC" width="562" height="165" loading="lazy"></a><a class="div-of" href="https://swcorridor.com" target="_blank" rel="noopener">A Division of Southwest Corridor, LLC</a></div><p style="margin-top:.6rem;max-width:22rem">A luxury interior design showroom serving Paradise Valley, North Scottsdale, Arcadia, Fountain Hills, Carefree and the East Valley. Part of the Southwest Corridor group.</p></div>
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
WORDS = {"home": "Step inside", "about": "The Studio", "portfolio": "Projects", "services": "Services", "visit": "Hayden Road"}

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
    html = LAYOUT.format(robots=("" if LAUNCH else '<meta name="robots" content="noindex, nofollow">'), site=SITE, outurl=("" if key == "home" else p["out"].replace("index.html","")),title=p["title"], desc=p["desc"], pre=pre, arrow=ARROW, key=key, word=WORDS[key],
                         nav=links(pre, p["nav"]), mnav=links(pre, p["nav"], True), fnav=links(pre, p["nav"]),
                         body=body.strip(), extra=extra)
    html = html.replace('href=""', 'href="./"')
    html = ver(html, pre)
    import hashlib  # materials_ver: version tile images so phones refetch replaced crops
    mv = hashlib.md5(b"".join(f.read_bytes() for f in sorted((ROOT / "img/materials").glob("*.webp")))).hexdigest()[:8]
    html = html.replace('id="rooms">', f'id="rooms" data-v="{mv}">')
    out = ROOT / p["out"]; out.parent.mkdir(parents=True, exist_ok=True); out.write_text(html)
    print("built", p["out"], len(html), "bytes")

(ROOT / "robots.txt").write_text("User-agent: *\nAllow: /\n" + (("Sitemap: " + SITE + "/sitemap.xml\n") if LAUNCH else ""))
urls = "".join(f"<url><loc>{SITE}/{'' if k == 'home' else v['out'].replace('index.html','')}</loc></url>" for k, v in PAGES.items())
(ROOT / "sitemap.xml").write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{urls}</urlset>\n')
