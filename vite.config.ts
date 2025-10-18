import { defineConfig } from "vite";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";
import type { OutputBundle } from "rollup";

/* weirdly vite always keeps html files in the same dir structure as the src
 * https://github.com/vitejs/vite/issues/15612.
 * hence this hack.
 */
function moveHtmlToRoot() {
  return {
    name: "move-html-to-root",
    apply: "build" as const,
    enforce: "post" as const,
    generateBundle(_options, bundle: OutputBundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (fileName === "src/content-frame.html" && chunk.type === "asset") {
          chunk.fileName = "content-frame.html";
        }
      }
    },
  };
}

export default defineConfig({
  publicDir: false, // Disable default public dir
  build: {
    outDir: "xtn",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "src/popup.ts"),
        background: resolve(__dirname, "src/background.ts"),
        content: resolve(__dirname, "src/content.ts"),
        contentStyle: resolve(__dirname, "src/content.css"),
        "content-frame": resolve(__dirname, "src/content-frame.html"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
    },
  },
  plugins: [
    moveHtmlToRoot(),
    viteStaticCopy({
      targets: [
        {
          src: [
            "src/**/*",
            "!src/**/*.ts",
            "!src/**/*.tsx",
            "!src/**/*.css",
            "!**/content-frame.html",
          ],
          dest: ".",
        },
      ],
    }),
  ],
});
