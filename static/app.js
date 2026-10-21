const $ = (id) => document.getElementById(id);

const form = $("researchForm");
const topicInput = $("topic");
const runBtn = $("runBtn");
const hero = $("hero");
const how = $("how");
const pipelineWrap = $("pipelineWrap");
const progressBar = $("progressBar");
const results = $("results");
const errorBox = $("errorBox");

const reportEl = $("report");
const searchEl = $("searchOut");
const scrapeEl = $("scrapeOut");
const sourcesEl = $("sources");
const criticBody = $("criticBody");
const scoreRing = $("scoreRing");
const scoreText = $("scoreText");
const scoreLabel = $("scoreLabel");
const statsRow = $("statsRow");
const truncWarn = $("truncWarn");

let currentReport = "";
let currentTopic = "";
let criticData = null;
let activeTab = "strengths";

const STATUS_TEXT = { waiting: "Waiting", running: "Working…", done: "Done", error: "Failed" };

/* ---------------- theme ---------------- */
function applyTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  $("themeBtn").textContent = t === "dark" ? "🌙" : "☀️";
}
(function initTheme() {
  let t = "dark";
  try { t = localStorage.getItem("rm-theme") || "dark"; } catch (e) {}
  applyTheme(t);
})();
$("themeBtn").addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("rm-theme", next); } catch (e) {}
});

/* ---------------- rotating placeholder ---------------- */
const examples = [
  "Future of quantum computing in 2026",
  "Impact of AI on healthcare jobs",
  "How is India adopting solar energy?",
  "Latest trends in space exploration",
  "Is remote work here to stay?",
];
let exIdx = 0, charIdx = 0, deleting = false;
function typePlaceholder() {
  if (document.activeElement === topicInput || topicInput.value) { setTimeout(typePlaceholder, 1200); return; }
  const full = examples[exIdx];
  charIdx += deleting ? -1 : 1;
  topicInput.placeholder = full.slice(0, charIdx) + "▍";
  let delay = deleting ? 25 : 55;
  if (!deleting && charIdx === full.length) { deleting = true; delay = 1600; }
  else if (deleting && charIdx === 0) { deleting = false; exIdx = (exIdx + 1) % examples.length; delay = 400; }
  setTimeout(typePlaceholder, delay);
}
typePlaceholder();

/* ---------------- helpers ---------------- */
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  setTimeout(() => t.classList.add("hidden"), 2600);
}

function setStep(n, state) {
  const el = document.querySelector(`.step[data-step="${n}"]`);
  el.classList.remove("running", "done", "error");
  if (state !== "waiting") el.classList.add(state);
  el.querySelector(".status").textContent = STATUS_TEXT[state];
}

function setProgress(done) {
  progressBar.style.width = (done / 4) * 100 + "%";
}

function cleanMd(text) {
  // a truncated LLM answer can leave an unmatched ** which shows up literally
  const count = (text.match(/\*\*/g) || []).length;
  if (count % 2 === 1) {
    const i = text.lastIndexOf("**");
    text = text.slice(0, i) + text.slice(i + 2);
  }
  return text;
}

function renderMd(text) {
  return marked.parse(cleanMd(text || ""));
}

function skeletonLines() {
  return '<div class="skeleton lines">' + "<i></i>".repeat(9) + "</div>";
}

/* ---------------- critic parsing ---------------- */
function parseCritic(text) {
  const scoreM = text.match(/Score:\s*(\d+(?:\.\d+)?)\s*\/\s*10/i);
  const marks = [
    { key: "strengths", re: /Strengths:/i },
    { key: "improve", re: /Areas to Improve:/i },
    { key: "verdict", re: /One line verdict:/i },
  ].map(m => ({ ...m, idx: text.search(m.re) })).filter(m => m.idx >= 0).sort((a, b) => a.idx - b.idx);

  const out = { score: scoreM ? parseFloat(scoreM[1]) : null, strengths: "", improve: "", verdict: "" };
  marks.forEach((m, i) => {
    const start = text.slice(m.idx).search(/:/) + m.idx + 1;
    const end = i + 1 < marks.length ? marks[i + 1].idx : text.length;
    out[m.key] = text.slice(start, end).trim();
  });
  out.parsed = marks.length > 0;
  out.raw = text;
  return out;
}

function renderCriticTab() {
  document.querySelectorAll("#criticTabs .tab").forEach(t =>
    t.classList.toggle("active", t.dataset.tab === activeTab));
  if (!criticData) { criticBody.innerHTML = '<div class="skeleton"><i></i><i></i><i></i><i></i></div>'; return; }

  criticBody.className = "tab-body" + (activeTab === "improve" ? " improve" : "");
  if (!criticData.parsed) { criticBody.innerHTML = renderMd(criticData.raw); return; }

  const body = criticData[activeTab];
  if (!body) { criticBody.innerHTML = '<p class="muted">Nothing here.</p>'; return; }
  if (activeTab === "verdict") {
    criticBody.innerHTML = '<div class="verdict-box">' + marked.parseInline(cleanMd(body.replace(/^\.+\s*/, ""))) + "</div>";
  } else {
    criticBody.innerHTML = renderMd(body);
  }
}

document.querySelectorAll("#criticTabs .tab").forEach(btn =>
  btn.addEventListener("click", () => { activeTab = btn.dataset.tab; renderCriticTab(); }));

/* ---------------- sources ---------------- */
function renderSources(text) {
  const titleRe = /Title:\s*(.+)\s*\nURL:\s*(\S+)/g;
  const found = [];
  let m;
  while ((m = titleRe.exec(text)) !== null) found.push({ title: m[1].trim(), url: m[2].trim() });
  if (!found.length) {
    (text.match(/https?:\/\/[^\s)\]>"']+/g) || []).forEach(u => found.push({ title: u, url: u }));
  }
  const seen = new Set();
  const uniq = found.filter(s => !seen.has(s.url) && seen.add(s.url));
  $("statSources").textContent = uniq.length;
  if (!uniq.length) { sourcesEl.innerHTML = '<p class="muted">No links found in the search output.</p>'; return; }

  sourcesEl.innerHTML = "";
  uniq.forEach((s, i) => {
    let host = s.url;
    try { host = new URL(s.url).hostname.replace(/^www\./, ""); } catch (e) {}
    const a = document.createElement("a");
    a.className = "source";
    a.href = s.url; a.target = "_blank"; a.rel = "noopener";
    a.style.animationDelay = i * 80 + "ms";
    a.innerHTML = `<img alt="" src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64" />
                   <div><b></b><small></small></div>`;
    a.querySelector("b").textContent = s.title;
    a.querySelector("small").textContent = host;
    sourcesEl.appendChild(a);
  });
}

/* ---------------- reset / step handling ---------------- */
function resetUI() {
  [1, 2, 3, 4].forEach(n => setStep(n, "waiting"));
  setProgress(0);
  errorBox.classList.add("hidden");
  truncWarn.classList.add("hidden");
  statsRow.classList.add("hidden");
  reportEl.innerHTML = skeletonLines();
  criticData = null; activeTab = "strengths"; renderCriticTab();
  searchEl.textContent = ""; scrapeEl.textContent = "";
  sourcesEl.innerHTML = '<p class="muted">Sources appear after the search step.</p>';
  scoreText.textContent = "–"; scoreRing.style.setProperty("--p", 0);
  scoreLabel.textContent = "Waiting for review…";
  $("statWords").textContent = "0"; $("statRead").textContent = "0";
  $("statSources").textContent = "0"; $("statScore").textContent = "–";
  currentReport = "";
}

function handleStepDone(step, content) {
  setStep(step, "done");
  setProgress(step);

  if (step === 1) { searchEl.textContent = content; renderSources(content); statsRow.classList.remove("hidden"); }
  if (step === 2) scrapeEl.textContent = content;
  if (step === 3) {
    currentReport = content;
    reportEl.innerHTML = renderMd(content);
    const words = content.trim().split(/\s+/).length;
    $("statWords").textContent = words;
    $("statRead").textContent = Math.max(1, Math.round(words / 200));
    if (!/[.!?)\]"”*`|]\s*$/.test(content.trim())) truncWarn.classList.remove("hidden");
  }
  if (step === 4) {
    criticData = parseCritic(content);
    renderCriticTab();
    if (criticData.score !== null) {
      scoreText.textContent = criticData.score + "/10";
      $("statScore").textContent = criticData.score + "/10";
      scoreRing.style.setProperty("--p", Math.min(criticData.score * 10, 100));
      scoreLabel.textContent =
        criticData.score >= 8 ? "Excellent quality" :
        criticData.score >= 6 ? "Good, with room to improve" : "Needs work";
    } else {
      scoreLabel.textContent = "Review complete";
    }
  }
}

function showError(msg) {
  errorBox.textContent = "⚠️ " + msg;
  errorBox.classList.remove("hidden");
  document.querySelectorAll(".step.running").forEach(el => {
    el.classList.remove("running"); el.classList.add("error");
    el.querySelector(".status").textContent = STATUS_TEXT.error;
  });
  finishRun();
}

function finishRun() {
  runBtn.disabled = false;
  runBtn.querySelector("span").textContent = "Start Research";
}

function handleEvent(event, data) {
  if (event === "step") {
    if (data.status === "running") setStep(data.step, "running");
    else if (data.status === "done") handleStepDone(data.step, data.content);
  } else if (event === "error") {
    showError(data.message);
  } else if (event === "complete") {
    finishRun();
    toast("✨ Research complete");
  }
}

/* ---------------- SSE over fetch ---------------- */
async function streamResearch(topic) {
  const res = await fetch("/api/research", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic }),
  });
  if (!res.ok || !res.body) throw new Error("Server error " + res.status);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop();
    for (const part of parts) {
      let event = "message", data = "";
      for (const line of part.split("\n")) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) data += line.slice(5).trim();
      }
      if (data) handleEvent(event, JSON.parse(data));
    }
  }
}

/* ---------------- events ---------------- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const topic = topicInput.value.trim();
  if (!topic) return;

  currentTopic = topic;
  resetUI();
  how.classList.add("hidden");
  pipelineWrap.classList.remove("hidden");
  results.classList.remove("hidden");
  runBtn.disabled = true;
  runBtn.querySelector("span").textContent = "Researching…";
  pipelineWrap.scrollIntoView({ behavior: "smooth", block: "start" });

  try { await streamResearch(topic); }
  catch (err) { showError(err.message); }
  finally { finishRun(); }
});

document.querySelectorAll(".chip").forEach(chip =>
  chip.addEventListener("click", () => { topicInput.value = chip.dataset.topic; topicInput.focus(); }));

$("copyBtn").addEventListener("click", async (e) => {
  if (!currentReport) return;
  await navigator.clipboard.writeText(currentReport);
  e.target.textContent = "Copied!";
  setTimeout(() => (e.target.textContent = "Copy"), 1500);
});

$("downloadBtn").addEventListener("click", () => {
  if (!currentReport) return;
  const blob = new Blob([currentReport], { type: "text/markdown" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = (currentTopic || "report").replace(/\s+/g, "_").slice(0, 40) + ".md";
  a.click();
  URL.revokeObjectURL(a.href);
});