<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { DashboardSummary, Employee, WorkflowTask, request } from "./api";

type ViewKey = "dashboard" | "employees" | "workflow" | "reports";

const activeView = ref<ViewKey>("dashboard");
const loading = ref(false);
const error = ref("");

const dashboard = ref<DashboardSummary | null>(null);
const employees = ref<Employee[]>([]);
const tasks = ref<WorkflowTask[]>([]);
const reports = ref<{
  headcountByDepartment: Array<{ department: string; headcount: number }>;
  statusDistribution: Array<{ status: string; count: number }>;
  riskItems: Array<{ item: string; count: number; owner: string }>;
} | null>(null);

const employeeFilter = reactive({
  keyword: "",
  department: "全部",
});

const employeeForm = reactive({
  name: "",
  department: "人力资源部",
  position: "",
  phone: "",
  hireDate: "2026-06-02",
  status: "试用" as Employee["status"],
  contractEndDate: "2029-06-01",
});

const navItems: Array<{ key: ViewKey; label: string; description: string }> = [
  { key: "dashboard", label: "工作台", description: "待办与指标" },
  { key: "employees", label: "员工档案", description: "主数据维护" },
  { key: "workflow", label: "审批中心", description: "流程闭环" },
  { key: "reports", label: "报表中心", description: "人事分析" },
];

const departments = computed(() => {
  const names = new Set(["全部"]);
  dashboard.value?.departments.forEach((item) => names.add(item.name));
  employees.value.forEach((item) => names.add(item.department));
  return Array.from(names);
});

async function loadAll() {
  loading.value = true;
  error.value = "";
  try {
    const [summary, employeeList, taskList, reportData] = await Promise.all([
      request<DashboardSummary>("/dashboard/summary"),
      request<Employee[]>("/employees"),
      request<WorkflowTask[]>("/workflow-tasks/my"),
      request<typeof reports.value>("/reports/overview"),
    ]);
    dashboard.value = summary;
    employees.value = employeeList;
    tasks.value = taskList;
    reports.value = reportData;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "系统加载失败";
  } finally {
    loading.value = false;
  }
}

async function searchEmployees() {
  const params = new URLSearchParams({
    keyword: employeeFilter.keyword,
    department: employeeFilter.department,
  });
  employees.value = await request<Employee[]>(`/employees?${params.toString()}`);
}

async function createEmployee() {
  if (!employeeForm.name || !employeeForm.position || !employeeForm.phone) {
    error.value = "请填写员工姓名、岗位和手机号";
    return;
  }

  const created = await request<Employee>("/employees", {
    method: "POST",
    body: JSON.stringify(employeeForm),
  });
  employees.value = [created, ...employees.value];
  employeeForm.name = "";
  employeeForm.position = "";
  employeeForm.phone = "";
  error.value = "";
}

async function handleTask(task: WorkflowTask, action: "approve" | "reject") {
  const updated = await request<WorkflowTask>(`/workflow-tasks/${task.id}/action`, {
    method: "POST",
    body: JSON.stringify({ action }),
  });
  tasks.value = tasks.value.map((item) => (item.id === updated.id ? updated : item));
}

onMounted(loadAll);
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar" aria-label="主导航">
      <div class="brand">
        <strong>HR 管理系统</strong>
        <span>v0.1.0</span>
      </div>
      <nav>
        <button
          v-for="item in navItems"
          :key="item.key"
          class="nav-item"
          :class="{ active: activeView === item.key }"
          type="button"
          @click="activeView = item.key"
        >
          <span>{{ item.label }}</span>
          <small>{{ item.description }}</small>
        </button>
      </nav>
    </aside>

    <main class="main-panel">
      <header class="topbar">
        <div>
          <p class="eyebrow">企业人事管理后台</p>
          <h1>{{ navItems.find((item) => item.key === activeView)?.label }}</h1>
        </div>
        <button class="primary-button" type="button" @click="loadAll">刷新数据</button>
      </header>

      <section v-if="error" class="notice error" role="alert">{{ error }}</section>
      <section v-if="loading" class="notice">正在加载人事数据...</section>

      <section v-if="activeView === 'dashboard' && dashboard" class="view-stack">
        <div class="metric-grid">
          <article v-for="metric in dashboard.metrics" :key="metric.label" class="metric-card">
            <span>{{ metric.label }}</span>
            <strong>{{ metric.value }}</strong>
            <small>{{ metric.trend }}</small>
          </article>
        </div>

        <div class="two-column">
          <section class="panel">
            <div class="section-title">
              <h2>部门编制</h2>
              <span>按组织口径统计</span>
            </div>
            <div class="department-list">
              <div v-for="dept in dashboard.departments" :key="dept.id" class="department-row">
                <div>
                  <strong>{{ dept.name }}</strong>
                  <span>负责人：{{ dept.manager }}</span>
                </div>
                <b>{{ dept.headcount }}</b>
              </div>
            </div>
          </section>

          <section class="panel">
            <div class="section-title">
              <h2>待办审批</h2>
              <span>主管与 HR 共同处理</span>
            </div>
            <div class="task-list">
              <div v-for="task in dashboard.pendingTasks" :key="task.id" class="task-row">
                <div>
                  <strong>{{ task.title }}</strong>
                  <span>{{ task.bizType }} / {{ task.submittedAt }}</span>
                </div>
                <em>{{ task.priority }}</em>
              </div>
            </div>
          </section>
        </div>
      </section>

      <section v-if="activeView === 'employees'" class="view-stack">
        <section class="panel">
          <div class="section-title">
            <h2>员工查询</h2>
            <span>支持姓名、编号、岗位和部门筛选</span>
          </div>
          <div class="toolbar">
            <label>
              关键词
              <input v-model="employeeFilter.keyword" type="search" placeholder="姓名 / 编号 / 岗位" />
            </label>
            <label>
              部门
              <select v-model="employeeFilter.department">
                <option v-for="dept in departments" :key="dept">{{ dept }}</option>
              </select>
            </label>
            <button class="primary-button" type="button" @click="searchEmployees">查询</button>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>员工编号</th>
                  <th>姓名</th>
                  <th>部门</th>
                  <th>岗位</th>
                  <th>入职日期</th>
                  <th>合同到期</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="employee in employees" :key="employee.id">
                  <td>{{ employee.employeeNo }}</td>
                  <td>{{ employee.name }}</td>
                  <td>{{ employee.department }}</td>
                  <td>{{ employee.position }}</td>
                  <td>{{ employee.hireDate }}</td>
                  <td>{{ employee.contractEndDate }}</td>
                  <td><span class="status-pill">{{ employee.status }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="panel">
          <div class="section-title">
            <h2>新增员工</h2>
            <span>创建后进入员工主数据台账</span>
          </div>
          <form class="form-grid" @submit.prevent="createEmployee">
            <label>姓名<input v-model="employeeForm.name" type="text" /></label>
            <label>部门<select v-model="employeeForm.department"><option v-for="dept in departments.filter((item) => item !== '全部')" :key="dept">{{ dept }}</option></select></label>
            <label>岗位<input v-model="employeeForm.position" type="text" /></label>
            <label>手机号<input v-model="employeeForm.phone" type="tel" /></label>
            <label>入职日期<input v-model="employeeForm.hireDate" type="date" /></label>
            <label>合同到期<input v-model="employeeForm.contractEndDate" type="date" /></label>
            <label>状态<select v-model="employeeForm.status"><option>在职</option><option>试用</option><option>待入职</option><option>离职</option></select></label>
            <button class="primary-button form-submit" type="submit">保存员工</button>
          </form>
        </section>
      </section>

      <section v-if="activeView === 'workflow'" class="panel">
        <div class="section-title">
          <h2>我的审批</h2>
          <span>处理入转调离、请假和岗位编制流程</span>
        </div>
        <div class="task-table">
          <article v-for="task in tasks" :key="task.id" class="approval-card">
            <div>
              <strong>{{ task.title }}</strong>
              <span>申请人：{{ task.applicant }} / 类型：{{ task.bizType }} / {{ task.submittedAt }}</span>
            </div>
            <span class="status-pill">{{ task.status }}</span>
            <div class="actions">
              <button type="button" :disabled="task.status !== '待审批'" @click="handleTask(task, 'approve')">通过</button>
              <button type="button" :disabled="task.status !== '待审批'" @click="handleTask(task, 'reject')">驳回</button>
            </div>
          </article>
        </div>
      </section>

      <section v-if="activeView === 'reports' && reports" class="view-stack">
        <div class="two-column">
          <section class="panel">
            <div class="section-title">
              <h2>部门人数</h2>
              <span>用于编制与人员结构分析</span>
            </div>
            <div class="bar-list">
              <div v-for="item in reports.headcountByDepartment" :key="item.department" class="bar-row">
                <span>{{ item.department }}</span>
                <div><i :style="{ width: `${item.headcount * 2}%` }"></i></div>
                <b>{{ item.headcount }}</b>
              </div>
            </div>
          </section>
          <section class="panel">
            <div class="section-title">
              <h2>风险提醒</h2>
              <span>验收关注的闭环事项</span>
            </div>
            <div class="risk-list">
              <div v-for="item in reports.riskItems" :key="item.item" class="risk-row">
                <strong>{{ item.item }}</strong>
                <span>{{ item.owner }}</span>
                <b>{{ item.count }}</b>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  </div>
</template>
