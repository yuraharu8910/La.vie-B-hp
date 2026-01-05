document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.getElementById("menuOverlay");
    const hamburger = document.querySelector(".hamburger");
    const closeBtn = overlay.querySelector(".menu-close");
    const panel = overlay.querySelector(".menu-panel");
    const links = overlay.querySelectorAll(".menu-link");

    function openMenu() {
        overlay.classList.add("is-open");
        overlay.setAttribute("aria-hidden", "false");
        document.documentElement.classList.add("is-menu-open");
    }

    function closeMenu() {
        overlay.classList.remove("is-open");
        overlay.setAttribute("aria-hidden", "true");
        document.documentElement.classList.remove("is-menu-open");
    }

    hamburger.addEventListener("click", openMenu);
    closeBtn.addEventListener("click", closeMenu);

    // パネル外クリックで閉じる（overlayの“背景”だけをクリックした時）
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeMenu();
    });

    // Escで閉じる
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && overlay.classList.contains("is-open")) closeMenu();
    });

    // リンク押したら閉じる
    links.forEach((a) => a.addEventListener("click", closeMenu));
});
