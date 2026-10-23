# Feature 02：顯示任務清單

## Discover

- 2026-10-23 檢查 main（57d9a3a）：第一個功能已將每筆任務的標題與待辦狀態追加至清單，新增後同步顯示；空清單沒有提示。
- 沿用 mountIssueTracker 內的記憶體陣列與 `{ title, status }` 模型，無既有資料遷移需求。
- 原有測試只有檢查連續新增後有兩筆，未完整確認原有內容保留；本次補強。
- 無 AGENTS.md、貢獻指南、commitlint、CI、remote 或 upstream；README 指定短期分支通過 gate 後 fast-forward 回 main。
- 已追蹤檔案無既有修改；未追蹤的 .agents/ 保持原狀。沒有用戶訪談，觀察限於程式與技術測試。

## Define

使用者需要看見目前記憶體中全部任務，並能辨認沒有任務的狀態。

驗收條件：

1. Given 沒有任務，When 開啟清單，Then 顯示「目前沒有任務」，清單沒有任務列。
2. Given 空清單，When 成功新增，Then 同步顯示任務標題與「待辦」，隱藏空狀態。
3. Given 已有任務，When 再新增，Then 所有新舊任務依新增順序顯示，原有標題與狀態保留。
4. Given 任意清單狀態，When 嘗試新增空白標題，Then 清單及空狀態不變，原有驗證仍有效。
5. Given 重新掛載，Then 記憶體任務清空，重新顯示空狀態，且不讀寫 localStorage。

非目標：編輯、刪除、搜尋、篩選、狀態切換、持久化。允許重複標題的既有行為維持不變。

## Develop

| 方案 | 成本與取捨 | 決定 |
| --- | --- | --- |
| 沿用追加 DOM，依既有 tasks 陣列隱藏空狀態 | 修改僅三行，保留第一個功能與資料模型，適合目前只有新增的範圍 | 採用 |
| 改成每次由陣列重建完整清單 | 可集中渲染，但會改寫已正常運作的路徑；本次沒有編輯、刪除等需求支持此成本 | 暫不採用 |

空狀態使用清單外的段落，不將提示當成任務 li；用 hidden 切換顯示。標題仍經 textContent 呈現。

## Deliver 與實際驗證

執行環境 Node.js 22.23.4；命令使用 `npx --yes --package=node@22 -c 'npm test && npm run build'`。

- 開發前 main 基準：9/9 測試通過；Vite 正式建置成功，5 modules。
- 先新增／補強測試：12 項中 8 通過、4 失敗；失敗均指向缺少空狀態元素，包含重新掛載的空狀態斷言。
- 最小實作後：12/12 測試通過；正式建置成功，5 modules。
- 第一個功能回歸：空白拒絕、成功新增與清空、待辦狀態、錯誤恢復、重複標題、HTML 安全呈現及無 Storage API 呼叫仍有測試覆蓋。
- 多筆測試現在逐筆比對三筆標題與狀態，包含不同標題及重複標題；不只檢查筆數。
- `git diff --check` 通過。未進行真人可用性或真實瀏覽器 E2E 驗證，不宣稱用戶驗收完成。

## Git 與三支 Skills 證據

1. 依指定順序啟用 double-diamond-principle、git-conventional-commit、trunk-based-development；本輪重新讀取三份 SKILL.md，沿用本會話已讀的方法／規範參考文件。
2. Double Diamond：由既有行為發現空狀態缺口，列出可驗收條件，比較追加 DOM 與完整重建，最小變更後實際驗證。
3. Conventional Commits：檢查 status、工作區與 staged diff、歷史；僅明確 staging 本功能程式、測試及文件，以訊息檔提交 `feat: show empty state in task list`。保留資料模型與既有行為，沒有 breaking change；單一目的不拆成無法驗收的提交。
4. TBD：從 main 57d9a3a 建立 feat/task-list，建立時間 2026-10-23T21:52:49+08:00；在一次工作循環內交付，gate 通過後以 `git merge --ff-only feat/task-list` 整合本地 main，整合後再跑測試及建置。最終 hash 與整合驗證以 Git log 及交付回報為準。
5. 不推送、不改寫歷史、不刪分支、不加入原有 .agents/ 或 dist/。無遠端或 CI，僅主張本地驗證；本功能不需 feature flag。

## 問題與改善空間

- Task List 的大部分行為在第一個功能已存在，本次重用並補齊缺口，避免重複實作。
- 現有記憶體陣列與 DOM 透過同一個新增事件同步，對目前範圍足夠；未來若有其他狀態變更，再評估集中渲染，現在不提前開發。
- 後續可接入 CI 並補手機、鍵盤、螢幕閱讀器的實際使用驗收；本次不新增依賴或其他產品功能。
