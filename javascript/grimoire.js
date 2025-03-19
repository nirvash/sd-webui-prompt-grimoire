onUiLoaded(function () {
    console.log("[Grimoire] UI Loaded, starting long-polling for prompt...");

    let isPolling = false;  // ポーリング実行中フラグ
    let abortController = null;  // ポーリングキャンセル用
    const POLLING_TIMEOUT = 30;  // ロングポーリングのタイムアウト（秒）
    const RETRY_INTERVAL = 100;  // エラー時の再試行間隔（ms）

    // ボタンセレクター
    const FOREVER_BTN_SELECTORS = {
        GENERATE: "#txt2img_results > div.easy_generate_forever_container > div > button:nth-child(1)",
        CANCEL: "#txt2img_results > div.easy_generate_forever_container > div > button:nth-child(2)"
    };

    // アクションの実行
    async function executeAction(action, prompt, setPrompt) {
        // プロンプトをセット
        if (setPrompt && prompt) {
            const promptBox = gradioApp().querySelector("#txt2img_prompt textarea");
            if (!promptBox) {
                console.warn("[Grimoire] txt2img prompt box not found!");
                return false;
            }

            promptBox.value = prompt.trim();
            promptBox.dispatchEvent(new Event("input", { bubbles: true }));
            console.log("[Grimoire] Prompt set and input event dispatched!");
        }

        // アクションに応じた処理
        switch (action) {
            case "generate":
                const genBtn = gradioApp().querySelector("#txt2img_generate");
                if (genBtn) {
                    genBtn.click();
                    console.log("[Grimoire] Generate button clicked!");
                    return true;
                }
                break;

            case "generate_forever":
                const foreverBtn = gradioApp().querySelector(FOREVER_BTN_SELECTORS.GENERATE);
                if (foreverBtn) {
                    foreverBtn.click();
                    console.log("[Grimoire] Generate Forever button clicked!");
                    return true;
                }
                break;

            case "cancel_forever":
                const cancelBtn = gradioApp().querySelector(FOREVER_BTN_SELECTORS.CANCEL);
                if (cancelBtn) {
                    cancelBtn.click();
                    console.log("[Grimoire] Cancel Forever button clicked!");
                    return true;
                }
                break;

            case "none":
                return true;  // タグ設定のみの場合は成功

            default:
                console.warn("[Grimoire] Unknown action:", action);
                return false;
        }

        console.warn("[Grimoire] Action button not found!");
        return false;
    }

    // ポーリングを開始
    async function startPolling() {
        if (isPolling) {
            // 実行中のポーリングをキャンセル
            if (abortController) {
                abortController.abort();
                abortController = null;
            }
        }
        
        isPolling = true;
        await pollForPrompt();  // ポーリング開始
    }

    async function pollForPrompt() {
        while (isPolling) {
            try {
                abortController = new AbortController();
                const res = await fetch(`/grimoire/get_prompt?timeout=${POLLING_TIMEOUT}`, {
                    signal: abortController.signal
                });

                if (!res.ok) {
                    console.error("[Grimoire] Failed to fetch prompt, status:", res.status);
                    await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
                    continue;
                }

                const data = await res.json();
                
                if (data.status === "timeout") {
                    console.log("[Grimoire] Polling timeout, retrying...");
                    continue;
                }

                if (data.status === "error") {
                    console.error("[Grimoire] Server error:", data.message);
                    await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
                    continue;
                }

                console.log("[Grimoire] New request ID:", data.request_id);
                console.log("[Grimoire] New prompt:", data.prompt);
                console.log("[Grimoire] Action:", data.action);
                console.log("[Grimoire] Set prompt:", data.set_prompt);

                // アクションを実行
                if (!await executeAction(data.action, data.prompt, data.set_prompt)) {
                    console.warn("[Grimoire] Action execution failed, retrying...");
                    await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
                    continue;
                }

            } catch (e) {
                if (e.name === 'AbortError') {
                    console.log("[Grimoire] Polling aborted, restarting with new timeout...");
                } else {
                    console.error("[Grimoire] Error polling prompt:", e);
                    await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
                }
            }
        }
    }

    startPolling();  // ポーリング開始
});
