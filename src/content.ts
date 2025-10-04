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
      width: min(560px, calc(100vw - 40px));
      max-height: min(85vh, 800px);
      margin: auto;
      padding: 0;
      border: none;
      border-radius: 20px;
      box-shadow: 
        0 25px 50px -12px rgba(0, 0, 0, 0.25),
        0 0 0 1px rgba(255, 255, 255, 0.1);
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      color: #1e293b;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      backdrop-filter: blur(10px);
      animation: dialogSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    `;

    dialog.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%; position: relative;">
        <!-- Header with gradient background -->
        <div style="
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          padding: 24px 28px 20px 28px; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px 20px 0 0;
          position: relative;
        ">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="
              width: 32px; 
              height: 32px; 
              background: rgba(255, 255, 255, 0.2); 
              border-radius: 12px; 
              display: flex; 
              align-items: center; 
              justify-content: center;
              backdrop-filter: blur(10px);
            ">
              <span style="color: white; font-size: 16px; font-weight: 600;">📚</span>
            </div>
            <h3 style="margin: 0; font-size: 20px; font-weight: 700; color: white; letter-spacing: -0.02em;">Memora</h3>
          </div>
          <button class="close-btn" style="
            appearance: none; 
            border: none; 
            background: rgba(255, 255, 255, 0.15); 
            color: white;
            font-size: 20px; 
            cursor: pointer; 
            line-height: 1; 
            padding: 8px; 
            border-radius: 12px;
            backdrop-filter: blur(10px);
            transition: all 0.2s ease;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">×</button>
        </div>
        
        <!-- Content area -->
        <div class="dialog-body" style="
          padding: 28px; 
          flex: 1; 
          overflow-y: auto;
          background: white;
          border-radius: 0 0 20px 20px;
        "></div>
      </div>
    `;

    // Enhanced styles with animations
    const style = document.createElement("style");
    style.textContent = `
      dialog::backdrop {
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(8px);
        animation: backdropFadeIn 0.3s ease-out;
      }
      
      @keyframes dialogSlideIn {
        from {
          opacity: 0;
          transform: scale(0.9) translateY(-20px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
      
      @keyframes backdropFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      
      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .close-btn:hover {
        background: rgba(255, 255, 255, 0.25) !important;
        transform: scale(1.05);
      }
      
      .close-btn:active {
        transform: scale(0.95);
      }
      
      /* Custom scrollbar */
      .dialog-body::-webkit-scrollbar {
        width: 6px;
      }
      
      .dialog-body::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 3px;
      }
      
      .dialog-body::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
      }
      
      .dialog-body::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
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
      <div style="
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        gap: 20px; 
        padding: 40px 20px;
        text-align: center;
        animation: slideInUp 0.4s ease-out;
      ">
        <div style="
          width: 48px; 
          height: 48px; 
          border: 3px solid #e2e8f0; 
          border-top-color: #667eea; 
          border-radius: 50%; 
          animation: spin 1s linear infinite;
          position: relative;
        ">
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 20px;
            height: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            animation: pulse 2s ease-in-out infinite;
          "></div>
        </div>
        <div style="
          font-size: 18px; 
          font-weight: 600; 
          color: #475569;
          line-height: 1.5;
        ">
          Looking up
        </div>
        <div style="
          font-size: 24px; 
          font-weight: 700; 
          color: #1e293b;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
        ">
          "${this.escape(word)}"
        </div>
        <div style="
          font-size: 14px; 
          color: #64748b;
          opacity: 0.8;
        ">
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
      <div style="animation: slideInUp 0.4s ease-out;">
        <!-- Word header -->
        <div style="
          text-align: center; 
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 2px solid #f1f5f9;
        ">
          <div style="
            font-size: 32px; 
            font-weight: 800; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: -0.03em;
            margin-bottom: 8px;
          ">
            ${this.escape(word)}
          </div>
          <div style="
            font-size: 14px; 
            color: #64748b;
            font-weight: 500;
          ">
            ${meanings?.length || 0} definition${
      meanings?.length !== 1 ? "s" : ""
    } found
          </div>
        </div>
    `;

    if (!meanings?.length) {
      html += `
        <div style="
          text-align: center; 
          padding: 60px 20px;
          color: #64748b;
        ">
          <div style="
            font-size: 48px; 
            margin-bottom: 16px;
            opacity: 0.5;
          ">🔍</div>
          <div style="
            font-size: 18px; 
            font-weight: 600; 
            margin-bottom: 8px;
            color: #475569;
          ">No definitions found</div>
          <div style="
            font-size: 14px; 
            color: #64748b;
          ">Try searching for a different word</div>
        </div>
      `;
    } else {
      html += `<div style="display: flex; flex-direction: column; gap: 20px;">`;

      meanings.slice(0, 5).forEach((m, index) => {
        html += `
          <div style="
            padding: 24px; 
            background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
            border-radius: 16px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            animation: slideInUp 0.4s ease-out ${index * 0.1}s both;
            transition: all 0.2s ease;
            position: relative;
            overflow: hidden;
          " style="animation-delay: ${index * 0.1}s;">
            <!-- Decorative accent -->
            <div style="
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 4px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            "></div>
            
            <div style="
              display: inline-block; 
              font-size: 12px; 
              font-weight: 700;
              color: #667eea; 
              background: rgba(102, 126, 234, 0.1); 
              border-radius: 20px; 
              padding: 6px 12px; 
              margin-bottom: 12px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            ">
              ${this.escape(m.partOfSpeech || "meaning")}
            </div>
            
            <p style="
              margin: 0 0 12px 0; 
              font-size: 16px; 
              line-height: 1.6;
              color: #1e293b;
              font-weight: 500;
            ">
              ${this.escape(m.definition)}
            </p>
            
            ${
              m.example
                ? `
              <div style="
                padding: 12px 16px;
                background: rgba(102, 126, 234, 0.05);
                border-left: 3px solid #667eea;
                border-radius: 8px;
                margin-top: 12px;
              ">
                <div style="
                  font-size: 12px;
                  font-weight: 600;
                  color: #667eea;
                  margin-bottom: 4px;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                ">Example</div>
                <p style="
                  margin: 0; 
                  color: #475569; 
                  font-style: italic;
                  font-size: 14px;
                  line-height: 1.5;
                ">
                  "${this.escape(m.example)}"
                </p>
              </div>
            `
                : ""
            }
          </div>
        `;
      });

      html += `</div>`;
    }

    html += `</div>`;
    this.content.innerHTML = html;
    this.dialog.showModal();
  }

  showError(word: string, error: string) {
    this.initialize();
    if (!this.content || !this.dialog) return;

    this.content.innerHTML = `
      <div style="animation: slideInUp 0.4s ease-out;">
        <!-- Error header -->
        <div style="
          text-align: center; 
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 2px solid #fef2f2;
        ">
          <div style="
            font-size: 48px; 
            margin-bottom: 16px;
            opacity: 0.8;
          ">⚠️</div>
          <div style="
            font-size: 24px; 
            font-weight: 700; 
            color: #dc2626;
            margin-bottom: 8px;
            letter-spacing: -0.02em;
          ">
            ${this.escape(word)}
          </div>
          <div style="
            font-size: 14px; 
            color: #64748b;
            font-weight: 500;
          ">
            Unable to fetch definition
          </div>
        </div>
        
        <!-- Error message -->
        <div style="
          padding: 24px; 
          background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
          border-radius: 16px;
          border: 1px solid #fecaca;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        ">
          <!-- Decorative accent -->
          <div style="
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
          "></div>
          
          <div style="
            font-size: 12px;
            font-weight: 700;
            color: #dc2626;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          ">Error Details</div>
          
          <div style="
            font-size: 16px; 
            line-height: 1.6;
            color: #1e293b;
            font-weight: 500;
            margin-bottom: 16px;
          ">
            ${this.escape(error || "Something went wrong.")}
          </div>
          
          <div style="
            padding: 12px 16px;
            background: rgba(220, 38, 38, 0.05);
            border-left: 3px solid #dc2626;
            border-radius: 8px;
            margin-top: 12px;
          ">
            <div style="
              font-size: 12px;
              font-weight: 600;
              color: #dc2626;
              margin-bottom: 4px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            ">Suggestions</div>
            <div style="
              font-size: 14px;
              color: #475569;
              line-height: 1.5;
            ">
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
