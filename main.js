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

document.addEventListener('DOMContentLoaded', () => {
    const scrollTopLink = document.querySelector('.js-scroll-top');

    if (!scrollTopLink) return;

    scrollTopLink.addEventListener('click', (e) => {
        e.preventDefault();

        const target = document.querySelector('#top');
        if (!target) return;

        target.scrollIntoView({
            behavior: 'smooth'
        });
    });
});








/* =========================================================
   La vie belle.mf - Luxury Motion System
   統一アニメーション設計
========================================================= */

(() => {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {

        const BASE = {
            duration: 1.2,
            ease: "power2.out",
            y: 30,
            opacity: 0
        };

        // 共通アニメ関数
        const reveal = (targets, options = {}) => {
            gsap.from(targets, {
                ...BASE,
                ...options,
                scrollTrigger: {
                    trigger: targets,
                    start: "top 85%",
                    toggleActions: "play none none none"
                }
            });
        };

        /* ---------------- HERO ---------------- */
        reveal(".hero-title", { y: 40, duration: 1.6 });

        /* ---------------- CONCEPT ---------------- */
        reveal("#concept .concept-lead");
        reveal("#concept .concept-text", { stagger: 0.15 });

        /* ---------------- FLOW ---------------- */
        reveal("#flow .flow-what");
        reveal("#flow .flow-intro");
        reveal("#flow .flow-item", {
            stagger: 0.15,
            scale: 0.98
        });

        /* ---------------- MENU ---------------- */
        reveal("#menu .menu-photo", { stagger: 0.1 });
        reveal("#menu .menu-header", { stagger: 0.1 });
        reveal("#menu .menu-desc", { stagger: 0.1 });

        /* ---------------- STAFF ---------------- */
        reveal("#staff .staff-photo", { duration: 1.4 });
        reveal("#staff .staff-name");
        reveal("#staff .staff-text", { stagger: 0.12 });

        /* ---------------- OFFER ---------------- */
        reveal("#offer .offer-card", {
            y: 40,
            duration: 1.4,
            scale: 0.97
        });
        reveal("#offer .offer-btn--mint", {
            y: 20,
            duration: 1.2
        });

        /* ---------------- QA ---------------- */
        reveal("#qa .qa-item", { stagger: 0.1 });

        /* ---------------- ACCESS ---------------- */
        reveal("#access .access-photo", { duration: 1.4 });
        reveal("#access .access-head");
        reveal("#access .access-text");
        reveal("#access .access-card", { duration: 1.4 });

        /* ---------------- FOOTER ---------------- */
        reveal(".footer-logo");
        reveal(".footer-nav");
        reveal(".footer-copy");

    });

})();


/* =========================================================
   FLOW：画像だけ軽いパララックス
========================================================= */
(() => {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const images = gsap.utils.toArray("#flow .flow-photo");

    images.forEach(img => {
        gsap.fromTo(img,
            { y: -20 },
            {
                y: 20,
                ease: "none",
                scrollTrigger: {
                    trigger: img,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            }
        );
    });
})();
