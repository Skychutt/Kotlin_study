import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourcePath = path.join(root, "Kotlin从零到Android开发全教程.md");
const markdown = fs.readFileSync(sourcePath, "utf8").replace(/\r\n/g, "\n");

const escapeHtml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

const slugCounts = new Map();
const slugify = (text) => {
  const base = text
    .replace(/[`*_]/g, "")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase() || "section";
  const count = slugCounts.get(base) || 0;
  slugCounts.set(base, count + 1);
  return count ? `${base}-${count + 1}` : base;
};

const inline = (text) => {
  let result = escapeHtml(text);
  result = result.replace(/`([^`]+)`/g, "<code>$1</code>");
  result = result.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  return result;
};

const lines = markdown.split("\n");
const html = ['<section class="lesson intro-lesson" data-title="课程说明">'];
const toc = [];
let paragraph = [];
let listType = null;
let inCode = false;
let codeLang = "";
let codeLines = [];
let inTable = false;

const flushParagraph = () => {
  if (!paragraph.length) return;
  html.push(`<p>${inline(paragraph.join(" "))}</p>`);
  paragraph = [];
};

const closeList = () => {
  if (!listType) return;
  html.push(`</${listType}>`);
  listType = null;
};

const closeTable = () => {
  if (!inTable) return;
  html.push("</tbody></table></div>");
  inTable = false;
};

for (let index = 0; index < lines.length; index++) {
  const line = lines[index];

  if (inCode) {
    if (line.startsWith("```")) {
      html.push(`<div class="code-wrap"><div class="code-head"><span>${escapeHtml(codeLang || "text")}</span><button class="copy-code" type="button">复制</button></div><pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre></div>`);
      inCode = false;
      codeLang = "";
      codeLines = [];
    } else {
      codeLines.push(line);
    }
    continue;
  }

  if (line.startsWith("```")) {
    flushParagraph(); closeList(); closeTable();
    inCode = true;
    codeLang = line.slice(3).trim();
    continue;
  }

  const heading = line.match(/^(#{1,4})\s+(.+)$/);
  if (heading) {
    flushParagraph(); closeList(); closeTable();
    const level = heading[1].length;
    const text = heading[2];
    const id = slugify(text);
    if (level === 2) {
      html.push("</section>");
      const chapter = /^第\s*(\d+)\s*章/.exec(text)?.[1];
      html.push(`<section class="lesson" data-title="${escapeHtml(text)}" id="lesson-${id}"><div class="lesson-heading"><h2 id="${id}">${inline(text)}</h2>${chapter ? `<label class="done-toggle"><input type="checkbox" data-progress="chapter-${chapter}"><span>标记完成</span></label>` : ""}</div>`);
      toc.push({ level, text, id, chapter: chapter || null });
    } else {
      html.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      if (level <= 3) toc.push({ level, text, id, chapter: null });
    }
    continue;
  }

  if (/^---+$/.test(line.trim())) {
    flushParagraph(); closeList(); closeTable();
    html.push('<hr class="chapter-rule">');
    continue;
  }

  if (line.startsWith("> ")) {
    flushParagraph(); closeList(); closeTable();
    html.push(`<blockquote>${inline(line.slice(2))}</blockquote>`);
    continue;
  }

  const tableRow = line.match(/^\|(.+)\|$/);
  if (tableRow) {
    flushParagraph(); closeList();
    const cells = tableRow[1].split("|").map((cell) => cell.trim());
    const next = lines[index + 1] || "";
    if (!inTable && /^\|(?:\s*:?-+:?\s*\|)+$/.test(next)) {
      html.push('<div class="table-scroll"><table><thead><tr>' + cells.map((cell) => `<th>${inline(cell)}</th>`).join("") + "</tr></thead><tbody>");
      inTable = true;
      index++;
    } else if (inTable) {
      html.push("<tr>" + cells.map((cell) => `<td>${inline(cell)}</td>`).join("") + "</tr>");
    }
    continue;
  }
  closeTable();

  const ordered = line.match(/^\d+\.\s+(.+)$/);
  const unordered = line.match(/^[-*]\s+(.+)$/);
  if (ordered || unordered) {
    flushParagraph(); closeTable();
    const type = ordered ? "ol" : "ul";
    if (listType !== type) { closeList(); html.push(`<${type}>`); listType = type; }
    html.push(`<li>${inline((ordered || unordered)[1])}</li>`);
    continue;
  }

  if (!line.trim()) {
    flushParagraph(); closeList(); closeTable();
  } else {
    paragraph.push(line.trim());
  }
}

flushParagraph(); closeList(); closeTable();
if (inCode) html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
html.push("</section>");

const chapters = toc.filter((item) => item.level === 2 && item.chapter);
const tocHtml = toc.filter((item) => item.level === 2).map((item) =>
  `<a class="toc-link" href="#${item.id}" data-target="${item.id}">${escapeHtml(item.text.replace(/^第\s*\d+\s*章：?/, ""))}</a>`
).join("\n");

const quiz = [
  { q: "声明一个可能为空的字符串应使用？", a: ["String", "String?", "Optional<String>", "nullable String"], c: 1, e: "Kotlin 用类型后的 ? 表示可空类型。" },
  { q: "协变的只读生产者应使用哪个关键字？", a: ["in", "out", "reified", "crossinline"], c: 1, e: "生产者只输出 T，使用 out。" },
  { q: "Compose 中业务状态最合适放在哪里？", a: ["全局变量", "Composable 局部变量", "ViewModel/数据层", "Activity 静态字段"], c: 2, e: "业务状态应由 ViewModel 和数据层管理，UI 负责展示。" },
  { q: "离线优先应用通常把什么作为单一事实源？", a: ["网络响应", "数据库", "页面参数", "通知"], c: 1, e: "UI 观察本地数据库，同步器把远程数据写入数据库。" },
  { q: "可延迟且需要最终执行的后台同步应优先选择？", a: ["GlobalScope", "Thread", "WorkManager", "普通 Service"], c: 2, e: "WorkManager 支持约束、重试和持久调度。" },
  { q: "Flow 的 flatMapLatest 最适合哪个场景？", a: ["累加总数", "搜索时取消旧请求", "保存常量", "阻塞主线程"], c: 1, e: "新值到来时它会取消旧的内部流，适合搜索。" }
  ,{ q: "应用进程死亡后仍需恢复的业务数据应放在哪里？", a: ["remember", "ViewModel 字段", "Room/文件或服务端", "Application 单例"], c: 2, e: "内存对象都可能随进程消失，业务数据必须持久化。" }
  ,{ q: "生产级离线写入最可靠的模式是？", a: ["只修改 UI", "本地事务同时更新数据和 outbox", "每次都等待网络", "把请求放全局协程"], c: 1, e: "业务记录与 outbox 同事务可保证崩溃后操作仍可同步。" }
  ,{ q: "大屏适配应主要依据什么？", a: ["设备品牌", "手机或平板名称", "当前窗口可用空间", "屏幕物理英寸"], c: 2, e: "分屏、折叠和桌面窗口会动态变化，应依据当前窗口尺寸。" }
  ,{ q: "用户购买订阅后，最终权益应由谁验证？", a: ["客户端本地布尔值", "可信服务端验证 purchase token", "Compose 页面", "通知栏"], c: 1, e: "客户端可被篡改，服务端验证后才应授予权益。" }
  ,{ q: "选择用户图片时，优先使用什么以减少权限？", a: ["读取整个存储", "Photo Picker", "后台位置", "蓝牙扫描"], c: 1, e: "系统 Photo Picker 让用户只授予选中的媒体，无需读取整个图库。" }
  ,{ q: "以下哪项最适合可靠的延迟后台同步？", a: ["LaunchedEffect", "GlobalScope", "WorkManager", "普通 Thread"], c: 2, e: "WorkManager 能在 App 退出或设备重启后按约束继续完成工作。" }
];

const documentHtml = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="从 Kotlin 全语法到 Jetpack Compose、架构、数据、测试与发布的完整 Android 独立开发教程。">
  <title>Kotlin → Android 独立开发完整教程</title>
  <style>
    :root { --ink:#17201d; --muted:#62706a; --paper:#f6f3ea; --card:#fffdf7; --line:#d8d3c6; --brand:#5b3cc4; --brand2:#00a88f; --code:#171b24; --codeInk:#e8edf7; --shadow:0 18px 55px rgba(35,29,20,.10); --sidebar:300px; color-scheme:light; }
    [data-theme="dark"] { --ink:#eff5f1; --muted:#abb8b1; --paper:#111715; --card:#17201d; --line:#33403a; --brand:#a991ff; --brand2:#54d8bf; --code:#090d0c; --codeInk:#e8f0ec; --shadow:0 18px 55px rgba(0,0,0,.32); color-scheme:dark; }
    * { box-sizing:border-box; }
    html { scroll-behavior:smooth; scroll-padding-top:24px; }
    body { margin:0; color:var(--ink); background:var(--paper); font:16px/1.78 system-ui,-apple-system,"Segoe UI","Microsoft YaHei",sans-serif; }
    button,input { font:inherit; }
    a { color:var(--brand); }
    .reading-bar { position:fixed; inset:0 auto auto 0; height:4px; width:0; background:linear-gradient(90deg,var(--brand),var(--brand2)); z-index:100; }
    .mobile-head { display:none; }
    .sidebar { position:fixed; inset:0 auto 0 0; width:var(--sidebar); padding:26px 20px; background:var(--card); border-right:1px solid var(--line); z-index:50; overflow:auto; }
    .brand { display:flex; align-items:center; gap:11px; margin:4px 4px 18px; font-weight:900; letter-spacing:-.03em; }
    .brand-mark { display:grid; place-items:center; width:38px; height:38px; color:white; border-radius:13px; background:linear-gradient(135deg,var(--brand),var(--brand2)); box-shadow:0 7px 20px color-mix(in srgb,var(--brand) 30%,transparent); }
    .search { width:100%; padding:11px 13px; color:var(--ink); background:var(--paper); border:1px solid var(--line); border-radius:12px; outline:none; }
    .search:focus { border-color:var(--brand); box-shadow:0 0 0 3px color-mix(in srgb,var(--brand) 16%,transparent); }
    .progress-card { margin:14px 0; padding:13px; border:1px solid var(--line); border-radius:14px; background:var(--paper); }
    .progress-meta { display:flex; justify-content:space-between; font-size:13px; color:var(--muted); }
    .progress-track { height:7px; margin-top:8px; overflow:hidden; background:var(--line); border-radius:999px; }
    .progress-fill { width:0; height:100%; background:linear-gradient(90deg,var(--brand),var(--brand2)); transition:width .25s; }
    .toc-title { margin:18px 6px 8px; color:var(--muted); font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:.12em; }
    .toc { display:grid; gap:2px; }
    .toc-link { padding:7px 10px; color:var(--muted); text-decoration:none; border-radius:9px; font-size:14px; line-height:1.35; }
    .toc-link:hover,.toc-link.active { color:var(--brand); background:color-mix(in srgb,var(--brand) 11%,transparent); }
    .side-actions { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:16px; }
    .icon-btn { padding:8px; color:var(--ink); background:transparent; border:1px solid var(--line); border-radius:10px; cursor:pointer; }
    main { margin-left:var(--sidebar); }
    .hero { min-height:560px; display:grid; align-items:center; padding:78px clamp(28px,7vw,110px); color:white; background:radial-gradient(circle at 85% 15%,rgba(255,255,255,.18),transparent 25%),linear-gradient(135deg,#4c2aad 0%,#6542c8 48%,#008f7b 130%); overflow:hidden; position:relative; }
    .hero::after { content:"{ }"; position:absolute; right:5vw; bottom:-80px; color:rgba(255,255,255,.09); font:900 280px/1 ui-monospace,monospace; transform:rotate(-7deg); }
    .hero-content { position:relative; z-index:1; max-width:880px; }
    .eyebrow { display:inline-flex; padding:7px 12px; border:1px solid rgba(255,255,255,.35); border-radius:999px; background:rgba(255,255,255,.1); font-size:13px; font-weight:800; letter-spacing:.06em; }
    h1 { max-width:820px; margin:22px 0 18px; font-size:clamp(40px,7vw,84px); line-height:1.02; letter-spacing:-.055em; }
    .lead { max-width:700px; margin:0; color:rgba(255,255,255,.84); font-size:clamp(17px,2vw,22px); }
    .stats { display:flex; flex-wrap:wrap; gap:12px; margin-top:34px; }
    .stat { min-width:130px; padding:14px 17px; border:1px solid rgba(255,255,255,.25); border-radius:14px; background:rgba(255,255,255,.1); backdrop-filter:blur(8px); }
    .stat strong { display:block; font-size:25px; }
    .stat span { font-size:12px; color:rgba(255,255,255,.76); }
    .course { width:min(960px,calc(100% - 48px)); margin:0 auto; padding:74px 0 120px; }
    .lesson { margin:0 0 30px; padding:40px clamp(22px,5vw,58px); background:var(--card); border:1px solid var(--line); border-radius:24px; box-shadow:var(--shadow); }
    .lesson:empty { display:none; }
    .lesson.is-hidden { display:none; }
    .lesson-heading { display:flex; align-items:flex-start; justify-content:space-between; gap:18px; border-bottom:1px solid var(--line); margin-bottom:22px; }
    h2 { margin:0 0 17px; font-size:clamp(25px,4vw,38px); line-height:1.2; letter-spacing:-.035em; }
    h3 { margin:34px 0 10px; font-size:22px; line-height:1.3; }
    h4 { margin:26px 0 8px; font-size:17px; }
    p { margin:12px 0; }
    strong { font-weight:800; }
    p code,li code,td code { padding:.12em .38em; color:var(--brand); background:color-mix(in srgb,var(--brand) 10%,transparent); border:1px solid color-mix(in srgb,var(--brand) 18%,transparent); border-radius:5px; font: .9em ui-monospace,SFMono-Regular,Consolas,monospace; }
    ul,ol { padding-left:1.45em; }
    li { margin:6px 0; }
    blockquote { margin:0 0 25px; padding:17px 20px; border-left:4px solid var(--brand2); border-radius:0 12px 12px 0; background:color-mix(in srgb,var(--brand2) 10%,transparent); font-size:17px; }
    .chapter-rule { margin:35px 0; border:0; border-top:1px dashed var(--line); }
    .code-wrap { margin:19px 0; overflow:hidden; border:1px solid #2c3341; border-radius:15px; background:var(--code); box-shadow:0 12px 28px rgba(0,0,0,.13); }
    .code-head { display:flex; justify-content:space-between; align-items:center; padding:8px 12px; color:#9eabc2; background:#222936; font:12px ui-monospace,monospace; }
    .copy-code { padding:4px 9px; color:#dbe4f5; border:1px solid #445068; border-radius:7px; background:transparent; cursor:pointer; }
    pre { margin:0; padding:18px; overflow:auto; color:var(--codeInk); font:14px/1.65 ui-monospace,SFMono-Regular,Consolas,monospace; tab-size:4; }
    .table-scroll { overflow:auto; margin:18px 0; border:1px solid var(--line); border-radius:13px; }
    table { width:100%; border-collapse:collapse; background:var(--card); }
    th,td { padding:11px 13px; text-align:left; border-bottom:1px solid var(--line); white-space:nowrap; }
    th { background:color-mix(in srgb,var(--brand) 8%,var(--card)); }
    .done-toggle { display:flex; flex:none; align-items:center; gap:7px; padding-top:7px; color:var(--muted); font-size:13px; cursor:pointer; }
    .done-toggle input { width:18px; height:18px; accent-color:var(--brand2); }
    .quiz-panel { margin:0 0 30px; padding:40px clamp(22px,5vw,58px); border:1px solid var(--line); border-radius:24px; background:linear-gradient(135deg,color-mix(in srgb,var(--brand) 12%,var(--card)),var(--card)); box-shadow:var(--shadow); }
    .quiz-card { margin:20px 0; padding:18px; border:1px solid var(--line); border-radius:14px; background:var(--card); }
    .answers { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:9px; }
    .answer { padding:10px 12px; text-align:left; color:var(--ink); background:var(--paper); border:1px solid var(--line); border-radius:10px; cursor:pointer; }
    .answer.correct { border-color:#1aa77b; background:rgba(26,167,123,.13); }
    .answer.wrong { border-color:#da5a5a; background:rgba(218,90,90,.12); }
    .explain { min-height:24px; margin:8px 2px 0; color:var(--muted); font-size:14px; }
    .quiz-result { font-weight:800; color:var(--brand); }
    .no-results { display:none; padding:60px 20px; text-align:center; color:var(--muted); }
    .no-results.show { display:block; }
    .back-top { position:fixed; right:22px; bottom:22px; width:45px; height:45px; color:white; border:0; border-radius:50%; background:var(--brand); box-shadow:var(--shadow); cursor:pointer; opacity:0; pointer-events:none; transition:.2s; }
    .back-top.show { opacity:1; pointer-events:auto; }
    @media (max-width:900px) {
      .mobile-head { position:sticky; top:0; display:flex; align-items:center; justify-content:space-between; padding:12px 16px; background:color-mix(in srgb,var(--card) 90%,transparent); border-bottom:1px solid var(--line); backdrop-filter:blur(14px); z-index:45; }
      .mobile-head button { color:var(--ink); background:transparent; border:1px solid var(--line); border-radius:9px; padding:6px 10px; }
      .sidebar { transform:translateX(-105%); transition:transform .25s; box-shadow:var(--shadow); }
      .sidebar.open { transform:translateX(0); }
      main { margin-left:0; }
      .hero { min-height:500px; padding:62px 24px; }
      .course { width:min(100% - 24px,760px); padding-top:28px; }
      .lesson,.quiz-panel { padding:27px 20px; border-radius:18px; }
      .lesson-heading { display:block; }
      .done-toggle { padding:0 0 14px; }
    }
    @media (max-width:560px) { .answers { grid-template-columns:1fr; } .hero::after { font-size:160px; } h1 { font-size:43px; } }
    @media print { .sidebar,.mobile-head,.reading-bar,.back-top,.done-toggle,.copy-code,.quiz-panel { display:none!important; } main{margin:0}.hero{min-height:auto;padding:40px;color:#000;background:#fff}.lead{color:#333}.course{width:100%;padding:0}.lesson{box-shadow:none;border:0;break-inside:avoid;padding:25px 0} }
  </style>
</head>
<body>
  <div class="reading-bar" aria-hidden="true"></div>
  <header class="mobile-head"><button id="menuButton" type="button" aria-label="打开目录">☰ 目录</button><strong>Kotlin → Android</strong><button id="mobileTheme" type="button" aria-label="切换主题">◐</button></header>
  <aside class="sidebar" aria-label="课程目录">
    <div class="brand"><span class="brand-mark">K</span><span>Kotlin → Android</span></div>
    <input class="search" id="search" type="search" placeholder="搜索语法、Compose、Room…" aria-label="搜索课程">
    <div class="progress-card"><div class="progress-meta"><span>课程进度</span><strong id="progressText">0 / ${chapters.length}</strong></div><div class="progress-track"><div class="progress-fill" id="progressFill"></div></div></div>
    <div class="toc-title">${chapters.length} 章完整路径</div>
    <nav class="toc">${tocHtml}</nav>
    <div class="side-actions"><button class="icon-btn" id="themeButton" type="button">◐ 主题</button><button class="icon-btn" id="printButton" type="button">⎙ 打印</button></div>
  </aside>
  <main>
    <section class="hero">
      <div class="hero-content">
        <span class="eyebrow">从语言到上架 · 完整学习路径</span>
        <h1>Kotlin 全语法<br>与 Android 独立开发</h1>
        <p class="lead">不是零散语法表，而是一条从类型系统、函数式编程和协程，到 Compose、架构、离线数据、测试与发布的完整工程路线。</p>
        <div class="stats"><div class="stat"><strong>${chapters.length}</strong><span>系统章节</span></div><div class="stat"><strong>${(markdown.length / 10000).toFixed(1)} 万</strong><span>字课程正文</span></div><div class="stat"><strong>${(markdown.match(/```kotlin/g) || []).length}+</strong><span>Kotlin 示例组</span></div><div class="stat"><strong>2</strong><span>毕业项目</span></div></div>
      </div>
    </section>
    <div class="course" id="course">
      ${html.join("\n")}
      <section class="quiz-panel" id="quiz"><h2>阶段测验</h2><p>完成 ${quiz.length} 道核心题，检查你是否理解了语言、Android 平台与生产数据流的关键原则。</p><div id="quizList"></div><p class="quiz-result" id="quizResult">已答 0 / ${quiz.length}</p></section>
      <div class="no-results" id="noResults"><h2>没有找到相关内容</h2><p>试试“空安全”“协程”“Compose”“Room”或“测试”。</p></div>
    </div>
  </main>
  <button class="back-top" id="backTop" type="button" aria-label="返回顶部">↑</button>
  <script>
    const quiz = ${JSON.stringify(quiz)};
    const storageKey = "kotlin-course-progress-v1";
    const root = document.documentElement;
    const savedTheme = localStorage.getItem("kotlin-course-theme");
    if (savedTheme) root.dataset.theme = savedTheme;
    else if (matchMedia("(prefers-color-scheme: dark)").matches) root.dataset.theme = "dark";

    const toggleTheme = () => {
      root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
      localStorage.setItem("kotlin-course-theme", root.dataset.theme);
    };
    document.getElementById("themeButton").onclick = toggleTheme;
    document.getElementById("mobileTheme").onclick = toggleTheme;
    document.getElementById("printButton").onclick = () => print();

    const sidebar = document.querySelector(".sidebar");
    document.getElementById("menuButton").onclick = () => sidebar.classList.toggle("open");
    document.querySelectorAll(".toc-link").forEach(link => link.addEventListener("click", () => sidebar.classList.remove("open")));

    const checks = [...document.querySelectorAll("[data-progress]")];
    const saved = new Set(JSON.parse(localStorage.getItem(storageKey) || "[]"));
    checks.forEach(input => {
      input.checked = saved.has(input.dataset.progress);
      input.addEventListener("change", () => { input.checked ? saved.add(input.dataset.progress) : saved.delete(input.dataset.progress); localStorage.setItem(storageKey, JSON.stringify([...saved])); updateProgress(); });
    });
    function updateProgress() {
      document.getElementById("progressText").textContent = saved.size + " / " + checks.length;
      document.getElementById("progressFill").style.width = (saved.size / checks.length * 100) + "%";
    }
    updateProgress();

    const lessons = [...document.querySelectorAll(".lesson")];
    const noResults = document.getElementById("noResults");
    document.getElementById("search").addEventListener("input", event => {
      const query = event.target.value.trim().toLocaleLowerCase();
      let visible = 0;
      lessons.forEach(section => { const match = !query || section.textContent.toLocaleLowerCase().includes(query); section.classList.toggle("is-hidden", !match); if (match) visible++; });
      document.querySelector(".hero").style.display = query ? "none" : "grid";
      noResults.classList.toggle("show", visible === 0);
    });

    document.querySelectorAll(".copy-code").forEach(button => button.addEventListener("click", async () => {
      const code = button.closest(".code-wrap").querySelector("code").innerText;
      try { await navigator.clipboard.writeText(code); button.textContent = "已复制"; } catch { button.textContent = "请手动复制"; }
      setTimeout(() => button.textContent = "复制", 1400);
    }));

    const quizList = document.getElementById("quizList");
    const answered = new Map();
    quiz.forEach((item, index) => {
      const card = document.createElement("div"); card.className = "quiz-card";
      card.innerHTML = "<strong>" + (index + 1) + ". " + item.q + "</strong><div class='answers'>" + item.a.map((answer, i) => "<button class='answer' data-index='" + i + "' type='button'>" + answer + "</button>").join("") + "</div><p class='explain'></p>";
      card.querySelectorAll(".answer").forEach(button => button.onclick = () => {
        if (answered.has(index)) return;
        const selected = Number(button.dataset.index); answered.set(index, selected === item.c);
        card.querySelectorAll(".answer").forEach((b, i) => { if (i === item.c) b.classList.add("correct"); else if (i === selected) b.classList.add("wrong"); });
        card.querySelector(".explain").textContent = item.e;
        const score = [...answered.values()].filter(Boolean).length;
        document.getElementById("quizResult").textContent = "已答 " + answered.size + " / " + quiz.length + " · 正确 " + score + " 题";
      });
      quizList.appendChild(card);
    });

    const bar = document.querySelector(".reading-bar");
    const backTop = document.getElementById("backTop");
    addEventListener("scroll", () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = (max ? scrollY / max * 100 : 0) + "%";
      backTop.classList.toggle("show", scrollY > 700);
    }, { passive:true });
    backTop.onclick = () => scrollTo({ top:0, behavior:"smooth" });

    const links = [...document.querySelectorAll(".toc-link")];
    const targets = links.map(link => document.getElementById(link.dataset.target)).filter(Boolean);
    const observer = new IntersectionObserver(entries => {
      entries.filter(e => e.isIntersecting).forEach(entry => { links.forEach(l => l.classList.toggle("active", l.dataset.target === entry.target.id)); });
    }, { rootMargin:"-10% 0px -75% 0px" });
    targets.forEach(target => observer.observe(target));
  </script>
</body>
</html>`;

for (const destination of [
  path.join(root, "Kotlin全语法教学.html"),
  path.join(root, "public", "Kotlin全语法教学.html")
]) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, documentHtml, "utf8");
}

console.log(`Generated standalone course: ${chapters.length} chapters, ${documentHtml.length} bytes`);
