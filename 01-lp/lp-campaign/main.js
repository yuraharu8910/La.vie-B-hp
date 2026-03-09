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
   La vie belle.mf - Luxury Motion System (SAFE)
========================================================= */
(() => {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const BASE = {
        duration: 1.25,
        ease: "power2.out",
        y: 26,
    };

    // 1要素ずつ：triggerを確実に「その要素」にする（安定）
    const reveal = (selector, options = {}) => {
        const els = gsap.utils.toArray(selector);
        if (!els.length) return;

        els.forEach((el, i) => {
            const yFrom = options.y ?? BASE.y;
            const dur = options.duration ?? BASE.duration;
            const ease = options.ease ?? BASE.ease;
            const delay = (options.stagger ? i * options.stagger : 0);

            gsap.fromTo(
                el,
                { autoAlpha: 0, y: yFrom, scale: options.scaleFrom ?? 1 },
                {
                    autoAlpha: 1,
                    y: 0,
                    scale: 1,
                    duration: dur,
                    ease,
                    delay,
                    clearProps: "transform,opacity", // 終わったら余計な上書きを残しにくい
                    scrollTrigger: {
                        trigger: el,
                        start: options.start ?? "top 85%",
                        toggleActions: "play none none none",
                        once: true,
                    },
                }
            );
        });
    };

    /* ---------------- HERO ---------------- */
    reveal(".hero-title", { y: 34, duration: 1.6 });

    /* ---------------- CONCEPT ---------------- */
    reveal("#concept .concept-lead", { stagger: 0.08 });
    reveal("#concept .concept-text", { stagger: 0.06 });

    /* ---------------- FLOW ---------------- */
    reveal("#flow .flow-what", { stagger: 0.08 });
    reveal("#flow .flow-intro", { stagger: 0.08 });
    // ジグザグ transform を崩したくないので scaleは控えめ/無し推奨
    reveal("#flow .flow-item", { stagger: 0.10, y: 22 });

    /* ---------------- MENU ---------------- */
    reveal("#menu .menu-photo", { stagger: 0.06 });
    reveal("#menu .menu-header", { stagger: 0.06 });
    reveal("#menu .menu-desc", { stagger: 0.06 });

    /* ---------------- STAFF ---------------- */
    reveal("#staff .staff-photo", { duration: 1.35 });
    reveal("#staff .staff-name");
    reveal("#staff .staff-text", { stagger: 0.07 });

    /* ---------------- OFFER ---------------- */
    reveal("#offer .offer-card", { y: 34, duration: 1.35 });
    reveal("#offer .offer-btn--mint", { y: 18, duration: 1.1 });

    /* ---------------- QA ---------------- */
    reveal("#qa .qa-item", { stagger: 0.07 });

    /* ---------------- ACCESS ---------------- */
    reveal("#access .access-photo", { duration: 1.35 });
    reveal("#access .access-head");
    reveal("#access .access-text");
    reveal("#access .access-card", { duration: 1.35 });

    /* ---------------- FOOTER ---------------- */
    reveal(".footer-logo");
    reveal(".footer-nav", { stagger: 0.06 });
    reveal(".footer-copy");

    // レイアウト確定後に再計算（これ入れると“瞬き”減ります）
    window.addEventListener("load", () => ScrollTrigger.refresh());
})();
