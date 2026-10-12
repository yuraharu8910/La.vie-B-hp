/* =========================================================
   La vie belle.mf チャットボット
   ---------------------------------------------------------
   3つの段階を、下の CONFIG.mode を切り替えるだけで使い分けられます。

     mode: "ui"     … 段階1：見た目だけ（決まった案内を返す）
     mode: "sheets" … 段階2：Googleスプレッドシートの「よくある質問」から
                       キーワードが一致した回答を返す
     mode: "ai"     … 段階3：バックエンド（サーバー）経由でAIが回答する

   ※ APIキーはこのファイルには絶対に書きません。
     （ブラウザのJSは誰でも中身を見られるため。キーはサーバー側だけに置きます）
========================================================= */

(() => {
    "use strict"; // 書き間違いをエラーとして教えてくれるモード

    /* -------------------------------------------------------
       設定（ここだけ書き換えればOK）
    ------------------------------------------------------- */
    const CONFIG = {
        mode: "ai",                 // "ui" → "sheets" → "ai" の順に進めていく（今は段階3：AI回答）

        // 段階2で使う：スプレッドシートを「ウェブに公開」したCSVのURL
        sheetCsvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTzqgQzwy-dMYTnOhCTCtGgDoubpR8PX_hQVsc-Ez_5IADH0-IwK7Jgkr0CN32YE6uS2MFJrPNBSSqv/pub?gid=808699289&single=true&output=csv",

        // 段階3で使う：Google Apps Script を「ウェブアプリ」として公開したURL
        // （例：https://script.google.com/macros/s/xxxx/exec）
        apiUrl: "https://script.google.com/macros/s/AKfycbxCXpgxvCp51RYsonR0cLZbVxUpHurpR_BNsv7R7UP6m2Z_RHYN7TuE0VtkZkynisZZ/exec",

        // 予約・問い合わせ先（LPと同じ公式LINE）
        lineUrl: "https://line.me/R/ti/p/@091pbxqz",

        // 最初のあいさつ
        greeting:
            "こんにちは。La vie belle.mf です🌿\n" +
            "メニューや料金、ご予約について、お気軽にご質問ください。",

        // タップで送れる「よくある質問」
        quickQuestions: [
            "初回の料金は？",
            "施術時間はどのくらい？",
            "メイクのまま行っていい？",
            "アクセス・送迎について",
        ],
    };

    /* -------------------------------------------------------
       HTML部品を作ってページに追加する
       （index.html を大きく書き換えずに済むよう、JSで生成）
    ------------------------------------------------------- */
    const root = document.createElement("div");
    root.className = "lvb-chat";
    root.innerHTML = `
        <button type="button" class="lvb-chat-fab" aria-label="チャットで質問する" aria-expanded="false" aria-controls="lvbChatPanel">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
                <path d="M4 5h16v11H9l-5 4V5z" stroke-linejoin="round"/>
            </svg>
            <span>質問</span>
        </button>

        <section class="lvb-chat-panel" id="lvbChatPanel" role="dialog" aria-label="La vie belle.mf チャット" aria-hidden="true">
            <header class="lvb-chat-head">
                <p class="lvb-chat-title">
                    La vie belle.mf
                    <span class="lvb-chat-sub">ご質問にお答えします</span>
                </p>
                <button type="button" class="lvb-chat-close" aria-label="チャットを閉じる">×</button>
            </header>

            <div class="lvb-chat-log" aria-live="polite"></div>

            <div class="lvb-chat-quick"></div>

            <form class="lvb-chat-form">
                <input class="lvb-chat-input" type="text" maxlength="200"
                       placeholder="ご質問を入力してください" aria-label="質問を入力" autocomplete="off">
                <button class="lvb-chat-send" type="submit">送信</button>
            </form>
            <p class="lvb-chat-note">自動応答です。ご予約・詳しいご相談は公式LINEからどうぞ。</p>
        </section>
    `;
    document.body.appendChild(root);

    // よく使う要素を変数に入れておく
    const fab = root.querySelector(".lvb-chat-fab");
    const panel = root.querySelector(".lvb-chat-panel");
    const closeBtn = root.querySelector(".lvb-chat-close");
    const log = root.querySelector(".lvb-chat-log");
    const quick = root.querySelector(".lvb-chat-quick");
    const form = root.querySelector(".lvb-chat-form");
    const input = root.querySelector(".lvb-chat-input");
    const sendBtn = root.querySelector(".lvb-chat-send");

    /* -------------------------------------------------------
       固定予約ボタンの「実際の高さ」を測って、チャットをその上に置く
       （CSSの数値とずれても重ならないようにするため）
    ------------------------------------------------------- */
    function syncReserveHeight() {
        const bar = document.querySelector(".fixed-reserve");
        if (!bar) return;
        const h = bar.getBoundingClientRect().height;
        if (h > 0) document.documentElement.style.setProperty("--lvb-chat-reserve-h", `${Math.ceil(h)}px`);
    }
    syncReserveHeight();
    window.addEventListener("resize", syncReserveHeight);
    window.addEventListener("load", syncReserveHeight); // 画像やフォント読み込み後にもう一度

    let started = false;   // 最初のあいさつを出したかどうか
    let busy = false;      // 回答待ちの間は二重送信しない
    const history = [];    // 段階3で、会話の流れをAIに渡すための履歴

    /* -------------------------------------------------------
       開く・閉じる
    ------------------------------------------------------- */
    function openChat() {
        panel.classList.add("is-open");
        panel.setAttribute("aria-hidden", "false");
        fab.classList.add("is-hidden");
        fab.setAttribute("aria-expanded", "true");

        // 初めて開いたときだけ、あいさつと質問ボタンを出す
        if (!started) {
            started = true;
            addMessage(CONFIG.greeting, "bot");
            renderQuickQuestions();
        }
        // PCでは入力欄にすぐ文字を打てるように（スマホはキーボードが急に出ないよう除外）
        if (window.matchMedia("(min-width: 768px)").matches) input.focus();

        // 計測用：GTMがある本番ページでは「チャットを開いた」回数を記録できる
        pushEvent("chat_open");
    }

    function closeChat() {
        panel.classList.remove("is-open");
        panel.setAttribute("aria-hidden", "true");
        fab.classList.remove("is-hidden");
        fab.setAttribute("aria-expanded", "false");
        fab.focus();
    }

    fab.addEventListener("click", openChat);
    closeBtn.addEventListener("click", closeChat);
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && panel.classList.contains("is-open")) closeChat();
    });

    /* -------------------------------------------------------
       メッセージを画面に追加する
       ※ textContent を使うので、入力された文字がHTMLとして
         実行されることはない（安全対策）
    ------------------------------------------------------- */
    function addMessage(text, who) {
        const div = document.createElement("div");
        div.className = `lvb-chat-msg lvb-chat-msg--${who}`;
        div.textContent = text;
        log.appendChild(div);
        log.scrollTop = log.scrollHeight; // 一番下までスクロール
        return div;
    }

    // LINE予約ボタン（回答のあとに出す）
    function addLineButton() {
        const a = document.createElement("a");
        a.className = "lvb-chat-line-btn";
        a.href = CONFIG.lineUrl;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = "LINEで予約・相談する";
        // 計測用の目印。GTMが「チャットボット内のLINEボタン」だと見分けるために使う
        a.setAttribute("data-cta", "chatbot");
        a.addEventListener("click", () => pushEvent("chat_line_click")); // 予約への流れを計測
        log.appendChild(a);
        log.scrollTop = log.scrollHeight;
    }

    // 「…」の入力中表示
    function showTyping() {
        const div = document.createElement("div");
        div.className = "lvb-chat-msg lvb-chat-msg--bot lvb-chat-typing";
        div.innerHTML = "<span></span><span></span><span></span>";
        log.appendChild(div);
        log.scrollTop = log.scrollHeight;
        return div;
    }

    function renderQuickQuestions() {
        quick.innerHTML = "";
        CONFIG.quickQuestions.forEach((q) => {
            const b = document.createElement("button");
            b.type = "button";
            b.textContent = q;
            b.addEventListener("click", () => handleQuestion(q));
            quick.appendChild(b);
        });
    }

    /* -------------------------------------------------------
       送信されたときの処理
    ------------------------------------------------------- */
    form.addEventListener("submit", (e) => {
        e.preventDefault(); // ページの再読み込みを止める
        const text = input.value.trim();
        if (!text) return;
        input.value = "";
        handleQuestion(text);
    });

    async function handleQuestion(text) {
        if (busy) return;
        busy = true;
        sendBtn.disabled = true;
        quick.innerHTML = ""; // 一度質問したら、質問ボタンは消す

        addMessage(text, "user");
        pushEvent("chat_question");
        const typing = showTyping();

        try {
            const answer = await getAnswer(text);
            typing.remove();
            addMessage(answer.text, "bot");
            if (answer.showLine) addLineButton();
            history.push({ role: "user", content: text }, { role: "assistant", content: answer.text });
        } catch (err) {
            typing.remove();
            // 原因が分かるように、エラー内容を画面に出す（デモ・開発中の確認用）
            addMessage("うまく回答できませんでした。お手数ですが公式LINEからお問い合わせください。", "bot");
            addMessage(`［エラー内容］${err.message}`, "error");
            addLineButton();
            console.error(err);
        } finally {
            busy = false;
            sendBtn.disabled = false;
        }
    }

    /* -------------------------------------------------------
       回答の作り方（段階ごとに切り替え）
       戻り値：{ text: 回答文, showLine: LINEボタンを出すか }
    ------------------------------------------------------- */
    async function getAnswer(text) {
        if (CONFIG.mode === "sheets") return answerFromSheet(text);
        if (CONFIG.mode === "ai") {
            try {
                return await answerFromAI(text);
            } catch (err) {
                // AIが使えないとき（クレジット切れ・回数上限・通信エラーなど）は、
                // 段階2のキーワード回答に自動で切り替える。お客様には普段どおりの回答が出る
                console.warn("[chatbot] AI回答に失敗したため、キーワード回答に切り替えます：", err.message);
                pushEvent("chat_ai_fallback"); // 計測：AIが使えなかった回数
                return answerFromSheet(text);
            }
        }
        return answerUiOnly();
    }

    // 段階1：まだ回答機能がないので、決まった案内を返す
    async function answerUiOnly() {
        await wait(600); // それらしく少し待つ
        return {
            text: "ありがとうございます。\nただいま自動回答の準備中です。ご予約・ご質問は公式LINEからお気軽にどうぞ。",
            showLine: true,
        };
    }

    /* ---------- 段階2：スプレッドシートのキーワード一致 ---------- */
    let faqCache = null; // 1回読み込んだら使い回す

    async function loadFaq() {
        if (faqCache) return faqCache;
        if (!CONFIG.sheetCsvUrl) throw new Error("sheetCsvUrl が設定されていません（chatbot.js の CONFIG）");

        let res;
        try {
            // cache: "no-store" … 古いデータを使い回さず、毎回最新のシートを読む
            res = await fetch(CONFIG.sheetCsvUrl, { cache: "no-store" });
        } catch (e) {
            // 「Failed to fetch」はURLに届かなかったときのエラー。よくある原因を表示する
            throw new Error(
                "スプレッドシートに接続できませんでした（Failed to fetch）。\n" +
                "・index.html をファイルから直接開いていないか（Live Server で開く）\n" +
                "・公開したCSVのURLをブラウザで開いてダウンロードできるか\n" +
                "・公開した直後は数分かかることがあります"
            );
        }
        if (!res.ok) throw new Error(`スプレッドシートを読み込めません（HTTP ${res.status}）。「ウェブに公開」のCSVのURLか確認してください`);
        const csv = await res.text();

        // CSVを表データに変換（PapaParse：CSV解析ライブラリ）
        if (!window.Papa) throw new Error("PapaParse が読み込まれていません（index.html の script タグを確認）");
        const parsed = window.Papa.parse(csv, { header: true, skipEmptyLines: true });

        // keyword列は「、」「,」「|」区切りで複数書ける
        faqCache = parsed.data
            .filter((row) => row.keyword && row.answer)
            .map((row) => ({
                keywords: row.keyword.split(/[、,|]/).map((k) => normalize(k)).filter(Boolean),
                answer: row.answer.trim(),
            }));
        if (faqCache.length === 0) throw new Error("スプレッドシートに keyword / answer の列が見つかりません");
        return faqCache;
    }

    async function answerFromSheet(text) {
        const faq = await loadFaq();
        const q = normalize(text);

        // 一致したキーワードの「文字数の合計」が一番多い行を選ぶ
        // （「初回」より「初回料金」のように、長く具体的な一致を優先するため）
        let best = null;
        let bestScore = 0;
        faq.forEach((row) => {
            const score = row.keywords.reduce((sum, k) => (q.includes(k) ? sum + k.length : sum), 0);
            if (score > bestScore) {
                best = row;
                bestScore = score;
            }
        });

        await wait(400);
        if (best) return { text: best.answer, showLine: true };
        return {
            text: "申し訳ありません、そのご質問にはこちらでお答えできませんでした。\nお手数ですが、公式LINEからお気軽にお問い合わせください。",
            showLine: true,
        };
    }

    /* ---------- 段階3：AI（バックエンド経由） ---------- */
    async function answerFromAI(text) {
        if (!CONFIG.apiUrl) throw new Error("apiUrl が設定されていません（chatbot.js の CONFIG）");

        // サーバーには「質問」と「直近の会話」だけを送る
        // （ナレッジやAIへの指示文はサーバー側で組み立てるので、ここからは改ざんできない）
        // ※ Google Apps Script に送るときは Content-Type を text/plain にする
        //   （application/json だとブラウザが事前確認＝プリフライトを送り、GASが受け付けないため）
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 20000); // 20秒で諦める
        let res;
        try {
            res = await fetch(CONFIG.apiUrl, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({ message: text, history: history.slice(-6) }),
                signal: controller.signal,
            });
        } finally {
            clearTimeout(timer);
        }

        let data = {};
        try { data = await res.json(); } catch (_) { /* JSONでない応答 */ }
        // GASはエラーでもHTTP 200で返すので、中身の error も確認する
        if (!res.ok || data.error) throw new Error(data.error || `サーバーエラー（HTTP ${res.status}）`);
        if (!data.reply) throw new Error("サーバーから回答が返ってきませんでした");

        return { text: data.reply, showLine: true };
    }

    /* -------------------------------------------------------
       小さな道具
    ------------------------------------------------------- */
    // 比較しやすいように、全角英数→半角・大文字→小文字・空白除去
    function normalize(s) {
        return String(s)
            .normalize("NFKC")
            .toLowerCase()
            .replace(/\s+/g, "");
    }

    function wait(ms) {
        return new Promise((r) => setTimeout(r, ms));
    }

    // GTM（Googleタグマネージャー）への計測イベント送信
    // デモ版ではGTMを止めているので、何も起きない
    function pushEvent(name) {
        if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event: name });
    }
})();
