# sd-webui-prompt-grimoire

Stable Diffusion Web UIに外部からプロンプトを送信して画像生成を行うための拡張機能です。

[Illustra](https://github.com/nirvash/Illustra)と連携することで、デスクトップアプリケーションから簡単に画像生成を行うことができます。

## 機能

- 外部アプリケーションからREST APIを使用してWeb UIにプロンプトを送信
- プロンプトの保存と管理
- リクエストIDによる生成画像の管理（前回と異なるIDが送信された場合のみ画像生成を実行）
- [Illustra](https://github.com/nirvash/Illustra)との連携による簡単な画像生成

## インストール

1. Stable Diffusion Web UIを起動
2. 「拡張機能」タブを開く
3. 「URLからインストール」タブを選択
4. 「URL for extension's git repository」に本リポジトリのURLを入力
5. 「インストール」をクリック
6. Web UIを再起動

## 設定

Web UIの設定タブから以下の設定を変更できます：

### Grimoire 設定

- **Polling interval (秒)**: プロンプトの確認間隔を設定します（0.1-5.0秒、デフォルト: 0.5秒）
  * スライダーで0.1秒刻みに調整可能
  * 値が小さいほど頻繁にプロンプトを確認します
  * サーバーの負荷に応じて調整してください
  * 設定値は自動的に保存され、Web UI再起動後も維持されます

## Illustraとの連携

1. [Illustra](https://github.com/nirvash/Illustra)をインストール
2. IllustraのWeb UI設定でこの拡張機能のAPIエンドポイントを設定
3. Illustraから直接プロンプトを送信して画像生成が可能

## API仕様

### プロンプトの設定

プロンプトとリクエストID、アクションを送信して画像生成を行います。前回と異なるrequest_idが送信された場合のみ、新しい画像が生成されます。

使用可能なアクション：
- `none`: アクションを実行せず、プロンプトの設定のみを行います
- `generate`: 通常の画像生成を1回実行します
- `generate_forever`: 連続生成を開始します
- `cancel_forever`: 実行中の連続生成を停止します

`set_prompt`フラグ（デフォルト: true）で、プロンプトを設定するかどうかを制御できます：
- `true`: プロンプトを設定してからアクションを実行
- `false`: プロンプトを変更せずにアクションを実行

- **エンドポイント**: `/grimoire/set_prompt`
- **メソッド**: POST
- **リクエストボディ**:
```json
{
    "prompt": "1girl, dancing, cherry blossom, spring season, masterpiece, best quality",
    "request_id": 123,
    "action": "none",
    "set_prompt": true
}
```
- **レスポンス**:
```json
{
    "status": "ok",
    "prompt": "",
    "request_id": 123,
    "action": "none",
    "set_prompt": true
}
```

**注意**: 同じrequest_idで複数回リクエストを送信しても、画像は1回しか生成されません。新しい画像を生成する場合は、異なるrequest_idを使用してください。

### 現在のプロンプトの取得

設定された最新のプロンプトとリクエストIDを取得します。

- **エンドポイント**: `/grimoire/get_prompt`
- **メソッド**: GET
- **レスポンス**:
```json
{
    "status": "ok",
    "prompt": "",
    "request_id": 123
}
```

## 使用例

```python
import requests

# プロンプトを送信して画像生成（新しいrequest_idを使用）
response = requests.post("http://localhost:7860/grimoire/set_prompt", 
    json={"prompt": "1girl, dancing, cherry blossom, spring season, masterpiece, best quality", "request_id": 1})

# 同じプロンプトでも異なるrequest_idを使用すると新しい画像が生成される
response = requests.post("http://localhost:7860/grimoire/set_prompt", 
    json={"prompt": "1girl, dancing, cherry blossom, spring season, masterpiece, best quality", "request_id": 2})

# 設定されているプロンプトの確認
response = requests.get("http://localhost:7860/grimoire/get_prompt")
current_prompt = response.json()["prompt"]
```

---

# English

## sd-webui-prompt-grimoire

An extension for Stable Diffusion Web UI that enables sending prompts from external applications to generate images.

When used with [Illustra](https://github.com/nirvash/Illustra), you can easily generate images from a desktop application.

## Features

- Send prompts to Web UI via REST API from external applications
- Save and manage prompts
- Track generated images using request IDs (image generation occurs only when a different ID is sent)
- Easy image generation through integration with [Illustra](https://github.com/nirvash/Illustra)

## Installation

1. Launch Stable Diffusion Web UI
2. Open the "Extensions" tab
3. Select "Install from URL" tab
4. Enter this repository's URL in "URL for extension's git repository"
5. Click "Install"
6. Restart Web UI

## Settings

You can modify the following settings from the Web UI settings tab:

### Grimoire Settings

- **Polling interval (seconds)**: Set the interval for checking prompts (0.1-5.0 seconds, default: 0.5 seconds)
  * Adjust in 0.1 second increments using the slider
  * Lower values mean more frequent prompt checks
  * Adjust according to server load
  * Settings are automatically saved and persist after Web UI restart

## Integration with Illustra

1. Install [Illustra](https://github.com/nirvash/Illustra)
2. Configure the extension's API endpoint in Illustra's Web UI settings
3. Send prompts directly from Illustra to generate images

## API Reference

### Set Prompt

Send a prompt, request ID, and action to generate an image. A new image will only be generated when a different request_id is sent.

Available actions:
- `none`: Only sets the prompt without executing any action
- `generate`: Executes a single image generation
- `generate_forever`: Starts continuous image generation
- `cancel_forever`: Stops the ongoing continuous generation

The `set_prompt` flag (default: true) controls whether to update the prompt:
- `true`: Set the prompt before executing the action
- `false`: Execute the action without changing the current prompt

- **Endpoint**: `/grimoire/set_prompt`
- **Method**: POST
- **Request Body**:
```json
{
    "prompt": "1girl, dancing, cherry blossom, spring season, masterpiece, best quality",
    "request_id": 123,
    "action": "none",
    "set_prompt": true
}
```
- **Response**:
```json
{
    "status": "ok",
    "prompt": "",
    "request_id": 123
}
```

**Note**: Multiple requests with the same request_id will only generate one image. To generate a new image, use a different request_id.

### Get Current Prompt

Retrieve the latest prompt and request ID.

- **Endpoint**: `/grimoire/get_prompt`
- **Method**: GET
- **Response**:
```json
{
    "status": "ok",
    "prompt": "",
    "request_id": 123
}
```

## Usage Example

```python
import requests

# Send prompt to generate image (using new request_id)
response = requests.post("http://localhost:7860/grimoire/set_prompt", 
    json={"prompt": "1girl, dancing, cherry blossom, spring season, masterpiece, best quality", "request_id": 1})

# Same prompt with different request_id generates a new image
response = requests.post("http://localhost:7860/grimoire/set_prompt", 
    json={"prompt": "1girl, dancing, cherry blossom, spring season, masterpiece, best quality", "request_id": 2})

# Check current prompt
response = requests.get("http://localhost:7860/grimoire/get_prompt")
current_prompt = response.json()["prompt"]