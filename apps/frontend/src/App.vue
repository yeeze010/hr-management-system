<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import type { DashboardSummary, Employee, EmployeeStatus, ReportOverview, WorkflowTask } from "./api";
import { request } from "./api";

type ViewKey =
  | "dashboard"
  | "people"
  | "recruitment"
  | "lifecycle"
  | "attendance"
  | "service"
  | "talent"
  | "reports"
  | "acceptance";

interface NavItem {
  key: ViewKey;
  label: string;
  description: string;
}

type UserRole = "admin" | "hr" | "manager" | "employee" | "finance" | "auditor";

interface AuthUser {
  id: string;
  role: UserRole;
  username: string;
  name: string;
  roleName: string;
  permissions: string[];
}

interface LoginResult {
  token: string;
  user: AuthUser;
}

interface LifecycleCase {
  id: string;
  employee: string;
  type: string;
  stage: string;
  owner: string;
  due: string;
  progress: number;
  status: string;
}

interface AttendanceRequest {
  id: string;
  employee: string;
  type: string;
  period: string;
  duration: string;
  status: string;
}

interface Candidate {
  id: string;
  name: string;
  role: string;
  owner: string;
  stage: string;
  score: number | null;
  updated: string;
}

interface ServiceRequest {
  id: string;
  title: string;
  applicant: string;
  category: string;
  status: string;
  sla: string;
}

interface AssetRecord {
  assetNo: string;
  name: string;
  holder: string;
  status: string;
  due: string;
}

interface AcceptanceItem {
  area: string;
  item: string;
  owner: string;
  status: "待验证" | "验证中" | "通过";
}

const activeView = ref<ViewKey>("dashboard");
const mobileMenuOpen = ref(false);
const loading = ref(false);
const error = ref("");
const toast = ref("");
const currentUser = ref<AuthUser | null>(null);
const loginForm = reactive<{ role: UserRole; username: string; password: string }>({
  role: "hr",
  username: "hr",
  password: "hr123",
});
const dashboard = ref<DashboardSummary | null>(null);
const employees = ref<Employee[]>([]);
const tasks = ref<WorkflowTask[]>([]);
const reports = ref<ReportOverview | null>(null);
const selectedEmployee = ref<Employee | null>(null);
const showEmployeeForm = ref(false);
const employeeDrawerTab = ref<"overview" | "contract" | "certificate" | "timeline">("overview");

const navItems: NavItem[] = [
  { key: "dashboard", label: "人事总览", description: "全局指标、任务和风险" },
  { key: "people", label: "组织员工", description: "编制、档案与员工名册" },
  { key: "recruitment", label: "招聘入职", description: "候选人推进与入职准备" },
  { key: "lifecycle", label: "异动流程", description: "入转调离全流程跟踪" },
  { key: "attendance", label: "考勤假勤", description: "请假、加班与补卡申请" },
  { key: "service", label: "员工服务", description: "证明、费用、资产与合规" },
  { key: "talent", label: "绩效培训", description: "绩效分布与培训完成率" },
  { key: "reports", label: "经营报表", description: "结构、风险和统计报表" },
  { key: "acceptance", label: "验收中心", description: "闭环检查、材料与发布准备" },
];

const roleOptions: Array<{ role: UserRole; label: string; username: string; password: string; allowedViews: ViewKey[] }> = [
  { role: "admin", label: "系统管理员", username: "admin", password: "admin123", allowedViews: ["dashboard", "people", "recruitment", "lifecycle", "attendance", "service", "talent", "reports", "acceptance"] },
  { role: "hr", label: "HR 管理员", username: "hr", password: "hr123", allowedViews: ["dashboard", "people", "recruitment", "lifecycle", "attendance", "service", "talent", "reports", "acceptance"] },
  { role: "manager", label: "部门主管", username: "manager", password: "manager123", allowedViews: ["dashboard", "people", "lifecycle", "attendance", "reports"] },
  { role: "employee", label: "普通员工", username: "employee", password: "employee123", allowedViews: ["dashboard", "attendance", "service"] },
  { role: "finance", label: "财务角色", username: "finance", password: "finance123", allowedViews: ["dashboard", "people", "reports"] },
  { role: "auditor", label: "只读审计员", username: "auditor", password: "auditor123", allowedViews: ["dashboard", "reports", "acceptance"] },
];

const viewMeta: Record<ViewKey, { eyebrow: string; title: string; summary: string }> = {
  dashboard: {
    eyebrow: "People Operations",
    title: "把流程、名册和风险装进同一个运营台",
    summary: "优先处理 P0 审批、合同临期和待入职准备，让 HR 日常响应和项目验收都能一屏闭环。",
  },
  people: {
    eyebrow: "Organization & Employee",
    title: "组织编制和员工档案在同一张工作台上协同维护",
    summary: "按部门、岗位和状态快速筛选员工，随时进入档案详情补充合同、证书和履历。",
  },
  recruitment: {
    eyebrow: "Recruitment",
    title: "招聘到入职不再断链",
    summary: "候选人从筛选、面试、Offer 到待入职统一推进，交接准备不再落在 Excel 和群聊里。",
  },
  lifecycle: {
    eyebrow: "Lifecycle",
    title: "入转调离每个节点都能追责到人",
    summary: "把员工异动拆成可推进、可提醒、可验收的阶段，避免手续卡住后没人接棒。",
  },
  attendance: {
    eyebrow: "Attendance",
    title: "统一收口假勤申请和审批进度",
    summary: "请假、加班、补卡共用同一入口，提交即生成状态，移动端也能快速处理。",
  },
  service: {
    eyebrow: "Employee Service",
    title: "把高频员工服务做成标准化 SLA",
    summary: "证明、费用、资产和合规提醒在一个看板里处理，适合上线前演示完整业务面。",
  },
  talent: {
    eyebrow: "Talent",
    title: "绩效和培训不再是验收盲区",
    summary: "用清晰的绩效分布和培训推进率说明产品不止能管流程，也能支撑人才发展。",
  },
  reports: {
    eyebrow: "Reports",
    title: "经营层只看关键结构，不看噪音",
    summary: "部门人力、员工状态和风险台账统一口径输出，便于答辩、验收和演示复盘。",
  },
  acceptance: {
    eyebrow: "Acceptance",
    title: "把开发成果和验收材料做成可追踪清单",
    summary: "功能状态、构建验证、文档交付和剩余风险同页可见，方便本轮收口和下一轮接续。",
  },
};

const lifecycleCases = ref<LifecycleCase[]>([
  { id: "LC-1028", employee: "李安", type: "转正", stage: "直属主管评价", owner: "周远", due: "今天 18:00", progress: 60, status: "进行中" },
  { id: "LC-1027", employee: "苏悦", type: "入职", stage: "材料核验", owner: "林青", due: "06-14", progress: 40, status: "进行中" },
  { id: "LC-1026", employee: "王哲", type: "调岗", stage: "新部门确认", owner: "陈卓", due: "06-15", progress: 75, status: "待处理" },
  { id: "LC-1025", employee: "赵宁", type: "离职", stage: "资产归还与归档", owner: "许晴", due: "06-16", progress: 85, status: "待处理" },
]);

const attendanceRequests = ref<AttendanceRequest[]>([
  { id: "AT-018", employee: "许晴", type: "年假", period: "06-12 至 06-14", duration: "3 天", status: "待审批" },
  { id: "AT-017", employee: "李安", type: "补卡", period: "06-05 09:00", duration: "1 次", status: "已通过" },
  { id: "AT-016", employee: "周远", type: "加班", period: "06-03 19:00-22:00", duration: "3 小时", status: "已通过" },
]);

const candidates = ref<Candidate[]>([
  { id: "RC-2041", name: "沈嘉", role: "高级前端工程师", owner: "林青", stage: "面试", score: 88, updated: "今天 10:20" },
  { id: "RC-2040", name: "高越", role: "产品经理", owner: "许晴", stage: "Offer", score: 92, updated: "昨天 16:40" },
  { id: "RC-2039", name: "宋澄", role: "数据分析师", owner: "林青", stage: "筛选", score: 81, updated: "06-05 14:10" },
  { id: "RC-2038", name: "谭宁", role: "客户成功经理", owner: "许晴", stage: "待入职", score: 90, updated: "06-04 11:30" },
]);

const serviceRequests = ref<ServiceRequest[]>([
  { id: "SR-108", title: "在职证明开具", applicant: "李安", category: "员工证明", status: "待处理", sla: "剩余 3 小时" },
  { id: "SR-107", title: "差旅费用报销", applicant: "周远", category: "费用报销", status: "审批中", sla: "剩余 1 天" },
  { id: "SR-106", title: "笔记本归还确认", applicant: "赵宁", category: "资产服务", status: "待处理", sla: "今天到期" },
]);

const assignedAssets = ref<AssetRecord[]>([
  { assetNo: "IT-2026-031", name: "MacBook Pro 14", holder: "李安", status: "使用中", due: "长期领用" },
  { assetNo: "IT-2025-118", name: "ThinkPad X1", holder: "赵宁", status: "待归还", due: "06-16" },
  { assetNo: "AC-2026-009", name: "门禁卡", holder: "苏悦", status: "待领取", due: "入职日领取" },
]);

const acceptanceItems = ref<AcceptanceItem[]>([
  { area: "员工主数据", item: "员工档案、合同、证书和履历可维护且可追踪", owner: "HR 产品组", status: "通过" },
  { area: "组织编制", item: "部门、岗位、职级和编制使用率均可视化", owner: "HR 产品组", status: "通过" },
  { area: "异动流程", item: "入转调离具备状态流转、提醒与节点推进", owner: "流程组", status: "验证中" },
  { area: "考勤假勤", item: "请假、加班、补卡表单与审批结果可演示", owner: "流程组", status: "验证中" },
  { area: "权限审计", item: "角色、下载留痕和敏感信息边界有说明", owner: "平台组", status: "待验证" },
  { area: "部署交付", item: "启动说明、构建结果、健康检查和验收材料齐全", owner: "DevOps", status: "待验证" },
]);

const employeeFilter = reactive({
  keyword: "",
  department: "全部",
  status: "全部",
});

const employeeForm = reactive<{
  name: string;
  department: string;
  position: string;
  phone: string;
  hireDate: string;
  status: EmployeeStatus;
  contractEndDate: string;
}>({
  name: "",
  department: "技术中心",
  position: "",
  phone: "",
  hireDate: "2026-06-16",
  status: "待入职",
  contractEndDate: "2029-06-15",
});

const attendanceForm = reactive({
  employee: "李安",
  type: "请假",
  start: "2026-06-16T09:00",
  end: "2026-06-16T18:00",
  reason: "",
});

const candidateForm = reactive({
  name: "",
  role: "高级前端工程师",
  owner: "林青",
});

const currentView = computed(() => viewMeta[activeView.value]);
const activeRoleOption = computed(() => roleOptions.find((item) => item.role === loginForm.role) ?? roleOptions[1]);
const visibleNavItems = computed(() => navItems.filter((item) => activeRoleOption.value.allowedViews.includes(item.key)));
const departments = computed(() => ["全部", ...(dashboard.value?.departments.map((item) => item.name) ?? [])]);

const filteredEmployees = computed(() =>
  employees.value.filter((employee) => {
    const matchesKeyword =
      !employeeFilter.keyword ||
      [employee.name, employee.employeeNo, employee.position]
        .join(" ")
        .toLowerCase()
        .includes(employeeFilter.keyword.trim().toLowerCase());
    const matchesDepartment = employeeFilter.department === "全部" || employee.department === employeeFilter.department;
    const matchesStatus = employeeFilter.status === "全部" || employee.status === employeeFilter.status;
    return matchesKeyword && matchesDepartment && matchesStatus;
  }),
);

const pendingTasksCount = computed(() => tasks.value.filter((item) => item.status === "待审批").length);
const acceptanceProgress = computed(() =>
  Math.round((acceptanceItems.value.filter((item) => item.status === "通过").length / acceptanceItems.value.length) * 100),
);

const recruitmentSummary = computed(() => [
  { label: "开放岗位", value: "8", hint: "本周新增 2 个补招需求" },
  { label: "活跃候选人", value: String(candidates.value.length), hint: "面试中 1 人，Offer 1 人" },
  { label: "Offer 接受率", value: "82%", hint: "较上月提升 7%" },
  { label: "平均招聘周期", value: "24 天", hint: "目标控制在 28 天内" },
]);

const talentMetrics = computed(() => [
  { label: "绩效确认率", value: "86%", hint: "比上个周期提升 6%" },
  { label: "培训完成率", value: "92%", hint: "3 门课程正在推进" },
  { label: "高绩效人才", value: "18 人", hint: "占比约 24%" },
  { label: "待绩效面谈", value: "7 人", hint: "需要主管本周跟进" },
]);

const serviceHighlights = computed(() => [
  { label: "年假余额", value: "7.5 天", hint: "今年已使用 3 天" },
  { label: "调休余额", value: "12 小时", hint: "最近到期在 06-30" },
  { label: "证明申请", value: "2 项", hint: "平均 4 小时办结" },
  { label: "待归还资产", value: "1 件", hint: "与离职交接联动" },
]);

async function loadAll() {
  loading.value = true;
  error.value = "";
  try {
    [dashboard.value, employees.value, tasks.value, reports.value] = await Promise.all([
      request<DashboardSummary>("/dashboard/summary"),
      request<Employee[]>("/employees"),
      request<WorkflowTask[]>("/workflow-tasks/my"),
      request<ReportOverview>("/reports/overview"),
    ]);
  } catch (value) {
    error.value = value instanceof Error ? value.message : "系统加载失败";
  } finally {
    loading.value = false;
  }
}

function chooseRole(role: UserRole) {
  const option = roleOptions.find((item) => item.role === role);
  loginForm.role = role;
  if (option) {
    loginForm.username = option.username;
    loginForm.password = option.password;
  }
}

async function login() {
  loading.value = true;
  error.value = "";
  try {
    const result = await request<LoginResult>("/auth/login", {
      method: "POST",
      body: JSON.stringify(loginForm),
    });
    currentUser.value = result.user;
    activeView.value = visibleNavItems.value[0]?.key ?? "dashboard";
    await loadAll();
    showToast(`已切换为 ${result.user.roleName}`);
  } catch (value) {
    error.value = value instanceof Error ? value.message : "登录失败，请检查角色、用户名和密码";
  } finally {
    loading.value = false;
  }
}

function logout() {
  currentUser.value = null;
  dashboard.value = null;
  employees.value = [];
  tasks.value = [];
  reports.value = null;
  selectedEmployee.value = null;
  showEmployeeForm.value = false;
  error.value = "";
  toast.value = "";
}

function showToast(message: string) {
  toast.value = message;
  window.setTimeout(() => {
    if (toast.value === message) {
      toast.value = "";
    }
  }, 2400);
}

function switchView(view: ViewKey) {
  activeView.value = view;
  mobileMenuOpen.value = false;
}

function closePanels() {
  selectedEmployee.value = null;
  showEmployeeForm.value = false;
}

function statusTone(status: string) {
  if (["在职", "已通过", "已完成", "通过", "使用中"].includes(status)) {
    return "success";
  }
  if (["试用", "待处理", "待审批", "审批中", "验证中", "待归还", "待领取"].includes(status)) {
    return "warning";
  }
  if (["待入职", "进行中", "面试", "Offer"].includes(status)) {
    return "accent";
  }
  if (["离职", "已驳回"].includes(status)) {
    return "danger";
  }
  return "neutral";
}

function priorityTone(priority: WorkflowTask["priority"]) {
  return priority === "P0" ? "danger" : priority === "P1" ? "warning" : "neutral";
}

function selectEmployee(employee: Employee) {
  selectedEmployee.value = employee;
  employeeDrawerTab.value = "overview";
}

async function handleTaskAction(task: WorkflowTask, action: "approve" | "reject") {
  try {
    const updated = await request<WorkflowTask>(`/workflow-tasks/${task.id}/action`, {
      method: "POST",
      body: JSON.stringify({ action }),
    });
    const index = tasks.value.findIndex((item) => item.id === task.id);
    if (index >= 0) {
      tasks.value[index] = updated;
    }
    showToast(`${task.title}已${action === "approve" ? "通过" : "驳回"}`);
  } catch (value) {
    error.value = value instanceof Error ? value.message : "审批提交失败";
  }
}

async function createEmployee() {
  if (!employeeForm.name.trim() || !employeeForm.position.trim() || !employeeForm.phone.trim()) {
    error.value = "请完整填写员工姓名、岗位和手机号。";
    return;
  }

  try {
    const created = await request<Employee>("/employees", {
      method: "POST",
      body: JSON.stringify(employeeForm),
    });
    employees.value.unshift(created);
    selectedEmployee.value = created;
    showEmployeeForm.value = false;
    employeeDrawerTab.value = "overview";
    employeeForm.name = "";
    employeeForm.position = "";
    employeeForm.phone = "";
    employeeForm.status = "待入职";
    showToast(`已创建 ${created.name} 的员工档案`);
  } catch (value) {
    error.value = value instanceof Error ? value.message : "员工档案创建失败";
  }
}

function submitAttendance() {
  if (!attendanceForm.reason.trim()) {
    error.value = "请填写申请原因。";
    return;
  }

  attendanceRequests.value.unshift({
    id: `AT-${String(attendanceRequests.value.length + 19).padStart(3, "0")}`,
    employee: attendanceForm.employee,
    type: attendanceForm.type,
    period: `${attendanceForm.start.slice(5, 16).replace("T", " ")} 至 ${attendanceForm.end.slice(5, 16).replace("T", " ")}`,
    duration: attendanceForm.type === "补卡" ? "1 次" : "待核算",
    status: "待审批",
  });
  attendanceForm.reason = "";
  error.value = "";
  showToast("考勤申请已提交，等待审批。");
}

function submitCandidate() {
  if (!candidateForm.name.trim()) {
    error.value = "请填写候选人姓名。";
    return;
  }

  candidates.value.unshift({
    id: `RC-${2042 + candidates.value.length}`,
    name: candidateForm.name,
    role: candidateForm.role,
    owner: candidateForm.owner,
    stage: "筛选",
    score: null,
    updated: "刚刚",
  });
  candidateForm.name = "";
  error.value = "";
  showToast("候选人已加入招聘流程。");
}

function advanceCandidate(candidate: Candidate) {
  const stages = ["筛选", "面试", "Offer", "待入职"];
  const nextStage = stages[Math.min(stages.indexOf(candidate.stage) + 1, stages.length - 1)];
  candidate.stage = nextStage;
  candidate.updated = "刚刚";
  showToast(`${candidate.name} 已推进到 ${nextStage}`);
}

function advanceLifecycle(item: LifecycleCase) {
  item.progress = Math.min(100, item.progress + 20);
  item.stage = item.progress === 100 ? "流程归档完成" : "进入下一节点";
  item.status = item.progress === 100 ? "已完成" : "进行中";
  showToast(`${item.employee} 的 ${item.type} 流程已更新`);
}

function resolveService(item: ServiceRequest) {
  item.status = "已完成";
  item.sla = "按时办结";
  showToast(`${item.title} 已处理完成`);
}

function cycleAcceptance(item: AcceptanceItem) {
  item.status = item.status === "待验证" ? "验证中" : item.status === "验证中" ? "通过" : "待验证";
  showToast(`${item.area} 已切换为“${item.status}”`);
}

</script>

<template>
  <section v-if="!currentUser" class="login-screen">
    <div class="login-panel">
      <div class="brand-mark">HR</div>
      <p class="eyebrow">People Operations Suite</p>
      <h1>知行人事管理系统</h1>
      <p>请选择角色，并输入对应用户名和密码。登录前不会加载员工、审批、报表或验收数据。</p>
      <div class="role-grid">
        <button
          v-for="item in roleOptions"
          :key="item.role"
          type="button"
          :class="{ active: loginForm.role === item.role }"
          @click="chooseRole(item.role)"
        >
          <strong>{{ item.label }}</strong>
          <span>{{ item.username }}</span>
        </button>
      </div>
    </div>
    <form class="login-card" @submit.prevent="login">
      <h2>登录系统</h2>
      <label>
        <span>角色</span>
        <select v-model="loginForm.role" @change="chooseRole(loginForm.role)">
          <option v-for="item in roleOptions" :key="item.role" :value="item.role">{{ item.label }}</option>
        </select>
      </label>
      <label>
        <span>用户名</span>
        <input v-model="loginForm.username" autocomplete="username" />
      </label>
      <label>
        <span>密码</span>
        <input v-model="loginForm.password" type="password" autocomplete="current-password" />
      </label>
      <p v-if="error" class="login-error">{{ error }}</p>
      <button class="primary-button" type="submit" :disabled="loading || !loginForm.username || !loginForm.password">
        {{ loading ? "正在登录..." : "进入系统" }}
      </button>
    </form>
  </section>

  <div v-else class="app-shell">
    <aside class="sidebar">
      <div class="brand-card">
        <div class="brand-mark">HR</div>
        <div>
          <p class="eyebrow">People Operations Suite</p>
          <h1>知行人事管理系统</h1>
          <span>面向 HR、部门主管和员工服务台的一体化运营平台</span>
        </div>
      </div>

      <div class="sidebar-summary">
        <span>今日待处理</span>
        <strong>{{ pendingTasksCount }}</strong>
        <small>审批、合同和入职准备优先收口</small>
      </div>

      <nav class="nav-list" aria-label="主导航">
        <button
          v-for="item in visibleNavItems"
          :key="item.key"
          :class="['nav-item', { active: activeView === item.key }]"
          @click="switchView(item.key)"
        >
          <strong>{{ item.label }}</strong>
          <span>{{ item.description }}</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <span class="avatar-chip">{{ currentUser.name.slice(0, 1) }}</span>
        <div>
          <strong>{{ currentUser.name }}</strong>
          <small>{{ currentUser.roleName }}</small>
        </div>
        <button type="button" class="switch-user" @click="logout">切换用户</button>
      </div>
    </aside>

    <main class="main-content">
      <header class="hero-card">
        <div class="hero-copy">
          <button class="menu-toggle" type="button" @click="mobileMenuOpen = true">导航</button>
          <p class="eyebrow">{{ currentView.eyebrow }}</p>
          <h2>{{ currentView.title }}</h2>
          <p class="hero-summary">{{ currentView.summary }}</p>
        </div>
        <div class="hero-actions">
          <button class="secondary-button" type="button" @click="loadAll">重新同步</button>
          <button v-if="currentUser.permissions.includes('employee:manage')" class="primary-button" type="button" @click="showEmployeeForm = true">新增员工档案</button>
        </div>
      </header>

      <section class="quick-strip">
        <article class="quick-item">
          <span>当前模块</span>
          <strong>{{ navItems.find((item) => item.key === activeView)?.label }}</strong>
          <small>桌面与移动端都保留同样的信息主线</small>
        </article>
        <article class="quick-item">
          <span>验收准备度</span>
          <strong>{{ acceptanceProgress }}%</strong>
          <small>功能、文档和构建结果同步收口</small>
        </article>
        <article class="quick-item">
          <span>组织人数</span>
          <strong>{{ employees.length }}</strong>
          <small>员工档案支持直接新增与详情查看</small>
        </article>
      </section>

      <div v-if="error" class="notice error">
        <span>{{ error }}</span>
        <button type="button" class="text-button" @click="error = ''">关闭</button>
      </div>
      <div v-if="loading" class="notice">
        <span>正在同步人事数据与报表，请稍候…</span>
      </div>
      <div v-if="toast" class="toast">{{ toast }}</div>

      <section v-if="activeView === 'dashboard' && dashboard" class="content-stack">
        <div class="metrics-grid">
          <article v-for="metric in dashboard.metrics" :key="metric.label" class="metric-card">
            <span>{{ metric.label }}</span>
            <strong>{{ metric.value }}</strong>
            <small>{{ metric.trend }}</small>
          </article>
        </div>

        <div class="two-column">
          <section class="panel">
            <div class="panel-head">
              <div>
                <p class="section-label">组织与编制</p>
                <h3>按部门看 headcount 和负责人</h3>
              </div>
            </div>
            <div class="department-grid">
              <article v-for="department in dashboard.departments" :key="department.id" class="department-card">
                <span>{{ department.name }}</span>
                <strong>{{ department.headcount }} 人</strong>
                <small>负责人：{{ department.manager }}</small>
                <div class="progress-track">
                  <i :style="{ width: `${Math.min(100, department.headcount * 3)}%` }"></i>
                </div>
              </article>
            </div>
          </section>

          <section class="panel">
            <div class="panel-head">
              <div>
                <p class="section-label">今日待办</p>
                <h3>审批任务与优先级</h3>
              </div>
              <strong class="panel-number">{{ pendingTasksCount }}</strong>
            </div>
            <div class="task-list">
              <article v-for="task in tasks" :key="task.id" class="task-card">
                <div class="task-main">
                  <span :class="['status-badge', priorityTone(task.priority)]">{{ task.priority }}</span>
                  <div>
                    <strong>{{ task.title }}</strong>
                    <small>{{ task.applicant }} · {{ task.bizType }} · {{ task.submittedAt }}</small>
                  </div>
                </div>
                <div class="task-actions">
                  <span :class="['status-badge', statusTone(task.status)]">{{ task.status }}</span>
                  <button
                    v-if="task.status === '待审批'"
                    type="button"
                    class="text-button"
                    @click="handleTaskAction(task, 'approve')"
                  >
                    通过
                  </button>
                  <button
                    v-if="task.status === '待审批'"
                    type="button"
                    class="text-button"
                    @click="handleTaskAction(task, 'reject')"
                  >
                    驳回
                  </button>
                </div>
              </article>
            </div>
          </section>
        </div>

        <div class="two-column">
          <section class="panel">
            <div class="panel-head">
              <div>
                <p class="section-label">风险雷达</p>
                <h3>需要 HR 主动跟进的事项</h3>
              </div>
            </div>
            <div class="risk-list">
              <article v-for="item in reports?.riskItems ?? []" :key="item.item" class="risk-row">
                <div>
                  <strong>{{ item.item }}</strong>
                  <small>责任人：{{ item.owner }}</small>
                </div>
                <b>{{ item.count }}</b>
              </article>
            </div>
          </section>

          <section class="panel">
            <div class="panel-head">
              <div>
                <p class="section-label">最近员工</p>
                <h3>点击即可查看员工档案</h3>
              </div>
            </div>
            <div class="employee-list compact">
              <button
                v-for="employee in dashboard.recentEmployees"
                :key="employee.id"
                type="button"
                class="employee-card interactive"
                @click="selectEmployee(employee)"
              >
                <div class="employee-card-top">
                  <span class="avatar-chip">{{ employee.name.slice(0, 1) }}</span>
                  <div>
                    <strong>{{ employee.name }}</strong>
                    <small>{{ employee.employeeNo }}</small>
                  </div>
                </div>
                <p>{{ employee.department }} · {{ employee.position }}</p>
                <span :class="['status-badge', statusTone(employee.status)]">{{ employee.status }}</span>
              </button>
            </div>
          </section>
        </div>
      </section>

      <section v-if="activeView === 'people'" class="content-stack">
        <section class="panel">
          <div class="panel-head">
            <div>
              <p class="section-label">组织编制</p>
              <h3>编制使用率与管理者分布</h3>
            </div>
            <button type="button" class="secondary-button" @click="showToast('编制调整草稿已创建')">调整编制</button>
          </div>
          <div class="department-grid">
            <article v-for="department in dashboard?.departments ?? []" :key="department.id" class="department-card">
              <span>{{ department.name }}</span>
              <strong>{{ department.headcount }} 人</strong>
              <small>负责人：{{ department.manager }}</small>
              <div class="meta-line">
                <span>编制使用率</span>
                <b>{{ Math.min(98, 70 + department.headcount) }}%</b>
              </div>
            </article>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div>
              <p class="section-label">员工档案</p>
              <h3>搜索、筛选并进入档案详情</h3>
            </div>
            <strong class="panel-number">{{ filteredEmployees.length }}</strong>
          </div>
          <div class="filter-grid">
            <label>
              <span>关键词</span>
              <input v-model="employeeFilter.keyword" type="text" placeholder="姓名、工号或岗位" />
            </label>
            <label>
              <span>部门</span>
              <select v-model="employeeFilter.department">
                <option v-for="department in departments" :key="department" :value="department">{{ department }}</option>
              </select>
            </label>
            <label>
              <span>状态</span>
              <select v-model="employeeFilter.status">
                <option value="全部">全部</option>
                <option value="在职">在职</option>
                <option value="试用">试用</option>
                <option value="待入职">待入职</option>
                <option value="离职">离职</option>
              </select>
            </label>
          </div>

          <div class="employee-list">
            <article v-for="employee in filteredEmployees" :key="employee.id" class="employee-card">
              <div class="employee-card-top">
                <span class="avatar-chip">{{ employee.name.slice(0, 1) }}</span>
                <div>
                  <strong>{{ employee.name }}</strong>
                  <small>{{ employee.employeeNo }}</small>
                </div>
              </div>
              <div class="employee-meta">
                <span>{{ employee.department }}</span>
                <span>{{ employee.position }}</span>
                <span>入职：{{ employee.hireDate }}</span>
                <span>合同到期：{{ employee.contractEndDate }}</span>
              </div>
              <div class="card-footer">
                <span :class="['status-badge', statusTone(employee.status)]">{{ employee.status }}</span>
                <button type="button" class="text-button" @click="selectEmployee(employee)">查看详情</button>
              </div>
            </article>
          </div>
        </section>
      </section>

      <section v-if="activeView === 'recruitment'" class="content-stack">
        <div class="metrics-grid">
          <article v-for="item in recruitmentSummary" :key="item.label" class="metric-card">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
            <small>{{ item.hint }}</small>
          </article>
        </div>

        <div class="two-column">
          <section class="panel">
            <div class="panel-head">
              <div>
                <p class="section-label">候选人流程</p>
                <h3>从筛选到待入职的阶段推进</h3>
              </div>
            </div>
            <div class="candidate-list">
              <article v-for="candidate in candidates" :key="candidate.id" class="candidate-card">
                <div>
                  <strong>{{ candidate.name }} · {{ candidate.role }}</strong>
                  <small>{{ candidate.id }} · 负责人 {{ candidate.owner }} · {{ candidate.updated }}</small>
                </div>
                <div class="candidate-meta">
                  <span>评估分 {{ candidate.score ?? "待评估" }}</span>
                  <span :class="['status-badge', statusTone(candidate.stage)]">{{ candidate.stage }}</span>
                  <button
                    type="button"
                    class="text-button"
                    :disabled="candidate.stage === '待入职'"
                    @click="advanceCandidate(candidate)"
                  >
                    推进阶段
                  </button>
                </div>
              </article>
            </div>
          </section>

          <section class="panel">
            <div class="panel-head">
              <div>
                <p class="section-label">新增候选人</p>
                <h3>创建后自动进入筛选阶段</h3>
              </div>
            </div>
            <form class="form-grid" @submit.prevent="submitCandidate">
              <label>
                <span>候选人姓名</span>
                <input v-model="candidateForm.name" type="text" placeholder="请输入真实姓名" />
              </label>
              <label>
                <span>应聘岗位</span>
                <select v-model="candidateForm.role">
                  <option>高级前端工程师</option>
                  <option>产品经理</option>
                  <option>数据分析师</option>
                  <option>客户成功经理</option>
                </select>
              </label>
              <label>
                <span>招聘负责人</span>
                <select v-model="candidateForm.owner">
                  <option>林青</option>
                  <option>许晴</option>
                </select>
              </label>
              <div class="form-note">
                候选人进入“待入职”后，可继续衔接员工档案创建、设备准备和试用期计划。
              </div>
              <button type="submit" class="primary-button">加入招聘流程</button>
            </form>
          </section>
        </div>
      </section>

      <section v-if="activeView === 'lifecycle'" class="content-stack">
        <section class="panel">
          <div class="panel-head">
            <div>
              <p class="section-label">入转调离</p>
              <h3>每条流程都能逐节点推进</h3>
            </div>
            <button type="button" class="primary-button" @click="showToast('新异动流程草稿已创建')">发起流程</button>
          </div>
          <div class="lifecycle-list">
            <article v-for="item in lifecycleCases" :key="item.id" class="lifecycle-card">
              <div>
                <span class="case-type">{{ item.type }}</span>
                <strong>{{ item.employee }}</strong>
                <small>{{ item.id }} · 负责人 {{ item.owner }} · 截止 {{ item.due }}</small>
              </div>
              <div>
                <span>{{ item.stage }}</span>
                <div class="progress-track large">
                  <i :style="{ width: `${item.progress}%` }"></i>
                </div>
              </div>
              <div class="card-footer">
                <span :class="['status-badge', statusTone(item.status)]">{{ item.status }}</span>
                <button type="button" class="text-button" :disabled="item.progress === 100" @click="advanceLifecycle(item)">
                  推进节点
                </button>
              </div>
            </article>
          </div>
        </section>
      </section>

      <section v-if="activeView === 'attendance'" class="content-stack two-column">
        <section class="panel">
          <div class="panel-head">
            <div>
              <p class="section-label">统一申请入口</p>
              <h3>请假、加班和补卡共用同一表单</h3>
            </div>
          </div>
          <form class="form-grid" @submit.prevent="submitAttendance">
            <label>
              <span>申请人</span>
              <select v-model="attendanceForm.employee">
                <option v-for="employee in employees" :key="employee.id">{{ employee.name }}</option>
              </select>
            </label>
            <label>
              <span>申请类型</span>
              <select v-model="attendanceForm.type">
                <option>请假</option>
                <option>加班</option>
                <option>补卡</option>
              </select>
            </label>
            <label>
              <span>开始时间</span>
              <input v-model="attendanceForm.start" type="datetime-local" />
            </label>
            <label>
              <span>结束时间</span>
              <input v-model="attendanceForm.end" type="datetime-local" />
            </label>
            <label class="span-two">
              <span>申请原因</span>
              <textarea v-model="attendanceForm.reason" rows="4" placeholder="说明业务背景、时间和补充信息"></textarea>
            </label>
            <div class="form-note span-two">提交后自动进入审批队列，并保留移动端可查看的状态结果。</div>
            <button type="submit" class="primary-button span-two">提交审批</button>
          </form>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div>
              <p class="section-label">近期申请</p>
              <h3>考勤状态与审批结果</h3>
            </div>
          </div>
          <div class="simple-list">
            <article v-for="requestItem in attendanceRequests" :key="requestItem.id" class="simple-row">
              <div>
                <strong>{{ requestItem.employee }} · {{ requestItem.type }}</strong>
                <small>{{ requestItem.period }} · {{ requestItem.duration }}</small>
              </div>
              <span :class="['status-badge', statusTone(requestItem.status)]">{{ requestItem.status }}</span>
            </article>
          </div>
        </section>
      </section>

      <section v-if="activeView === 'service'" class="content-stack">
        <div class="metrics-grid">
          <article v-for="item in serviceHighlights" :key="item.label" class="metric-card">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
            <small>{{ item.hint }}</small>
          </article>
        </div>

        <div class="two-column">
          <section class="panel">
            <div class="panel-head">
              <div>
                <p class="section-label">员工服务请求</p>
                <h3>按 SLA 处理证明、报销和资产事务</h3>
              </div>
              <button type="button" class="primary-button" @click="showToast('新服务请求草稿已创建')">发起服务申请</button>
            </div>
            <div class="simple-list">
              <article v-for="item in serviceRequests" :key="item.id" class="service-card">
                <div>
                  <span>{{ item.category }} · {{ item.id }}</span>
                  <strong>{{ item.title }}</strong>
                  <small>{{ item.applicant }} · {{ item.sla }}</small>
                </div>
                <div class="card-footer">
                  <span :class="['status-badge', statusTone(item.status)]">{{ item.status }}</span>
                  <button type="button" class="text-button" :disabled="item.status === '已完成'" @click="resolveService(item)">
                    完成处理
                  </button>
                </div>
              </article>
            </div>
          </section>

          <section class="panel">
            <div class="panel-head">
              <div>
                <p class="section-label">合规与资产</p>
                <h3>证件、合同和资产台账</h3>
              </div>
            </div>
            <div class="simple-list">
              <article v-for="asset in assignedAssets" :key="asset.assetNo" class="asset-card">
                <div>
                  <strong>{{ asset.name }}</strong>
                  <small>{{ asset.assetNo }} · 持有人 {{ asset.holder }} · {{ asset.due }}</small>
                </div>
                <span :class="['status-badge', statusTone(asset.status)]">{{ asset.status }}</span>
              </article>
            </div>
          </section>
        </div>
      </section>

      <section v-if="activeView === 'talent'" class="content-stack">
        <div class="metrics-grid">
          <article v-for="item in talentMetrics" :key="item.label" class="metric-card">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
            <small>{{ item.hint }}</small>
          </article>
        </div>

        <div class="two-column">
          <section class="panel">
            <div class="panel-head">
              <div>
                <p class="section-label">绩效等级分布</p>
                <h3>2026 上半年绩效分布</h3>
              </div>
            </div>
            <div class="bar-chart">
              <article v-for="item in [{ label: 'A', value: 24 }, { label: 'B+', value: 38 }, { label: 'B', value: 26 }, { label: 'C', value: 10 }, { label: 'D', value: 2 }]" :key="item.label">
                <div><i :style="{ height: `${item.value * 3}px` }"></i></div>
                <strong>{{ item.label }}</strong>
                <span>{{ item.value }}%</span>
              </article>
            </div>
          </section>

          <section class="panel">
            <div class="panel-head">
              <div>
                <p class="section-label">培训计划</p>
                <h3>课程推进与完成率</h3>
              </div>
              <button type="button" class="secondary-button" @click="showToast('培训计划草稿已创建')">新建计划</button>
            </div>
            <div class="simple-list">
              <article v-for="item in [{ name: '新员工入职训练营', progress: 78, copy: '12/16 人完成' }, { name: '管理者绩效面谈', progress: 55, copy: '11/20 人完成' }, { name: '信息安全年度培训', progress: 96, copy: '72/75 人完成' }]" :key="item.name" class="training-card">
                <div>
                  <strong>{{ item.name }}</strong>
                  <small>{{ item.copy }}</small>
                </div>
                <div class="progress-with-value">
                  <div class="progress-track">
                    <i :style="{ width: `${item.progress}%` }"></i>
                  </div>
                  <b>{{ item.progress }}%</b>
                </div>
              </article>
            </div>
          </section>
        </div>
      </section>

      <section v-if="activeView === 'reports' && reports" class="content-stack">
        <div class="two-column">
          <section class="panel">
            <div class="panel-head">
              <div>
                <p class="section-label">部门人数</p>
                <h3>识别缺编与超编风险</h3>
              </div>
            </div>
            <div class="horizontal-chart">
              <article v-for="item in reports.headcountByDepartment" :key="item.department">
                <span>{{ item.department }}</span>
                <div class="progress-track chart-track">
                  <i :style="{ width: `${Math.min(100, item.headcount * 2.5)}%` }"></i>
                </div>
                <strong>{{ item.headcount }}</strong>
              </article>
            </div>
          </section>

          <section class="panel">
            <div class="panel-head">
              <div>
                <p class="section-label">员工状态结构</p>
                <h3>当前状态分布</h3>
              </div>
            </div>
            <div class="status-grid">
              <article v-for="item in reports.statusDistribution" :key="item.status" class="status-card">
                <span :class="['status-dot', statusTone(item.status)]"></span>
                <div>
                  <strong>{{ item.status }}</strong>
                  <small>{{ item.count }} 人</small>
                </div>
              </article>
            </div>
          </section>
        </div>

        <section class="panel">
          <div class="panel-head">
            <div>
              <p class="section-label">风险台账</p>
              <h3>合同、审批与档案缺口</h3>
            </div>
            <button type="button" class="secondary-button" @click="showToast('报表导出任务已创建')">导出报告</button>
          </div>
          <div class="simple-list">
            <article v-for="item in reports.riskItems" :key="item.item" class="risk-row large">
              <div>
                <strong>{{ item.item }}</strong>
                <small>责任人：{{ item.owner }}</small>
              </div>
              <div class="risk-number">
                <b>{{ item.count }}</b>
                <button type="button" class="text-button" @click="showToast(`已打开 ${item.item} 清单`)">查看清单</button>
              </div>
            </article>
          </div>
        </section>
      </section>

      <section v-if="activeView === 'acceptance'" class="content-stack">
        <div class="acceptance-hero">
          <div>
            <p class="section-label">Release Readiness</p>
            <h3>本轮验收准备度 {{ acceptanceProgress }}%</h3>
            <p>功能可演示、页面可访问、构建可通过、文档可交付，剩余项继续按清单推进。</p>
          </div>
          <div class="acceptance-ring" :style="{ '--progress': `${acceptanceProgress * 3.6}deg` }">
            <b>{{ acceptanceProgress }}%</b>
          </div>
        </div>

        <section class="panel">
          <div class="panel-head">
            <div>
              <p class="section-label">验收清单</p>
              <h3>逐项推进状态并保留责任人</h3>
            </div>
            <button type="button" class="secondary-button" @click="showToast('验收报告草稿已生成')">生成验收报告</button>
          </div>
          <div class="simple-list">
            <article v-for="item in acceptanceItems" :key="item.item" class="acceptance-card">
              <div>
                <span>{{ item.area }}</span>
                <strong>{{ item.item }}</strong>
                <small>责任人：{{ item.owner }}</small>
              </div>
              <button type="button" :class="['status-button', statusTone(item.status)]" @click="cycleAcceptance(item)">
                {{ item.status }}
              </button>
            </article>
          </div>
        </section>
      </section>
    </main>

    <div v-if="mobileMenuOpen" class="overlay" @click="mobileMenuOpen = false">
      <aside class="mobile-menu" @click.stop>
        <div class="mobile-menu-head">
          <div>
            <p class="eyebrow">Navigation</p>
            <strong>切换业务模块</strong>
          </div>
          <button type="button" class="text-button" @click="mobileMenuOpen = false">关闭</button>
        </div>
        <nav class="nav-list mobile">
          <button v-for="item in visibleNavItems" :key="item.key" :class="['nav-item', { active: activeView === item.key }]" @click="switchView(item.key)">
            <strong>{{ item.label }}</strong>
            <span>{{ item.description }}</span>
          </button>
        </nav>
      </aside>
    </div>

    <div v-if="selectedEmployee" class="overlay" @click="selectedEmployee = null">
      <aside class="drawer" @click.stop>
        <div class="drawer-head">
          <button type="button" class="text-button" @click="selectedEmployee = null">关闭</button>
          <div class="drawer-title">
            <span class="avatar-chip large">{{ selectedEmployee.name.slice(0, 1) }}</span>
            <div>
              <h3>{{ selectedEmployee.name }}</h3>
              <p>{{ selectedEmployee.employeeNo }} · {{ selectedEmployee.status }}</p>
            </div>
          </div>
          <div class="profile-summary">
            <span>{{ selectedEmployee.department }}</span>
            <strong>{{ selectedEmployee.position }}</strong>
            <small>直属主管：周远 · 职级 P6</small>
          </div>
        </div>
        <div class="tab-row">
          <button :class="{ active: employeeDrawerTab === 'overview' }" @click="employeeDrawerTab = 'overview'">档案概览</button>
          <button :class="{ active: employeeDrawerTab === 'contract' }" @click="employeeDrawerTab = 'contract'">合同</button>
          <button :class="{ active: employeeDrawerTab === 'certificate' }" @click="employeeDrawerTab = 'certificate'">证书</button>
          <button :class="{ active: employeeDrawerTab === 'timeline' }" @click="employeeDrawerTab = 'timeline'">履历</button>
        </div>
        <div class="drawer-body">
          <section v-if="employeeDrawerTab === 'overview'" class="detail-section">
            <h4>任职信息</h4>
            <dl class="detail-grid">
              <div><dt>所属部门</dt><dd>{{ selectedEmployee.department }}</dd></div>
              <div><dt>当前岗位</dt><dd>{{ selectedEmployee.position }}</dd></div>
              <div><dt>入职日期</dt><dd>{{ selectedEmployee.hireDate }}</dd></div>
              <div><dt>手机号</dt><dd>{{ selectedEmployee.phone }}</dd></div>
            </dl>
          </section>
          <section v-if="employeeDrawerTab === 'contract'" class="detail-section">
            <h4>劳动合同</h4>
            <article class="document-card">
              <strong>固定期限劳动合同</strong>
              <small>合同到期：{{ selectedEmployee.contractEndDate }}</small>
              <button type="button" class="secondary-button" @click="showToast('合同附件预览已打开')">预览附件</button>
            </article>
          </section>
          <section v-if="employeeDrawerTab === 'certificate'" class="detail-section">
            <h4>证书与资质</h4>
            <article class="document-card">
              <strong>岗位专业能力认证</strong>
              <small>有效期至 2027-12-31</small>
              <button type="button" class="secondary-button" @click="showToast('证书附件预览已打开')">查看证书</button>
            </article>
          </section>
          <section v-if="employeeDrawerTab === 'timeline'" class="detail-section">
            <h4>履历记录</h4>
            <div class="timeline">
              <article>
                <span></span>
                <div>
                  <strong>{{ selectedEmployee.position }} · {{ selectedEmployee.department }}</strong>
                  <small>{{ selectedEmployee.hireDate }} 至今</small>
                </div>
              </article>
              <article>
                <span></span>
                <div>
                  <strong>完成入职培训与账号开通</strong>
                  <small>{{ selectedEmployee.hireDate }}</small>
                </div>
              </article>
            </div>
          </section>
        </div>
      </aside>
    </div>

    <div v-if="showEmployeeForm" class="overlay" @click="closePanels">
      <aside class="drawer form-drawer" @click.stop>
        <div class="drawer-head">
          <button type="button" class="text-button" @click="showEmployeeForm = false">关闭</button>
          <div class="drawer-title">
            <span class="avatar-chip large">新</span>
            <div>
              <h3>创建员工档案</h3>
              <p>保存后可继续补充合同、证书和履历。</p>
            </div>
          </div>
        </div>
        <form class="form-grid drawer-form" @submit.prevent="createEmployee">
          <label>
            <span>员工姓名</span>
            <input v-model="employeeForm.name" type="text" placeholder="请输入真实姓名" />
          </label>
          <label>
            <span>所属部门</span>
            <select v-model="employeeForm.department">
              <option v-for="department in departments.filter((item) => item !== '全部')" :key="department" :value="department">
                {{ department }}
              </option>
            </select>
          </label>
          <label>
            <span>当前岗位</span>
            <input v-model="employeeForm.position" type="text" placeholder="例如：产品经理" />
          </label>
          <label>
            <span>手机号</span>
            <input v-model="employeeForm.phone" type="tel" placeholder="用于员工联系" />
          </label>
          <label>
            <span>入职日期</span>
            <input v-model="employeeForm.hireDate" type="date" />
          </label>
          <label>
            <span>员工状态</span>
            <select v-model="employeeForm.status">
              <option value="待入职">待入职</option>
              <option value="试用">试用</option>
              <option value="在职">在职</option>
              <option value="离职">离职</option>
            </select>
          </label>
          <label class="span-two">
            <span>合同到期日</span>
            <input v-model="employeeForm.contractEndDate" type="date" />
          </label>
          <div class="form-note span-two">员工编号由系统自动生成，创建后会自动跳转到档案详情。</div>
          <div class="drawer-actions span-two">
            <button type="button" class="secondary-button" @click="showEmployeeForm = false">取消</button>
            <button type="submit" class="primary-button">保存员工档案</button>
          </div>
        </form>
      </aside>
    </div>
  </div>
</template>
