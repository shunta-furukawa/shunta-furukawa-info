document.addEventListener("DOMContentLoaded", () => {

    const header = document.querySelector(".site-header");
    let lastScrollY = window.scrollY;
    let isScrollingDown = true;
  
    // スクロールイベントを監視
    window.addEventListener("scroll", () => {
      const currentScrollY = window.scrollY;
  
      // スクロール方向を判定
      if (currentScrollY > lastScrollY) {
        // 下方向にスクロール
        if (!isScrollingDown) {
          header.classList.add("hide"); // ヘッダーを隠す
          isScrollingDown = true;
        }
      } else {
        // 上方向にスクロール
        if (isScrollingDown || currentScrollY === 0) {
          header.classList.remove("hide"); // ヘッダーを表示
          isScrollingDown = false;
        }
      }
  
      lastScrollY = currentScrollY;
    });

    /* メニュー ============================================*/
    const menuToggle = document.getElementById("menu-toggle");
    const menuDrawer = document.getElementById("menu-drawer");
    const menuClose = document.getElementById("menu-close");

    const openMenu = () => {
        menuDrawer.classList.add("open");
        menuToggle.setAttribute("aria-expanded", "true");
    };

    const closeMenu = () => {
        menuDrawer.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
    };

    menuToggle.addEventListener("click", openMenu);
    menuClose.addEventListener("click", closeMenu);

    document.addEventListener("click", (event) => {
        if (!menuDrawer.contains(event.target) && !menuToggle.contains(event.target)) {
            closeMenu();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && menuDrawer.classList.contains("open")) {
            closeMenu();
        }
    });

    /* スキルのグラフアニメーション */ 
    const bars = document.querySelectorAll(".bar");    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const bar = entry.target;
            const years = bar.getAttribute("data-years");
            const barColor = bar.getAttribute("data-colors");
            bar.style.width = `${years * 5}%`; // 20年=100%として表示
            bar.style.backgroundColor = barColor;            
          }
        });
      },
      { threshold: 0.5 } // 50%見えたら発火
    );    
    bars.forEach((bar) => observer.observe(bar));

    /* カーソル追従グロー（desktop only, prefers-reduced-motion 尊重） */
    const cursorGlow = document.querySelector(".cursor-glow");
    if (cursorGlow
        && window.matchMedia("(pointer: fine)").matches
        && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        let raf = null;
        document.addEventListener("pointermove", (e) => {
            if (raf) return;
            raf = requestAnimationFrame(() => {
                cursorGlow.style.setProperty("--mx", e.clientX);
                cursorGlow.style.setProperty("--my", e.clientY);
                cursorGlow.classList.add("active");
                raf = null;
            });
        });
        document.addEventListener("pointerleave", () => {
            cursorGlow.classList.remove("active");
        });
    }

    /* ストーリーのアニメーション */

    const items = document.querySelectorAll('.timeline-item, .highlight-card');
    const storyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.2 });
    items.forEach(item => storyObserver.observe(item));

    /* スクロール進捗バー */
    const progressBar = document.querySelector(".scroll-progress");
    if (progressBar) {
        let progressRaf = null;
        const updateProgress = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            progressBar.style.width = `${Math.max(0, Math.min(100, pct))}%`;
            progressRaf = null;
        };
        window.addEventListener("scroll", () => {
            if (progressRaf) return;
            progressRaf = requestAnimationFrame(updateProgress);
        }, { passive: true });
        updateProgress();
    }

    /* カード 3D tilt（desktop only, prefers-reduced-motion 尊重） */
    const tiltCards = document.querySelectorAll(".writing-card, .highlight-card");
    if (tiltCards.length
        && window.matchMedia("(pointer: fine)").matches
        && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const MAX_TILT = 7;
        tiltCards.forEach(card => {
            let tiltRaf = null;
            let lastEvent = null;

            card.addEventListener("pointerenter", () => {
                card.style.transition = "transform 0ms";
            });

            card.addEventListener("pointermove", (e) => {
                lastEvent = e;
                if (tiltRaf) return;
                tiltRaf = requestAnimationFrame(() => {
                    const rect = card.getBoundingClientRect();
                    const x = lastEvent.clientX - rect.left;
                    const y = lastEvent.clientY - rect.top;
                    const rotY = ((x / rect.width) - 0.5) * 2 * MAX_TILT;
                    const rotX = -((y / rect.height) - 0.5) * 2 * MAX_TILT;
                    card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
                    tiltRaf = null;
                });
            });

            card.addEventListener("pointerleave", () => {
                card.style.transition = "transform 0.4s ease";
                card.style.transform = "";
            });
        });
    }

    /* アンカーメニューの現在位置ハイライト（IntersectionObserver） */
    (function () {
        const navLinks = Array.from(document.querySelectorAll(".menu-links--desktop a, .menu-links--drawer a"));
        if (!navLinks.length) return;

        // href="/#xxx" や "#xxx" を持つアンカーリンクのみ対象
        const targets = new Map(); // sectionId -> [<a>, ...]
        navLinks.forEach((a) => {
            const href = a.getAttribute("href") || "";
            const m = href.match(/#([^?]+)$/);
            if (!m) return;
            let id = m[1];
            // HOME は /#top（ヘッダーID）→ ページ内の #hero に紐付ける
            if (id === "top") id = "hero";
            if (!document.getElementById(id)) return;
            if (!targets.has(id)) targets.set(id, []);
            targets.get(id).push(a);
        });
        if (!targets.size) return;

        // 全部のアンカーリンクから active を一旦剥がして、対象だけ付ける
        const allTrackedLinks = new Set();
        targets.forEach((links) => links.forEach((a) => allTrackedLinks.add(a)));

        const setActive = (id) => {
            allTrackedLinks.forEach((a) => a.classList.remove("active"));
            const list = targets.get(id);
            if (list) list.forEach((a) => a.classList.add("active"));
        };

        // ビューポート上中央の細い帯にセクション top が入った時に切り替え
        const io = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                if (visible[0]) setActive(visible[0].target.id);
            },
            { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
        );
        targets.forEach((_, id) => {
            const el = document.getElementById(id);
            if (el) io.observe(el);
        });
    })();

});
