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


/* ===== FLOW horizontal (TEMP OFF) =====
（ここから）
…FLOWのGSAP/ScrollTriggerコード全部…

// ===== FLOW: Pin → Horizontal scroll (PC only) =====
(() => {
    const mq = window.matchMedia("(min-width: 768px)");

    function initFlowHorizontal() {
        const section = document.querySelector("#flow");
        const track = section?.querySelector(".flow-list"); // 既存のflow-listを横に動かす
        if (!section || !track) return;

        gsap.registerPlugin(ScrollTrigger);

        // いったん既存のScrollTriggerを掃除（リロード/リサイズ対策）
        ScrollTrigger.getAll().forEach(t => {
            if (t.vars?.id === "flow-horizontal") t.kill();
        });

        // 横に動かす距離（トラック全幅 - 画面幅）
        const getScrollAmount = () => {
            const trackWidth = track.scrollWidth;
            const vw = window.innerWidth;
            return Math.max(0, trackWidth - vw);
        };

        // アニメーション本体
        const tween = gsap.to(track, {
            x: () => -getScrollAmount(),
            ease: "none",
            overwrite: true
        });

        ScrollTrigger.create({
            id: "flow-horizontal",
            animation: tween,
            trigger: section,
            start: "top top",
            end: () => `+=${getScrollAmount()}`, // 横移動分だけ縦スクロールを消費
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            // markers: true, // 位置確認したい時だけON
        });

        // 画像読み込みで幅が変わるので、読み込み後にrefresh
        window.addEventListener("load", () => ScrollTrigger.refresh());
    }

    function destroyFlowHorizontal() {
        // PC→SPなどで解除
        ScrollTrigger.getAll().forEach(t => {
            if (t.vars?.id === "flow-horizontal") t.kill();
        });
        gsap.set("#flow .flow-list", { clearProps: "transform" });
    }

    function handle(e) {
        if (e.matches) initFlowHorizontal();
        else destroyFlowHorizontal();
    }

    // 初期
    handle(mq);
    // 切替
    mq.addEventListener("change", handle);
})();

const getScrollAmount = () => {
  const trackWidth = Math.max(track.scrollWidth, track.getBoundingClientRect().width);
  const vw = window.innerWidth;
  return Math.max(0, trackWidth - vw);
};

（ここまで）
*/

