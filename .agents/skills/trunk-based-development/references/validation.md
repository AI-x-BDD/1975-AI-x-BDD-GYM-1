# 建立時驗證

2026-10-23，由建立者在臨時 Git repository 執行情境；無遠端、未 push/merge。這驗證操作及範例可行性，不代表獨立 Agent 行為評測。

| 案例 | 結果 | 實際觀察 |
| --- | --- | --- |
| TBD1 small feature | PASS | 短期 task 分支通過測試並本地提交；main 未變，整合未執行 |
| TBD2 long branch risk | PASS | 10 天前 fixture commit 作風險訊號；不可當成可靠建立時間，提出切片，未強制整合或刪除 |
| TBD3 unfinished feature | PASS | 預設舊路徑 100、啟用新路徑 90；兩狀態通過。清理條件：新路徑驗收後移除，fixture owner 為建立者 |
| TBD4 failed gate | PASS | 刻意失敗測試；停止提交/整合，修復後測試通過 |
| TBD5 large refactor | PASS | 抽象、雙實作、切換、清理四個增量，各步行為測試通過；未觸碰遠端 |

重跑方式：在專案根目錄執行 `python3 .agents/skill-validation/run_git_scenarios.py`。可重跑程式與 JSON 結果保留在該目錄。

情境檢視後補強：commit 日期不等於分支建立日期；無可靠紀錄時標記未知，不能以 rebase 後日期宣稱分支很新。將本地完成與共享整合分開回報。限制：未實測遠端 CI、PR 審查、真正多人競爭或部署回復。
