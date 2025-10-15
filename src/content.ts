type ModalAction = "loading" | "success" | "error" | "hide";

interface WordMeaning {
  partOfSpeech: string;
  definition: string;
  example?: string;
}

interface ModalMessage {
  type: "LEXMORA_MODAL";
  action: ModalAction;
  word?: string;
  meanings?: WordMeaning[];
  error?: string;
}

let overlayIframe: HTMLIFrameElement | null = null;

function getOrCreateOverlayIframe(): HTMLIFrameElement {
  if (overlayIframe && overlayIframe.isConnected) return overlayIframe;
  const iframe = document.createElement("iframe");
  iframe.src = chrome.runtime.getURL("content-frame.html");
  iframe.style.position = "fixed";
  iframe.style.inset = "0";
  iframe.style.width = "100vw";
  iframe.style.height = "100vh";
  iframe.style.border = "0";
  iframe.style.zIndex = "2147483647";
  iframe.style.display = "none";
  iframe.setAttribute("aria-hidden", "true");
  document.documentElement.appendChild(iframe);
  overlayIframe = iframe;

  // Listen for child -> parent messages
  window.addEventListener("message", (e) => {
    const data = e.data as any;
    if (!data || data.type !== "LEXMORA_IFRAME") return;
    if (data.action === "hide") hideOverlay();
  });

  // Hide on Escape pressed while iframe is focused
  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape") hideOverlay();
    },
    true
  );

  return iframe;
}

function showOverlay() {
  const iframe = getOrCreateOverlayIframe();
  iframe.style.display = "block";
  iframe.removeAttribute("aria-hidden");
}

function hideOverlay() {
  if (!overlayIframe) return;
  overlayIframe.style.display = "none";
  overlayIframe.setAttribute("aria-hidden", "true");
}

chrome.runtime.onMessage.addListener((message: ModalMessage) => {
  if (!message || message.type !== "LEXMORA_MODAL") return;
  const iframe = getOrCreateOverlayIframe();
  const target = iframe.contentWindow;
  if (!target) return;
  if (message.action === "hide") {
    hideOverlay();
  } else {
    showOverlay();
  }
  target.postMessage(message as any, "*");
});

export {};
