---
name: git-conventional-commit
description: 檢查實際 Git 變更、規劃獨立提交並撰寫或執行 Conventional Commits。適用於 commit 訊息、提交拆分及 breaking change 判斷；不代表授權發布或推送。
---
# Conventional Commits

依使用者要求草擬訊息或執行提交。開始先閱讀 [規範與來源](references/specification.md)，分清官方格式與本 Skill 的操作建議。

## 提交前

1. 閱讀專案 AGENTS.md、貢獻指南與 commitlint 設定。執行 `git status --short --branch`、`git diff`、`git diff --cached`、`git log -5 --format=%s`；檢視相關 untracked 檔案。沒有 Git repository 時回報限制，不自行初始化。
2. 以實際行為差異決定提交內容，不能只憑檔名或使用者摘要。分清 staged、unstaged、使用者原有變更及此次任務的變更。
3. 判斷是否為可獨立理解、驗證與回復的單一目的。無關 bug fix、功能與格式整理通常拆開；同一功能必要的程式、測試與文件可一起提交。共用檔案以 hunk 規劃，不為拆分而破壞中間狀態。
4. 比對公開 API、CLI、設定、資料格式與相容性承諾。內部重構不必然是 breaking；修 bug 也可能破壞已承諾行為。缺乏契約證據時說明不確定性。

## 訊息與執行

- 格式：`type(scope)!: description`，scope 和 `!` 依需要省略。新增功能用 feat、修 bug 用 fix；其他 type 依專案約定。常見 refactor/docs/test/chore 不是官方必備清單。
- description 準確表達結果。body 說明必要動機及取捨；footer 放議題關聯或 breaking 說明。詳見 references 的格式細節。
- 有不相容變更時，用 `!` 或 breaking footer 標示；實務上建議附上影響及遷移方式，即使已用 `!`。
- 以下屬 Agent 實務規則：檢查 staged diff 中敏感資料、產物和無關變更；不要在回報中重印憑證。使用明確路徑或選定 hunk staging，避免直接 `git add .`。不要改動使用者既有 staging 來強迫拆分。
- 草擬訊息不等於授權 commit；使用者已要求提交時直接在其範圍內完成，不重複索取許可。提交前確認 staged diff 完全對應訊息，執行相關專案檢查；失敗則修正授權範圍內問題並重跑，無法修復時回報，不能宣稱通過或跳過 hook。
- 用訊息檔案搭配 `git commit -F <file>` 避免 shell 引用錯誤。沒有可提交差異時不製造空提交。
- 不因本 Skill 自行 push、merge、amend、rebase 或改寫歷史；需要這些動作時核對既有使用者授權。

回報提交拆分理由、訊息、檢查結果，實際提交時附 SHA 與剩餘工作目錄狀態。範例及建立時的測試見 [驗證紀錄](references/validation.md)。[原始建立 prompt](references/original.prompt) 僅供追溯，使用 Skill 時不需重新執行建立任務。
