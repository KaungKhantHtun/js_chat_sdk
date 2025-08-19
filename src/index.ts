import { ChatOverlayImpl } from "./chat";

(function (global: any) {
  const ChatOverlay = { init: (opts?: any) => ChatOverlayImpl.init(opts) };
  global.ChatOverlay = ChatOverlay;
})(window);
