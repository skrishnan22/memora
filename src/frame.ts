import "./content.css";

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

const root = document.getElementById("app")!;

function escapeHtml(input: string) {
  const span = document.createElement("span");
  span.textContent = input;
  return span.innerHTML;
}

// Register Josefin Sans font so CSS can use it reliably inside the iframe
(() => {
  try {
    const josefinUrl = chrome.runtime.getURL(
      "fonts/JosefinSans-VariableFont_wght.woff"
    );
    const fontStyle = document.createElement("style");
    fontStyle.textContent = `
@font-face {
  font-family: 'Josefin Sans';
  src: url('${josefinUrl}') format('woff');
  font-weight: 100 700;
  font-style: normal;
  font-display: swap;
}
`;
    document.head.appendChild(fontStyle);
  } catch (err) {
    console.warn("Lexmora: failed to register Josefin Sans font", err);
  }
})();

function renderBrandHeader(): string {
  const iconUrl = chrome.runtime.getURL("icons/icon-38.svg");
  return `
      <div class="flex items-center justify-center gap-2.5 mb-5">
        <img src="${iconUrl}" alt="Lexmora icon" class="w-8 h-8"/>
        <span class="text-[18px] font-semibold tracking-tight" style="color:#16615b">Lexmora</span>
      </div>
    `;
}

function renderBackdrop(content: string) {
  root.innerHTML = `
    <div class="fixed inset-0" style="background: rgba(30, 58, 95, 0.45); backdrop-filter: blur(6px);"></div>
    <div class="fixed inset-0 w-[min(480px,calc(100vw-40px))] max-h-[min(85vh,680px)] m-auto p-0 rounded-[2rem] bg-[#4c87cf] text-slate-900 shadow-[0_8px_30px_rgba(0,0,0,0.15)] lexmora-dialog">
      <div class="flex flex-col relative p-[18px]">
        <div class="absolute top-[18px] left-[18px] w-5.5 h-5.5 bg-[#fae8d2] rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.15)] z-20"></div>
        <div class="dialog-body card-content relative bg-[#fffbea] rounded-[1.25rem] p-6 overflow-y-auto overflow-x-visible shadow-none shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400 max-h-[calc(85vh-120px)]">
          ${content}
        </div>
        <button id="lexmora-close" class="close-btn absolute top-[30px] right-[30px] appearance-none border-none cursor-pointer rounded-full w-10 h-10 flex items-center justify-center bg-[#F4D88F] hover:bg-[#ECC960] text-[#1E3A5F] hover:text-[#0F2642] transition-all shadow-sm z-10" title="Close">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  `;

  const btn = document.getElementById("lexmora-close");
  if (btn) {
    btn.addEventListener("click", () => {
      parent.postMessage({ type: "LEXMORA_IFRAME", action: "hide" }, "*");
    });
  }

  // Close when clicking on the backdrop area
  const backdrop = root.firstElementChild as HTMLElement | null; // first child is backdrop div
  if (backdrop) {
    backdrop.addEventListener("click", () => {
      parent.postMessage({ type: "LEXMORA_IFRAME", action: "hide" }, "*");
    });
  }
}

function renderLoading(word: string) {
  const content = `
    <div class="flex flex-col items-center gap-5 py-12 px-5 text-center lexmora-slide-in">
      ${renderBrandHeader()}
      <div class="w-12 h-12 border-[3px] border-[#6B9BD1]/30 border-t-[#6B9BD1] rounded-full animate-spin"></div>
      <div class="text-lg font-medium text-[#1E3A5F] leading-normal">Looking up</div>
      <div class="text-3xl font-bold text-[#1E3A5F] tracking-tight">"${escapeHtml(
        word
      )}"</div>
      <div class="text-sm text-[#1E3A5F]/70">Fetching definition…</div>
    </div>
  `;
  renderBackdrop(content);
}

function renderSuccess(word: string, meanings: WordMeaning[]) {
  let html = `
    <div class="lexmora-slide-in">
      ${renderBrandHeader()}
      <div class="mb-6">
        <h2 class="text-[2.25rem] font-bold text-[#0F172A] tracking-tight leading-none m-0 mb-4">${escapeHtml(
          word
        )}</h2>
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-full bg-[#acd4fa] flex items-center justify-center">
            <span class="text-sm font-bold text-[#1e4ba6]">Aa</span>
          </div>
          <span class="text-[15px] font-medium text-[#052e85]">${
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
            <span class="inline-block text-[11px] font-bold uppercase bg-[#ffe9a8] text-[#1E293B] uppercase tracking-wider  px-3 pl-5 pr-5 py-2 rounded-full">${escapeHtml(
              m.partOfSpeech || "meaning"
            )}</span>
          </div>
          <p class="m-0 text-[16px] leading-relaxed text-[#0F172A]">${escapeHtml(
            m.definition
          )}</p>
          ${
            m.example
              ? `<div class="mt-3 pl-4 border-l-3 border-[#6B9BD1]/30"><p class="m-0 text-[15px] leading-relaxed text-[#1E3A5F]/70 italic">"${escapeHtml(
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
  renderBackdrop(html);
}

function renderError(word: string, error: string) {
  const content = `
    <div class="lexmora-slide-in">
      ${renderBrandHeader()}
      <div class="text-center mb-6 pb-6 border-b-2 border-[#1E3A5F]/10">
        <div class="text-5xl mb-4 opacity-80">⚠️</div>
        <div class="text-2xl font-bold text-[#D97757] mb-2 tracking-tight">${escapeHtml(
          word
        )}</div>
        <div class="text-sm text-[#1E3A5F]/70 font-medium">Unable to fetch definition</div>
      </div>
      <div class="p-5 bg-[#FFF8F0] rounded-xl border-2 border-[#F4D88F] relative">
        <div class="text-xs font-bold text-[#D97757] mb-3 uppercase tracking-wider">Error Details</div>
        <div class="text-base leading-relaxed text-[#1E3A5F] font-medium mb-4">${escapeHtml(
          error || "Something went wrong."
        )}</div>
        <div class="p-3 px-4 bg-[#F4D88F]/20 border-l-3 border-[#F4D88F] rounded-lg mt-3">
          <div class="text-xs font-semibold text-[#1E3A5F] mb-1 uppercase tracking-wider">Suggestions</div>
          <div class="text-sm text-[#1E3A5F]/80 leading-normal">• Check your internet connection<br>• Try searching for a different word<br>• Refresh the page and try again</div>
        </div>
      </div>
    </div>
  `;
  renderBackdrop(content);
}

window.addEventListener("message", (e: MessageEvent<ModalMessage>) => {
  const data = e.data;
  if (!data || data.type !== "LEXMORA_MODAL") return;
  if (data.action === "loading" && data.word) return renderLoading(data.word);
  if (data.action === "success" && data.word)
    return renderSuccess(data.word, data.meanings || []);
  if (data.action === "error" && data.word)
    return renderError(data.word, data.error || "Error");
  if (data.action === "hide")
    parent.postMessage({ type: "LEXMORA_IFRAME", action: "hide" }, "*");
});

// Close on Escape while iframe has focus
document.addEventListener(
  "keydown",
  (e) => {
    if (e.key === "Escape") {
      parent.postMessage({ type: "LEXMORA_IFRAME", action: "hide" }, "*");
    }
  },
  true
);
