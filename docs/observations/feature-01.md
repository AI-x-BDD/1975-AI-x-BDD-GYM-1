# Feature 01：新增任務

## Discover：實際觀察與需求

2026-10-23 初次檢查時，工作目錄只有 Skills，沒有應用程式、AGENTS.md、貢獻指南、CI 或 Git repository。`git status --short --branch` 與 `git log -5 --oneline` 回傳 exit code 128（not a git repository）。未自行初始化，先回報阻礙；使用者隨後明確授權「在本專案建立」，並確認繼續原生 JavaScript 與 Vite 方案。

已確認需求：輸入標題、點擊新增、拒絕空字串與只有空格的標題、成功後清空、新任務為「待辦」、只使用記憶體。沒有真實使用者研究或訪談，以下驗證是技術行為驗證。

## Define：範圍與驗收

只開發新增任務；不包含編輯、刪除、狀態切換、後端、localStorage 或其他持久化。

1. Given 有效標題，When 點擊新增，Then 清單增加一筆對應任務，狀態為「待辦」。
2. Given 空字串或只有空白的標題，When 點擊新增，Then 不新增，顯示錯誤提示。
3. Given 新增成功，Then 輸入欄位清空。
4. Given 已有任務，When 再新增，Then 保留原有任務。
5. 任務在重新載入／重新掛載後消失，新增流程不讀寫 localStorage。

實作決策（非額外用戶研究結果）：標題前後 trim、允許重複標題；成功後將焦點留在輸入欄位。HTML 字串顯示為文字，避免插入使用者提供的 HTML。

## Develop：方案比較

| 方案 | 價值與成本 | 決定 |
| --- | --- | --- |
| 原生 JavaScript + Vite + Vitest/jsdom | 本功能只需簡單表單與記憶體陣列，無框架執行依賴；可測 DOM 操作並產生正式建置 | 採用 |
| React + Vite | 可用元件與 hooks 管理狀態，但此單一表單會增加框架及設定成本 | 本次不採用 |

表單 submit 處理驗證，陣列維持目前掛載的任務狀態，使用 DOM textContent 安全呈現標題。原生 required 無法拒絕只有空格的標題，因此由統一的 trim 驗證與可存取錯誤訊息處理。

## Deliver：驗證與交付

執行環境：Node.js 22.23.4（透過 `npx --yes --package=node@22 -c '…'` 執行），Vite 7.3.7、Vitest 5.0.5、jsdom 27.0.1。

- 初始骨架：`npm run build` 通過（4 modules）；原專案不存在，因此無既有測試基準。
- `npm ci`：成功，依 lockfile 安裝。
- `npm test`：1 個檔案、9 項測試通過。涵蓋成功新增／待辦／清空／焦點、四種空白輸入、錯誤恢復與 trim、連續及重複標題、HTML 文字安全、重新掛載清空與 Storage API 不呼叫。
- `npm run build`：成功（5 modules），產出 dist，未加入 Git。
- `npm audit`：0 個已知漏洞。
- `git diff --check`：提交前檢查。
- 未進行真人可用性測試或完整瀏覽器 E2E；jsdom 測試不等同真實瀏覽器驗收。

## Git 與安全整合

- 使用者授權後初始化本地 `main`；無 remote、upstream、既有保護規則或 CI，不能宣稱已通過遠端 CI。
- 骨架獨立提交：`9b9b46d` — `chore: bootstrap vanilla JavaScript application`，先確認可建置。
- 短期分支：`feat/add-task`，建立時間 2026-10-23T21:40:42+08:00。
- 功能程式、必要測試、README 與本紀錄是一個完整可回復增量，訊息為 `feat: add tasks with in-memory state`；本提交 hash 以 Git log 為準，避免文件自我引用。
- 整合 gate：完整測試及建置通過後，僅以 `git merge --ff-only feat/add-task` 整合本地 main，整合後再跑測試與建置。最終結果以交付回報及 Git log 為準。
- 不 push、不改寫歷史、不刪分支。原有 `.agents/` 檔案保持不變且不納入此次提交。

## 三支 Skills 遵循證據

依序讀取三支 SKILL.md 及各自 references/methods.md 或 references/specification.md：

1. Double Diamond：依環境事實界定問題、列出可驗收行為、比較原生 JS 與 React、以小範圍 DOM 測試及建置驗證；明確區分技術測試與用戶研究。
2. Conventional Commits：檢查實際狀態、diff、staged diff 與歷史；明確路徑 staging；以訊息檔提交；骨架和功能各有獨立目的；無既有 API，因此不標示 breaking change。
3. TBD：先確認授權與主幹，骨架可建置後才建立短期分支；功能單一增量，通過 gate 才 fast-forward 本地 main；未擅自 push 或擴充功能。不需要 feature flag 或 Branch by Abstraction。

## 問題及優化建議

- 初始缺少專案，已經由使用者授權從零建立後排除。
- 最初 Node 23.11.1/npm 10.9.2 安裝新版 Vitest 時出現 edgesOut 錯誤；改用工具支援的 Node 22 LTS 後成功，加入 .nvmrc 和 engines 以減少環境差異。
- 最初安裝 Vitest 3.2.7 時 audit 回報 3 個漏洞；升至 5.0.5 後為 0，未使用強制 audit fix。
- npm 仍提示間接依賴 whatwg-encoding 已棄用，未影響測試或建置；不擴張本次範圍去覆寫間接依賴。
- 後續可將現有測試／建置接入 CI，並補真人鍵盤、手機與螢幕閱讀器驗收；本次未提前開發其他產品功能。
