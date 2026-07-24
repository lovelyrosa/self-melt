/**
 * Self-Melt — Canvas2D mini Meltdown
 * 源码即画面：读取本文件 → 简易语法高亮 → 字符网格融化
 */

// ── Token types ──────────────────────────────────────────────
const T = {
  DEFAULT: 0,
  KEYWORD: 1,
  IDENT: 2,
  NUMBER: 3,
  STRING: 4,
  COMMENT: 5,
  OP: 6,
  PUNCT: 7,
};

const KEYWORDS = new Set([
  "const", "let", "var", "function", "return", "if", "else", "for", "while",
  "do", "switch", "case", "break", "continue", "new", "this", "class",
  "extends", "import", "export", "from", "async", "await", "try", "catch",
  "finally", "throw", "typeof", "instanceof", "in", "of", "null", "true",
  "false", "undefined", "void", "delete", "yield", "static", "get", "set",
]);

// ── Palettes (bg, then token colors as [r,g,b]) ──────────────
const PALETTES = [
  {
    name: "MONO",
    bg: [8, 8, 8],
    tokens: {
      [T.DEFAULT]: [153, 153, 153],
      [T.KEYWORD]: [220, 220, 220],
      [T.IDENT]: [170, 170, 170],
      [T.NUMBER]: [200, 200, 200],
      [T.STRING]: [180, 180, 180],
      [T.COMMENT]: [90, 90, 90],
      [T.OP]: [140, 140, 140],
      [T.PUNCT]: [120, 120, 120],
    },
  },
  {
    name: "MATRIX",
    bg: [0, 12, 0],
    tokens: {
      [T.DEFAULT]: [0, 180, 70],
      [T.KEYWORD]: [120, 255, 140],
      [T.IDENT]: [0, 210, 90],
      [T.NUMBER]: [180, 255, 120],
      [T.STRING]: [80, 220, 160],
      [T.COMMENT]: [0, 90, 40],
      [T.OP]: [0, 160, 80],
      [T.PUNCT]: [0, 140, 70],
    },
  },
  {
    name: "BSOD",
    bg: [0, 0, 170],
    tokens: {
      [T.DEFAULT]: [180, 180, 200],
      [T.KEYWORD]: [255, 255, 255],
      [T.IDENT]: [200, 200, 255],
      [T.NUMBER]: [255, 255, 120],
      [T.STRING]: [255, 160, 160],
      [T.COMMENT]: [100, 100, 180],
      [T.OP]: [220, 220, 255],
      [T.PUNCT]: [160, 160, 200],
    },
  },
  {
    name: "EMBER",
    bg: [12, 4, 0],
    tokens: {
      [T.DEFAULT]: [200, 120, 60],
      [T.KEYWORD]: [255, 200, 80],
      [T.IDENT]: [240, 140, 70],
      [T.NUMBER]: [255, 220, 100],
      [T.STRING]: [255, 100, 80],
      [T.COMMENT]: [100, 50, 30],
      [T.OP]: [220, 100, 50],
      [T.PUNCT]: [160, 80, 40],
    },
  },
];

// ── Simple tokenizer ─────────────────────────────────────────
function isAlpha(c) {
  return /[A-Za-z_$]/.test(c);
}
function isDigit(c) {
  return c >= "0" && c <= "9";
}
function isAlnum(c) {
  return isAlpha(c) || isDigit(c);
}

/** @returns {{ char: string, type: number }[]} */
function tokenizeLine(line) {
  const out = [];
  let i = 0;
  const push = (ch, type) => out.push({ char: ch, type });

  while (i < line.length) {
    const c = line[i];

    // // comment
    if (c === "/" && line[i + 1] === "/") {
      while (i < line.length) push(line[i++], T.COMMENT);
      break;
    }

    // string
    if (c === '"' || c === "'" || c === "`") {
      const q = c;
      push(c, T.STRING);
      i++;
      while (i < line.length) {
        push(line[i], T.STRING);
        if (line[i] === "\\" && i + 1 < line.length) {
          i++;
          push(line[i], T.STRING);
          i++;
          continue;
        }
        if (line[i] === q) {
          i++;
          break;
        }
        i++;
      }
      continue;
    }

    // number
    if (isDigit(c) || (c === "." && isDigit(line[i + 1]))) {
      while (i < line.length && (isDigit(line[i]) || "xXeE.+-".includes(line[i]))) {
        push(line[i++], T.NUMBER);
      }
      continue;
    }

    // identifier / keyword
    if (isAlpha(c)) {
      let j = i + 1;
      while (j < line.length && isAlnum(line[j])) j++;
      const word = line.slice(i, j);
      const type = KEYWORDS.has(word) ? T.KEYWORD : T.IDENT;
      while (i < j) push(line[i++], type);
      continue;
    }

    // operators
    if ("=+-*/%<>!&|^~?:".includes(c)) {
      push(c, T.OP);
      i++;
      continue;
    }

    // punctuation
    if ("(){}[];,.".includes(c)) {
      push(c, T.PUNCT);
      i++;
      continue;
    }

    push(c, T.DEFAULT);
    i++;
  }
  return out;
}

function tokenizeSource(src) {
  return src
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => tokenizeLine(line.replace(/\t/g, "  ")));
}

// ── Seeded RNG (xfnv1a + sfc-ish LCG mix) ────────────────────
function makeRng(seedStr) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
  }
  let a = h >>> 0;
  let b = (h * 1664525 + 1013904223) >>> 0;
  let c = (b * 1664525 + 1013904223) >>> 0;
  let d = (c * 1664525 + 1013904223) >>> 0;
  return {
    next() {
      // sfc32-inspired
      const t = (a + b + d) >>> 0;
      d = (d + 1) >>> 0;
      a = b ^ (b >>> 9);
      b = (c + (c << 3)) >>> 0;
      c = (((c << 21) | (c >>> 11)) + t) >>> 0;
      return t / 4294967296;
    },
    float(min = 0, max = 1) {
      return min + this.next() * (max - min);
    },
    int(min, max) {
      return Math.floor(this.float(min, max));
    },
    pick(arr) {
      return arr[this.int(0, arr.length)];
    },
    chance(p) {
      return this.next() < p;
    },
  };
}

// ── Value noise (cheap, deterministic) ───────────────────────
function hash2(x, y, seed) {
  let n = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ seed;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

function smooth(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function noise2(x, y, seed) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = smooth(x - x0);
  const fy = smooth(y - y0);
  const v00 = hash2(x0, y0, seed);
  const v10 = hash2(x0 + 1, y0, seed);
  const v01 = hash2(x0, y0 + 1, seed);
  const v11 = hash2(x0 + 1, y0 + 1, seed);
  const a = v00 + (v10 - v00) * fx;
  const b = v01 + (v11 - v01) * fx;
  return a + (b - a) * fy;
}

// 9 neighbor directions (index 0 = stay)
const DIRS = [
  [0, 0],
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
];

// ── Cell grid ────────────────────────────────────────────────
function makeGrid(cols, rows, fill) {
  const data = new Array(cols * rows);
  for (let i = 0; i < data.length; i++) data[i] = fill();
  return {
    cols,
    rows,
    data,
    get(x, y) {
      if (x < 0 || y < 0 || x >= cols || y >= rows) return null;
      return data[y * cols + x];
    },
    getWrapped(x, y) {
      x = ((x % cols) + cols) % cols;
      y = ((y % rows) + rows) % rows;
      return data[y * cols + x];
    },
  };
}

function emptyCell() {
  return { ch: " ", type: T.DEFAULT, fg: null };
}

// ── App ──────────────────────────────────────────────────────
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d", { alpha: false });
const statsEl = document.getElementById("stats");
const hudEl = document.getElementById("hud");

// Screensaver / kiosk: hide UI chrome
const qs = new URLSearchParams(location.search);
const isScreensaver =
  globalThis.SELF_MELT_SCREENSAVER === true ||
  qs.get("screensaver") === "1" ||
  qs.get("hud") === "0";
if (isScreensaver && hudEl) {
  hudEl.classList.add("hidden");
  hudEl.style.display = "none";
}
// statsEl may be missing in the single-file screensaver build
const setStats = (text) => {
  if (statsEl) statsEl.textContent = text;
};

const state = {
  lines: [], // tokenized source
  paletteIdx: 1,
  cellW: 9,
  cellH: 16,
  fontSize: 13,
  scale: 1,
  cols: 0,
  rows: 0,
  grids: null, // [src, dst]
  front: 0,
  scrollX: 0,
  scrollY: 0,
  maskH: 0,
  targetMaskH: 0,
  meltEvery: 2, // frames between melt ticks
  speed: 1,
  paused: false,
  frame: 0,
  seed: "self-melt",
  rng: null,
  noiseSeed: 0,
  warpMode: "noise", // noise | plasma | bands
  keys: { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false },
  dragging: false,
  dragStart: null,
  fps: 0,
  lastFpsT: 0,
  fpsCount: 0,
};

async function loadSource() {
  // Screensaver / single-file build: source embedded on window
  if (
    typeof globalThis.SELF_MELT_SOURCE === "string" &&
    globalThis.SELF_MELT_SOURCE.length > 0
  ) {
    return globalThis.SELF_MELT_SOURCE;
  }
  // Prefer fetching this module (works under any local server)
  try {
    const url = new URL("./main.js", import.meta.url);
    const res = await fetch(url);
    if (res.ok) return await res.text();
  } catch {
    /* file:// may block fetch */
  }
  // Fallback: embedded sample so file:// still shows something
  return `// Self-Melt fallback source (serve over http for real self-view)
const hello = "open via: npm start";
function melt(x, y, t) {
  const n = Math.sin(x * 0.1 + t) + Math.cos(y * 0.1 - t);
  return n > 0 ? 1 : 0;
}
// Press R to reset · 1-4 for palettes · Space to pause
for (let i = 0; i < 16; i++) {
  console.log("line", i, melt(i, i, 0));
}
`;
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const cw = state.cellW * state.scale;
  const ch = state.cellH * state.scale;
  const cols = Math.max(8, Math.floor(w / cw));
  const rows = Math.max(4, Math.floor(h / ch));

  if (cols !== state.cols || rows !== state.rows) {
    state.cols = cols;
    state.rows = rows;
    state.grids = [
      makeGrid(cols, rows, emptyCell),
      makeGrid(cols, rows, emptyCell),
    ];
    state.front = 0;
    state.maskH = 0;
    state.targetMaskH = rows;
    clearGrids();
  }
}

function clearGrids() {
  if (!state.grids) return;
  const pal = PALETTES[state.paletteIdx];
  for (const g of state.grids) {
    for (const cell of g.data) {
      cell.ch = " ";
      cell.type = T.DEFAULT;
      cell.fg = pal.tokens[T.DEFAULT];
    }
  }
}

function warpDir(i, j, t) {
  const cols = state.cols;
  const rows = state.rows;
  const aspect = cols / rows;
  const s = (i / cols) * 2 - 1;
  const u = (j / rows) * 2 - 1;
  let n;

  if (state.warpMode === "plasma") {
    const f = t * 0.04;
    const v =
      Math.sin(s * 3 + f) +
      Math.cos(u * 3 - f * 1.3) +
      Math.sin((s + u) * 2 + f * 0.7) +
      Math.cos(Math.hypot(s, u) * 4 - f);
    n = (v + 4) / 8;
  } else if (state.warpMode === "bands") {
    const band = Math.floor(j / 4) % 2;
    return band ? 3 : 7; // right or left
  } else {
    // noise field → direction bin
    n = noise2(s * aspect * 1.4 + t * 0.01, u * 1.4 - t * 0.008, state.noiseSeed);
  }

  return Math.min(8, Math.floor(Math.max(0, Math.min(0.999, n)) * 9));
}

function meltTick() {
  const src = state.grids[state.front];
  const dst = state.grids[1 - state.front];
  const t = state.frame * state.speed;

  for (let j = 0; j < state.rows; j++) {
    for (let i = 0; i < state.cols; i++) {
      const bin = warpDir(i, j, t);
      const [dx, dy] = DIRS[bin];
      const from = src.getWrapped(i + dx, j + dy);
      const to = dst.get(i, j);
      to.ch = from.ch;
      to.type = from.type;
      to.fg = from.fg;
    }
  }
  state.front = 1 - state.front;

  // occasionally switch warp personality
  if (state.rng.chance(0.008)) {
    state.warpMode = state.rng.pick(["noise", "plasma", "bands"]);
  }
}

function writeSourceIntoGrid() {
  const grid = state.grids[state.front];
  const pal = PALETTES[state.paletteIdx];
  const lines = state.lines;
  if (!lines.length) return;

  // grow reveal mask
  if (state.maskH < state.targetMaskH) {
    state.maskH = Math.min(state.maskH + 1, state.targetMaskH);
  }

  for (let j = 0; j < state.maskH; j++) {
    const lineIdx = (state.scrollY + j) % lines.length;
    const line = lines[lineIdx];
    for (let i = 0; i < line.length; i++) {
      const col = (i + state.scrollX) % state.cols;
      const cell = grid.get(col, j);
      if (!cell) continue;
      const tok = line[i];
      cell.ch = tok.char === "\t" ? " " : tok.char;
      cell.type = tok.type;
      cell.fg = pal.tokens[tok.type] ?? pal.tokens[T.DEFAULT];
    }
  }

  // wave dig holes (meltdown-ish)
  const t = state.frame * 0.01 * state.speed;
  for (let j = 0; j < state.rows; j++) {
    for (let i = 0; i < state.cols; i++) {
      const cell = grid.get(i, j);
      if (!cell || cell.ch === " ") continue;
      const n = noise2(i * 0.08, j * 0.08 + t, state.noiseSeed + 99);
      const wave = Math.sin(j * 0.15 + t * 2) * 0.5 + 0.5;
      if (n * wave > 0.72) {
        cell.ch = " ";
      }
    }
  }
}

function autoScroll() {
  if (state.keys.ArrowUp) state.scrollY = (state.scrollY - 1 + state.lines.length) % state.lines.length;
  if (state.keys.ArrowDown) state.scrollY = (state.scrollY + 1) % state.lines.length;
  if (state.keys.ArrowLeft) state.scrollX = (state.scrollX - 1 + state.cols) % state.cols;
  if (state.keys.ArrowRight) state.scrollX = (state.scrollX + 1) % state.cols;

  // idle drift
  if (!state.keys.ArrowUp && !state.keys.ArrowDown && !state.dragging && state.frame % 8 === 0) {
    state.scrollY = (state.scrollY + 1) % Math.max(1, state.lines.length);
  }
}

function draw() {
  const pal = PALETTES[state.paletteIdx];
  const w = window.innerWidth;
  const h = window.innerHeight;
  ctx.fillStyle = `rgb(${pal.bg.join(",")})`;
  ctx.fillRect(0, 0, w, h);

  const cw = state.cellW * state.scale;
  const ch = state.cellH * state.scale;
  const grid = state.grids[state.front];

  ctx.font = `${state.fontSize * state.scale}px ui-monospace, Menlo, Monaco, Consolas, monospace`;
  ctx.textBaseline = "top";

  // slight letterbox centering
  const ox = Math.floor((w - state.cols * cw) / 2);
  const oy = Math.floor((h - state.rows * ch) / 2);

  for (let j = 0; j < state.rows; j++) {
    for (let i = 0; i < state.cols; i++) {
      const cell = grid.get(i, j);
      if (!cell || cell.ch === " ") continue;
      const fg = cell.fg || pal.tokens[T.DEFAULT];
      ctx.fillStyle = `rgb(${fg[0]},${fg[1]},${fg[2]})`;
      ctx.fillText(cell.ch, ox + i * cw, oy + j * ch);
    }
  }

  // title bar faint
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fillRect(0, 0, w, 22);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font = "11px ui-monospace, Menlo, monospace";
  ctx.fillText(
    `Self-Melt · ${pal.name} · warp:${state.warpMode} · speed:${state.speed.toFixed(1)}`,
    10,
    5,
  );
}

function updateStats() {
  const pal = PALETTES[state.paletteIdx];
  setStats(
    [
      `fps ${state.fps}`,
      `grid ${state.cols}×${state.rows}`,
      `lines ${state.lines.length}`,
      `palette ${pal.name}`,
      `melt every ${state.meltEvery}f`,
      state.paused ? "PAUSED" : "running",
    ].join(" · "),
  );
}

function frame(now) {
  requestAnimationFrame(frame);

  state.fpsCount++;
  if (now - state.lastFpsT >= 1000) {
    state.fps = state.fpsCount;
    state.fpsCount = 0;
    state.lastFpsT = now;
    updateStats();
  }

  if (state.paused) {
    draw();
    return;
  }

  state.frame++;
  autoScroll();

  if (state.frame % state.meltEvery === 0) {
    meltTick();
  }
  writeSourceIntoGrid();
  draw();
}

function resetMelt() {
  state.rng = makeRng(state.seed + ":" + Date.now());
  state.noiseSeed = state.rng.int(0, 1e9);
  state.warpMode = state.rng.pick(["noise", "plasma", "bands"]);
  state.scrollX = 0;
  state.scrollY = state.rng.int(0, Math.max(1, state.lines.length));
  state.maskH = 0;
  state.targetMaskH = state.rows;
  state.frame = 0;
  clearGrids();
}

// ── Input ────────────────────────────────────────────────────
window.addEventListener("resize", resize);

window.addEventListener("keydown", (e) => {
  if (e.key in state.keys) {
    e.preventDefault();
    state.keys[e.key] = true;
    return;
  }
  if (e.key === " ") {
    e.preventDefault();
    state.paused = !state.paused;
  } else if (e.key === "r" || e.key === "R") {
    resetMelt();
  } else if (e.key === "h" || e.key === "H") {
    hudEl.classList.toggle("hidden");
  } else if (e.key >= "1" && e.key <= "4") {
    state.paletteIdx = Number(e.key) - 1;
  } else if (e.key === "[") {
    state.meltEvery = Math.min(8, state.meltEvery + 1);
  } else if (e.key === "]") {
    state.meltEvery = Math.max(1, state.meltEvery - 1);
  } else if (e.key === "-" || e.key === "_") {
    state.scale = Math.max(0.75, +(state.scale - 0.25).toFixed(2));
    state.cols = 0; // force grid rebuild
    resize();
  } else if (e.key === "=" || e.key === "+") {
    state.scale = Math.min(2.5, +(state.scale + 0.25).toFixed(2));
    state.cols = 0;
    resize();
  } else if (e.key === ",") {
    state.speed = Math.max(0.25, +(state.speed - 0.25).toFixed(2));
  } else if (e.key === ".") {
    state.speed = Math.min(3, +(state.speed + 0.25).toFixed(2));
  }
  updateStats();
});

window.addEventListener("keyup", (e) => {
  if (e.key in state.keys) state.keys[e.key] = false;
});

canvas.addEventListener("pointerdown", (e) => {
  state.dragging = true;
  state.dragStart = {
    x: e.clientX,
    y: e.clientY,
    scrollX: state.scrollX,
    scrollY: state.scrollY,
  };
  canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener("pointermove", (e) => {
  if (!state.dragging || !state.dragStart) return;
  const cw = state.cellW * state.scale;
  const ch = state.cellH * state.scale;
  const dx = Math.round((e.clientX - state.dragStart.x) / cw);
  const dy = Math.round((e.clientY - state.dragStart.y) / ch);
  state.scrollX = ((state.dragStart.scrollX - dx) % state.cols + state.cols) % state.cols;
  state.scrollY =
    ((state.dragStart.scrollY - dy) % state.lines.length + state.lines.length) %
    state.lines.length;
});

const endDrag = () => {
  state.dragging = false;
  state.dragStart = null;
};
canvas.addEventListener("pointerup", endDrag);
canvas.addEventListener("pointercancel", endDrag);

// ── Boot ─────────────────────────────────────────────────────
async function boot() {
  setStats("loading source…");
  // In screensaver mode, pick a random palette each launch
  if (isScreensaver) {
    state.paletteIdx = Math.floor(Math.random() * PALETTES.length);
  }
  const src = await loadSource();
  state.lines = tokenizeSource(src);
  state.rng = makeRng(state.seed);
  state.noiseSeed = state.rng.int(0, 1e9);
  resize();
  resetMelt();
  updateStats();
  requestAnimationFrame(frame);
}

boot().catch((err) => {
  setStats("boot failed: " + err.message);
  console.error(err);
});
