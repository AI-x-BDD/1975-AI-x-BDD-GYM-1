# 規範與來源

核對日期：2026-10-23。以下為摘要，完整規範以來源為準。

## 官方 Conventional Commits 1.0.0

來源：https://www.conventionalcommits.org/en/v1.0.0/ （含 Specification 與 FAQ）

- MUST：以名詞 type 開頭，後接可選 scope、可選 `!`、冒號及空格、簡短 description。新增功能使用 feat，修 bug 使用 fix。
- MAY：scope、body、footer、其他 type。scope 若有，MUST 是括號中的程式區域名詞。body 和 footer 以空白行分隔前文，body 可有多段。
- Footer：token 後接 `: ` 或 ` #` 及值；token 的空白改為連字號，BREAKING CHANGE 例外。值可跨行，遇下一個有效 token/separator 才結束。
- Breaking MUST 用 prefix 的 `!` 或 footer 標示。`!` 緊接冒號前；若只用 `!`，description 須描述破壞性變更。Footer 使用大寫 `BREAKING CHANGE: 說明`；`BREAKING-CHANGE` 同義。其他語法單元不應被實作者視為大小寫敏感。
- FAQ 建議混合 type 時盡可能拆 commit；大小寫重點是一致，並非強制小寫。revert 行為交給工具決定，沒有固定版本推導規則。

## 規範強度

https://www.rfc-editor.org/rfc/rfc2119.txt

MUST 是必要；SHOULD 允許有充分理由的例外；MAY 是選擇。不要把 FAQ 建議或社群習慣改寫成 MUST。Conventional Commits 的 numbered specification 主要使用 MUST/MAY，沒有規定一套額外的強制 type 清單。

## 版本關係

https://semver.org/

Conventional Commits 對應 fix → PATCH、feat → MINOR、任何 type 的 breaking → MAJOR。SemVer 以公開 API 相容性為基礎；0.y.z 尚未承諾穩定 API。實際發版須核對 release 工具與專案政策，寫好 commit 不代表已發版，也不授權改版本或發布。

## Trailer 延伸

https://git-scm.com/docs/git-interpret-trailers

Git 的 trailer 工具可解析訊息末尾的 metadata，但其可配置解析規則不能替代 Conventional Commits 的 footer 規範。

## 本 Skill 的實務建議（非官方語法要求）

先讀 diff、保護使用者 staging、檢查敏感資料、跑相關測試、尊重操作授權；breaking 附遷移方式。常見 refactor、perf、docs、style、test、build、ci、chore、revert 可採用，需配合專案。祈使句、英文、72 字上限及 scope 必填都不是此官方規範的要求。
