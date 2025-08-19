import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["iife"], // Browser IIFE
  dts: false,
  minify: false, // debug-friendly
  clean: true,
  splitting: false,
  target: "es2018",
});
