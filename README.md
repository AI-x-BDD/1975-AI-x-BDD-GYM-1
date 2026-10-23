# Mini Issue Tracker

使用原生 JavaScript，透過 Vite 開發與建置。

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

建議使用 Node.js 22 LTS：先執行 `nvm use`（若已安裝 nvm）。
支援範圍以 package.json 的 engines 為準。

目前功能：輸入標題並按「新增」，建立狀態為「待辦」的任務。
空白標題會顯示錯誤；成功後清空輸入並保留輸入焦點。
任務只保存在記憶體中，重新載入頁面會清空，不使用 localStorage。

本地 Git 流程：短期功能分支，通過測試與建置後 fast-forward 回 main。
