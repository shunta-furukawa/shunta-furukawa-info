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

    const menuToggle = document.getElementById("menu-toggle");
    const menuDrawer = document.getElementById("menu-drawer");
    const menuClose = document.getElementById("menu-close");

    // メニューを開く
    menuToggle.addEventListener("click", function () {
        menuDrawer.classList.add("open");
    });

    // メニューを閉じる
    menuClose.addEventListener("click", function () {
        menuDrawer.classList.remove("open");
    });

    // ドロワー外をクリックで閉じる（オプション）
    document.addEventListener("click", function (event) {
        if (!menuDrawer.contains(event.target) && !menuToggle.contains(event.target)) {
            menuDrawer.classList.remove("open");
        }
    });

});
