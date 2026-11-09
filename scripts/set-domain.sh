#!/bin/sh
# Remplace le jeton __SITE_URL__ dans site/ par le vrai domaine (sans slash final).
# Usage : scripts/set-domain.sh https://example.com
set -eu
[ $# -eq 1 ] || { echo "usage: $0 https://domaine" >&2; exit 1; }
url="${1%/}"
cd "$(dirname "$0")/.."
sed -i '' "s#__SITE_URL__#${url}#g" site/index.html site/en/index.html
printf 'User-agent: *\nAllow: /\nSitemap: %s/sitemap.xml\n' "$url" > site/robots.txt
cat > site/sitemap.xml <<XML
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url><loc>${url}/</loc><xhtml:link rel="alternate" hreflang="en" href="${url}/en/"/></url>
  <url><loc>${url}/en/</loc><xhtml:link rel="alternate" hreflang="fr" href="${url}/"/></url>
</urlset>
XML
echo "Domaine réglé sur ${url}"
