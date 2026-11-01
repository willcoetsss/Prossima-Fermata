// Documento «Descripción del proyecto» (.docx). Se regenera con: node build_doc.js
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, ImageRun, LevelFormat, Footer, PageNumber, TableLayoutType,
} = require("docx");

const DIR = __dirname;
const OUT = path.join(DIR, "Descripción del proyecto Prossima Fermata.docx");
const R = JSON.parse(fs.readFileSync(path.join(DIR, "rutas.json"), "utf8"));
const FECHA = process.env.PF_FECHA || "1 de noviembre de 2026";
const VERSION = process.env.PF_VERSION || "1.0";

const INK = "15181B", MUTED = "5B6168", BLUE = "173E8C", SOFT = "EFF0EC";
const ROUTE = ["C8322A", "1F6FB2", "B86B0C", "2E8540", "7A4FA0", "0B8794"];
const W = 9026; // ancho útil A4 con márgenes de 2,54 cm (DXA)

const p = (text, opts = {}) => new Paragraph({ spacing: { after: 140, line: 300 }, ...opts, children: Array.isArray(text) ? text : [new TextRun(text)] });
const h1 = t => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const h2 = t => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const b = t => new TextRun({ text: t, bold: true });
const it = t => new TextRun({ text: t, italics: true });
const bullet = (runs) => new Paragraph({ numbering: { reference: "puntos", level: 0 }, spacing: { after: 80, line: 290 }, children: typeof runs === "string" ? [new TextRun(runs)] : runs });
const border = { style: BorderStyle.SINGLE, size: 4, color: "D6D9D2" };
const borders = { top: border, bottom: border, left: border, right: border };

function table(widths, rows, headFill = BLUE) {
  return new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: widths, layout: TableLayoutType.FIXED,
    rows: rows.map((r, ri) => new TableRow({
      tableHeader: ri === 0,
      children: r.map((c, ci) => new TableCell({
        width: { size: widths[ci], type: WidthType.DXA }, borders,
        shading: ri === 0 ? { type: ShadingType.CLEAR, color: "auto", fill: headFill } : (ri % 2 === 0 ? { type: ShadingType.CLEAR, color: "auto", fill: "F7F8F5" } : undefined),
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: (Array.isArray(c) ? c : [c]).map(x => typeof x === "string"
          ? new Paragraph({ spacing: { after: 0, line: 270 }, children: [new TextRun({ text: x, bold: ri === 0, color: ri === 0 ? "FFFFFF" : INK, size: 19 })] })
          : x),
      })),
    })),
  });
}
function img(file, wPx, hPx, maxW = 600) {
  const s = Math.min(1, maxW / wPx);
  return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(DIR, file)), transformation: { width: Math.round(wPx * s), height: Math.round(hPx * s) }, altText: { title: file, description: file, name: file } })] });
}
function caption(t) { return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240 }, children: [new TextRun({ text: t, italics: true, color: MUTED, size: 18 })] }); }
function phones(files, label) {
  const cw = Math.floor(W / files.length);
  return new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: files.map(() => cw), layout: TableLayoutType.FIXED,
    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
    rows: [new TableRow({ children: files.map(([f, t]) => new TableCell({
      width: { size: cw, type: WidthType.DXA }, borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(DIR, "capturas", f)), transformation: { width: 150, height: Math.round(150 * 844 / 390) }, altText: { title: t, description: t, name: f } })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 0 }, children: [new TextRun({ text: t, italics: true, color: MUTED, size: 17 })] }),
      ] })) })],
  });
}

const kmTotal = R.routes.reduce((a, r) => a + r.km, 0) + R.transfers_km.reduce((a, b) => a + b, 0);
const fmt = n => n.toLocaleString("es-ES");

const children = [
  // Portada
  new Paragraph({ alignment: AlignmentType.LEFT, spacing: { after: 120 }, children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(DIR, "img/logo-512.png")), transformation: { width: 96, height: 96 }, altText: { title: "Logo", description: "Pizza cuyos ingredientes escriben «Boh»", name: "logo" } })] }),
  new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun("Prossima Fermata")] }),
  p([new TextRun({ text: "Descripción del proyecto · un curso de italiano como un viaje en tren por Italia", size: 26, color: MUTED })]),
  p([new TextRun({ text: `Versión ${VERSION} · ${FECHA}`, size: 20, color: MUTED })], { spacing: { after: 360 } }),

  h1("1. Resumen"),
  p("Prossima Fermata es una aplicación para aprender italiano de A1 a B2 pensada para hispanohablantes. El curso entero se presenta como un viaje en tren por Italia: 29 paradas, cada una en una ciudad real, agrupadas en seis rutas regionales que bajan de norte a sur a medida que sube el nivel. Cada parada es una lección completa con vocabulario, gramática, práctica, una conversación y un examen."),
  p("Funciona en el móvil y en el ordenador, se instala como una app, no pide cuenta y funciona sin conexión. Existe en dos sitios: un enlace privado en Claude, con el progreso sincronizado y funciones de conversación con inteligencia artificial, y una web pública en GitHub Pages que cualquiera puede instalar."),
  table([2400, 6626], [
    ["Dato", "Valor"],
    ["Niveles", "A1, A2, B1 y B2 (Marco Común Europeo de Referencia)"],
    ["Paradas", "29 ciudades en 6 rutas, de Turín a Bari"],
    ["Recorrido", `Unos ${fmt(kmTotal)} km de viaje, contando los cambios de tren`],
    ["Contenido", "1.000 palabras con ejemplo · 279 tarjetas · 29 temas y 345 ejercicios de gramática · 30 conversaciones · 16 historias · 57 verbos · 29 notas culturales"],
    ["Plataformas", "iPhone, Android, Windows y Mac (navegador o app instalada)"],
    ["Precio", "Gratuita, sin anuncios y sin cuentas"],
  ]),

  h1("2. Para quién es"),
  p("Está pensada para hispanohablantes con una base de A1 o A2 que quieren llegar a hablar italiano con soltura, estudiando en ratos sueltos de 10 o 15 minutos al día. El italiano y el español se parecen tanto que se entiende mucho desde el principio, pero se repiten siempre los mismos errores. Por eso todo el contenido está escrito desde el español:"),
  bullet("Las explicaciones de gramática están en español, con ejemplos traducidos."),
  bullet([new TextRun("Cada tema avisa de los errores típicos de los hispanohablantes, como decir "), it("sto stanco"), new TextRun(" en lugar de "), it("sono stanco"), new TextRun(".")]),
  bullet([new TextRun("Hay un mazo de falsos amigos ("), it("burro"), new TextRun(" es mantequilla; "), it("salire"), new TextRun(", subir) y cada personaje usa el registro que tocaría: "), it("tu"), new TextRun(" o "), it("Lei"), new TextRun(".")]),

  h1("3. El concepto: un viaje en tren por Italia"),
  p("Cada nivel es un tramo de Italia y cada lección, una parada. A1 empieza en la llanura del Po y B2 termina en el sur, de Palermo a Bari. Las ciudades están unidas por líneas de tren que existen de verdad, y entre una ruta y la siguiente hay un cambio de tren, también real. En cada parada la app enseña la región, una curiosidad de la ciudad y cómo se llega a la siguiente, así que, de paso, se aprende geografía."),
  img("img/mapa_rutas.png", 2220, 2604, 380),
  caption("Las seis rutas. Las líneas de puntos son los cambios de tren entre una ruta y la siguiente."),
  table([760, 2240, 3626, 800, 1600], [
    ["Ruta", "Nombre", "Ciudades", "Nivel", "Regiones"],
    ...R.routes.map(r => [String(r.num), [new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: r.name, bold: true, color: ROUTE[r.num - 1], size: 19 })] }), new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: r.tag, italics: true, color: MUTED, size: 17 })] })],
      r.cities.join(" → ") + ` (${r.km} km)`, r.lvl, r.regions.join(", ")]),
  ]),
  p(""),
  p([b("Por qué estos nombres. "), new TextRun("Cada ruta se llama por su geografía: la llanura del Po; del río Adige al mar Adriático; la calzada romana de la Via Emilia, que aún une casi todas las ciudades de Emilia; del río Arno al lago Trasimeno; del Tíber al golfo de Nápoles; y la última, que toca tres mares: el Tirreno en Palermo, el Jónico en Catania y Tarento, y el Adriático en Bari.")]),

  h1("4. Cómo es una parada"),
  p("Todas las paradas siguen el mismo recorrido, de lo más guiado a lo más libre. Un paso se abre al completar el anterior, y quien ya domine una parada puede hacer directamente su examen para saltar hasta ella."),
  table([1900, 7126], [
    ["Paso", "Qué se hace"],
    ["1 · Vocabulario", "Tarjetas nuevas con audio, de un mazo temático o del bloque correspondiente de las 1.000 palabras."],
    ["2 · Gramática", "Explicación en español, con tablas, ejemplos y errores típicos de hispanohablantes."],
    ["3 · Práctica", "Ejercicios del tema: rellenar huecos, completar tablas, opción múltiple, ordenar frases y traducir."],
    ["4 · Conversación", "Un diálogo ramificado con un personaje (cuando la parada lo tiene)."],
    ["5 · Examen", "12 preguntas de vocabulario y gramática. Con un 80 % se supera la parada y se abre la siguiente."],
  ]),
  p(""),
  phones([["05_parada.png", "Una parada"], ["06_tabla.png", "Ejercicio de tabla"], ["07_conversacion.png", "Conversación"], ["04_ciudad.png", "Ficha de ciudad"]]),
  p(""),

  h1("5. Secciones de la app"),
  table([1700, 7326], [
    ["Pestaña", "Qué contiene"],
    ["Hoy", "Panel de salidas con la próxima parada y lo que toca hoy (con los minutos estimados), objetivo diario, racha, calendario de actividad de tres meses y lo que más fallas."],
    ["Ruta", "El mapa de Italia con las seis rutas, ciudades recorridas, regiones visitadas y kilómetros; ficha de cada ciudad; quiz de geografía y test de nivel."],
    ["Storie", "16 historias de A1 a B2, con audio frase a frase, palabras tocables y preguntas de comprensión."],
    ["Palabras", "Las 1.000 palabras más usadas en bloques de 50, 17 mazos temáticos y las tarjetas propias, con repetición espaciada."],
    ["Practicar", "Gramática por temas, entrenador de verbos (57 verbos, 8 tiempos), comprensión auditiva, pronunciación, mis errores y las funciones con Claude."],
    ["Hablar", "30 conversaciones guiadas con personajes y conversación libre con Claude."],
  ]),
  p(""),
  h2("Funciones con Claude"),
  p("En el enlace de Claude, la app puede pedir ayuda a Claude con la cuenta de quien la usa. Estas funciones no están en la versión de GitHub:"),
  bullet([b("Conversación libre: "), new TextRun("se elige personaje y situación; Claude responde en italiano al nivel elegido y corrige cada mensaje.")]),
  bullet([b("Diario: "), new TextRun("unas líneas al día en italiano, corregidas con una explicación breve de cada error.")]),
  bullet([b("Repaso personalizado: "), new TextRun("ejercicios nuevos a partir de los errores que más se repiten.")]),
  bullet([b("Generador de mazos: "), new TextRun("un mazo de tarjetas con ejemplos sobre el tema que se pida.")]),

  h1("6. Dónde vive la app y dónde se guarda el progreso"),
  table([2400, 3313, 3313], [
    ["", "Enlace de Claude", "Web en GitHub Pages"],
    ["Para qué", "Estudiar con todas las funciones", "Instalarla, usarla sin conexión y compartirla"],
    ["Progreso", "En la cuenta de Claude, sincronizado entre dispositivos", "En cada dispositivo y navegador, por separado"],
    ["Funciones con Claude", "Sí", "No"],
    ["Quién puede abrirla", "Solo quien tenga acceso al enlace", "Cualquiera con la dirección"],
    ["Dirección", "Enlace privado de Claude (ver «03 App y GitHub»)", "willcoetsss.github.io/Prossima-Fermata"],
  ]),
  p(""),
  p("El progreso nunca está en los archivos del proyecto ni en GitHub: si se borran los datos del navegador, se pierde el progreso de ese dispositivo. Para pasarlo de un dispositivo a otro en la versión de GitHub están las opciones «Copiar progreso» y «Pegar progreso» de Ajustes."),

  h1("7. Cómo se actualiza"),
  p("Cada cambio sigue el mismo camino, y basta con pedirlo en la conversación con Claude:"),
  bullet([b("Enlace de Claude: "), new TextRun("se publica la versión nueva en el mismo enlace.")]),
  bullet([b("GitHub: "), new TextRun("se suben los archivos al repositorio willcoetsss/Prossima-Fermata y GitHub Pages publica la web en uno o dos minutos.")]),
  bullet([b("Carpeta del proyecto: "), new TextRun("se sustituyen los archivos que cambien (presentación, este documento, textos, copia de la web) y se añade una línea al registro de cambios del LEEME.")]),
  bullet([b("Móvil: "), new TextRun("la app instalada consulta siempre la versión del servidor y, cuando hay una nueva, se recarga sola al abrirla con conexión.")]),

  h1("8. Tecnología"),
  bullet("Una sola página web, sin servidor propio ni base de datos externa. Todo el contenido va dentro de la página."),
  bullet("Instalable como app (PWA) con un service worker que trae siempre la versión nueva y guarda una copia para usarla sin conexión."),
  bullet("Repetición espaciada propia, inspirada en el algoritmo SM-2."),
  bullet("Voz italiana del propio sistema (Web Speech) para el audio y, en la versión instalable, reconocimiento de voz para la pronunciación."),
  bullet("Mapa dibujado en SVG a partir de los límites regionales del ISTAT (proyecto openpolis/geojson-italy) y de los países de Natural Earth (dominio público)."),

  h1("9. Ideas para seguir"),
  p("Posibles siguientes pasos, sin compromiso de fechas:"),
  bullet([b("Nuevas rutas "), new TextRun("por Liguria, Marche y Abruzzo, y Cerdeña, como repaso de todo el curso.")]),
  bullet([b("Voces reales: "), new TextRun("audio grabado por hablantes nativos.")]),
  bullet([b("Progreso en la nube "), new TextRun("también para la versión de GitHub.")]),
  bullet([b("Exámenes oficiales: "), new TextRun("simulacros tipo CILS y CELI para B1 y B2.")]),

  h1("10. Enlaces"),
  bullet("Web pública: https://willcoetsss.github.io/Prossima-Fermata/"),
  bullet("Repositorio: https://github.com/willcoetsss/Prossima-Fermata"),
  bullet("App y presentación en Claude: ver los accesos directos de las carpetas 01 y 03."),
];

const doc = new Document({
  creator: "Prossima Fermata", title: "Prossima Fermata · Descripción del proyecto",
  styles: {
    default: { document: { run: { font: "Calibri", size: 22, color: INK } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal", run: { font: "Arial", size: 56, bold: true, color: INK }, paragraph: { spacing: { after: 120 } } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Arial", size: 30, bold: true, color: BLUE }, paragraph: { spacing: { before: 360, after: 140 }, outlineLevel: 0, keepNext: true } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Arial", size: 24, bold: true, color: INK }, paragraph: { spacing: { before: 240, after: 100 }, outlineLevel: 1, keepNext: true } },
    ],
  },
  numbering: { config: [{ reference: "puntos", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } }] }] },
  sections: [{
    properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Prossima Fermata · descripción del proyecto · ", color: MUTED, size: 16 }), new TextRun({ children: [PageNumber.CURRENT], color: MUTED, size: 16 })] })] }) },
    children,
  }],
});
Packer.toBuffer(doc).then(buf => { fs.writeFileSync(OUT, buf); console.log("OK", OUT); });
