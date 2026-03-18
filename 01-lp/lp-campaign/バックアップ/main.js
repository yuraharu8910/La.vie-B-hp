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
   La vie belle.mf - Unified Fade Up Motion
========================================================= */
(() => {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const DEFAULTS = {
        duration: 1.15,
        ease: "power2.out",
        y: 24,
        start: "top 85%",
    };

    /**
     * 1要素ずつ安全に reveal
     */
    const reveal = (selector, options = {}) => {
        const els = gsap.utils.toArray(selector);
        if (!els.length) return;

        els.forEach((el, i) => {
            gsap.fromTo(
                el,
                {
                    autoAlpha: 0,
                    y: options.y ?? DEFAULTS.y,
                },
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: options.duration ?? DEFAULTS.duration,
                    ease: options.ease ?? DEFAULTS.ease,
                    delay: options.stagger ? i * options.stagger : 0,
                    clearProps: "opacity,transform",
                    scrollTrigger: {
                        trigger: el,
                        start: options.start ?? DEFAULTS.start,
                        toggleActions: "play none none none",
                        once: true,
                    },
                }
            );
        });
    };

    /**
     * セクション単位で、子要素を順番にふわっと
     */
    const revealGroup = (selector, childSelector, options = {}) => {
        const sections = gsap.utils.toArray(selector);
        if (!sections.length) return;

        sections.forEach((section) => {
            const items = section.querySelectorAll(childSelector);
            if (!items.length) return;

            gsap.fromTo(
                items,
                {
                    autoAlpha: 0,
                    y: options.y ?? DEFAULTS.y,
                },
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: options.duration ?? DEFAULTS.duration,
                    ease: options.ease ?? DEFAULTS.ease,
                    stagger: options.stagger ?? 0.12,
                    clearProps: "opacity,transform",
                    scrollTrigger: {
                        trigger: section,
                        start: options.start ?? "top 80%",
                        toggleActions: "play none none none",
                        once: true,
                    },
                }
            );
        });
    };

    /* ---------------- HERO ---------------- */
    reveal(".hero-title", { y: 30, duration: 1.4 });
    reveal(".between-logo", { y: 18, duration: 1.2 });

    /* ---------------- ABOUT ---------------- */
    revealGroup("#about", ".about-lead, .about-text p, .access-card__btn, .cta-note", {
        stagger: 0.14,
        y: 22,
    });

    /* ---------------- PROBLEMS ---------------- */
    reveal("#problems .section-title", { y: 20 });
    reveal("#problems .section-sub", { y: 20 });
    reveal("#problems .problems-list li", { stagger: 0.08, y: 18 });
    reveal("#problems .problems-message h3", { stagger: 0.12, y: 22 });

    /* ---------------- RESULT ---------------- */
    reveal("#result .section-title", { y: 20 });
    reveal("#result .section-sub", { y: 20 });
    reveal("#result .result-list li", { stagger: 0.08, y: 18 });
    reveal("#result .cta-group", { y: 18, duration: 1.05 });

    /* ---------------- CONCEPT ---------------- */
    reveal("#concept .section-title", { y: 20 });
    reveal("#concept .concept-lead", { y: 22, duration: 1.2 });
    reveal("#concept .concept-text p", { stagger: 0.1, y: 20 });
    reveal("#concept .concept-link-wrap", { y: 16, duration: 1.0 });

    /* ---------------- REASON ---------------- */
    reveal("#reason .section-title", { y: 20 });
    reveal("#reason .section-sub", { y: 20 });
    reveal("#reason .reason-item", { stagger: 0.12, y: 24 });
    reveal("#reason .reason-link-wrap", { y: 16, duration: 1.0 });
    reveal("#reason .access-card__btn", { y: 18, duration: 1.05 });
    reveal("#reason .cta-note", { y: 14, duration: 0.95 });

    /* ---------------- OFFER ---------------- */
    reveal("#offer .section-title", { y: 20 });
    reveal("#offer .offer-box", { y: 24, duration: 1.2 });
    reveal("#offer .offer-card", { y: 28, duration: 1.2 });
    reveal("#offer .offer-btn, #offer .offer-btn--mint, #offer .access-card__btn", {
        y: 18,
        duration: 1.05,
    });

    /* ---------------- FLOW ---------------- */
    reveal("#flow .section-title", { y: 20 });
    reveal("#flow .flow-what", { y: 20, duration: 1.1 });
    reveal("#flow .flow-intro .flow-text", { stagger: 0.12, y: 18 });
    reveal("#flow .flow-item", { stagger: 0.1, y: 24 });
    reveal("#flow .flow-end-lead", { y: 22, duration: 1.2 });
    reveal("#flow .flow-end-title", { stagger: 0.1, y: 20 });
    reveal("#flow .flow-end .flow-text", { stagger: 0.1, y: 18 });

    /* ---------------- MENU ---------------- */
    reveal("#menu .section-title", { y: 20 });
    reveal("#menu .menu-item", { stagger: 0.12, y: 28, duration: 1.15 });

    /* ---------------- STAFF ---------------- */
    reveal("#staff .section-title", { y: 20 });
    reveal("#staff .staff-photo", { y: 24, duration: 1.2 });
    reveal("#staff .staff-name", { y: 18 });
    reveal("#staff .staff-lead", { stagger: 0.1, y: 18 });
    reveal("#staff .staff-text", { stagger: 0.1, y: 18 });

    /* ---------------- VOICE ---------------- */
    reveal("#voice .section-title", { y: 20 });
    reveal("#voice .voice-item", { stagger: 0.12, y: 22 });

    /* ---------------- QA ---------------- */
    reveal("#qa .section-title", { y: 20 });
    reveal("#qa .qa-item", { stagger: 0.08, y: 18 });

    /* ---------------- ACCESS ---------------- */
    reveal("#access .section-title", { y: 20 });
    reveal("#access .access-photo", { y: 24, duration: 1.2 });
    reveal("#access .access-head", { y: 18 });
    reveal("#access .access-text", { y: 18 });
    reveal("#access .map", { y: 16 });
    reveal("#access .access-block", { stagger: 0.08, y: 16 });
    reveal("#access .access-card", { y: 22, duration: 1.15 });

    /* ---------------- FINAL CTA ---------------- */
    reveal("#cta .final-cta__title", { y: 22, duration: 1.2 });
    reveal("#cta .final-cta__text", { y: 18 });
    reveal("#cta .access-card__btn", { y: 18, duration: 1.05 });
    reveal("#cta .cta-note", { y: 14, duration: 0.95 });

    /* ---------------- FOOTER ---------------- */
    reveal(".footer-logo", { y: 18 });
    reveal(".footer-nav", { y: 18 });
    reveal(".footer-sns", { y: 16 });
    reveal(".footer-copy", { y: 14 });

    /* レイアウト確定後に再計算 */
    window.addEventListener("load", () => {
        ScrollTrigger.refresh();
    });
})();