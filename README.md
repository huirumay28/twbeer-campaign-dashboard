# Taiwan Beer CRM · UI mock

靜態 HTML，無 build。給廠商對稿用的 UI 提案，不是 live admin。

Live CRM：https://twbeer-crm-nest.pages.dev/

---

## 這次請改：主頁（首頁）

請**只改這兩個檔**。其餘頁面是專案成效 mock，不是這次範圍。

| 檔案 | 頁面 | 預覽 |
|------|------|------|
| `dashboard.html` | 首頁。KPI、會員輪廓、當月成長曲線入口 | https://huirumay28.github.io/twbeer-campaign-dashboard/dashboard.html |
| `growth.html` | 可客製化成長曲線（從首頁點進去） | https://huirumay28.github.io/twbeer-campaign-dashboard/growth.html |

**不要開 repo 根目錄。** GitHub Pages 預設的 `index.html` 是 0050 專案成效頁，不是首頁。

### 主頁要長這樣

- **KPI 四張：** 好友總數、會員總數、活躍會員（有登錄發票的）、每月新增人數 + %
- **會員輪廓：** 三張獨立卡（不是 tab）— 男女比例、年齡分佈、如何進入台啤 LINE（IG / FB / 網頁）
- **當月成長曲線：** 首頁上的入口卡；點進去是 `growth.html`（自由選起始日/結束日，捷徑：近7日 / 近30日 / 本月 / 今年 / 全部；指標：好友數 或 綁定會員數；顆粒度：日 / 週 / 月）

數字是**示意數據**。設計 token：綠 `#007A49`、底 `#F1E8E1`、字體 Noto Sans TC。

本機預覽：

```bash
python3 -m http.server 8080
```

然後開 http://localhost:8080/dashboard.html

每個 HTML 自帶 CSS。Chart.js 走 CDN。沒有打包步驟。

---

## 其餘檔案（請不要改）

| 檔案 | 頁面 | 預覽 |
|------|------|------|
| `projects.html` | 專案成效分析總表 | https://huirumay28.github.io/twbeer-campaign-dashboard/projects.html |
| `brief.html` | 新增專案 briefing | https://huirumay28.github.io/twbeer-campaign-dashboard/brief.html |
| `index.html` | 買台啤抽元大 0050 成效 | https://huirumay28.github.io/twbeer-campaign-dashboard/ |
| `jiexian.html` | 真假傑憲大挑戰 成效 | https://huirumay28.github.io/twbeer-campaign-dashboard/jiexian.html |
| `tokyo.html` | 東京機票 成效 | https://huirumay28.github.io/twbeer-campaign-dashboard/tokyo.html |

`campaign.png` / `jiexian.png` / `tokyo.png` 是各專案 KV，主頁用不到。

---

## License

MIT
