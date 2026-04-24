/* Story page interactions: typewriter + scroll progress + chapter reveals */
(function () {
  const root = document.querySelector(".story-root");
  if (!root) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Typewriter ---------- */
  function typeLine(el, text, speed, done) {
    if (reduceMotion) { el.textContent = text; if (done) done(); return; }
    let i = 0;
    el.classList.add("is-typing");
    const tick = () => {
      if (i > text.length) {
        el.classList.remove("is-typing");
        el.classList.add("is-typed");
        if (done) done();
        return;
      }
      el.textContent = text.slice(0, i);
      i += 1;
      setTimeout(tick, speed + Math.random() * 30);
    };
    tick();
  }

  const lines = Array.from(root.querySelectorAll("[data-typewriter]"));
  let chain = Promise.resolve();
  lines.forEach((el) => {
    const text = el.getAttribute("data-typewriter") || el.textContent;
    el.textContent = "";
    chain = chain.then(
      () => new Promise((resolve) => typeLine(el, text, 40, resolve))
    );
  });

  /* ---------- Scroll progress line ---------- */
  const timeline = root.querySelector(".story-timeline");
  const progress = root.querySelector(".story-timeline-progress");
  if (timeline && progress) {
    let rafId = null;
    const update = () => {
      rafId = null;
      const rect = timeline.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.75;
      const total = rect.height + (vh * 0.5);
      const travelled = Math.max(0, start - rect.top);
      const pct = Math.max(0, Math.min(1, travelled / total));
      progress.style.setProperty("--progress", pct.toFixed(4));
    };
    const schedule = () => {
      if (rafId == null) rafId = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
  }

  /* ---------- Chapter reveal on scroll ---------- */
  const revealTargets = root.querySelectorAll(
    ".story-chapter, .story-highlight-card, .story-now-inner"
  );
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Background glow follows cursor (desktop only) ---------- */
  const glow = root.querySelector("#story-bg-glow");
  if (glow && window.matchMedia("(pointer: fine)").matches && !reduceMotion) {
    let gRaf = null;
    let px = 50, py = 30;
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = ((e.clientY + window.scrollY) / root.getBoundingClientRect().height) * 100;
      px = x; py = y;
      if (gRaf == null) {
        gRaf = requestAnimationFrame(() => {
          glow.style.setProperty("--gx", px.toFixed(2) + "%");
          glow.style.setProperty("--gy", py.toFixed(2) + "%");
          gRaf = null;
        });
      }
    };
    document.addEventListener("pointermove", onMove, { passive: true });
  }

  /* ---------- "Open terminal" CTA ---------- */
  root.querySelectorAll("[data-open-terminal]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const fab = document.getElementById("terminal-fab");
      if (fab) fab.click();
    });
  });
})();
