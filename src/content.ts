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

class LexmoraDialog {
  private dialog: HTMLDialogElement | null = null;
  private content: HTMLElement | null = null;
  private currentWord: string | null = null;

  initialize() {
    if (this.dialog) return;

    const dialog = document.createElement("dialog");
    dialog.setAttribute("id", "memora-dialog");
    dialog.className =
      "memora-dialog fixed inset-0 w-[min(520px,calc(100vw-40px))] max-h-[min(80vh,760px)] m-auto p-0 rounded-2xl border border-emerald-200/60 bg-emerald-50 text-slate-900 font-sans shadow-[0_10px_30px_rgba(0,0,0,0.08)]";

    dialog.innerHTML = `
      <div class="flex flex-col relative">
        <!-- App bar with green gradient and wave divider -->
        <div class="relative">
          <div class="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-700 via-emerald-600 to-lime-600 text-white rounded-t-2xl">
            <div class="w-8 h-8"></div>
            <div class="flex-1 text-center">
              <span class="text-xs font-semibold tracking-wide uppercase text-white/70">Lexmora</span>
            </div>
            <div class="flex items-center gap-1.5">
              <button class="fav-btn group relative appearance-none border-none cursor-pointer rounded-md w-8 h-8 flex items-center justify-center transition-colors" title="Saved to Lexmora" aria-label="Saved to Lexmora">
                <svg class="w-5 h-5 fill-yellow-300 hover:fill-yellow-400 transition-colors" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <div class="fav-tooltip absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 text-[11px] font-medium text-white bg-black/80 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  Word saved in Lexmora
                </div>
              </button>
              <button class="close-btn appearance-none border-none cursor-pointer rounded-md w-8 h-8 flex items-center justify-center text-white/80 hover:text-white" title="Close">×</button>
            </div>
          </div>
          <!-- Wave divider matching container background -->
          <svg class="block w-full h-6 text-emerald-50" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0,0 V28 Q300,60 600,28 T1200,28 V0 Z" fill="currentColor"></path>
          </svg>
        </div>
        <div class="dialog-body p-0 overflow-y-auto scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400"></div>
      </div>
    `;

    const favBtn = dialog.querySelector(".fav-btn") as HTMLButtonElement;
    const favSvg = favBtn?.querySelector("svg");
    const favTooltip = favBtn?.querySelector(
      ".fav-tooltip"
    ) as HTMLDivElement | null;
    if (favBtn && favSvg) {
      favBtn.addEventListener("click", () => {
        const isFilled = favSvg.classList.contains("fill-yellow-300");
        if (isFilled) {
          favSvg.classList.remove("fill-yellow-300", "hover:fill-yellow-400");
          favSvg.classList.add(
            "fill-none",
            "stroke-white/80",
            "hover:stroke-white",
            "stroke-[1.5]"
          );
          favBtn.title = "Save to Lexmora";
          if (favTooltip) favTooltip.textContent = "Save to Lexmora";
          if (this.currentWord) {
            chrome.runtime.sendMessage({
              type: "MEMORA_ACTION",
              action: "delete",
              word: this.currentWord,
            });
          }
        } else {
          favSvg.classList.remove(
            "fill-none",
            "stroke-white/80",
            "hover:stroke-white",
            "stroke-[1.5]"
          );
          favSvg.classList.add("fill-yellow-300", "hover:fill-yellow-400");
          favBtn.title = "Saved to Lexmora";
          if (favTooltip) favTooltip.textContent = "Word saved in Lexmora";
          if (this.currentWord) {
            chrome.runtime.sendMessage({
              type: "MEMORA_ACTION",
              action: "save",
              word: this.currentWord,
              sourceUrl: location.href,
            });
          }
        }
      });
    }
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
      <div class="flex flex-col items-center gap-4 py-10 px-5 text-center memora-slide-in">
        <div class="w-10 h-10 border-3 border-emerald-200 border-t-emerald-700 rounded-full animate-spin"></div>
        <div class="text-base font-medium text-slate-700 leading-normal">Looking up</div>
        <div class="text-2xl font-bold text-slate-900 tracking-tight">“${this.escape(
          word
        )}”</div>
        <div class="text-sm text-slate-500">Fetching definition…</div>
      </div>
    `;
    this.dialog.showModal();
  }

  showSuccess(word: string, meanings: WordMeaning[]) {
    this.initialize();
    if (!this.content || !this.dialog) return;
    this.currentWord = word;

    let html = `
      <div class="memora-slide-in">
        <div class="px-6 pt-6 pb-3">
          <div class="flex items-center gap-3 mb-1">
            <div class="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">Aa</div>
            <h2 class="text-[2.25rem] md:text-[2.5rem] font-extrabold tracking-tight leading-none m-0 text-slate-900">${this.escape(
              word
            )}</h2>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[11px] font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">${
              meanings?.length || 0
            } ${meanings?.length !== 1 ? "meanings" : "meaning"}</span>
          </div>
        </div>
        
    `;

    if (!meanings?.length) {
      html += `
        <div class="text-center py-15 px-5 text-slate-500">
          <div class="text-5xl mb-4 opacity-50">🔍</div>
          <div class="text-lg font-semibold mb-2 text-slate-600">No definitions found</div>
          <div class="text-sm text-slate-500">Try searching for a different word</div>
        </div>
      `;
    } else {
      html += `<div class="flex flex-col gap-4 px-6 py-4">`;

      meanings.slice(0, 5).forEach((m, index) => {
        const animationDelay = index > 0 ? `animate-delay-${index}00` : "";

        html += `
          <div class="group relative bg-white rounded-lg memora-slide-in ${animationDelay}">
            <div class="py-5 px-6">
              <div class="flex items-start gap-3">
                <div class="flex-1">
                  <div class="mb-1">
                    <span class="inline-block text-[10px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">${this.escape(
                      m.partOfSpeech || "meaning"
                    )}</span>
                  </div>
                  <p class="m-0 text-[15px] leading-relaxed text-slate-800">${this.escape(
                    m.definition
                  )}</p>
                  ${
                    m.example
                      ? `<div class=\"mt-2 p-2 rounded-md bg-slate-50 border border-slate-200\"><p class=\"m-0 text-[13px] leading-relaxed text-slate-600 italic\">${this.escape(
                          m.example
                        )}</p></div>`
                      : ""
                  }
                </div>
              </div>
            </div>
          </div>
        `;
      });

      html += `</div>`;

      if (meanings.length > 5) {
        html += `
          <div class="px-6 py-3 text-center text-xs text-slate-500">Showing 5 of ${meanings.length} definitions</div>
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
      <div class="memora-slide-in">
        <!-- Error header -->
        <div class="text-center mb-8 pb-6 border-b-2 border-red-50">
          <div class="text-5xl mb-4 opacity-80">⚠️</div>
          <div class="text-2xl font-bold text-red-600 mb-2 tracking-tight">
            ${this.escape(word)}
          </div>
          <div class="text-sm text-slate-500 font-medium">
            Unable to fetch definition
          </div>
        </div>
        
        <!-- Error message -->
        <div class="p-6 bg-gradient-to-br from-red-50 to-white rounded-2xl border border-red-200 shadow-sm relative overflow-hidden">
          <!-- Decorative accent -->
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-red-400"></div>
          
          <div class="text-xs font-bold text-red-600 mb-3 uppercase tracking-wider">Error Details</div>
          
          <div class="text-base leading-relaxed text-slate-800 font-medium mb-4">
            ${this.escape(error || "Something went wrong.")}
          </div>
          
          <div class="p-3 px-4 bg-red-600/5 border-l-[3px] border-red-600 rounded-lg mt-3">
            <div class="text-xs font-semibold text-red-600 mb-1 uppercase tracking-wider">Suggestions</div>
            <div class="text-sm text-slate-600 leading-normal">
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

let shadowRootRef: ShadowRoot | null = null;

function ensureShadowRoot(): ShadowRoot {
  if (shadowRootRef) return shadowRootRef;

  const host = document.createElement("div");
  host.id = "memora-shadow-host";
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
