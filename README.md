# Selection Ask

> Highlight any text in the chat and ask about it in a popup — the answer never joins the conversation.

*Tóm tắt: bôi đen một đoạn trong chat rồi hỏi ngay về đoạn đó trong popup; câu trả lời không ghi gì vào phiên, nên không làm loãng ngữ cảnh.*

A DeepSeek Harness (DSH) Web plugin. One same-origin route makes a single auxiliary model call and streams the answer back over Server-Sent Events.

## Why this exists

When a single term in a long answer is unclear — an abbreviation, a symbol, a line of maths — the honest way to ask is to highlight it. But typing that question into the composer turns one clarification into a permanent turn in the transcript: it enters the context window, shifts the conversation, and costs tokens on every later request.

This plugin answers the small question without touching the session. Nothing is written: no message, no tool call, no event. Ask five follow-ups in the popup and the main conversation is exactly where you left it.

## Quick start

1. Install the plugin into a DSH profile (see [Installation](#installation)).
2. Restart Harness and select some text in any agent reply.
3. A small **Ask about this** button appears under the selection — click it.
4. Type the question, press **Enter** (`Shift+Enter` for a newline). The answer streams into the popup, and you can keep asking in the same popup.

`Esc`, the **X** button, or a click outside closes the popup. **Stop** cancels an answer that is still streaming.

## Installation

The package is published as a local link, not on npm.

```bash
git clone https://github.com/siberlly/selection-ask.git
cd ~/.dsh/profiles/desktop      # or another profile
npm install --save-exact "link:<path-to>/selection-ask"
```

Then list it in the profile's bundles — `~/.dsh/profiles/desktop/package.json`:

```json
{
  "dependencies": {
    "@local/selection-ask": "link:E:/mplugin/selection-ask"
  },
  "dsh": {
    "profile": {
      "bundles": [
        "@deepseek-ai/dsh-base",
        "@deepseek-ai/dsh-web-app",
        "@local/selection-ask"
      ]
    }
  }
}
```

Restart Harness. The bundle inserts one row, `id: selection-ask`; the profile's own `cordis.patch.yml` needs no edit.

**Prerequisites:** a working DSH Web profile and at least one configured provider/model.

## What gets sent to the model

The popup is not a second chat. The model receives one JSON document, framed as data so the highlighted text cannot be read as instructions:

| Field | Content | Cap |
|---|---|---|
| `highlightedFragment` | The exact text you selected | 6,000 chars |
| `surroundingContext` | The largest block around the selection that still fits — the whole conversation when short, otherwise the message or turn holding the selection | 16,000 chars |
| `previousExchange` | Earlier question/answer pairs in the same popup, newest kept | 12 turns, 8,000 chars total |
| `question` | What you typed | 4,000 chars |

The request body is capped at 512 KB. Anything longer is truncated to the limits above, never silently accepted whole.

The system prompt tells the model to answer only that question, prefer the nearest occurrence in the supplied context, admit in one sentence when the context does not settle the meaning, and never claim to have changed files or run commands. It answers in the language of your question.

## Configuration

Everything is optional. With an empty config the popup uses the model currently selected in the composer.

```yaml
- insert:
    - id: selection-ask
      name: '@local/selection-ask'
      config:
        provider: deepseek
        model: deepseek-v4
        maxTokens: 800
        systemPrompt: 'Answer only the question, briefly, in the language of the question.'
```

| Key | Type | Default | Description |
|---|---|---|---|
| `provider` | `string` | current selection | Pin a route for the popup. Must be set together with `model`. |
| `model` | `string` | current selection | Model id for the pinned route. |
| `maxTokens` | `integer` | `800` | Answer length cap. |
| `systemPrompt` | `string` | built-in prompt | Replaces the entire system instruction. |

If neither route key is set and no model is selected in the composer, the popup reports that no model is available instead of failing silently.

## Route contract

For anyone extending the plugin — one exact route, one method:

| Property | Value |
|---|---|
| Path | `/dsh-selection-ask/ask` |
| Method | `POST` — other methods get `405` |
| Success | `200`, `Content-Type: text/event-stream`, `Cache-Control: no-store`, `X-Accel-Buffering: no` |
| Bad request | `400` with `{ message }` when `selection` or `question` is empty, the body is not JSON, or the body exceeds 512 KB |

The stream carries JSON frames, one per `data:` line:

| Frame | Payload |
|---|---|
| `meta` | `{ provider, model }` — what answered |
| `delta` | `{ text }` — one token chunk of the answer |
| `error` | `{ message, code }` — the model call failed |
| `done` | Answer finished normally |

Closing the popup aborts the request: the client drops the connection and the Host aborts the model call through an `AbortController`, so a cancelled answer stops costing tokens.

## Limits and known behaviour

- **The popup is ephemeral.** Its Q&A history lives in page memory only. Closing the popup discards it; a reload discards it.
- **The button is offered only on readable text.** Selecting inside the composer, a sidebar, or the popup itself does not offer it.
- **The button is anchored to the selection's position.** Scrolling hides the idle button; an open popup stays where it was opened.
- **The route has no separate authentication.** It runs on the local Harness web server, like the app's other panels. It calls the model with your configured credentials — treat it as local-only.
- **One answer, one call.** There is no tool use, no file access, and no session context beyond the excerpt described above.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| No **Ask about this** button after selecting | The selection is inside an input, the composer, or a sidebar | Select text in an agent reply |
| "No model is available" | No composer selection and no pinned route | Pick a model, or set `provider` + `model` |
| "No model is selected" | Same, from the default-model lookup | Same |
| Answer stops immediately | The provider rejected the route or the key | Check the model id and the provider credentials |
| Popup closes on click | Click landed outside the popup | Drag the selection again and reopen |

## Layout

```
selection-ask/
├── index.js            Host half: the route, request bounds, prompt, SSE stream
├── client.js           Client half: selection detection, button, popup, streaming
├── cordis.patch.yml    Inserts the `selection-ask` row into the plugin tree
├── locale/en.json      English strings
├── locale/vi.json      Vietnamese strings
└── icon.svg            Settings icon
```

## Uninstall

Remove `@local/selection-ask` from the profile's `bundles` array and restart Harness. The plugin owns no files and writes no state, so there is nothing else to clean up.

## License

No license file is included yet.
