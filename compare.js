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

/* 0050 — from index.html METRICS (will refresh from live CRM) */
const VIS_0050 = [26,32,38,51,64,179,96,83,71,47,53,48,34,30,28,27,27,38,41,35,39,43,46,49,61,61,50,48,45,41,36,42,37,24,21,20,20,21,34,37,31,35,39,42,44];
const BIND_0050 = [36,45,53,71,89,249,134,116,97,66,71,65,47,42,38,37,37,51,55,48,53,59,64,68,83,83,70,67,62,57,50,55,49,32,28,27,27,29,44,49,43,48,54,58,61];
const INV_0050 = [16,20,24,33,41,114,61,53,45,30,34,31,21,19,17,17,17,25,27,22,24,27,29,31,39,39,32,31,28,26,23,27,24,15,13,12,12,13,22,24,20,22,25,26,28];
const CAN_0050 = [295,369,443,590,738,2066,1107,959,814,536,573,519,381,341,313,300,303,410,440,390,435,480,521,554,664,670,570,546,508,461,408,444,395,264,235,220,221,237,356,395,349,395,437,470,492];

/* WBC／東京 — 結案：發票＝抽卡；罐數＝發票×4 */
const WEEK_INV_TOKYO = [462,815,1067,1913,1221];
const INV_TOKYO = [32,30,32,35,35,30,36,27,29,29,32,29,28,25,33,50,57,59,50,53,49,64,57,55,49,57,52,46,56,61,75,64,65,68,65,74,67,88,69,64,68,84,67,76,73,129,144,128,108,133,133,136,150,115,109,106,133,140,123,126,63,63,85,83,71,74,84,78,76,65,60,79,59,78,67,59,77];
const WEEK_CAN_TOKYO = [1848,3260,4268,7652,4884];
const CAN_TOKYO = [128,120,128,140,140,120,144,108,116,116,128,116,112,100,132,200,228,236,200,212,196,256,228,220,196,228,208,184,224,244,300,256,260,272,260,296,268,352,276,256,272,336,268,304,292,516,576,512,432,532,532,544,600,460,436,424,532,560,492,504,252,252,340,332,284,296,336,312,304,260,240,316,236,312,268,236,308];

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

function seriesOf(p, key) {
  const v = p[key];
  if (!v || !v.daily || !v.daily.length) return null;
  return v;
}

function maxSeriesLen(picks, key, grain) {
  let m = 0;
  picks.forEach(p => {
    const s = seriesOf(p, key);
    if (!s) return;
    const arr = grain === "day" ? s.daily : s.weekly;
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
    days: 45,
    href: "index.html",
    visits: { daily: VIS_0050, weekly: weekBuckets(VIS_0050), unit: "人" },
    binds: { daily: BIND_0050, weekly: weekBuckets(BIND_0050), unit: "人" },
    invoices: { daily: INV_0050, weekly: weekBuckets(INV_0050), unit: "張" },
    cans: { daily: CAN_0050, weekly: weekBuckets(CAN_0050), unit: "罐" },
    gender: {
      total: 640, unit: "人",
      items: [
        { label: "男", n: 195, pct: 30.5, color: "#007A49" },
        { label: "女", n: 189, pct: 29.5, color: "#5CB88A" },
        { label: "未揭露", n: 256, pct: 40.0, color: "#E0B34E" }
      ]
    },
    channel: { labels: ["7-11","全家","全聯","美廉社","其他"], data: [154,118,61,41,33], unit: "次" },
    product: { labels: ["金牌 one","金牌","經典","18天","雲泡"], data: [2583,1845,1255,1033,665], unit: "罐" }
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
    /* 進站／不重複登錄僅合計；發票＝抽卡；罐數＝發票×4 */
    visitsTotal: 27148,
    bindsTotal: 1472,
    visits: null,
    binds: null,
    invoices: { daily: INV_TOKYO, weekly: WEEK_INV_TOKYO, unit: "張", label: "抽卡／有效發票" },
    cans: { daily: CAN_TOKYO, weekly: WEEK_CAN_TOKYO, unit: "罐" },
    gender: null,
    channel: { labels: ["7-ELEVEN","全聯","全家","美聯社","萊爾富","其他"], data: [1612,1320,936,508,248,740], unit: "筆" },
    product: null
  }
];

const state = { selected: new Set(PROJECTS.map(p => p.id)), dim: "visits", grain: "day", rangeFrom: 1, rangeTo: null };
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
    btn.addEventListener("click", () => { state.dim = btn.dataset.dim; state.rangeFrom = 1; state.rangeTo = null; render(); });
  });
}
function emptyCard(p, dimLabel, key) {
  let note = "此專案結案／成效沒有「" + dimLabel + "」日數列，無法畫曲線。";
  if (key === "visits" && p.visitsTotal) note = "結案僅有合計 " + fmt(p.visitsTotal) + " 人，無日數列。";
  if (key === "binds" && p.bindsTotal) note = "結案僅有合計 " + fmt(p.bindsTotal) + " 人，無日數列。";
  return '<article class="mini">' +
    '<div class="mini-h"><h3><i class="swatch" style="background:' + p.color + '"></i>' + p.short + "</h3>" +
    '<span class="status ' + p.statusKind + '">' + p.status + "</span></div>" +
    '<div class="empty"><div>無日曲線</div><small>' + note + "</small></div></article>";
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
  const withData = picks.filter(p => seriesOf(p, key));
  const missing = picks.filter(p => !seriesOf(p, key));
  const grain = state.grain;
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
        const full = grain === "day" ? p[key].daily : p[key].weekly;
        const arr = sliceSeries(full, from, to);
        const metric = (p[key].label || dimLabel);
        const shown = arr.length ? arr.reduce((a, b) => a + b, 0) : 0;
        return '<span class="sum-item"><i style="background:' + p.color + '"></i>' + p.short +
          " · " + metric + "（區間）<strong>" + fmt(shown) + "</strong> " + p[key].unit +
          (full.length < from ? " · 此檔期較短" : "") + "</span>";
      }).join("") +
      '</div><p class="axis-note">橫軸是' + axis + "，以各檔活動第 1 " + unitWord + "為起點對齊；檔期較短的專案在超出天數處無點。" +
      (grain === "week" ? "週切：0050／傑憲每 7 日；WBC 為結案五波週報。" : "") +
      "</p></div>";
  }
  if (missing.length) {
    html += '<div class="mini-grid cols-' + Math.min(3, missing.length) + '" style="margin-top:16px">' +
      missing.map(p => emptyCard(p, dimLabel, key)).join("") + "</div>";
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
  if (!withData.length) return;
  const pointR = labels.length > 20 ? 2.5 : 4;
  const yUnit = dim.yUnit || (withData[0][key].unit);
  charts.push(new Chart(document.getElementById("cmpLine"), {
    type: "line",
    data: {
      labels,
      datasets: withData.map(p => {
        const full = grain === "day" ? p[key].daily : p[key].weekly;
        const data = sliceSeries(full, from, to).map((v, i) => {
          const dayIndex = from + i; // 1-based absolute
          return dayIndex <= full.length ? v : null;
        });
        // If campaign shorter than from, all null; if partial, sliceSeries already truncated —
        // pad with nulls to align labels when campaign ends before `to`
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
    '<div class="mini-grid cols-' + cols + '">' +
    picks.map((p, i) => {
      if (!p.gender) return emptyCard(p, dimLabel, key);
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
  const isSeries = SERIES_DIMS.some(d => d.key === state.dim);
  document.getElementById("resultsTitle").innerHTML = dim.label + '<span class="sub">' + dim.where +
    (isSeries ? " · 活動第 N 天" : " · 各檔小倍數") + "</span>";
  const picks = selectedProjects();
  if (!picks.length) {
    document.getElementById("resultsBody").innerHTML =
      '<div class="empty page-empty"><div>請至少選擇一個專案</div><small>取消勾選後會立刻重繪；需保留至少一檔才能比較。</small></div>';
    return;
  }
  if (isSeries) renderSeries(picks, dim);
  else if (state.dim === "gender") renderGender(picks);
  else if (state.dim === "channel") renderBars(picks, "channel", "通路");
  else renderBars(picks, "product", "產品種類");
}
render();
