import { Conversation } from "./conversation";
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

  private shadowRoot: ShadowRoot;
  private container: HTMLElement;

  private conversations: Conversation[] = [];

  constructor(opts: any) {
    this.container = document.createElement("div");
    document.body.appendChild(this.container);

    // Attach shadow root
    this.shadowRoot = this.container.attachShadow({ mode: "open" });
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
      // attach shadow DOM
      // this.shadowRoot = this.root.attachShadow({ mode: "open" });
      this.shadowRoot.appendChild(style);
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
    this.root.style.position = "fixed";
    this.root.style.zIndex = String(zIndex);
    this.root.style[position === "left" ? "left" : "right"] = "16px";
    this.root.style.bottom = "16px";

    document.body.appendChild(this.root);

    // wrapper content
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <button class="btn" id="toggle" aria-controls="panel" aria-expanded="false" title="Open chat">
        <span class="badge" aria-hidden="true"></span>
        <span>Chat</span>
      </button>
      <div id="panel" class="panel" role="dialog" aria-modal="true" aria-label="Chat panel">
        <div class="frame" id="frame">
          <div class="titlebar" id="drag">
            <div class="title" id="title"></div>
            <div class="spacer"></div>
            <button class="expand" id="expand" title="Expand">
              <?xml version="1.0" encoding="utf-8"?>

                <!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
                <svg fill="#fff" width="28px" height="28px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">

                <g data-name="Layer 2">

                <g data-name="expand">

                <rect width="24" height="24" transform="rotate(180 12 12)" opacity="0"/>

                <path d="M20 5a1 1 0 0 0-1-1h-5a1 1 0 0 0 0 2h2.57l-3.28 3.29a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0L18 7.42V10a1 1 0 0 0 1 1 1 1 0 0 0 1-1z"/>

                <path d="M10.71 13.29a1 1 0 0 0-1.42 0L6 16.57V14a1 1 0 0 0-1-1 1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h5a1 1 0 0 0 0-2H7.42l3.29-3.29a1 1 0 0 0 0-1.42z"/>

                </g>

                </g>

                </svg>  
            
            </button>
            <button class="collapse" id="collapse" title="Collapse">
              <?xml version="1.0" encoding="utf-8"?>

                <!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
                <svg fill="#fff" width="28px" height="28px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">

                <g data-name="Layer 2">

                <g data-name="collapse">

                <rect width="24" height="24" transform="rotate(180 12 12)" opacity="0"/>

                <path d="M19 9h-2.58l3.29-3.29a1 1 0 1 0-1.42-1.42L15 7.57V5a1 1 0 0 0-1-1 1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h5a1 1 0 0 0 0-2z"/>

                <path d="M10 13H5a1 1 0 0 0 0 2h2.57l-3.28 3.29a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0L9 16.42V19a1 1 0 0 0 1 1 1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1z"/>

                </g>

                </g>

                </svg>
            </button>
            <button class="close" id="close" title="Close">
              <?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
              <svg width="24px" height="24px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path fill="#ffffff" d="M195.2 195.2a64 64 0 0 1 90.496 0L512 421.504 738.304 195.2a64 64 0 0 1 90.496 90.496L602.496 512 828.8 738.304a64 64 0 0 1-90.496 90.496L512 602.496 285.696 828.8a64 64 0 0 1-90.496-90.496L421.504 512 195.2 285.696a64 64 0 0 1 0-90.496z"/></svg>
            </button>
            
          </div>
          <div class="scroll" id="scroll" aria-live="polite"></div>
          <div class="input" id="input-container">
            <textarea id="input" aria-label="Your message"></textarea>
            <button class="send" id="send">
              <?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
              <svg fill="#eeeeee" width="32px" height="32px" viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg"><path d="m21.426 11.095-17-8A.999.999 0 0 0 3.03 4.242L4.969 12 3.03 19.758a.998.998 0 0 0 1.396 1.147l17-8a1 1 0 0 0 0-1.81zM5.481 18.197l.839-3.357L12 12 6.32 9.16l-.839-3.357L18.651 12l-13.17 6.197z"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
    this.shadowRoot.appendChild(wrapper);

    this.$.toggle = this.shadowRoot.querySelector("#toggle");
    this.$.panel = this.shadowRoot.querySelector("#panel");
    this.$.frame = this.shadowRoot.querySelector("#frame");
    this.$.drag = this.shadowRoot.querySelector("#drag");
    this.$.close = this.shadowRoot.querySelector("#close");
    this.$.title = this.shadowRoot.querySelector("#title");
    this.$.scroll = this.shadowRoot.querySelector("#scroll");
    this.$.input = this.shadowRoot.querySelector("#input");
    this.$.send = this.shadowRoot.querySelector("#send");

    this.$.expand = this.shadowRoot.querySelector("#expand");
    this.$.collapse = this.shadowRoot.querySelector("#collapse");
    this.$.inputContainer = this.shadowRoot.querySelector("#input-container");

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

    this.$.expand.addEventListener("click", () => this.expand());
    this.$.collapse.addEventListener("click", () => this.collapse());

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

  private async askQue(question: string, conversations: Conversation[]) {
    let request = {
      question: question,
      conversations: conversations,
    };

    const resp = await fetch(`http://tbm-et-gpt01:8000/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    const data = await resp.json();
    return data;
  }

  private handleSend() {
    const text = (this.$.input.value || "").trim();
    if (!text) return;

    // Append user message
    this.appendUser(text);
    this.$.input.value = "";
    this.emitter.emit("send", text);
    // const query = this.chatHistory
    //   ? `
    // ${text}

    // Conversation so far: ${this.chatHistory}

    // `
    //  : text;
    const question = text;
    const thinkingBubble = this.appendBotTemp("");

    Promise.resolve(
      this.opts.onSend
        ? this.opts.onSend(question)
        : this.askQue(question, this.conversations)
    )
      .then(async (res) => {
        if (thinkingBubble) {
          //thinkingBubble.textContent = res;
          thinkingBubble.classList.remove("temporary");
          this.conversations.push(new Conversation(question, res));
          await this.typeText(thinkingBubble, res);
          this.$.scroll.scrollTop = this.$.scroll.scrollHeight;
        }
      })
      .catch((err) => {
        thinkingBubble.textContent = "⚠️ Error! cannot connect to the server";
        thinkingBubble.classList.remove("temporary");
        console.error(err);
      });
    // }
  }

  private typeText(el: HTMLElement, text: string, speed = 15): Promise<void> {
    return new Promise((resolve) => {
      let i = 0;
      const interval = setInterval(() => {
        el.textContent += text[i];
        i++;
        this.$.scroll.scrollTo({
          top: this.$.scroll.scrollHeight,
          behavior: "smooth",
        });
        if (i >= text.length) {
          clearInterval(interval);
          resolve();
        }
      }, speed);
    });
  }

  private appendUser(msg: string) {
    const div = document.createElement("div");
    div.textContent = msg;
    // div.style.textAlign = "right";
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
  expand() {
    this.$.panel.style = `
      position: fixed; 
      inset: 0px; 
      top: 0px;
      bottom: 0px; 
      left: 0px;
      right: 0px; 
      width: 100vw; 
      height: 100vh;
      overflow: hidden; 
      border-radius: 0px; 
      box-shadow: 0 24px 72px rgba(0,0,0,.45); 
      display: block; 
    `;

    this.$.expand.style.display = "none";
    this.$.collapse.style.display = "block";
    
  }
  collapse() {
    this.$.panel.style = `
      position: fixed; 
      inset: auto; 
      bottom: 88px; 
      right:16px; 
      width: 360px; 
      max-width: calc(100vw - 32px); 
      height: 520px; 
      border-radius: 16px; 
      overflow: hidden; 
      box-shadow: 0 24px 72px rgba(0,0,0,.45); 
      display: block; 
    `;

    this.$.expand.style.display = "block";
    this.$.collapse.style.display = "none";
  }
}
