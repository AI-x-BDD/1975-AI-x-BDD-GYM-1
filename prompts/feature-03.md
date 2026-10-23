# Feature 03：編輯任務 — 原始 Prompt

請依序啟用以下三支 Skills：

/double-diamond-principle
/git-conventional-commit
/trunk-based-development

接著請幫我開發 Mini Issue Tracker 的第三個功能：**編輯任務（Edit Task）**。

### 功能需求
1. 每筆任務提供「編輯」按鈕。
2. 點擊編輯後，可以修改該任務的標題。
3. 編輯時預先顯示原本的任務標題。
4. 任務標題不得為空白或只有空格，儲存前應移除前後空白。
5. 使用者可以儲存修改，成功後清單立即顯示新的任務標題。
6. 使用者可以取消編輯，取消後保留原本的內容。
7. 編輯其中一筆任務，不得影響其他任務。
8. 保留任務原有的 ID、狀態及其他既有資料。
9. 延續目前的記憶體狀態管理方式，不新增 localStorage。

### 開發要求
1. 運用 Double Diamond，簡要完成 Discover、Define、Develop、Deliver，釐清需求、比較合理方案並設定驗收條件。
2. 遵守 Trunk-Based Development，僅修改必要程式碼，採取小步開發與安全整合方式。
3. 不破壞前兩個功能：新增任務、顯示任務清單。
4. 補上必要的自動化測試，至少包含：
   - 成功編輯任務
   - 拒絕空白標題
   - 取消編輯不改變資料
   - 修改一筆任務不影響其他任務
   - 保留原有 ID 與狀態
5. 實際執行測試與建置，回報真實結果。
6. 遵循 Conventional Commits，依變更目的建立合理的 Commit。
7. 不擅自推送遠端或修改無關功能。
8. 將本次開發與觀察資料記錄於 `docs/observations/feature-03.md`。

### 完成後請回報
- Double Diamond 四階段摘要
- 本次實作內容與主要設計決策
- 測試案例及實際測試結果
- Git Branch 與整合狀態
- Commit Message 和 Hash
- 三支 Skills 的實際遵循證據
- 遇到的問題及優化空間

請只完成第三個功能，不要提前實作刪除任務、狀態切換、搜尋或資料持久化。
