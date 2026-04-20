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

});
