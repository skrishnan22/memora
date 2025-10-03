import modalCss from "./modal.css?raw";

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
  // Intentionally omitted any member for close button to avoid unused warnings
  private tmplLoading: HTMLTemplateElement | null = null;
  private tmplMeaningItem: HTMLTemplateElement | null = null;
  private tmplError: HTMLTemplateElement | null = null;

  initialize() {
    if (this.shadowHost) return;

    const host = document.createElement("div");
    host.setAttribute("id", "memora-modal-host");
    host.style.all = "initial";
    host.style.position = "fixed";
    host.style.inset = "0";
    host.style.zIndex = "2147483647"; // above everything
    host.style.pointerEvents = "none"; // host must never intercept clicks
    document.documentElement.appendChild(host);

    const shadow = host.attachShadow({ mode: "open" });
    // Adopt stylesheet
    if ((document as any).adoptedStyleSheets) {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(modalCss);
      (shadow as any).adoptedStyleSheets = [sheet];
    } else {
      const style = document.createElement("style");
      style.textContent = modalCss;
      shadow.appendChild(style);
    }

    // Template for markup
    const template = document.createElement("template");
    template.innerHTML = `
      <div class="overlay">
        <div class="panel">
          <div class="header">
            <h3 class="title">Memora</h3>
            <button class="close" aria-label="Close">×</button>
          </div>
          <div class="body"></div>
        </div>
      </div>
    `;
    shadow.appendChild(template.content.cloneNode(true));

    const overlay = shadow.querySelector(".overlay") as HTMLElement;
    const body = shadow.querySelector(".body") as HTMLElement;
    const close = shadow.querySelector(".close") as HTMLButtonElement;

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) this.hide();
    });
    close.addEventListener("click", () => this.hide());

    // Define reusable templates
    this.tmplLoading = document.createElement("template");
    this.tmplLoading.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <div class="text"></div>
      </div>
    `;

    this.tmplMeaningItem = document.createElement("template");
    this.tmplMeaningItem.innerHTML = `
      <div class="meaning">
        <div class="badge"></div>
        <p class="definition"></p>
        <p class="example"></p>
      </div>
    `;

    this.tmplError = document.createElement("template");
    this.tmplError.innerHTML = `
      <div class="error"></div>
    `;

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
    if (!this.content || !this.container || !this.tmplLoading) return;
    // enable interaction only within overlay
    this.container.style.display = "flex";
    this.container.style.pointerEvents = "auto";
    this.content.innerHTML = "";
    const frag = this.tmplLoading.content.cloneNode(true) as DocumentFragment;
    const textEl = frag.querySelector(".text");
    if (textEl) textEl.textContent = `Looking up "${this.escape(word)}"...`;
    this.content.appendChild(frag);
  }

  showSuccess(word: string, meanings: WordMeaning[]) {
    this.initialize();
    if (!this.content || !this.container || !this.tmplMeaningItem) return;
    this.container.style.display = "flex";
    this.container.style.pointerEvents = "auto";
    this.content.innerHTML = "";

    const heading = document.createElement("div");
    const strong = document.createElement("strong");
    strong.textContent = word;
    heading.appendChild(strong);
    this.content.appendChild(heading);

    if (!meanings?.length) {
      const empty = document.createElement("div");
      empty.textContent = "No definitions found.";
      this.content.appendChild(empty);
      return;
    }

    meanings.slice(0, 5).forEach((m) => {
      const frag = this.tmplMeaningItem!.content.cloneNode(
        true
      ) as DocumentFragment;
      const badge = frag.querySelector(".badge");
      const def = frag.querySelector(".definition");
      const ex = frag.querySelector(".example");

      if (badge) badge.textContent = m.partOfSpeech || "meaning";
      if (def) def.textContent = m.definition;
      if (ex) {
        if (m.example) {
          ex.textContent = `“${m.example}”`;
        } else {
          ex.remove();
        }
      }

      this.content!.appendChild(frag);
    });
  }

  showError(word: string, error: string) {
    this.initialize();
    if (!this.content || !this.container || !this.tmplError) return;
    this.container.style.display = "flex";
    this.container.style.pointerEvents = "auto";
    this.content.innerHTML = "";
    const title = document.createElement("div");
    const strong = document.createElement("strong");
    strong.textContent = word;
    title.appendChild(strong);
    const frag = this.tmplError.content.cloneNode(true) as DocumentFragment;
    const errEl = frag.querySelector(".error") as HTMLElement | null;
    if (errEl) errEl.textContent = error || "Something went wrong.";
    this.content.appendChild(title);
    this.content.appendChild(frag);
  }

  hide() {
    if (this.container) {
      this.container.style.display = "none";
      this.container.style.pointerEvents = "none";
    }
    // host remains pointer-events: none always
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
