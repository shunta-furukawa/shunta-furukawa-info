/* Easter-egg terminal + Snake/Pong. Keep compact. */
(function () {
  const dataEl = document.getElementById("cli-data");
  if (!dataEl) return;

  let DATA = {};
  try { DATA = JSON.parse(dataEl.textContent || "{}"); } catch (e) { return; }

  const fab = document.getElementById("terminal-fab");
  const panel = document.getElementById("terminal-panel");
  const closeBtn = document.getElementById("terminal-close");
  const output = document.getElementById("terminal-output");
  const form = document.getElementById("terminal-form");
  const input = document.getElementById("terminal-input");
  const suggest = document.getElementById("terminal-suggest");
  const gameLayer = document.getElementById("terminal-game");
  const gameCanvas = document.getElementById("terminal-game-canvas");
  const gameTitle = document.getElementById("terminal-game-title");
  const gameScore = document.getElementById("terminal-game-score");
  const gameExit = document.getElementById("terminal-game-exit");
  const gamePad = document.getElementById("terminal-game-pad");

  if (!fab || !panel || !output || !input) return;

  const history = [];
  let historyIdx = -1;
  let draft = "";
  let currentGame = null;

  const ESC = {
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ESC[c]);

  function print(html, cls) {
    const line = document.createElement("div");
    line.className = "term-line" + (cls ? " " + cls : "");
    line.innerHTML = html;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }
  function printRaw(text, cls) { print(esc(text), cls); }
  function printEmpty() { print("&nbsp;"); }
  function printCmdEcho(cmd) {
    print(
      '<span class="term-prompt">shunta@info:~$</span> ' +
      '<span class="term-user">' + esc(cmd) + "</span>"
    );
  }

  function openPanel() {
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    fab.setAttribute("aria-expanded", "true");
    setTimeout(() => { if (!currentGame) input.focus(); }, 60);
  }
  function closePanel() {
    stopGame();
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
    fab.setAttribute("aria-expanded", "false");
  }

  /* ---------- commands ---------- */
  const COMMANDS = {};

  COMMANDS.help = () => {
    print('<span class="term-heading">Available commands</span>');
    const rows = [
      ["help", "このヘルプを表示"],
      ["whoami", "名前と肩書き"],
      ["about", "自己紹介"],
      ["skills [category]", "スキル一覧"],
      ["story", "これまでの歩み"],
      ["blog", "最近の投稿"],
      ["contact", "連絡先・SNS"],
      ["snake", "スネークゲーム"],
      ["pong", "ポンゲーム"],
      ["clear", "画面をクリア"],
      ["exit", "ターミナルを閉じる"],
      ["date", "現在時刻"],
      ["echo [text]", "おうむ返し"],
    ];
    let html = '<dl class="term-table">';
    rows.forEach(([k, v]) => {
      html += "<dt>" + esc(k) + "</dt><dd>" + esc(v) + "</dd>";
    });
    html += "</dl>";
    print(html);
  };

  COMMANDS.whoami = () => {
    print('<span class="term-accent">' + esc(DATA.author || "") + "</span> — " + esc(DATA.role || ""));
    if (DATA.location) print('<span class="term-info">' + esc(DATA.location) + "</span>");
  };

  COMMANDS.about = () => {
    if (DATA.about && DATA.about.lead) print('<span class="term-accent">' + esc(DATA.about.lead) + "</span>");
    if (DATA.about && DATA.about.body) {
      String(DATA.about.body).split(/\n+/).forEach((p) => {
        const t = p.trim();
        if (t) print(esc(t));
      });
    }
    if (DATA.about && DATA.about.tags && DATA.about.tags.length) {
      print('<span class="term-info">tags: ' + DATA.about.tags.map(esc).join(" · ") + "</span>");
    }
  };

  COMMANDS.skills = (args) => {
    const cats = DATA.skills || [];
    const filter = (args[0] || "").toLowerCase();
    const picked = filter
      ? cats.filter((c) => (c.category || "").toLowerCase().includes(filter))
      : cats;
    if (!picked.length) {
      print('<span class="term-warn">一致するカテゴリが無い。`skills` で全件。</span>');
      return;
    }
    picked.forEach((c) => {
      print('<span class="term-heading">' + esc(c.category) + "</span>");
      (c.items || []).forEach((it) => {
        const years = it.years ? ' <span class="term-info">(' + it.years + "y)</span>" : "";
        print('  <span class="term-accent">▸</span> ' + esc(it.name) + years);
      });
    });
  };

  COMMANDS.story = () => {
    const list = DATA.stories || [];
    if (!list.length) { print('<span class="term-info">(no entries)</span>'); return; }
    list.forEach((s) => {
      print('<span class="term-heading">' + esc(s.period || "") + "</span> " + esc(s.title || ""));
      const d = (s.descriptions || [])[0] || "";
      if (d) print("  " + esc(d.length > 140 ? d.slice(0, 138) + "…" : d));
    });
    print('<span class="term-info">詳細は <a class="term-link" href="/story/">/story/</a> で。</span>');
  };

  COMMANDS.blog = () => {
    const url = (DATA.feeds && DATA.feeds.zenn) || "https://zenn.dev/shunta_furukawa";
    print("Zenn で書いてます。");
    print('  <span class="term-link"><a class="term-link" href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(url) + "</a></span>");
    print('一覧ページ: <a class="term-link" href="/writings/">/writings/</a>');
  };

  COMMANDS.contact = () => {
    if (DATA.email) {
      print("email: <a class=\"term-link\" href=\"mailto:" + esc(DATA.email) + "\">" + esc(DATA.email) + "</a>");
    }
    const s = DATA.social || {};
    Object.keys(s).forEach((k) => {
      print(esc(k) + ": <a class=\"term-link\" href=\"" + esc(s[k]) + "\" target=\"_blank\" rel=\"noopener\">" + esc(s[k]) + "</a>");
    });
  };

  COMMANDS.clear = () => { output.innerHTML = ""; };
  COMMANDS.exit = () => { closePanel(); };
  COMMANDS.date = () => { print(esc(new Date().toString())); };
  COMMANDS.echo = (args) => { print(esc(args.join(" "))); };
  COMMANDS.ls = () => { print("about  skills  story  blog  contact  games/"); };
  COMMANDS.pwd = () => { print("/home/shunta"); };
  COMMANDS.sudo = () => { print('<span class="term-warn">shunta is not in the sudoers file. This incident will be reported.</span>'); };

  COMMANDS.snake = () => startGame("snake");
  COMMANDS.pong = () => startGame("pong");

  const ALIASES = { "?": "help", man: "help", cls: "clear", quit: "exit", q: "exit" };

  function execute(raw) {
    const line = raw.trim();
    if (!line) return;
    printCmdEcho(line);
    const [cmdRaw, ...args] = line.split(/\s+/);
    const cmd = (ALIASES[cmdRaw] || cmdRaw).toLowerCase();
    const fn = COMMANDS[cmd];
    if (!fn) {
      print('<span class="term-err">command not found: ' + esc(cmdRaw) + "</span>");
      print('<span class="term-info">`help` でコマンド一覧。</span>');
      return;
    }
    try { fn(args); } catch (e) {
      print('<span class="term-err">error: ' + esc(e.message || e) + "</span>");
    }
  }

  /* ---------- banner ---------- */
  function showBanner() {
    const ascii = [
      "  ____  _                 _        _____",
      " / ___|| |__  _   _ _ __ | |_ __ _|  ___|   _ _ __",
      " \\___ \\| '_ \\| | | | '_ \\| __/ _` | |_ | | | | '__|",
      "  ___) | | | | |_| | | | | || (_| |  _|| |_| | |",
      " |____/|_| |_|\\__,_|_| |_|\\__\\__,_|_|   \\__,_|_|",
    ].join("\n");
    print('<pre class="term-ascii">' + esc(ascii) + "</pre>");
    print('<span class="term-info">shunta-furukawa.info · type <span class="term-kbd">help</span> to get started.</span>');
    printEmpty();
  }

  /* ---------- suggestions ---------- */
  const SUGGESTIONS = ["help", "whoami", "about", "skills", "story", "blog", "contact", "snake", "pong", "clear"];
  function buildSuggestions() {
    suggest.innerHTML = "";
    SUGGESTIONS.forEach((s) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = s;
      b.addEventListener("click", () => {
        input.value = s;
        input.focus();
        form.dispatchEvent(new Event("submit", { cancelable: true }));
      });
      suggest.appendChild(b);
    });
  }

  /* ---------- events ---------- */
  fab.addEventListener("click", openPanel);
  closeBtn.addEventListener("click", closePanel);
  document.addEventListener("keydown", (e) => {
    const isTyping = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target && e.target.tagName) || "");
    if (e.key === "/" && !isTyping && !panel.classList.contains("open")) {
      e.preventDefault();
      openPanel();
      return;
    }
    if (e.key === "Escape" && panel.classList.contains("open")) {
      if (currentGame) { stopGame(); return; }
      closePanel();
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = input.value;
    if (!v.trim()) return;
    history.push(v);
    if (history.length > 100) history.shift();
    historyIdx = -1;
    draft = "";
    input.value = "";
    execute(v);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
      if (!history.length) return;
      e.preventDefault();
      if (historyIdx === -1) draft = input.value;
      historyIdx = Math.min(historyIdx + 1, history.length - 1);
      input.value = history[history.length - 1 - historyIdx] || "";
    } else if (e.key === "ArrowDown") {
      if (historyIdx === -1) return;
      e.preventDefault();
      historyIdx -= 1;
      if (historyIdx < 0) { input.value = draft; historyIdx = -1; return; }
      input.value = history[history.length - 1 - historyIdx] || "";
    } else if (e.key === "Tab") {
      e.preventDefault();
      const v = input.value;
      const cands = Object.keys(COMMANDS).filter((c) => c.startsWith(v));
      if (cands.length === 1) input.value = cands[0] + " ";
      else if (cands.length) print('<span class="term-info">' + cands.map(esc).join("  ") + "</span>");
    }
  });

  buildSuggestions();
  showBanner();

  /* ---------- games (stub; filled in next chunk) ---------- */
  function startGame(name) { print('<span class="term-warn">loading ' + esc(name) + '…</span>'); setTimeout(() => GAMES[name] && GAMES[name](), 40); }
  function stopGame() {
    if (currentGame && typeof currentGame.stop === "function") currentGame.stop();
    currentGame = null;
    gameLayer.classList.remove("active");
    gameLayer.setAttribute("aria-hidden", "true");
    gamePad.classList.remove("visible");
    setTimeout(() => input.focus(), 40);
  }
  gameExit.addEventListener("click", stopGame);

  const GAMES = {};

  function isTouchLike() {
    return window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
  }

  function prepareGame(title) {
    currentGame = { stop: () => {} };
    gameLayer.classList.add("active");
    gameLayer.setAttribute("aria-hidden", "false");
    gameTitle.textContent = title;
    gameScore.textContent = "SCORE 0";
    if (isTouchLike()) gamePad.classList.add("visible"); else gamePad.classList.remove("visible");
    // blur input so keyboard gameplay works immediately; user can re-focus to type
    if (document.activeElement === input) input.blur();
  }

  function isTyping() { return document.activeElement === input; }

  /* ---------- Snake ---------- */
  GAMES.snake = function () {
    prepareGame("SNAKE");
    const ctx = gameCanvas.getContext("2d");
    const COLS = 18, ROWS = 13, SIZE = 20;
    gameCanvas.width = COLS * SIZE;
    gameCanvas.height = ROWS * SIZE;

    let snake = [{ x: 9, y: 6 }, { x: 8, y: 6 }, { x: 7, y: 6 }];
    let dir = { x: 1, y: 0 };
    let queued = dir;
    let food = placeFood();
    let score = 0;
    let alive = true;
    let lastStep = 0;
    const stepMs = 110;

    function placeFood() {
      while (true) {
        const p = { x: (Math.random() * COLS) | 0, y: (Math.random() * ROWS) | 0 };
        if (!snake.some((s) => s.x === p.x && s.y === p.y)) return p;
      }
    }

    function setDir(dx, dy) {
      if (dx === -dir.x && dy === -dir.y) return;
      queued = { x: dx, y: dy };
    }

    function tick(ts) {
      if (!alive) return;
      if (ts - lastStep >= stepMs) {
        lastStep = ts;
        dir = queued;
        const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
        if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS) return die();
        if (snake.some((s) => s.x === head.x && s.y === head.y)) return die();
        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
          score += 1;
          gameScore.textContent = "SCORE " + score;
          food = placeFood();
        } else {
          snake.pop();
        }
      }
      draw();
      currentGame.raf = requestAnimationFrame(tick);
    }

    function draw() {
      ctx.fillStyle = "#05070c";
      ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
      ctx.fillStyle = "#ff3b8d";
      ctx.fillRect(food.x * SIZE + 3, food.y * SIZE + 3, SIZE - 6, SIZE - 6);
      snake.forEach((s, i) => {
        ctx.fillStyle = i === 0 ? "#f7f8fb" : "#c5c8d3";
        ctx.fillRect(s.x * SIZE + 2, s.y * SIZE + 2, SIZE - 4, SIZE - 4);
      });
    }

    function die() {
      alive = false;
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
      ctx.fillStyle = "#ff3b8d";
      ctx.font = "700 20px ui-monospace,Menlo,monospace";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER  score " + score, gameCanvas.width / 2, gameCanvas.height / 2 - 8);
      ctx.fillStyle = "#d7dae1";
      ctx.font = "500 13px ui-monospace,Menlo,monospace";
      ctx.fillText("press SPACE / tap to retry", gameCanvas.width / 2, gameCanvas.height / 2 + 16);
    }

    function retry() {
      snake = [{ x: 9, y: 6 }, { x: 8, y: 6 }, { x: 7, y: 6 }];
      dir = { x: 1, y: 0 }; queued = dir; food = placeFood(); score = 0; alive = true;
      gameScore.textContent = "SCORE 0";
      currentGame.raf = requestAnimationFrame(tick);
    }

    const onKey = (e) => {
      if (isTyping()) return;
      if (!alive && (e.key === " " || e.key === "Enter")) { e.preventDefault(); retry(); return; }
      if (e.key === "ArrowUp" || e.key === "w") { e.preventDefault(); setDir(0, -1); }
      else if (e.key === "ArrowDown" || e.key === "s") { e.preventDefault(); setDir(0, 1); }
      else if (e.key === "ArrowLeft" || e.key === "a") { e.preventDefault(); setDir(-1, 0); }
      else if (e.key === "ArrowRight" || e.key === "d") { e.preventDefault(); setDir(1, 0); }
    };
    document.addEventListener("keydown", onKey);

    const padHandler = (e) => {
      const b = e.target.closest("button[data-dir]");
      if (!b) return;
      const d = b.getAttribute("data-dir");
      if (d === "up") setDir(0, -1);
      else if (d === "down") setDir(0, 1);
      else if (d === "left") setDir(-1, 0);
      else if (d === "right") setDir(1, 0);
    };
    gamePad.addEventListener("click", padHandler);

    let touchStart = null;
    const onTStart = (e) => { const t = e.changedTouches[0]; touchStart = { x: t.clientX, y: t.clientY }; };
    const onTEnd = (e) => {
      if (!touchStart) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStart.x, dy = t.clientY - touchStart.y;
      touchStart = null;
      if (Math.abs(dx) < 16 && Math.abs(dy) < 16) { if (!alive) retry(); return; }
      if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? 1 : -1, 0);
      else setDir(0, dy > 0 ? 1 : -1);
    };
    gameCanvas.addEventListener("touchstart", onTStart, { passive: true });
    gameCanvas.addEventListener("touchend", onTEnd, { passive: true });
    const onClick = () => { if (!alive) retry(); };
    gameCanvas.addEventListener("click", onClick);

    currentGame.stop = () => {
      if (currentGame.raf) cancelAnimationFrame(currentGame.raf);
      document.removeEventListener("keydown", onKey);
      gamePad.removeEventListener("click", padHandler);
      gameCanvas.removeEventListener("touchstart", onTStart);
      gameCanvas.removeEventListener("touchend", onTEnd);
      gameCanvas.removeEventListener("click", onClick);
    };
    currentGame.raf = requestAnimationFrame(tick);
  };

  /* ---------- Pong ---------- */
  GAMES.pong = function () {
    prepareGame("PONG");
    const ctx = gameCanvas.getContext("2d");
    const W = 360, H = 240;
    gameCanvas.width = W; gameCanvas.height = H;
    const PW = 8, PH = 56;
    let py = H / 2 - PH / 2;
    let ay = H / 2 - PH / 2;
    let ball = { x: W / 2, y: H / 2, vx: 3.2, vy: 2.1, r: 5 };
    let ps = 0, as = 0, paused = false, over = false;
    const WIN = 7;

    function reset(dir) {
      ball.x = W / 2; ball.y = H / 2;
      ball.vx = 3.2 * (dir || (Math.random() < 0.5 ? -1 : 1));
      ball.vy = (Math.random() * 2 - 1) * 2.2;
    }

    function step() {
      if (paused || over) { draw(); currentGame.raf = requestAnimationFrame(step); return; }
      ball.x += ball.vx; ball.y += ball.vy;
      if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy *= -1; }
      if (ball.y + ball.r > H) { ball.y = H - ball.r; ball.vy *= -1; }
      if (ball.x - ball.r < PW && ball.y > py && ball.y < py + PH) {
        ball.x = PW + ball.r; ball.vx = Math.abs(ball.vx) * 1.04;
        ball.vy += ((ball.y - (py + PH / 2)) / (PH / 2)) * 1.6;
      }
      if (ball.x + ball.r > W - PW && ball.y > ay && ball.y < ay + PH) {
        ball.x = W - PW - ball.r; ball.vx = -Math.abs(ball.vx) * 1.04;
        ball.vy += ((ball.y - (ay + PH / 2)) / (PH / 2)) * 1.6;
      }
      if (ball.x < 0) { as += 1; scored(); reset(1); }
      else if (ball.x > W) { ps += 1; scored(); reset(-1); }

      const target = ball.y - PH / 2;
      const maxAI = 3.3;
      const delta = target - ay;
      ay += Math.max(-maxAI, Math.min(maxAI, delta));

      draw();
      currentGame.raf = requestAnimationFrame(step);
    }

    function scored() {
      gameScore.textContent = "YOU " + ps + " : " + as + " AI";
      if (ps >= WIN || as >= WIN) over = true;
    }

    function draw() {
      ctx.fillStyle = "#05070c";
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "#252a36";
      ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#ff3b8d";
      ctx.fillRect(0, py, PW, PH);
      ctx.fillStyle = "#c5c8d3";
      ctx.fillRect(W - PW, ay, PW, PH);
      ctx.fillStyle = "#f7f8fb";
      ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill();
      if (over) {
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#ff3b8d";
        ctx.font = "700 20px ui-monospace,Menlo,monospace";
        ctx.textAlign = "center";
        ctx.fillText(ps >= WIN ? "YOU WIN" : "AI WINS", W / 2, H / 2 - 6);
        ctx.fillStyle = "#d7dae1";
        ctx.font = "500 13px ui-monospace,Menlo,monospace";
        ctx.fillText("press SPACE / tap to retry", W / 2, H / 2 + 18);
      }
    }

    function retry() {
      ps = 0; as = 0; over = false; py = H / 2 - PH / 2; ay = H / 2 - PH / 2;
      gameScore.textContent = "YOU 0 : 0 AI"; reset();
    }
    reset(); gameScore.textContent = "YOU 0 : 0 AI";

    const keysDown = new Set();
    const onKey = (e) => {
      if (isTyping()) return;
      if (over && (e.key === " " || e.key === "Enter")) { e.preventDefault(); retry(); return; }
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "ArrowDown" || e.key === "s") {
        e.preventDefault(); keysDown.add(e.key);
      }
      if (e.key === "p") paused = !paused;
    };
    const onKeyUp = (e) => keysDown.delete(e.key);
    document.addEventListener("keydown", onKey);
    document.addEventListener("keyup", onKeyUp);

    function paddleLoop() {
      const speed = 5;
      if (keysDown.has("ArrowUp") || keysDown.has("w")) py = Math.max(0, py - speed);
      if (keysDown.has("ArrowDown") || keysDown.has("s")) py = Math.min(H - PH, py + speed);
      currentGame.paddleRaf = requestAnimationFrame(paddleLoop);
    }
    currentGame.paddleRaf = requestAnimationFrame(paddleLoop);

    const onMove = (e) => {
      const rect = gameCanvas.getBoundingClientRect();
      const ratio = H / rect.height;
      const pt = (e.touches ? e.touches[0] : e);
      const y = (pt.clientY - rect.top) * ratio;
      py = Math.max(0, Math.min(H - PH, y - PH / 2));
    };
    gameCanvas.addEventListener("mousemove", onMove);
    gameCanvas.addEventListener("touchmove", onMove, { passive: true });
    const onTap = () => { if (over) retry(); };
    gameCanvas.addEventListener("click", onTap);

    const padHandler = (e) => {
      const b = e.target.closest("button[data-dir]");
      if (!b) return;
      const d = b.getAttribute("data-dir");
      if (d === "up") py = Math.max(0, py - 24);
      else if (d === "down") py = Math.min(H - PH, py + 24);
    };
    gamePad.addEventListener("click", padHandler);

    currentGame.stop = () => {
      if (currentGame.raf) cancelAnimationFrame(currentGame.raf);
      if (currentGame.paddleRaf) cancelAnimationFrame(currentGame.paddleRaf);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("keyup", onKeyUp);
      gameCanvas.removeEventListener("mousemove", onMove);
      gameCanvas.removeEventListener("touchmove", onMove);
      gameCanvas.removeEventListener("click", onTap);
      gamePad.removeEventListener("click", padHandler);
    };

    currentGame.raf = requestAnimationFrame(step);
  };
  window.__TERM__ = { print, printRaw, COMMANDS, DATA, startGame, stopGame, GAMES, gameCanvas, gameLayer, gamePad, gameTitle, gameScore };
})();
