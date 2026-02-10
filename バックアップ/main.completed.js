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
  FLOW：ピン留め横スライド（セクションpinで重なり解消）
========================================================= */
(() => {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
        const section = document.querySelector("#flow");
        const rail = document.querySelector("#flow .flow-list");
        if (!section || !rail) return;

        const headerOffset = 90; // 予約ボタン/ヘッダー分。70〜140で微調整OK

        // ここ重要：pin中に下が透けないよう「背景」を必ず持たせる
        // （あなたのサイトは var(--bg) が綺麗）
        section.style.background = "var(--bg)";
        section.style.position = "relative";
        section.style.zIndex = 1;

        // 横スクロールUIは使わない（JSで動かす）
        rail.style.overflowX = "visible";
        rail.style.scrollSnapType = "none";

        const getDistance = () => {
            const containerW = section.clientWidth;
            return Math.max(0, rail.scrollWidth - containerW);
        };

        // 既存トリガー掃除（更新事故防止）
        ScrollTrigger.getAll().forEach(st => {
            if (st?.vars?.id === "flow-pin-slide") st.kill();
        });

        const tween = gsap.to(rail, {
            x: () => -getDistance(),
            ease: "none",
            overwrite: true,
            scrollTrigger: {
                id: "flow-pin-slide",

                // ✅ここがポイント：カード列が来たら開始
                trigger: rail,
                start: "top 30%",

                end: () => `+=${getDistance()}`,
                scrub: 1.8,

                // ✅pinするのはセクションのまま（重なり防止）
                pin: rail,
                pinSpacing: true,

                anticipatePin: 1,
                invalidateOnRefresh: true,
            }
        });

        // 画像読み込み後に距離が変わるので refresh（超重要）
        const onLoad = () => ScrollTrigger.refresh();
        window.addEventListener("load", onLoad);

        const onResize = () => ScrollTrigger.refresh();
        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("load", onLoad);
            window.removeEventListener("resize", onResize);
            if (tween.scrollTrigger) tween.scrollTrigger.kill();
            tween.kill();
            gsap.set(rail, { clearProps: "transform" });
        };
        
    });
})();

// ===============================
// Scroll Fade (AOS風) - JSのみ自作版
// HTMLに data-aos を書かない
// ===============================
(() => {
    // ① 設定（上品寄り）
    const CONFIG = {
        once: true,            // 1回だけ発火（上品）
        rootMargin: "0px 0px -10% 0px", // ちょい手前で出す
        threshold: 0.12,       // 見え始めの判定
        duration: 900,         // ふわっと長め
        distance: 14,          // 下から上へ
        easing: "cubic-bezier(.2,.7,.2,1)",
    };

    // ② 予約ボタン・固定UIはアニメ対象から除外
    const IGNORE_SELECTORS = [
        ".reserve-fab",
        ".site-header",
        ".menu-overlay",
        ".menu-panel",
    ];

    // ③ 対象セクション（あなたの構造に合わせて）
    const SECTIONS = [
        "#concept",
        "#flow",
        "#menu",
        "#staff",
        "#offer",
        "#qa",
        "#access",
        "#footer",
    ];

    // ④ アニメさせたい要素を拾うルール
    // テキスト：p / h系 / リスト系
    const TEXT_SELECTORS = [
        "h1", "h2", "h3",
        "p", "li", "summary",
        ".section-title",
        ".concept-lead",
        ".concept-title",
        ".flow-what-jp", ".flow-what-en",
        ".flow-step", ".flow-step__en", ".flow-tag", ".flow-desc",
        ".menu-name", ".menu-price", ".menu-desc", ".menu-name-hand",
        ".staff-name", ".staff-text",
        ".access-name", ".access-telrow", ".access-text", ".access-key", ".access-val",
        ".access-card__title", ".access-card__text",
        ".footer-copy"
    ].join(",");

    // 画像：img / figure / .menu-photo / .flow-photo / .offer-card 等
    const IMAGE_SELECTORS = [
        "img",
        ".menu-photo",
        ".flow-photo",
        ".offer-card",
        ".access-photo",
        ".staff-photo",
        ".footer-logo"
    ].join(",");

    // ---------- CSSをJSで注入（HTMLもCSSも触らない） ----------
    const style = document.createElement("style");
    style.textContent = `
    /* JS Scroll Animation (AOS-like) */
    .js-reveal {
      opacity: 0;
      transform: translate3d(0, ${CONFIG.distance}px, 0);
      transition:
        opacity ${CONFIG.duration}ms ${CONFIG.easing},
        transform ${CONFIG.duration}ms ${CONFIG.easing};
      will-change: opacity, transform;
    }

    /* 画像は少しだけ控えめに（上品） */
    .js-reveal--img {
      transform: translate3d(0, ${Math.max(10, CONFIG.distance - 4)}px, 0);
    }

    /* 表示状態 */
    .js-reveal.is-inview {
      opacity: 1;
      transform: translate3d(0,0,0);
    }

    /* delay はCSS変数でコントロール */
    .js-reveal {
      transition-delay: var(--reveal-delay, 0ms);
    }

    /* ユーザーが「動きを減らす」をONなら無効化 */
    @media (prefers-reduced-motion: reduce) {
      .js-reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
    }
  `;
    document.head.appendChild(style);

    // ---------- ユーティリティ ----------
    const isIgnored = (el) => IGNORE_SELECTORS.some(sel => el.closest(sel));

    const uniq = (arr) => Array.from(new Set(arr));

    // セクション内から対象要素を収集
    const collectTargets = () => {
        const targets = [];

        SECTIONS.forEach((secSel) => {
            const sec = document.querySelector(secSel);
            if (!sec) return;

            // テキストを収集
            sec.querySelectorAll(TEXT_SELECTORS).forEach(el => {
                if (isIgnored(el)) return;
                targets.push({ el, type: "text" });
            });

            // 画像を収集
            sec.querySelectorAll(IMAGE_SELECTORS).forEach(el => {
                if (isIgnored(el)) return;
                targets.push({ el, type: "img" });
            });
        });

        // 重複除去（同じ要素がtext/imgに被ることがある）
        const uniqueEls = uniq(targets.map(t => t.el));
        return uniqueEls.map(el => {
            // 画像優先判定（imgタグ or 写真系クラス）
            const isImg =
                el.tagName === "IMG" ||
                el.classList.contains("flow-photo") ||
                el.classList.contains("staff-photo") ||
                el.classList.contains("offer-card") ||
                el.classList.contains("access-photo") ||
                el.classList.contains("menu-photo") ||
                el.closest(".menu-photo") ||
                el.closest(".offer-card") ||
                el.closest(".access-photo") ||
                el.closest(".staff-photo");

            return { el, type: isImg ? "img" : "text" };
        });
    };

    // delayを上品に付ける：同一ブロック内で少しだけ段差
    const applyDelays = (items) => {
        // ざっくり：同じ親（article / .section / .flow-item / .menu-item / .access-card など）単位で段差
        const groupRootSelector = [
            ".flow-item",
            ".menu-item",
            ".access-card",
            ".qa-item",
            ".staff",
            ".offer-body",
            ".section"
        ].join(",");

        const groups = new Map();
        items.forEach(({ el, type }) => {
            const root = el.closest(groupRootSelector) || el.closest("main") || document.body;
            const key = root;
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push({ el, type });
        });

        groups.forEach((arr) => {
            // 並び順をDOM順に近づける
            arr.sort((a, b) => (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1);

            let step = 0;
            arr.forEach(({ el, type }) => {
                // 画像は少し遅らせる（AOSの「画像はfade + delay」）
                const base = type === "img" ? 160 : 0;
                const d = Math.min(360, base + step * 60); // 最大360msくらい
                el.style.setProperty("--reveal-delay", `${d}ms`);
                step++;
            });
        });
    };

    // ---------- メイン処理 ----------
    const init = () => {
        const items = collectTargets();

        // 初期クラス付与
        items.forEach(({ el, type }) => {
            // 既に表示済みのものは重複付与しない
            if (el.classList.contains("js-reveal")) return;
            el.classList.add("js-reveal");
            if (type === "img") el.classList.add("js-reveal--img");
        });

        // delay付与
        applyDelays(items);

        // IntersectionObserverで発火
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                el.classList.add("is-inview");
                if (CONFIG.once) io.unobserve(el);
            });
        }, {
            root: null,
            rootMargin: CONFIG.rootMargin,
            threshold: CONFIG.threshold,
        });

        items.forEach(({ el }) => {
            // 予約ボタンなど除外
            if (isIgnored(el)) return;
            io.observe(el);
        });
    };

    // DOM準備後に実行
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();





