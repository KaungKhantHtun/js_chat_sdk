import { Emitter } from "./emitter";

import { Chat_Overlay_Styles } from "./styles";

const DEFAULTS = {
  title: "Chat",
  position: "right" as "left" | "right",
  greeting: "Hi! How can we help?",
  hint: "Ask Anything about TCTS",
  theme: {
    accent: "#4f46e5",
    bg: "#111827",
    fg: "#f9fafb",
    user: "#e5e7eb",
    bot: "#1f2937",
  },
};

export interface ChatOverlayAPI {
  open(): void;
  close(): void;
  toggle(): void;
  on(event: string, cb: (...args: any[]) => void): () => void;
}

export class ChatOverlayImpl implements ChatOverlayAPI {
  static init(opts: any): ChatOverlayAPI {
    if ((globalThis as any).__chatOverlayInstance) {
      return (globalThis as any).__chatOverlayInstance;
    }
    return ((globalThis as any).__chatOverlayInstance = new ChatOverlayImpl(
      opts
    ));
  }

  private opts: any;
  private emitter = new Emitter();
  private isOpen = false;
  private root!: HTMLElement;
  private $: any = {};

  constructor(opts: any) {
    this.opts = {
      ...DEFAULTS,
      ...opts,
      theme: { ...DEFAULTS.theme, ...opts.theme },
    };
    this.injectStyles();
    this.mount();
    this.wire();
    this.appendBot(this.opts.greeting);
  }

  private injectStyles() {
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

  private appendBotTemp(msg: string): HTMLDivElement {
    const div = document.createElement("div");
    div.textContent = msg;
    div.style.textAlign = "left";
    div.style.marginBottom = "6px";
    div.className = "msg bot temporary"; // mark it as temporary
    this.$.scroll.appendChild(div);
    this.$.scroll.scrollTop = this.$.scroll.scrollHeight;
    return div;
  }

  private mount() {
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
            <div class="title" id="title"></div>
            <div class="spacer"></div>
            <button class="close" id="close" title="Close">✕</button>
          </div>
          <div class="scroll" id="scroll" aria-live="polite"></div>
          <div class="input">
            <textarea id="input" aria-label="Your message"></textarea>
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
    this.$.input.placeholder = this.opts.hint;
  }

  private wire() {
    this.$.toggle.addEventListener("click", () => this.toggle());
    this.$.close.addEventListener("click", () => this.close());
    this.$.send.addEventListener("click", () => this.handleSend());
    this.$.input.addEventListener("keydown", (e: any) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.handleSend();
      }
      if (e.key === "Escape") this.close();
    });
    // simple drag within viewport
    let startX = 0,
      startY = 0,
      startLeft = 0,
      startTop = 0,
      dragging = false;
    const onMove = (e: any) => {
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
    const onDown = (e: any) => {
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

  private handleSend() {
    const text = (this.$.input.value || "").trim();
    if (!text) return;

    // Append user message
    this.appendUser(text);
    this.$.input.value = "";
    this.emitter.emit("send", text);

    if (this.opts.onSend) {
      const thinkingBubble = this.appendBotTemp("");

      Promise.resolve(this.opts.onSend(text))
        .then((res: string) => {
          if (thinkingBubble) {
            thinkingBubble.textContent = res;
            thinkingBubble.classList.remove("temporary");
          }
        })
        .catch((err) => {
          thinkingBubble.textContent = "⚠️ Error!";
          thinkingBubble.classList.remove("temporary");
          console.error(err);
        });
    }
  }

  private appendUser(msg: string) {
    const div = document.createElement("div");
    div.textContent = msg;
    div.style.textAlign = "right";
    div.style.marginBottom = "6px";
    div.className = `msg me`;
    this.$.scroll.appendChild(div);
    this.$.scroll.scrollTop = this.$.scroll.scrollHeight;
  }

  private appendBot(msg: string) {
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
  on(event: string, cb: (...args: any[]) => void) {
    return this.emitter.on(event, cb);
  }
}
