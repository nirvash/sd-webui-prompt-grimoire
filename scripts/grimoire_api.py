import asyncio
from enum import Enum
from typing import Optional
from fastapi import FastAPI, Request
from modules import script_callbacks

class ActionType(str, Enum):
    NONE = "none"
    GENERATE = "generate"
    GENERATE_FOREVER = "generate_forever"
    CANCEL_FOREVER = "cancel_forever"

prompt_store = {
    "prompt": "",
    "request_id": 0,
    "set_prompt": True,
    "action": ActionType.NONE
}
condition = asyncio.Condition()

def create_grimoire_api(_, app: FastAPI):
    @app.post("/grimoire/set_prompt")
    async def set_prompt(req: Request):
        data = await req.json()
        async with condition:
            prompt_store["prompt"] = data.get("prompt", "")
            prompt_store["request_id"] = data.get("request_id", 0)
            prompt_store["set_prompt"] = data.get("set_prompt", True)
            prompt_store["action"] = ActionType(data.get("action", ActionType.NONE))
            condition.notify_all()
        return {
            "status": "ok",
            "prompt": prompt_store["prompt"],
            "request_id": prompt_store["request_id"],
            "set_prompt": prompt_store["set_prompt"],
            "action": prompt_store["action"]
        }

    @app.get("/grimoire/get_prompt")
    async def get_prompt(timeout: int = 30):
        """新しいプロンプトが設定されるまで待機（最大 timeout 秒）"""
        try:
            async with condition:
                # 現在のリクエストIDを保存
                current_id = prompt_store["request_id"]
                
                # リクエストIDが変更されるまで待機
                while current_id == prompt_store["request_id"]:
                    try:
                        await asyncio.wait_for(condition.wait(), timeout=timeout)
                    except asyncio.TimeoutError:
                        return {
                            "status": "timeout",
                            "message": "No new prompt within timeout",
                            "prompt": prompt_store["prompt"],
                            "request_id": prompt_store["request_id"],
                            "set_prompt": prompt_store["set_prompt"],
                            "action": prompt_store["action"]
                        }

            return {
                "status": "ok",
                "prompt": prompt_store["prompt"],
                "request_id": prompt_store["request_id"],
                "set_prompt": prompt_store["set_prompt"],
                "action": prompt_store["action"]
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e),
                "prompt": prompt_store["prompt"],
                "request_id": prompt_store["request_id"]
            }

script_callbacks.on_app_started(create_grimoire_api)
