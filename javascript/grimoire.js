onUiLoaded(function () {
    console.log("[Grimoire] UI Loaded, start polling for prompt...");

    let lastKnownRequestId = 0;  // 処理済みリクエストID

    async function fetchAndSetPrompt() {
        try {
            const res = await fetch("/grimoire/api/get_prompt");
            if (!res.ok) {
                console.error("[Grimoire] Failed to fetch prompt, status:", res.status);
                return;
            }

            const data = await res.json();
            const prompt = data.prompt.trim();
            const requestId = data.request_id;

            if (requestId === lastKnownRequestId) {
                return;  // 変わってなければスキップ
            }
            lastKnownRequestId = requestId;

            console.log("[Grimoire] New request ID:", requestId);
            console.log("[Grimoire] New prompt:", prompt);

            // txt2img プロンプト欄セット＋Gradio内部通知
            const promptBox = gradioApp().querySelector("#txt2img_prompt textarea");
            if (promptBox) {
                promptBox.value = prompt;
                promptBox.dispatchEvent(new Event("input", { bubbles: true }));  // Gradio内部同期
                console.log("[Grimoire] Prompt set and input event dispatched!");
            } else {
                console.warn("[Grimoire] txt2img prompt box not found!");
                return;
            }

            // 自動 Generate 実行！
            const genBtn = gradioApp().querySelector("#txt2img_generate");
            if (genBtn) {
                genBtn.click();
                console.log("[Grimoire] Generate button clicked!");
            } else {
                console.warn("[Grimoire] Generate button not found!");
            }

        } catch (e) {
            console.error("[Grimoire] Error fetching prompt:", e);
        }
    }

    fetchAndSetPrompt();  // 初回実行
    setInterval(fetchAndSetPrompt, 5000);  // 5秒ごとチェック
});
