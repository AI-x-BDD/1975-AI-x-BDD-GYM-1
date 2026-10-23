# 方法與來源

核對日期：2026-10-23。這些是 TrunkBasedDevelopment.com 維護者的實務建議，不是 RFC 式 MUST 規範。

| 來源 | 方法與使用條件 |
| --- | --- |
| https://trunkbaseddevelopment.com/ | 共同主幹、避免長期開發分支；區分直接主幹與規模化短分支模式。 |
| https://trunkbaseddevelopment.com/short-lived-feature-branches/ | 幾天內整合，約兩天以上有長期化風險，包含審查等待。單一開發工作單位，非團隊共用的第二主幹。Agent 並行量與提交率也影響策略。 |
| https://trunkbaseddevelopment.com/continuous-integration/ | CI 是團隊頻繁整合到共同位置的習慣，不只是裝了 build server；至少每日整合的目標需要工程流程支持。 |
| https://trunkbaseddevelopment.com/committing-straight-to-the-trunk/ | 直接主幹依靠協調與快速可靠驗證；建置壞掉需快速修復或回復。並非每個專案都該跳過 PR。 |
| https://trunkbaseddevelopment.com/fast-green-builds/ | 整合前本地驗證與整合後 CI 同樣重要。慢建置減少可整合頻率，不能以停用檢查解決。 |
| https://trunkbaseddevelopment.com/feature-flags/ | 將程式整合和功能開放分離；測有意義的旗標組合。適合可隔離的新功能，代價是組合及清理成本。 |
| https://trunkbaseddevelopment.com/branch-by-abstraction/ | 抽象包住舊實作、加入新實作、切換並清理，支援跨多天的替換。代價是暫時雙實作及額外間接層。 |
| https://trunkbaseddevelopment.com/branch-for-release/ | 必要時延後切 release branch，避免繼續功能開發。修補應考量先在 trunk 修復再回補；直接 trunk 發布也是選項。 |

## Agent 延伸與權衡

授權檢查、保護髒工作目錄、紀錄命令與 SHA、旗標擁有者及移除條件都是本 Skill 的實務要求。不要宣稱來自網站的正式標準。

反模式：長期 feature branch、以 rebase 假裝縮短生命週期、測試只在分支執行、未完工程式影響預設路徑、永久 feature flag、跳過失敗 gate。若治理要求嚴格審查或 CI 不可靠，先改善切片、審查與驗證，不擅自改分支政策。
