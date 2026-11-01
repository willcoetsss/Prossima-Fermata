"""Copia la versión actual de la app al repositorio de GitHub (versión instalable)."""
import os, shutil, sys
REPO = "/home/claude/prossima-fermata"
s = open("/home/claude/italiano/v2/app.html", encoding="utf8").read()
head = ('<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
  '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>'
  '<link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="pizza-boh.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="apple-touch-icon.png">'
  '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Prossima Fermata"><meta name="theme-color" content="#16191C"><script>window.__PWA__=true</script></head><body>')
open(f"{REPO}/index.html", "w", encoding="utf8").write(head + s + "</body></html>")
for f in ["sw.js", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png", "pizza-boh.svg", "LEEME.txt"]:
    shutil.copy(f"/home/claude/italiano/src/pwa/{f}", f"{REPO}/{f}")
print("ok")
