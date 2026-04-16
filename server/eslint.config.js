import globals from "globals";
import { defineConfig } from "eslint/config";
import baseConfig from "../eslint.config.js";

export default defineConfig([
  ...baseConfig,
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: {
      globals: globals.node,
    },
  },
]);
