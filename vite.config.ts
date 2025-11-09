import { defineConfig } from "vite";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";
import react from "@vitejs/plugin-react";
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
      for (const chunk of Object.values(bundle)) {
        if (
          chunk.type === "asset" &&
          chunk.fileName.startsWith("src/") &&
          chunk.fileName.endsWith(".html")
        ) {
          const segments = chunk.fileName.split("/");
          chunk.fileName = segments[segments.length - 1] ?? chunk.fileName;
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
        review: resolve(__dirname, "src/review/review.html"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
    },
  },
  plugins: [
    react(),
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
            "!**/review.html",
          ],
          dest: ".",
        },
      ],
    }),
  ],
});
