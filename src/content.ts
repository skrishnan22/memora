// // Toast libraries removed. System notifications are handled by background script.

// chrome.runtime.onMessage.addListener((_message, _sender) => {
//   // No-op: notifications handled in background
// });

// let selectionTimeout: number | null = null;

// document.addEventListener('mouseup', () => {
//   const selection = window.getSelection();
//   if (selection && selection.toString().trim()) {
    
//     // Clear previous timeout
//     if (selectionTimeout) {
//       clearTimeout(selectionTimeout);
//     }
    
//     // Add visual feedback for selected text
//     const range = selection.getRangeAt(0);
//     const span = document.createElement('span');
//     span.style.cssText = `
//       background-color: rgba(76, 175, 80, 0.2);
//       border-radius: 2px;
//       transition: background-color 0.2s ease;
//     `;
    
//     try {
//       range.surroundContents(span);
//     } catch (e) {
//       const contents = range.extractContents();
//       span.appendChild(contents);
//       range.insertNode(span);
//     }
    
//     selectionTimeout = window.setTimeout(() => {
//       if (span.parentNode) {
//         const parent = span.parentNode;
//         while (span.firstChild) {
//           parent.insertBefore(span.firstChild, span);
//         }
//         parent.removeChild(span);
//       }
//     }, 1000);
//   }
// });

// // Handle keyboard selection
// document.addEventListener('keyup', () => {
//   const selection = window.getSelection();
//   if (selection && selection.toString().trim()) {
//   }
// });

// export {};
