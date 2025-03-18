import modules.scripts as scripts
import gradio as gr
import os
import json

from modules import shared
from modules import script_callbacks

SETTINGS_FILE = "extensions/sd-webui-prompt-grimoire/grimoire_settings.json"

def load_settings():
    if os.path.exists(SETTINGS_FILE):
        with open(SETTINGS_FILE, 'r') as f:
            return json.load(f)
    return {"polling_interval": 0.5}

def save_settings(interval):
    os.makedirs(os.path.dirname(SETTINGS_FILE), exist_ok=True)
    with open(SETTINGS_FILE, 'w') as f:
        json.dump({"polling_interval": interval}, f)

def on_ui_settings():
    section = ("grimoire", "Grimoire 設定")  # 設定セクション名
    settings = load_settings()

    shared.opts.add_option(
        "grimoire_polling_interval",
        shared.OptionInfo(
            settings["polling_interval"],  # 保存された値をロード
            "Polling interval (秒)",  # 表示名
            gr.Slider,  # スライダーで設定
            {
                "minimum": 0.1,  # 最低0.1秒
                "maximum": 5.0,  # 最大5秒
                "step": 0.1
            },
            section=section
        )
    )

    # 設定値が変更されたときに保存
    def on_setting_change():
        interval = shared.opts.grimoire_polling_interval
        save_settings(interval)

    shared.opts.onchange("grimoire_polling_interval", on_setting_change)

script_callbacks.on_ui_settings(on_ui_settings)
