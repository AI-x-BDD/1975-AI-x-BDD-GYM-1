# 建立時驗證

2026-10-23，由建立者在臨時 Git repository 執行情境；無遠端、未 push/merge。這驗證操作及範例可行性，不代表獨立 Agent 行為評測。

| 案例 | 結果 | 實際觀察 |
| --- | --- | --- |
| CC1 feat | PASS | 新增 greeting；讀 staged diff、驗證行為後提交 feat(greeting) |
| CC2 fix | PASS | 數字字串相加缺陷修復，結果為 5，提交 fix |
| CC3 refactor | PASS | 相同行為驗證通過；採社群 refactor type，未標 breaking |
| CC4 breaking | PASS | 舊呼叫失敗、新呼叫通過；prefix ! 與 footer 記錄遷移 |
| CC5 mixed and sensitive file | PASS | fix/docs 分開；模擬 .env 留在 untracked，未進任何提交 |

重跑方式：在專案根目錄執行 `python3 .agents/skill-validation/run_git_scenarios.py`。可重跑程式與 JSON 結果保留在該目錄。

情境檢視後補強：僅有 `!` 時 description 仍須描述破壞性影響；混合變更先保護既有 staging；refactor 不自動觸發版本升級。限制：未實測各專案 commitlint、hook 或 release 工具，敏感資料篩查也不能保證零漏網。
