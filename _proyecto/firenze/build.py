#!/usr/bin/env python3
"""Construye Prossima Fermata: parsea el contenido de src/data y lo inyecta en src/app.html.

Salidas:
  dist/prossima-fermata.html      -> versión para publicar como artifact (sin <html>/<head>)
  dist/pwa/index.html             -> versión PWA autónoma (documento completo + manifest + service worker)
"""
import json, re, sys, os, shutil, zipfile
from pathlib import Path

ROOT = Path(__file__).parent
D = ROOT / "src" / "data"
errors = []

def words():
    out = []
    for f in ["words1.txt", "words2.txt"]:
        for line in (D / f).read_text(encoding="utf8").splitlines():
            if not line.strip():
                continue
            it, es, pos = [p.strip() for p in line.split("|")]
            out.append([it, es, pos])
    if len(out) != 1000:
        errors.append(f"words: {len(out)} != 1000")
    keys = [w[0] for w in out]
    if len(set(keys)) != len(keys):
        errors.append("words: duplicados")
    return out

def decks():
    out = []
    cur = None
    for line in (D / "decks.txt").read_text(encoding="utf8").splitlines():
        if not line.strip():
            continue
        if line.startswith("#"):
            did, title, lvl = [p.strip() for p in line[1:].split("|")]
            cur = {"id": did, "title": title, "lvl": lvl, "cards": []}
            out.append(cur)
        else:
            parts = [p.strip() for p in line.split("|")]
            if len(parts) != 4:
                errors.append(f"deck {cur['id']}: línea mal formada: {line}")
                continue
            cur["cards"].append(parts)
    return out

def parse_ex(line, tid):
    parts = [p.strip() for p in line.split(" | ")]
    t = parts[0]
    try:
        if t == "gap":
            q = parts[1]
            ans = [[a.strip() for a in g.split(" / ")] for g in parts[2].split(" ; ")]
            n = q.count("___")
            if n != len(ans):
                errors.append(f"{tid}: huecos {n} != respuestas {len(ans)}: {q}")
            return {"t": "gap", "q": q, "a": ans, "x": parts[3] if len(parts) > 3 else ""}
        if t == "mc":
            o = [s.strip() for s in parts[2].split(" ; ")]
            a = int(parts[3])
            if a >= len(o):
                errors.append(f"{tid}: mc índice fuera de rango")
            return {"t": "mc", "q": parts[1], "o": o, "a": a, "x": parts[4] if len(parts) > 4 else ""}
        if t == "table":
            cols = [c.strip() for c in parts[2].split(" ; ")]
            rows = []
            for r in parts[3].split(" ; "):
                label, cells = r.split(" = ", 1)
                cl = [c.strip() for c in cells.split(" , ")]
                if len(cl) != len(cols) - 1:
                    errors.append(f"{tid}: tabla fila '{label}' tiene {len(cl)} celdas, se esperaban {len(cols)-1}")
                rows.append({"l": label.strip(), "c": [[x.strip() for x in c.split(" / ")] for c in cl]})
            return {"t": "table", "title": parts[1], "cols": cols, "rows": rows}
        if t == "order":
            return {"t": "order", "es": parts[1], "a": parts[2]}
        if t == "tr":
            return {"t": "tr", "es": parts[1], "a": [s.strip() for s in parts[2].split(" / ")]}
    except Exception as e:
        errors.append(f"{tid}: error {e} en {line}")
    errors.append(f"{tid}: tipo desconocido {line}")
    return None

def grammar():
    topics = []
    for f in ["grammar_a.txt", "grammar_b.txt"]:
        cur = None
        mode = None
        for line in (D / f).read_text(encoding="utf8").splitlines():
            if line.startswith("@ "):
                tid, lvl, title, sub = [p.strip() for p in line[2:].split("|")]
                cur = {"id": tid, "lvl": lvl, "title": title, "sub": sub, "body": [], "err": [], "ex": []}
                topics.append(cur)
                mode = "body"
                continue
            if line.strip() == "-- errores":
                mode = "err"; continue
            if line.strip() == "-- ejercicios":
                mode = "ex"; continue
            if mode == "body":
                cur["body"].append(line)
            elif mode == "err":
                if line.startswith("- "):
                    cur["err"].append(line[2:])
            elif mode == "ex":
                if line.strip():
                    e = parse_ex(line, cur["id"])
                    if e:
                        cur["ex"].append(e)
        for t in topics:
            if isinstance(t["body"], list):
                t["body"] = "\n".join(t["body"]).strip()
    for t in topics:
        if len(t["ex"]) < 10:
            errors.append(f"{t['id']}: solo {len(t['ex'])} ejercicios")
    return topics

def dialogues():
    out = []
    cur = None
    node = None
    for line in (D / "dialogues.txt").read_text(encoding="utf8").splitlines():
        if not line.strip():
            continue
        if line.startswith("@ "):
            did, lvl, title, who, role, reg, desc = [p.strip() for p in line[2:].split("|")]
            cur = {"id": did, "lvl": lvl, "title": title, "who": who, "role": role, "reg": reg, "desc": desc, "nodes": {}, "start": None, "vocab": [], "frasi": []}
            out.append(cur)
            continue
        if line.startswith("= "):
            kind, rest = line[2:].split(":", 1)
            pairs = [[x.strip() for x in p.split(" = ")] for p in rest.split(" ; ")]
            cur[kind.strip()] = pairs
            continue
        m = re.match(r"^(\w+) > (.*)$", line)
        if m:
            nid = m.group(1)
            it, es = [p.strip() for p in m.group(2).split(" | ")]
            node = {"it": it, "es": es, "o": []}
            cur["nodes"][nid] = node
            if cur["start"] is None:
                cur["start"] = nid
            continue
        m = re.match(r"^\s+([*x]) (.*)$", line)
        if m:
            parts = [p.strip() for p in m.group(2).split(" | ")]
            if m.group(1) == "*":
                node["o"].append({"it": parts[0], "es": parts[1], "next": parts[2]})
            else:
                node["o"].append({"it": parts[0], "es": parts[1], "bad": parts[2]})
            continue
        errors.append(f"dialogo {cur and cur['id']}: línea no reconocida: {line}")
    for d in out:
        ends = 0
        for nid, n in d["nodes"].items():
            if not n["o"]:
                ends += 1
            for o in n["o"]:
                if "next" in o and o["next"] not in d["nodes"]:
                    errors.append(f"dialogo {d['id']}: {nid} apunta a {o['next']} inexistente")
            if n["o"] and not any("next" in o for o in n["o"]):
                errors.append(f"dialogo {d['id']}: {nid} sin opción correcta")
        if ends == 0:
            errors.append(f"dialogo {d['id']}: sin final")
    return out

def main():
    data = {"words": words(), "decks": decks(), "grammar": grammar(), "dialogs": dialogues()}
    import geomap
    data["map"] = geomap.build(D, errors)
    if errors:
        print("ERRORES:\n" + "\n".join(errors))
        sys.exit(1)
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    tpl = (ROOT / "src" / "app.html").read_text(encoding="utf8")
    app = tpl.replace("__DATA__", payload)
    out = ROOT / "dist"
    out.mkdir(exist_ok=True)
    (out / "prossima-fermata.html").write_text(app.replace("<!--PWA-->", ""), encoding="utf8")
    # Variante PWA: documento completo
    pwa = out / "pwa"
    if pwa.exists():
        shutil.rmtree(pwa)
    pwa.mkdir()
    head_extra = ('<link rel="manifest" href="manifest.webmanifest">'
                  '<link rel="apple-touch-icon" href="icon-512.png">'
                  '<meta name="apple-mobile-web-app-capable" content="yes">'
                  '<meta name="mobile-web-app-capable" content="yes">'
                  '<meta name="apple-mobile-web-app-status-bar-style" content="default">'
                  '<meta name="theme-color" content="#F3F4F1">'
                  '<script>window.__PWA__=true</script>')
    full = ('<!doctype html><html lang="es"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
            '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>'
            + head_extra + '</head><body>' + app.replace("<!--PWA-->", "") + '</body></html>')
    (pwa / "index.html").write_text(full, encoding="utf8")
    for f in ["manifest.webmanifest", "sw.js"]:
        shutil.copy(ROOT / "src" / "pwa" / f, pwa / f)
    for f in (ROOT / "src" / "pwa").glob("*.png"):
        shutil.copy(f, pwa / f.name)
    with zipfile.ZipFile(out / "prossima-fermata-pwa.zip", "w", zipfile.ZIP_DEFLATED) as z:
        for f in pwa.iterdir():
            z.write(f, f"prossima-fermata/{f.name}")
        z.write(ROOT / "src" / "pwa" / "LEEME.txt", "prossima-fermata/LEEME.txt")
    n_ex = sum(len(t["ex"]) for t in data["grammar"])
    n_cards = sum(len(d["cards"]) for d in data["decks"])
    print(f"OK · {len(data['words'])} palabras · {len(data['decks'])} mazos / {n_cards} tarjetas · "
          f"{len(data['grammar'])} temas / {n_ex} ejercicios · {len(data['dialogs'])} diálogos · "
          f"{len(app)//1024} KB")

if __name__ == "__main__":
    main()
