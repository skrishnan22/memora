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

class MemoraDialog {
  private dialog: HTMLDialogElement | null = null;
  private content: HTMLElement | null = null;

  initialize() {
    if (this.dialog) return;

    const dialog = document.createElement("dialog");
    dialog.setAttribute("id", "memora-dialog");
    dialog.style.cssText = `
      position: fixed;
      inset: 0;
      width: min(520px, calc(100vw - 32px));
      max-height: min(80vh, 720px);
      margin: auto;
      padding: 0;
      border: none;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.25);
      background: white;
      color: #111;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial;
    `;

    dialog.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%;">
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid #eee;">
          <h3 style="margin: 0; font-size: 16px; font-weight: 600;">Memora</h3>
          <button class="close-btn" style="appearance: none; border: none; background: transparent; font-size: 18px; cursor: pointer; line-height: 1; padding: 6px; border-radius: 8px;">×</button>
        </div>
        <div class="dialog-body" style="padding: 14px 16px; flex: 1; overflow-y: auto;"></div>
      </div>
    `;

    // Style the backdrop
    const style = document.createElement("style");
    style.textContent = `
      dialog::backdrop {
        background: rgba(0,0,0,0.35);
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    const closeBtn = dialog.querySelector(".close-btn") as HTMLButtonElement;
    closeBtn.addEventListener("click", () => this.hide());

    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) this.hide();
    });

    document.documentElement.appendChild(dialog);
    this.dialog = dialog;
    this.content = dialog.querySelector(".dialog-body") as HTMLElement;

    document.addEventListener("keydown", this.handleEsc, true);
  }

  private handleEsc = (e: KeyboardEvent) => {
    if (e.key === "Escape") this.hide();
  };

  showLoading(word: string) {
    this.initialize();
    if (!this.content || !this.dialog) return;

    this.content.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; color: #333;">
        <div style="width: 16px; height: 16px; border: 2px solid #ddd; border-top-color: #666; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <div>Looking up "${this.escape(word)}"...</div>
      </div>
    `;
    this.dialog.showModal();
  }

  showSuccess(word: string, meanings: WordMeaning[]) {
    this.initialize();
    if (!this.content || !this.dialog) return;

    let html = `<div><strong>${this.escape(word)}</strong></div>`;

    if (!meanings?.length) {
      html += "<div>No definitions found.</div>";
    } else {
      meanings.slice(0, 5).forEach((m) => {
        html += `
          <div style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
            <div style="display: inline-block; font-size: 12px; color: #555; background: #f4f4f5; border-radius: 999px; padding: 2px 8px; margin-bottom: 6px;">${this.escape(
              m.partOfSpeech || "meaning"
            )}</div>
            <p style="margin: 0 0 6px 0;">${this.escape(m.definition)}</p>
            ${
              m.example
                ? `<p style="margin: 0; color: #555; font-style: italic;">"${this.escape(
                    m.example
                  )}"</p>`
                : ""
            }
          </div>
        `;
      });
    }

    this.content.innerHTML = html;
    this.dialog.showModal();
  }

  showError(word: string, error: string) {
    this.initialize();
    if (!this.content || !this.dialog) return;

    this.content.innerHTML = `
      <div><strong>${this.escape(word)}</strong></div>
      <div style="color: #b00020;">${this.escape(
        error || "Something went wrong."
      )}</div>
    `;
    this.dialog.showModal();
  }

  hide() {
    if (this.dialog) {
      this.dialog.close();
    }
  }

  private escape(input: string) {
    const span = document.createElement("span");
    span.textContent = input;
    return span.innerHTML;
  }
}

const dialog = new MemoraDialog();

chrome.runtime.onMessage.addListener((message: ModalMessage) => {
  if (!message || message.type !== "MEMORA_MODAL") return;
  if (message.action === "loading" && message.word) {
    dialog.showLoading(message.word);
  } else if (message.action === "success" && message.word) {
    dialog.showSuccess(message.word, message.meanings || []);
  } else if (message.action === "error" && message.word) {
    dialog.showError(
      message.word,
      message.error || "Error fetching definition."
    );
  } else if (message.action === "hide") {
    dialog.hide();
  }
});

export {};
