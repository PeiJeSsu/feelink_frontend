import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";

export default [
  { 
    files: ["**/*.{js,mjs,cjs,jsx}"], 
    languageOptions: { 
      globals: {
        ...globals.browser,
        ...globals.es2020
      },
      ecmaVersion: 2020,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      react: pluginReact
    },
    rules: {
      ...js.configs.recommended.rules,
      ...pluginReact.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // React 17+ 不需要匯入 React
      "react/prop-types": "warn" // 將 prop-types 改為警告而不是錯誤
    },
    settings: {
      react: {
        version: "detect"
      }
    }
  },
  {
    // Node.js 配置檔案和腳本
    files: ["babel.config.js", "*.config.js", "**/babel.config.js", "scripts/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        module: "readonly",
        require: "readonly",
        __dirname: "readonly",
        __filename: "readonly"
      },
      ecmaVersion: 2020,
      sourceType: "script"
    },
    rules: {
      ...js.configs.recommended.rules
    }
  },
  {
    // Firebase 和環境變數檔案
    files: ["**/config/firebase.js", "**/config/ApiConfig.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        process: "readonly"
      },
      ecmaVersion: 2020,
      sourceType: "module"
    },
    rules: {
      ...js.configs.recommended.rules
    }
  },
  {
    // 測試檔案專用配置
    files: ["**/*.test.{js,jsx}", "**/__tests__/**/*.{js,jsx}", "**/setupTests.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest,
        ...globals.node,
        global: "readonly",
        require: "readonly"
      },
      ecmaVersion: 2020,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      react: pluginReact
    },
    rules: {
      ...js.configs.recommended.rules,
      ...pluginReact.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "no-undef": "off", // 在測試檔案中關閉 no-undef，因為 Jest 有很多全域變數
      "no-unused-vars": "warn" // 測試檔案中將未使用變數改為警告
    }
  },
  {
    ignores: ["dist", "node_modules", "coverage", "build"]
  }
];
