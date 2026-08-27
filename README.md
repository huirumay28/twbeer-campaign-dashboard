# Taiwan Beer · 專案成效分析 demo

Open-source mock of a campaign analytics page for [Taiwan Beer CRM](https://twbeer-crm-nest.pages.dev/).

This is a **UI proposal**, not the live admin. It redesigns the current 買台啤抽元大 0050 dashboard so you pick **one metric at a time** (YouTube Studio / GA style) instead of stacking eight overlapping series on one chart.

Live preview: https://huirumay28.github.io/twbeer-campaign-dashboard/

## What’s on the page

1. **每日成效** — click a KPI card; the chart shows only that series, with the right unit (人 / 次 / 罐). Toggle 日 / 週.
2. **消費者資訊** — gender donut (count + %), age bars (count + %), region 北中南東.
3. **登錄資訊** — one view at a time: 產品 / 通路 / 來源 / 時段.
4. **登錄金額** — bubble chart of spend × frequency × headcount.
5. **遊戲使用追蹤** — GA-style events table, sortable by clicks / users / clicks per user. Button names use `頁面_按鈕`.

Numbers are **示意數據**, anchored to the live campaign (進行中, 2026/08/19–09/29, +374 members, 7,381 登錄罐數, etc.).

## Run it locally

Open `index.html` in a browser, or:

```bash
python3 -m http.server 8080
```

Then visit http://localhost:8080

Single file. Noto Sans TC + Chart.js from CDN. No build step.

## License

MIT
