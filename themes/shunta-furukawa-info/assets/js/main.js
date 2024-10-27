document.addEventListener("DOMContentLoaded", () => {
    // スクロールでヘッダー表示
    window.addEventListener('scroll', () => {
        document.querySelector('header').classList.toggle('visible', window.scrollY > 100);
    });

    // スクロールでコンテンツのフェードインを実行
    window.addEventListener('scroll', () => {
        document.querySelectorAll('main section').forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= window.innerHeight * 0.8) {
                section.classList.add('visible');
            }
        });
    });
});