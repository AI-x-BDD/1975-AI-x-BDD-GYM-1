# Feature 03：編輯任務

## Discover

- 2026-10-23 檢查 main 2d32140，無 tracked 修改，只有原有未追蹤 .agents/；未發現 AGENTS.md、貢獻指南、commitlint 或 CI，無 remote/upstream。
- 現有資料為 mountIssueTracker 內的 tasks 陣列，任務只有 title、status，尚無 ID。先前紀錄不可當成已有 ID 的證據。
- 新增時直接追加 DOM，可沿用每列閉包持有的任務物件，避免以標題定位時誤改同名任務。
- 基準實測：Node 22.23.4 下 12/12 測試通過，Vite build 成功（5 modules）。未進行訪談，沒有真人可用性研究證據。

## Define：驗收條件與範圍

1. Given 任務存在，When 點擊該列「編輯」，Then 顯示預填原標題的輸入欄位，並提供儲存與取消。
2. Given 有效草稿，When 儲存，Then trim 前後空白並立即顯示新標題，關閉表單。
3. Given 空字串、空格或其他純空白草稿，When 儲存，Then 顯示錯誤並留在編輯狀態，任務資料不變；可修正後再儲存。
4. Given 已改寫草稿，When 取消，Then 不更新任務，再次編輯仍預填原標題。
5. Given 多筆或相同標題任務，When 儲存其中一筆，Then 其他任務標題、狀態及編輯草稿不變。
6. 編輯只更新原物件的 title，保留 id、status、所有其他屬性與物件參考。
7. 新增、空清單、多筆清單仍運作；只用記憶體，不呼叫 Storage API。

只新增編輯能力。不實作刪除、狀態切換、搜尋、篩選或持久化。

## Develop：方案比較與決策

| 方案 | 取捨 | 決定 |
| --- | --- | --- |
| 清單內編輯表單，各列持有原任務參考 | 可直接預填、顯示驗證錯誤及取消；保留既有新增／清單邏輯與其他列草稿 | 採用 |
| 全域對話框或整份清單重建 | 需新增目前選取任務及焦點／草稿協調；對本次範圍沒有足夠收益 | 不採用 |

- 原本無 ID，因此新增時以 crypto.randomUUID() 建立一次；編輯不重建任務或 ID。dataset.taskId 供清單識別與整合測試，表單 label/error ID 也以任務 ID 區分。
- 草稿留在該列表單 input，取消不呼叫資料更新；儲存透過小型 renameTask 函式驗證並只更新 task.title，方便直接驗證其他資料保留。
- 標題以 input.value 預填、textContent 顯示，不插入使用者 HTML。
- 每列可獨立編輯；成功或取消後焦點回編輯按鈕，失敗時回輸入欄位，提供 label、aria-describedby、aria-invalid 與 role=alert。
- CSS 僅補表單換行與操作按鈕間距，不增加依賴。

## Deliver：實際測試與建置

實際命令：`npx --yes --package=node@22 -c 'node --version && npm test && npm run build'`（開發後同樣於 Node 22 執行 test/build）。

- 修改前：12/12 通過，正式建置成功。
- 修改後：2 個測試檔，24/24 通過；正式建置成功，6 modules。
- 新測試 12 項：預填與焦點、成功 trim/儲存及原 ID/待辦保留、四種純空白驗證及修正、取消並重新編輯、同名但不同 ID 的任務隔離、編輯中新增與多列草稿隔離、HTML 安全及 Storage 不呼叫、保留既有 ID/非預設狀態/metadata、驗證失敗資料不變。
- 原有 12 項未修改且全部通過，覆蓋新增成功清空、預設待辦、空白拒絕、錯誤恢復、多筆及重複標題保留、空清單提示、HTML 安全、重新掛載與無持久化。
- `git diff --check` 通過；未執行真實瀏覽器 E2E 或真人驗收，不能將 jsdom 通過視為真人已接受。

## Git 與 Skills 遵循證據

- 依序重新讀取 double-diamond-principle、git-conventional-commit、trunk-based-development 的 SKILL.md；方法及規範參考文件沿用本會話已讀內容。
- Double Diamond：由既有程式辨識無 ID 與同名任務風險；列驗收、比較方案、選最小增量，以實測與回歸驗證；沒有虛構使用者研究。
- Conventional Commits：先檢查 status、branch、diff、cached diff、log；明確 staging 功能／必要測試／README／本紀錄，以訊息檔提交 `feat: edit task titles without changing task identity`。單一編輯功能與其必要 ID 補充一起交付，無破壞性契約變更。
- TBD：main 基準通過後建立 feat/edit-task（2026-10-23T22:10:17+08:00），維持一次工作循環內的小增量；依 README 沿用本地 fast-forward 流程，整合前通過 test/build，再於 main 重跑。最終 commit hash 與整合結果見 Git log 及交付回報。
- 不 push、不刪分支、不改寫歷史；保留原有未追蹤 .agents/，不提交 dist/ 或 node_modules/。沒有 remote 或 CI，不聲稱通過遠端驗證。功能完整且無外部副作用，不需要 feature flag。

## 問題與優化空間

- 「保留原 ID」與既有實作無 ID 有落差；採相容新增 ID，並針對建立後的 ID 穩定性及既有含 ID 物件各自測試，沒有虛稱先前已有 ID。
- crypto.randomUUID 需現代瀏覽器的安全環境，Vite localhost 可用，正式部署應使用 HTTPS；本次未新增部署設定。
- 現在每列閉包管理任務與草稿，足以支援本次編輯；未來有其他資料操作再評估渲染抽離，不提前實作其他功能。
- 後續可補真實瀏覽器的 Enter、手機及輔助技術驗收，並接入 CI；此為建議，未擴大本次交付範圍。
