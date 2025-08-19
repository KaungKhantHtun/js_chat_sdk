"use strict";
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // src/emitter.ts
  var Emitter;
  var init_emitter = __esm({
    "src/emitter.ts"() {
      "use strict";
      Emitter = class {
        constructor() {
          this.evt = {};
        }
        on(name, cb) {
          var _a;
          ((_a = this.evt)[name] || (_a[name] = [])).push(cb);
          return () => this.off(name, cb);
        }
        off(name, cb) {
          this.evt[name] = (this.evt[name] || []).filter((fn) => fn !== cb);
        }
        emit(name, ...args) {
          (this.evt[name] || []).forEach((fn) => {
            try {
              fn(...args);
            } catch (e) {
              console.error(e);
            }
          });
        }
      };
    }
  });

  // src/styles.ts
  var Chat_Overlay_Styles;
  var init_styles = __esm({
    "src/styles.ts"() {
      "use strict";
      Chat_Overlay_Styles = (theme, position) => `
  :host { all: initial; }
          * { box-sizing: border-box; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
          .btn { display: inline-flex; align-items: center; gap: .5rem; border: 0; cursor: pointer; border-radius: 999px; padding: .75rem 1rem; font-weight: 600; box-shadow: 0 10px 20px rgba(0,0,0,.25); }
          .btn { background: ${theme.accent}; color: white; }
          .badge { width: 10px; height: 10px; background: #10b981; border-radius: 999px; }
          .panel { position: fixed; inset: auto; bottom: 88px; ${position === "left" ? "left:16px;" : "right:16px;"} width: 360px; max-width: calc(100vw - 32px); height: 520px; border-radius: 16px; overflow: hidden; box-shadow: 0 24px 72px rgba(0,0,0,.45); display: none; }
          .panel.open { display: block; }
          .frame { display: grid; grid-template-rows: 56px 1fr 64px; height: 100%; background: ${theme.bg}; color: ${theme.fg}; }
          .titlebar { display: flex; align-items: center; gap: .5rem; padding: 0 12px; background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,0)); border-bottom: 1px solid rgba(255,255,255,.08); user-select: none; cursor: move; }
          .title { font-weight: 700; }
          .spacer { flex: 1 }
          .icon { width: 22px; height: 22px; opacity: .9 }
          .close { background: transparent; color: inherit; border: 0; cursor: pointer; font-size: 18px; }
          .scroll { padding: 12px; overflow: auto; display: flex; flex-direction: column; gap: 10px; }
          .msg { display: inline-flex; max-width: 80%; padding: 10px 12px; border-radius: 14px; line-height: 1.3; word-wrap: break-word; white-space: pre-wrap; }
          .me { align-self: flex-end; background: ${theme.user}; color: #111827; }
          .bot { align-self: flex-start; background: ${theme.bot}; color: ${theme.fg}; }
          .input { display: flex; gap: 8px; padding: 12px; border-top: 1px solid rgba(255,255,255,.08); background: rgba(0,0,0,.2); }
          textarea { flex: 1; resize: none; height: 40px; padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.06); color: ${theme.fg}; outline: none; }
          .send { border: 0; border-radius: 10px; padding: 10px 14px; background: ${theme.accent}; color: white; font-weight: 700; cursor: pointer; }
`;
    }
  });

  // src/chat.ts
  var DEFAULTS, ChatOverlayImpl;
  var init_chat = __esm({
    "src/chat.ts"() {
      "use strict";
      init_emitter();
      init_styles();
      DEFAULTS = {
        title: "Chat",
        position: "right",
        greeting: "Hi! How can we help?",
        theme: {
          accent: "#4f46e5",
          bg: "#111827",
          fg: "#f9fafb",
          user: "#e5e7eb",
          bot: "#1f2937"
        }
      };
      ChatOverlayImpl = class _ChatOverlayImpl {
        constructor(opts) {
          this.emitter = new Emitter();
          this.isOpen = false;
          this.$ = {};
          this.opts = {
            ...DEFAULTS,
            ...opts,
            theme: { ...DEFAULTS.theme, ...opts.theme }
          };
          this.injectStyles();
          this.mount();
          this.wire();
          this.appendBot(this.opts.greeting);
        }
        static init(opts) {
          if (globalThis.__chatOverlayInstance) {
            return globalThis.__chatOverlayInstance;
          }
          return globalThis.__chatOverlayInstance = new _ChatOverlayImpl(
            opts
          );
        }
        injectStyles() {
          if (!document.getElementById("chat-overlay-styles")) {
            const style = document.createElement("style");
            style.id = "chat-overlay-styles";
            style.innerHTML = Chat_Overlay_Styles(
              this.opts.theme,
              this.opts.position
            );
            document.head.appendChild(style);
          }
        }
        mount() {
          const { zIndex, position, theme } = this.opts;
          this.root = document.createElement("div");
          this.root.style.all = "initial";
          this.root.style.position = "fixed";
          this.root.style.zIndex = String(zIndex);
          this.root.style[position === "left" ? "left" : "right"] = "16px";
          this.root.style.bottom = "16px";
          document.body.appendChild(this.root);
          this.root.innerHTML = `
      <button class="btn" id="toggle" aria-controls="panel" aria-expanded="false" title="Open chat">
            <span class="badge" aria-hidden="true"></span>
            <span>Chat</span>
          </button>
          <div id="panel" class="panel" role="dialog" aria-modal="true" aria-label="Chat panel">
            <div class="frame" id="frame">
              <div class="titlebar" id="drag">
                <svg class="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 7.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM12 18a1.5 1.5 0 110 3 1.5 1.5 0 010-3z"/></svg>
                <div class="title" id="title"></div>
                <div class="spacer"></div>
                <button class="close" id="close" title="Close">\u2715</button>
              </div>
              <div class="scroll" id="scroll" aria-live="polite"></div>
              <div class="input">
                <textarea id="input" placeholder="Type a message\u2026" aria-label="Your message"></textarea>
                <button class="send" id="send">Send</button>
              </div>
            </div>
          </div>
    `;
          this.$.toggle = this.root.querySelector("#toggle");
          this.$.panel = this.root.querySelector("#panel");
          this.$.frame = this.root.querySelector("#frame");
          this.$.drag = this.root.querySelector("#drag");
          this.$.close = this.root.querySelector("#close");
          this.$.title = this.root.querySelector("#title");
          this.$.scroll = this.root.querySelector("#scroll");
          this.$.input = this.root.querySelector("#input");
          this.$.send = this.root.querySelector("#send");
          this.$.title.textContent = this.opts.title;
        }
        wire() {
          this.$.toggle.addEventListener("click", () => this.toggle());
          this.$.close.addEventListener("click", () => this.close());
          this.$.send.addEventListener("click", () => this.handleSend());
          this.$.input.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              this.handleSend();
            }
            if (e.key === "Escape") this.close();
          });
          let startX = 0, startY = 0, startLeft = 0, startTop = 0, dragging = false;
          const onMove = (e) => {
            if (!dragging) return;
            const dx = (e.touches ? e.touches[0].clientX : e.clientX) - startX;
            const dy = (e.touches ? e.touches[0].clientY : e.clientY) - startY;
            let left = startLeft + dx;
            let top = startTop + dy;
            left = Math.max(
              8,
              Math.min(left, window.innerWidth - this.$.panel.offsetWidth - 8)
            );
            top = Math.max(
              8,
              Math.min(top, window.innerHeight - this.$.panel.offsetHeight - 8)
            );
            this.$.panel.style.left = left + "px";
            this.$.panel.style.right = "auto";
            this.$.panel.style.top = top + "px";
            this.$.panel.style.bottom = "auto";
          };
          const onUp = () => {
            dragging = false;
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("touchmove", onMove);
            window.removeEventListener("mouseup", onUp);
            window.removeEventListener("touchend", onUp);
          };
          const onDown = (e) => {
            dragging = true;
            startX = e.touches ? e.touches[0].clientX : e.clientX;
            startY = e.touches ? e.touches[0].clientY : e.clientY;
            const rect = this.$.panel.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;
            window.addEventListener("mousemove", onMove);
            window.addEventListener("touchmove", onMove, { passive: false });
            window.addEventListener("mouseup", onUp);
            window.addEventListener("touchend", onUp);
          };
          this.$.drag.addEventListener("mousedown", onDown);
          this.$.drag.addEventListener("touchstart", onDown, { passive: true });
        }
        handleSend() {
          const text = (this.$.input.value || "").trim();
          if (!text) return;
          this.appendUser(text);
          this.$.input.value = "";
          this.emitter.emit("send", text);
          if (this.opts.onSend) {
            Promise.resolve(this.opts.onSend(text)).then((res) => {
              if (res) this.appendBot(res);
            });
          }
        }
        appendUser(msg) {
          const div = document.createElement("div");
          div.textContent = msg;
          div.style.textAlign = "right";
          div.style.marginBottom = "6px";
          div.className = `msg me`;
          this.$.scroll.appendChild(div);
          this.$.scroll.scrollTop = this.$.scroll.scrollHeight;
        }
        appendBot(msg) {
          const div = document.createElement("div");
          div.textContent = msg;
          div.style.textAlign = "left";
          div.style.marginBottom = "6px";
          div.className = `msg bot`;
          this.$.scroll.appendChild(div);
          this.$.scroll.scrollTop = this.$.scroll.scrollHeight;
        }
        open() {
          this.isOpen = true;
          this.$.panel.style.display = "block";
        }
        close() {
          this.isOpen = false;
          this.$.panel.style.display = "none";
        }
        toggle() {
          this.isOpen ? this.close() : this.open();
        }
        on(event, cb) {
          return this.emitter.on(event, cb);
        }
      };
    }
  });

  // src/index.ts
  var require_index = __commonJS({
    "src/index.ts"() {
      init_chat();
      (function(global) {
        const ChatOverlay = { init: (opts) => ChatOverlayImpl.init(opts) };
        global.ChatOverlay = ChatOverlay;
      })(window);
    }
  });
  require_index();
})();
