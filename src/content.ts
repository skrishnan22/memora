function createToast(message: string, isError: boolean = false): HTMLElement {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${isError ? '#ff4444' : '#4CAF50'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    max-width: 300px;
    word-wrap: break-word;
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s ease-in-out;
  `;
  
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  }, 10);
  
  return toast;
}

function showToast(message: string, isError: boolean = false): void {
  const toast = createToast(message, isError);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

chrome.runtime.onMessage.addListener((message, _sender) => {
  if (message.action === 'showToast') {
    showToast(message.message, message.isError || false);
  }
  
});

let selectionTimeout: number | null = null;

document.addEventListener('mouseup', () => {
  const selection = window.getSelection();
  if (selection && selection.toString().trim()) {
    
    // Clear previous timeout
    if (selectionTimeout) {
      clearTimeout(selectionTimeout);
    }
    
    // Add visual feedback for selected text
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.cssText = `
      background-color: rgba(76, 175, 80, 0.2);
      border-radius: 2px;
      transition: background-color 0.2s ease;
    `;
    
    try {
      range.surroundContents(span);
    } catch (e) {
      const contents = range.extractContents();
      span.appendChild(contents);
      range.insertNode(span);
    }
    
    selectionTimeout = window.setTimeout(() => {
      if (span.parentNode) {
        const parent = span.parentNode;
        while (span.firstChild) {
          parent.insertBefore(span.firstChild, span);
        }
        parent.removeChild(span);
      }
    }, 1000);
  }
});

// Handle keyboard selection
document.addEventListener('keyup', () => {
  const selection = window.getSelection();
  if (selection && selection.toString().trim()) {
  }
});

export {};
