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
  ["orders", "订单汇总"],
  ["import", "订单导入"],
  ["finance", "财务管理"],
  ["pricing", "业务报价"],
  ["logs", "操作日志"],
];

const vpPlatforms = ["亚马逊", "沃尔玛", "TK", "SHEIN", "TEMU"];
const vpSites = ["美国", "加拿大", "英国", "德国", "意大利", "法国", "西班牙", "日本", "澳大利亚", "中东"];
const vpProjects = ["免评", "点星", "feedback", "文评", "图评", "视频"];
const exchangeRateItems = [
  { key: "USD", label: "美国", currency: "美元" },
  { key: "GBP", label: "英国", currency: "英镑" },
  { key: "EUR", label: "欧元", currency: "欧元" },
  { key: "JPY", label: "日本", currency: "日元" },
  { key: "CAD", label: "加拿大", currency: "加币" },
  { key: "AUD", label: "澳大利亚", currency: "澳币" },
];
const orderTypes = [
  { key: "direct", label: "直评", prefix: "CP" },
  { key: "vp", label: "VP真人", legacy: "VP", prefix: "VP" },
  { key: "vine", label: "VINE定制", legacy: "VINE", prefix: "VN" },
  { key: "show", label: "买家秀", prefix: "BX" },
];
const orderTypeLabels = orderTypes.map((x) => x.label);

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

function nowIso() {
  return new Date().toISOString();
}

function money(n) {
  return Number(n || 0).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function isFinanciallyComplete(order) {
  return order.paymentStatus === "已收款" && order.payoutStatus === "已付款";
}

function completedUnits(order) {
  const items = order.batchOrders || [order];
  return items.filter((item) => isFinanciallyComplete(item));
}

function calculablePerformance(order) {
  return completedUnits(order).reduce((sum, item) => sum + Number(item.received || 0) - Number(item.paid || 0), 0);
}

function performanceText(order) {
  return completedUnits(order).length ? `¥${money(calculablePerformance(order))}` : "";
}

function orderStatusText(order) {
  if (order.voided) return "已作废";
  if (order.batchOrders?.length && completedUnits(order).length && completedUnits(order).length < order.batchOrders.length) return "部分完成";
  return isFinanciallyComplete(order) ? order.status || "已完成" : "未完成";
}

function submittedAtOf(order) {
  return order.submittedAt || `${order.acceptedAt || today()}T00:00:00.000Z`;
}

function submittedAtText(order) {
  return new Date(submittedAtOf(order)).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
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
    orderSummary: {
      query: "",
      expandedType: "",
      filters: {},
      showVoided: false,
      expandedBatchIds: {},
    },
    dispatchBuilder: null,
    dispatchDraft: null,
    pendingVoidOrderId: "",
    activeOrderDetailId: "",
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
      exchangeRates: defaultExchangeRates(),
    },
    importPreview: [],
  };
  saveState(seed);
  return seed;
}

let state = loadState();
state.orderSummary ||= { query: "", expandedType: "", filters: {} };
state.orderSummary.filters ||= {};
state.orderSummary.showVoided ||= false;
state.orderSummary.expandedBatchIds ||= {};
state.dispatchBuilder ||= null;
state.dispatchDraft ||= null;
state.pendingVoidOrderId ||= "";
state.activeOrderDetailId ||= "";
state = normalizeState(state);

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
      ${renderVoidConfirmModal()}
      ${renderDispatchBuilderModal()}
      ${renderOrderDetailModal()}
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

function normalizeState(next) {
  next.orderSummary ||= { query: "", expandedType: "", filters: {} };
  next.orderSummary.filters ||= {};
  next.orderSummary.showVoided ||= false;
  next.orderSummary.expandedBatchIds ||= {};
  next.orderSummary.completedFrom ||= "";
  next.orderSummary.completedTo ||= "";
  next.orderSummary.exportUserId ||= "";
  next.dispatchBuilder ||= null;
  next.dispatchDraft = normalizeDispatchDraft(next.dispatchDraft);
  next.pendingVoidOrderId ||= "";
  next.activeOrderDetailId ||= "";
  next.pricing ||= {};
  next.pricing.direct ||= [];
  next.pricing.vpCommissions ||= {};
  next.pricing.exchangeRates ||= defaultExchangeRates();
  exchangeRateItems.forEach((item) => {
    if (!next.pricing.exchangeRates[item.key]) next.pricing.exchangeRates[item.key] = defaultExchangeRates()[item.key];
  });
  next.orders = (next.orders || []).map(normalizeOrderWorkflow);
  return next;
}

function normalizeOrderWorkflow(order) {
  const next = { ...order };
  next.workflow ||= {};
  next.attachments ||= [];
  next.workflow.backendAcceptedAt ||= "";
  next.workflow.backendCompletedAt ||= "";
  next.workflow.backendDispatchedAt ||= next.workflow.backendAcceptedAt || "";
  next.workflow.backendOrderedAt ||= next.workflow.backendCompletedAt || "";
  next.workflow.customerPaymentProof ||= next.customerPaymentProof || "";
  next.workflow.customerPaymentSubmittedAt ||= next.customerPaymentSubmittedAt || "";
  next.workflow.customerPaymentSubmittedBy ||= next.customerPaymentSubmittedBy || "";
  next.workflow.financeCollectionConfirmedAt ||= next.financeCollectionConfirmedAt || "";
  next.workflow.financeCollectionConfirmedBy ||= next.financeCollectionConfirmedBy || "";
  next.workflow.collectionRejectReason ||= "";
  next.workflow.channelPaymentProof ||= next.channelPaymentProof || "";
  next.workflow.payoutRequestSubmittedAt ||= next.payoutRequestSubmittedAt || "";
  next.workflow.payoutRequestSubmittedBy ||= next.payoutRequestSubmittedBy || "";
  next.workflow.payoutRequestStatus ||= next.payoutRequestStatus || (next.payoutStatus === "已付款" ? "已付款" : "待后端提交");
  next.workflow.payeeName ||= next.payeeName || "";
  next.workflow.payeeAccount ||= next.payeeAccount || "";
  next.workflow.payeeMethod ||= next.payeeMethod || "微信";
  next.workflow.financePayoutProof ||= next.financePayoutProof || "";
  next.workflow.financePayoutConfirmedAt ||= next.financePayoutConfirmedAt || "";
  next.workflow.financePayoutConfirmedBy ||= next.financePayoutConfirmedBy || "";
  next.workflow.financeRejectReason ||= next.financeRejectReason || "";
  if (next.paymentStatus === "已收款" && !next.workflow.financeCollectionConfirmedAt) {
    next.workflow.financeCollectionConfirmedAt = next.completedAt || next.performanceAt || next.acceptedAt || today();
    next.workflow.financeCollectionConfirmedBy = next.workflow.financeCollectionConfirmedBy || "u-fin";
  }
  if (next.payoutStatus === "已付款" && !next.workflow.financePayoutConfirmedAt) {
    next.workflow.financePayoutConfirmedAt = next.completedAt || next.performanceAt || next.acceptedAt || today();
    next.workflow.financePayoutConfirmedBy = next.workflow.financePayoutConfirmedBy || "u-fin";
    next.workflow.payoutRequestStatus = "已付款";
  }
  return next;
}

function addOrderAttachment(order, type, dataUrl, title) {
  order.attachments ||= [];
  const existing = order.attachments.find((item) => item.type === type);
  const payload = {
    id: existing?.id || uid("att"),
    type,
    title: title || attachmentTypeLabel(type),
    url: dataUrl,
    uploadedAt: nowIso(),
    uploadedBy: currentUser()?.id || "",
  };
  if (existing) {
    Object.assign(existing, payload);
  } else {
    order.attachments.push(payload);
  }
  return payload;
}

function attachmentTypeLabel(type) {
  const labels = {
    customerPayment: "客户收款截图",
    channelPayment: "渠道收款/付款凭证",
    financePayout: "财务付款截图",
    productImage: "产品图片",
    reviewImage: "评价图",
  };
  return labels[type] || "附件";
}

function refreshOrderCompletion(order) {
  order.performance = Number(order.received || 0) - Number(order.paid || 0);
  if (!isFinanciallyComplete(order)) {
    if (order.status === "已完成") order.status = "未完成";
    return order;
  }
  const doneDate = today();
  order.status = "已完成";
  order.completedAt ||= doneDate;
  order.performanceAt ||= doneDate;
  return order;
}

function markBackendAccepted(order) {
  order.workflow ||= {};
  order.status = "已排单";
  order.workflow.backendAcceptedAt ||= nowIso();
  order.workflow.backendDispatchedAt ||= order.workflow.backendAcceptedAt;
  return order;
}

function markBackendHandled(order) {
  order.workflow ||= {};
  order.status = order.paymentStatus === "已收款" ? "已出单待付款" : "已出单待收款";
  order.workflow.backendCompletedAt = nowIso();
  order.workflow.backendOrderedAt = order.workflow.backendCompletedAt;
  return order;
}

function submitCustomerPaymentProof(order, proof) {
  order.workflow ||= {};
  order.workflow.customerPaymentProof = proof || order.workflow.customerPaymentProof;
  order.workflow.customerPaymentSubmittedAt = nowIso();
  order.workflow.customerPaymentSubmittedBy = currentUser()?.id || "";
  order.paymentStatus = "待财务确认";
  return order;
}

function submitPayoutRequest(order) {
  order.workflow ||= {};
  order.workflow.payoutRequestStatus = "待财务审核";
  order.workflow.payoutRequestSubmittedAt = nowIso();
  order.workflow.payoutRequestSubmittedBy = currentUser()?.id || "";
  order.workflow.financeRejectReason = "";
  order.payoutStatus = "待财务审核";
  order.status = "待财务付款";
  return order;
}

function confirmCollection(order, amount) {
  order.workflow ||= {};
  order.received = Number(amount || order.receivable || order.received || 0);
  order.paymentStatus = "已收款";
  order.workflow.financeCollectionConfirmedAt = nowIso();
  order.workflow.financeCollectionConfirmedBy = currentUser()?.id || "";
  order.workflow.collectionRejectReason = "";
  return refreshOrderCompletion(order);
}

function rejectCollection(order, reason) {
  order.workflow ||= {};
  order.paymentStatus = "收款退回";
  order.workflow.collectionRejectReason = reason || "收款凭证或金额异常";
  return order;
}

function confirmPayout(order, amount) {
  order.workflow ||= {};
  order.paid = Number(amount || order.payable || order.paid || 0);
  order.payoutStatus = "已付款";
  order.workflow.payoutRequestStatus = "已付款";
  order.workflow.financePayoutConfirmedAt = nowIso();
  order.workflow.financePayoutConfirmedBy = currentUser()?.id || "";
  order.workflow.financeRejectReason = "";
  return refreshOrderCompletion(order);
}

function rejectPayout(order, reason) {
  order.workflow ||= {};
  order.payoutStatus = "财务已退回";
  order.workflow.payoutRequestStatus = "财务已退回";
  order.workflow.financeRejectReason = reason || "付款信息异常";
  order.status = "付款退回待修正";
  return order;
}

function defaultExchangeRates() {
  return {
    USD: 7.20,
    GBP: 9.10,
    EUR: 7.80,
    JPY: 0.050,
    CAD: 5.25,
    AUD: 4.75,
    updatedAt: "",
    source: "参考",
  };
}

function normalizeDispatchDraft(draft) {
  if (!draft) return null;
  if (Array.isArray(draft.rows)) return draft;
  const projects = Array.isArray(draft.projects) && draft.projects.length ? draft.projects : parseLegacyProjectText(draft.projectText);
  const safeProjects = projects.length ? projects : [{ count: 1, project: "免评" }];
  return {
    orderId: draft.orderId,
    orderNo: draft.orderNo || "",
    rows: safeProjects.flatMap((item) =>
      Array.from({ length: Math.max(1, Number(item.count || 1)) }, () => ({
        productName: draft.productName || "",
        keyword: draft.keyword || "",
        asin: draft.asin || "",
        variant: draft.variant || "无",
        price: draft.price || "",
        store: draft.store || "",
        project: item.project || "免评",
        requirement: draft.requirement || "无",
      })),
    ),
  };
}

function parseLegacyProjectText(text) {
  return String(text || "")
    .split(/[，,]/)
    .map((part) => part.trim().match(/^(\d+)\s*单\s*(.+)$/))
    .filter(Boolean)
    .map((match) => ({ count: Math.max(1, Number(match[1])), project: match[2].trim() }));
}

function renderVoidConfirmModal() {
  if (!state.pendingVoidOrderId) return "";
  const order = state.orders.find((o) => o.id === state.pendingVoidOrderId);
  if (!order) return "";
  return `
    <div class="modal-backdrop">
      <div class="modal" role="dialog" aria-modal="true">
        <h2>确认作废订单</h2>
        <p>订单 ${order.orderNo} 作废后不会删除历史记录，但前端不能自行恢复；如需恢复，必须由后端订单处理人员操作。</p>
        <div class="modal-actions">
          <button class="btn ghost" id="cancelVoidOrder">取消</button>
          <button class="btn danger" id="confirmVoidOrder">确认作废</button>
        </div>
      </div>
    </div>
  `;
}

function renderDispatchBuilderModal() {
  const builder = state.dispatchBuilder;
  if (!builder) return "";
  return `
    <div class="modal-backdrop">
      <div class="modal dispatch-builder-modal" role="dialog" aria-modal="true">
        <h2>设置排单项目</h2>
        <div class="dispatch-builder-list">
          ${builder.lines
            .map(
              (line, index) => `
                <div class="dispatch-builder-row">
                  <input type="number" min="1" data-builder-count="${index}" value="${escapeAttr(line.count || 1)}" />
                  <select data-builder-project="${index}">
                    ${vpProjects.map((project) => `<option ${line.project === project ? "selected" : ""}>${project}</option>`).join("")}
                  </select>
                  ${
                    index === builder.lines.length - 1
                      ? `<button class="icon-btn" data-add-builder-line title="新增项目">+</button>`
                      : `<button class="icon-btn" data-remove-builder-line="${index}" title="删除项目">-</button>`
                  }
                </div>
              `,
            )
            .join("")}
        </div>
        <div class="modal-actions">
          <button class="btn ghost" id="cancelDispatchBuilder">取消</button>
          <button class="btn primary" id="confirmDispatchBuilder">确认</button>
        </div>
      </div>
    </div>
  `;
}

function renderOrderDetailModal() {
  if (!state.activeOrderDetailId) return "";
  const order = findOrderForDetail(state.activeOrderDetailId);
  if (!order) return "";
  const customer = state.customers.find((c) => c.id === order.customerId);
  const workflow = order.workflow || {};
  const batchOrders = order.batchOrders || [order];
  return `
    <div class="modal-backdrop">
      <div class="modal detail-modal" role="dialog" aria-modal="true">
        <div class="detail-head">
          <div>
            <h2>${order.orderNo}</h2>
            <div class="hint">${orderTypeLabel(order.type)} / ${customer?.name || "未知客户"} / ${projectSummaryText(order)}</div>
          </div>
          <button class="icon-btn" id="closeOrderDetail" title="关闭">×</button>
        </div>
        <div class="detail-grid">
          <section class="detail-panel">
            <h3>基础信息</h3>
            ${detailLine("客户", customer?.name || "-")}
            ${detailLine("接单人", userName(order.frontendId))}
            ${detailLine("对接后端", userName(order.backendId))}
            ${detailLine("提交时间", fullDateTimeText(submittedAtOf(order)))}
            ${detailLine("完成时间", completedDateOf(order) || "-")}
            ${detailLine("平台/站点", `${order.platform || "-"} / ${order.site || "-"}`)}
            ${detailLine("产品/ASIN", `${order.productName || "-"} / ${order.asin || "-"}`)}
            ${detailLine("需求", order.requirement || order.requirementRemark || order.remark || "-")}
            ${orderTypeLabel(order.type) === "VP真人" ? detailLine("关键词", order.keyword || "-") : ""}
            ${orderTypeLabel(order.type) === "VP真人" ? detailLine("店铺名", order.store || "-") : ""}
            ${orderTypeLabel(order.type) === "VP真人" ? detailLine("客户订单需求", projectSummaryText(order)) : ""}
          </section>
          <section class="detail-panel">
            <h3>处理流程</h3>
            ${detailStep("后端排单", workflow.backendDispatchedAt || workflow.backendAcceptedAt, Boolean(workflow.backendDispatchedAt || workflow.backendAcceptedAt))}
            ${detailStep("后端已出单", workflow.backendOrderedAt || workflow.backendCompletedAt, Boolean(workflow.backendOrderedAt || workflow.backendCompletedAt))}
            ${detailStep("财务确认收款", workflow.financeCollectionConfirmedAt, order.paymentStatus === "已收款")}
            ${detailStep("提交付款", workflow.payoutRequestSubmittedAt, workflow.payoutRequestStatus === "待财务审核" || workflow.payoutRequestStatus === "已付款")}
            ${detailStep("财务确认付款", workflow.financePayoutConfirmedAt, order.payoutStatus === "已付款")}
          </section>
          <section class="detail-panel">
            <h3>财务凭证</h3>
            ${detailLine("应收/实收", `¥${money(order.receivable || 0)} / ¥${money(order.received || 0)}`)}
            ${detailLine("应付/实付", `¥${money(order.payable || 0)} / ¥${money(order.paid || 0)}`)}
            ${detailLine("业绩", performanceText(order) || "未完成")}
            ${detailLine("收款状态", order.paymentStatus || "-")}
            ${detailLine("付款状态", order.payoutStatus || "-")}
            ${detailLine("付款申请", workflow.payoutRequestStatus || "-")}
            ${workflow.collectionRejectReason ? `<div class="reject-note wide">收款退回：${escapeHtml(workflow.collectionRejectReason)}</div>` : ""}
            ${workflow.financeRejectReason ? `<div class="reject-note wide">付款退回：${escapeHtml(workflow.financeRejectReason)}</div>` : ""}
          </section>
          <section class="detail-panel">
            <h3>渠道与收款方</h3>
            ${detailLine("实际渠道", order.channelName || "-")}
            ${detailLine("收款方", workflow.payeeName || "-")}
            ${detailLine("收款方式", workflow.payeeMethod || "-")}
            ${detailLine("收款账户", workflow.payeeAccount || "-")}
          </section>
        </div>
        <section class="detail-panel detail-full">
          <h3>附件凭证</h3>
          ${renderAttachmentGallery(order)}
        </section>
        ${
          batchOrders.length > 1
            ? `<section class="detail-panel detail-full">
                <h3>同批订单明细</h3>
                <div class="table-wrap detail-table-wrap">
                  <table class="compact-table">
                    <thead><tr><th>订单号</th><th>项目</th><th>收付款</th><th>状态</th><th>完成时间</th></tr></thead>
                    <tbody>${batchOrders.map((item) => `<tr><td>${item.orderNo}</td><td>${projectSummaryText(item)}</td><td>收 ¥${money(item.received)}<br><span class="hint">付 ¥${money(item.paid)}</span></td><td>${statusBadge(orderStatusText(item))}</td><td>${completedDateOf(item) || "-"}</td></tr>`).join("")}</tbody>
                  </table>
                </div>
              </section>`
            : ""
        }
        <section class="detail-panel detail-full">
          <h3>订单操作记录</h3>
          ${renderOrderTimeline(order)}
        </section>
      </div>
    </div>
  `;
}

function findOrderForDetail(id) {
  if (String(id || "").startsWith("batch:")) {
    const batchId = String(id).slice(6);
    return mergeBatchOrders(state.orders).find((order) => order.batchId === batchId);
  }
  const direct = state.orders.find((order) => order.id === id);
  if (direct) return direct;
  return mergeBatchOrders(state.orders).find((order) => batchKeyOf(order) === id || order.id === id);
}

function detailLine(label, value) {
  return `<div class="detail-line"><span>${label}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function detailStep(label, at, done) {
  return `
    <div class="detail-step ${done ? "done" : ""}">
      <span></span>
      <div><strong>${label}</strong><em>${at ? shortDateTime(at) : "待处理"}</em></div>
    </div>
  `;
}

function renderAttachmentGallery(order) {
  const workflow = order.workflow || {};
  const derived = [
    workflow.customerPaymentProof ? { type: "customerPayment", title: "客户收款截图", url: workflow.customerPaymentProof, uploadedAt: workflow.customerPaymentSubmittedAt, uploadedBy: workflow.customerPaymentSubmittedBy } : null,
    workflow.channelPaymentProof ? { type: "channelPayment", title: "渠道收款/付款凭证", url: workflow.channelPaymentProof, uploadedAt: workflow.payoutRequestSubmittedAt, uploadedBy: workflow.payoutRequestSubmittedBy } : null,
    workflow.financePayoutProof ? { type: "financePayout", title: "财务付款截图", url: workflow.financePayoutProof, uploadedAt: workflow.financePayoutConfirmedAt, uploadedBy: workflow.financePayoutConfirmedBy } : null,
    order.productImage ? { type: "productImage", title: "产品图片", url: order.productImage, uploadedAt: submittedAtOf(order), uploadedBy: order.frontendId } : null,
    order.reviewImage ? { type: "reviewImage", title: "评价图", url: order.reviewImage, uploadedAt: submittedAtOf(order), uploadedBy: order.frontendId } : null,
    ...(order.attachments || []),
  ].filter(Boolean);
  const unique = [];
  derived.forEach((item) => {
    if (!item.url || unique.some((existing) => existing.type === item.type && existing.url === item.url)) return;
    unique.push(item);
  });
  if (!unique.length) return `<div class="empty compact-empty">暂无附件凭证</div>`;
  return `<div class="attachment-grid">${unique.map(renderAttachmentCard).join("")}</div>`;
}

function renderAttachmentCard(item) {
  const isImage = /^data:image|\.(png|jpe?g|gif|webp)$/i.test(String(item.url || ""));
  return `
    <div class="attachment-card">
      ${isImage ? `<img src="${item.url}" alt="${escapeAttr(item.title || "附件")}" />` : `<div class="attachment-file">文件</div>`}
      <strong>${escapeHtml(item.title || attachmentTypeLabel(item.type))}</strong>
      <span>${item.uploadedAt ? shortDateTime(item.uploadedAt) : "未记录时间"} / ${userName(item.uploadedBy)}</span>
    </div>
  `;
}

function renderOrderTimeline(order) {
  const orderNos = (order.batchOrders || [order]).map((item) => item.orderNo).filter(Boolean);
  const related = state.logs.filter((item) => orderNos.some((orderNo) => String(item.detail || "").includes(orderNo))).slice(0, 12);
  if (!related.length) return `<div class="empty compact-empty">暂无针对该订单的操作日志</div>`;
  return `<div class="timeline-list">${related.map((item) => `<div><span>${item.at}</span><strong>${item.action}</strong><em>${escapeHtml(item.detail)}</em></div>`).join("")}</div>`;
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
    state = normalizeState(loadState());
    toast("演示数据已重置");
    render();
  });
  document.querySelector("#cancelVoidOrder")?.addEventListener("click", () => {
    state.pendingVoidOrderId = "";
    saveState();
    render();
  });
  document.querySelector("#confirmVoidOrder")?.addEventListener("click", () => {
    const o = state.orders.find((x) => x.id === state.pendingVoidOrderId);
    if (!o) return;
    o.voided = true;
    o.voidedAt = new Date().toISOString();
    o.voidedBy = currentUser().id;
    state.pendingVoidOrderId = "";
    log("订单作废", `${o.orderNo}，恢复需后端处理`);
    saveState();
    toast("订单已作废，恢复需后端处理");
    render();
  });
  document.querySelector("#closeOrderDetail")?.addEventListener("click", () => {
    state.activeOrderDetailId = "";
    saveState();
    render();
  });
  document.querySelector("#cancelDispatchBuilder")?.addEventListener("click", () => {
    state.dispatchBuilder = null;
    saveState();
    render();
  });
  document.querySelectorAll("[data-builder-count]").forEach((input) => {
    input.addEventListener("input", (event) => {
      const index = Number(event.currentTarget.dataset.builderCount);
      state.dispatchBuilder.lines[index].count = Math.max(1, Number(event.currentTarget.value || 1));
      saveState();
    });
  });
  document.querySelectorAll("[data-builder-project]").forEach((select) => {
    select.addEventListener("change", (event) => {
      const index = Number(event.currentTarget.dataset.builderProject);
      state.dispatchBuilder.lines[index].project = event.currentTarget.value;
      saveState();
    });
  });
  document.querySelector("[data-add-builder-line]")?.addEventListener("click", () => {
    state.dispatchBuilder.lines.push({ count: 1, project: "免评" });
    saveState();
    render();
  });
  document.querySelectorAll("[data-remove-builder-line]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.dispatchBuilder.lines.splice(Number(btn.dataset.removeBuilderLine), 1);
      saveState();
      render();
    });
  });
  document.querySelector("#confirmDispatchBuilder")?.addEventListener("click", async () => {
    const builder = state.dispatchBuilder;
    const order = state.orders.find((o) => o.id === builder?.orderId);
    if (!builder || !order) return;
    state.dispatchDraft = appendDispatchRows(state.dispatchDraft, order, builder.lines);
    state.dispatchBuilder = null;
    saveState();
    render();
    copyText(dispatchSheetCopyText(state.dispatchDraft));
    toast("排单表已生成并复制");
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
    .filter((o) => !o.voided && isFinanciallyComplete(o) && o.performanceAt === date)
    .reduce((map, o) => {
      map[o.frontendId] = (map[o.frontendId] || 0) + calculablePerformance(o);
      return map;
    }, {});
}

function rankingFor(date) {
  const perf = performanceOn(date);
  return Object.entries(perf)
    .map(([userId, amount]) => ({ user: users.find((u) => u.id === userId), amount }))
    .filter((x) => x.user && x.user.role !== "admin")
    .sort((a, b) => b.amount - a.amount);
}

function renderDashboard() {
  const orders = visibleOrders().filter((o) => !o.voided);
  const todayRank = dashboardRankRows(today());
  const champs = [today(-1), today(-2), today(-3)].map((d) => ({ date: d, item: rankingFor(d).find((row) => row.amount >= 2000) }));
  const totalPerformance = orders.reduce((sum, o) => sum + calculablePerformance(o), 0);
  const pendingCollection = orders.filter((o) => o.paymentStatus !== "已收款").length;
  return `
    ${currentUser().role === "admin" ? renderAdminDashboardPanel() : ""}
    <section class="section">
      <div class="section-head"><h2>近三天销冠</h2><span class="hint">每日业绩满 ¥2,000 后参与争夺，管理员不参与</span></div>
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
      <div class="section-head"><h2>当天实时业绩排名</h2><span class="hint">固定展示前三名，最后更新：${new Date().toLocaleTimeString("zh-CN")}</span></div>
      ${renderRankTable(todayRank)}
    </section>
    <section class="grid cols-3">
      <div class="metric"><span>可见订单数</span><strong>${orders.length}</strong></div>
      <div class="metric"><span>可见客户数</span><strong>${visibleCustomers().length}</strong></div>
      <div class="metric"><span>累计业绩</span><strong>¥${money(totalPerformance)}</strong></div>
      <div class="metric"><span>待催款订单</span><strong>${pendingCollection}</strong></div>
      <div class="metric"><span>销冠参与线</span><strong>¥2,000</strong></div>
      <div class="metric"><span>次日晨会奖励</span><strong>¥100</strong></div>
    </section>
  `;
}

function dashboardRankRows(date) {
  const ranked = rankingFor(date);
  const staff = users.filter((user) => user.role !== "admin");
  const rows = [...ranked];
  staff.forEach((user) => {
    if (!rows.some((row) => row.user.id === user.id)) rows.push({ user, amount: 0 });
  });
  while (rows.length < 3) rows.push({ user: { name: "暂无员工", team: "-" }, amount: 0, empty: true });
  return rows.slice(0, 3);
}

function monthKey(date = today()) {
  return String(date).slice(0, 7);
}

function isThisMonth(value) {
  return String(value || "").slice(0, 7) === monthKey();
}

function dashboardOrderDate(order) {
  return String(submittedAtOf(order)).slice(0, 10);
}

function dashboardCompletedDate(order) {
  return order.completedAt || order.performanceAt || order.acceptedAt || dashboardOrderDate(order);
}

function dashboardOrdersByType(typeLabel) {
  return state.orders.filter((order) => !order.voided && orderTypeLabel(order.type) === typeLabel);
}

function renderAdminDashboardPanel() {
  const direct = dashboardOrdersByType("直评");
  const vp = dashboardOrdersByType("VP真人");
  const directToday = direct.filter((order) => dashboardOrderDate(order) === today()).length;
  const vpToday = vp.filter((order) => dashboardOrderDate(order) === today()).length;
  const directMonthDone = direct.filter((order) => isFinanciallyComplete(order) && isThisMonth(dashboardCompletedDate(order))).length;
  const vpMonthDone = vp.filter((order) => isFinanciallyComplete(order) && isThisMonth(dashboardCompletedDate(order))).length;
  const directMonthProfit = direct
    .filter((order) => isFinanciallyComplete(order) && isThisMonth(dashboardCompletedDate(order)))
    .reduce((sum, order) => sum + calculablePerformance(order), 0);
  const vpMonthProfit = vp
    .filter((order) => isFinanciallyComplete(order) && isThisMonth(dashboardCompletedDate(order)))
    .reduce((sum, order) => sum + calculablePerformance(order), 0);
  const newCustomersToday = state.customers.filter((customer) => customer.createdAt === today()).length;
  const newCustomersMonth = state.customers.filter((customer) => isThisMonth(customer.createdAt)).length;
  const teams = ["一组", "二组", "三组", "四组"];
  return `
    <section class="section admin-dashboard">
      <div class="section-head"><h2>管理员经营仪表盘</h2><span class="hint">按财务完成订单计算利润和业绩</span></div>
      <div class="admin-dashboard-top">
        <div class="admin-kpi-list">
          ${renderAdminKpiRow("当天直评订单数", directToday)}
          ${renderAdminKpiRow("本月直评订单已完成", `${directMonthDone}/2500`)}
          ${renderAdminKpiRow("本月直评利润", money(directMonthProfit))}
          ${renderAdminKpiRow("当天VP订单数", vpToday)}
          ${renderAdminKpiRow("本月VP订单已完成", `${vpMonthDone}/200`)}
          ${renderAdminKpiRow("本月VP订单利润", money(vpMonthProfit))}
        </div>
        <div class="admin-kpi-list compact">
          ${renderAdminKpiRow("新增客户量", newCustomersToday)}
          ${renderAdminKpiRow("本月新增客户量", newCustomersMonth)}
          ${renderAdminKpiRow("累计合作客户量", state.customers.length)}
        </div>
      </div>
      <div class="admin-team-title">本月小组累计业绩</div>
      <div class="table-wrap admin-team-table">
        <table>
          <thead><tr><th>小组</th><th>直评业绩</th><th>VP业绩</th><th>合计</th></tr></thead>
          <tbody>
            ${teams.map((team) => {
              const directAmount = teamMonthPerformance(team, "直评");
              const vpAmount = teamMonthPerformance(team, "VP真人");
              return `<tr><td>${team}</td><td>¥${money(directAmount)}</td><td>¥${money(vpAmount)}</td><td><strong>¥${money(directAmount + vpAmount)}</strong></td></tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderAdminKpiRow(label, value) {
  return `<div class="admin-kpi-row"><span>${label}：</span><strong>${value}</strong></div>`;
}

function teamMonthPerformance(team, typeLabel) {
  const teamUserIds = users.filter((user) => user.team === team).map((user) => user.id);
  return state.orders
    .filter((order) => !order.voided && orderTypeLabel(order.type) === typeLabel)
    .filter((order) => teamUserIds.includes(order.frontendId))
    .filter((order) => isFinanciallyComplete(order) && isThisMonth(dashboardCompletedDate(order)))
    .reduce((sum, order) => sum + calculablePerformance(order), 0);
}

function renderRankTable(items) {
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>排名</th><th>员工</th><th>小组</th><th>当天业绩</th></tr></thead>
        <tbody>
          ${items
            .map((row, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${row.user.name}</td>
                <td>${row.user.team}</td>
                <td>¥${money(row.amount)}</td>
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
  const adminView = user.role === "admin";
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
          <thead><tr><th>客户编号</th><th>客户</th>${adminView ? "<th>归属</th>" : ""}<th>联系方式</th><th>店铺</th><th>状态</th><th>累计成交</th>${adminView ? "<th>业绩</th>" : ""}<th>备注</th></tr></thead>
          <tbody>
            ${rows
              .map((c) => `
                <tr>
                  <td>${c.customerNo}</td>
                  <td>${c.name}</td>
                  ${adminView ? `<td>${customerOwnerName(c)}</td>` : ""}
                  <td>${user.role === "admin" ? `${c.wechat}<br>${c.phone}` : "已隐藏"}</td>
                  <td>${c.store}</td>
                  <td><span class="tag ${c.status === "已作废" ? "red" : "green"}">${c.status}</span></td>
                  <td>¥${money(customerDealAmount(c.id))}</td>
                  ${adminView ? `<td>¥${money(customerPerformance(c.id))}</td>` : ""}
                  <td>${c.remark || ""}</td>
                </tr>
              `)
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function customerOwnerName(customer) {
  const owner = users.find((u) => u.id === customer.ownerId);
  return owner ? `${owner.name}<br><span class="hint">${owner.team}</span>` : "-";
}

function customerPerformance(customerId) {
  return state.orders
    .filter((order) => !order.voided && order.customerId === customerId && isFinanciallyComplete(order))
    .reduce((sum, order) => sum + calculablePerformance(order), 0);
}

function customerDealAmount(customerId) {
  return state.orders
    .filter((order) => !order.voided && order.customerId === customerId && isFinanciallyComplete(order))
    .reduce((sum, order) => sum + Number(order.received || 0), 0);
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
}

function renderOrders() {
  state.orderSummary ||= { query: "", expandedType: "", filters: {} };
  const orders = visibleOrders().filter((o) => Boolean(o.voided) === Boolean(state.orderSummary.showVoided));
  const user = currentUser();
  const query = state.orderSummary.query || "";
  const expandedType = state.orderSummary.expandedType || "";
  const summaryOrders = filterOrdersByCompletionDate(filterOrdersByQuery(orders, query));
  const activeType = expandedType && orderTypes.find((t) => t.label === expandedType || t.legacy === expandedType);
  return `
    ${user.role === "leader" ? renderLeaderOrderSummary(summaryOrders) : ""}
    <section class="section">
      <div class="section-head"><h2>订单查询</h2><span class="hint">${user.role === "frontend" ? "仅展示个人订单" : user.role === "leader" ? "展示本组订单" : "按角色权限展示可见订单"}</span></div>
      <div class="toolbar">
        <input id="orderSearch" value="${escapeAttr(query)}" placeholder="搜索订单号、客户、产品、ASIN、项目" />
        <input id="completedFrom" type="date" value="${escapeAttr(state.orderSummary.completedFrom || "")}" title="完成时间开始" />
        <input id="completedTo" type="date" value="${escapeAttr(state.orderSummary.completedTo || "")}" title="完成时间结束" />
        ${user.role === "admin" ? renderExportUserSelect() : ""}
        <button class="btn primary" id="runOrderSearch">查询</button>
        <button class="btn ghost" id="clearOrderSearch">清空</button>
        <button class="btn ghost" id="exportOrders">导出订单</button>
        ${activeType ? `<button class="btn ghost" id="backOrderSummary">返回四类汇总</button>` : ""}
        <button class="btn ghost toolbar-right" id="toggleVoidedOrders">${state.orderSummary.showVoided ? "返回全部订单" : "作废订单列表"}</button>
      </div>
    </section>
    ${
      activeType
        ? renderExpandedOrderType(activeType, summaryOrders)
        : orderTypes.map((type) => renderOrderTypePreview(type, summaryOrders)).join("")
    }
  `;
}

function renderExportUserSelect() {
  return `
    <select id="exportUserId" title="导出人员">
      <option value="">全部人员</option>
      ${users.map((user) => `<option value="${user.id}" ${state.orderSummary.exportUserId === user.id ? "selected" : ""}>${user.name}</option>`).join("")}
    </select>
  `;
}

function renderDispatchDraft() {
  const draft = state.dispatchDraft;
  if (!draft) return "";
  const projects = summarizeDraftProjects(draft.rows);
  return `
    <section class="section dispatch-section">
      <div class="section-head">
        <h2>${projects.map((item) => `${item.count}单${item.project}`).join("，")} 排单表</h2>
        <div class="toolbar compact">
          <span class="hint">已根据 ${draft.orderNo} 自动填充，可修改后提交</span>
          <button class="btn ghost" id="cancelDispatchDraft">关闭</button>
        </div>
      </div>
      <div class="table-wrap">
        <table class="dispatch-table">
          <thead><tr><th>产品名</th><th>关键词</th><th>ASIN</th><th>变体</th><th>价格</th><th>店铺</th><th>项目</th><th>备注要求</th></tr></thead>
          <tbody>
            ${draft.rows
              .map(
                (row, index) => `
                  <tr>
                    <td><input data-dispatch-row="${index}" data-dispatch-field="productName" value="${escapeAttr(row.productName || "")}" /></td>
                    <td><input data-dispatch-row="${index}" data-dispatch-field="keyword" value="${escapeAttr(row.keyword || "")}" /></td>
                    <td><input data-dispatch-row="${index}" data-dispatch-field="asin" value="${escapeAttr(row.asin || "")}" /></td>
                    <td><input data-dispatch-row="${index}" data-dispatch-field="variant" value="${escapeAttr(row.variant || "")}" /></td>
                    <td><input data-dispatch-row="${index}" data-dispatch-field="price" value="${escapeAttr(row.price || "")}" /></td>
                    <td><input data-dispatch-row="${index}" data-dispatch-field="store" value="${escapeAttr(row.store || "")}" /></td>
                    <td><input data-dispatch-row="${index}" data-dispatch-field="project" value="${escapeAttr(row.project || "")}" /></td>
                    <td><input data-dispatch-row="${index}" data-dispatch-field="requirement" value="${escapeAttr(row.requirement || "")}" /></td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
      <div class="dispatch-actions">
        <button class="btn primary" id="submitDispatchDraft">提交排单</button>
      </div>
    </section>
  `;
}

function orderTypeLabel(type) {
  const found = orderTypes.find((item) => item.label === type || item.legacy === type);
  return found?.label || type || "直评";
}

function directProjectLabel(project) {
  if (/^[1-5]星$/.test(project || "")) return project;
  return "5星";
}

function projectLinesOf(order) {
  if (order.projectLines?.length) return consolidateProjectLines(order.projectLines);
  if (orderTypeLabel(order.type) === "直评") {
    return [{ count: Number(order.quantity || 1), project: directProjectLabel(order.project) }];
  }
  return [{ count: Number(order.quantity || 1), project: order.project || orderTypeLabel(order.type) }];
}

function consolidateProjectLines(lines) {
  const map = new Map();
  lines.forEach((line) => {
    const project = line.project || "项目";
    map.set(project, (map.get(project) || 0) + Math.max(1, Number(line.count || 1)));
  });
  return [...map.entries()].map(([project, count]) => ({ count, project }));
}

function projectSummaryText(order) {
  return projectLinesOf(order)
    .map((line) => `${line.count}单${line.project}`)
    .join("，");
}

function projectSummaryHtml(order) {
  return projectLinesOf(order)
    .map((line) => `${line.count}单${escapeHtml(line.project)}`)
    .join("<br>");
}

function batchChildrenOf(order) {
  return order.batchOrders || [order];
}

function directUnitReceivable(order) {
  const explicit = Number(order.receivable || 0);
  if (explicit > 0) return explicit;
  const site = normalizeDirectSite(order.site || "");
  const priceRow = state.pricing.direct.find((item) => normalizeDirectSite(item.site) === site || item.site === site);
  const warranty = String(order.warranty || "");
  if (!priceRow) return 0;
  return warranty.includes("30") ? Number(priceRow.warranty30 || 0) : Number(priceRow.warranty7 || 0);
}

function pendingCollectionAmount(order) {
  return batchChildrenOf(order)
    .filter((child) => child.paymentStatus !== "已收款")
    .reduce((sum, child) => sum + (Number(child.receivable || 0) || directUnitReceivable(child)), 0);
}

function batchStatusHtml(order) {
  const children = batchChildrenOf(order);
  if (children.length <= 1) return `<span class="tag ${order.voided ? "red" : isFinanciallyComplete(order) ? "green" : "amber"}">${orderStatusText(order)}</span>`;
  const shown = children.filter((child) => child.status === "已显示" || child.status === "已完成" || child.paymentStatus === "已收款").length;
  const pending = pendingCollectionAmount(order);
  return `
    <span class="tag ${shown === children.length ? "green" : "amber"}">已显示 ${shown}/${children.length}</span>
    ${pending > 0 ? `<br><span class="tag amber mt-8">待结算 ¥${money(pending)}</span>` : `<br><span class="tag green mt-8">已结算</span>`}
  `;
}

function paymentCellHtml(order) {
  return `
    收 ¥${money(order.received || 0)} <span class="hint">${order.paymentStatus || "未收款"}</span><br>
    <span class="hint">付 ¥${money(order.paid || 0)} ${order.payoutStatus || "未付款"}</span>
  `;
}

function ordersForType(orders, type) {
  return mergeBatchOrders(
    orders
    .filter((o) => orderTypeLabel(o.type) === type.label)
    .sort((a, b) => submittedAtOf(b).localeCompare(submittedAtOf(a))),
  );
}

function mergeBatchOrders(orders) {
  const merged = new Map();
  orders.forEach((order) => {
    const typeLabel = orderTypeLabel(order.type);
  const key = order.batchId
      ? [order.batchId, typeLabel, order.customerId].join("|")
      : order.id;
    if (!merged.has(key)) {
      merged.set(key, { ...order, projectLines: [...projectLinesOf(order)], batchOrders: [order] });
      return;
    }
    const item = merged.get(key);
    item.batchOrders.push(order);
    item.projectLines.push(...projectLinesOf(order));
    item.receivable = Number(item.receivable || 0) + Number(order.receivable || 0);
    item.received = Number(item.received || 0) + Number(order.received || 0);
    item.payable = Number(item.payable || 0) + Number(order.payable || 0);
    item.paid = Number(item.paid || 0) + Number(order.paid || 0);
    item.paymentStatus = item.batchOrders.every((child) => child.paymentStatus === "已收款") ? "已收款" : "未收款";
    item.payoutStatus = item.batchOrders.every((child) => child.payoutStatus === "已付款") ? "已付款" : "未付款";
  });
  return [...merged.values()];
}

function filterOrdersByQuery(orders, query) {
  const keyword = String(query || "").trim().toLowerCase();
  if (!keyword) return orders;
  return orders.filter((o) => {
    const c = state.customers.find((x) => x.id === o.customerId);
    return [o.orderNo, o.type, c?.name, o.productName, o.asin, projectSummaryText(o), orderStatusText(o)]
      .join(" ")
      .toLowerCase()
      .includes(keyword);
  });
}

function completedDateOf(order) {
  if (!isFinanciallyComplete(order)) return "";
  return String(order.completedAt || order.performanceAt || order.acceptedAt || dashboardOrderDate(order)).slice(0, 10);
}

function filterOrdersByCompletionDate(orders) {
  const from = state.orderSummary.completedFrom || "";
  const to = state.orderSummary.completedTo || "";
  if (!from && !to) return orders;
  return orders.filter((order) => {
    const completed = completedDateOf(order);
    if (!completed) return false;
    return (!from || completed >= from) && (!to || completed <= to);
  });
}

function filterOrdersByColumn(orders, typeLabel) {
  const filters = state.orderSummary.filters?.[typeLabel] || {};
  return orders.filter((o) => {
    const c = state.customers.find((x) => x.id === o.customerId);
    const checks = {
      orderNo: o.orderNo,
      customer: c?.name || "",
      project: projectSummaryText(o),
      status: orderStatusText(o),
    };
    return Object.entries(filters).every(([key, value]) => {
      const needle = String(value || "").trim().toLowerCase();
      return !needle || String(checks[key] || "").toLowerCase().includes(needle);
    });
  });
}

function renderOrderTypePreview(type, orders) {
  const rows = ordersForType(orders, type);
  if (!rows.length) {
    return `
      <section class="section collapsed-section">
        <div class="section-head"><h2>${type.label}</h2><span class="hint">暂无订单</span></div>
      </section>
    `;
  }
  return `
    <section class="section">
      <div class="section-head">
        <h2>${type.label}</h2>
        <div class="toolbar compact">
          <span class="hint">最新 ${Math.min(rows.length, 3)} / ${rows.length} 单</span>
          <button class="btn ghost" data-view-type="${type.label}">查看更多</button>
        </div>
      </div>
      ${type.label === "VP真人" ? renderDispatchDraft() : ""}
      ${renderOrdersTable(rows.slice(0, 3), { compact: true, type })}
    </section>
  `;
}

function renderExpandedOrderType(type, orders) {
  const rows = filterOrdersByColumn(ordersForType(orders, type), type.label);
  return `
    <section class="section">
      <div class="section-head"><h2>${type.label}全部订单</h2><span class="hint">可通过表头筛选当前项目订单</span></div>
      ${type.label === "VP真人" ? renderDispatchDraft() : ""}
      ${renderOrdersTable(rows, { filterType: type.label, type })}
    </section>
  `;
}

function renderLeaderOrderSummary(orders) {
  const teamUsers = users.filter((u) => u.team === currentUser().team && ["frontend", "leader"].includes(u.role));
  const totalPerformance = orders.reduce((sum, o) => sum + calculablePerformance(o), 0);
  const activeCount = orders.filter((o) => !o.voided).length;
  return `
    <section class="section">
      <div class="section-head"><h2>小组订单情况</h2><span class="hint">组长可查看本组人员订单与整体情况</span></div>
      <div class="grid cols-3">
        <div class="metric"><span>本组可见订单</span><strong>${orders.length}</strong></div>
        <div class="metric"><span>未作废订单</span><strong>${activeCount}</strong></div>
        <div class="metric"><span>本组累计业绩</span><strong>¥${money(totalPerformance)}</strong></div>
      </div>
      <div class="table-wrap mt-12">
        <table>
          <thead><tr><th>人员</th><th>订单数</th><th>未作废</th><th>待处理</th><th>累计业绩</th></tr></thead>
          <tbody>
            ${teamUsers
              .map((u) => {
                const owned = orders.filter((o) => o.frontendId === u.id);
                return `<tr><td>${u.name}</td><td>${owned.length}</td><td>${owned.filter((o) => !o.voided).length}</td><td>${owned.filter((o) => !o.voided && !isFinanciallyComplete(o)).length}</td><td>¥${money(owned.reduce((sum, o) => sum + calculablePerformance(o), 0))}</td></tr>`;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderOrdersTable(orders, options = {}) {
  const filterType = options.filterType || "";
  const typeLabel = options.type?.label || orderTypeLabel(orders[0]?.type);
  const filters = filterType ? state.orderSummary.filters?.[filterType] || {} : {};
  const isDirect = typeLabel === "直评";
  return `
    <div class="table-wrap">
      <table class="${options.compact ? "compact-table" : ""}">
        <thead>
          ${
            isDirect
              ? `<tr><th>提交时间</th><th>订单号</th><th>客户</th><th>站点</th><th>ASIN</th><th>数量/项目</th><th>收付款</th><th>业绩</th><th>状态</th><th>操作</th></tr>`
              : `<tr><th>提交时间</th><th>订单号</th><th>客户</th><th>平台/站点</th><th>产品/ASIN</th><th>数量/项目</th><th>收付款</th><th>业绩</th><th>状态</th><th>操作</th></tr>`
          }
          ${
            filterType
              ? `<tr class="filter-row">
                  <th></th>
                  <th><input data-order-filter="${filterType}:orderNo" value="${escapeAttr(filters.orderNo || "")}" placeholder="筛订单号" /></th>
                  <th><input data-order-filter="${filterType}:customer" value="${escapeAttr(filters.customer || "")}" placeholder="筛客户" /></th>
                  <th></th>
                  <th></th>
                  <th><input data-order-filter="${filterType}:project" value="${escapeAttr(filters.project || "")}" placeholder="筛项目" /></th>
                  <th></th><th></th>
                  <th><input data-order-filter="${filterType}:status" value="${escapeAttr(filters.status || "")}" placeholder="筛状态" /></th>
                  <th><button class="btn ghost" data-clear-type-filter="${filterType}">清空筛选</button></th>
                </tr>`
              : ""
          }
        </thead>
        <tbody>${orders.length ? orders.map(renderOrderRows).join("") : `<tr><td colspan="10" class="empty">没有符合条件的订单</td></tr>`}</tbody>
      </table>
    </div>
  `;
}

function batchKeyOf(order) {
  return order.batchId ? `batch:${order.batchId}` : order.id;
}

function renderOrderRows(o) {
  const expanded = Boolean(state.orderSummary.expandedBatchIds?.[batchKeyOf(o)]);
  return `${renderOrderRow(o)}${expanded ? renderBatchDetailRows(o) : ""}`;
}

function renderOrderRow(o) {
  const c = state.customers.find((x) => x.id === o.customerId);
  const user = currentUser();
  const isDirect = orderTypeLabel(o.type) === "直评";
  const isBatchSummary = batchChildrenOf(o).length > 1;
  const siteCell = isDirect ? `${o.site || "-"}` : `${o.platform || "-"}<br><span class="hint">${o.site || ""}</span>`;
  const productCell = isBatchSummary
    ? `-<br><span class="hint">${isDirect ? "展开查看每条 ASIN" : "展开查看每个客户订单"}</span>`
    : isDirect
      ? `${o.asin || "-"}`
      : `${o.productName || "-"}<br><span class="hint">${o.asin || ""}</span>`;
  return `
    <tr class="${o.voided ? "invalid-row" : ""}">
      <td>${submittedAtText(o)}</td>
      <td>${o.orderNo}</td>
      <td>${c?.name || "未知客户"}</td>
      <td>${siteCell}</td>
      <td>${productCell}</td>
      <td>${projectSummaryHtml(o)}</td>
      <td>${paymentCellHtml(o)}</td>
      <td>${performanceText(o)}</td>
      <td>${batchStatusHtml(o)}</td>
      <td>
        ${o.batchOrders?.length > 1 ? `<button class="btn ghost" data-toggle-batch="${batchKeyOf(o)}">${state.orderSummary.expandedBatchIds?.[batchKeyOf(o)] ? "收起" : "展开"}</button>` : ""}
        <button class="btn ghost" data-order-detail="${o.batchOrders?.length > 1 ? batchKeyOf(o) : o.id}">详情</button>
        ${orderTypeLabel(o.type) === "VP真人" ? `<button class="btn ghost" data-copy-vp="${o.id}">复制排单</button>` : ""}
        ${o.voided && user.role === "backend" ? `<button class="btn ghost" data-restore-order="${o.id}">恢复订单</button>` : ""}
        ${!o.voided ? `<button class="btn warn" data-void-order="${o.id}">作废</button>` : ""}
      </td>
    </tr>
  `;
}

function renderBatchDetailRows(order) {
  return (order.batchOrders || [])
    .map((child, index) => {
      const isDirect = orderTypeLabel(child.type) === "直评";
      const c = state.customers.find((x) => x.id === child.customerId);
      const siteCell = isDirect ? `${child.site || "-"}` : `${child.platform || "-"}<br><span class="hint">${child.site || ""}</span>`;
      const productCell = isDirect ? `${child.asin || "-"}` : `${child.productName || "-"}<br><span class="hint">${child.asin || ""}</span>`;
      return `
        <tr class="batch-detail-row ${child.voided ? "invalid-row" : ""}">
          <td>${submittedAtText(child)}</td>
          <td>${child.orderNo}<br><span class="hint">第 ${index + 1} 单</span></td>
          <td>${c?.name || "未知客户"}</td>
          <td>${siteCell}</td>
          <td>${productCell}</td>
          <td>${projectSummaryHtml(child)}</td>
          <td>${paymentCellHtml(child)}</td>
          <td>${performanceText(child)}</td>
          <td><span class="tag ${child.voided ? "red" : isFinanciallyComplete(child) ? "green" : child.paymentStatus === "已收款" ? "green" : "amber"}">${orderStatusText(child)}</span><br>${statusBadge(child.paymentStatus)} ${statusBadge(child.payoutStatus)}</td>
          <td><button class="btn ghost" data-order-detail="${child.id}">详情</button></td>
        </tr>
      `;
    })
    .join("");
}

function bindOrders() {
  document.querySelector("#runOrderSearch").addEventListener("click", () => {
    state.orderSummary.query = document.querySelector("#orderSearch").value;
    state.orderSummary.completedFrom = document.querySelector("#completedFrom").value;
    state.orderSummary.completedTo = document.querySelector("#completedTo").value;
    state.orderSummary.exportUserId = document.querySelector("#exportUserId")?.value || "";
    saveState();
    render();
  });
  document.querySelector("#orderSearch").addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    state.orderSummary.query = event.currentTarget.value;
    saveState();
    render();
  });
  document.querySelector("#clearOrderSearch").addEventListener("click", () => {
    state.orderSummary.query = "";
    state.orderSummary.filters = {};
    state.orderSummary.completedFrom = "";
    state.orderSummary.completedTo = "";
    state.orderSummary.exportUserId = "";
    saveState();
    render();
  });
  document.querySelector("#exportOrders").addEventListener("click", () => {
    state.orderSummary.query = document.querySelector("#orderSearch").value;
    state.orderSummary.completedFrom = document.querySelector("#completedFrom").value;
    state.orderSummary.completedTo = document.querySelector("#completedTo").value;
    state.orderSummary.exportUserId = document.querySelector("#exportUserId")?.value || "";
    saveState();
    exportOrders();
  });
  document.querySelector("#toggleVoidedOrders").addEventListener("click", () => {
    state.orderSummary.showVoided = !state.orderSummary.showVoided;
    state.orderSummary.expandedBatchIds = {};
    saveState();
    render();
  });
  document.querySelector("#backOrderSummary")?.addEventListener("click", () => {
    state.orderSummary.expandedType = "";
    state.orderSummary.filters = {};
    saveState();
    render();
  });
  document.querySelectorAll("[data-view-type]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.orderSummary.expandedType = btn.dataset.viewType;
      state.orderSummary.filters ||= {};
      state.orderSummary.filters[btn.dataset.viewType] ||= {};
      saveState();
      render();
    });
  });
  document.querySelectorAll("[data-toggle-batch]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.toggleBatch;
      state.orderSummary.expandedBatchIds[key] = !state.orderSummary.expandedBatchIds[key];
      saveState();
      render();
    });
  });
  document.querySelectorAll("[data-order-detail]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.activeOrderDetailId = btn.dataset.orderDetail;
      saveState();
      render();
    });
  });
  document.querySelectorAll("[data-order-filter]").forEach((input) => {
    input.addEventListener("change", updateOrderFilter);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") updateOrderFilter(event);
    });
  });
  document.querySelectorAll("[data-clear-type-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.orderSummary.filters[btn.dataset.clearTypeFilter] = {};
      saveState();
      render();
    });
  });
  document.querySelectorAll("[data-void-order]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.pendingVoidOrderId = btn.dataset.voidOrder;
      saveState();
      render();
    });
  });
  document.querySelectorAll("[data-restore-order]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const o = state.orders.find((x) => x.id === btn.dataset.restoreOrder);
      if (!o || currentUser().role !== "backend") return;
      o.voided = false;
      o.restoredAt = new Date().toISOString();
      o.restoredBy = currentUser().id;
      log("恢复订单", o.orderNo);
      saveState();
      toast("订单已恢复");
      render();
    });
  });
  document.querySelectorAll("[data-copy-vp]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const o = state.orders.find((x) => x.id === btn.dataset.copyVp);
      state.dispatchBuilder = dispatchBuilderFromOrder(o);
      saveState();
      render();
    });
  });
  document.querySelectorAll("[data-dispatch-field]").forEach((input) => {
    input.addEventListener("input", (event) => {
      const field = event.currentTarget.dataset.dispatchField;
      const rowIndex = Number(event.currentTarget.dataset.dispatchRow);
      state.dispatchDraft.rows[rowIndex][field] = event.currentTarget.value;
      saveState();
    });
  });
  document.querySelector("#cancelDispatchDraft")?.addEventListener("click", () => {
    state.dispatchDraft = null;
    saveState();
    render();
  });
  document.querySelector("#submitDispatchDraft")?.addEventListener("click", async () => {
    const draft = state.dispatchDraft;
    if (!draft) return;
    const source = state.orders.find((o) => o.id === draft.orderId);
    if (!source) return;
    const orders = createDispatchBatchOrders(source, draft);
    orders.slice().reverse().forEach((order) => state.orders.unshift(order));
    log("提交排单", `${orders[0].orderNo} / ${projectTextFromRows(draft.rows) || "VP真人"}`);
    state.dispatchDraft = null;
    state.orderSummary.expandedType = "";
    state.orderSummary.showVoided = false;
    state.orderSummary.expandedBatchIds ||= {};
    state.orderSummary.expandedBatchIds[`batch:${orders[0].batchId}`] = false;
    saveState();
    render();
    copyText(dispatchSheetCopyText(draft));
    toast("排单表已提交，订单已加入汇总");
  });
}

function updateOrderFilter(event) {
  const [typeLabel, field] = event.currentTarget.dataset.orderFilter.split(":");
  state.orderSummary.filters ||= {};
  state.orderSummary.filters[typeLabel] ||= {};
  state.orderSummary.filters[typeLabel][field] = event.currentTarget.value;
  saveState();
  render();
}

function exportOrders() {
  const user = currentUser();
  let orders = visibleOrders().filter((order) => !order.voided);
  orders = filterOrdersByCompletionDate(filterOrdersByQuery(orders, state.orderSummary.query || ""));
  if (user.role === "admin" && state.orderSummary.exportUserId) {
    orders = orders.filter((order) => order.frontendId === state.orderSummary.exportUserId);
  }
  if (user.role !== "admin") {
    orders = orders.filter((order) => order.frontendId === user.id);
  }
  const completed = orders.filter((order) => isFinanciallyComplete(order));
  if (!completed.length) {
    toast("没有可导出的已完成订单");
    return;
  }
  const rows = completed.map(exportOrderRow);
  const filename = `订单导出-${today()}.xlsx`;
  if (window.XLSX) {
    const sheet = window.XLSX.utils.json_to_sheet(rows);
    const book = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(book, sheet, "订单");
    window.XLSX.writeFile(book, filename);
  } else {
    downloadText(filename.replace(".xlsx", ".csv"), toCsv(rows));
  }
  log("导出订单", `${completed.length} 条`);
}

function exportOrderRow(order) {
  const customer = state.customers.find((c) => c.id === order.customerId);
  const creator = users.find((u) => u.id === order.frontendId);
  const backend = users.find((u) => u.id === order.backendId);
  return {
    接单时间: fullDateTimeText(submittedAtOf(order)),
    完成时间: completedDateOf(order) || "",
    客户: customer?.name || "",
    项目: exportProjectName(order),
    业绩: calculablePerformance(order),
    接单人: creator?.name || "",
    对接人: backend?.name || "",
  };
}

function fullDateTimeText(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("zh-CN", { hour12: false });
}

function exportProjectName(order) {
  const label = orderTypeLabel(order.type);
  if (label === "直评") return "直评";
  const project = order.project || label;
  return project === "feedback" ? "FB" : project;
}

function toCsv(rows) {
  const headers = Object.keys(rows[0] || {});
  const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  return [headers.join(","), ...rows.map((row) => headers.map((header) => escape(row[header])).join(","))].join("\n");
}

function downloadText(filename, content) {
  const blob = new Blob(["\ufeff", content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function nextOrderNo(typeMeta, offset = 0) {
  const d = new Date();
  const mmdd = `${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const sameDay = state.orders.filter((o) => String(o.orderNo || "").startsWith(`${typeMeta.prefix}${mmdd}`)).length + 1 + offset;
  return `${typeMeta.prefix}${mmdd}${String(sameDay).padStart(3, "0")}`;
}

function createOrderFromData(data, userId, meta = {}) {
  const type = data.type || "直评";
  const typeMeta = orderTypes.find((item) => item.label === type || item.legacy === type) || orderTypes[0];
  const normalizedType = typeMeta.label;
  const receivable = Number(data.receivable || 0);
  const payable = Number(data.payable || 0);
  const received = 0;
  const paid = 0;
  return {
    id: uid("o"),
    orderNo: meta.orderNo || nextOrderNo(typeMeta),
    type: normalizedType,
    batchId: meta.batchId || "",
    customerId: data.customerId,
    frontendId: userId,
    backendId: "u-back",
    acceptedAt: today(),
    submittedAt: nowIso(),
    completedAt: "",
    performanceAt: "",
    platform: normalizedType === "直评" ? "亚马逊" : data.platform || "亚马逊",
    site: normalizeSite(data.site || "US"),
    productName: data.productName || "",
    productImage: data.productImage || "",
    keyword: data.keyword || "",
    asin: extractAsin(data.asin || data.link || ""),
    variant: data.variant || "",
    price: Number(data.price || 0),
    store: data.store || "",
    project: normalizedType === "直评" ? directProjectLabel(data.project) : data.project || normalizedType,
    projectLines: [
      {
        count: Math.max(1, Number(data.quantity || 1)),
        project: normalizedType === "直评" ? directProjectLabel(data.project) : data.project || normalizedType,
      },
    ],
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
    workflow: normalizeOrderWorkflow({ paymentStatus: "未收款", payoutStatus: "未付款" }).workflow,
    channelName: currentUser()?.role === "backend" ? data.channelName || "" : "",
    channelVisible: normalizedType === "直评",
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

function dispatchBuilderFromOrder(order) {
  const defaultProject = vpProjects.includes(order.project) ? order.project : "免评";
  return {
    orderId: order.id,
    lines: [{ count: 1, project: defaultProject }],
  };
}

function dispatchRowsFromOrder(order, lines) {
  return lines.flatMap((line) => {
    const count = Math.max(1, Number(line.count || 1));
    const project = vpProjects.includes(line.project) ? line.project : "免评";
    return Array.from({ length: count }, () => ({
      productName: order.productName || "",
      keyword: order.keyword || "",
      asin: order.asin || "",
      variant: order.variant || "无",
      price: order.price || "",
      store: order.store || "",
      project,
      requirement: order.requirement || "无",
    }));
  });
}

function appendDispatchRows(existingDraft, order, lines) {
  const rows = dispatchRowsFromOrder(order, lines);
  if (existingDraft?.orderId === order.id) {
    return { ...existingDraft, rows: [...existingDraft.rows, ...rows] };
  }
  return {
    orderId: order.id,
    orderNo: order.orderNo,
    rows,
  };
}

function summarizeDraftProjects(rows) {
  return consolidateProjectLines(rows.map((row) => ({ count: 1, project: row.project })));
}

function projectTextFromRows(rows) {
  return summarizeDraftProjects(rows)
    .map((item) => `${item.count}单${item.project}`)
    .join("，");
}

function createDispatchBatchOrders(source, draft) {
  const typeMeta = orderTypes.find((item) => item.label === orderTypeLabel(source.type)) || orderTypes[1];
  const batchId = uid("batch");
  const submittedAt = nowIso();
  return draft.rows.map((row, index) => ({
    ...source,
    id: uid("o"),
    batchId,
    orderNo: nextOrderNo(typeMeta, index),
    type: typeMeta.label,
    acceptedAt: today(),
    submittedAt,
    completedAt: "",
    performanceAt: "",
    productName: row.productName,
    keyword: row.keyword,
    asin: row.asin,
    variant: row.variant,
    price: Number(row.price || 0),
    store: row.store,
    project: row.project,
    projectLines: [{ count: 1, project: row.project }],
    requirement: row.requirement,
    received: 0,
    paid: 0,
    performance: 0,
    status: "待处理",
    paymentStatus: "未收款",
    payoutStatus: "未付款",
    workflow: normalizeOrderWorkflow({ paymentStatus: "未收款", payoutStatus: "未付款" }).workflow,
    voided: false,
    dispatchSheet: { ...draft, submittedAt, submittedBy: currentUser().id },
  }));
}

function dispatchSheetCopyText(draft) {
  const first = draft.rows[0] || {};
  return [
    `产品名：${first.productName || ""}`,
    `关键词：${first.keyword || ""}`,
    `ASIN：${first.asin || ""}`,
    `变体：${first.variant || "无"}`,
    `价格：${first.price || ""}`,
    `店铺：${first.store || ""}`,
    `项目要求：${projectTextFromRows(draft.rows) || "1单项目"}`,
    `备注要求：${first.requirement || "无"}`,
  ].join("\n");
}

async function copyText(text) {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      // file:// contexts often expose clipboard but still deny writes.
    }
  }
  const area = document.createElement("textarea");
  area.value = text;
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  area.remove();
  return true;
}

function renderImport() {
  return `
    <section class="section">
      <div class="section-head"><h2>手工录入订单</h2><span class="hint">订单按类型自动归入订单汇总</span></div>
      <form id="manualOrderForm" class="form-grid">
        <div class="field"><label>业务类型</label><select name="type">${orderTypeLabels.map((type) => `<option>${type}</option>`).join("")}</select></div>
        <div class="field"><label>客户</label><select name="customerId" required>${visibleCustomers().map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}</select></div>
        <div class="field"><label>站点</label><select name="site">${vpSites.map((site) => `<option>${site}</option>`).join("")}</select></div>
        <div class="field"><label>数量</label><input name="quantity" type="number" min="1" value="1" /></div>
        <div class="field"><label>项目</label><select name="project">${["5星", "4星", "3星", "2星", "1星", ...vpProjects, "VINE定制", "买家秀"].map((p) => `<option>${p}</option>`).join("")}</select></div>
        <div class="field"><label>产品名</label><input name="productName" /></div>
        <div class="field"><label>关键词</label><input name="keyword" /></div>
        <div class="field"><label>ASIN</label><input name="asin" required /></div>
        <div class="field"><label>变体</label><input name="variant" /></div>
        <div class="field"><label>价格</label><input name="price" type="number" step="0.01" /></div>
        <div class="field"><label>店铺</label><input name="store" /></div>
        <div class="field"><label>应收款</label><input name="receivable" type="number" step="0.01" value="0" /></div>
        <div class="field"><label>应付款</label><input name="payable" type="number" step="0.01" value="0" /></div>
        <div class="field span-2"><label>备注要求</label><input name="requirement" /></div>
        <button class="btn primary span-4" type="submit">提交订单</button>
      </form>
    </section>
    <section class="section">
      <div class="section-head"><h2>批量导入订单</h2><span class="hint">复制粘贴和表格上传都支持，统一进入导入预览</span></div>
      <div class="import-grid">
        <div class="import-card">
          <strong>复制粘贴识别</strong>
          <span>适合从客户表格临时复制几行或几十行，保留表格单元格结构即可。</span>
          <button class="btn primary" id="parsePaste">识别粘贴内容</button>
        </div>
        <label class="import-card upload-card" for="importFile">
          <strong>表格上传识别</strong>
          <span>适合直接上传员工标准模板，支持 .xlsx、.xls、.csv、.tsv、.txt。</span>
          <input id="importFile" type="file" accept=".xlsx,.xls,.csv,.tsv,.txt" />
          <em id="importFileName">选择表格文件</em>
        </label>
        <button class="btn ghost" id="clearImport">清空预览</button>
      </div>
      <div class="field">
        <label>从员工表格中复制有效区域后粘贴到这里</label>
        <textarea id="pasteArea" placeholder="VP 无表头时可直接复制：站点、产品名、关键词、价格、店铺名、变体、核对ASIN、下单要求、特殊备注。"></textarea>
        <div class="hint">系统会自动判断直评或 VP。带表头时按关键字识别；VP 不带表头时，按固定 9 列顺序识别。主图在预览页逐行补传。</div>
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
  const previewType = orderTypeLabel(state.importPreview[0]?.type);
  if (previewType === "直评") return renderDirectImportPreview();
  if (previewType === "VP真人") return renderVpImportPreview();
  return renderGenericImportPreview();
}

function renderDirectImportPreview() {
  return `
    <div class="table-wrap">
      <table class="direct-preview-table">
        <thead><tr><th>状态</th><th>客户 <button class="mini-square" data-fill-preview-customer title="用第一行客户填充本列">□</button></th><th>站点</th><th>DP短链</th><th>ASIN</th><th>评价标题</th><th>评价内容</th><th>评价图</th><th>质保</th><th>问题</th></tr></thead>
        <tbody>
          ${state.importPreview
            .map((row, index) => `
              <tr class="${row.errors.length ? "invalid-row" : ""}">
                <td>${row.errors.length ? `<span class="tag red">不可提交</span>` : `<span class="tag green">可提交</span>`}</td>
                <td>
                  <input class="cell-input" list="customerOptions" data-preview-field="${index}:customerName" value="${escapeAttr(row.customerName || "")}" placeholder="输入或选择客户" />
                </td>
                <td><input class="cell-input small" data-preview-field="${index}:site" value="${escapeAttr(row.site || "")}" /></td>
                <td><input class="cell-input" data-preview-field="${index}:link" value="${escapeAttr(row.link || "")}" placeholder="DP短链" /></td>
                <td><input class="cell-input" data-preview-field="${index}:asin" value="${escapeAttr(row.asin || "")}" /></td>
                <td><input class="cell-input" data-preview-field="${index}:reviewTitle" value="${escapeAttr(row.reviewTitle || "")}" /></td>
                <td><textarea class="cell-input preview-textarea" data-preview-field="${index}:reviewContent">${escapeHtml(row.reviewContent || "")}</textarea></td>
                <td>
                  ${row.reviewImage ? `<img class="thumb" src="${row.reviewImage}" alt="评价图" />` : `<span class="tag">可上传</span>`}
                  <input class="image-input" type="file" accept="image/*" data-preview-review-image="${index}" />
                </td>
                <td><input class="cell-input small" data-preview-field="${index}:warranty" value="${escapeAttr(row.warranty || "")}" placeholder="质保天数" /></td>
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

function renderVpImportPreview() {
  return `
    <div class="table-wrap">
      <table class="vp-preview-table">
        <thead><tr><th>状态</th><th>客户 <button class="mini-square" data-fill-preview-customer title="用第一行客户填充本列">□</button></th><th>平台</th><th>站点</th><th>主图</th><th>产品名</th><th>关键词</th><th>价格</th><th>店铺名</th><th>变体</th><th>核对ASIN</th><th>下单项目</th><th>要求</th><th>备注</th><th>问题</th></tr></thead>
        <tbody>
          ${state.importPreview
            .map((row, index) => `
              <tr class="${row.errors.length ? "invalid-row" : ""}">
                <td>${row.errors.length ? `<span class="tag red">不可提交</span>` : `<span class="tag green">可提交</span>`}</td>
                <td><input class="cell-input" list="customerOptions" data-preview-field="${index}:customerName" value="${escapeAttr(row.customerName || "")}" placeholder="输入或选择客户" /></td>
                <td><input class="cell-input small" data-preview-field="${index}:platform" value="${escapeAttr(row.platform || "亚马逊")}" /></td>
                <td><input class="cell-input small" data-preview-field="${index}:site" value="${escapeAttr(row.site || "")}" /></td>
                <td>
                  ${row.productImage ? `<img class="thumb" src="${row.productImage}" alt="主图" />` : `<span class="tag red">手动上传</span>`}
                  <input class="image-input" type="file" accept="image/*" data-preview-image="${index}" />
                </td>
                <td><input class="cell-input" data-preview-field="${index}:productName" value="${escapeAttr(row.productName || "")}" /></td>
                <td><input class="cell-input" data-preview-field="${index}:keyword" value="${escapeAttr(row.keyword || "")}" /></td>
                <td><input class="cell-input small" data-preview-field="${index}:price" value="${escapeAttr(row.price || "")}" /></td>
                <td><input class="cell-input" data-preview-field="${index}:store" value="${escapeAttr(row.store || "")}" /></td>
                <td><input class="cell-input" data-preview-field="${index}:variant" value="${escapeAttr(row.variant || "")}" /></td>
                <td><input class="cell-input" data-preview-field="${index}:asin" value="${escapeAttr(row.asin || "")}" /></td>
                <td><input class="cell-input" data-preview-field="${index}:project" value="${escapeAttr(projectSummaryText({ quantity: row.quantity, project: row.project, type: row.type }))}" /></td>
                <td><input class="cell-input" data-preview-field="${index}:requirementRemark" value="${escapeAttr(row.requirementRemark || "")}" placeholder="例如：使用优惠券" /></td>
                <td><input class="cell-input" data-preview-field="${index}:remark" value="${escapeAttr(row.remark || "")}" /></td>
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

function renderGenericImportPreview() {
  return `<div class="empty">无法判断表格类型，请确认表头包含直评字段“评价标题、评价内容”，或 VP 字段“关键词、价格、店铺/卖家”。</div>`;
}

function bindImport() {
  document.querySelector("#manualOrderForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const order = createOrderFromData(data, currentUser().id);
    state.orders.unshift(order);
    log("手工录入订单", `${order.orderNo} / ${order.type}`);
    saveState();
    toast("订单已提交并归入订单汇总");
    render();
  });
  document.querySelector("#parsePaste").addEventListener("click", () => {
    const text = document.querySelector("#pasteArea").value;
    applyImportText(text, "粘贴识别");
  });
  document.querySelector("#importFile").addEventListener("change", async (event) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    document.querySelector("#importFileName").textContent = file.name;
    try {
      const text = await readImportFile(file);
      document.querySelector("#pasteArea").value = text;
      applyImportText(text, `文件识别：${file.name}`);
    } catch (error) {
      toast(error.message || "文件识别失败");
    }
  });
  document.querySelector("#clearImport").addEventListener("click", () => {
    state.importPreview = [];
    saveState();
    render();
  });
  document.querySelector("[data-fill-preview-customer]")?.addEventListener("click", () => {
    const firstName = String(state.importPreview[0]?.customerName || "").trim();
    if (!firstName) {
      toast("请先在第一行填写客户");
      return;
    }
    const customer = state.customers.find((c) => c.name === firstName);
    state.importPreview.forEach((row) => {
      row.customerName = firstName;
      row.customerId = customer?.id || "";
      row.errors = validateImportRow(row);
    });
    saveState();
    render();
  });
  document.querySelector("#submitPreview").addEventListener("click", () => {
    const valid = state.importPreview.filter((r) => !r.errors.length);
    const batchId = uid("batch");
    const directBatchOrderNo = valid.some((r) => orderTypeLabel(r.type) === "直评") ? nextOrderNo(orderTypes[0]) : "";
    valid.forEach((r) => {
      ensureImportCustomer(r);
      const meta = { batchId };
      if (orderTypeLabel(r.type) === "直评") meta.orderNo = directBatchOrderNo;
      state.orders.unshift(createOrderFromData(r, currentUser().id, meta));
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
  document.querySelectorAll("[data-preview-review-image]").forEach((input) => {
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      const index = Number(input.dataset.previewReviewImage);
      if (!file || !state.importPreview[index]) return;
      const reader = new FileReader();
      reader.onload = () => {
        state.importPreview[index].reviewImage = reader.result;
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

function applyImportText(text, action) {
  const type = detectImportType(text);
  if (!type) {
    state.importPreview = [];
    toast("无法判断表格类型：直评需包含评价标题和评价内容；VP需包含关键词、价格、店铺/卖家");
    saveState();
    render();
    return;
  }
  state.importPreview = parsePastedRows(text, type);
  log("导入识别", `${action} / ${type} / ${state.importPreview.length} 行`);
  saveState();
  render();
}

async function readImportFile(file) {
  const name = file.name.toLowerCase();
  if (/\.(csv|tsv|txt)$/.test(name)) return file.text();
  if (!/\.(xlsx|xls)$/.test(name)) throw new Error("暂不支持该文件格式");
  if (!window.XLSX) throw new Error("Excel 解析库未加载，请刷新页面后重试");
  const buffer = await file.arrayBuffer();
  const workbook = window.XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("表格文件没有工作表");
  const rows = window.XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, raw: false, defval: "" });
  return rows
    .filter((row) => row.some((cell) => String(cell).trim()))
    .map((row) => row.map((cell) => String(cell || "").trim()).join("\t"))
    .join("\n");
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
  if (field === "site") {
    row.site = orderTypeLabel(row.type) === "直评" ? normalizeDirectSite(row.site) : normalizeSite(row.site);
    if (orderTypeLabel(row.type) === "直评" && row.asin && !/^https?:\/\//i.test(String(row.link || ""))) {
      row.link = normalizeDirectDpLink(row.site, row.link, row.asin);
    }
  }
  if (field === "link" && !row.asin) row.asin = extractAsin(row.link);
  if (field === "asin") {
    row.asin = extractAsin(row.asin);
    if (orderTypeLabel(row.type) === "直评" && !/^https?:\/\//i.test(String(row.link || ""))) {
      row.link = normalizeDirectDpLink(row.site, row.link, row.asin);
    }
  }
  if (field === "variant" && orderTypeLabel(row.type) === "VP真人") row.variant = normalizeVariant(row.variant);
  if (field === "warranty") row.warranty = normalizeWarranty(row.warranty);
  if (field === "project" && orderTypeLabel(row.type) === "VP真人") {
    const match = String(row.project || "").match(/(\d+)\s*单?\s*(.+)/);
    if (match) {
      row.quantity = Math.max(1, Number(match[1]));
      row.project = match[2].trim();
    }
  }
  row.errors = validateImportRow(row);
  saveState();
  render();
}

function validateImportRow(row) {
  const errors = [];
  const typeLabel = orderTypeLabel(row.type);
  if (!row.customerId && !String(row.customerName || "").trim()) errors.push("缺少客户，请在预览中选择或填写");
  if (!row.site) errors.push("缺少站点");
  if (typeLabel === "VP真人") {
    if (!row.platform) errors.push("缺少平台");
    if (!row.productName) errors.push("缺少产品名");
    if (!row.keyword) errors.push("缺少关键词");
    if (!row.asin) errors.push("缺少 ASIN");
    if (!row.price) errors.push("缺少价格");
    if (!row.store) errors.push("缺少店铺");
    if (!row.project) errors.push("缺少项目");
  } else if (typeLabel === "直评") {
    if (!row.asin) errors.push("缺少链接或 ASIN");
    if (!row.reviewTitle) errors.push("缺少评价标题");
    if (!row.reviewContent) errors.push("缺少评价内容");
    if (!row.warranty) errors.push("缺少质保");
  } else {
    if (!row.asin) errors.push("缺少 ASIN");
    if (!row.productName) errors.push("缺少产品名");
  }
  if (typeLabel === "VP真人" && !row.productImage) errors.push("缺少产品图片");
  return errors;
}

function escapeAttr(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function detectImportType(text) {
  const table = parseClipboardTable(text).filter((row) => row.some((cell) => String(cell).trim()));
  const analysis = analyzeImportTable(table);
  if (analysis.type) return analysis.type;
  const firstRow = table.find((row) => row.some(Boolean)) || [];
  return firstRow.map((x) => x.trim()).filter(Boolean).length >= 9 ? "VP真人" : "";
}

function parsePastedRows(text, type) {
  const table = parseClipboardTable(text).filter((row) => row.some((cell) => String(cell).trim()));
  if (!table.length) return [];
  const analysis = analyzeImportTable(table);
  const resolvedType = analysis.type || type;
  if (!resolvedType) return [];
  const headerIndex = analysis.headerIndex;
  if (headerIndex < 0) {
    return orderTypeLabel(resolvedType) === "VP真人" ? table.flatMap(parseVpRowByPosition) : table.map(parseDirectRowByPosition);
  }
  const headers = table[headerIndex];
  const dataRows = table.slice(headerIndex + 1);
  return dataRows
    .filter((row) => row.some(Boolean) && !isExampleRow(row))
    .flatMap((row) => orderTypeLabel(resolvedType) === "VP真人" ? parseVpRow(headers, row) : [parseGenericImportRow(headers, row, resolvedType)])
    .filter(Boolean);
}

function analyzeImportTable(table) {
  const directHeaderIndex = table.findIndex((row) => hasHeader(row, ["评价标题"]) && hasHeader(row, ["评价内容"]));
  if (directHeaderIndex >= 0) {
    const headers = table[directHeaderIndex];
    const dataRows = table.slice(directHeaderIndex + 1).filter((row) => row.some(Boolean) && !isExampleRow(row));
    const hasDirectData = dataRows.some((row) => headerValue(headers, row, ["评价标题"]) && headerValue(headers, row, ["评价内容"]));
    if (hasDirectData) return { type: "直评", headerIndex: directHeaderIndex };
  }

  const vpHeaderIndex = table.findIndex((row) => hasHeader(row, ["关键词"]) && hasHeader(row, ["价格", "售价"]) && hasHeader(row, ["店铺", "卖家"]));
  if (vpHeaderIndex >= 0) return { type: "VP真人", headerIndex: vpHeaderIndex };

  return { type: "", headerIndex: -1 };
}

function hasHeader(row, names) {
  return row.some((cell) => names.some((name) => String(cell || "").replace(/\s+/g, "").includes(name)));
}

function isExampleRow(row) {
  return row.some((cell) => /示例|样例|example|请删除/i.test(String(cell || "")));
}

function headerValue(headers, row, names) {
  const idx = headers.findIndex((h) => names.some((n) => String(h).replace(/\s+/g, "").includes(n)));
  return idx >= 0 ? row[idx] || "" : "";
}

function parseGenericImportRow(headers, row, type) {
  const typeLabel = orderTypeLabel(type);
  if (typeLabel === "直评") return parseDirectRow(headers, row);
  const parsed = {
    type: typeLabel,
    customerId: "",
    customerName: "",
    platform: "亚马逊",
    site: normalizeSite(headerValue(headers, row, ["站点"])),
    productName: headerValue(headers, row, ["产品名", "产品简称", "产品"]),
    keyword: headerValue(headers, row, ["关键词"]),
    price: headerValue(headers, row, ["价格", "售价"]),
    store: headerValue(headers, row, ["店铺名", "店铺", "卖家"]),
    variant: normalizeVariant(headerValue(headers, row, ["变体"])),
    asin: extractAsin(headerValue(headers, row, ["核对ASIN", "ASIN", "链接"])),
    project: typeLabel,
    requirement: headerValue(headers, row, ["下单要求", "要求", "备注"]),
    requirementRemark: headerValue(headers, row, ["下单要求", "要求"]),
    remark: normalizeRemark(headerValue(headers, row, ["特殊备注", "备注"])),
    productImage: "",
    channelName: "待排渠道",
  };
  parsed.errors = validateImportRow(parsed);
  return parsed;
}

function parseDirectRow(headers, row) {
  const link = headerValue(headers, row, ["DP短链", "短链", "链接"]);
  const asin = headerValue(headers, row, ["ASIN"]) || extractAsin(link);
  return buildDirectImportRow({
    site: headerValue(headers, row, ["站点"]),
    link,
    asin,
    title: headerValue(headers, row, ["评价标题"]),
    content: headerValue(headers, row, ["评价内容"]),
    reviewImage: headerValue(headers, row, ["评论图", "评价图"]),
    warrantyRaw: headerValue(headers, row, ["质保"]),
  });
}

function parseDirectRowByPosition(row) {
  const [site, link, title, content, maybeCommentImage, maybeWarranty] = row;
  const warrantyRaw = maybeWarranty || (/质保|天|30|7/.test(String(maybeCommentImage || "")) ? maybeCommentImage : "");
  return buildDirectImportRow({
    site,
    link,
    title,
    content,
    reviewImage: /质保|天|30|7/.test(String(maybeCommentImage || "")) ? "" : maybeCommentImage,
    warrantyRaw,
  });
}

function buildDirectImportRow({ site, link, asin, title, content, reviewImage, warrantyRaw }) {
  const normalizedSite = normalizeDirectSite(site);
  const normalizedAsin = extractAsin(asin || link);
  const normalizedLink = normalizeDirectDpLink(normalizedSite, link, normalizedAsin);
  const parsed = {
    type: "直评",
    customerId: "",
    customerName: "",
    platform: "亚马逊",
    site: normalizedSite,
    link: normalizedLink,
    asin: normalizedAsin,
    project: "5星",
    quantity: 1,
    warranty: normalizeWarranty(warrantyRaw),
    reviewTitle: title || "",
    reviewContent: content || "",
    reviewImage: reviewImage || "",
    productImage: "",
    channelName: "待排渠道",
  };
  parsed.errors = validateImportRow(parsed);
  return parsed;
}

function normalizeDirectDpLink(site, link, asin) {
  const raw = String(link || "").trim();
  if (/^https?:\/\//i.test(raw)) return raw;
  const code = normalizeDirectSite(site);
  const cleanAsin = extractAsin(asin || raw);
  if (!/^B0[A-Z0-9]{8}$/i.test(cleanAsin)) return raw === cleanAsin ? "" : raw;
  const domains = {
    US: "https://www.amazon.com/dp/",
    CA: "https://www.amazon.ca/dp/",
    UK: "https://www.amazon.co.uk/dp/",
    DE: "https://www.amazon.de/dp/",
    FR: "https://www.amazon.fr/dp/",
    IT: "https://www.amazon.it/dp/",
    ES: "https://www.amazon.es/dp/",
    JA: "https://www.amazon.co.jp/dp/",
    JP: "https://www.amazon.co.jp/dp/",
    AU: "https://www.amazon.com.au/dp/",
  };
  return domains[code] ? `${domains[code]}${cleanAsin}` : "";
}

function normalizeWarranty(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/30/.test(raw)) return "30天";
  if (/7/.test(raw)) return "7天";
  return raw;
}

function parseClipboardTable(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  const source = String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "\t" && !inQuotes) {
      row.push(cell.trim());
      cell = "";
      continue;
    }
    if (char === "\n" && !inQuotes) {
      row.push(cell.trim());
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += char;
  }

  row.push(cell.trim());
  rows.push(row);
  return rows;
}

function parseVpRow(headers, row) {
  const requirement = headerValue(headers, row, ["下单要求", "项目"]);
  const specialRemark = headerValue(headers, row, ["特殊备注", "备注"]);
  const projects = consolidateProjectLines(expandVpRequirement(requirement).map((project) => ({ count: 1, project })));
  const base = {
    type: "VP真人",
    customerId: "",
    customerName: "",
    platform: "亚马逊",
    site: normalizeSite(headerValue(headers, row, ["站点"])),
    productName: headerValue(headers, row, ["产品名", "产品简称", "产品"]),
    keyword: headerValue(headers, row, ["关键词"]),
    price: headerValue(headers, row, ["价格", "售价"]),
    store: headerValue(headers, row, ["店铺名", "店铺", "卖家"]),
    variant: normalizeVariant(headerValue(headers, row, ["变体"])),
    asin: extractAsin(headerValue(headers, row, ["核对ASIN", "ASIN"])),
    requirement,
    requirementRemark: extractVpRemark(requirement, specialRemark),
    remark: normalizeRemark(specialRemark),
    productImage: "",
    channelName: "待排渠道",
  };
  const make = (line) => {
    const item = { ...base, project: line.project, quantity: line.count };
    item.errors = validateImportRow(item);
    return item;
  };
  return projects.length ? projects.map(make) : [make({ count: 1, project: "" })];
}

function parseVpRowByPosition(row) {
  const cleaned = [...row];
  while (cleaned.length && cleaned[cleaned.length - 1] === "") cleaned.pop();
  if (!cleaned.length) return [];

  const siteRaw = cleaned[0] || "";
  const productName = cleaned[1] || "";
  const keyword = cleaned[2] || "";
  const price = cleaned[3] || "";
  const store = cleaned[4] || "";
  const variant = normalizeVariant(cleaned[5]);
  const asin = extractAsin(cleaned[6] || "");
  const requirement = cleaned[7] || "";
  const specialRemark = cleaned[8] || "";
  const projects = consolidateProjectLines(expandVpRequirement(requirement).map((project) => ({ count: 1, project })));
  const requirementRemark = extractVpRemark(requirement, specialRemark);

  const base = {
    type: "VP真人",
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

  const make = (line) => {
    const item = { ...base, project: line.project, quantity: line.count };
    item.errors = validateImportRow(item);
    return item;
  };

  return projects.length ? projects.map(make) : [make({ count: 1, project: "" })];
}

function extractVpRemark(requirement, specialRemark) {
  const parts = [];
  const req = String(requirement || "");
  const cleanedReq = req
    .replace(/\d+\s*单?\s*(免评|文评|文字|文字评论|留评|图评|视频|点星|feedback)/gi, "")
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
    ["文评", /(\d+)\s*单?\s*(留评|文字评论|文字)/],
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
  const role = currentUser().role;
  if (role === "backend") return renderBackendWorkspace();
  if (["finance", "admin"].includes(role)) return renderFinanceWorkspace();
  return `
    <section class="section">
      <div class="section-head"><h2>财务管理</h2><span class="hint">当前角色无财务操作权限</span></div>
      <div class="empty">前端人员请在订单汇总查看自己的订单进度；收付款确认由财务处理。</div>
    </section>
  `;
}

function renderBackendWorkspace() {
  const orders = visibleOrders().filter((o) => !o.voided);
  const waiting = orders.filter((o) => o.status === "待处理").length;
  const handling = orders.filter((o) => !isFinanciallyComplete(o) && o.status !== "待处理").length;
  const needCollectionProof = orders.filter((o) => o.paymentStatus !== "已收款" && !o.workflow?.customerPaymentProof).length;
  const needPayoutRequest = orders.filter((o) => o.payoutStatus !== "已付款" && o.workflow?.payoutRequestStatus !== "待财务审核").length;
  const rejected = orders.filter((o) => o.workflow?.payoutRequestStatus === "财务已退回" || o.paymentStatus === "收款退回").length;
  return `
    <section class="grid cols-3">
      <div class="metric"><span>待接收订单</span><strong>${waiting}</strong></div>
      <div class="metric"><span>处理中订单</span><strong>${handling}</strong></div>
      <div class="metric"><span>待补收款截图</span><strong>${needCollectionProof}</strong></div>
      <div class="metric"><span>待提交付款申请</span><strong>${needPayoutRequest}</strong></div>
      <div class="metric"><span>财务退回</span><strong>${rejected}</strong></div>
      <div class="metric"><span>可见订单</span><strong>${orders.length}</strong></div>
    </section>
    <section class="section workflow-section">
      <div class="section-head">
        <h2>后端订单处理池</h2>
        <span class="hint">接单、标记渠道、上传客户收款截图、提交渠道付款申请</span>
      </div>
      <div class="table-wrap">
        <table class="workflow-table">
          <thead>
            <tr><th>订单</th><th>客户/项目</th><th>渠道与收款方</th><th>金额</th><th>客户收款截图</th><th>渠道付款申请</th><th>状态</th><th>操作</th></tr>
          </thead>
          <tbody>${orders.length ? orders.map(renderBackendOrderRow).join("") : `<tr><td colspan="8" class="empty">暂无分配给你的订单</td></tr>`}</tbody>
        </table>
      </div>
    </section>
  `;
}

function renderBackendOrderRow(order) {
  const workflow = order.workflow || {};
  const customer = state.customers.find((c) => c.id === order.customerId);
  return `
    <tr>
      <td><strong>${order.orderNo}</strong><br><span class="hint">${orderTypeLabel(order.type)} / ${submittedAtText(order)}</span></td>
      <td>${customer?.name || "未知客户"}<br><span class="hint">${projectSummaryText(order)}</span></td>
      <td>
        <input class="cell-input" data-backend-field="${order.id}:channelName" value="${escapeAttr(order.channelName || "")}" placeholder="实际渠道名称" />
        <input class="cell-input mt-8" data-backend-workflow="${order.id}:payeeName" value="${escapeAttr(workflow.payeeName || "")}" placeholder="收款方名称" />
        <input class="cell-input mt-8" data-backend-workflow="${order.id}:payeeAccount" value="${escapeAttr(workflow.payeeAccount || "")}" placeholder="收款账户" />
        <select class="cell-select mt-8" data-backend-workflow="${order.id}:payeeMethod">
          ${["微信", "支付宝", "银行卡", "PayPal", "其他"].map((item) => `<option ${workflow.payeeMethod === item ? "selected" : ""}>${item}</option>`).join("")}
        </select>
      </td>
      <td>
        <label class="mini-label">应收</label>
        <input class="cell-input small" type="number" step="0.01" data-backend-field="${order.id}:receivable" value="${escapeAttr(order.receivable || 0)}" />
        <label class="mini-label">应付</label>
        <input class="cell-input small" type="number" step="0.01" data-backend-field="${order.id}:payable" value="${escapeAttr(order.payable || 0)}" />
      </td>
      <td>
        ${proofBadge(workflow.customerPaymentProof)}
        <input class="image-input mt-8" type="file" accept="image/*" data-backend-customer-proof="${order.id}" />
        <div class="hint">${workflow.customerPaymentSubmittedAt ? `提交：${shortDateTime(workflow.customerPaymentSubmittedAt)}` : "上传后进入待财务确认"}</div>
      </td>
      <td>
        ${proofBadge(workflow.channelPaymentProof)}
        <input class="image-input mt-8" type="file" accept="image/*" data-backend-channel-proof="${order.id}" />
        <div class="hint">${workflow.payoutRequestSubmittedAt ? `提交：${shortDateTime(workflow.payoutRequestSubmittedAt)}` : "需先上传渠道收款/付款凭证"}</div>
      </td>
      <td>
        ${statusBadge(order.paymentStatus)}
        ${statusBadge(order.payoutStatus)}
        ${workflow.financeRejectReason ? `<div class="reject-note">退回：${escapeHtml(workflow.financeRejectReason)}</div>` : ""}
        ${workflow.collectionRejectReason ? `<div class="reject-note">收款退回：${escapeHtml(workflow.collectionRejectReason)}</div>` : ""}
      </td>
      <td>
        <div class="action-stack">
          <button class="btn ghost" data-backend-accept="${order.id}">已排单</button>
          <button class="btn ghost" data-backend-handled="${order.id}">已出单</button>
          <button class="btn primary" data-backend-submit-payout="${order.id}">提交付款申请</button>
          <button class="btn warn" data-backend-remind="${order.id}">催前端收款</button>
          <button class="btn ghost" data-finance-order-detail="${order.id}">详情</button>
        </div>
      </td>
    </tr>
  `;
}

function renderFinanceWorkspace() {
  const orders = state.orders.filter((o) => !o.voided);
  const pendingCollection = orders.filter((o) => o.paymentStatus === "待财务确认" || (o.workflow?.customerPaymentProof && o.paymentStatus !== "已收款"));
  const pendingPayout = orders.filter((o) => o.workflow?.payoutRequestStatus === "待财务审核" || o.payoutStatus === "待财务审核");
  const todayCollections = orders.filter((o) => String(o.workflow?.financeCollectionConfirmedAt || "").slice(0, 10) === today()).length;
  const todayPayouts = orders.filter((o) => String(o.workflow?.financePayoutConfirmedAt || "").slice(0, 10) === today()).length;
  const openLoop = orders.filter((o) => !isFinanciallyComplete(o)).length;
  return `
    <section class="grid cols-3">
      <div class="metric"><span>待确认收款</span><strong>${pendingCollection.length}</strong></div>
      <div class="metric"><span>待审核付款</span><strong>${pendingPayout.length}</strong></div>
      <div class="metric"><span>未闭环订单</span><strong>${openLoop}</strong></div>
      <div class="metric"><span>今日确认收款</span><strong>${todayCollections}</strong></div>
      <div class="metric"><span>今日已付款</span><strong>${todayPayouts}</strong></div>
      <div class="metric"><span>待付合计</span><strong>¥${money(pendingPayout.reduce((sum, o) => sum + Number(o.payable || 0), 0))}</strong></div>
    </section>
    <section class="section workflow-section">
      <div class="section-head"><h2>收款核对</h2><span class="hint">客户付款截图只代表待确认，财务确认金额后才算已收款</span></div>
      <div class="table-wrap">
        <table class="workflow-table">
          <thead><tr><th>订单</th><th>客户/接单人</th><th>客户付款截图</th><th>应收/实收</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>${pendingCollection.length ? pendingCollection.map(renderCollectionAuditRow).join("") : `<tr><td colspan="6" class="empty">暂无待确认收款</td></tr>`}</tbody>
        </table>
      </div>
    </section>
    <section class="section workflow-section">
      <div class="section-head"><h2>付款审核</h2><span class="hint">核对后端渠道凭证和账户，付款后上传付款截图并确认</span></div>
      <div class="table-wrap">
        <table class="workflow-table">
          <thead><tr><th>订单</th><th>渠道/收款方</th><th>后端凭证</th><th>应付/实付</th><th>财务付款截图</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>${pendingPayout.length ? pendingPayout.map(renderPayoutAuditRow).join("") : `<tr><td colspan="7" class="empty">暂无待审核付款</td></tr>`}</tbody>
        </table>
      </div>
    </section>
  `;
}

function renderCollectionAuditRow(order) {
  const workflow = order.workflow || {};
  const customer = state.customers.find((c) => c.id === order.customerId);
  return `
    <tr>
      <td><strong>${order.orderNo}</strong><br><span class="hint">${orderTypeLabel(order.type)} / ${projectSummaryText(order)}</span></td>
      <td>${customer?.name || "未知客户"}<br><span class="hint">接单：${userName(order.frontendId)}</span></td>
      <td>${proofBadge(workflow.customerPaymentProof)}<br><span class="hint">${workflow.customerPaymentSubmittedAt ? shortDateTime(workflow.customerPaymentSubmittedAt) : "未记录提交时间"}</span></td>
      <td>
        <div>应收 ¥${money(order.receivable || 0)}</div>
        <input class="cell-input small mt-8" type="number" step="0.01" data-finance-field="${order.id}:received" value="${escapeAttr(order.received || order.receivable || 0)}" />
      </td>
      <td>${statusBadge(order.paymentStatus)}${workflow.collectionRejectReason ? `<div class="reject-note">${escapeHtml(workflow.collectionRejectReason)}</div>` : ""}</td>
      <td>
        <div class="action-stack">
          <button class="btn primary" data-finance-confirm-collection="${order.id}">确认收款</button>
          <button class="btn warn" data-finance-reject-collection="${order.id}">退回收款</button>
          <button class="btn ghost" data-finance-order-detail="${order.id}">详情</button>
        </div>
      </td>
    </tr>
  `;
}

function renderPayoutAuditRow(order) {
  const workflow = order.workflow || {};
  return `
    <tr>
      <td><strong>${order.orderNo}</strong><br><span class="hint">${orderTypeLabel(order.type)} / ${projectSummaryText(order)}</span></td>
      <td>
        ${order.channelName || "-"}<br>
        <span class="hint">${workflow.payeeName || "未填收款方"} / ${workflow.payeeMethod || "-"}<br>${workflow.payeeAccount || ""}</span>
      </td>
      <td>${proofBadge(workflow.channelPaymentProof)}<br><span class="hint">${workflow.payoutRequestSubmittedAt ? shortDateTime(workflow.payoutRequestSubmittedAt) : "未提交"}</span></td>
      <td>
        <div>应付 ¥${money(order.payable || 0)}</div>
        <input class="cell-input small mt-8" type="number" step="0.01" data-finance-field="${order.id}:paid" value="${escapeAttr(order.paid || order.payable || 0)}" />
      </td>
      <td>
        ${proofBadge(workflow.financePayoutProof)}
        <input class="image-input mt-8" type="file" accept="image/*" data-finance-payout-proof="${order.id}" />
      </td>
      <td>
        ${statusBadge(workflow.payoutRequestStatus)}
        ${workflow.financeRejectReason ? `<div class="reject-note">${escapeHtml(workflow.financeRejectReason)}</div>` : ""}
      </td>
      <td>
        <div class="action-stack">
          <button class="btn primary" data-finance-confirm-payout="${order.id}">确认付款</button>
          <button class="btn warn" data-finance-reject-payout="${order.id}">退回付款</button>
          <button class="btn ghost" data-finance-order-detail="${order.id}">详情</button>
        </div>
      </td>
    </tr>
  `;
}

function proofBadge(value) {
  return value ? `<span class="tag green">已上传</span>` : `<span class="tag red">未上传</span>`;
}

function statusBadge(value) {
  const text = value || "未处理";
  const color = text.includes("已收") || text.includes("已付") || text.includes("完成") ? "green" : text.includes("退回") ? "red" : "amber";
  return `<span class="tag ${color}">${text}</span>`;
}

function userName(userId) {
  return users.find((u) => u.id === userId)?.name || "-";
}

function shortDateTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
}

function bindFinance() {
  document.querySelectorAll("[data-backend-field]").forEach((input) => {
    input.addEventListener("change", (event) => {
      const [orderId, field] = event.currentTarget.dataset.backendField.split(":");
      const order = state.orders.find((o) => o.id === orderId);
      if (!order) return;
      order[field] = event.currentTarget.type === "number" ? Number(event.currentTarget.value || 0) : event.currentTarget.value;
      log("后端更新订单", `${order.orderNo} / ${field}`);
      saveState();
    });
  });
  document.querySelectorAll("[data-backend-workflow]").forEach((input) => {
    input.addEventListener("change", (event) => {
      const [orderId, field] = event.currentTarget.dataset.backendWorkflow.split(":");
      const order = state.orders.find((o) => o.id === orderId);
      if (!order) return;
      order.workflow ||= {};
      order.workflow[field] = event.currentTarget.value;
      log("后端更新付款信息", `${order.orderNo} / ${field}`);
      saveState();
    });
  });
  document.querySelectorAll("[data-backend-customer-proof]").forEach((input) => {
    input.addEventListener("change", async (event) => {
      const order = state.orders.find((o) => o.id === event.currentTarget.dataset.backendCustomerProof);
      const file = event.currentTarget.files?.[0];
      if (!order || !file) return;
      const dataUrl = await readFileAsDataUrl(file);
      submitCustomerPaymentProof(order, dataUrl);
      addOrderAttachment(order, "customerPayment", dataUrl, "客户收款截图");
      log("提交客户收款截图", order.orderNo);
      saveState();
      toast("收款截图已提交财务确认");
      render();
    });
  });
  document.querySelectorAll("[data-backend-channel-proof]").forEach((input) => {
    input.addEventListener("change", async (event) => {
      const order = state.orders.find((o) => o.id === event.currentTarget.dataset.backendChannelProof);
      const file = event.currentTarget.files?.[0];
      if (!order || !file) return;
      const dataUrl = await readFileAsDataUrl(file);
      order.workflow ||= {};
      order.workflow.channelPaymentProof = dataUrl;
      addOrderAttachment(order, "channelPayment", dataUrl, "渠道收款/付款凭证");
      log("上传渠道付款凭证", order.orderNo);
      saveState();
      toast("渠道凭证已上传");
      render();
    });
  });
  document.querySelectorAll("[data-backend-accept]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const order = state.orders.find((o) => o.id === btn.dataset.backendAccept);
      if (!order) return;
      markBackendAccepted(order);
      log("后端接收订单", order.orderNo);
      saveState();
      render();
    });
  });
  document.querySelectorAll("[data-backend-handled]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const order = state.orders.find((o) => o.id === btn.dataset.backendHandled);
      if (!order) return;
      markBackendHandled(order);
      log("后端处理完成", order.orderNo);
      saveState();
      render();
    });
  });
  document.querySelectorAll("[data-backend-submit-payout]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const order = state.orders.find((o) => o.id === btn.dataset.backendSubmitPayout);
      if (!order) return;
      if (!order.channelName) {
        toast("请先填写实际渠道名称");
        return;
      }
      if (!order.workflow?.channelPaymentProof) {
        toast("请先上传渠道收款或付款凭证");
        return;
      }
      submitPayoutRequest(order);
      log("提交付款申请", `${order.orderNo} / ¥${money(order.payable)}`);
      saveState();
      toast("付款申请已提交财务");
      render();
    });
  });
  document.querySelectorAll("[data-backend-remind]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const order = state.orders.find((o) => o.id === btn.dataset.backendRemind);
      if (!order) return;
      order.workflow ||= {};
      order.workflow.collectionReminderAt = nowIso();
      log("催款提醒", `${order.orderNo} 提醒 ${userName(order.frontendId)} 跟进收款`);
      saveState();
      toast("已记录催款提醒");
    });
  });
  document.querySelectorAll("[data-finance-field]").forEach((input) => {
    input.addEventListener("change", (event) => {
      const [orderId, field] = event.currentTarget.dataset.financeField.split(":");
      const order = state.orders.find((o) => o.id === orderId);
      if (!order) return;
      order[field] = Number(event.currentTarget.value || 0);
      saveState();
    });
  });
  document.querySelectorAll("[data-finance-payout-proof]").forEach((input) => {
    input.addEventListener("change", async (event) => {
      const order = state.orders.find((o) => o.id === event.currentTarget.dataset.financePayoutProof);
      const file = event.currentTarget.files?.[0];
      if (!order || !file) return;
      const dataUrl = await readFileAsDataUrl(file);
      order.workflow ||= {};
      order.workflow.financePayoutProof = dataUrl;
      addOrderAttachment(order, "financePayout", dataUrl, "财务付款截图");
      log("上传财务付款截图", order.orderNo);
      saveState();
      toast("财务付款截图已上传");
      render();
    });
  });
  document.querySelectorAll("[data-finance-confirm-collection]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const order = state.orders.find((o) => o.id === btn.dataset.financeConfirmCollection);
      if (!order) return;
      if (!order.workflow?.customerPaymentProof) {
        toast("缺少客户收款截图，不能确认收款");
        return;
      }
      const inputAmount = document.querySelector(`[data-finance-field="${order.id}:received"]`)?.value;
      confirmCollection(order, inputAmount || order.received || order.receivable);
      log("财务确认收款", `${order.orderNo} / ¥${money(order.received)}`);
      saveState();
      toast("收款已确认");
      render();
    });
  });
  document.querySelectorAll("[data-finance-reject-collection]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const order = state.orders.find((o) => o.id === btn.dataset.financeRejectCollection);
      if (!order) return;
      const reason = prompt("请输入退回原因", order.workflow?.collectionRejectReason || "收款截图或金额异常");
      if (reason === null) return;
      rejectCollection(order, reason);
      log("财务退回收款", `${order.orderNo} / ${reason}`);
      saveState();
      render();
    });
  });
  document.querySelectorAll("[data-finance-confirm-payout]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const order = state.orders.find((o) => o.id === btn.dataset.financeConfirmPayout);
      if (!order) return;
      if (!order.workflow?.financePayoutProof) {
        toast("请先上传财务付款截图");
        return;
      }
      const inputAmount = document.querySelector(`[data-finance-field="${order.id}:paid"]`)?.value;
      confirmPayout(order, inputAmount || order.paid || order.payable);
      log("财务确认付款", `${order.orderNo} / ¥${money(order.paid)}`);
      saveState();
      toast("付款已确认");
      render();
    });
  });
  document.querySelectorAll("[data-finance-reject-payout]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const order = state.orders.find((o) => o.id === btn.dataset.financeRejectPayout);
      if (!order) return;
      const reason = prompt("请输入退回原因", order.workflow?.financeRejectReason || "渠道截图、账户或金额异常");
      if (reason === null) return;
      rejectPayout(order, reason);
      log("财务退回付款", `${order.orderNo} / ${reason}`);
      saveState();
      render();
    });
  });
  document.querySelectorAll("[data-finance-order-detail]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.activeOrderDetailId = btn.dataset.financeOrderDetail;
      saveState();
      render();
    });
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function renderPricing() {
  const isAdmin = currentUser().role === "admin";
  return `
    <section class="section">
      <div class="section-head"><h2>直评业务报价</h2><span class="hint">${isAdmin ? "管理员可修改，演示版暂为只读展示" : "仅管理员可修改"}</span></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>站点</th><th>7天质保</th><th>30天质保</th></tr></thead>
          <tbody>${state.pricing.direct.map((p) => `<tr><td>${p.site}</td><td>${p.warranty7}</td><td>${p.warranty30}</td></tr>`).join("")}</tbody>
        </table>
      </div>
    </section>
    <section class="section">
      <div class="section-head pricing-head">
        <h2>VP 真人业务报价</h2>
        ${renderExchangeRateStrip()}
      </div>
      <div class="grid cols-3">${Object.entries(state.pricing.vpCommissions).map(([k, v]) => `<div class="metric"><span>${k}</span><strong>${v}</strong></div>`).join("")}</div>
    </section>
  `;
}

function renderExchangeRateStrip() {
  const rates = state.pricing.exchangeRates || defaultExchangeRates();
  const updated = rates.updatedAt ? new Date(rates.updatedAt).toLocaleString("zh-CN", { hour12: false }) : "等待实时更新";
  return `
    <div class="exchange-strip" title="实时汇率：1 外币约等于多少人民币。接口不可用时显示参考值。">
      <span class="exchange-title">实时各国汇率</span>
      ${exchangeRateItems
        .map((item) => `<span class="exchange-pill"><b>${item.label}</b>${formatExchangeRate(rates[item.key])}</span>`)
        .join("")}
      <span class="exchange-time">${updated}</span>
    </div>
  `;
}

function formatExchangeRate(value) {
  const n = Number(value || 0);
  if (!n) return "-";
  return n < 0.1 ? n.toFixed(4) : n.toFixed(2);
}

function bindPricing() {
  refreshExchangeRates();
}

async function refreshExchangeRates() {
  if (state.pricing.exchangeRates?.updatedAt && Date.now() - new Date(state.pricing.exchangeRates.updatedAt).getTime() < 24 * 60 * 60 * 1000) return;
  try {
    const response = await fetch("https://api.frankfurter.app/latest?from=CNY&to=USD,GBP,EUR,JPY,CAD,AUD");
    if (!response.ok) throw new Error("rate fetch failed");
    const data = await response.json();
    const nextRates = { ...defaultExchangeRates(), source: "Frankfurter", updatedAt: new Date().toISOString() };
    exchangeRateItems.forEach((item) => {
      const foreignPerCny = Number(data.rates?.[item.key]);
      if (foreignPerCny) nextRates[item.key] = 1 / foreignPerCny;
    });
    state.pricing.exchangeRates = nextRates;
    saveState();
    if (state.activePage === "pricing") render();
  } catch (error) {
    state.pricing.exchangeRates ||= defaultExchangeRates();
    state.pricing.exchangeRates.source = "参考";
    saveState();
  }
}

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
