"""Inserta (o quita, con --quitar) la pestaña provisional Firenze en v2/app.html.
Todo va entre marcadores TEMPORAL FIRENZE, así que quitarla es limpio y no toca el progreso."""
import sys, json, re, pathlib
HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent))
import build
sys.path.insert(0, str(HERE))
import extra

APP = pathlib.Path(sys.argv[sys.argv.index("--app") + 1]) if "--app" in sys.argv else HERE.parent / "v2" / "app.html"
html = APP.read_text(encoding="utf8")

# 1. Limpia cualquier versión anterior
html = re.sub(r"\n?<!-- TEMPORAL FIRENZE -->.*?<!-- FIN TEMPORAL FIRENZE -->", "", html, flags=re.S)
html = re.sub(r"/\* ===== TEMPORAL: pestaña Firenze.*?/\* ===== FIN TEMPORAL FIRENZE ===== \*/\n\n", "", html, flags=re.S)
html = re.sub(r"\n?/\* TEMPORAL FIRENZE css \*/.*?/\* FIN TEMPORAL FIRENZE css \*/", "", html, flags=re.S)

if "--quitar" not in sys.argv:
    build.D = HERE
    build.errors = []
    dialogs = build.dialogues()
    if build.errors:
        sys.exit("Errores: " + "; ".join(build.errors))
    data = {"dialogs": dialogs, "deck": extra.DECK, "frasi": extra.FRASI, "notes": extra.NOTES,
            "groups": extra.GROUPS, "scenes": extra.SCENES}
    ids = {d["id"] for d in dialogs}
    assert ids == {i for g in extra.GROUPS for i in g[2]}, "grupos y diálogos no coinciden"
    js = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    tag = f'\n<!-- TEMPORAL FIRENZE --><script id="firenze" type="application/json">{js}</script><!-- FIN TEMPORAL FIRENZE -->'
    m = re.search(r'<script id="mapdata"[^>]*>.*?</script>', html, flags=re.S)
    html = html[:m.end()] + tag + html[m.end():]
    css = "\n/* TEMPORAL FIRENZE css */.fz-names{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}/* FIN TEMPORAL FIRENZE css */"
    i = html.index("\n</style>")
    html = html[:i] + css + html[i:]
    code = (HERE / "firenze.js").read_text(encoding="utf8").rstrip()
    anchor = "/* ---------- Arranque ---------- */"
    i = html.index(anchor)
    html = html[:i] + code + "\n\n" + html[i:]
    print(f"Firenze: {len(dialogs)} diálogos, {len(extra.DECK['cards'])} tarjetas, {len(extra.FRASI)} frases, {len(extra.NOTES)} notas")
else:
    print("Pestaña Firenze quitada")

APP.write_text(html, encoding="utf8")
