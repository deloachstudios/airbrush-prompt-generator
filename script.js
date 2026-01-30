// Airbrush Prompt Generator - Replit Test Build
// Notes:
// - Button selections are tracked in state.
// - Prompt updates live on any change.
// - Gradient supports 8 directions + Next/Random.
// - Per-section colors are supported (name, grad A/B, bottom).
// - HEX is prioritized when present.
 
const state = {
  letterStyle: "dripping",       // dripping | bubble
  fillType: "solid",             // solid | gradient
  effects: new Set(),            // outline, glow
  gradDir: "L→R",                // direction label
  bottomOn: true,
  transparent: false,
 
  // Preset picks
  nameColorPreset: "Purple",
  gradAColorPreset: "Purple",
  gradBColorPreset: "Teal",
  bottomColorPreset: "",
 
  // Custom color inputs
  nameColorCustom: "",
  nameColorHex: "",
  gradAColorCustom: "",
  gradAColorHex: "",
  gradBColorCustom: "",
  gradBColorHex: "",
  bottomColorCustom: "",
  bottomColorHex: "",
};
 
const DIRS = ["L→R","R→L","T→B","B→T","TL→BR","BR→TL","TR→BL","BL→TR"];
 
// -------- helpers
function $(id){ return document.getElementById(id); }
 
function clean(s){
  return (s || "").trim();
}
 
function joinName(line1, line2){
  const a = clean(line1);
  const b = clean(line2);
  if (!a) return "";
  return b ? `${a} ${b}` : a;
}
 
function colorDescription(preset, customName, hex){
  const h = clean(hex);
  const n = clean(customName);
  if (h && n) return `${n} (${h})`;
  if (h) return `${h}`;
  if (n) return `${n} (approximate)`;
  return preset || "";
}
 
function styleDescription(style){
  if (style === "bubble") return "rounded bubble graffiti-style";
  return "dripping graffiti-style";
}
 
function effectsDescription(effectsSet){
  const arr = Array.from(effectsSet);
  if (arr.length === 0) return "clean airbrush shading";
  if (arr.length === 2) return "outline and glow effects";
  return arr[0] === "outline" ? "outline effects" : "glow effects";
}
 
function normalizeDirLabel(dir){
  // Make direction text readable in a sentence
  switch(dir){
    case "L→R": return "left-to-right";
    case "R→L": return "right-to-left";
    case "T→B": return "top-to-bottom";
    case "B→T": return "bottom-to-top";
    case "TL→BR": return "top-left to bottom-right";
    case "BR→TL": return "bottom-right to top-left";
    case "TR→BL": return "top-right to bottom-left";
    case "BL→TR": return "bottom-left to top-right";
    default: return dir;
  }
}
 
// -------- button group logic
function wireSingleSelectGroup(groupName, onSelect){
  const root = document.querySelector(`[data-group="${groupName}"]`);
  if (!root) return;
 
  root.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
 
    // Clear previous selection
    [...root.querySelectorAll("button")].forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
 
    onSelect(btn);
    updatePrompt();
  });
}
 
function wireColorGroup(groupName, stateKey){
  const root = document.querySelector(`[data-group="${groupName}"]`);
  if (!root) return;
 
  root.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
 
    [...root.querySelectorAll("button")].forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
 
    state[stateKey] = btn.dataset.color || "";
    updatePrompt();
  });
}
 
function wireMultiSelect(groupSelector, onToggle){
  const root = document.querySelector(`[data-multi="${groupSelector}"]`);
  if (!root) return;
 
  root.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
 
    btn.classList.toggle("selected");
    onToggle(btn);
    updatePrompt();
  });
}
 
// -------- prompt build
function buildPrompt(){
  const name1 = $("nameLine1").value;
  const name2 = $("nameLine2").value;
  const nameText = joinName(name1, name2);
 
  // Style
  const style = styleDescription(state.letterStyle);
 
  // Name color (for solid)
  const nameColorDesc = colorDescription(
    state.nameColorPreset,
    state.nameColorCustom,
    state.nameColorHex
  ) || "a bold color";
 
  // Gradient colors
  const gradADesc = colorDescription(
    state.gradAColorPreset,
    state.gradAColorCustom,
    state.gradAColorHex
  ) || "Color A";
 
  const gradBDesc = colorDescription(
    state.gradBColorPreset,
    state.gradBColorCustom,
    state.gradBColorHex
  ) || "Color B";
 
  // Fill description
  let fillDesc = "solid";
  let colorPhrase = `in solid ${nameColorDesc}`;
  if (state.fillType === "gradient"){
    const dirReadable = normalizeDirLabel(state.gradDir);
    fillDesc = `a smooth gradient from ${gradADesc} to ${gradBDesc}, oriented ${dirReadable}`;
    colorPhrase = `in ${fillDesc}`;
  }
 
  // Effects
  const effects = effectsDescription(state.effects);
 
  // Elements
  const elements = clean($("elementsList").value);
  const elemColors = clean($("elementColorNotes").value);
  const elemExtra = clean($("elementExtraDetails").value);
 
  const elementsDesc = elements ? elements : "complementary themed elements";
  const elemColorDesc = elemColors ? `Element color notes: ${elemColors}.` : "";
  const elemExtraDesc = elemExtra ? `${elemExtra}.` : "";
 
  // Background
  const bg = clean($("backgroundDesc").value);
  const bgDesc = bg ? bg : "clean solid white background";
 
  // Bottom text
  let bottomSentence = "";
  if (state.bottomOn){
    const b1 = clean($("bottomLine1").value);
    const b2 = clean($("bottomLine2").value);
    const bottomText = b2 ? `${b1} ${b2}` : b1;
 
    if (bottomText){
      // bottom color override, fallback to name color (solid) or gradB if gradient
      const bottomColor = colorDescription(
        state.bottomColorPreset || "",
        state.bottomColorCustom,
        state.bottomColorHex
      );
 
      let bottomColorPhrase = "";
      if (bottomColor){
        bottomColorPhrase = ` in ${bottomColor}`;
      } else {
        // default
        bottomColorPhrase = state.fillType === "gradient"
          ? ` using the design’s gradient palette`
          : ` using the name color`;
      }
 
      bottomSentence = ` Add bottom text reading “${bottomText}” below the name in a matching style${bottomColorPhrase}.`;
    }
  }
 
  // Transparency
  const transparencySentence = state.transparent
    ? " Use a fully transparent background if supported (PNG-style)."
    : " Use a solid background (defaults to white unless you describe otherwise).";
 
  // Watermark (always on)
  const watermarkSentence =
    " Include a small, low-opacity watermark reading “Generated with DeLoach Studios Airbrush Prompt Generator” placed subtly near the bottom edge.";
 
  // Guard: name required
  if (!clean(nameText)){
    return "Enter Name Line 1 to generate your prompt.";
  }
 
  return `An airbrushed design featuring the name “${nameText}” arranged across up to two lines ${colorPhrase} with ${style} lettering and ${effects}. Include the following elements: ${elementsDesc}. ${elemColorDesc} ${elemExtraDesc} Background setting: ${bgDesc}.${bottomSentence}${transparencySentence} Overall style should be bold, high-contrast, print-ready, with crisp readable text.${watermarkSentence}`;
}
 
function updatePrompt(){
  $("promptOut").value = buildPrompt();
  updateGeneratedTimestamp();
  showPromptGlow();
}
 
function formatTime(value){
  return value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
 
function updateGeneratedTimestamp(){
  const el = $("generatedAt");
  if (!el) return;
  el.textContent = `Generated: ${formatTime(new Date())}`;
}
 
function updateCopiedTimestamp(){
  const el = $("copiedAt");
  if (!el) return;
  el.textContent = `Copied: ${formatTime(new Date())}`;
}
 
let promptGlowTimer = null;
function showPromptGlow(){
  const output = $("promptOut");
  if (!output) return;
 
  output.classList.add("prompt-flash");
  if (promptGlowTimer) clearTimeout(promptGlowTimer);
  promptGlowTimer = setTimeout(() => {
    output.classList.remove("prompt-flash");
  }, 1200);
}
 
// -------- gradient direction controls
function setDir(dir){
  state.gradDir = dir;
  $("dirCurrent").textContent = dir;
  // Highlight button in direction group
  const group = document.querySelector(`[data-group="gradDir"]`);
  if (group){
    [...group.querySelectorAll("button")].forEach(b => {
      b.classList.toggle("selected", b.dataset.value === dir);
    });
  }
}
 
function nextDir(){
  const idx = DIRS.indexOf(state.gradDir);
  const next = DIRS[(idx + 1 + DIRS.length) % DIRS.length];
  setDir(next);
  updatePrompt();
}
 
function randomDir(){
  const next = DIRS[Math.floor(Math.random() * DIRS.length)];
  setDir(next);
  updatePrompt();
}
 
// -------- show/hide areas
function updateVisibility(){
  // Gradient area visible only if gradient selected
  const ga = $("gradientArea");
  ga.style.display = (state.fillType === "gradient") ? "grid" : "none";
 
  // Bottom area visible only if bottomOn true
  $("bottomArea").style.display = state.bottomOn ? "block" : "none";
}
 
// -------- init wiring
function init(){
  // Defaults: select initial buttons
  // letter style
  wireSingleSelectGroup("letterStyle", (btn) => {
    state.letterStyle = btn.dataset.value;
  });
 
  // fillType
  wireSingleSelectGroup("fillType", (btn) => {
    state.fillType = btn.dataset.value;
    updateVisibility();
  });
 
  // bottom on/off
  wireSingleSelectGroup("bottomOnOff", (btn) => {
    state.bottomOn = (btn.dataset.value === "on");
    updateVisibility();
  });
 
  // transparency
  wireSingleSelectGroup("transparentOnOff", (btn) => {
    state.transparent = (btn.dataset.value === "on");
  });
 
  // Color groups
  wireColorGroup("nameColorPreset", "nameColorPreset");
  wireColorGroup("gradAColorPreset", "gradAColorPreset");
  wireColorGroup("gradBColorPreset", "gradBColorPreset");
  wireColorGroup("bottomColorPreset", "bottomColorPreset");
 
  // Gradient direction group
  wireSingleSelectGroup("gradDir", (btn) => {
    setDir(btn.dataset.value);
  });
 
  // Effects multi-select
  wireMultiSelect("effects", (btn) => {
    const v = btn.dataset.value;
    if (btn.classList.contains("selected")) state.effects.add(v);
    else state.effects.delete(v);
  });
 
  // Inputs update prompt
  const inputs = [
    "nameLine1","nameLine2",
    "nameColorCustom","nameColorHex",
    "gradAColorCustom","gradAColorHex",
    "gradBColorCustom","gradBColorHex",
    "elementsList","elementColorNotes","elementExtraDetails",
    "backgroundDesc",
    "bottomLine1","bottomLine2",
    "bottomColorCustom","bottomColorHex"
  ];
  inputs.forEach(id => {
    $(id).addEventListener("input", () => {
      // also keep state mirror for custom fields
      if (id === "nameColorCustom") state.nameColorCustom = $(id).value;
      if (id === "nameColorHex") state.nameColorHex = $(id).value;
 
      if (id === "gradAColorCustom") state.gradAColorCustom = $(id).value;
      if (id === "gradAColorHex") state.gradAColorHex = $(id).value;
 
      if (id === "gradBColorCustom") state.gradBColorCustom = $(id).value;
      if (id === "gradBColorHex") state.gradBColorHex = $(id).value;
 
      if (id === "bottomColorCustom") state.bottomColorCustom = $(id).value;
      if (id === "bottomColorHex") state.bottomColorHex = $(id).value;
 
      updatePrompt();
    });
  });
 
  // Next/Random direction
  $("nextDir").addEventListener("click", nextDir);
  $("randDir").addEventListener("click", randomDir);
 
  // Copy
  $("copyPrompt").addEventListener("click", async () => {
    const text = $("promptOut").value;
    try{
      await navigator.clipboard.writeText(text);
      $("copyPrompt").textContent = "COPIED ✅";
      setTimeout(() => $("copyPrompt").textContent = "COPY PROMPT", 1200);
    }catch{
      // fallback
      $("promptOut").select();
      document.execCommand("copy");
      $("copyPrompt").textContent = "COPIED ✅";
      setTimeout(() => $("copyPrompt").textContent = "COPY PROMPT", 1200);
    }
    updateCopiedTimestamp();
  });
 
  // Reset
  $("resetAll").addEventListener("click", () => {
    // simple reset: reload page
    location.reload();
  });
 
  // Set initial selections (simulate click)
  // letter style
  document.querySelector(`[data-group="letterStyle"] button[data-value="${state.letterStyle}"]`)?.click();
  // fill
  document.querySelector(`[data-group="fillType"] button[data-value="${state.fillType}"]`)?.click();
  // bottom on/off
  document.querySelector(`[data-group="bottomOnOff"] button[data-value="${state.bottomOn ? "on":"off"}"]`)?.click();
  // transparency
  document.querySelector(`[data-group="transparentOnOff"] button[data-value="${state.transparent ? "on":"off"}"]`)?.click();
 
  // color presets
  document.querySelector(`[data-group="nameColorPreset"] button[data-color="${state.nameColorPreset}"]`)?.click();
  document.querySelector(`[data-group="gradAColorPreset"] button[data-color="${state.gradAColorPreset}"]`)?.click();
  document.querySelector(`[data-group="gradBColorPreset"] button[data-color="${state.gradBColorPreset}"]`)?.click();
 
  // direction
  setDir(state.gradDir);
 
  updateVisibility();
  updatePrompt();
}
 
init();
 
 

