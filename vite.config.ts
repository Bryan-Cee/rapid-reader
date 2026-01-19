import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "html-transform",
      transformIndexHtml(html) {
        return html.replace(
          "%VITE_UMAMI_WEBSITE_ID%",
          process.env.VITE_UMAMI_WEBSITE_ID || ""
        );
      },
    },
  ],
  base: "/rapid-reader/",
  build: {
    sourcemap: true,
  },
});
