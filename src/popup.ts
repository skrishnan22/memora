
console.log('Vocab Trainer popup loaded');


document.addEventListener('DOMContentLoaded', () => {
    console.log('Popup DOM loaded');
    
    initializePopup();
});

function initializePopup(): void {
    console.log('Initializing popup...');
    const reviewBtn = document.getElementById('start-review');
    if (reviewBtn) {
        reviewBtn.addEventListener('click', () => {
            const reviewUrl = chrome.runtime.getURL('review.html');
            chrome.tabs.create({ url: reviewUrl });
        });
    }
}
