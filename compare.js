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

/* 0050 invoices.daily — copied from index.html METRICS.invoices / buildSeries */
const INV_0050 = [16,20,24,33,41,114,61,53,45,30,34,31,21,19,17,17,17,25,27,22,24,27,29,31,39,39,32,31,28,26,23,27,24,15,13,12,12,13,22,24,20,22,25,26,28];

/* 東京 invDaily — same splitTotal(WEEK_INV, nDays, 1400 + i*17) as tokyo.html */
const WEEK_INV_TOKYO = [462, 815, 1067, 1913, 1221];
const INV_TOKYO = [32,30,32,35,35,30,36,27,29,29,32,29,28,25,33,50,57,59,50,53,49,64,57,55,49,57,52,46,56,61,75,64,65,68,65,74,67,88,69,64,68,84,67,76,73,129,144,128,108,133,133,136,150,115,109,106,133,140,123,126,63,63,85,83,71,74,84,78,76,65,60,79,59,78,67,59,77];

/* 傑憲 登錄次數 — 示意（結案無發票日數列；17 天、合計低千） */
const INV_JIEXIAN = [212,268,221,98,72,81,108,186,134,109,92,84,76,98,128,82,58];

const DIMS = [
  { key: "logins", label: "登錄次數", where: "成效總覽" },
  { key: "gender", label: "男女比", where: "消費者" },
  { key: "channel", label: "通路", where: "登錄" },
  { key: "product", label: "產品種類", where: "登錄" }
];

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
    logins: { daily: INV_0050, weekly: weekBuckets(INV_0050), unit: "次" },
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
    fake: true,
    color: "#E0B34E",
    days: 17,
    href: "jiexian.html",
    logins: { daily: INV_JIEXIAN, weekly: weekBuckets(INV_JIEXIAN), unit: "次" },
    gender: {
      total: 1840, unit: "人",
      items: [
        { label: "男", n: 1067, pct: 58.0, color: "#007A49" },
        { label: "女", n: 552, pct: 30.0, color: "#5CB88A" },
        { label: "未揭露", n: 221, pct: 12.0, color: "#E0B34E" }
      ]
    },
    channel: { labels: ["全聯","7-ELEVEN","家樂福","楓康","其他"], data: [682,546,318,221,340], unit: "次" },
    product: { labels: ["金牌","18天","經典","金牌 one","果微醺"], data: [2140,1688,1210,890,472], unit: "罐" }
  },
  {
    id: "tokyo",
    short: "東京",
    name: "喝台啤抽東京雙人來回機票",
    status: "已結束",
    statusKind: "done",
    fake: true,
    color: "#298F66",
    days: 77,
    href: "tokyo.html",
    logins: { daily: INV_TOKYO, weekly: WEEK_INV_TOKYO, unit: "筆" },
    gender: {
      total: 1472, unit: "人",
      items: [
        { label: "男", n: 486, pct: 33.0, color: "#007A49" },
        { label: "女", n: 812, pct: 55.2, color: "#5CB88A" },
        { label: "未揭露", n: 174, pct: 11.8, color: "#E0B34E" }
      ]
    },
    channel: { labels: ["7-ELEVEN","全聯","全家","美聯社","萊爾富","其他"], data: [1612,1320,936,508,248,740], unit: "筆" },
    product: { labels: ["金牌","經典","18天","金牌 one","黑啤"], data: [8209,6544,3288,2191,1680], unit: "罐" }
  }
];

const state = { selected: new Set(PROJECTS.map(p => p.id)), dim: "logins", grain: "day" };
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
    btn.addEventListener("click", () => { state.dim = btn.dataset.dim; render(); });
  });
}
function emptyCard(p, dimLabel) {
  return '<article class="mini">' +
    '<div class="mini-h"><h3><i class="swatch" style="background:' + p.color + '"></i>' + p.short + "</h3>" +
    '<span class="status ' + p.statusKind + '">' + p.status + "</span></div>" +
    '<div class="empty"><div>無此維度</div><small>此專案成效沒有「' + dimLabel + "」</small></div></article>";
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
function renderLogins(picks) {
  const withData = picks.filter(p => p.logins && p.logins.daily && p.logins.daily.length);
  const missing = picks.filter(p => !(p.logins && p.logins.daily && p.logins.daily.length));
  const grain = state.grain;
  const series = withData.map(p => grain === "day" ? p.logins.daily : p.logins.weekly);
  const maxN = series.reduce((m, s) => Math.max(m, s.length), 0);
  const labels = Array.from({ length: maxN }, (_, i) => String(i + 1));
  const axis = grain === "day" ? "活動第 N 天" : "活動第 N 週";
  const legend = withData.map(p =>
    "<span><i style=\"background:" + p.color + "\"></i>" + p.short + (p.fake ? " · 示意" : "") + "</span>"
  ).join("");
  let html = '<div class="toolbar">' +
    '<div class="hint"><b>數列說明</b>　' + axis + " · 各檔自己的" + (grain === "day" ? "日" : "週") + "數列" +
    (legend ? '<div class="legend-row" style="margin-top:8px">' + legend + "</div>" : "") +
    "</div>" +
    '<div class="seg" role="tablist" aria-label="粒度">' +
      '<button type="button" data-grain="day"' + (grain === "day" ? ' class="on"' : "") + ">日</button>" +
      '<button type="button" data-grain="week"' + (grain === "week" ? ' class="on"' : "") + ">週</button>" +
    "</div></div>";
  if (withData.length) {
    html += '<div class="chart-wrap"><canvas id="cmpLine"></canvas></div>';
    html += '<div class="chart-foot"><div class="sums">' +
      withData.map(p => {
        const arr = grain === "day" ? p.logins.daily : p.logins.weekly;
        return '<span class="sum-item"><i style="background:' + p.color + '"></i>' + p.short +
          " 合計 <strong>" + fmt(arr.reduce((a, b) => a + b, 0)) + "</strong> " + p.logins.unit + "</span>";
      }).join("") +
      '</div><p class="axis-note">橫軸是' + axis + "，因檔期長度不同（17 vs 45 vs 77 天）。" +
      (grain === "week" ? "週切依各檔成效頁：0050／傑憲每 7 日；東京為結案五波週報。" : "") +
      "</p></div>";
  }
  if (missing.length) {
    html += '<div class="mini-grid cols-' + Math.min(3, missing.length) + '" style="margin-top:16px">' +
      missing.map(p => emptyCard(p, "登錄次數")).join("") + "</div>";
  }
  document.getElementById("resultsBody").innerHTML = html;
  document.querySelectorAll("#resultsBody [data-grain]").forEach(btn => {
    btn.addEventListener("click", () => { state.grain = btn.dataset.grain; render(); });
  });
  if (!withData.length) return;
  const pointR = maxN > 20 ? 2.5 : 4;
  charts.push(new Chart(document.getElementById("cmpLine"), {
    type: "line",
    data: {
      labels,
      datasets: withData.map(p => {
        const data = grain === "day" ? p.logins.daily : p.logins.weekly;
        return {
          label: p.short, data, unit: p.logins.unit,
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
          title: { display: true, text: "次", color: "#6F6A64", font: { family: "Noto Sans TC", size: 11 } }
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
      if (!p.gender) return emptyCard(p, dimLabel);
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
      if (!v || !v.data) return emptyCard(p, dimLabel);
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
  document.getElementById("resultsTitle").innerHTML = dim.label + '<span class="sub">' + dim.where +
    (state.dim === "logins" ? " · 活動第 N 天" : " · 各檔小倍數") + "</span>";
  const picks = selectedProjects();
  if (!picks.length) {
    document.getElementById("resultsBody").innerHTML =
      '<div class="empty page-empty"><div>請至少選擇一個專案</div><small>取消勾選後會立刻重繪；需保留至少一檔才能比較。</small></div>';
    return;
  }
  if (state.dim === "logins") renderLogins(picks);
  else if (state.dim === "gender") renderGender(picks);
  else if (state.dim === "channel") renderBars(picks, "channel", "通路");
  else renderBars(picks, "product", "產品種類");
}
render();
