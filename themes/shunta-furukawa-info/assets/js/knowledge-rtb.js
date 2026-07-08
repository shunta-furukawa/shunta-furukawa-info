/* Knowledge: RTB auction journey — vanilla JS + SVG state machine.
   Rebuilds the scene in a vertical layout on narrow screens so labels
   stay readable on mobile. */
(function () {
  const stage = document.getElementById("rtb-stage");
  if (!stage) return;

  const NS = "http://www.w3.org/2000/svg";
  const clockEl = document.getElementById("rtb-clock");
  const captionEl = document.getElementById("rtb-caption");
  const playBtn = document.getElementById("rtb-play");
  const prevBtn = document.getElementById("rtb-step-prev");
  const nextBtn = document.getElementById("rtb-step-next");
  const speedBtn = document.getElementById("rtb-speed");
  const replayBtn = document.getElementById("rtb-replay");
  const resultEl = document.getElementById("rtb-result");
  const resultList = document.getElementById("rtb-result-list");
  const resultNote = document.getElementById("rtb-result-note");
  const infoEl = document.getElementById("rtb-nodeinfo");
  const infoTitle = document.getElementById("rtb-nodeinfo-title");
  const infoDesc = document.getElementById("rtb-nodeinfo-desc");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const narrowMq = window.matchMedia("(max-width: 680px)");

  const C = {
    pink: "#ff3b8d", light: "#f7f8fb", body: "#c5c8d3", muted: "#8b90a1",
    line: "#3a3f4e", surface: "#1a1d26", green: "#6ee7a3", yellow: "#ffd166", blue: "#4D9DE0",
  };

  const LAYOUTS = {
    wide: {
      viewBox: "0 0 920 600",
      nodes: {
        player: { x: 130, y: 300, w: 168, h: 72 },
        ssp:    { x: 460, y: 300, w: 180, h: 72 },
        dspA:   { x: 790, y: 130, w: 150, h: 64 },
        dspB:   { x: 790, y: 300, w: 150, h: 64 },
        dspC:   { x: 790, y: 470, w: 150, h: 64 },
      },
    },
    tall: {
      viewBox: "0 0 520 800",
      nodes: {
        player: { x: 260, y: 110, w: 190, h: 76 },
        ssp:    { x: 260, y: 390, w: 200, h: 76 },
        dspA:   { x: 100, y: 660, w: 150, h: 64 },
        dspB:   { x: 260, y: 710, w: 150, h: 64 },
        dspC:   { x: 420, y: 660, w: 150, h: 64 },
      },
    },
  };

  const NODE_META = {
    player: { label: "プレイヤー", sub: "動画アプリ / SDK" },
    ssp:    { label: "SSP / Exchange", sub: "オークション開催" },
    dspA:   { label: "DSP A", sub: "広告主側" },
    dspB:   { label: "DSP B", sub: "広告主側" },
    dspC:   { label: "DSP C", sub: "広告主側" },
  };

  const NODE_INFO = {
    player: ["プレイヤー（SDK）", "動画を再生しているアプリやブラウザ。広告枠の時間が来ると、広告リクエストを SSP に送る。広告の取得には VAST という XML 仕様が使われ、再生時には計測イベントの発火も担当する。"],
    ssp: ["SSP / アドエクスチェンジ", "媒体側の広告枠を売る側。プレイヤーからのリクエストを受けて OpenRTB の bid request を複数の DSP に一斉送信し、返ってきた入札でオークションを行う。フロアプライス（最低落札価格）の管理もここ。"],
    dspA: ["DSP（Demand-Side Platform）", "広告主側の入札プラットフォーム。ターゲティング条件・キャンペーン予算・フリークエンシーキャップなどを瞬時に評価して入札額を決める。応答制限は約100ms。"],
  };
  NODE_INFO.dspB = NODE_INFO.dspA;
  NODE_INFO.dspC = NODE_INFO.dspA;

  /* ---------- scene (rebuilt per layout) ---------- */
  let NODES, nodeEls, reqDot, bidDots, resDots, winDot, trackText;

  function el(name, attrs, parent) {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    (parent || stage).appendChild(e);
    return e;
  }

  function buildScene(mode) {
    const layout = LAYOUTS[mode];
    NODES = layout.nodes;
    stage.setAttribute("viewBox", layout.viewBox);
    stage.innerHTML = "";

    const linkLayer = el("g", { "pointer-events": "none" });
    const nodeLayer = el("g", {});
    // fx dots must never swallow taps meant for the nodes beneath them
    const fxLayer = el("g", { "pointer-events": "none" });

    const drawLink = (a, b) => el("line", {
      x1: NODES[a].x, y1: NODES[a].y, x2: NODES[b].x, y2: NODES[b].y,
      stroke: C.line, "stroke-width": 2, "stroke-dasharray": "5 7", opacity: 0.7,
    }, linkLayer);
    drawLink("player", "ssp");
    drawLink("ssp", "dspA");
    drawLink("ssp", "dspB");
    drawLink("ssp", "dspC");

    nodeEls = {};
    Object.keys(NODES).forEach((id) => {
      const n = NODES[id];
      const meta = NODE_META[id];
      const g = el("g", { class: "rtb-node", tabindex: 0, role: "button", "aria-label": meta.label + "の解説を表示" }, nodeLayer);
      const rect = el("rect", {
        x: n.x - n.w / 2, y: n.y - n.h / 2, width: n.w, height: n.h, rx: 14,
        fill: C.surface, stroke: C.line, "stroke-width": 2,
      }, g);
      el("text", { x: n.x, y: n.y - 4, "text-anchor": "middle", fill: C.light, "font-size": 19, "font-weight": 700 }, g).textContent = meta.label;
      el("text", { x: n.x, y: n.y + 20, "text-anchor": "middle", fill: C.muted, "font-size": 13 }, g).textContent = meta.sub;
      const badge = el("text", { x: n.x, y: n.y - n.h / 2 - 12, "text-anchor": "middle", fill: C.yellow, "font-size": 16, "font-weight": 700, opacity: 0 }, g);
      nodeEls[id] = { g, rect, badge };
      const show = () => {
        infoTitle.textContent = NODE_INFO[id][0];
        infoDesc.textContent = NODE_INFO[id][1];
        infoEl.hidden = false;
      };
      g.addEventListener("click", show);
      g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(); } });
    });

    const makeDot = (color) => el("circle", { r: 7, fill: color, opacity: 0 }, fxLayer);
    reqDot = makeDot(C.green);
    bidDots = [makeDot(C.blue), makeDot(C.blue), makeDot(C.blue)];
    resDots = [makeDot(C.yellow), makeDot(C.yellow), makeDot(C.yellow)];
    winDot = makeDot(C.pink);
    trackText = el("text", {
      x: NODES.player.x, y: NODES.player.y - NODES.player.h / 2 - 34,
      "text-anchor": "middle", fill: C.green, "font-size": 15, "font-weight": 700, opacity: 0,
    }, fxLayer);
  }

  function lerp(a, b, t) { return a + (b - a) * t; }
  function moveDot(dot, from, to, t) {
    dot.setAttribute("cx", lerp(NODES[from].x, NODES[to].x, t));
    dot.setAttribute("cy", lerp(NODES[from].y, NODES[to].y, t));
    dot.setAttribute("opacity", t <= 0 || t >= 1 ? 0 : 1);
  }
  function setStroke(id, color, width) {
    nodeEls[id].rect.setAttribute("stroke", color);
    nodeEls[id].rect.setAttribute("stroke-width", width || 2);
  }
  function resetStrokes() {
    Object.keys(NODES).forEach((id) => setStroke(id, C.line, 2));
  }
  function pulse(id, t, color) {
    const s = 2 + Math.sin(t * Math.PI * 4) * 1.6;
    setStroke(id, color, Math.max(2, s));
  }
  function trackPos(t, count) {
    const base = NODES.player.y - NODES.player.h / 2 - 24;
    return base - (t * count % 1) * 14;
  }

  /* ---------- auction data ---------- */
  let bids = [];
  function rollBids() {
    const names = ["DSP A", "DSP B", "DSP C"];
    const ids = ["dspA", "dspB", "dspC"];
    bids = names.map((name, i) => ({
      name, id: ids[i], cpm: 300 + Math.floor(Math.random() * 600),
    }));
  }
  function ranked() { return bids.slice().sort((a, b) => b.cpm - a.cpm); }

  function showResult() {
    const r = ranked();
    resultList.innerHTML = "";
    r.forEach((b, i) => {
      const li = document.createElement("li");
      li.textContent = `${b.name} — ¥${b.cpm} CPM`;
      if (i === 0) li.className = "is-winner";
      resultList.appendChild(li);
    });
    resultNote.textContent = `勝者 ${r[0].name} の支払いは 2位の額 + 1円 = ¥${r[1].cpm + 1} CPM`;
    resultEl.hidden = false;
  }

  /* ---------- phases ---------- */
  const PHASES = [
    { dur: 700, sim: [0, 8],
      caption: "動画の再生中、広告枠の時間がやってきた。プレイヤーが広告リクエストを準備する。",
      tick: (t) => { pulse("player", t, C.green); } },
    { dur: 900, sim: [8, 40],
      caption: "プレイヤーから SSP / アドエクスチェンジへ広告リクエスト。デバイスや広告枠の情報が渡る。",
      tick: (t) => { moveDot(reqDot, "player", "ssp", t); } },
    { dur: 900, sim: [40, 70],
      caption: "SSP が OpenRTB の bid request を複数の DSP へ一斉送信。ここから競りが始まる。",
      tick: (t) => {
        moveDot(bidDots[0], "ssp", "dspA", t);
        moveDot(bidDots[1], "ssp", "dspB", t);
        moveDot(bidDots[2], "ssp", "dspC", t);
      } },
    { dur: 1200, sim: [70, 160],
      caption: "各 DSP がターゲティング・予算・フリークエンシーを評価して入札額を決定。制限時間は約100ms。",
      tick: (t) => {
        ["dspA", "dspB", "dspC"].forEach((id, i) => {
          pulse(id, t, C.blue);
          if (t > 0.35 + i * 0.18) {
            nodeEls[id].badge.textContent = "¥" + bids[i].cpm;
            nodeEls[id].badge.setAttribute("opacity", 1);
          }
        });
      },
      done: () => { resetStrokes(); } },
    { dur: 900, sim: [160, 200],
      caption: "bid response が SSP に返る。タイムアウトした入札は、どんな高値でも無効。",
      tick: (t) => {
        moveDot(resDots[0], "dspA", "ssp", t);
        moveDot(resDots[1], "dspB", "ssp", t);
        moveDot(resDots[2], "dspC", "ssp", t);
      } },
    { dur: 1200, sim: [200, 220],
      caption: "オークション実施。このデモはセカンドプライス方式 — 勝者は2位の入札額+1円を支払う。",
      tick: (t) => {
        pulse("ssp", t, C.pink);
        if (t > 0.5) {
          const w = ranked()[0];
          setStroke(w.id, C.pink, 3);
          nodeEls[w.id].badge.setAttribute("fill", C.pink);
        }
      },
      done: () => { showResult(); } },
    { dur: 900, sim: [220, 250],
      caption: "落札した広告（VAST）がプレイヤーへ。動画クリエイティブは CDN から取得される。",
      tick: (t) => { moveDot(winDot, "ssp", "player", t); } },
    { dur: 1600, sim: [250, 320],
      caption: "広告再生スタート。インプレッションや再生進捗（クォータイル）の計測イベントが発火していく。",
      tick: (t) => {
        pulse("player", t, C.pink);
        const events = ["impression", "start", "firstQuartile", "midpoint"];
        const idx = Math.min(events.length - 1, Math.floor(t * events.length));
        trackText.textContent = "▶ " + events[idx];
        trackText.setAttribute("opacity", 1);
        trackText.setAttribute("y", trackPos(t, events.length));
      },
      done: () => {
        trackText.setAttribute("opacity", 0);
        resetStrokes();
        setCaption("ここまで約0.3秒。「読み込み中かな」と思う間もなく、この競りは終わっている。↻ で数字を変えてもう一度。");
        setClock(320);
        playing = false;
        playBtn.textContent = "▶ 再生";
        finished = true;
      } },
  ];

  /* ---------- engine ---------- */
  let phaseIdx = -1;
  let phaseT = 0;
  let playing = false;
  let finished = false;
  let speed = 1;
  let rafId = null;
  let lastTs = 0;

  function setCaption(text) { captionEl.textContent = text; }
  function setClock(ms) { clockEl.innerHTML = Math.round(ms) + "<small>ms</small>"; }

  function resetScene(keepBids) {
    cancelAnimationFrame(rafId);
    rafId = null;
    playing = false;
    finished = false;
    phaseIdx = -1;
    phaseT = 0;
    if (!keepBids) rollBids();
    resetStrokes();
    [reqDot, winDot, trackText].concat(bidDots, resDots).forEach((d) => d.setAttribute("opacity", 0));
    Object.keys(nodeEls).forEach((id) => {
      nodeEls[id].badge.setAttribute("opacity", 0);
      nodeEls[id].badge.setAttribute("fill", C.yellow);
    });
    resultEl.hidden = true;
    setClock(0);
    setCaption("▶ を押すと、1回の広告オークションが始まります。");
    playBtn.textContent = "▶ 再生";
  }

  function renderPhase(idx, t) {
    const p = PHASES[idx];
    setCaption(p.caption);
    setClock(lerp(p.sim[0], p.sim[1], t));
    p.tick(t);
  }

  function finishPhase(idx) {
    const p = PHASES[idx];
    p.tick(1);
    if (p.done) p.done();
  }

  function frame(ts) {
    if (!playing) return;
    if (!lastTs) lastTs = ts;
    const dt = (ts - lastTs) * speed;
    lastTs = ts;

    if (phaseIdx < 0) { phaseIdx = 0; phaseT = 0; }
    phaseT += dt;
    const p = PHASES[phaseIdx];
    const t = Math.min(1, phaseT / p.dur);
    renderPhase(phaseIdx, t);

    if (t >= 1) {
      finishPhase(phaseIdx);
      if (finished || phaseIdx >= PHASES.length - 1) { playing = false; return; }
      phaseIdx += 1;
      phaseT = 0;
    }
    rafId = requestAnimationFrame(frame);
  }

  function play() {
    if (finished) resetScene(false);
    playing = true;
    lastTs = 0;
    playBtn.textContent = "⏸ 一時停止";
    rafId = requestAnimationFrame(frame);
  }
  function pause() {
    playing = false;
    cancelAnimationFrame(rafId);
    playBtn.textContent = "▶ 再生";
  }

  /* step mode: jump to end-state of a given phase without motion */
  function jumpTo(idx) {
    pause();
    resetScene(true);
    for (let i = 0; i <= idx && i < PHASES.length; i++) {
      renderPhase(i, 1);
      finishPhase(i);
    }
    phaseIdx = idx;
    phaseT = PHASES[Math.min(idx, PHASES.length - 1)].dur;
  }

  playBtn.addEventListener("click", () => {
    if (reduceMotion) {
      // step through discretely instead of animating
      jumpTo(Math.min(phaseIdx + 1, PHASES.length - 1));
      return;
    }
    playing ? pause() : play();
  });
  nextBtn.addEventListener("click", () => jumpTo(Math.min(phaseIdx + 1, PHASES.length - 1)));
  prevBtn.addEventListener("click", () => {
    const prev = phaseIdx - 1;
    if (prev < 0) { resetScene(true); return; }
    jumpTo(prev);
  });
  replayBtn.addEventListener("click", () => { resetScene(false); if (!reduceMotion) play(); });
  speedBtn.addEventListener("click", () => {
    speed = speed === 1 ? 0.5 : 1;
    speedBtn.textContent = speed.toFixed(1) + "x";
  });

  /* ---------- layout switching ---------- */
  let mode = narrowMq.matches ? "tall" : "wide";

  function applyLayout() {
    buildScene(mode);
    rollBids();
    resetScene(true);
  }

  function onLayoutChange() {
    const next = narrowMq.matches ? "tall" : "wide";
    if (next === mode) return;
    mode = next;
    applyLayout();
  }
  if (narrowMq.addEventListener) narrowMq.addEventListener("change", onLayoutChange);

  applyLayout();
})();
