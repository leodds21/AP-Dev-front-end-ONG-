import { defineConfig } from "vite";

export default defineConfig({
    // Apenas a entrada atual é analisada; exportações antigas ficam fora da build.
    optimizeDeps: { entries: ["index.html"] }
});
