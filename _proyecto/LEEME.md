# Fuentes del proyecto Prossima Fermata

Esta carpeta no forma parte de la web (GitHub Pages ignora las carpetas que empiezan por `_`).
Guarda lo necesario para que Claude pueda regenerar la app y los documentos en cualquier conversación.

| Carpeta | Qué hay | Cómo se usa |
|---|---|---|
| `app/app.html` | La app completa (la misma que se publica en Claude). Datos incluidos. | Se publica tal cual en el enlace de Claude. `publish_repo.py` la envuelve en `index.html` para GitHub Pages. |
| `mapa/` | `routes.json` (ciudades, rutas, tramos y textos), límites de regiones y países, `geomap.py` | `geomap.build()` genera el JSON del mapa que va en `<script id="mapdata">` dentro de `app.html`. |
| `logo/` | `pizza.py` genera `pizza-boh.svg` | Los iconos PNG se renderizan desde el SVG. |
| `documentos/` | `build_deck.js` (presentación .pptx), `build_doc.js` (descripción .docx), capturas e imágenes, `online/project` (presentación online de Claude) | `node build_deck.js` y `node build_doc.js` |
| `carpeta/` | `LEEME.txt` con el registro de cambios y los textos de la app | Se copian a `C:\MIS ARCHIVOS\PROYECTOS CLAUDE\Prossima Fermata` |

Enlaces: app en Claude `https://claude.ai/artifact/UrNjTUohVbEdg37QAAJQNg` ·
presentación online `https://claude.ai/artifact/QSKjzdeDKhzxk7m2M8kxGp` ·
web `https://willcoetsss.github.io/Prossima-Fermata/`.

Al cambiar algo: publicar `app.html` en Claude, regenerar `index.html`, subirlo aquí,
actualizar los documentos afectados y añadir una línea al registro de `carpeta/LEEME.txt`
(y a la copia del ordenador).
