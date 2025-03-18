from fastapi import FastAPI, Request
from modules import script_callbacks

last_prompt = ""
last_request_id = 0

def create_grimoire_api(_, app: FastAPI):
    @app.post("/grimoire/api/set_prompt")
    async def set_prompt(req: Request):
        global last_prompt, last_request_id
        data = await req.json()
        last_prompt = data.get("prompt", "")
        last_request_id = data.get("request_id", 0)
        return {"status": "ok", "prompt": last_prompt, "request_id": last_request_id}

    @app.get("/grimoire/api/get_prompt")
    async def get_prompt():
        return {"status": "ok", "prompt": last_prompt, "request_id": last_request_id}

script_callbacks.on_app_started(create_grimoire_api)
