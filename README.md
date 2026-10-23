# AI-x-BDD-GYM-1：Skills 與 Mini Issue Tracker 實作紀錄

## 關於這個 repo

我在這個 repo 整理了需求探索、主幹開發與 Git 提交相關的 skills，並透過 Mini Issue Tracker 逐步開發功能，觀察 AI 如何理解需求、選用 skill，以及完成實作與驗證。

這份作品也記錄了一個嘗試：從詳細的需求規格與 skill 執行順序開始，再逐步縮短 prompt，看看 AI 的行為會如何改變。

## 結構說明

| 路徑 | 內容 |
|---|---|
| `.claude/skills/` | Claude Code 使用的 skills，與 `.agents/skills/` 同步 |
| `.agents/skills/` | Codex／.agents 使用的 skills |
| `VERSION` | 官方 template 版本 |
| `src/` | Mini Issue Tracker 程式碼與自動化測試 |
| `prompts/` | 原始需求與後續補充紀錄 |
| `docs/observations/` | 各階段的開發觀察 |
| `.agents/skill-validation/` | skill 情境驗證腳本與結果 |

> `.claude/skills/`、`.agents/skills/` 與 `VERSION` 是《AI x BDD》課程平台抓取與展示 skills 的固定位置，請勿更名、搬移或刪除。

## Skills 與設計想法

### `double-diamond-principle`

- **用途**：探索需求、定義可驗收問題、比較方案並交付驗證。
- **使用時機**：釐清模糊需求，或處理有實質取捨的軟體工作；明確的小修改採精簡流程。
- **設計想法**：依不確定性與風險調整探索深度，區分已確認需求與推測，讓驗收條件能對應實作成果。
- **驗證狀態**：已在 Mini Issue Tracker 開發中使用；需求確認的互動仍有不足，詳見下方觀察。

### `trunk-based-development`

- **用途**：以小型、可驗證變更維持主幹穩定，規劃短期分支與整合流程。
- **使用時機**：開發功能、整合變更或規劃大型重構時。
- **設計想法**：先檢查 Git 狀態與既有變更，再決定工作方式；透過測試與建置確認可整合狀態，不把 skill 的使用視為 push 或 merge 的授權。
- **驗證狀態**：已在 Mini Issue Tracker 開發中使用；曾觀察到與 Double Diamond 的引用不一致，尚不能認定每次都會正確觸發。

### `git-conventional-commit`

- **用途**：檢查實際差異、規劃提交範圍，並撰寫或執行 Conventional Commits。
- **使用時機**：需要 commit 訊息、拆分提交或判斷 breaking change 時。
- **設計想法**：由實際行為差異決定訊息，將同一功能的程式、測試與文件一起提交，同時保留無關變更。
- **驗證狀態**：已用於 Mini Issue Tracker 的實際提交。

## Mini Issue Tracker

使用原生 JavaScript 與 Vite，支援：

- 新增任務與空白標題驗證。
- 編輯標題、取消草稿與確認刪除。
- 切換待辦、進行中、已完成狀態。
- 依標題搜尋與狀態篩選，顯示符合筆數及空清單提示。
- 以 localStorage 保存任務 ID、標題、狀態與順序，重新整理後恢復資料。

資料僅保存在相同瀏覽器與網站來源，清除網站資料後會移除，不提供跨裝置同步。搜尋條件與未儲存草稿不保存；資料損壞或儲存失敗時會顯示提示，並允許繼續操作。

### 本機執行與驗證

Node.js 支援範圍以 `package.json` 的 `engines` 為準；若已安裝 nvm，可先執行 `nvm use`。

```sh
npm ci
npm run dev
```

```sh
npm test
npm run build
npm run preview
```

資料持久化功能完成時，68 項自動化測試與正式建置皆通過。測試通過不代表需求已經由使用者確認。

## 實作過程觀察

這次實作有刻意調整 prompt 的詳細程度，觀察 AI 在不同需求描述下的表現。大約前四個功能的 prompt 都先請 AI 協助寫得比較完整，包含需求、規格，以及 skill 的執行順序。後續則逐步縮短 prompt，減少說明內容。

隨著需求描述變短，我觀察到 skill 的使用有時沒有符合預期。原本預期會使用的三個 skill 是 `double-diamond-principle`、`trunk-based-development` 和 `git-conventional-commit`；先不看 commit，有時 Double Diamond 和 TBD 只引用了其中一個。不過，目前只能說這些現象出現在簡化 prompt 的過程中，還不能確定是否由 prompt 變短所造成。

另一個觀察是，不論需求寫得詳細或簡短，AI 在探索需求時都沒有主動與我互動、確認需求。大部分情況下，它會自行推測功能應該怎麼做，再往下實作。

這次挑選的題目可能比較簡單，因此沒有明顯看到這些推測造成錯誤。這也讓觀察有所限制：功能順利完成，還不足以判斷 AI 是否正確理解了需求，以及遇到更複雜或模糊的題目時，能否適當使用 skill 並確認需求。

## 交流

歡迎取用這些 skills，或依專案需求調整。若有使用問題或改進建議，歡迎開 issue 討論。

---

## 官方宣告（以下區塊請保留）

本 repo 為[水球軟體學院](https://world.waterballsa.tw)《AI x BDD：規格驅動全自動化開發術》課程的學員產出，用於公告課程中道館作業的展示，並依[官方 Template](https://github.com/AI-x-BDD/aixbdd-skill-homework-template) 建立。

《AI x BDD：規格驅動全自動化開發術》課程四大特色：

1. **【軟工方法論＋結果導向】**
   只談 AI coding 不談軟工方法論，是不學無術！課程中強調結果導向的開發方法：只要訂好驗收標準，就可以 One-Shot 開發到位！
2. **【最完整的 SDD 概念與實作】**
   市面上最完整的 SDD 課程，一次教你 Skills、SDD、TDD、BDD 的知識與實踐，輕鬆實踐高效可靠全自動開發。
3. **【企業級實戰導入】**
   用企業級實踐導入高規格，不只學會工具，更知道如何舉一反三完全客製化企業專案需求。
4. **【課程教學方式與物超所值】**
   這是一堂理論、實務跟實戰三者兼具的 SDD 線上課程，用工作坊級別的學習體驗，不是只是教概念，而是直接帶著做！

[了解更多課程內容說明](https://waterballs.tw/Ghl6O)

## 開源專案：AI x BDD

水球老師把這套 AI x BDD 的方法論做成開源 pipeline skill：把產品迭代寫成 Gherkin，再一路帶到 RED → GREEN → REFACTOR。

覺得有幫助，歡迎給它一顆 Star：

[![Star Waterball-Software-Academy/aixbdd](https://img.shields.io/github/stars/Waterball-Software-Academy/aixbdd?style=social)](https://github.com/Waterball-Software-Academy/aixbdd)

## 相關問題洽詢管道

1. [水球軟體學院 LINE 官方帳號](https://lin.ee/STIsOLZ)
2. 客服信箱：[support@waterballsa.tw](mailto:support@waterballsa.tw)
3. [水球軟體學院（社群）Discord](https://discord.gg/Ymjz7NmZXn)

---

© 2026 水球球特務有限公司版權所有，侵害必究。
