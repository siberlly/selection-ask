window.__ModuleLoader__.load({
  id: '@local/selection-ask',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const PACKAGE = '@local/selection-ask';
    const NS = 'selectionAsk';
    const ASK_URL = '/dsh-selection-ask/ask';
    const CSS_ID = PACKAGE + '/ui.css';
    const PANEL_WIDTH = 560;
    const PANEL_MAX_HEIGHT = 620;
    const MIN_SELECTION = 2;
    const MAX_SELECTION = 6000;
    /**
     * Characters of surrounding text sent with one question (~3k tokens).
     * The block grows upward until it would exceed this, so a short chat sends
     * everything and a long chat sends the message or turn around the highlight.
     */
    const CONTEXT_LIMIT = 12000;

    /* ---------------------------------------------------------------- */
    /* copy                                                              */
    /* ---------------------------------------------------------------- */

    const EN = {
      'pill': 'Ask about this',
      'title': 'Quick ask',
      'selected': 'Highlighted text',
      'placeholder': 'What should I explain about this?',
      'send': 'Ask',
      'stop': 'Stop',
      'close': 'Close',
      'waiting': 'Answering…',
      'hint': 'Not added to this chat',
      'errorTitle': 'Could not answer',
      'clear': 'Clear',
      'keys': 'Enter to send · Esc to close',
      'empty': 'Ask anything about the highlighted text. This answer stays out of the conversation.',
    };

    const VI = {
      'pill': 'Hỏi về đoạn này',
      'title': 'Hỏi nhanh',
      'selected': 'Đoạn đã chọn',
      'placeholder': 'Bạn muốn hỏi gì về đoạn này?',
      'send': 'Gửi',
      'stop': 'Dừng',
      'close': 'Đóng',
      'waiting': 'Đang trả lời…',
      'hint': 'Không thêm vào phiên chat',
      'errorTitle': 'Không hỏi được',
      'clear': 'Xoá hội thoại',
      'keys': 'Enter để gửi · Esc để đóng',
      'empty': 'Hỏi bất cứ điều gì về đoạn được bôi đen. Câu trả lời không đi vào hội thoại.',
    };

    /* ---------------------------------------------------------------- */
    /* styles                                                            */
    /* ---------------------------------------------------------------- */

    const UI_CSS = `
.dsh-ask-pill{position:fixed;display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 11px 0 8px;border-radius:14px;
 border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);
 box-shadow:var(--dsw-shadow-lv2);font-family:var(--dsw-font-family);font-size:12px;line-height:1;cursor:pointer;white-space:nowrap;
 pointer-events:auto;z-index:41;animation:dsh-ask-pop .16s cubic-bezier(.2,.8,.25,1);
 transition:background-color .13s ease,border-color .13s ease,transform .1s ease}
.dsh-ask-pill:hover{background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-border-l3)}
.dsh-ask-pill:active{transform:scale(.97)}
.dsh-ask-pill:focus-visible{outline:2px solid var(--dsw-focus-ring-color);outline-offset:2px}
.dsh-ask-panel{position:fixed;display:flex;flex-direction:column;min-height:0;border-radius:14px;overflow:hidden;
 border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);box-shadow:var(--dsw-shadow-lv3);
 -webkit-backdrop-filter:blur(18px) saturate(1.04);backdrop-filter:blur(18px) saturate(1.04);
 color:var(--dsw-alias-label-primary);font-family:var(--dsw-font-family);font-size:13px;line-height:1.5;
 pointer-events:auto;z-index:42;animation:dsh-ask-rise .22s cubic-bezier(.2,.8,.25,1)}
.dsh-ask-head{display:flex;align-items:center;gap:6px;padding:9px 10px 8px 12px;flex:none;border-bottom:.5px solid var(--dsw-alias-border-l1)}
.dsh-ask-head-title{font-size:12px;font-weight:600;letter-spacing:.01em;white-space:nowrap}
.dsh-ask-head-note{margin-left:auto;font-size:11px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;overflow:hidden;
 text-overflow:ellipsis;min-width:0}
.dsh-ask-x{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:0;border-radius:6px;
 background:none;color:var(--dsw-alias-label-secondary);cursor:pointer;flex:none;padding:0;
 transition:background-color .13s ease,color .13s ease}
.dsh-ask-x:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsh-ask-x:focus-visible{outline:2px solid var(--dsw-focus-ring-color);outline-offset:1px}
.dsh-ask-quote{margin:10px 12px 0;padding:7px 10px;border-radius:8px;background:var(--dsw-alias-bg-layer-2);
 border-left:2px solid var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.45;
 max-height:86px;overflow:hidden;white-space:pre-wrap;word-break:break-word;flex:none;position:relative}
.dsh-ask-quote[data-clamped="true"]:after{content:"";position:absolute;left:0;right:0;bottom:0;height:20px;
 background:linear-gradient(to bottom,transparent,var(--dsw-alias-bg-layer-2))}
.dsh-ask-log{flex:0 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:10px 14px 6px;
 display:flex;flex-direction:column;gap:12px;scrollbar-width:thin;scrollbar-color:var(--dsw-alias-scrollbar-bg-l1) transparent}
.dsh-ask-log::-webkit-scrollbar{width:8px}
.dsh-ask-log::-webkit-scrollbar-thumb{background:var(--dsw-alias-scrollbar-bg-l1);border-radius:4px}
.dsh-ask-q{font-size:12px;color:var(--dsw-alias-label-tertiary);display:flex;gap:6px;align-items:baseline}
.dsh-ask-q b{font-weight:600;color:var(--dsw-alias-label-secondary);flex:none}
.dsh-ask-a{white-space:pre-wrap;word-break:break-word;font-size:13px;color:var(--dsw-alias-label-primary);
 animation:dsh-ask-fade .2s ease-out}
.dsh-ask-a code{background:var(--dsw-alias-markdown-inline-code);border-radius:4px;padding:1px 4px;font-size:12px;
 font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.dsh-ask-a strong{font-weight:600}
.dsh-ask-wait{display:inline-flex;align-items:center;gap:6px;color:var(--dsw-alias-label-tertiary);font-size:12px}
.dsh-ask-dot{width:5px;height:5px;border-radius:50%;background:currentColor;animation:dsh-ask-blink 1s ease-in-out infinite}
.dsh-ask-dot:nth-child(2){animation-delay:.15s}
.dsh-ask-dot:nth-child(3){animation-delay:.3s}
.dsh-ask-empty{margin:10px 14px 2px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:1.5}
.dsh-ask-error{margin:8px 14px 0;padding:6px 9px;border-radius:6px;background:var(--dsw-alias-bg-layer-2);
 color:var(--dsw-alias-state-error-primary);font-size:12px;white-space:pre-wrap;word-break:break-word;flex:none}
.dsh-ask-foot{flex:none;padding:8px 12px 9px;border-top:.5px solid var(--dsw-alias-border-l1);display:flex;flex-direction:column;gap:6px}
.dsh-ask-form{display:flex;align-items:flex-end;gap:6px}
.dsh-ask-input{flex:1;min-width:0;resize:none;font-family:inherit;font-size:13px;line-height:1.45;color:var(--dsw-alias-label-primary);
 background:var(--dsw-alias-bg-layer-2);border:.5px solid var(--dsw-alias-border-l2);border-radius:9px;padding:7px 9px;max-height:104px;
 transition:border-color .13s ease,box-shadow .13s ease}
.dsh-ask-input::placeholder{color:var(--dsw-alias-label-tertiary)}
.dsh-ask-input:focus{outline:none;border-color:var(--dsw-alias-brand-primary);box-shadow:0 0 0 2px var(--dsw-alias-interactive-bg-hover)}
.dsh-ask-send{flex:none;height:31px;padding:0 13px;border-radius:9px;border:0;font-family:inherit;font-size:12px;font-weight:600;
 background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-inverted);cursor:pointer;
 transition:background-color .13s ease,transform .1s ease,opacity .13s ease}
.dsh-ask-send:hover{background:var(--dsw-alias-button-primary-hover)}
.dsh-ask-send:active{transform:scale(.97)}
.dsh-ask-send:disabled{opacity:.45;cursor:default;transform:none}
.dsh-ask-send[data-mode="stop"]{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);
 border:.5px solid var(--dsw-alias-border-l2);font-weight:500}
.dsh-ask-meta{display:flex;align-items:center;gap:8px;font-size:11px;color:var(--dsw-alias-label-tertiary);min-height:14px;white-space:nowrap}
.dsh-ask-meta-model{margin-left:auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:55%;min-width:0}
.dsh-ask-link{border:0;background:none;padding:0;font:inherit;font-size:11px;color:var(--dsw-alias-label-tertiary);cursor:pointer;
 text-decoration:underline;transition:color .13s ease}
.dsh-ask-link:hover{color:var(--dsw-alias-label-primary)}
@keyframes dsh-ask-rise{from{opacity:0;transform:translateY(7px) scale(.985)}to{opacity:1;transform:none}}
@keyframes dsh-ask-pop{from{opacity:0;transform:translateY(3px) scale(.94)}to{opacity:1;transform:none}}
@keyframes dsh-ask-fade{from{opacity:0;transform:translateY(2px)}to{opacity:1;transform:none}}
@keyframes dsh-ask-blink{0%,100%{opacity:.25}50%{opacity:1}}
@media (prefers-reduced-motion:reduce){
  .dsh-ask-pill,.dsh-ask-panel,.dsh-ask-a,.dsh-ask-dot{animation:none}
  .dsh-ask-pill,.dsh-ask-send,.dsh-ask-x,.dsh-ask-input{transition:none}
}
`;

    /* ---------------------------------------------------------------- */
    /* state                                                             */
    /* ---------------------------------------------------------------- */

    /** Anchor captured at selection time, in viewport coordinates. */
    const INITIAL = {
      anchor: null,
      selection: '',
      context: '',
      pill: false,
      panel: false,
      turns: [],
      passDraft: '',
      question: '',
      streaming: '',
      busy: false,
      error: '',
      model: '',
    };

    const state = Object.assign({}, INITIAL);
    const listeners = new Set();

    function emit() {
      for (const listener of Array.from(listeners)) {
        try {
          listener();
        } catch {
          /* one broken listener must not stop the rest */
        }
      }
    }

    const store = {
      subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
      patch(next) {
        Object.assign(state, next);
        emit();
      },
      reset() {
        Object.assign(state, INITIAL, { turns: [] });
        emit();
      },
      get() {
        return state;
      },
    };

    function useStore() {
      const [, force] = React.useReducer((value) => value + 1, 0);
      React.useEffect(() => store.subscribe(force), []);
      return state;
    }

    /** The in-flight request, so closing the popup can cancel it. */
    let controller = null;
    /** Text waiting for the next paint, so tokens do not each cost a render. */
    let pending = '';
    let flushTimer = 0;

    function flushStream() {
      flushTimer = 0;
      if (pending === state.streaming) return;
      store.patch({ streaming: pending });
    }

    function queueStream(text) {
      pending += text;
      if (flushTimer !== 0) return;
      flushTimer = window.setTimeout(flushStream, 24);
    }

    /* ---------------------------------------------------------------- */
    /* selection capture                                                 */
    /* ---------------------------------------------------------------- */

    /** Elements whose text selection is an input gesture, not a reading gesture. */
    const EDITABLE = 'input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="textbox"]';

    /** @returns the element that owns one selection boundary node. */
    function elementOf(node) {
      if (node === null || node === undefined) return null;
      const element = node.nodeType === 1 ? node : node.parentElement;
      return element instanceof Element ? element : null;
    }

    /** @returns whether a selection in this element belongs to the reading surface. */
    function inReadingSurface(element) {
      if (element.closest(EDITABLE) !== null) return false;
      const main = document.querySelector('main, [role="main"]');
      if (main !== null) return main.contains(element);
      return element.closest('nav, aside, header, footer, [role="navigation"], [role="banner"], [role="complementary"]') === null;
    }

    /** @returns one block's readable text, without painter blank lines. */
    function readable(text) {
      if (typeof text !== 'string') return '';
      return text.replace(/[ \t]+\n/gu, '\n').replace(/\n{3,}/gu, '\n\n').trim();
    }

    /** @returns a window of `text` around the fragment, for a block that is itself too big. */
    function windowAround(text, fragment) {
      const needle = fragment.slice(0, 120);
      const at = needle.length === 0 ? -1 : text.indexOf(needle);
      if (at < 0) return text.slice(0, CONTEXT_LIMIT);
      const from = Math.max(0, at - 3000);
      const to = Math.min(text.length, at + 3000 + needle.length);
      return (from > 0 ? '…\n' : '') + text.slice(from, to) + (to < text.length ? '\n…' : '');
    }

    /**
     * Grow from the highlight to the largest ancestor that still fits in
     * CONTEXT_LIMIT, so the model reads the message around the fragment instead
     * of one clipped line — and a short conversation is sent whole. A block that
     * already exceeds the limit contributes a window around the fragment.
     * @returns the surrounding text, or '' when nothing readable surrounds it.
     */
    function contextOf(selection, fragment) {
      try {
        let element = elementOf(selection.anchorNode);
        if (element === null) return '';
        const start = element;
        let block = start;
        let best = '';
        for (let step = 0; step < 10 && element !== null; step += 1) {
          const text = readable(element.innerText);
          if (text.length > CONTEXT_LIMIT) {
            block = element;
            break;
          }
          if (text.length > 0) best = text;
          if (element.tagName === 'BODY') break;
          element = element.parentElement;
        }
        if (best.length > 0) return best;
        return windowAround(readable(block.innerText), fragment);
      } catch {
        return '';
      }
    }

    /** @returns the highlight under the pointer, or null when there is none to ask about. */
    function readSelection() {
      const selection = window.getSelection();
      if (selection === null || selection.isCollapsed || selection.rangeCount === 0) return null;
      const text = selection.toString().replace(/\s+$/u, '').trim();
      if (text.length < MIN_SELECTION) return null;
      const element = elementOf(selection.anchorNode);
      if (element === null || !inReadingSurface(element)) return null;
      if (element.closest('[data-dsh-ask]') !== null) return null;

      const range = selection.getRangeAt(0);
      const rects = range.getClientRects();
      const last = rects.length > 0 ? rects[rects.length - 1] : range.getBoundingClientRect();
      if (!last || (last.width === 0 && last.height === 0)) return null;

      return {
        text: text.length > MAX_SELECTION ? text.slice(0, MAX_SELECTION) : text,
        context: contextOf(selection, text),
        anchor: { left: last.left, top: last.top, bottom: last.bottom },
      };
    }

    /* ---------------------------------------------------------------- */
    /* transitions                                                       */
    /* ---------------------------------------------------------------- */

    let rafId = 0;

    function scheduleRefresh() {
      if (rafId !== 0) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        refresh();
      });
    }

    function refresh() {
      if (state.panel) return;
      const info = readSelection();
      if (info === null) {
        if (state.pill) store.patch({ pill: false });
        return;
      }
      store.patch({
        anchor: info.anchor,
        selection: info.text,
        context: info.context,
        pill: true,
      });
    }

    function openPanel() {
      if (state.selection.length === 0) return;
      store.patch({ panel: true, pill: false, turns: [], streaming: '', question: '', error: '', model: '', passDraft: '' });
    }

    function dismiss() {
      if (flushTimer !== 0) {
        window.clearTimeout(flushTimer);
        flushTimer = 0;
      }
      pending = '';
      if (controller !== null) {
        try {
          controller.abort();
        } catch {
          /* already settled */
        }
        controller = null;
      }
      store.reset();
    }

    /** Empty the transcript but keep the popup open on the same highlight. */
    function clearTurns() {
      store.patch({ turns: [], streaming: '', question: '', error: '', model: '' });
    }

    function send(question) {
      const trimmed = typeof question === 'string' ? question.trim() : '';
      if (trimmed.length === 0 || state.busy) return;
      const payload = {
        selection: state.selection,
        context: state.context,
        question: trimmed,
        history: state.turns.map((turn) => ({ question: turn.question, answer: turn.answer })),
      };
      pending = '';
      store.patch({ busy: true, error: '', question: trimmed, streaming: '', passDraft: '', model: '' });
      controller = new AbortController();
      run(payload, controller).catch(() => undefined);
    }

    /** Stream one answer and fold it into the popup's local transcript. */
    async function run(payload, owner) {
      let failure = '';
      try {
        await stream(payload, (frame) => {
          if (frame.t === 'meta') {
            store.patch({ model: String(frame.provider) + ' · ' + String(frame.model) });
          } else if (frame.t === 'delta') {
            queueStream(String(frame.text));
          } else if (frame.t === 'error') {
            failure = String(frame.message);
          }
        }, owner.signal);
      } catch (error) {
        if (!(error && error.name === 'AbortError')) {
          failure = error instanceof Error ? error.message : String(error);
        }
      }
      if (controller === owner) controller = null;
      if (!state.panel) return;
      if (flushTimer !== 0) {
        window.clearTimeout(flushTimer);
        flushTimer = 0;
      }
      const answer = pending.trim();
      pending = '';
      const question = state.question;
      if (answer.length === 0) {
        store.patch({ busy: false, streaming: '', error: failure.length > 0 ? failure : 'The model returned nothing.' });
        return;
      }
      store.patch({
        busy: false,
        streaming: '',
        error: failure,
        turns: state.turns.concat([{ question, answer }]),
      });
    }

    /** Read one SSE answer stream. */
    async function stream(payload, onFrame, signal) {
      const response = await fetch(ASK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal,
      });
      if (!response.ok) {
        let message = 'The host answered ' + response.status + '.';
        try {
          const body = await response.json();
          if (body !== null && typeof body === 'object' && typeof body.message === 'string') message = body.message;
        } catch {
          /* keep the status message */
        }
        throw new Error(message);
      }
      if (response.body === null) throw new Error('The host sent no answer stream.');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      for (;;) {
        const chunk = await reader.read();
        if (chunk.done) break;
        buffer += decoder.decode(chunk.value, { stream: true });
        for (;;) {
          const boundary = buffer.indexOf('\n\n');
          if (boundary === -1) break;
          const frame = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          for (const line of frame.split('\n')) {
            if (!line.startsWith('data:')) continue;
            const raw = line.slice(5).trim();
            if (raw.length === 0) continue;
            try {
              onFrame(JSON.parse(raw));
            } catch {
              /* one malformed frame must not stop the answer */
            }
          }
        }
      }
    }

    /* ---------------------------------------------------------------- */
    /* geometry                                                          */
    /* ---------------------------------------------------------------- */

    /** @returns the pill box, kept inside the viewport. */
    function pillBox(anchor) {
      const width = 170;
      const left = Math.max(8, Math.min(anchor.left, window.innerWidth - width - 8));
      const above = anchor.bottom + 44 > window.innerHeight;
      const top = above ? Math.max(8, anchor.top - 34) : anchor.bottom + 6;
      return { left: left, top: top };
    }

    /** @returns the panel box: a wide sheet below the highlight, or above it when space runs out. */
    function panelBox(anchor) {
      const margin = 12;
      const width = Math.min(PANEL_WIDTH, window.innerWidth - margin * 2);
      const left = Math.max(margin, Math.min(anchor.left - 8, window.innerWidth - width - margin));
      const below = window.innerHeight - anchor.bottom - margin * 2;
      const above = anchor.top - margin * 2;
      if (below >= 280 || below >= above) {
        return {
          left: left,
          width: width,
          top: anchor.bottom + 8,
          maxHeight: Math.max(200, Math.min(PANEL_MAX_HEIGHT, below)),
        };
      }
      return {
        left: left,
        width: width,
        bottom: Math.max(margin, window.innerHeight - anchor.top + 8),
        maxHeight: Math.max(200, Math.min(PANEL_MAX_HEIGHT, above)),
      };
    }

    /* ---------------------------------------------------------------- */
    /* icons                                                             */
    /* ---------------------------------------------------------------- */

    function AskIcon(props) {
      const size = props && props.size ? props.size : 14;
      return h(
        'svg',
        { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': 'true' },
        h('path', {
          d: 'M8 1.8 L9.5 6.1 L13.8 7.6 L9.5 9.1 L8 13.4 L6.5 9.1 L2.2 7.6 L6.5 6.1 Z',
          stroke: 'currentColor',
          'stroke-width': 1.1,
          'stroke-linejoin': 'round',
        }),
      );
    }

    function CloseIcon() {
      return h(
        'svg',
        { width: 12, height: 12, viewBox: '0 0 12 12', fill: 'none', 'aria-hidden': 'true' },
        h('path', { d: 'M2.6 2.6 L9.4 9.4 M9.4 2.6 L2.6 9.4', stroke: 'currentColor', 'stroke-width': 1.3, 'stroke-linecap': 'round' }),
      );
    }

    /* ---------------------------------------------------------------- */
    /* views                                                             */
    /* ---------------------------------------------------------------- */

    /** @returns the slot's localized translate, or the built-in English copy. */
    function translateOf(props) {
      if (typeof props.t === 'function') return props.t;
      return (key) => (typeof EN[key] === 'string' ? EN[key] : key);
    }

    function Pill(props) {
      const t = translateOf(props);
      const anchor = props.anchor;
      if (anchor === null) return null;
      const box = pillBox(anchor);
      return h(
        'button',
        {
          type: 'button',
          className: 'dsh-ask-pill',
          'data-dsh-ask': 'pill',
          style: { left: box.left + 'px', top: box.top + 'px' },
          title: props.selection.slice(0, 300),
          onClick: () => openPanel(),
        },
        h(AskIcon, { size: 13 }),
        h('span', null, t('pill')),
      );
    }

    /** Inline Markdown the model actually emits: bold and inline code. */
    const INLINE_MARK = /(\*\*[^*\n]{1,300}\*\*|`[^`\n]{1,300}`)/gu;

    /** @returns text with `**bold**` and `` `code` `` as nodes, leaving the rest literal. */
    function inlineNodes(text) {
      const nodes = [];
      let last = 0;
      for (const match of text.matchAll(INLINE_MARK)) {
        const at = match.index;
        if (at > last) nodes.push(text.slice(last, at));
        const token = match[0];
        if (token.startsWith('**')) {
          nodes.push(h('strong', { key: 'b' + at }, token.slice(2, -2)));
        } else {
          nodes.push(h('code', { key: 'c' + at }, token.slice(1, -1)));
        }
        last = at + token.length;
      }
      if (last < text.length) nodes.push(text.slice(last));
      return nodes;
    }

    function Answer(props) {
      const text = props.text;
      if (typeof text !== 'string' || text.length === 0) return null;
      return h('div', { className: 'dsh-ask-a' }, inlineNodes(text));
    }

    function Waiting(props) {
      const t = translateOf(props);
      return h(
        'div',
        { className: 'dsh-ask-wait' },
        h('span', { className: 'dsh-ask-dot' }),
        h('span', { className: 'dsh-ask-dot' }),
        h('span', { className: 'dsh-ask-dot' }),
        h('span', null, t('waiting')),
      );
    }

    function Panel(props) {
      const t = translateOf(props);
      const anchor = props.anchor;
      const logRef = React.useRef(null);
      const inputRef = React.useRef(null);
      const active = props.turns.length > 0 || props.streaming.length > 0 || props.busy;
      const box = panelBox(anchor);

      React.useEffect(() => {
        if (inputRef.current !== null) inputRef.current.focus();
      }, []);

      React.useEffect(() => {
        const node = logRef.current;
        if (node !== null && active) node.scrollTop = node.scrollHeight;
      }, [props.streaming, props.turns.length, active]);

      const style = { left: box.left + 'px', width: box.width + 'px', maxHeight: box.maxHeight + 'px' };
      if (box.top !== undefined) style.top = box.top + 'px';
      if (box.bottom !== undefined) style.bottom = box.bottom + 'px';

      const submit = () => {
        if (props.busy) return;
        send(props.draft);
      };

      const stop = () => {
        if (controller !== null) {
          try {
            controller.abort();
          } catch {
            /* already settled */
          }
          controller = null;
        }
      };

      const onKeyDown = (event) => {
        if (event.isComposing === true || (event.nativeEvent && event.nativeEvent.isComposing === true)) return;
        if (event.key === 'Enter' && !event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          submit();
        }
      };

      const quote = props.selection.length > 400 ? props.selection.slice(0, 400) + '…' : props.selection;

      return h(
        'div',
        {
          className: 'dsh-ask-panel',
          'data-dsh-ask': 'panel',
          role: 'dialog',
          'aria-label': t('title'),
          style: style,
        },
        h(
          'div',
          { className: 'dsh-ask-head' },
          h(AskIcon, { size: 13 }),
          h('span', { className: 'dsh-ask-head-title' }, t('title')),
          h('span', { className: 'dsh-ask-head-note' }, t('hint')),
          h(
            'button',
            { type: 'button', className: 'dsh-ask-x', 'aria-label': t('close'), title: t('close'), onClick: () => dismiss() },
            h(CloseIcon, null),
          ),
        ),
        h('div', { className: 'dsh-ask-quote', 'data-clamped': props.selection.length > 200 ? 'true' : 'false', title: props.selection },
          quote,
        ),
        active
          ? h(
              'div',
              { className: 'dsh-ask-log', ref: logRef },
              props.turns.map((turn, index) =>
                h(
                  'div',
                  { key: 'turn-' + index, style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
                  h('div', { className: 'dsh-ask-q' }, h('b', null, '▸'), h('span', null, turn.question)),
                  h(Answer, { text: turn.answer }),
                ),
              ),
              props.busy
                ? h(
                    'div',
                    { key: 'pending', style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
                    h('div', { className: 'dsh-ask-q' }, h('b', null, '▸'), h('span', null, props.question)),
                    props.streaming.length > 0 ? h(Answer, { text: props.streaming }) : h(Waiting, { t: t }),
                  )
                : null,
            )
          : h('div', { className: 'dsh-ask-empty' }, t('empty')),
        props.error.length > 0
          ? h('div', { className: 'dsh-ask-error' }, t('errorTitle') + ': ' + props.error)
          : null,
        h(
          'div',
          { className: 'dsh-ask-foot' },
          h(
            'div',
            { className: 'dsh-ask-form' },
            h('textarea', {
              ref: inputRef,
              className: 'dsh-ask-input',
              rows: 1,
              value: props.draft,
              placeholder: t('placeholder'),
              'aria-label': t('placeholder'),
              onChange: (event) => store.patch({ passDraft: event.target.value }),
              onKeyDown: onKeyDown,
            }),
            props.busy
              ? h(
                  'button',
                  { type: 'button', className: 'dsh-ask-send', 'data-mode': 'stop', onClick: stop, title: t('stop') },
                  t('stop'),
                )
              : h(
                  'button',
                  {
                    type: 'button',
                    className: 'dsh-ask-send',
                    disabled: props.draft.trim().length === 0,
                    onClick: submit,
                    title: t('send'),
                  },
                  t('send'),
                ),
          ),
          h(
            'div',
            { className: 'dsh-ask-meta' },
            h('span', null, t('keys')),
            props.turns.length > 0 && !props.busy
              ? h('button', { type: 'button', className: 'dsh-ask-link', onClick: () => clearTurns() }, t('clear'))
              : null,
            h('span', { className: 'dsh-ask-meta-model', title: props.model }, props.model),
          ),
        ),
      );
    }

    /** The one overlay entry: a pill beside the highlight and the popup itself. */
    function Overlay(props) {
      const t = props.t;
      const current = useStore();
      if (current.anchor === null) return null;
      return h(
        React.Fragment,
        null,
        current.panel
          ? h(Panel, {
              t: t,
              anchor: current.anchor,
              selection: current.selection,
              turns: current.turns,
              draft: current.passDraft,
              question: current.question,
              streaming: current.streaming,
              busy: current.busy,
              error: current.error,
              model: current.model,
            })
          : null,
        current.pill && !current.panel
          ? h(Pill, { t: t, anchor: current.anchor, selection: current.selection })
          : null,
      );
    }

    /* ---------------------------------------------------------------- */
    /* plugin                                                            */
    /* ---------------------------------------------------------------- */

    function apply(ctx) {
      const t = ctx.locale.bind(NS);

      ctx.effect(() => ctx.locale.register(NS, { en: EN, vi: VI }), PACKAGE + ': copy');

      ctx.effect(() => {
        const tag = document.createElement('style');
        tag.dataset.plugin = PACKAGE;
        tag.dataset.pluginCss = CSS_ID;
        tag.textContent = UI_CSS;
        if (document.querySelector('style[data-plugin-css=' + JSON.stringify(CSS_ID) + ']') === null) {
          document.head.appendChild(tag);
        }
        return () => {
          if (tag.parentNode !== null) tag.remove();
        };
      }, PACKAGE + ': styles');

      ctx.effect(() => {
        const onPointerDown = (event) => {
          const target = event.target;
          if (target instanceof Element && target.closest('[data-dsh-ask]') !== null) return;
          if (state.panel) {
            dismiss();
            return;
          }
          if (state.pill) store.patch({ pill: false });
        };
        const onPointerUp = (event) => {
          const target = event.target;
          if (target instanceof Element && target.closest('[data-dsh-ask]') !== null) return;
          scheduleRefresh();
        };
        const onKeyUp = (event) => {
          if (event.key === 'Shift' || event.key.startsWith('Arrow') || event.key === 'Home' || event.key === 'End') {
            scheduleRefresh();
          }
        };
        const onKeyDown = (event) => {
          if (event.key !== 'Escape') return;
          if (state.panel) {
            dismiss();
          } else if (state.pill) {
            store.patch({ pill: false });
          }
        };
        const onScroll = () => {
          if (state.pill) store.patch({ pill: false });
        };
        const onResize = () => {
          if (state.pill) store.patch({ pill: false });
          if (state.panel && state.anchor !== null) store.patch({ anchor: { ...state.anchor } });
        };

        document.addEventListener('pointerdown', onPointerDown, true);
        document.addEventListener('pointerup', onPointerUp, true);
        document.addEventListener('keyup', onKeyUp, true);
        document.addEventListener('keydown', onKeyDown, true);
        window.addEventListener('scroll', onScroll, true);
        window.addEventListener('resize', onResize);
        return () => {
          document.removeEventListener('pointerdown', onPointerDown, true);
          document.removeEventListener('pointerup', onPointerUp, true);
          document.removeEventListener('keyup', onKeyUp, true);
          document.removeEventListener('keydown', onKeyDown, true);
          window.removeEventListener('scroll', onScroll, true);
          window.removeEventListener('resize', onResize);
          if (rafId !== 0) {
            window.cancelAnimationFrame(rafId);
            rafId = 0;
          }
          dismiss();
        };
      }, PACKAGE + ': selection listeners');

      ctx.effect(
        () =>
          ctx.slots.inject('shell.overlay', () =>
            ctx.slots.register(
              { name: 'shell.overlay', id: PACKAGE, order: 20, locale: NS, inject: () => ({ t }) },
              Overlay,
            ),
          ),
        PACKAGE + ': overlay',
      );
    }

    return {
      inject: ['slots', 'locale'],
      apply,
    };
  },
});
