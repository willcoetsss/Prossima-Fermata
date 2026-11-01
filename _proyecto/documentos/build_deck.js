// Presentación de Prossima Fermata (.pptx editable). Se regenera con: node build_deck.js
const pptxgen = require("pptxgenjs");
const path = require("path");
const { applyTheme } = require("/mnt/skills/public/pptx/scripts/apply_theme.js");

const DIR = __dirname;
const OUT = path.join(DIR, "Prossima Fermata - In treno per l'Italia.pptx");
const CAP = f => path.join(DIR, "capturas", f);
const IMG = f => path.join(DIR, "img", f);

const THEME = {
  name: "Prossima Fermata",
  headFontFace: "Arial",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "15181B", lt1: "FFFFFF", dk2: "16191C", lt2: "F3F4F1",
    accent1: "173E8C", accent2: "F2B705", accent3: "C8322A", accent4: "2E8540", accent5: "7A4FA0", accent6: "0B8794",
    hlink: "1F6FB2", folHlink: "7A4FA0",
  },
};
const ROUTE = ["C8322A", "1F6FB2", "B86B0C", "2E8540", "7A4FA0", "0B8794"];
const MUTED = "5B6168", LINE = "D6D9D2", SOFT = "F3F4F1", SIGNMUTED = "A9AFB5";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 × 7.5 in
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "Prossima Fermata · In treno per l'Italia";
pres.author = "Prossima Fermata";
pres.company = "Prossima Fermata";
const C = pres.SchemeColor;

/* ---------- Diseños ---------- */
pres.defineSlideMaster({
  title: "PF Contenido",
  background: { color: "FFFFFF" },
  margin: [0.5, 0.6, 0.6, 0.6],
  objects: [
    { placeholder: { options: { name: "kicker", type: "body", x: 0.6, y: 0.42, w: 8, h: 0.34, fontFace: "Arial", fontSize: 12, bold: true, color: C.accent1, charSpacing: 2, margin: 0 }, text: "" } },
    { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.78, w: 12.1, h: 0.9, fontFace: "Arial", fontSize: 34, bold: true, color: C.text1, margin: 0, valign: "top", align: "left" }, text: "" } },
    { image: { path: IMG("logo-512.png"), x: 0.6, y: 6.93, w: 0.32, h: 0.32 } },
    { text: { text: "Prossima Fermata", options: { x: 1.0, y: 6.93, w: 4, h: 0.32, fontFace: "Arial", fontSize: 10, bold: true, color: MUTED, valign: "middle", margin: 0 } } },
  ],
  slideNumber: { x: 12.2, y: 6.93, w: 0.55, h: 0.32, fontFace: "Arial", fontSize: 10, color: MUTED, align: "right" },
});
pres.defineSlideMaster({
  title: "PF Oscuro",
  background: { color: "16191C" },
  objects: [],
});

/* ---------- Ayudas ---------- */
let n = 0;
function content(kicker, title, section) {
  const s = pres.addSlide({ masterName: "PF Contenido", sectionTitle: section });
  s.addText(kicker.toUpperCase(), { placeholder: "kicker" });
  s.addText(title, { placeholder: "title" });
  return s;
}
// móvil: marco oscuro redondeado con la captura dentro
function phone(s, file, x, y, h, name) {
  const w = h * 390 / 844;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x - 0.09, y: y - 0.09, w: w + 0.18, h: h + 0.18, rectRadius: 0.28, fill: { color: "16191C" }, line: { color: "16191C" }, objectName: name + " marco",
    shadow: { type: "outer", color: "000000", opacity: 0.22, blur: 10, offset: 4, angle: 90 } });
  s.addImage({ path: CAP(file), x, y, w, h, objectName: name, altText: name });
  return w;
}
// chapa de ruta (círculo con número)
function badge(s, num, x, y, d = 0.42, color = ROUTE[num - 1]) {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color }, line: { color: "FFFFFF", width: 1.5 }, objectName: "Chapa " + num });
  s.addText(String(num), { x, y, w: d, h: d, align: "center", valign: "middle", fontFace: "Arial", bold: true, fontSize: d > 0.5 ? 20 : 14, color: "FFFFFF", margin: 0, isTextBox: true });
}
// cartel de estación azul (motivo de la presentación)
function plate(s, text, x, y, w, h, size = 20) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: "173E8C" }, line: { color: "173E8C" }, objectName: "Cartel " + text });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.06, y: y + 0.06, w: w - 0.12, h: h - 0.12, rectRadius: 0.05, fill: { type: "none" }, line: { color: "FFFFFF", width: 1.25 }, objectName: "Cartel borde" });
  s.addText(text.toUpperCase(), { x: x + 0.15, y, w: w - 0.3, h, fontFace: "Arial", bold: true, fontSize: size, color: "FFFFFF", valign: "middle", margin: 0, charSpacing: 1, isTextBox: true });
}
function rows(s, items, x, y, w, gap, opts = {}) {
  // items: [{t, d, color?, num?}]
  items.forEach((it, i) => {
    const yy = y + i * gap;
    if (it.num != null) badge(s, it.num, x, yy + 0.02, 0.46, it.color || "173E8C");
    s.addText([
      { text: it.t, options: { bold: true, fontSize: opts.ts || 17, color: "15181B", fontFace: "Arial", breakLine: true } },
      { text: it.d, options: { fontSize: opts.ds || 14, color: MUTED } },
    ], { x: x + (it.num != null ? 0.65 : 0), y: yy, w: w - (it.num != null ? 0.65 : 0), h: gap - 0.1, valign: "top", margin: 0, paraSpaceAfter: 2, isTextBox: true });
  });
}

/* ================= 1 · Portada ================= */
pres.addSection({ title: "Presentación" });
{
  const s = pres.addSlide({ masterName: "PF Oscuro", sectionTitle: "Presentación" });
  s.addImage({ path: IMG("logo-512.png"), x: 0.75, y: 0.75, w: 1.45, h: 1.45, altText: "Logo: una pizza cuyos ingredientes escriben «Boh»" });
  s.addText("CORSO D'ITALIANO · A1 → B2", { x: 0.75, y: 2.55, w: 7.5, h: 0.4, fontFace: "Arial", fontSize: 14, bold: true, color: "F2B705", charSpacing: 3, margin: 0, isTextBox: true });
  s.addText("Prossima Fermata", { x: 0.75, y: 2.95, w: 8.2, h: 1.25, fontFace: "Arial", fontSize: 60, bold: true, color: "FFFFFF", margin: 0, valign: "top", isTextBox: true });
  s.addText("Aprende italiano viajando en tren por Italia, de Turín a Bari.", { x: 0.75, y: 4.25, w: 7.6, h: 1.0, fontFace: "Cambria", italic: true, fontSize: 24, color: "E9EBE6", margin: 0, valign: "top", isTextBox: true });
  s.addText("Para hispanohablantes · en el móvil y en el ordenador · sin conexión", { x: 0.75, y: 6.35, w: 7.6, h: 0.4, fontFace: "Arial", fontSize: 13, color: SIGNMUTED, margin: 0, isTextBox: true });
  phone(s, "01_hoy.png", 9.55, 0.75, 6.0, "Pantalla Hoy");
  s.addNotes("Prossima Fermata es una aplicación para aprender italiano pensada para hispanohablantes. El curso entero es un viaje en tren: 29 paradas, cada una en una ciudad real, desde Turín hasta Bari. A la derecha, la pantalla de inicio: un panel de salidas que dice cuál es la próxima parada y qué toca hoy. El logo es una pizza cuyos ingredientes escriben «Boh», la palabra que más se oye cuando no sabes algo en italiano.");
}

/* ================= 2 · La idea ================= */
{
  const s = content("La idea", "29 paradas, de Turín a Bari", "Presentación");
  rows(s, [
    { num: 1, t: "Cada nivel es un tramo de Italia", d: "A1 empieza en el norte y B2 termina en el sur: Sicilia, Calabria y Puglia.", color: "C8322A" },
    { num: 2, t: "Cada parada es una ciudad real", d: "Con su región, una curiosidad y la conexión de tren hasta la siguiente.", color: "1F6FB2" },
    { num: 3, t: "Cada parada es una lección completa", d: "Vocabulario, gramática, práctica, conversación y un examen para avanzar.", color: "2E8540" },
    { num: 4, t: "El progreso se ve en el mapa", d: "Ciudades recorridas, regiones visitadas y kilómetros de viaje.", color: "7A4FA0" },
  ], 0.6, 2.0, 6.2, 1.15);
  s.addImage({ path: IMG("mapa_rutas.png"), x: 7.55, y: 0.5, w: 5.1, h: 5.1 * 2604 / 2220, altText: "Mapa de Italia con las seis rutas" });
  s.addNotes("La idea central: aprender un idioma es un viaje largo, así que lo convertimos en uno de verdad. Cada lección es una parada en una ciudad italiana, y las paradas se agrupan en seis rutas regionales. A medida que sube el nivel, el tren baja hacia el sur. Al terminar, has aprendido italiano de A1 a B2 y has recorrido Italia de norte a sur.");
}

/* ================= 3 · Para quién ================= */
{
  const s = content("Para quién", "Pensada para quien ya habla español", "Presentación");
  const card = (x, title, items, color) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 2.0, w: 5.85, h: 3.9, rectRadius: 0.12, fill: { color: SOFT }, line: { color: SOFT }, objectName: title });
    plate(s, title, x + 0.35, 2.3, 3.6, 0.55, 15);
    s.addText(items.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < items.length - 1 } })),
      { x: x + 0.35, y: 3.1, w: 5.15, h: 3.2, fontFace: "Calibri", fontSize: 16, color: "15181B", paraSpaceAfter: 10, valign: "top", margin: 0, isTextBox: true });
  };
  card(0.6, "Para quién", [
    "Hispanohablantes con una base de A1–A2 que quieren hablar con soltura.",
    "Gente que estudia en ratos sueltos: 10 o 15 minutos al día en el móvil.",
    "Quien quiere entender Italia, no solo el idioma: ciudades, costumbres y cultura.",
  ]);
  card(6.88, "Qué la hace distinta", [
    "Todo se explica en español y desde el español.",
    "Cada tema de gramática avisa de los errores típicos de los hispanohablantes.",
    "Falsos amigos, registro formal (Lei) e informal (tu) y expresiones reales.",
    "Sin cuentas, sin anuncios y funciona sin conexión.",
  ]);
  s.addNotes("El italiano es muy cercano al español, y eso es una ventaja y una trampa a la vez: se entiende mucho desde el principio, pero se cometen siempre los mismos errores. Por eso todo el contenido está escrito para hispanohablantes: explicaciones en español, avisos de errores típicos como «sono stanco» en lugar de «sto stanco», y falsos amigos como «burro», que es mantequilla.");
}

/* ================= 4 · Cifras ================= */
pres.addSection({ title: "El curso" });
{
  const s = content("El contenido", "Todo el curso, ya escrito", "El curso");
  const stats = [
    ["1.000", "palabras más usadas, con un ejemplo cada una"],
    ["279", "tarjetas temáticas en 17 mazos"],
    ["29", "temas de gramática de A1 a B2"],
    ["345", "ejercicios de gramática"],
    ["30", "conversaciones guiadas con personajes"],
    ["16", "historias para leer y escuchar"],
    ["57", "verbos en el entrenador, en 8 tiempos"],
    ["29", "notas culturales, una por parada"],
  ];
  stats.forEach(([num, label], i) => {
    const col = i % 4, row = Math.floor(i / 4);
    const x = 0.6 + col * 3.1, y = 2.05 + row * 2.3;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 2.85, h: 2.05, rectRadius: 0.12, fill: { color: SOFT }, line: { color: SOFT }, objectName: "Cifra " + label });
    s.addText(num, { x: x + 0.25, y: y + 0.2, w: 2.4, h: 0.95, fontFace: "Arial", bold: true, fontSize: 48, color: ROUTE[i % 6], margin: 0, valign: "middle", isTextBox: true });
    s.addText(label, { x: x + 0.25, y: y + 1.15, w: 2.4, h: 0.75, fontFace: "Calibri", fontSize: 14, color: "15181B", margin: 0, valign: "top", isTextBox: true });
  });
  s.addNotes("Esta es la base de contenido que ya está dentro de la app. Las mil palabras más usadas llevan cada una su frase de ejemplo traducida; la gramática tiene 29 temas y 345 ejercicios; hay 30 conversaciones guiadas y 16 historias graduadas por nivel. Todo funciona sin conexión.");
}

/* ================= 5 · Las rutas ================= */
{
  const s = content("El mapa", "Seis rutas, de norte a sur", "El curso");
  const mh = 5.2, mw = mh * 2220 / 2604;
  s.addImage({ path: IMG("mapa_rutas.png"), x: 0.6, y: 1.55, w: mw, h: mh, altText: "Mapa de las seis rutas" });
  const R = [
    ["Pianura Padana", "Torino → Brescia · Piemonte y Lombardia", "A1"],
    ["Dall'Adige all'Adriatico", "Verona → Trieste · Veneto y Friuli", "A2"],
    ["Via Emilia", "Bologna → Parma · Emilia-Romagna", "A2"],
    ["Tra Arno e Trasimeno", "Pisa → Perugia · Toscana y Umbria", "B1"],
    ["Dal Tevere al Golfo", "Roma → Salerno · Lazio y Campania", "B1"],
    ["Il Sud dei tre mari", "Palermo → Bari · Sicilia, Calabria y Puglia", "B2"],
  ];
  const x0 = 0.6 + mw + 0.55, w = 12.73 - x0;
  R.forEach(([name, d, lvl], i) => {
    const y = 1.75 + i * 0.86;
    badge(s, i + 1, x0, y + 0.04, 0.48);
    s.addText([{ text: name, options: { bold: true, fontSize: 17, color: "15181B", fontFace: "Arial", breakLine: true } }, { text: d, options: { fontSize: 13, color: MUTED } }],
      { x: x0 + 0.68, y, w: w - 1.4, h: 0.78, margin: 0, valign: "top", isTextBox: true });
    s.addText(lvl, { x: x0 + w - 0.6, y: y + 0.1, w: 0.6, h: 0.32, fontFace: "Arial", bold: true, fontSize: 12, color: "FFFFFF", align: "center", valign: "middle", margin: 0,
      fill: { color: { A1: "D52B1E", A2: "00843D", B1: "B98300", B2: "8E4F9E" }[lvl] }, rectRadius: 0.1, shape: pres.shapes.ROUNDED_RECTANGLE, isTextBox: true });
  });
  s.addNotes("Las seis rutas recorren ciudades unidas por líneas de tren que existen de verdad: la línea Torino–Milano, la Milano–Venezia, la Via Emilia, el valle del Arno y el lago Trasimeno, la línea de Cassino hasta Nápoles y, al final, la travesía del Estrecho en barco y la línea jónica hasta Tarento y Bari. Las líneas de puntos son los cambios de tren entre una ruta y la siguiente.");
}

/* ================= 6 · Una parada ================= */
{
  const s = content("Una parada por dentro", "Cada parada, una lección completa", "El curso");
  const steps = [
    ["Vocabulario", "Tarjetas nuevas con audio, de su mazo temático."],
    ["Gramática", "Explicación en español con tablas y errores típicos."],
    ["Práctica", "Huecos, tablas, opción múltiple, ordenar y traducir."],
    ["Conversación", "Un diálogo con un personaje de la ciudad."],
    ["Examen", "12 preguntas: con un 80 % se abre la siguiente parada."],
  ];
  steps.forEach(([t, d], i) => {
    const y = 1.95 + i * 0.95;
    s.addShape(pres.shapes.OVAL, { x: 0.6, y, w: 0.5, h: 0.5, fill: { color: i === 4 ? "F2B705" : "173E8C" }, line: { color: "FFFFFF" }, objectName: "Paso " + (i + 1) });
    s.addText(String(i + 1), { x: 0.6, y, w: 0.5, h: 0.5, align: "center", valign: "middle", bold: true, fontFace: "Arial", fontSize: 16, color: i === 4 ? "16191C" : "FFFFFF", margin: 0, isTextBox: true });
    if (i < 4) s.addShape(pres.shapes.LINE, { x: 0.85, y: y + 0.5, w: 0, h: 0.45, line: { color: LINE, width: 2.5 }, objectName: "Conector" });
    s.addText([{ text: t, options: { bold: true, fontSize: 18, fontFace: "Arial", color: "15181B", breakLine: true } }, { text: d, options: { fontSize: 14, color: MUTED } }],
      { x: 1.35, y: y - 0.05, w: 6.2, h: 0.9, margin: 0, valign: "top", isTextBox: true });
  });
  phone(s, "05_parada.png", 9.6, 1.0, 5.7, "Pantalla de una parada");
  s.addNotes("Cada parada sigue siempre el mismo recorrido, de lo más guiado a lo más libre: primero las palabras, luego la regla, luego ejercitarla, luego usarla en una conversación y por último demostrarla en un examen. Si ya dominas una parada, puedes hacer directamente su examen para saltar hasta ella.");
}

/* ================= 7 · Gramática ================= */
pres.addSection({ title: "Aprender" });
{
  const s = content("Gramática", "La gramática se demuestra", "Aprender");
  const types = ["Rellenar huecos", "Completar tablas", "Opción múltiple", "Ordenar frases", "Traducir"];
  types.forEach((t, i) => {
    const x = 0.6 + (i % 3) * 2.45, y = 2.05 + Math.floor(i / 3) * 0.75;
    s.addText(t, { x, y, w: 2.25, h: 0.55, shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.27, fill: { color: SOFT }, line: { color: LINE }, align: "center", valign: "middle", fontFace: "Arial", bold: true, fontSize: 14, color: "15181B", margin: 0, isTextBox: true });
  });
  rows(s, [
    { t: "Corrección al instante", d: "Cada error viene con la explicación de por qué." },
    { t: "Test de dominio", d: "10 preguntas: con un 85 % el tema queda dominado." },
    { t: "Repetición espaciada", d: "Lo dominado vuelve al repaso justo antes de olvidarse." },
  ], 0.6, 3.85, 7.3, 0.95);
  phone(s, "06_tabla.png", 9.6, 1.0, 5.7, "Ejercicio de tabla");
  s.addNotes("Los 29 temas van ordenados por dificultad, desde el verbo essere hasta el periodo hipotético y la concordancia de tiempos. Cada tema se cierra con un test: no basta con leer la explicación, hay que demostrar que se domina. Lo que fallas queda guardado en «Mis errores» para practicarlo después.");
}

/* ================= 8 · Hablar ================= */
{
  const s = content("Hablar", "Conversar desde la primera parada", "Aprender");
  rows(s, [
    { t: "30 conversaciones guiadas", d: "Un amigo, un taxista, un camarero, la farmacéutica, la vecina, la profesora…" },
    { t: "Tú eliges qué decir", d: "Las respuestas cambian el rumbo; si eliges mal, te explica el porqué." },
    { t: "Tu y Lei", d: "Cada personaje usa el registro que tocaría en la vida real." },
    { t: "Conversación libre con Claude", d: "Elige personaje y situación: responde a tu nivel y corrige cada mensaje." },
  ], 0.6, 2.0, 7.4, 1.1);
  phone(s, "07_conversacion.png", 9.6, 1.0, 5.7, "Conversación guiada");
  s.addNotes("Hablar es el objetivo, así que la app hace hablar desde el principio. Las conversaciones guiadas tienen varias respuestas posibles, algunas incorrectas a propósito, como «voglio andare hotel», para enseñar el error y su corrección. En la versión de Claude, además, se puede conversar libremente con un personaje y escribir un diario que Claude corrige.");
}

/* ================= 9 · Leer y escuchar ================= */
{
  const s = content("Leer y escuchar", "Leer, escuchar y pronunciar", "Aprender");
  phone(s, "08_storie.png", 9.6, 1.0, 5.7, "Historias");
  const x = 0.6;
  rows(s, [
    { t: "16 historias, de A1 a B2", d: "Toca cualquier palabra para traducirla; se escuchan frase a frase." },
    { t: "Comprensión auditiva", d: "Dictados, «¿qué has oído?» y pares como caro y carro." },
    { t: "Entrenador de verbos", d: "57 verbos en 8 tiempos; anota qué personas fallas." },
    { t: "Pronunciación", d: "Lee en voz alta y compara con el texto (en la versión instalable)." },
  ], x, 2.0, 7.6, 1.1);
  s.addNotes("Las historias están graduadas por nivel y se apoyan en el vocabulario de las paradas. La comprensión auditiva usa la voz italiana del sistema. Las dobles consonantes, como caro y carro, son una de las grandes dificultades para un hispanohablante, y tienen su propio ejercicio.");
}

/* ================= 10 · Motivación ================= */
{
  const s = content("El viaje engancha", "Cada día, una salida", "Aprender");
  phone(s, "04_ciudad.png", 6.55, 1.0, 5.7, "Ficha de ciudad");
  phone(s, "11_cambio_ruta.png", 9.75, 1.0, 5.7, "Cambio de ruta");
  rows(s, [
    { t: "Panel de salidas", d: "Lo que toca hoy, con los minutos que lleva." },
    { t: "Racha y calendario", d: "Objetivo diario y los últimos tres meses de actividad." },
    { t: "Escenas de viaje", d: "El tren llega a cada ciudad; al acabar una ruta, cambio de tren." },
    { t: "Quiz de geografía", d: "Regiones y curiosidades de las ciudades recorridas." },
  ], 0.6, 2.0, 5.5, 1.15);
  s.addNotes("Mantener el hábito es lo más difícil al aprender un idioma. Por eso el viaje se ve y se celebra: cada parada superada dibuja su tramo en el mapa, cada cambio de ruta tiene su escena, y cada ciudad trae una curiosidad que luego entra en el quiz de geografía.");
}

/* ================= 11 · Dónde se usa ================= */
pres.addSection({ title: "Cómo funciona" });
{
  const s = content("Dónde se usa", "Dos maneras de usarla", "Cómo funciona");
  const col = (x, title, sub, items) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 2.0, w: 5.85, h: 3.9, rectRadius: 0.12, fill: { color: SOFT }, line: { color: SOFT }, objectName: title });
    plate(s, title, x + 0.35, 2.3, 4.2, 0.55, 15);
    s.addText(sub, { x: x + 0.35, y: 3.0, w: 5.15, h: 0.4, fontFace: "Cambria", italic: true, fontSize: 15, color: MUTED, margin: 0, isTextBox: true });
    s.addText(items.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < items.length - 1 } })),
      { x: x + 0.35, y: 3.55, w: 5.15, h: 2.8, fontFace: "Calibri", fontSize: 16, color: "15181B", paraSpaceAfter: 9, valign: "top", margin: 0, isTextBox: true });
  };
  col(0.6, "Enlace de Claude", "Para estudiar con todo", [
    "El progreso se sincroniza solo entre tus dispositivos.",
    "Conversación libre, diario y repaso personalizado con Claude.",
    "Privado: solo lo abre quien tenga acceso.",
  ]);
  col(6.88, "Web en GitHub", "Para instalarla y compartirla", [
    "Se instala como app en iPhone, Android y Windows.",
    "Funciona sin conexión.",
    "Cada persona y cada dispositivo guarda su propio progreso.",
    "Dirección: willcoetsss.github.io/Prossima-Fermata",
  ]);
  s.addNotes("La misma app vive en dos sitios. El enlace de Claude es la versión completa: sincroniza el progreso y tiene las funciones con inteligencia artificial. La web de GitHub es la versión instalable: va sin conexión y se puede compartir con quien quieras; el progreso de cada persona se queda en su dispositivo.");
}

/* ================= 12 · Cómo se actualiza ================= */
{
  const s = content("Mantenimiento", "Un cambio, todo al día", "Cómo funciona");
  const steps = [
    ["Pides un cambio", "En la conversación con Claude."],
    ["Enlace de Claude", "Se publica la versión nueva."],
    ["GitHub", "Se suben los archivos al repositorio."],
    ["Esta carpeta", "Se actualizan los documentos y el registro."],
    ["Tu móvil", "La app coge la versión nueva al abrirse."],
  ];
  const w = 2.2, gap = 0.27;
  steps.forEach(([t, d], i) => {
    const x = 0.6 + i * (w + gap), y = 2.6;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 2.4, rectRadius: 0.12, fill: { color: i === 0 ? "16191C" : SOFT }, line: { color: i === 0 ? "16191C" : SOFT }, objectName: "Paso " + t });
    s.addText(String(i + 1), { x: x + 0.25, y: y + 0.25, w: 0.5, h: 0.5, shape: pres.shapes.OVAL, fill: { color: i === 0 ? "F2B705" : "173E8C" }, align: "center", valign: "middle", bold: true, fontFace: "Arial", fontSize: 15, color: i === 0 ? "16191C" : "FFFFFF", margin: 0, isTextBox: true });
    s.addText([{ text: t, options: { bold: true, fontSize: 17, fontFace: "Arial", color: i === 0 ? "FFFFFF" : "15181B", breakLine: true } }, { text: d, options: { fontSize: 14, color: i === 0 ? SIGNMUTED : MUTED } }],
      { x: x + 0.25, y: y + 0.95, w: w - 0.45, h: 1.3, margin: 0, valign: "top", isTextBox: true });
    if (i < 4) s.addShape(pres.shapes.ISOSCELES_TRIANGLE, { x: x + w + 0.05, y: y + 1.05, w: 0.17, h: 0.3, rotate: 90, fill: { color: "B7BCB4" }, line: { color: "B7BCB4" }, objectName: "Flecha" });
  });
  s.addText("Tu progreso no se toca: vive en cada dispositivo o en tu cuenta de Claude, nunca en estos archivos.", { x: 0.6, y: 5.45, w: 12.1, h: 0.5, fontFace: "Cambria", italic: true, fontSize: 16, color: MUTED, margin: 0, isTextBox: true });
  s.addNotes("Cada mejora sigue el mismo camino. Basta con pedirla en la conversación: Claude publica la nueva versión en el enlace, sube los archivos al repositorio de GitHub y actualiza esta carpeta de proyecto, con una línea nueva en el registro de cambios del LEEME. La app instalada en el móvil detecta la versión nueva la siguiente vez que se abre con conexión.");
}

/* ================= 13 · Próximas paradas ================= */
{
  const s = content("Ideas para seguir", "Próximas paradas", "Cómo funciona");
  const ideas = [
    ["Nuevas rutas", "Liguria, Marche y Abruzzo, y Cerdeña: más ciudades y temas de repaso."],
    ["Voces reales", "Audio grabado por hablantes nativos en lugar de la voz del sistema."],
    ["Progreso en la nube", "Sincronizar también la versión de GitHub entre dispositivos."],
    ["Exámenes oficiales", "Simulacros tipo CILS y CELI para los niveles B1 y B2."],
  ];
  ideas.forEach(([t, d], i) => {
    const x = 0.6 + (i % 2) * 6.27, y = 2.0 + Math.floor(i / 2) * 2.3;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 5.85, h: 2.05, rectRadius: 0.12, fill: { color: SOFT }, line: { color: SOFT }, objectName: "Idea " + t });
    badge(s, i + 1, x + 0.35, y + 0.35, 0.5, ROUTE[[0, 1, 3, 5][i]]);
    s.addText([{ text: t, options: { bold: true, fontSize: 19, fontFace: "Arial", color: "15181B", breakLine: true } }, { text: d, options: { fontSize: 15, color: MUTED } }],
      { x: x + 1.1, y: y + 0.32, w: 4.45, h: 1.5, margin: 0, valign: "top", isTextBox: true });
  });
  s.addNotes("Son ideas, no compromisos: posibles siguientes pasos para cuando el curso actual esté recorrido. Las nuevas rutas servirían como repaso de toda la gramática con ciudades que hoy quedan fuera del mapa.");
}

/* ================= 14 · Cierre ================= */
{
  const s = pres.addSlide({ masterName: "PF Oscuro", sectionTitle: "Cómo funciona" });
  s.addImage({ path: IMG("logo-512.png"), x: 0.75, y: 1.1, w: 2.6, h: 2.6, altText: "Logo: pizza «Boh»" });
  s.addText("Boh?", { x: 3.8, y: 1.35, w: 8, h: 1.1, fontFace: "Arial", fontSize: 54, bold: true, color: "F2B705", margin: 0, isTextBox: true });
  s.addText("Cuando no sepas algo, que sea por poco tiempo.", { x: 3.8, y: 2.45, w: 8.6, h: 0.8, fontFace: "Cambria", italic: true, fontSize: 24, color: "E9EBE6", margin: 0, isTextBox: true });
  plate(s, "Prossima fermata: il tuo italiano", 0.75, 4.55, 7.4, 0.8, 22);
  s.addText("willcoetsss.github.io/Prossima-Fermata", { x: 0.75, y: 5.7, w: 8, h: 0.4, fontFace: "Arial", fontSize: 15, color: SIGNMUTED, margin: 0, isTextBox: true });
  s.addNotes("«Boh» es la respuesta italiana universal a «no lo sé». La app está hecha para que cada vez haya que decirlo menos. La dirección pública es la de GitHub Pages; la versión completa, con sincronización y Claude, está en el enlace de Claude.");
}

(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("OK", OUT);
})();
