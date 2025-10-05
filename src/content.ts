import "./content.css";

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
    dialog.className =
      "memora-dialog fixed inset-0 w-[min(560px,calc(100vw-40px))] max-h-[min(85vh,800px)] m-auto p-0 border-none rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.1)] bg-gradient-to-br from-white to-slate-50 text-slate-800 font-sans backdrop:backdrop-blur-sm";

    dialog.innerHTML = `
      <div class="flex flex-col h-full relative">
        <!-- Header with gradient background -->
        <div class="flex items-center justify-between px-7 pt-6 pb-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-t-3xl relative">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <span class="text-white text-base font-semibold">📚</span>
            </div>
            <h3 class="m-0 text-xl font-bold text-white tracking-tight">Memora</h3>
          </div>
          <button class="close-btn appearance-none border-none bg-white/15 text-white text-xl cursor-pointer leading-none p-2 rounded-xl backdrop-blur-md transition-all duration-200 w-9 h-9 flex items-center justify-center hover:bg-white/25 hover:scale-105 active:scale-95">×</button>
        </div>
        
        <!-- Content area -->
        <div class="dialog-body p-7 flex-1 overflow-y-auto bg-white rounded-b-3xl scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400"></div>
      </div>
    `;

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
      <div class="flex flex-col items-center gap-5 py-10 px-5 text-center memora-slide-in">
        <div class="w-12 h-12 border-3 border-slate-200 border-t-indigo-500 rounded-full animate-spin relative">
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full animate-pulse"></div>
        </div>
        <div class="text-lg font-semibold text-slate-600 leading-normal">
          Looking up
        </div>
        <div class="text-2xl font-bold text-slate-800 bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent tracking-tight">
          "${this.escape(word)}"
        </div>
        <div class="text-sm text-slate-500 opacity-80">
          Please wait while we fetch the definition...
        </div>
      </div>
    `;
    this.dialog.showModal();
  }

  showSuccess(word: string, meanings: WordMeaning[]) {
    this.initialize();
    if (!this.content || !this.dialog) return;

    let html = `
      <div class="memora-slide-in">
        <!-- Word header with better visual hierarchy -->
        <div class="mb-7">
          <div class="flex items-baseline gap-3 mb-3">
            <h2 class="text-[2.5rem] font-black bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-500 bg-clip-text text-transparent tracking-tight leading-none m-0">
              ${this.escape(word)}
            </h2>
            <span class="text-sm font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              ${meanings?.length || 0} ${
      meanings?.length !== 1 ? "meanings" : "meaning"
    }
            </span>
          </div>
          <div class="h-1 w-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
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
      html += `<div class="flex flex-col gap-4">`;

      meanings.slice(0, 5).forEach((m, index) => {
        const animationDelay = index > 0 ? `animate-delay-${index}00` : "";
        const partOfSpeechIcon = this.getPartOfSpeechIcon(m.partOfSpeech);

        html += `
          <div class="group relative bg-white rounded-2xl border-2 border-slate-100 hover:border-indigo-200 shadow-sm hover:shadow-md memora-slide-in ${animationDelay} transition-all duration-300 overflow-hidden">
            <!-- Number badge -->
            <div class="absolute -top-1 -left-1 w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md z-10">
              ${index + 1}
            </div>
            
            <div class="pt-6 px-6 pb-5">
              <!-- Part of speech header -->
              <div class="flex items-center gap-2 mb-4">
                <span class="text-lg">${partOfSpeechIcon}</span>
                <span class="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                  ${this.escape(m.partOfSpeech || "meaning")}
                </span>
              </div>
              
              <!-- Definition -->
              <p class="m-0 text-[15px] leading-relaxed text-slate-700 font-normal mb-0">
                ${this.escape(m.definition)}
              </p>
            </div>
            
            ${
              m.example
                ? `
            <!-- Example section with improved design -->
            <div class="px-6 pb-5 pt-0">
              <div class="relative bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                <!-- Quote icon -->
                <div class="absolute -top-2 left-4 bg-white px-2 border border-indigo-100 rounded-md">
                  <span class="text-indigo-400 text-xs font-bold">💬</span>
                </div>
                <div class="flex gap-2 items-start mt-1">
                  <span class="text-indigo-400/40 text-2xl leading-none font-serif mt-[-4px]">"</span>
                  <p class="m-0 text-slate-600 text-sm leading-relaxed flex-1 pt-1">
                    ${this.escape(m.example)}
                  </p>
                  <span class="text-indigo-400/40 text-2xl leading-none font-serif self-end mb-[-4px]">"</span>
                </div>
              </div>
            </div>
            `
                : ""
            }
          </div>
        `;
      });

      html += `</div>`;

      // Add footer note if there are more than 5 meanings
      if (meanings.length > 5) {
        html += `
          <div class="mt-6 text-center text-sm text-slate-400">
            Showing 5 of ${meanings.length} definitions
          </div>
        `;
      }
    }

    html += `</div>`;
    this.content.innerHTML = html;
    this.dialog.showModal();
  }

  private getPartOfSpeechIcon(partOfSpeech: string): string {
    const pos = partOfSpeech?.toLowerCase() || "";
    const iconMap: Record<string, string> = {
      noun: "📦",
      verb: "⚡",
      adjective: "🎨",
      adverb: "🔄",
      pronoun: "👤",
      preposition: "🔗",
      conjunction: "🤝",
      interjection: "❗",
    };

    return iconMap[pos] || "📝";
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
