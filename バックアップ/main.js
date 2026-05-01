/* =========================================================
   La vie belle.mf - main.js

   【構成】
   1. DOMContentLoaded（DOM読み込み完了後に実行）
      ├── ハンバーガーメニュー
      └── トップへスムーズスクロール
   2. GSAP ScrollTrigger アニメーション（即時実行関数）
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* -------------------------------------------------------
       1. ハンバーガーメニュー
    ------------------------------------------------------- */
    const overlay   = document.getElementById("menuOverlay");
    const hamburger = document.querySelector(".hamburger");
    const closeBtn  = overlay.querySelector(".menu-close");
    const panel     = overlay.querySelector(".menu-panel");
    const links     = overlay.querySelectorAll(".menu-link");

    // メニューを開く
    function openMenu() {
        overlay.classList.add("is-open");
        overlay.setAttribute("aria-hidden", "false");
        document.documentElement.classList.add("is-menu-open"); // スクロール禁止
    }

    // メニューを閉じる
    function closeMenu() {
        overlay.classList.remove("is-open");
        overlay.setAttribute("aria-hidden", "true");
        document.documentElement.classList.remove("is-menu-open"); // スクロール解除
    }

    hamburger.addEventListener("click", openMenu);
    closeBtn.addEventListener("click", closeMenu);

    // 背景（オーバーレイ）をクリックしたら閉じる
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeMenu();
    });

    // Escキーで閉じる
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && overlay.classList.contains("is-open")) closeMenu();
    });

    // メニューのリンクをクリックしたら閉じる
    links.forEach((a) => a.addEventListener("click", closeMenu));


    /* -------------------------------------------------------
       2. トップへスムーズスクロール
       ※ html { scroll-behavior: smooth; } でも可能だが、
          Safariの古いバージョンに対応するためJSでも実装している
    ------------------------------------------------------- */
    const scrollTopLink = document.querySelector(".js-scroll-top");

    if (scrollTopLink) {
        scrollTopLink.addEventListener("click", (e) => {
            e.preventDefault(); // デフォルトのジャンプ動作をキャンセル
            const target = document.querySelector("#top");
            if (target) target.scrollIntoView({ behavior: "smooth" });
        });
    }

}); // DOMContentLoaded ここまで


/* =========================================================
   GSAP ScrollTrigger アニメーション

   【用語解説】
   - GSAP（ジーサップ）：JavaScriptアニメーションライブラリ
   - ScrollTrigger：スクロール連動アニメーションのGSAPプラグイン
   - autoAlpha：opacity（透明度）と visibility を同時に制御するGSAP専用プロパティ
   - fromTo：開始状態 → 終了状態のアニメーション
   - stagger（スタッガー）：複数要素を時間差で動かす
========================================================= */
(() => {
    // GSAPとScrollTriggerが読み込まれていない場合は何もしない
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    // アクセシビリティ配慮：「視差効果を減らす」設定のユーザーには実行しない
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* ---- 共通デフォルト設定 ---- */
    const BASE = {
        duration: 1.25,
        ease: "power2.out",
        y: 26,
    };

    /**
     * reveal：1要素ずつフェードインさせる
     * @param {string} selector - CSSセレクター
     * @param {object} options  - アニメーション設定の上書き
     */
    const reveal = (selector, options = {}) => {
        const els = gsap.utils.toArray(selector);
        if (!els.length) return; // 要素がなければスキップ

        els.forEach((el, i) => {
            gsap.fromTo(
                el,
                {
                    autoAlpha: 0,                        // 初期：非表示
                    y: options.y ?? BASE.y,              // 初期：少し下にずれた位置
                    scale: options.scaleFrom ?? 1,
                },
                {
                    autoAlpha: 1,                        // 終了：表示
                    y: 0,                                // 終了：元の位置
                    scale: 1,
                    duration: options.duration ?? BASE.duration,
                    ease: options.ease ?? BASE.ease,
                    delay: options.stagger ? i * options.stagger : 0,
                    clearProps: "transform,opacity",     // アニメーション後にインラインスタイルを消す
                    scrollTrigger: {
                        trigger: el,
                        start: options.start ?? "top 85%",
                        toggleActions: "play none none none", // 一度だけ再生
                        once: true,
                    },
                }
            );
        });
    };

    /* =========================================================
       各セクションのアニメーション設定
    ========================================================= */

    /* ---- HERO ---- */
    reveal(".hero-title",   { y: 34, duration: 1.6 });

    /* ---- ロゴ（HEROとCONCEPTの間） ---- */
    reveal(".between-logo", { y: 20, duration: 1.3 });

    /* ---- SECTION TITLE（全セクション共通） ---- */
    // 各セクションのタイトル（CONCEPT / FLOW / MENU / STAFF / OFFER / Q&A / ACCESS）
    reveal(".section-title", { y: 18, duration: 1.1 });

    /* ---- CONCEPT ---- */
    reveal("#concept .concept-lead",  { stagger: 0.10, y: 24 });   // 「誰かの理想を...」見出し
    reveal("#concept .concept-title", { y: 18 });                   // 「La vie belle.mf とは」
    reveal("#concept .concept-text",  { stagger: 0.08, y: 20 });   // 本文段落

    /* ---- FLOW ---- */
    reveal("#flow .flow-what",          { stagger: 0.08, y: 20 });  // 「美心還顔とは？」JP/EN見出し
    reveal("#flow .flow-intro .flow-text", { stagger: 0.08, y: 18 }); // 説明文
    // flow-item はジグザグ transform を崩したくないので y は控えめ
    reveal("#flow .flow-item",          { stagger: 0.10, y: 22 });

    // flow-end（締めのブロック）
    reveal("#flow .flow-end-lead",      { y: 26, duration: 1.35 }); // 「私、本当はこうしたかった...」
    reveal("#flow .flow-end-title",     { stagger: 0.10, y: 20 }); // 「通うたびに変わる...」
    reveal("#flow .flow-end .flow-text",{ stagger: 0.08, y: 18 }); // flow-endの本文

    /* ---- MENU ---- */
    reveal("#menu .menu-photo",  { stagger: 0.07, y: 20 }); // メニュー写真
    reveal("#menu .menu-header", { stagger: 0.07, y: 18 }); // メニュー名・価格
    reveal("#menu .menu-desc",   { stagger: 0.07, y: 16 }); // メニュー説明文

    /* ---- STAFF ---- */
    reveal("#staff .staff-photo", { duration: 1.35, y: 28 }); // スタッフ写真
    reveal("#staff .staff-name",  { y: 16 });                  // 名前「Mutumi」
    reveal("#staff .staff-text",  { stagger: 0.07, y: 18 }); // スタッフ説明文

    /* ---- OFFER ---- */
    reveal("#offer .offer-card",      { y: 34, duration: 1.35 }); // チケット画像
    reveal("#offer .offer-btn--mint", { y: 18, duration: 1.1 });  // 予約ボタン

    /* ---- Q&A ---- */
    reveal("#qa .qa-item", { stagger: 0.07, y: 18 }); // Q&Aアコーディオン各項目

    /* ---- ACCESS ---- */
    reveal("#access .access-photo", { duration: 1.35, y: 28 }); // サロン写真
    reveal("#access .access-head",  { y: 18 });                   // 店名・TEL
    reveal("#access .access-text",  { y: 18 });                   // 住所
    reveal("#access .map",          { y: 16 });                   // Google Maps リンク
    reveal("#access .access-block", { stagger: 0.08, y: 16 });   // 営業時間・定休日
    reveal("#access .access-card",  { y: 22, duration: 1.2 });   // 予約カード

    /* ---- FOOTER ---- */
    reveal(".footer-logo", { y: 18 });
    reveal(".footer-nav",  { stagger: 0.06, y: 16 });
    reveal(".footer-copy", { y: 14 });

    // レイアウト確定後（画像読み込み後）にScrollTriggerの位置を再計算
    // ※ 画像の高さが決まる前にトリガー位置を計算すると、ズレが生じる
    window.addEventListener("load", () => ScrollTrigger.refresh());

})(); // 即時実行関数ここまで
