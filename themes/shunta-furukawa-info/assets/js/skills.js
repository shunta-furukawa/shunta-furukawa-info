/* Skills section: chip-tap to expand description, stagger reveal */
(function () {
  const cols = document.querySelectorAll(".skills-col");
  if (!cols.length) return;

  /* Stagger reveal on scroll */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
    );
    cols.forEach((c) => io.observe(c));
  } else {
    cols.forEach((c) => c.classList.add("is-visible"));
  }

  /* Click chip → toggle detail panel inside the column */
  cols.forEach((col) => {
    const detail = col.querySelector(".skills-col-detail");
    if (!detail) return;
    const nameEl = detail.querySelector(".skills-col-detail-name");
    const yearsEl = detail.querySelector(".skills-col-detail-years");
    const fillEl = detail.querySelector(".skills-col-detail-bar-fill");
    const descEl = detail.querySelector(".skills-col-detail-desc");
    let active = null;

    col.addEventListener("click", (e) => {
      const chip = e.target.closest(".skill-chip");
      if (!chip || !col.contains(chip)) return;

      // toggle off if same chip clicked again
      if (active === chip) {
        chip.setAttribute("aria-expanded", "false");
        detail.hidden = true;
        if (fillEl) fillEl.style.width = "0";
        active = null;
        return;
      }

      // collapse previously active
      if (active) active.setAttribute("aria-expanded", "false");

      const name = chip.dataset.name || "";
      const years = parseInt(chip.dataset.years || "0", 10);
      const maxYears = Math.max(parseInt(chip.dataset.maxYears || "10", 10), 1);
      const desc = chip.dataset.desc || "";

      if (nameEl) nameEl.textContent = name;
      if (yearsEl) yearsEl.textContent = years > 0 ? `${years} 年` : "";
      if (descEl) descEl.textContent = desc;

      detail.hidden = false;
      // ensure CSS picks up the width change after the panel is shown
      requestAnimationFrame(() => {
        if (fillEl) fillEl.style.width = ((years / maxYears) * 100).toFixed(1) + "%";
      });

      chip.setAttribute("aria-expanded", "true");
      active = chip;
    });
  });
})();
