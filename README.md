# Vocab Trainer Chrome Extension

A Chrome extension built with TypeScript for vocabulary training.

## Project Structure

```
vocab-trainer-extension/
├── src/
│   ├── popup.html          # Popup HTML
│   ├── popup.ts            # Popup TypeScript
│   ├── background.ts       # Background script
│   └── content.ts          # Content script
├── public/xtn/             # Built extension (generated)
├── manifest.json           # Extension manifest
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
└── README.md               # This file
```

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Build the extension:

   ```bash
   npm run build:extension
   ```

3. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `public/xtn` folder

### Development Commands

- `npm run dev` - Start development server (for testing)
- `npm run build` - Build the extension
- `npm run build:extension` - Build and prepare for publishing
- `npm run clean` - Clean build output
- `npm run preview` - Preview the built extension

## Building for Production

The build process compiles all TypeScript files to JavaScript and outputs everything needed for the Chrome extension to the `public/xtn` folder:

- `popup.js` - Compiled popup script
- `background.js` - Compiled background script
- `content.js` - Compiled content script
- `popup.html` - Popup HTML
- `manifest.json` - Extension manifest
- Any other assets

## Extension Features

- **Popup**: Main interface for the extension
- **Background Script**: Handles extension lifecycle and storage
- **Content Script**: Interacts with web pages for vocabulary detection

## TypeScript Support

The project is fully configured for TypeScript development with:

- Chrome extension type definitions
- Strict type checking
- Modern ES2020 target
- Vite for fast builds

## Adding Icons

Place your extension icons in the `icons/` directory:

- `icon16.png` (16x16)
- `icon32.png` (32x32)
- `icon48.png` (48x48)
- `icon128.png` (128x128)

The manifest.json is already configured to use these icons.
