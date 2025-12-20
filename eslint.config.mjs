import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";


export default [
  js.configs.recommended,
  nextPlugin.configs["core-web-vitals"],
  nextPlugin.configs["recommended"],

  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "next-env.d.ts",
      "src/generated/**",     
      "prisma/**",     
    ],
  },
  {
  files: [
    "scheduled-email-sender.js",
    "socket-server/**/*.js",
  ],
  languageOptions: {
    globals: {
      require: "readonly",
      module: "readonly",
      __dirname: "readonly",
      process: "readonly",
      console: "readonly",
      setInterval: "readonly",
      setTimeout: "readonly",
      clearInterval: "readonly",
      clearTimeout: "readonly",
    },
  },
},
];
