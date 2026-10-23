# 框架與方法

核對日期：2026-10-23。以下為轉述，非原文複製。

## Design Council 原始框架

https://www.designcouncil.org.uk/resources/framework-for-innovation/

四階段是 Discover 理解受影響者及問題、Define 聚焦挑戰、Develop 探索不同答案、Deliver 小規模測試與改善。兩個鑽石都先發散再收斂；四個原則是以人為本、視覺且包容的溝通、協作共創、持續迭代。文化上的領導與參與也會影響成果。流程不是單向階段審查，早期原型可幫助理解問題，新發現可以使流程返回先前階段。

https://www.designcouncil.org.uk/resources/the-double-diamond/

這是通用設計流程的視覺表達，不綁定特定工具。不能把四階段當成每個任務都需完整文書作業的指令手冊。Design Council 提供的框架與圖示採 CC BY 4.0；此 Skill 為文字轉述與軟體應用延伸，未複製圖示。

https://www.designcouncil.org.uk/resources/systemic-design-framework/

延伸的 Systemic Design Framework 處理跨領域複雜議題，另有 Explore、Reframe、Create、Catalyse，以及關係、領導及持續旅程等周邊活動。它是相關延伸框架，不應冒稱為原始 Double Diamond 四階段。

## AI 軟體開發的建議工具（本 Skill 延伸，非官方指定清單）

| 階段 | 可選方法 | 可交付證據 | 適用與例外 |
| --- | --- | --- | --- |
| Discover | 規格/工單/程式閱讀、旅程圖；有資料時做訪談或觀察分析 | 事實與假設、痛點、證據來源 | 小修改僅需查看相關內容；無真實資料時保留未知 |
| Define | 問題陳述、範圍、Given/When/Then、風險盤點 | 可觀察成功條件 | 複雜需求釐清衝突；簡單修正一句即可 |
| Develop | 草圖、比較表、prototype、技術 spike | 方案取捨與驗證結果 | 有實質選擇才比較多方案；已選定且合理則直接實作 |
| Deliver | 小增量、回歸測試、可用性觀察、試行回饋 | 可檢查成果、通過/失敗、殘餘風險 | 高風險先模擬；單元測試不能代替使用者研究 |

例：結帳流失先確認實際卡點，再定義成功條件，比較減少欄位與改善錯誤提示，選小範圍試行。沒有實際轉換數據時，只能驗證技術行為，不能宣稱降低流失。

停止擴大分析的判準：下一步的重大未知已足夠處理、成功條件可驗、下一步可逆且有授權。這是 Agent 執行策略，不是 Design Council 規定的固定 gate。
