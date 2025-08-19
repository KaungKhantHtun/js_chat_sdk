export const Chat_Overlay_Styles = (theme: any, position: "left" | "right") => `
  :host { all: initial; }
          * { box-sizing: border-box; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
          .btn { display: inline-flex; align-items: center; gap: .5rem; border: 0; cursor: pointer; border-radius: 999px; padding: .75rem 1rem; font-weight: 600; box-shadow: 0 10px 20px rgba(0,0,0,.25); }
          .btn { background: ${theme.accent}; color: white; }
          .badge { width: 10px; height: 10px; background: #10b981; border-radius: 999px; }
          .panel { position: fixed; inset: auto; bottom: 88px; ${
            position === "left" ? "left:16px;" : "right:16px;"
          } width: 360px; max-width: calc(100vw - 32px); height: 520px; border-radius: 16px; overflow: hidden; box-shadow: 0 24px 72px rgba(0,0,0,.45); display: none; }
          .panel.open { display: block; }
          .frame { display: grid; grid-template-rows: 56px 1fr 64px; height: 100%; background: ${
            theme.bg
          }; color: ${theme.fg}; }
          .titlebar { display: flex; align-items: center; gap: .5rem; padding: 0 12px; background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,0)); border-bottom: 1px solid rgba(255,255,255,.08); user-select: none; cursor: move; }
          .title { font-weight: 700; }
          .spacer { flex: 1 }
          .icon { width: 22px; height: 22px; opacity: .9 }
          .close { background: transparent; color: inherit; border: 0; cursor: pointer; font-size: 18px; }
          .scroll { padding: 12px; overflow: auto; display: flex; flex-direction: column; gap: 10px; }
          .msg { display: inline-flex; max-width: 80%; padding: 10px 12px; border-radius: 14px; line-height: 1.3; word-wrap: break-word; white-space: pre-wrap; }
          .me { align-self: flex-end; background: ${
            theme.user
          }; color: #111827; }
          .bot { align-self: flex-start; background: ${theme.bot}; color: ${
  theme.fg
}; }
          .input { display: flex; gap: 8px; padding: 12px; border-top: 1px solid rgba(255,255,255,.08); background: rgba(0,0,0,.2); }
          textarea { flex: 1; resize: none; height: 40px; padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.06); color: ${
            theme.fg
          }; outline: none; }
          .send { border: 0; border-radius: 10px; padding: 10px 14px; background: ${
            theme.accent
          }; color: white; font-weight: 700; cursor: pointer; }
`;
