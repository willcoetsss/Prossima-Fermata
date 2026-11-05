/* ===== TEMPORAL: pestaña Firenze (quitar cuando se pida) =====
   Todo lo de la pestaña provisional está entre esta línea y «FIN TEMPORAL FIRENZE»,
   más el <script id="firenze"> con los datos. Quitarla no toca el progreso. */
const FIR = JSON.parse(document.getElementById("firenze").textContent);
const FIR_DEF = {lei:"Chiara", pa:"Paolo", ma:"Lucia", fra:"Matteo", citta:"Madrid"};
IC.giglio = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.5c-2.2 2.6-2.2 6.4 0 9 2.2-2.6 2.2-6.4 0-9z"/><path d="M12 11.5C11 8.3 7.4 6.8 4.6 8.3c2.6.6 3.6 3.2 3 5.7"/><path d="M12 11.5c1-3.2 4.6-4.7 7.4-3.2-2.6.6-3.6 3.2-3 5.7"/><path d="M7 14h10"/><path d="M12 14v7.5"/><path d="M12 17.5c-1.8 0-3.3 1.2-3.8 4M12 17.5c1.8 0 3.3 1.2 3.8 4"/></svg>';
TABS.push(["firenze", "Firenze", IC.giglio]);
const firN = () => Object.assign({}, FIR_DEF, S.fir || {});
function firFill(s) {
  const n = firN(); const j = v => JSON.stringify(String(v)).slice(1, -1);
  const map = {lei:n.lei, pa:n.pa, ma:n.ma, fra:n.fra, citta:n.citta, nome:S.settings.name || "Alex", o:S.settings.gender === "a" ? "a" : "o"};
  return s.replace(/\{(lei|pa|ma|fra|citta|nome|o)\}/g, (_, k) => j(map[k]));
}
const firObj = x => JSON.parse(firFill(JSON.stringify(x)));
function firReg() {
  FIR.dialogs.forEach(d => { DLG[d.id] = firObj(d); });
  DECK.firenze = firObj(FIR.deck);
}
firReg();
const firIsDlg = () => VIEW.name === "dialog" && D && /^fi-/.test(D.d.id);
const _firNav = renderNav;
renderNav = function () {
  _firNav();
  const on = VIEW.name === "firenze" || firIsDlg() || (VIEW.name === "ai" && AI && AI.fir);
  if (on) document.querySelectorAll("#nav [data-a=tab]").forEach(b => b.dataset.v === "firenze" ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current"));
};
const FIR_WHO = {
  pa: n => ({n:n.pa, reg:"tu", r:`el padre de ${n.lei} (la novia del estudiante), arquitecto florentino de unos sesenta años, simpático y curioso, apasionado del Renacimiento y de Brunelleschi. Es la primera vez que conoces al estudiante, que es de España y vive en ${n.citta}. Trabajas con tu mujer, ${n.ma}, en un estudio de arquitectura de Florencia`}),
  ma: n => ({n:n.ma, reg:"tu", r:`la madre de ${n.lei} (la novia del estudiante), arquitecta florentina especializada en restauración, cariñosa, habladora y muy hospitalaria. Es la primera vez que conoces al estudiante, que es de España y vive en ${n.citta}. Trabajas con tu marido, ${n.pa}, en un estudio de arquitectura de Florencia`}),
  fra: n => ({n:n.fra, reg:"tu", r:`el hermano de ${n.lei} (la novia del estudiante), un chico florentino joven, bromista y aficionado a la Fiorentina y a la música. Estás conociendo al estudiante, que es de España y vive en ${n.citta}`}),
};
const FIR_ROLE = {pa:"padre", ma:"madre", fra:"hermano"};
VIEWS.firenze = () => {
  firReg();
  const n = firN(); const ds = FIR.dialogs; const done = ds.filter(d => S.dialogs[d.id]).length;
  const lc = "var(--r4)"; const lvl = (S.fir && S.fir.lvl) || "A2";
  const nameField = (k, label) => `<div class="field"><label for="fz-${k}">${label}</label><input id="fz-${k}" value="${esc(n[k])}" autocomplete="off"></div>`;
  return `<div class="stack" style="--lc:${lc}">
    <div class="top"><div><div class="label">Pestaña provisional · Firenze</div><h1>In famiglia a Firenze</h1></div><span class="chip">${done}/${ds.length}</span></div>
    <p class="muted">Para preparar la visita a la familia de ${esc(n.lei)}: conversaciones con sus padres, arquitectos, y con su hermano, sobre arquitectura sencilla y sobre las diferencias entre España e Italia. Toca cualquier palabra en italiano para ver qué significa.</p>
    <details class="panel"${S.fir && S.fir.set ? "" : " open"}><summary><b>Sus nombres</b> <span class="small muted">· ${esc(n.lei)}, ${esc(n.pa)}, ${esc(n.ma)} y ${esc(n.fra)}</span></summary>
      <div class="stack" style="gap:10px;margin-top:12px">
        <p class="small muted">Escribe sus nombres de verdad y las conversaciones los usarán.</p>
        <div class="fz-names">${nameField("lei", "Tu novia")}${nameField("pa", "Su padre")}${nameField("ma", "Su madre")}${nameField("fra", "Su hermano")}${nameField("citta", "Tu ciudad")}</div>
        <button class="btn primary" data-a="firSave">Guardar nombres</button></div></details>
    ${FIR.groups.map(([t, sub, ids]) => `<section class="stack" style="gap:8px"><div><div class="label">${esc(sub)}</div><h2>${esc(t)}</h2></div><div class="list">${ids.map(id => { const d = DLG[id]; return `
      <button class="li" data-a="dialog" data-v="${d.id}" style="--lc:${lc}"><span class="avatar">${ROLE_INIT(d.who)}</span><span class="grow"><b>${esc(d.title)}</b><br><span class="small muted">${esc(d.who)} · ${esc(d.role)} · ${d.lvl} · ${d.reg === "Lei" ? "empieza de usted" : "de tú"}</span></span>${S.dialogs[d.id] ? `<span class="chip ok">Hecha</span>` : ""}</button>`; }).join("")}</div></section>`).join("")}
    <section class="panel stack" id="fir-ai"${SAMPLE ? "" : " hidden"}><div><div class="label">Con Claude</div><h2>Habla libremente con ellos</h2></div>
      <p class="muted">Claude hace de ${esc(n.pa)}, ${esc(n.ma)} o ${esc(n.fra)} y te corrige cada mensaje. Elige una escena:</p>
      <div class="seg" role="group" aria-label="Nivel">${["A2", "B1"].map(l => `<button aria-pressed="${lvl === l}" data-a="firLvl" data-v="${l}">Nivel ${l}</button>`).join("")}</div>
      <div class="list">${FIR.scenes.map(([w, s], i) => `<button class="li" data-a="firAi" data-v="${i}"><span class="avatar">${ROLE_INIT(n[w])}</span><span class="grow"><b>${esc(n[w])}</b> <span class="small muted">· ${FIR_ROLE[w]}</span><br><span class="small">${esc(firFill(s))}</span></span></button>`).join("")}</div></section>
    <section class="panel stack"><div><div class="label">${DECK.firenze.cards.length} tarjetas</div><h2>Vocabulario para la visita</h2></div>
      <p class="small muted">Arquitectura básica, frases de la mesa y expresiones para opinar y comparar.</p>
      ${studyModes("deck", "firenze")}<button class="btn sm" data-a="deck" data-v="firenze">Ver todas las tarjetas</button></section>
    <section class="stack" style="gap:8px"><div><div class="label">Para salir del paso</div><h2>Frases salvavidas</h2></div>
      <div class="list">${firObj(FIR.frasi).map(([a, b]) => `<div class="word"><span class="grow"><span class="it">${esc(a)}</span><br><span class="es">${esc(b)}</span></span>${speakBtn(a)}</div>`).join("")}</div></section>
    <section class="stack" style="gap:8px"><div><div class="label">Choque de culturas</div><h2>Lo que conviene saber</h2></div>
      ${FIR.notes.map(([t, b]) => `<details class="culture"><summary><span class="label">Nota culturale</span><b>${esc(t)}</b></summary><p>${inline(b)}</p></details>`).join("")}</section>
    <p class="small muted">Esta pestaña es temporal: cuando vuelvas del viaje, pide que la quiten. Las tarjetas que hayas aprendido y el resto de tu progreso no se tocan.</p>
  </div>`;
};
Object.assign(A, {
  firSave: () => {
    const v = {}; Object.keys(FIR_DEF).forEach(k => { const el = $("#fz-" + k); v[k] = (el && el.value.trim()) || FIR_DEF[k]; });
    S.fir = Object.assign(S.fir || {}, v, {set:1}); save(); firReg(); render(); toast("Nombres guardados");
  },
  firLvl: el => { S.fir = Object.assign(S.fir || {}, {lvl:el.dataset.v}); saveLocal(); render(); },
  firAi: el => {
    const [w, s] = FIR.scenes[+el.dataset.v]; const n = firN();
    const p = FIR_WHO[w](n); p.r += `. Estáis en Florencia, en casa de la familia. Habla de temas sencillos y cotidianos; si sale la arquitectura o alguna diferencia cultural entre España e Italia, explícala con palabras fáciles`;
    AI = {started:true, fir:true, p, sit:firFill(s), lvl:(S.fir && S.fir.lvl) || "A2", log:[], busy:false, showEs:false, sug:[]};
    go("ai"); aiTurn("");
  },
});
{ let t = 0; const iv = setInterval(() => { const c = $("#fir-ai"); if (SAMPLE && c) c.hidden = false; if (SAMPLE || ++t > 60) clearInterval(iv); }, 500); }
/* ===== FIN TEMPORAL FIRENZE ===== */
