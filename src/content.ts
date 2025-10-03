type ModalAction = "loading" | "success" | "error" | "hide";

interface WordMeaning {
  partOfSpeech: string;
  definition: string;
  example?: string;
}

interface ModalMessage {
  type: "MEMORA_MODAL";
  action: ModalAction;
  word?: string;
  meanings?: WordMeaning[];
  error?: string;
}

class MemoraModal {
  private shadowHost: HTMLElement | null = null;
  private container: HTMLElement | null = null;
  private content: HTMLElement | null = null;

  initialize() {
    if (this.shadowHost) return;

    const host = document.createElement("div");
    host.setAttribute("id", "memora-modal-host");
    host.style.all = "initial";
    host.style.position = "fixed";
    host.style.inset = "0";
    host.style.zIndex = "2147483647"; // above everything
    host.style.pointerEvents = "none"; // don't block page when hidden
    document.documentElement.appendChild(host);

    const shadow = host.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = `
      :host { all: initial; }
      .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; }
      .panel { width: min(520px, calc(100vw - 32px)); max-height: min(80vh, 720px); overflow: auto; background: #fff; color: #111; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.25); font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, "Apple Color Emoji", "Segoe UI Emoji"; }
      .header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid #eee; }
      .title { margin: 0; font-size: 16px; font-weight: 600; }
      .close { appearance: none; border: none; background: transparent; font-size: 18px; cursor: pointer; line-height: 1; padding: 6px; border-radius: 8px; }
      .close:hover { background: #f5f5f5; }
      .body { padding: 14px 16px; }
      .loading { display: flex; align-items: center; gap: 10px; color: #333; }
      .spinner { width: 16px; height: 16px; border: 2px solid #ddd; border-top-color: #666; border-radius: 50%; animation: spin 1s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
      .meaning { padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
      .badge { display: inline-block; font-size: 12px; color: #555; background: #f4f4f5; border-radius: 999px; padding: 2px 8px; margin-bottom: 6px; }
      .definition { margin: 0 0 6px 0; }
      .example { margin: 0; color: #555; font-style: italic; }
      .error { color: #b00020; }
    `;

    const overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) this.hide();
    });

    const panel = document.createElement("div");
    panel.className = "panel";

    const header = document.createElement("div");
    header.className = "header";

    const title = document.createElement("h3");
    title.className = "title";
    title.textContent = "Memora";

    const close = document.createElement("button");
    close.className = "close";
    close.setAttribute("aria-label", "Close");
    close.textContent = "×";
    close.addEventListener("click", () => this.hide());

    const body = document.createElement("div");
    body.className = "body";

    header.appendChild(title);
    header.appendChild(close);
    panel.appendChild(header);
    panel.appendChild(body);
    overlay.appendChild(panel);

    shadow.appendChild(style);
    shadow.appendChild(overlay);

    this.shadowHost = host;
    this.container = overlay;
    this.content = body;

    document.addEventListener("keydown", this.handleEsc, true);
  }

  private handleEsc = (e: KeyboardEvent) => {
    if (e.key === "Escape") this.hide();
  };

  showLoading(word: string) {
    this.initialize();
    if (!this.content || !this.container) return;
    if (this.shadowHost) this.shadowHost.style.pointerEvents = "auto";
    this.container.style.display = "flex";
    this.content.innerHTML = "";
    const row = document.createElement("div");
    row.className = "loading";
    const spinner = document.createElement("div");
    spinner.className = "spinner";
    const text = document.createElement("div");
    text.textContent = `Looking up "${word}"...`;
    row.appendChild(spinner);
    row.appendChild(text);
    this.content.appendChild(row);
  }

  showSuccess(word: string, meanings: WordMeaning[]) {
    this.initialize();
    if (!this.content || !this.container) return;
    if (this.shadowHost) this.shadowHost.style.pointerEvents = "auto";
    this.container.style.display = "flex";
    this.content.innerHTML = "";

    const heading = document.createElement("div");
    heading.innerHTML = `<strong>${this.escape(word)}</strong>`;
    this.content.appendChild(heading);

    if (!meanings?.length) {
      const empty = document.createElement("div");
      empty.textContent = "No definitions found.";
      this.content.appendChild(empty);
      return;
    }

    meanings.slice(0, 5).forEach((m) => {
      const item = document.createElement("div");
      item.className = "meaning";

      const badge = document.createElement("div");
      badge.className = "badge";
      badge.textContent = m.partOfSpeech || "meaning";

      const def = document.createElement("p");
      def.className = "definition";
      def.textContent = m.definition;

      item.appendChild(badge);
      item.appendChild(def);
      if (m.example) {
        const ex = document.createElement("p");
        ex.className = "example";
        ex.textContent = `“${m.example}”`;
        item.appendChild(ex);
      }
      this.content!.appendChild(item);
    });
  }

  showError(word: string, error: string) {
    this.initialize();
    if (!this.content || !this.container) return;
    if (this.shadowHost) this.shadowHost.style.pointerEvents = "auto";
    this.container.style.display = "flex";
    this.content.innerHTML = "";
    const title = document.createElement("div");
    title.innerHTML = `<strong>${this.escape(word)}</strong>`;
    const err = document.createElement("div");
    err.className = "error";
    err.textContent = error || "Something went wrong.";
    this.content.appendChild(title);
    this.content.appendChild(err);
  }

  hide() {
    if (this.container) this.container.style.display = "none";
    if (this.shadowHost) this.shadowHost.style.pointerEvents = "none";
  }

  private escape(input: string) {
    const span = document.createElement("span");
    span.textContent = input;
    return span.innerHTML;
  }
}

const modal = new MemoraModal();

chrome.runtime.onMessage.addListener((message: ModalMessage) => {
  if (!message || message.type !== "MEMORA_MODAL") return;
  if (message.action === "loading" && message.word) {
    modal.showLoading(message.word);
  } else if (message.action === "success" && message.word) {
    modal.showSuccess(message.word, message.meanings || []);
  } else if (message.action === "error" && message.word) {
    modal.showError(
      message.word,
      message.error || "Error fetching definition."
    );
  } else if (message.action === "hide") {
    modal.hide();
  }
});

export {};
