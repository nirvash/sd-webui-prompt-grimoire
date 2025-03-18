import modules.scripts as scripts
import gradio as gr
import os

from modules import shared
from modules import script_callbacks

def on_ui_settings():
    section = ("grimoire", "Grimoire 設定")  # 設定セクション名

    shared.opts.add_option(
        "grimoire_polling_interval",
        shared.OptionInfo(
            2,  # ← デフォルト2秒！！！
            "Polling interval (秒)",  # 表示名
            gr.Slider,  # スライダーで設定
            {
                "minimum": 1,  # 最低1秒
                "maximum": 60,  # 最大60秒
                "step": 1
            },
            section=section
        )
    )

script_callbacks.on_ui_settings(on_ui_settings)
