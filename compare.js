const fmt = (n, d = 0) => Number(n).toLocaleString("zh-TW", { minimumFractionDigits: d, maximumFractionDigits: d });
function hexA(hex, a) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
  return "rgba(" + (n >> 16) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
}
function weekBuckets(arr) {
  const values = [];
  for (let i = 0; i < arr.length; ) {
    const chunk = arr.slice(i, i + 7);
    values.push(chunk.reduce((s, n) => s + n, 0));
    i += 7;
  }
  return values;
}

/* 0050 — live CRM 活動全程 2026/08/19–09/29（同步 09/22 16:26；KPI 訪客 2573／發票 7730 與日加總略差，照 CRM 卡片） */
const VIS_0050 = [185,42,40,117,67,150,47,35,16,127,96,77,75,77,171,109,93,71,57,191,80,46,42,89,60,34,36,82,45,45,20,22,23,78,18,0,0,0,0,0,0,0];
const BIND_0050 = [40,18,38,82,57,75,29,32,14,39,85,89,66,109,125,119,84,64,42,120,76,42,42,58,44,37,37,63,45,31,23,24,27,68,23,0,0,0,0,0,0,0];
const INV_0050 = [151,189,182,191,177,143,168,195,174,175,233,231,183,184,325,203,412,391,224,248,200,186,203,726,219,238,173,172,185,209,215,229,202,150,4,0,0,0,0,0,0,0];
const CAN_0050 = [1457,2167,1619,2344,1686,1086,1442,1352,2376,1379,1684,1810,1435,1884,2357,1371,7038,6183,2167,2832,1507,1298,1402,19172,2043,2213,1215,1189,1582,1653,1671,1561,1607,1217,5,0,0,0,0,0,0,0];

/* WBC／東京 — 結案 tokyo_brief：發票＝抽卡；罐數＝發票×4；人數列見週報 */
const WEEK_INV_TOKYO = [462,815,1067,1913,1221];
const INV_TOKYO = [32,30,32,35,35,30,36,27,29,29,32,29,28,25,33,50,57,59,50,53,49,64,57,55,49,57,52,46,56,61,75,64,65,68,65,74,67,88,69,64,68,84,67,76,73,129,144,128,108,133,133,136,150,115,109,106,133,140,123,126,63,63,85,83,71,74,84,78,76,65,60,79,59,78,67,59,77];
const WEEK_CAN_TOKYO = [1848,3260,4268,7652,4884];
const CAN_TOKYO = [128,120,128,140,140,120,144,108,116,116,128,116,112,100,132,200,228,236,200,212,196,256,228,220,196,228,208,184,224,244,300,256,260,272,260,296,268,352,276,256,272,336,268,304,292,516,576,512,432,532,532,544,600,460,436,424,532,560,492,504,252,252,340,332,284,296,336,312,304,260,240,316,236,312,268,236,308];
/* 週間數據比較 p-13：當週不重複登錄（五波合計 1,781＞全程不重複 1,472，跨週可重複） */
const WEEK_BIND_TOKYO = [170,322,443,544,302];
/* 同頁：登錄發票人數（週人次；≠有效發票筆數 WEEK_INV）— 比較頁無人數維度，僅備查 */
const WEEK_INV_PEOPLE_TOKYO = [609,1074,1406,2520,1608];

/* 傑憲 — 結案日數列（綁定）；進站僅有合計、無日曲線；無發票／罐數 */
const BIND_JIEXIAN = [980,3128,1911,105,34,15,42,416,138,190,96,48,81,24,71,5,8];

const SERIES_DIMS = [
  { key: "visits", label: "進站人數", where: "成效總覽", yUnit: "人" },
  { key: "binds", label: "新增綁定人數", where: "成效總覽", yUnit: "人" },
  { key: "invoices", label: "登錄發票張數", where: "成效總覽", yUnit: "張" },
  { key: "cans", label: "登錄罐數", where: "成效總覽", yUnit: "罐" }
];
const OTHER_DIMS = [
  { key: "gender", label: "男女比", where: "消費者" },
  { key: "channel", label: "通路", where: "登錄" },
  { key: "product", label: "產品種類", where: "登錄" }
];
const DIMS = SERIES_DIMS.concat(OTHER_DIMS);
const SNAPSHOT_KEYS = new Set(["gender", "channel", "product"]);
function isSnapshotDim(key) { return SNAPSHOT_KEYS.has(key); }
/** 人氣指標：區間合計分組長條（各檔一根），不用曲線。發票／罐數維持曲線。 */
const PEOPLE_BAR_KEYS = new Set(["visits", "binds"]);
const CURVE_KEYS = new Set(["invoices", "cans"]);

function hasDaily(s) { return !!(s && s.daily && s.daily.length); }
function hasWeekly(s) { return !!(s && s.weekly && s.weekly.length); }
function seriesOf(p, key) {
  const v = p[key];
  if (!v) return null;
  if (hasDaily(v) || hasWeekly(v)) return v;
  return null;
}
/** 日：僅真實日數列；週：優先結案週報，否則每 7 日加總日數列 */
function grainArr(s, grain) {
  if (!s) return null;
  if (grain === "week") {
    if (hasWeekly(s)) return s.weekly;
    if (hasDaily(s)) return weekBuckets(s.daily);
    return null;
  }
  return hasDaily(s) ? s.daily : null;
}
function maxSeriesLen(picks, key, grain) {
  let m = 0;
  picks.forEach(p => {
    const arr = grainArr(seriesOf(p, key), grain);
    if (arr) m = Math.max(m, arr.length);
  });
  return m;
}
function clampRange(maxN) {
  if (!maxN) { state.rangeFrom = 1; state.rangeTo = 1; return; }
  let from = state.rangeFrom || 1;
  let to = state.rangeTo == null ? maxN : state.rangeTo;
  from = Math.max(1, Math.min(from, maxN));
  to = Math.max(1, Math.min(to, maxN));
  if (from > to) { const t = from; from = to; to = t; }
  state.rangeFrom = from;
  state.rangeTo = to;
}
function sliceSeries(arr, from, to) {
  return arr.slice(from - 1, to);
}

const PROJECTS = [
  {
    id: "p0050",
    short: "0050",
    name: "買台啤抽元大0050等值現金",
    status: "進行中",
    statusKind: "live",
    fake: false,
    color: "#007A49",
    days: 42,
    lastSynced: "2026/09/22 16:26",
    href: "index.html",
    /* KPI 卡片（活動全程）：訪客 2573、發票 7730；日／週加總為 2563／7690，照 CRM 分記 */
    visits: { daily: VIS_0050, weekly: [648,503,772,389,251,0], unit: "人", kpiTotal: 2573 },
    binds: { daily: BIND_0050, weekly: [339,434,630,323,241,0], unit: "人", kpiTotal: 1967 },
    invoices: { daily: INV_0050, weekly: [1201,1375,2003,1917,1194,0], unit: "張", kpiTotal: 7730 },
    cans: { daily: CAN_0050, weekly: [11801,11920,23455,28532,9296,0], unit: "罐", kpiTotal: 85004 },
    gender: {
      total: 2573, unit: "人",
      items: [
        { label: "男", n: 1380, pct: 53.6, color: "#007A49" },
        { label: "女", n: 871, pct: 33.9, color: "#5CB88A" },
        { label: "未揭露", n: 322, pct: 12.5, color: "#E0B34E" }
      ]
    },
    /* 0050 通路：合格發票通路登錄次數合計 7695（CRM 同步 2026/09/22 16:26） */
    channel: {
      labels: ["全家", "7-ELEVEN", "其他通路", "全聯", "美廉社", "萊爾富", "家樂福", "好市多"],
      data: [2089, 1996, 1343, 1329, 749, 134, 45, 10],
      unit: "次"
    },
    product: { labels: ["金牌","金牌 ONE","經典","雲泡","爽啤","18天","其他"], data: [55298,12325,9917,2311,2270,2147,830], unit: "罐" }
  },
  {
    id: "jiexian",
    short: "傑憲",
    name: "真假傑憲大挑戰",
    status: "已結束",
    statusKind: "done",
    fake: false,
    color: "#E0B34E",
    days: 17,
    href: "jiexian.html",
    /* 結案：進站 21,000 僅合計；綁定有日數列；非發票活動 */
    visitsTotal: 21000,
    visits: null,
    binds: { daily: BIND_JIEXIAN, weekly: weekBuckets(BIND_JIEXIAN), unit: "人" },
    invoices: null,
    cans: null,
    gender: null,
    channel: null,
    product: null
  },
  {
    id: "tokyo",
    short: "WBC",
    name: "成就經典｜喝台啤抽東京雙人來回機票",
    status: "已結束",
    statusKind: "done",
    fake: false,
    color: "#2B6CB0",
    days: 77,
    href: "tokyo.html",
    /* 進站僅合計；不重複登錄有週數列（無日）；發票＝抽卡；罐數＝發票×4 */
    visitsTotal: 27148,
    bindsTotal: 1472,
    visits: null,
    binds: { daily: [], weekly: WEEK_BIND_TOKYO, unit: "人", label: "不重複登錄（當週）" },
    invoices: { daily: INV_TOKYO, weekly: WEEK_INV_TOKYO, unit: "張", label: "抽卡／有效發票" },
    cans: { daily: CAN_TOKYO, weekly: WEEK_CAN_TOKYO, unit: "罐" },
    gender: null,
    channel: { labels: ["7-ELEVEN","全聯","全家","美聯社","萊爾富","其他"], data: [1612,1320,936,508,248,740], unit: "筆" },
    product: null
  }
];

const state = { selected: new Set(PROJECTS.map(p => p.id)), dim: "visits", grain: "day", rangeFrom: 1, rangeTo: null, autoGrain: true };
const charts = [];
function killCharts() {
  while (charts.length) {
    const c = charts.pop();
    try { c.destroy(); } catch (e) {}
  }
}
function selectedProjects() { return PROJECTS.filter(p => state.selected.has(p.id)); }
function barColors(hex, n) {
  return Array.from({ length: n }, (_, i) => i === 0 ? hex : hexA(hex, Math.max(0.28, 0.85 - i * 0.12)));
}
const barLabelPlugin = {
  id: "barLabel",
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    ctx.save();
    ctx.fillStyle = "#6F6A64";
    ctx.font = "600 11px Noto Sans TC";
    ctx.textBaseline = "middle";
    meta.data.forEach((bar, i) => {
      const v = chart.data.datasets[0].data[i];
      ctx.textAlign = "left";
      ctx.fillText(fmt(v), bar.x + 8, bar.y);
    });
    ctx.restore();
  }
};

function renderPicks() {
  document.getElementById("projectPicks").innerHTML = PROJECTS.map(p =>
    '<label class="camp-pick">' +
      '<input type="checkbox"' + (state.selected.has(p.id) ? " checked" : "") + ' data-id="' + p.id + '">' +
      '<i class="swatch" style="background:' + p.color + '"></i>' +
      '<span class="lab"><b>' + p.short + "</b><span class=\"name\">" + p.name + "</span>" +
      '<span class="status ' + p.statusKind + '">' + p.status + "</span>" +
      (p.fake ? '<span class="fake-pill">示意</span>' : "") +
      "</span></label>"
  ).join("");
  document.getElementById("projectPicks").querySelectorAll("input").forEach(inp => {
    inp.addEventListener("change", () => {
      if (inp.checked) state.selected.add(inp.dataset.id);
      else state.selected.delete(inp.dataset.id);
      render();
    });
  });
  document.getElementById("dimPicks").innerHTML = DIMS.map(d =>
    '<button type="button" class="chip' + (d.key === state.dim ? " on" : "") + '" data-dim="' + d.key + '" role="tab" aria-selected="' + (d.key === state.dim) + '">' + d.label + "</button>"
  ).join("");
  document.getElementById("dimPicks").querySelectorAll(".chip").forEach(btn => {
    btn.addEventListener("click", () => { state.dim = btn.dataset.dim; state.rangeFrom = 1; state.rangeTo = null; state.autoGrain = true; render(); });
  });
}
function emptyCard(p, dimLabel, key, reason) {
  const s = p[key];
  let title = "無日曲線";
  let note = "此專案結案／成效沒有「" + dimLabel + "」日數列，無法畫曲線。";
  if (reason === "weekly-only") {
    title = "僅有週數列";
    note = "結案僅有「" + dimLabel + "」週報五波，請切換上方「週」檢視。" +
      (key === "binds" && p.bindsTotal ? " 全程不重複合計 " + fmt(p.bindsTotal) + " 人。" : "");
  } else if (key === "visits" && p.visitsTotal) {
    note = "結案僅有合計 " + fmt(p.visitsTotal) + " 人，無日／週數列。";
  } else if (key === "binds" && p.bindsTotal && !hasWeekly(s)) {
    note = "結案僅有合計 " + fmt(p.bindsTotal) + " 人，無日數列。";
  }
  return '<article class="mini">' +
    '<div class="mini-h"><h3><i class="swatch" style="background:' + p.color + '"></i>' + p.short + "</h3>" +
    '<span class="status ' + p.statusKind + '">' + p.status + "</span></div>" +
    '<div class="empty"><div>' + title + "</div><small>" + note + "</small></div></article>";
}
/**
 * 進站／綁定圖表決策（2026-09-22）：
 * 「用長條圖比較」→ 各檔一根長條 = 選定活動區間加總（或全檔合計）。
 * 理由：0050 有日／週數列、WBC／傑憲常只有合計或週報，時間序列對不齊；
 * 區間合計最利於跨檔比人數。有數列者依 range slider 加總；僅有合計者僅在
 * 「全部」區間顯示合計，局部區間則留空並註記。發票／罐數仍用曲線。
 */
function isFullRange(from, to, maxN) {
  return !maxN || (from === 1 && to === maxN);
}
function peopleRangeValue(p, key, grain, from, to, maxN) {
  const s = seriesOf(p, key);
  const arr = grainArr(s, grain);
  if (arr && arr.length) {
    const sliced = sliceSeries(arr, from, Math.min(to, arr.length));
    if (from > arr.length) return { kind: "short", value: null };
    let value = sliced.reduce((a, b) => a + b, 0);
    if (isFullRange(from, to, maxN) && s.kpiTotal != null) value = s.kpiTotal;
    return { kind: "series", value, unit: s.unit, metric: s.label };
  }
  const total = key === "visits" ? p.visitsTotal : (key === "binds" ? p.bindsTotal : null);
  if (total != null) {
    if (isFullRange(from, to, maxN)) {
      return { kind: "total", value: total, unit: "人", metric: null };
    }
    return { kind: "partial-total", value: null, unit: "人", total };
  }
  return { kind: "missing", value: null };
}
const peopleBarLabelPlugin = {
  id: "peopleBarLabel",
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    ctx.save();
    ctx.fillStyle = "#1C1C1C";
    ctx.font = "700 12px Noto Sans TC";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    meta.data.forEach((bar, i) => {
      const v = chart.data.datasets[0].data[i];
      if (v == null) return;
      ctx.fillText(fmt(v), bar.x, bar.y - 6);
    });
    ctx.restore();
  }
};

function bindRangeControls(unitWord) {
  const fromEl = document.getElementById("rangeFrom");
  const toEl = document.getElementById("rangeTo");
  const fillEl = document.getElementById("rangeFill");
  const readout = document.getElementById("rangeReadout");
  function paintRangeUI() {
    if (!fromEl || !toEl) return;
    const max = Number(fromEl.max);
    let a = Number(fromEl.value), b = Number(toEl.value);
    if (a > b) { const t = a; a = b; b = t; }
    const left = ((a - 1) / Math.max(1, max - 1)) * 100;
    const right = ((b - 1) / Math.max(1, max - 1)) * 100;
    if (fillEl) {
      fillEl.style.left = left + "%";
      fillEl.style.width = Math.max(0, right - left) + "%";
    }
    if (readout) {
      readout.innerHTML = "第 <b>" + a + "</b>–<b>" + b + "</b> " + unitWord +
        "（共 " + (b - a + 1) + " " + unitWord + "）";
    }
  }
  function onRangeInput(which) {
    let a = Number(fromEl.value), b = Number(toEl.value);
    if (which === "from" && a > b) a = b;
    if (which === "to" && b < a) b = a;
    fromEl.value = a;
    toEl.value = b;
    state.rangeFrom = a;
    state.rangeTo = b;
    paintRangeUI();
  }
  function commitRange() {
    state.rangeFrom = Math.min(Number(fromEl.value), Number(toEl.value));
    state.rangeTo = Math.max(Number(fromEl.value), Number(toEl.value));
    render();
  }
  if (fromEl && toEl) {
    paintRangeUI();
    fromEl.addEventListener("input", () => onRangeInput("from"));
    toEl.addEventListener("input", () => onRangeInput("to"));
    fromEl.addEventListener("change", commitRange);
    toEl.addEventListener("change", commitRange);
  }
  const resetBtn = document.getElementById("rangeReset");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      state.rangeFrom = 1;
      state.rangeTo = null;
      render();
    });
  }
}

function renderPeopleBars(picks, dim) {
  const key = dim.key;
  const dimLabel = dim.label;
  const withAny = picks.filter(p => seriesOf(p, key) || (key === "visits" && p.visitsTotal) || (key === "binds" && p.bindsTotal));
  const weeklyOnly = withAny.filter(p => {
    const s = p[key];
    return s && hasWeekly(s) && !hasDaily(s);
  });
  const onlyWeeklyAvail = withAny.some(p => seriesOf(p, key)) &&
    withAny.filter(p => seriesOf(p, key)).every(p => !hasDaily(p[key]));
  if (onlyWeeklyAvail) state.grain = "week";
  else if (state.autoGrain && weeklyOnly.length) state.grain = "week";
  state.autoGrain = false;
  const grain = state.grain;
  const withSeries = picks.filter(p => grainArr(seriesOf(p, key), grain));
  const maxN = maxSeriesLen(withSeries, key, grain);
  if (maxN) {
    if (state.rangeTo == null || state.rangeTo > maxN) state.rangeTo = maxN;
    clampRange(maxN);
  } else {
    state.rangeFrom = 1;
    state.rangeTo = 1;
  }
  const from = state.rangeFrom;
  const to = maxN ? state.rangeTo : 1;
  const unitWord = grain === "day" ? "天" : "週";
  const full = isFullRange(from, to, maxN);
  const values = picks.map(p => peopleRangeValue(p, key, grain, from, to, maxN));
  const chartable = picks.filter((_, i) => values[i].value != null);
  const missing = picks.filter((_, i) => values[i].value == null);

  const legend = picks.map(p =>
    "<span><i style=\"background:" + p.color + "\"></i>" + p.short + (p.fake ? " · 示意" : "") + "</span>"
  ).join("");
  let html = '<div class="toolbar">' +
    '<div class="hint"><b>比較說明</b>　各檔一根長條＝選定活動區間「' + dimLabel + '」加總' +
    (full ? "（目前為全部區間）" : "（第 " + from + "–" + to + " " + unitWord + "）") +
    '。僅有合計、無數列的檔案只在「全部」時顯示合計。' +
    (legend ? '<div class="legend-row" style="margin-top:8px">' + legend + "</div>" : "") +
    "</div>";
  if (withSeries.length) {
    html += '<div class="seg" role="tablist" aria-label="粒度">' +
      '<button type="button" data-grain="day"' + (grain === "day" ? ' class="on"' : "") + ">日</button>" +
      '<button type="button" data-grain="week"' + (grain === "week" ? ' class="on"' : "") + ">週</button>" +
    "</div>";
  }
  html += "</div>";

  if (withSeries.length && maxN) {
    html += '<div class="range-panel" aria-label="活動區間">' +
      '<div class="range-head">' +
        '<span class="range-title">活動區間（加總範圍）</span>' +
        '<span class="range-readout" id="rangeReadout">第 <b>' + from + "</b>–<b>" + to + "</b> " + unitWord +
        "（共 " + (to - from + 1) + " " + unitWord + "）</span>" +
        '<button type="button" class="range-reset" id="rangeReset">全部</button>' +
      "</div>" +
      '<div class="range-slider" data-max="' + maxN + '">' +
        '<div class="range-track"><div class="range-fill" id="rangeFill"></div></div>' +
        '<input type="range" id="rangeFrom" min="1" max="' + maxN + '" value="' + from + '" aria-label="起始' + unitWord + '">' +
        '<input type="range" id="rangeTo" min="1" max="' + maxN + '" value="' + to + '" aria-label="結束' + unitWord + '">' +
      "</div>" +
      '<div class="range-ends"><span>第 1 ' + unitWord + '</span><span>第 ' + maxN + ' ' + unitWord + '</span></div>' +
    "</div>";
  }

  if (chartable.length) {
    html += '<div class="chart-wrap"><canvas id="cmpPeopleBars"></canvas></div>';
    html += '<div class="chart-foot"><div class="sums">' +
      chartable.map(p => {
        const i = picks.indexOf(p);
        const info = values[i];
        const metric = info.metric || dimLabel;
        const tag = info.kind === "total" ? "全程合計" : "區間加總";
        return '<span class="sum-item"><i style="background:' + p.color + '"></i>' + p.short +
          " · " + metric + "（" + tag + "）<strong>" + fmt(info.value) + "</strong> " + (info.unit || "人") + "</span>";
      }).join("") +
      '</div><p class="axis-note">橫軸為專案；長條高度＝選定區間人數加總（非整條時間曲線）。' +
      (grain === "week" && withSeries.length ? "週切：有日數列者每 7 日一桶；WBC 綁定為結案五波週報。" : "") +
      "</p></div>";
  }

  if (missing.length) {
    html += '<div class="mini-grid cols-' + Math.min(3, missing.length) + '" style="margin-top:16px">' +
      missing.map(p => {
        const i = picks.indexOf(p);
        const info = values[i];
        if (info.kind === "partial-total") {
          return '<article class="mini">' +
            '<div class="mini-h"><h3><i class="swatch" style="background:' + p.color + '"></i>' + p.short + "</h3>" +
            '<span class="status ' + p.statusKind + '">' + p.status + "</span></div>" +
            '<div class="empty"><div>僅有全程合計</div><small>結案合計 ' + fmt(info.total) +
            " 人，無日／週數列可切區間。請按「全部」才顯示長條。</small></div></article>";
        }
        if (info.kind === "short") {
          return '<article class="mini">' +
            '<div class="mini-h"><h3><i class="swatch" style="background:' + p.color + '"></i>' + p.short + "</h3>" +
            '<span class="status ' + p.statusKind + '">' + p.status + "</span></div>" +
            '<div class="empty"><div>檔期較短</div><small>此檔活動' + unitWord + "數少於選定起始，區間內無資料。</small></div></article>";
        }
        const reason = (grain === "day" && p[key] && hasWeekly(p[key]) && !hasDaily(p[key])) ? "weekly-only" : "";
        return emptyCard(p, dimLabel, key, reason);
      }).join("") + "</div>";
  }

  if (!chartable.length && !missing.length) {
    html += '<div class="empty page-empty"><div>無可比較數據</div><small>所選專案皆無「' + dimLabel + '」。</small></div>';
  }

  document.getElementById("resultsBody").innerHTML = html;
  document.querySelectorAll("#resultsBody [data-grain]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.grain = btn.dataset.grain;
      state.rangeFrom = 1;
      state.rangeTo = null;
      render();
    });
  });
  bindRangeControls(unitWord);
  if (!chartable.length) return;

  const yUnit = dim.yUnit || "人";
  charts.push(new Chart(document.getElementById("cmpPeopleBars"), {
    type: "bar",
    data: {
      labels: chartable.map(p => p.short),
      datasets: [{
        label: dimLabel,
        data: chartable.map(p => values[picks.indexOf(p)].value),
        backgroundColor: chartable.map(p => p.color),
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.55,
        categoryPercentage: 0.7,
        unit: yUnit
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1C1C1C",
          titleFont: { family: "Noto Sans TC", size: 12 },
          bodyFont: { family: "Noto Sans TC", size: 13, weight: "600" },
          padding: 10,
          callbacks: {
            title: (items) => items[0].label,
            label: (x) => " " + dimLabel + "  " + fmt(x.raw) + " " + yUnit
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: "Noto Sans TC", size: 13, weight: "600" }, color: "#1C1C1C" },
          border: { color: "#E4DBD2" },
          title: { display: true, text: "專案", color: "#6F6A64", font: { family: "Noto Sans TC", size: 11 } }
        },
        y: {
          beginAtZero: true, grace: "18%",
          ticks: { font: { family: "Noto Sans TC", size: 11 }, color: "#6F6A64", callback: v => fmt(v) },
          grid: { color: "rgba(228,219,210,.9)" }, border: { display: false },
          title: { display: true, text: yUnit, color: "#6F6A64", font: { family: "Noto Sans TC", size: 11 } }
        }
      }
    },
    plugins: [peopleBarLabelPlugin]
  }));
}

function lineFill(hex) {
  return (c) => {
    const g = c.chart.ctx, area = c.chart.chartArea;
    if (!area) return hexA(hex, .15);
    const gr = g.createLinearGradient(0, area.top, 0, area.bottom);
    gr.addColorStop(0, hexA(hex, .28));
    gr.addColorStop(1, hexA(hex, .02));
    return gr;
  };
}

function renderSeries(picks, dim) {
  const key = dim.key;
  const dimLabel = dim.label;
  const withAny = picks.filter(p => seriesOf(p, key));
  const weeklyOnly = withAny.filter(p => hasWeekly(p[key]) && !hasDaily(p[key]));
  const onlyWeeklyAvail = withAny.length > 0 && withAny.every(p => !hasDaily(p[key]));
  if (onlyWeeklyAvail) state.grain = "week";
  else if (state.autoGrain && weeklyOnly.length) state.grain = "week";
  state.autoGrain = false;
  const grain = state.grain;
  const withData = withAny.filter(p => grainArr(p[key], grain));
  const missing = picks.filter(p => !withData.includes(p));
  const maxN = maxSeriesLen(withData, key, grain);
  if (state.rangeTo == null || state.rangeTo > maxN) state.rangeTo = maxN || 1;
  clampRange(maxN || 1);
  const from = state.rangeFrom;
  const to = state.rangeTo;
  const unitWord = grain === "day" ? "天" : "週";
  const axis = grain === "day" ? "活動第 N 天" : "活動第 N 週";
  const labels = Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => String(from + i));
  const legend = withData.map(p =>
    "<span><i style=\"background:" + p.color + "\"></i>" + p.short + (p.fake ? " · 示意" : "") + "</span>"
  ).join("");
  let html = '<div class="toolbar">' +
    '<div class="hint"><b>數列說明</b>　' + axis + " · 「" + dimLabel + "」各檔自己的" + (grain === "day" ? "日" : "週") + "數列" +
    (key === "invoices" ? "（WBC＝抽卡／有效發票登錄）" : "") +
    (key === "cans" ? "（WBC 罐數＝發票×4 推估）" : "") +
    (legend ? '<div class="legend-row" style="margin-top:8px">' + legend + "</div>" : "") +
    "</div>" +
    '<div class="seg" role="tablist" aria-label="粒度">' +
      '<button type="button" data-grain="day"' + (grain === "day" ? ' class="on"' : "") + ">日</button>" +
      '<button type="button" data-grain="week"' + (grain === "week" ? ' class="on"' : "") + ">週</button>" +
    "</div></div>";

  if (withData.length && maxN) {
    html += '<div class="range-panel" aria-label="活動區間">' +
      '<div class="range-head">' +
        '<span class="range-title">活動區間</span>' +
        '<span class="range-readout" id="rangeReadout">第 <b>' + from + "</b>–<b>" + to + "</b> " + unitWord +
        "（共 " + (to - from + 1) + " " + unitWord + "）</span>" +
        '<button type="button" class="range-reset" id="rangeReset">全部</button>' +
      "</div>" +
      '<div class="range-slider" data-max="' + maxN + '">' +
        '<div class="range-track"><div class="range-fill" id="rangeFill"></div></div>' +
        '<input type="range" id="rangeFrom" min="1" max="' + maxN + '" value="' + from + '" aria-label="起始' + unitWord + '">' +
        '<input type="range" id="rangeTo" min="1" max="' + maxN + '" value="' + to + '" aria-label="結束' + unitWord + '">' +
      "</div>" +
      '<div class="range-ends"><span>第 1 ' + unitWord + '</span><span>第 ' + maxN + ' ' + unitWord + '</span></div>' +
    "</div>";
  }

  if (withData.length) {
    html += '<div class="chart-wrap"><canvas id="cmpLine"></canvas></div>';
    html += '<div class="chart-foot"><div class="sums">' +
      withData.map(p => {
        const full = grainArr(p[key], grain);
        const arr = sliceSeries(full, from, to);
        const metric = (p[key].label || dimLabel);
        let shown = arr.length ? arr.reduce((a, b) => a + b, 0) : 0;
        if (isFullRange(from, to, maxN) && p[key].kpiTotal != null) shown = p[key].kpiTotal;
        return '<span class="sum-item"><i style="background:' + p.color + '"></i>' + p.short +
          " · " + metric + "（區間）<strong>" + fmt(shown) + "</strong> " + p[key].unit +
          (full.length < from ? " · 此檔期較短" : "") + "</span>";
      }).join("") +
      '</div><p class="axis-note">橫軸是' + axis + "，以各檔活動第 1 " + unitWord + "為起點對齊；檔期較短的專案在超出" + unitWord + "數處無點。" +
      (grain === "week" ? "週切：0050／傑憲每 7 日一桶；WBC 人／發票為結案五波週報（波次長短不一，不重切 7 日）。" : "") +
      "</p></div>";
  }
  if (missing.length) {
    html += '<div class="mini-grid cols-' + Math.min(3, missing.length) + '" style="margin-top:16px">' +
      missing.map(p => {
        const reason = (grain === "day" && hasWeekly(p[key]) && !hasDaily(p[key])) ? "weekly-only" : "";
        return emptyCard(p, dimLabel, key, reason);
      }).join("") + "</div>";
  }
  document.getElementById("resultsBody").innerHTML = html;
  document.querySelectorAll("#resultsBody [data-grain]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.grain = btn.dataset.grain;
      state.rangeFrom = 1;
      state.rangeTo = null;
      render();
    });
  });
  bindRangeControls(unitWord);
  if (!withData.length) return;
  const pointR = labels.length > 20 ? 2.5 : 4;
  const yUnit = dim.yUnit || (withData[0][key].unit);
  charts.push(new Chart(document.getElementById("cmpLine"), {
    type: "line",
    data: {
      labels,
      datasets: withData.map(p => {
        const full = grainArr(p[key], grain);
        const padded = [];
        for (let d = from; d <= to; d++) {
          padded.push(d <= full.length ? full[d - 1] : null);
        }
        return {
          label: p.short, data: padded, unit: p[key].unit,
          borderColor: p.color, backgroundColor: lineFill(p.color),
          fill: true, tension: 0.25, borderWidth: 2.2,
          pointRadius: pointR, pointHoverRadius: 6,
          pointBackgroundColor: "#fff", pointBorderColor: p.color,
          pointBorderWidth: 2, pointHoverBackgroundColor: p.color, spanGaps: false
        };
      })
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1C1C1C",
          titleFont: { family: "Noto Sans TC", size: 12 },
          bodyFont: { family: "Noto Sans TC", size: 13, weight: "600" },
          padding: 10,
          filter: (x) => x.raw != null,
          callbacks: {
            title: (items) => axis.replace("N", items[0].label),
            label: (x) => " " + x.dataset.label + "  " + fmt(x.raw) + " " + x.dataset.unit
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: "Noto Sans TC", size: 10 }, color: "#6F6A64", autoSkip: true, maxTicksLimit: 10, maxRotation: 0 },
          border: { color: "#E4DBD2" },
          title: { display: true, text: axis, color: "#6F6A64", font: { family: "Noto Sans TC", size: 11 } }
        },
        y: {
          beginAtZero: true, grace: "8%",
          ticks: { font: { family: "Noto Sans TC", size: 11 }, color: "#6F6A64", callback: v => fmt(v) },
          grid: { color: "rgba(228,219,210,.9)" }, border: { display: false },
          title: { display: true, text: yUnit, color: "#6F6A64", font: { family: "Noto Sans TC", size: 11 } }
        }
      }
    }
  }));
}


function renderGender(picks) {
  const dimLabel = "男女比";
  const cols = Math.min(3, Math.max(1, picks.length));
  document.getElementById("resultsBody").innerHTML =
    '<div class="toolbar"><div class="hint"><b>活動全程快照</b>　男女比為 CRM 消費者檔案全程統計，不受活動區間篩選影響。</div></div>' +
    '<div class="mini-grid cols-' + cols + '">' +
    picks.map((p, i) => {
      if (!p.gender) return emptyCard(p, dimLabel, "gender");
      return '<article class="mini">' +
        '<div class="mini-h"><h3><i class="swatch" style="background:' + p.color + '"></i>' + p.short +
        (p.fake ? ' <span class="fake-pill">示意</span>' : "") + "</h3>" +
        '<span class="status ' + p.statusKind + '">' + p.status + "</span></div>" +
        '<div class="donut-box"><canvas id="g' + i + '" width="148" height="148"></canvas>' +
        '<ul class="legend" id="gl' + i + '"></ul></div></article>';
    }).join("") + "</div>";
  picks.forEach((p, i) => {
    if (!p.gender) return;
    document.getElementById("gl" + i).innerHTML = p.gender.items.map(g =>
      '<li><i class="dot" style="background:' + g.color + '"></i><span>' + g.label +
      '</span><span class="pct">' + g.pct.toFixed(1) + '%</span><span class="cnt">' + fmt(g.n) + " " + p.gender.unit + "</span></li>"
    ).join("");
    const total = p.gender.total;
    charts.push(new Chart(document.getElementById("g" + i), {
      type: "doughnut",
      data: {
        labels: p.gender.items.map(g => g.label),
        datasets: [{ data: p.gender.items.map(g => g.n), backgroundColor: p.gender.items.map(g => g.color), borderWidth: 0, hoverOffset: 4 }]
      },
      options: {
        responsive: false, cutout: "68%",
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#1C1C1C",
            callbacks: { label: (x) => " " + x.label + "  " + fmt(x.raw) + " " + p.gender.unit + "（" + p.gender.items[x.dataIndex].pct.toFixed(1) + "%）" }
          }
        }
      },
      plugins: [{
        id: "hole" + i,
        afterDraw(chart) {
          const meta = chart.getDatasetMeta(0);
          if (!meta.data[0]) return;
          const { x, y } = meta.data[0];
          const ctx = chart.ctx;
          ctx.save();
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#1C1C1C";
          ctx.font = "700 20px Noto Sans TC";
          ctx.fillText(fmt(total), x, y - 8);
          ctx.fillStyle = "#6F6A64";
          ctx.font = "500 11px Noto Sans TC";
          ctx.fillText("總數", x, y + 12);
          ctx.restore();
        }
      }]
    }));
  });
}
function renderBars(picks, key, dimLabel) {
  const cols = Math.min(3, Math.max(1, picks.length));
  document.getElementById("resultsBody").innerHTML =
    '<div class="toolbar"><div class="hint"><b>活動全程快照</b>　' + dimLabel + '為 CRM 登錄活動全程統計，不受活動區間篩選影響。</div></div>' +
    '<div class="mini-grid cols-' + cols + '">' +
    picks.map((p, i) => {
      const v = p[key];
      if (!v || !v.data) return emptyCard(p, dimLabel, key);
      return '<article class="mini">' +
        '<div class="mini-h"><h3><i class="swatch" style="background:' + p.color + '"></i>' + p.short +
        (p.fake ? ' <span class="fake-pill">示意</span>' : "") + "</h3>" +
        '<span style="font-size:12px;color:var(--muted)">合計 <b style="color:var(--green)">' +
        fmt(v.data.reduce((a, b) => a + b, 0)) + "</b> " + v.unit + "</span></div>" +
        '<div class="hbar" style="height:' + Math.max(220, v.labels.length * 42) + 'px"><canvas id="b' + i + '"></canvas></div></article>';
    }).join("") + "</div>";
  picks.forEach((p, i) => {
    const v = p[key];
    if (!v || !v.data) return;
    charts.push(new Chart(document.getElementById("b" + i), {
      type: "bar",
      data: {
        labels: v.labels,
        datasets: [{
          data: v.data,
          backgroundColor: barColors(p.color, v.data.length),
          borderRadius: 4, borderSkipped: false, barPercentage: 0.62, categoryPercentage: 0.78
        }]
      },
      options: {
        indexAxis: "y",
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: "#1C1C1C", callbacks: { label: (x) => " " + fmt(x.raw) + " " + v.unit } }
        },
        scales: {
          x: {
            beginAtZero: true, grace: "18%",
            grid: { color: "rgba(228,219,210,.9)", drawBorder: false },
            ticks: { font: { family: "Noto Sans TC", size: 11 }, color: "#6F6A64", callback: (val) => (typeof val === "number" ? fmt(val) : val) },
            border: { color: "#E4DBD2" },
            title: { display: true, text: v.unit, color: "#6F6A64", font: { family: "Noto Sans TC", size: 11 } }
          },
          y: {
            beginAtZero: true,
            grid: { color: "transparent", drawBorder: false },
            ticks: { font: { family: "Noto Sans TC", size: 12 }, color: "#1C1C1C" },
            border: { display: false }
          }
        }
      },
      plugins: [barLabelPlugin]
    }));
  });
}

function render() {
  killCharts();
  renderPicks();
  const dim = DIMS.find(d => d.key === state.dim);
  const isPeople = PEOPLE_BAR_KEYS.has(state.dim);
  const isCurve = CURVE_KEYS.has(state.dim);
  const isSnapshot = isSnapshotDim(state.dim);
  const isSeries = isPeople || isCurve;
  if (isSnapshot) {
    // Snapshot dimensions are campaign-total CRM data; never carry a time range into them.
    state.rangeFrom = 1;
    state.rangeTo = null;
  }
  let sub;
  if (isPeople) sub = " · 區間合計長條比較";
  else if (isCurve) sub = " · 活動第 N " + (state.grain === "week" ? "週" : "天");
  else if (isSnapshot) sub = " · 活動全程快照（不受區間影響）";
  else sub = " · 各檔小倍數";
  document.getElementById("resultsTitle").innerHTML = dim.label + '<span class="sub">' + dim.where + sub + "</span>";
  const picks = selectedProjects();
  if (!picks.length) {
    document.getElementById("resultsBody").innerHTML =
      '<div class="empty page-empty"><div>請至少選擇一個專案</div><small>取消勾選後會立刻重繪；需保留至少一檔才能比較。</small></div>';
    return;
  }
  if (isPeople) renderPeopleBars(picks, dim);
  else if (isCurve) renderSeries(picks, dim);
  else if (state.dim === "gender") renderGender(picks);
  else if (state.dim === "channel") renderBars(picks, "channel", "通路");
  else if (state.dim === "product") renderBars(picks, "product", "產品種類");
}
render();
