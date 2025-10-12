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

class LexmoraDialog {
  private dialog: HTMLDialogElement | null = null;
  private content: HTMLElement | null = null;
  private currentWord: string | null = null;

  initialize() {
    if (this.dialog) return;

    const dialog = document.createElement("dialog");
    dialog.setAttribute("id", "lexmora-dialog");
    dialog.className =
      "lexmora-dialog fixed inset-0 w-[min(480px,calc(100vw-40px))] max-h-[min(85vh,680px)] m-auto p-0 rounded-[2rem] bg-gradient-to-br from-blue-500 via-blue-600 to-blue-500 text-slate-900 font-sans shadow-[0_20px_60px_rgba(0,0,0,0.25)]";

    dialog.innerHTML = `
      <div class="flex flex-col relative p-[18px]">
        <div class="dialog-body card-content relative bg-[#FFFEF5] rounded-[1.75rem] p-8 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400 shadow-inner"></div>
        <button class="close-btn absolute top-[30px] right-[30px] appearance-none border-none cursor-pointer rounded-full w-10 h-10 flex items-center justify-center bg-[#F4D88F] hover:bg-[#ECC960] text-[#1E3A5F] hover:text-[#0F2642] transition-all shadow-sm z-10" title="Close">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;

    const closeBtn = dialog.querySelector(".close-btn") as HTMLButtonElement;
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.hide());
    }

    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) this.hide();
    });

    ensureShadowRoot().appendChild(dialog);
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
    this.currentWord = word;

    this.content.innerHTML = `
      <div class="flex flex-col items-center gap-5 py-12 px-5 text-center lexmora-slide-in">
        <div class="w-12 h-12 border-[3px] border-[#6B9BD1]/30 border-t-[#6B9BD1] rounded-full animate-spin"></div>
        <div class="text-lg font-medium text-[#1E3A5F] leading-normal">Looking up</div>
        <div class="text-3xl font-bold text-[#1E3A5F] tracking-tight">"${this.escape(
          word
        )}"</div>
        <div class="text-sm text-[#1E3A5F]/70">Fetching definition…</div>
      </div>
    `;
    this.dialog.showModal();
  }

  showSuccess(word: string, meanings: WordMeaning[]) {
    this.initialize();
    if (!this.content || !this.dialog) return;
    this.currentWord = word;

    let html = `
      <div class="lexmora-slide-in">
        <div class="mb-6">
          <h2 class="text-[2.75rem] font-bold tracking-tight leading-none m-0 mb-4 text-[#1E3A5F]">${this.escape(
            word
          )}</h2>
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-full bg-[#6B9BD1] flex items-center justify-center">
              <span class="text-sm font-bold text-white">Aa</span>
            </div>
            <span class="text-[15px] font-medium text-[#1E3A5F]">${
              meanings?.length || 0
            } ${meanings?.length !== 1 ? "meanings" : "meaning"}</span>
          </div>
        </div>
        
    `;

    if (!meanings?.length) {
      html += `
        <div class="text-center py-12 px-5 text-slate-500">
          <div class="text-5xl mb-4 opacity-50">🔍</div>
          <div class="text-lg font-semibold mb-2 text-slate-600">No definitions found</div>
          <div class="text-sm text-slate-500">Try searching for a different word</div>
        </div>
      `;
    } else {
      html += `<div class="flex flex-col gap-5">`;

      meanings.slice(0, 5).forEach((m, index) => {
        const animationDelay = index > 0 ? `animate-delay-${index}00` : "";

        html += `
          <div class="lexmora-slide-in ${animationDelay}">
            <div class="mb-2.5">
              <span class="inline-block text-[11px] font-bold uppercase tracking-wider text-[#1E3A5F] bg-[#F4D88F] px-3 py-1.5 rounded-md">${this.escape(
                m.partOfSpeech || "meaning"
              )}</span>
            </div>
            <p class="m-0 text-[17px] leading-[1.7] text-[#1E3A5F]">${this.escape(
              m.definition
            )}</p>
            ${
              m.example
                ? `<div class="mt-3 pl-4 border-l-3 border-[#6B9BD1]/30"><p class="m-0 text-[15px] leading-relaxed text-[#1E3A5F]/70 italic">"${this.escape(
                    m.example
                  )}"</p></div>`
                : ""
            }
          </div>
        `;
      });

      html += `</div>`;

      if (meanings.length > 5) {
        html += `
          <div class="mt-4 text-center text-xs text-[#1E3A5F]/60">Showing 5 of ${meanings.length} definitions</div>
        `;
      }
    }

    html += `</div>`;
    this.content.innerHTML = html;
    this.dialog.showModal();
  }

  showError(word: string, error: string) {
    this.initialize();
    if (!this.content || !this.dialog) return;

    this.content.innerHTML = `
      <div class="lexmora-slide-in">
        <div class="text-center mb-6 pb-6 border-b-2 border-[#1E3A5F]/10">
          <div class="text-5xl mb-4 opacity-80">⚠️</div>
          <div class="text-2xl font-bold text-[#D97757] mb-2 tracking-tight">
            ${this.escape(word)}
          </div>
          <div class="text-sm text-[#1E3A5F]/70 font-medium">
            Unable to fetch definition
          </div>
        </div>
        
        <div class="p-5 bg-[#FFF8F0] rounded-xl border-2 border-[#F4D88F] relative">
          <div class="text-xs font-bold text-[#D97757] mb-3 uppercase tracking-wider">Error Details</div>
          
          <div class="text-base leading-relaxed text-[#1E3A5F] font-medium mb-4">
            ${this.escape(error || "Something went wrong.")}
          </div>
          
          <div class="p-3 px-4 bg-[#F4D88F]/20 border-l-3 border-[#F4D88F] rounded-lg mt-3">
            <div class="text-xs font-semibold text-[#1E3A5F] mb-1 uppercase tracking-wider">Suggestions</div>
            <div class="text-sm text-[#1E3A5F]/80 leading-normal">
              • Check your internet connection<br>
              • Try searching for a different word<br>
              • Refresh the page and try again
            </div>
          </div>
        </div>
      </div>
    `;
    this.dialog.showModal();
  }

  hide() {
    if (this.dialog) {
      this.dialog.close();
    }
    this.currentWord = null;
  }

  private escape(input: string) {
    const span = document.createElement("span");
    span.textContent = input;
    return span.innerHTML;
  }
}

const dialog = new LexmoraDialog();

chrome.runtime.onMessage.addListener((message: ModalMessage) => {
  if (!message || message.type !== "LEXMORA_MODAL") return;
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

let shadowRootRef: ShadowRoot | null = null;

function ensureShadowRoot(): ShadowRoot {
  if (shadowRootRef) return shadowRootRef;

  const host = document.createElement("div");
  host.id = "lexmora-shadow-host";
  host.style.all = "initial";
  host.style.position = "fixed";
  host.style.zIndex = "2147483647"; // top-most, dialog still uses top layer
  host.style.inset = "0 auto auto 0"; // anchor but no size
  host.style.width = "0";
  host.style.height = "0";
  document.documentElement.appendChild(host);

  const root = host.attachShadow({ mode: "open" });
  shadowRootRef = root;

  const style = document.createElement("style");

  try {
    const cssUrl = chrome.runtime.getURL("contentStyle.css");
    fetch(cssUrl)
      .then((r) => (r.ok ? r.text() : Promise.reject()))
      .then((css) => {
        if ((root as any).adoptedStyleSheets !== undefined) {
          try {
            const sheet = new CSSStyleSheet();
            (sheet as any).replaceSync(css);
            const existing = (root as any).adoptedStyleSheets || [];
            (root as any).adoptedStyleSheets = [...existing, sheet];
            return;
          } catch (err) {
            // This ensures styling still works under strict CSPs or older Chromium versions
            console.warn(
              "Memora: failed to use adoptedStyleSheets; falling back to <style>",
              err
            );
            style.textContent = css;
            root.appendChild(style);
            return;
          }
        }
        style.textContent = css;
        root.appendChild(style);
      })
      .catch((err) => {
        console.warn("Memora: failed to fetch contentStyle.css", err);
      });
  } catch (err) {
    console.warn("Memora: failed to fetch contentStyle.css", err);
  }

  return root;
}
