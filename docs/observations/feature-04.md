# Feature 04：刪除任務

## Discover

- 2026-10-23，main 439633f 的資料模型為 `{ id, title, status }`，存在 mountIssueTracker 閉包的 tasks 陣列。每列持有對應物件，已有新增、清單與獨立編輯草稿。
- main 基準實測：Node 22.23.4 下 24/24 測試通過，正式建置成功（6 modules）。
- 已讀根目錄 AGENTS.md 並先保存本次原始 prompt 至 prompts/feature-04.md，更新 prompts/README.md 索引。檢查 Git status、branch、log、diff、cached diff 與 remote；無 remote/upstream、CI、貢獻指南或 commitlint。
- 開始前有未追蹤 .agents/、AGENTS.md 與前三次 prompts 紀錄，未重設、移除或混入本次功能提交；只提交本次 feature-04 prompt。既有 prompts/README.md 仍保留在工作區並已加入本次索引。
- 誤刪風險：相同標題不能作為唯一識別；取消不可更新陣列或 DOM；直接 splice(-1, 1) 可能刪錯最後一筆；刪列後不可留下錯誤空狀態或破壞其他編輯草稿。
- 沒有用戶訪談，觀察來自需求、程式與技術測試。

## Define：驗收條件

1. Given 任務存在，When 點擊該列刪除，Then 必須先出現確認對話框，包含已儲存標題與永久刪除說明。
2. Given 確認刪除，Then 依 task.id 從記憶體陣列刪除指定任務並立即移除該列。
3. Given 取消刪除，Then 所有任務資料、清單及未儲存編輯草稿不變。
4. Given 多筆／同名任務，When 刪除其中一筆，Then 其他任務的 ID、標題、狀態、資料與草稿保留。
5. Given 最後一筆任務刪除成功，Then 顯示「目前沒有任務」；之後仍可新增並隱藏空狀態。
6. Given 不存在的 ID，Then 不刪除任何資料。
7. 前三功能仍可用，沒有 Storage API 呼叫，沒有垃圾桶、復原或軟刪除。

## Develop：方案比較與設計

| 方案 | 成本與風險 | 決定 |
| --- | --- | --- |
| window.confirm 原生對話框 | 不增加依賴，提供確認／取消且由瀏覽器管理模態與鍵盤；外觀與按鈕文字不可客製，可能受瀏覽器對話框政策限制 | 採用，符合目前最小架構 |
| 自訂 dialog | 可客製樣式與按鈕，但需額外開關、焦點、鍵盤及可存取性驗證 | 本次沒有客製需求，不採用 |

- 訊息為「確定要永久刪除任務『標題』嗎？此操作無法復原。」實際畫面使用「」引號；讀取最新已儲存 task.title，不把未儲存草稿當成正式標題。
- 每列新增 type=button 的刪除按鈕，避免誤觸表單提交。
- confirm 回傳 false 時立即返回，完全不呼叫刪除或更新 DOM。
- deleteTask(tasks, id) 以 findIndex 精確比對 ID，找到才 splice；保留原 tasks 陣列與其他任務物件。不存在回傳 false，防止 -1 誤刪。
- 成功才移除對應 item，根據 tasks.length 更新空提示，焦點回新增標題欄位；不重建其他列，保留其編輯草稿。
- 沿用既有資料模型，不新增依賴、儲存層或其他功能。

## Deliver：實際驗證

命令使用 `npx --yes --package=node@22 -c 'npm test && npm run build'`，Node 22.23.4。

- main 修改前：24/24 通過，Vite 正式建置成功。
- 先加入刪除測試：原有 24 通過、新增 10 失敗，原因是缺少按鈕及 deleteTask 函式，確認測試能捕捉功能缺口。
- 實作後：3 個測試檔、34/34 通過；正式建置成功（6 modules）。
- 7 項 UI 行為測試：確認訊息、同名任務按 ID 刪除且其他列不變、取消保留資料與草稿、刪除最後一筆與再次新增、其他草稿仍可儲存、最新已儲存標題及編輯中刪除、不讀寫 Storage。
- 3 項資料測試：依 ID 刪除並保留其他物件及額外資料、不存在 ID 不變、刪除至空陣列及重複刪除安全。
- 原有 24 項新增／清單／編輯測試未修改且全數通過。
- git diff --check 通過；提交前檢查 staged diff，不提交 dist/、node_modules/ 或既有無關檔案。
- jsdom 以 mock 控制 window.confirm 的確認與取消結果；未宣稱實際瀏覽器對話框、手機或真人驗收已完成。

## Git 與三支 Skills 證據

- 依指定順序重新讀取三份 SKILL.md；方法／規範 references 沿用本會話已讀內容。
- Double Diamond：識別誤刪及 ID 風險、定義可驗收條件、比較原生／自訂確認、以最小實作與真實測試收斂；無虛構用戶研究。
- Conventional Commits：核對實際與 staged 差異、保護既有 untracked 內容；功能、必要測試、prompt 與紀錄是一個可獨立回復增量，以訊息檔提交 `feat: delete tasks by ID after confirmation`；無 breaking change。
- TBD：從 main 439633f 建立 feat/delete-task（2026-10-23T22:24:06+08:00），同一工作循環完成。test/build gate 通過後依 README 採本地 fast-forward 整合，main 再跑測試與建置；最終 hash 與整合驗證見 Git log 及交付回報。
- 未 push、未改寫歷史、未刪分支，無遠端 CI，因此僅主張本地驗證。功能完整且透過每次確認控制刪除，不增加 feature flag。

## 問題與改善空間

- 同標題任務由穩定 ID 區分，並以 UI 及資料層各自測試避免誤刪。
- 原生 confirm 外觀由瀏覽器決定；若未來需要客製按鈕、豐富任務摘要或一致視覺，再評估自訂 dialog，現在不提前實作。
- 後續可補真實瀏覽器確認／取消、鍵盤及手機驗收，並加入 CI。本次沒有新增依賴或開發狀態切換、搜尋、篩選、持久化、垃圾桶與復原。
