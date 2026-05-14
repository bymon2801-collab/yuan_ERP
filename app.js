const STORAGE_KEY = "yuan-erp-mvp-state-v1";
let memoryState = null;

const users = [
  { id: "u-admin", name: "管理员", role: "admin", team: "管理组" },
  { id: "u-fe-a", name: "前端小元", role: "frontend", team: "一组" },
  { id: "u-leader", name: "组长小周", role: "leader", team: "一组" },
  { id: "u-back", name: "后端小林", role: "backend", team: "后端组" },
  { id: "u-fin", name: "财务小陈", role: "finance", team: "财务组" },
];

const roleNames = {
  admin: "管理人员",
  frontend: "前端营销人员",
  leader: "前端组长",
  backend: "后端订单处理人员",
  finance: "财务人员",
};

const navItems = [
  ["dashboard", "首页工作台"],
  ["customers", "客户管理"],
  ["orders", "测评订单"],
  ["import", "订单导入"],
  ["finance", "财务管理"],
  ["pricing", "价格公式"],
  ["logs", "操作日志"],
];

const vpPlatforms = ["亚马逊", "沃尔玛", "TK", "SHEIN", "TEMU"];
const vpSites = ["美国", "加拿大", "英国", "德国", "意大利", "法国", "西班牙", "日本", "澳大利亚", "中东"];
const vpProjects = ["免评", "点星", "feedback", "文评", "图评", "视频"];

const directSiteMap = {
  美国: "US",
  美国站: "US",
  US: "US",
  英国: "UK",
  英国站: "UK",
  UK: "UK",
  德国: "DE",
  德国站: "DE",
  DE: "DE",
  法国: "FR",
  FR: "FR",
  意大利: "IT",
  IT: "IT",
  西班牙: "ES",
  ES: "ES",
  加拿大: "CA",
  CA: "CA",
  日本: "JA",
  日本站: "JA",
  JA: "JA",
};

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function today(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function money(n) {
  return Number(n || 0).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function loadState() {
  const saved = safeStorageGet();
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      safeStorageRemove();
    }
  }
  if (memoryState) return memoryState;
  const seed = {
    currentUserId: "",
    activePage: "dashboard",
    customers: [
      {
        id: "c-1",
        customerNo: "CUS202605150001",
        name: "星河家居",
        wechat: "star-home-88",
        phone: "13800000001",
        store: "Star Home",
        site: "美国",
        ownerId: "u-fe-a",
        team: "一组",
        status: "长期合作",
        contactConfirmed: true,
        remark: "VP 和直评都有需求，客户付款较快。",
        createdAt: today(-8),
        totalDealAmount: 4600,
      },
      {
        id: "c-2",
        customerNo: "CUS202605150002",
        name: "北岸户外",
        wechat: "north-outdoor",
        phone: "13800000002",
        store: "North Outdoor",
        site: "美国",
        ownerId: "u-fe-a",
        team: "一组",
        status: "已成交",
        contactConfirmed: true,
        remark: "直评客户，注意质保。",
        createdAt: today(-2),
        totalDealAmount: 1800,
      },
    ],
    orders: [
      {
        id: "o-1",
        orderNo: "CP202605130001",
        type: "直评",
        customerId: "c-1",
        frontendId: "u-fe-a",
        backendId: "u-back",
        acceptedAt: today(-2),
        completedAt: "",
        performanceAt: today(0),
        platform: "亚马逊",
        site: "US",
        productName: "Phone Bag",
        keyword: "",
        asin: "B0GQGVNFVH",
        variant: "",
        price: 17.99,
        store: "Star Home",
        project: "直评",
        warranty: "7天",
        reviewTitle: "I absolutely love it!",
        reviewContent: "Thanks to the transparent window, I can view my phone screen directly.",
        receivable: 1000,
        received: 1000,
        payable: 260,
        paid: 0,
        performance: 1000,
        status: "待渠道付款",
        paymentStatus: "已收款",
        payoutStatus: "未付款",
        channelName: "直评渠道A",
        channelVisible: true,
        voided: false,
      },
      {
        id: "o-2",
        orderNo: "VP202605140001",
        type: "VP",
        customerId: "c-1",
        frontendId: "u-fe-a",
        backendId: "u-back",
        acceptedAt: today(-1),
        completedAt: today(0),
        performanceAt: today(0),
        platform: "亚马逊",
        site: "美国",
        productName: "女士长裤",
        keyword: "Leg Pants for Women",
        asin: "B0FP5BYXVR",
        variant: "自选",
        price: 17.99,
        store: "Sampeel",
        project: "免评",
        requirement: "使用优惠券",
        receivable: 155,
        received: 155,
        payable: 110,
        paid: 110,
        performance: 45,
        status: "已完成",
        paymentStatus: "已收款",
        payoutStatus: "已付款",
        channelName: "VP渠道B",
        channelVisible: false,
        voided: false,
      },
    ],
    logs: [],
    pricing: {
      direct: [
        { site: "US", warranty7: 40, warranty30: 80 },
        { site: "UK", warranty7: 50, warranty30: 90 },
        { site: "DE", warranty7: 40, warranty30: 80 },
        { site: "FR", warranty7: 40, warranty30: 80 },
        { site: "IT", warranty7: 40, warranty30: 80 },
        { site: "ES", warranty7: 40, warranty30: 80 },
        { site: "CA", warranty7: 50, warranty30: 90 },
        { site: "JA", warranty7: 50, warranty30: 90 },
      ],
      vpCommissions: { 免评: 30, 点星: 40, feedback: 40, 文评: 80, 图评: 100, 视频: 150 },
    },
    importPreview: [],
  };
  saveState(seed);
  return seed;
}

let state = loadState();

function saveState(next = state) {
  memoryState = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    // Some file:// browser contexts disable localStorage. The app should still run.
  }
}

function safeStorageGet() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    return null;
  }
}

function safeStorageRemove() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    memoryState = null;
  }
}

function currentUser() {
  return users.find((u) => u.id === state.currentUserId);
}

function canSeeAll(user = currentUser()) {
  return user && ["admin", "finance"].includes(user.role);
}

function canSeeCustomer(customer, user = currentUser()) {
  if (!user) return false;
  if (["admin", "finance", "backend"].includes(user.role)) return true;
  if (user.role === "leader") return customer.team === user.team;
  return customer.ownerId === user.id;
}

function visibleCustomers() {
  return state.customers.filter((c) => canSeeCustomer(c));
}

function visibleOrders() {
  const user = currentUser();
  if (!user) return [];
  if (["admin", "finance"].includes(user.role)) return state.orders;
  if (user.role === "backend") return state.orders.filter((o) => o.backendId === user.id);
  if (user.role === "leader") {
    const ids = state.customers.filter((c) => c.team === user.team).map((c) => c.id);
    return state.orders.filter((o) => ids.includes(o.customerId));
  }
  return state.orders.filter((o) => o.frontendId === user.id);
}

function log(action, detail) {
  state.logs.unshift({
    id: uid("log"),
    at: new Date().toLocaleString("zh-CN"),
    user: currentUser()?.name || "系统",
    action,
    detail,
  });
  saveState();
}

function toast(message) {
  const div = document.createElement("div");
  div.className = "toast";
  div.textContent = message;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 2200);
}

function setPage(page) {
  state.activePage = page;
  saveState();
  render();
}

function render() {
  const app = document.querySelector("#app");
  if (state.currentUserId && !currentUser()) {
    state.currentUserId = "";
    saveState();
  }
  if (!state.currentUserId) {
    app.innerHTML = renderLogin();
    bindLogin();
    return;
  }

  const user = currentUser();
  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <strong>元跨境 ERP</strong>
          <span>测评板块 MVP</span>
        </div>
        <nav class="nav">
          ${navItems.map(([key, label]) => `<button class="${state.activePage === key ? "active" : ""}" data-nav="${key}">${label}</button>`).join("")}
        </nav>
        <div class="user-strip">
          <div>${user.name}</div>
          <div>${roleNames[user.role]} / ${user.team}</div>
        </div>
      </aside>
      <main class="main">
        <header class="topbar">
          <h1>${navItems.find(([key]) => key === state.activePage)?.[1] || "工作台"}</h1>
          <div class="toolbar">
            <button class="btn ghost" id="resetDemo">重置演示数据</button>
            <button class="btn danger" id="logout">退出</button>
          </div>
        </header>
        <div class="content">${renderPage()}</div>
      </main>
    </div>
  `;
  bindShell();
}

function renderLogin() {
  return `
    <div class="login-shell">
      <section class="login-hero">
        <h1>元跨境内部 ERP</h1>
        <p>第一版先跑通测评板块的核心流程：客户归属、订单录入、后端排单、财务确认、业绩排名和批量导入预览。</p>
      </section>
      <section class="login-panel">
        <form class="login-box" id="loginForm">
          <h2>登录系统</h2>
          <div class="field">
            <label>选择演示账号</label>
            <select id="loginUser">
              ${users.map((u) => `<option value="${u.id}">${u.name} - ${roleNames[u.role]}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label>密码</label>
            <input id="password" type="password" value="123456" />
            <div class="hint">演示版统一密码：123456</div>
          </div>
          <button class="btn primary" type="submit" style="width:100%">进入 ERP</button>
        </form>
      </section>
    </div>
  `;
}

function bindLogin() {
  document.querySelector("#loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (document.querySelector("#password").value !== "123456") {
      toast("密码错误");
      return;
    }
    state.currentUserId = document.querySelector("#loginUser").value;
    state.activePage = "dashboard";
    log("登录", "进入系统");
    saveState();
    render();
  });
}

function renderPage() {
  const pages = {
    dashboard: renderDashboard,
    customers: renderCustomers,
    orders: renderOrders,
    import: renderImport,
    finance: renderFinance,
    pricing: renderPricing,
    logs: renderLogs,
  };
  return (pages[state.activePage] || renderDashboard)();
}

function bindShell() {
  document.querySelectorAll("[data-nav]").forEach((btn) => {
    btn.addEventListener("click", () => setPage(btn.dataset.nav));
  });
  document.querySelector("#logout").addEventListener("click", () => {
    state.currentUserId = "";
    saveState();
    render();
  });
  document.querySelector("#resetDemo").addEventListener("click", () => {
    safeStorageRemove();
    state = loadState();
    toast("演示数据已重置");
    render();
  });

  const binders = {
    dashboard: bindDashboard,
    customers: bindCustomers,
    orders: bindOrders,
    import: bindImport,
    finance: bindFinance,
    pricing: bindPricing,
    logs: () => {},
  };
  binders[state.activePage]?.();
}

function performanceOn(date) {
  return state.orders
    .filter((o) => !o.voided && o.performanceAt === date)
    .reduce((map, o) => {
      map[o.frontendId] = (map[o.frontendId] || 0) + Number(o.performance || 0);
      return map;
    }, {});
}

function rankingFor(date) {
  const perf = performanceOn(date);
  return Object.entries(perf)
    .map(([userId, amount]) => ({ user: users.find((u) => u.id === userId), amount }))
    .filter((x) => x.user)
    .sort((a, b) => b.amount - a.amount);
}

function renderDashboard() {
  const orders = visibleOrders().filter((o) => !o.voided);
  const todayRank = rankingFor(today());
  const champs = [today(-1), today(-2), today(-3)].map((d) => ({ date: d, item: rankingFor(d)[0] }));
  const totalPerformance = orders.reduce((sum, o) => sum + Number(o.performance || 0), 0);
  const pendingCollection = orders.filter((o) => o.paymentStatus !== "已收款").length;
  return `
    <section class="section">
      <div class="section-head"><h2>近三天业绩冠军</h2><span class="hint">所有人可见，不展示客户和订单明细</span></div>
      <div class="grid cols-3">
        ${champs
          .map(({ date, item }) => `
          <div class="metric">
            <span>${date}</span>
            <strong>${item ? item.user.name : "暂无数据"}</strong>
            <div class="hint">${item ? `${item.user.team} / 业绩 ¥${money(item.amount)}` : "没有完成业绩"}</div>
          </div>
        `)
          .join("")}
      </div>
    </section>
    <section class="section">
      <div class="section-head"><h2>当天实时业绩排名</h2><span class="hint">最后更新：${new Date().toLocaleTimeString("zh-CN")}</span></div>
      ${todayRank.length ? renderRankTable(todayRank) : `<div class="empty">今天还没有员工业绩</div>`}
    </section>
    <section class="grid cols-3">
      <div class="metric"><span>可见订单数</span><strong>${orders.length}</strong></div>
      <div class="metric"><span>可见客户数</span><strong>${visibleCustomers().length}</strong></div>
      <div class="metric"><span>累计业绩</span><strong>¥${money(totalPerformance)}</strong></div>
      <div class="metric"><span>待催款订单</span><strong>${pendingCollection}</strong></div>
      <div class="metric"><span>今日奖励资格线</span><strong>¥2,000</strong></div>
      <div class="metric"><span>拓客奖励资格线</span><strong>10 个直客</strong></div>
    </section>
  `;
}

function renderRankTable(items) {
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>排名</th><th>员工</th><th>小组</th><th>实时业绩</th><th>奖励资格</th></tr></thead>
        <tbody>
          ${items
            .map((row, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${row.user.name}</td>
                <td>${row.user.team}</td>
                <td>¥${money(row.amount)}</td>
                <td>${row.amount > 2000 ? `<span class="tag green">入围</span>` : `<span class="tag gray">未入围</span>`}</td>
              </tr>
            `)
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function bindDashboard() {}

function renderCustomers() {
  const user = currentUser();
  const rows = visibleCustomers();
  return `
    <section class="section">
      <div class="section-head"><h2>新增客户</h2><span class="hint">前端确认提交后，联系方式只对管理员可见</span></div>
      <form id="customerForm" class="form-grid">
        <div class="field"><label>客户名称</label><input name="name" required /></div>
        <div class="field"><label>微信</label><input name="wechat" required /></div>
        <div class="field"><label>手机号</label><input name="phone" required /></div>
        <div class="field"><label>店铺</label><input name="store" required /></div>
        <div class="field"><label>站点</label><input name="site" value="美国" /></div>
        <div class="field"><label>状态</label><select name="status"><option>新客户</option><option>已成交</option><option>长期合作</option><option>暂停合作</option></select></div>
        <div class="field span-2"><label>备注</label><input name="remark" /></div>
        <button class="btn primary span-4" type="submit">确认无误并提交客户</button>
      </form>
    </section>
    <section class="section">
      <div class="section-head"><h2>客户列表</h2><span class="hint">${user.role === "admin" ? "管理员可见联系方式" : "联系方式已隐藏"}</span></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>客户编号</th><th>客户</th><th>联系方式</th><th>店铺</th><th>状态</th><th>累计成交</th><th>备注</th><th>操作</th></tr></thead>
          <tbody>
            ${rows
              .map((c) => `
                <tr>
                  <td>${c.customerNo}</td>
                  <td>${c.name}</td>
                  <td>${user.role === "admin" ? `${c.wechat}<br>${c.phone}` : "已隐藏"}</td>
                  <td>${c.store}</td>
                  <td><span class="tag ${c.status === "已作废" ? "red" : "green"}">${c.status}</span></td>
                  <td>¥${money(c.totalDealAmount)}</td>
                  <td>${c.remark || ""}</td>
                  <td><button class="btn warn" data-void-customer="${c.id}">标记作废</button></td>
                </tr>
              `)
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function bindCustomers() {
  document.querySelector("#customerForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const user = currentUser();
    const customer = {
      id: uid("c"),
      customerNo: `CUS${today().replaceAll("-", "")}${String(state.customers.length + 1).padStart(4, "0")}`,
      ...data,
      ownerId: user.role === "frontend" ? user.id : "u-fe-a",
      team: user.team || "一组",
      contactConfirmed: true,
      createdAt: today(),
      totalDealAmount: 0,
    };
    state.customers.unshift(customer);
    log("新增客户", `${customer.name}，联系方式已确认提交`);
    saveState();
    toast("客户已提交，前端后续不可见核心联系方式");
    render();
  });
  document.querySelectorAll("[data-void-customer]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const c = state.customers.find((x) => x.id === btn.dataset.voidCustomer);
      c.status = "已作废";
      c.voidedAt = new Date().toISOString();
      c.voidedBy = currentUser().id;
      log("客户作废", c.name);
      saveState();
      render();
    });
  });
}

function renderOrders() {
  const orders = visibleOrders();
  return `
    <section class="section">
      <div class="section-head"><h2>新增测评订单</h2><span class="hint">所有订单必须选择客户，录入时间即接单时间</span></div>
      <form id="orderForm" class="form-grid">
        <div class="field"><label>业务类型</label><select name="type" id="orderType"><option>直评</option><option>VP</option><option>VINE</option><option>买家秀</option></select></div>
        <div class="field"><label>客户</label><select name="customerId" required>${visibleCustomers().map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}</select></div>
        <div class="field"><label>站点</label><input name="site" value="US" /></div>
        <div class="field"><label>项目</label><select name="project">${["直评", ...vpProjects].map((p) => `<option>${p}</option>`).join("")}</select></div>
        <div class="field"><label>产品名</label><input name="productName" /></div>
        <div class="field"><label>关键词</label><input name="keyword" /></div>
        <div class="field"><label>ASIN</label><input name="asin" required /></div>
        <div class="field"><label>变体</label><input name="variant" /></div>
        <div class="field"><label>价格</label><input name="price" type="number" step="0.01" /></div>
        <div class="field"><label>店铺</label><input name="store" /></div>
        <div class="field"><label>应收款</label><input name="receivable" type="number" step="0.01" value="0" /></div>
        <div class="field"><label>应付款</label><input name="payable" type="number" step="0.01" value="0" /></div>
        <div class="field"><label>渠道名称</label><input name="channelName" required /></div>
        <div class="field span-2"><label>备注要求</label><input name="requirement" /></div>
        <button class="btn primary span-4" type="submit">提交订单</button>
      </form>
    </section>
    <section class="section">
      <div class="section-head"><h2>订单列表</h2><span class="hint">订单不物理删除，只能标记作废</span></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>订单号</th><th>类型</th><th>客户</th><th>产品/ASIN</th><th>项目</th><th>渠道</th><th>收付款</th><th>业绩</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            ${orders.map(renderOrderRow).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderOrderRow(o) {
  const c = state.customers.find((x) => x.id === o.customerId);
  const canSeeChannel = o.type === "直评" || ["admin", "finance", "backend"].includes(currentUser().role);
  return `
    <tr class="${o.voided ? "invalid-row" : ""}">
      <td>${o.orderNo}</td>
      <td><span class="tag">${o.type}</span></td>
      <td>${c?.name || "未知客户"}</td>
      <td>${o.productName || "-"}<br><span class="hint">${o.asin || ""}</span></td>
      <td>${o.project || "-"}</td>
      <td>${canSeeChannel ? o.channelName || "-" : "不可见"}</td>
      <td>收 ¥${money(o.received || 0)} / 付 ¥${money(o.paid || 0)}</td>
      <td>¥${money(o.performance || 0)}</td>
      <td><span class="tag ${o.voided ? "red" : "green"}">${o.voided ? "已作废" : o.status}</span></td>
      <td>
        ${o.type === "VP" ? `<button class="btn ghost" data-copy-vp="${o.id}">复制排单</button>` : ""}
        <button class="btn warn" data-void-order="${o.id}">作废</button>
      </td>
    </tr>
  `;
}

function bindOrders() {
  document.querySelector("#orderForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const user = currentUser();
    const order = createOrderFromData(data, user.id);
    state.orders.unshift(order);
    log("新增订单", `${order.orderNo} / ${order.type}`);
    saveState();
    toast("订单已提交");
    render();
  });
  document.querySelectorAll("[data-void-order]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const o = state.orders.find((x) => x.id === btn.dataset.voidOrder);
      o.voided = true;
      o.voidedAt = new Date().toISOString();
      o.voidedBy = currentUser().id;
      log("订单作废", o.orderNo);
      saveState();
      render();
    });
  });
  document.querySelectorAll("[data-copy-vp]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const o = state.orders.find((x) => x.id === btn.dataset.copyVp);
      await copyText(vpCopyText([o]));
      toast("VP 排单信息已复制");
    });
  });
}

function createOrderFromData(data, userId) {
  const type = data.type || "直评";
  const numberPrefix = type === "VP" ? "VP" : "CP";
  const receivable = Number(data.receivable || 0);
  const payable = Number(data.payable || 0);
  const received = 0;
  const paid = 0;
  return {
    id: uid("o"),
    orderNo: `${numberPrefix}${today().replaceAll("-", "")}${String(state.orders.length + 1).padStart(4, "0")}`,
    type,
    customerId: data.customerId,
    frontendId: userId,
    backendId: "u-back",
    acceptedAt: today(),
    completedAt: "",
    performanceAt: "",
    platform: type === "直评" ? "亚马逊" : data.platform || "亚马逊",
    site: normalizeSite(data.site || "US"),
    productName: data.productName || "",
    productImage: data.productImage || "",
    keyword: data.keyword || "",
    asin: extractAsin(data.asin || data.link || ""),
    variant: data.variant || "",
    price: Number(data.price || 0),
    store: data.store || "",
    project: data.project || type,
    requirement: data.requirementRemark || data.requirement || "",
    requirementRemark: data.requirementRemark || "",
    remark: data.remark || "",
    receivable,
    received,
    payable,
    paid,
    performance: received - paid,
    status: "待处理",
    paymentStatus: "未收款",
    payoutStatus: "未付款",
    channelName: data.channelName || "",
    channelVisible: type === "直评",
    voided: false,
  };
}

function normalizeSite(value) {
  const raw = String(value || "").trim();
  const normalized = directSiteMap[raw] || raw;
  const names = {
    US: "美国",
    UK: "英国",
    DE: "德国",
    FR: "法国",
    IT: "意大利",
    ES: "西班牙",
    CA: "加拿大",
    JA: "日本",
    JP: "日本",
    AU: "澳大利亚",
    AE: "中东",
    ME: "中东",
  };
  return names[normalized] || normalized;
}

function normalizeDirectSite(value) {
  return directSiteMap[String(value || "").trim()] || String(value || "").trim();
}

function extractAsin(value) {
  const text = String(value || "").trim();
  const asin = text.match(/B0[A-Z0-9]{8}/i);
  return asin ? asin[0].toUpperCase() : text;
}

function vpCopyText(orders) {
  const grouped = orders.reduce((list, o) => {
    list.push(`${o.project || "项目"} 1单`);
    return list;
  }, []);
  const first = orders[0];
  return [
    `产品名：${first.productName || ""}`,
    `关键词：${first.keyword || ""}`,
    `ASIN：${first.asin || ""}`,
    `变体：${first.variant || "无"}`,
    `价格：${first.price || ""}`,
    `店铺：${first.store || ""}`,
    `项目要求：${grouped.join("，")}`,
    `备注要求：${first.requirement || "无"}`,
  ].join("\n");
}

async function copyText(text) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement("textarea");
  area.value = text;
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  area.remove();
}

function renderImport() {
  return `
    <section class="section">
      <div class="section-head"><h2>订单导入</h2><span class="hint">先预览，信息完整才允许提交</span></div>
      <div class="toolbar">
        <select id="importType"><option>直评</option><option>VP</option></select>
        <button class="btn primary" id="parsePaste">识别内容</button>
        <button class="btn ghost" id="clearImport">清空</button>
      </div>
      <div class="field">
        <label>从表格复制后粘贴到这里</label>
        <textarea id="pasteArea" placeholder="VP 可以直接粘贴一行：US    主图空列    女士长裤    Leg Pants for Women    17.99    Sampeel    无/自选    B0FP5BYXVR    2单免评，使用优惠券    无"></textarea>
        <div class="hint">VP 无表头时按固定顺序识别：站点、主图、产品名、关键词、价格、店铺、变体、ASIN、下单要求、特殊备注。</div>
      </div>
    </section>
    <section class="section">
      <div class="section-head"><h2>导入预览</h2><button class="btn primary" id="submitPreview">提交有效行</button></div>
      ${renderImportPreview()}
    </section>
  `;
}

function renderImportPreview() {
  if (!state.importPreview.length) return `<div class="empty">暂无预览数据</div>`;
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>状态</th><th>类型</th><th>客户</th><th>站点</th><th>图片</th><th>产品/ASIN</th><th>关键词</th><th>价格/店铺</th><th>变体</th><th>项目</th><th>要求/备注</th><th>问题</th></tr></thead>
        <tbody>
          ${state.importPreview
            .map((row, index) => `
              <tr class="${row.errors.length ? "invalid-row" : ""}">
                <td>${row.errors.length ? `<span class="tag red">不可提交</span>` : `<span class="tag green">可提交</span>`}</td>
                <td>
                  <select class="cell-select" data-preview-field="${index}:type">
                    ${["直评", "VP"].map((type) => `<option value="${type}" ${row.type === type ? "selected" : ""}>${type}</option>`).join("")}
                  </select>
                </td>
                <td>
                  <input class="cell-input" list="customerOptions" data-preview-field="${index}:customerName" value="${escapeAttr(row.customerName || "")}" placeholder="输入或选择客户" />
                </td>
                <td><input class="cell-input small" data-preview-field="${index}:site" value="${escapeAttr(row.site || "")}" /></td>
                <td>
                  ${row.productImage ? `<img class="thumb" src="${row.productImage}" alt="产品图" />` : `<span class="tag red">缺图</span>`}
                  <input class="image-input" type="file" accept="image/*" data-preview-image="${index}" />
                </td>
                <td>
                  <input class="cell-input" data-preview-field="${index}:productName" value="${escapeAttr(row.productName || "")}" />
                  <input class="cell-input" data-preview-field="${index}:asin" value="${escapeAttr(row.asin || "")}" style="margin-top:6px" />
                </td>
                <td><input class="cell-input" data-preview-field="${index}:keyword" value="${escapeAttr(row.keyword || "")}" /></td>
                <td>
                  <input class="cell-input small" data-preview-field="${index}:price" value="${escapeAttr(row.price || "")}" />
                  <input class="cell-input" data-preview-field="${index}:store" value="${escapeAttr(row.store || "")}" style="margin-top:6px" />
                </td>
                <td><input class="cell-input" data-preview-field="${index}:variant" value="${escapeAttr(row.variant || "")}" /></td>
                <td><input class="cell-input small" data-preview-field="${index}:project" value="${escapeAttr(row.project || "")}" /></td>
                <td>
                  <input class="cell-input" data-preview-field="${index}:requirementRemark" value="${escapeAttr(row.requirementRemark || "")}" placeholder="要求" />
                  <input class="cell-input" data-preview-field="${index}:remark" value="${escapeAttr(row.remark || "")}" placeholder="备注" style="margin-top:6px" />
                </td>
                <td>${row.errors.join("；")}</td>
              </tr>
            `)
            .join("")}
        </tbody>
      </table>
    </div>
    <datalist id="customerOptions">
      ${visibleCustomers().map((c) => `<option value="${escapeAttr(c.name)}"></option>`).join("")}
    </datalist>
  `;
}

function bindImport() {
  document.querySelector("#parsePaste").addEventListener("click", () => {
    const type = document.querySelector("#importType").value;
    const text = document.querySelector("#pasteArea").value;
    state.importPreview = parsePastedRows(text, type);
    log("导入识别", `${type} / ${state.importPreview.length} 行`);
    saveState();
    render();
  });
  document.querySelector("#clearImport").addEventListener("click", () => {
    state.importPreview = [];
    saveState();
    render();
  });
  document.querySelector("#submitPreview").addEventListener("click", () => {
    const valid = state.importPreview.filter((r) => !r.errors.length);
    valid.forEach((r) => {
      ensureImportCustomer(r);
      state.orders.unshift(createOrderFromData(r, currentUser().id));
    });
    log("批量提交订单", `${valid.length} 条`);
    state.importPreview = state.importPreview.filter((r) => r.errors.length);
    saveState();
    toast(`已提交 ${valid.length} 条有效订单`);
    render();
  });
  document.querySelectorAll("[data-preview-image]").forEach((input) => {
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      const index = Number(input.dataset.previewImage);
      if (!file || !state.importPreview[index]) return;
      const reader = new FileReader();
      reader.onload = () => {
        state.importPreview[index].productImage = reader.result;
        state.importPreview[index].errors = validateImportRow(state.importPreview[index]);
        saveState();
        render();
      };
      reader.readAsDataURL(file);
    });
  });
  document.querySelectorAll("[data-preview-field]").forEach((input) => {
    input.addEventListener("change", updatePreviewField);
    input.addEventListener("blur", updatePreviewField);
  });
}

function updatePreviewField(event) {
  const [indexRaw, field] = event.currentTarget.dataset.previewField.split(":");
  const index = Number(indexRaw);
  const row = state.importPreview[index];
  if (!row) return;
  row[field] = event.currentTarget.value;
  if (field === "customerName") {
    const customer = state.customers.find((c) => c.name === row.customerName.trim());
    row.customerId = customer?.id || "";
  }
  if (field === "type" && row.type === "直评") {
    row.platform = "亚马逊";
    row.site = normalizeDirectSite(row.site);
    row.project = row.project && row.project !== "免评" ? row.project : "直评";
  }
  if (field === "type" && row.type === "VP") {
    row.platform = row.platform || "亚马逊";
    row.site = normalizeSite(row.site);
  }
  if (field === "site") {
    row.site = row.type === "直评" ? normalizeDirectSite(row.site) : normalizeSite(row.site);
  }
  if (field === "asin") row.asin = extractAsin(row.asin);
  if (field === "variant" && row.type === "VP") row.variant = normalizeVariant(row.variant);
  row.errors = validateImportRow(row);
  saveState();
  render();
}

function validateImportRow(row) {
  const errors = [];
  if (!row.customerId && !String(row.customerName || "").trim()) errors.push("缺少客户，请在预览中选择或填写");
  if (!row.site) errors.push("缺少站点");
  if (row.type === "VP") {
    if (!row.productName) errors.push("缺少产品名");
    if (!row.keyword) errors.push("缺少关键词");
    if (!row.asin) errors.push("缺少 ASIN");
    if (!row.price) errors.push("缺少价格");
    if (!row.store) errors.push("缺少店铺");
    if (!row.project) errors.push("缺少项目");
  } else {
    if (!row.asin) errors.push("缺少链接或 ASIN");
    if (!row.reviewTitle) errors.push("缺少评价标题");
    if (!row.reviewContent) errors.push("缺少评价内容");
    if (!row.warranty) errors.push("缺少质保");
  }
  if (!row.productImage) errors.push("缺少产品图片");
  return errors;
}

function escapeAttr(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function parsePastedRows(text, type) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return [];
  const table = lines.map((line) => line.split("\t").map((x) => x.trim()));
  const headerIndex = table.findIndex((row) => row.some((cell) => /站点|产品名|链接|ASIN|核对ASIN|评价标题/.test(cell)));
  if (headerIndex < 0) {
    return type === "VP" ? table.flatMap(parseVpRowByPosition) : [];
  }
  const headers = table[headerIndex];
  const dataRows = table.slice(headerIndex + 1);
  return dataRows
    .filter((row) => row.some(Boolean) && !String(row[0]).includes("示例行"))
    .flatMap((row) => type === "VP" ? parseVpRow(headers, row) : [parseDirectRow(headers, row)])
    .filter(Boolean);
}

function headerValue(headers, row, names) {
  const idx = headers.findIndex((h) => names.some((n) => String(h).includes(n)));
  return idx >= 0 ? row[idx] || "" : "";
}

function parseDirectRow(headers, row) {
  const customer = visibleCustomers()[0];
  const site = normalizeDirectSite(headerValue(headers, row, ["站点"]));
  const link = headerValue(headers, row, ["链接", "ASIN"]);
  const title = headerValue(headers, row, ["评价标题"]);
  const content = headerValue(headers, row, ["评价内容"]);
  const warrantyRaw = headerValue(headers, row, ["质保"]);
  const warranty = /30/.test(warrantyRaw) ? "30天" : /7/.test(warrantyRaw) ? "7天" : "";
  const parsed = {
    type: "直评",
    customerId: customer?.id || "",
    customerName: customer?.name || "",
    site,
    asin: extractAsin(link),
    project: "直评",
    warranty,
    reviewTitle: title,
    reviewContent: content,
    productImage: "",
    channelName: "待排渠道",
  };
  parsed.errors = validateImportRow(parsed);
  return parsed;
}

function parseVpRow(headers, row) {
  const requirement = headerValue(headers, row, ["下单要求", "项目"]);
  const specialRemark = headerValue(headers, row, ["特殊备注", "备注"]);
  const projects = expandVpRequirement(requirement);
  const base = {
    type: "VP",
    customerId: "",
    customerName: "",
    platform: "亚马逊",
    site: normalizeSite(headerValue(headers, row, ["站点"])),
    productName: headerValue(headers, row, ["产品名"]),
    keyword: headerValue(headers, row, ["关键词"]),
    price: headerValue(headers, row, ["价格"]),
    store: headerValue(headers, row, ["店铺"]),
    variant: normalizeVariant(headerValue(headers, row, ["变体"])),
    asin: extractAsin(headerValue(headers, row, ["核对ASIN", "ASIN"])),
    requirement,
    requirementRemark: extractVpRemark(requirement, specialRemark),
    remark: normalizeRemark(specialRemark),
    productImage: "",
    channelName: "待排渠道",
  };
  const make = (project) => {
    const item = { ...base, project };
    item.errors = validateImportRow(item);
    return item;
  };
  return projects.length ? projects.map(make) : [make("")];
}

function parseVpRowByPosition(row) {
  const cleaned = [...row];
  while (cleaned.length && cleaned[cleaned.length - 1] === "") cleaned.pop();
  if (!cleaned.length) return [];

  const customer = visibleCustomers()[0];
  const siteRaw = cleaned[0] || "";
  const productName = cleaned[2] || "";
  const keyword = cleaned[3] || "";
  const price = cleaned[4] || "";
  const store = cleaned[5] || "";
  const variant = normalizeVariant(cleaned[6]);
  const asin = extractAsin(cleaned[7] || "");
  const requirement = cleaned[8] || "";
  const specialRemark = cleaned[9] || "";
  const projects = expandVpRequirement(requirement);
  const requirementRemark = extractVpRemark(requirement, specialRemark);

  const base = {
    type: "VP",
    customerId: "",
    customerName: "",
    platform: "亚马逊",
    site: normalizeSite(siteRaw),
    productName,
    keyword,
    price,
    store,
    variant: variant || "无",
    asin,
    requirement,
    requirementRemark,
    remark: normalizeRemark(specialRemark),
    productImage: "",
    channelName: "待排渠道",
  };

  const make = (project) => {
    const item = { ...base, project };
    item.errors = validateImportRow(item);
    return item;
  };

  return projects.length ? projects.map(make) : [make("")];
}

function extractVpRemark(requirement, specialRemark) {
  const parts = [];
  const req = String(requirement || "");
  const cleanedReq = req
    .replace(/\d+\s*单?\s*(免评|文评|图评|视频|点星|feedback)/gi, "")
    .replace(/[，,、；;]+/g, " ")
    .trim();
  if (cleanedReq) parts.push(cleanedReq);
  return parts.join("，");
}

function ensureImportCustomer(row) {
  if (row.customerId) return;
  const name = String(row.customerName || "").trim();
  if (!name) return;
  const existing = state.customers.find((c) => c.name === name);
  if (existing) {
    row.customerId = existing.id;
    row.customerName = existing.name;
    return;
  }
  const user = currentUser();
  const customer = {
    id: uid("c"),
    customerNo: `CUS${today().replaceAll("-", "")}${String(state.customers.length + 1).padStart(4, "0")}`,
    name,
    wechat: "",
    phone: "",
    store: "",
    site: row.site || "",
    ownerId: user.role === "frontend" ? user.id : "u-fe-a",
    team: user.team || "一组",
    status: "待补联系方式",
    contactConfirmed: false,
    remark: "订单导入时临时创建，需补充微信和联系方式。",
    createdAt: today(),
    totalDealAmount: 0,
  };
  state.customers.unshift(customer);
  row.customerId = customer.id;
  row.customerName = customer.name;
}

function normalizeRemark(value) {
  const text = String(value || "").trim();
  return text === "无" ? "" : text;
}

function normalizeVariant(value) {
  const text = String(value || "").trim();
  if (!text || text.includes("变体名称")) return "无/自选";
  return text;
}

function expandVpRequirement(text) {
  const result = [];
  const source = String(text || "");
  const patterns = [
    ["免评", /(\d+)\s*单?\s*免评/],
    ["文评", /(\d+)\s*单?\s*文评/],
    ["图评", /(\d+)\s*单?\s*图评/],
    ["视频", /(\d+)\s*单?\s*视频/],
    ["点星", /(\d+)\s*单?\s*点星/],
    ["feedback", /(\d+)\s*单?\s*feedback/i],
  ];
  patterns.forEach(([name, re]) => {
    const match = source.match(re);
    if (match) {
      for (let i = 0; i < Number(match[1]); i += 1) result.push(name);
    }
  });
  if (!result.length) {
    const found = vpProjects.find((p) => source.includes(p));
    if (found) result.push(found);
  }
  return result;
}

function renderFinance() {
  const pending = state.orders.filter((o) => !o.voided && o.payoutStatus !== "已付款");
  const total = pending.reduce((sum, o) => sum + Number(o.payable || 0), 0);
  return `
    <section class="section">
      <div class="section-head"><h2>合并付款申请雏形</h2><span class="hint">后端批量选择后系统自动计算总额</span></div>
      <div class="metric"><span>当前待付款订单自动合计</span><strong>¥${money(total)}</strong></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>订单号</th><th>类型</th><th>渠道</th><th>应付款</th><th>付款状态</th></tr></thead>
          <tbody>${pending.map((o) => `<tr><td>${o.orderNo}</td><td>${o.type}</td><td>${o.channelName || "-"}</td><td>¥${money(o.payable)}</td><td>${o.payoutStatus}</td></tr>`).join("")}</tbody>
        </table>
      </div>
    </section>
  `;
}

function bindFinance() {}

function renderPricing() {
  const isAdmin = currentUser().role === "admin";
  return `
    <section class="section">
      <div class="section-head"><h2>直评亚马逊统一价格</h2><span class="hint">${isAdmin ? "管理员可修改，演示版暂为只读展示" : "仅管理员可修改"}</span></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>站点</th><th>7天质保</th><th>30天质保</th></tr></thead>
          <tbody>${state.pricing.direct.map((p) => `<tr><td>${p.site}</td><td>${p.warranty7}</td><td>${p.warranty30}</td></tr>`).join("")}</tbody>
        </table>
      </div>
    </section>
    <section class="section">
      <div class="section-head"><h2>VP 佣金模板</h2></div>
      <div class="grid cols-3">${Object.entries(state.pricing.vpCommissions).map(([k, v]) => `<div class="metric"><span>${k}</span><strong>${v}</strong></div>`).join("")}</div>
    </section>
  `;
}

function bindPricing() {}

function renderLogs() {
  return `
    <section class="section">
      <div class="section-head"><h2>操作日志</h2></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>时间</th><th>人员</th><th>操作</th><th>详情</th></tr></thead>
          <tbody>${state.logs.map((l) => `<tr><td>${l.at}</td><td>${l.user}</td><td>${l.action}</td><td>${l.detail}</td></tr>`).join("")}</tbody>
        </table>
      </div>
    </section>
  `;
}

render();
