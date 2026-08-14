import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateEmployeeDto } from "../employees/create-employee.dto";
import type { AuthUser } from "../auth/auth.service";

export type EmployeeStatus = "在职" | "试用" | "待入职" | "离职";

export interface Department {
  id: string;
  name: string;
  parentId: string | null;
  manager: string;
  headcount: number;
}

export interface Employee {
  id: string;
  employeeNo: string;
  name: string;
  department: string;
  position: string;
  phone: string;
  hireDate: string;
  status: EmployeeStatus;
  contractEndDate: string;
}

export interface WorkflowTask {
  id: string;
  title: string;
  applicant: string;
  bizType: string;
  priority: "P0" | "P1" | "P2";
  submittedAt: string;
  status: "待审批" | "已通过" | "已驳回";
  applicantId?: string;
  period?: string;
  duration?: string;
  reason?: string;
}

export interface ContractRisk {
  employeeId: string;
  employeeName: string;
  department: string;
  contractEndDate: string;
  daysRemaining: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  reason: string;
  recommendedActions: string[];
}

export interface OnboardingChecklist {
  employeeId: string;
  employeeName: string;
  owner: string;
  progress: number;
  items: Array<{
    id: string;
    title: string;
    owner: string;
    dueDate: string;
    status: "pending" | "done";
  }>;
}

@Injectable()
export class HrDataService {
  private departments: Department[] = [
    { id: "dept-hr", name: "人力资源部", parentId: null, manager: "林青", headcount: 8 },
    { id: "dept-tech", name: "技术中心", parentId: null, manager: "周远", headcount: 34 },
    { id: "dept-fin", name: "财务部", parentId: null, manager: "许晴", headcount: 10 },
    { id: "dept-sales", name: "销售运营部", parentId: null, manager: "陈卓", headcount: 23 }
  ];

  private employees: Employee[] = [
    {
      id: "emp-001",
      employeeNo: "HR2026001",
      name: "林青",
      department: "人力资源部",
      position: "HR 经理",
      phone: "13800010001",
      hireDate: "2024-03-12",
      status: "在职",
      contractEndDate: "2027-03-11"
    },
    {
      id: "emp-002",
      employeeNo: "HR2026002",
      name: "周远",
      department: "技术中心",
      position: "研发负责人",
      phone: "13800010002",
      hireDate: "2023-09-01",
      status: "在职",
      contractEndDate: "2026-08-31"
    },
    {
      id: "emp-003",
      employeeNo: "HR2026003",
      name: "李安",
      department: "技术中心",
      position: "前端工程师",
      phone: "13800010003",
      hireDate: "2026-05-20",
      status: "试用",
      contractEndDate: "2029-05-19"
    },
    {
      id: "emp-004",
      employeeNo: "HR2026004",
      name: "许晴",
      department: "财务部",
      position: "财务主管",
      phone: "13800010004",
      hireDate: "2022-11-18",
      status: "在职",
      contractEndDate: "2026-07-20"
    },
    {
      id: "emp-005",
      employeeNo: "HR2026005",
      name: "沈嘉",
      department: "销售运营部",
      position: "客户成功经理",
      phone: "13800010005",
      hireDate: "2026-07-01",
      status: "待入职",
      contractEndDate: "2029-06-30"
    }
  ];

  private tasks: WorkflowTask[] = [
    {
      id: "wf-001",
      title: "李安试用期转正审批",
      applicant: "林青",
      bizType: "转正",
      priority: "P0",
      submittedAt: "2026-06-01 09:30",
      status: "待审批"
    },
    {
      id: "wf-002",
      title: "技术中心新增前端岗位申请",
      applicant: "周远",
      bizType: "岗位编制",
      priority: "P1",
      submittedAt: "2026-06-01 14:20",
      status: "待审批"
    },
    {
      id: "wf-003",
      title: "许晴年假申请",
      applicant: "许晴",
      bizType: "请假",
      priority: "P2",
      submittedAt: "2026-06-02 10:05",
      status: "待审批"
    }
  ];

  private onboardingChecklists: OnboardingChecklist[] = [
    this.buildOnboardingChecklist(this.employees[4])
  ];

  getDashboard(user: AuthUser) {
    const canViewDirectory = user.permissions.includes("employee:view") || user.permissions.includes("employee:manage");
    const visibleEmployees = canViewDirectory ? this.employees : this.employees.filter((item) => item.name === user.name);
    const visibleDepartments = canViewDirectory
      ? this.departments
      : this.departments
          .filter((department) => visibleEmployees.some((employee) => employee.department === department.name))
          .map((department) => ({ ...department, headcount: visibleEmployees.filter((employee) => employee.department === department.name).length }));
    const activeEmployees = visibleEmployees.filter((item) => item.status !== "离职").length;
    const contractRisks = this.getContractRisks().filter(
      (item) => visibleEmployees.some((employee) => employee.id === item.employeeId) && (item.riskLevel === "high" || item.riskLevel === "critical"),
    );
    const visibleTasks = this.listTasks(user);

    return {
      metrics: [
        { label: "在册员工", value: activeEmployees, trend: "本月净增 3 人" },
        { label: "待审批流程", value: visibleTasks.filter((item) => item.status === "待审批").length, trend: "含 1 个 P0 事项" },
        { label: "90 天内合同到期", value: contractRisks.length, trend: "需完成续签准备" },
        { label: "本月待入职", value: visibleEmployees.filter((item) => item.status === "待入职").length, trend: "自动生成入职清单" }
      ],
      departments: visibleDepartments,
      recentEmployees: visibleEmployees.slice(0, 5),
      pendingTasks: visibleTasks.filter((item) => item.status === "待审批")
    };
  }

  listEmployees(keyword = "", department = "全部", ownerName?: string) {
    const normalized = keyword.trim().toLowerCase();

    return this.employees.filter((item) => {
      const matchesKeyword =
        !normalized ||
        item.name.toLowerCase().includes(normalized) ||
        item.employeeNo.toLowerCase().includes(normalized) ||
        item.position.toLowerCase().includes(normalized);
      const matchesDepartment = department === "全部" || item.department === department;
      const matchesOwner = !ownerName || item.name === ownerName;
      return matchesKeyword && matchesDepartment && matchesOwner;
    });
  }

  createEmployee(input: CreateEmployeeDto) {
    const nextIndex = this.employees.length + 1;
    const employee: Employee = {
      id: `emp-${String(nextIndex).padStart(3, "0")}`,
      employeeNo: `HR2026${String(nextIndex).padStart(3, "0")}`,
      name: input.name,
      department: input.department,
      position: input.position,
      phone: input.phone,
      hireDate: input.hireDate,
      status: input.status,
      contractEndDate: input.contractEndDate
    };

    this.employees.unshift(employee);
    if (employee.status === "待入职") {
      this.onboardingChecklists.unshift(this.buildOnboardingChecklist(employee));
    }
    return employee;
  }

  listDepartments() {
    return this.departments;
  }

  listTasks(user: AuthUser) {
    if (user.role === "employee") {
      return this.tasks.filter((item) => item.applicantId === user.id || (!item.applicantId && item.applicant === user.name));
    }
    return this.tasks;
  }

  createAttendanceRequest(user: Pick<AuthUser, "id" | "name">, input: { type: string; start: string; end: string; reason: string }) {
    const task: WorkflowTask = {
      id: `wf-${String(this.tasks.length + 1).padStart(3, "0")}`,
      title: `${user.name}${input.type}申请`,
      applicant: user.name,
      applicantId: user.id,
      bizType: input.type,
      priority: input.type === "请假" ? "P1" : "P2",
      submittedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      status: "待审批",
      period: `${input.start} 至 ${input.end}`,
      duration: input.type === "补卡" ? "1 次" : "待核算",
      reason: input.reason,
    };
    this.tasks.unshift(task);
    return task;
  }

  approveTask(id: string, action: "approve" | "reject") {
    const task = this.tasks.find((item) => item.id === id);
    if (!task) {
      throw new NotFoundException("审批任务不存在");
    }

    task.status = action === "approve" ? "已通过" : "已驳回";
    return task;
  }

  getContractRisks(): ContractRisk[] {
    return this.employees
      .filter((employee) => employee.status !== "离职")
      .map((employee) => {
        const daysRemaining = this.daysUntil(employee.contractEndDate);
        const riskLevel: ContractRisk["riskLevel"] = daysRemaining <= 15 ? "critical" : daysRemaining <= 45 ? "high" : daysRemaining <= 90 ? "medium" : "low";
        return {
          employeeId: employee.id,
          employeeName: employee.name,
          department: employee.department,
          contractEndDate: employee.contractEndDate,
          daysRemaining,
          riskLevel,
          reason: daysRemaining <= 90 ? `劳动合同将在 ${daysRemaining} 天内到期` : "合同周期正常",
          recommendedActions:
            daysRemaining <= 90
              ? ["确认部门续签意向", "发起合同续签审批", "补齐绩效与合规材料"]
              : ["保持季度合同风险巡检"]
        };
      })
      .sort((left, right) => left.daysRemaining - right.daysRemaining);
  }

  listOnboardingChecklists() {
    return this.onboardingChecklists;
  }

  completeOnboardingItem(employeeId: string, itemId: string) {
    const checklist = this.onboardingChecklists.find((item) => item.employeeId === employeeId);
    if (!checklist) {
      throw new NotFoundException("入职准备清单不存在");
    }
    const task = checklist.items.find((item) => item.id === itemId);
    if (!task) {
      throw new NotFoundException("入职准备事项不存在");
    }
    task.status = "done";
    checklist.progress = Math.round((checklist.items.filter((item) => item.status === "done").length / checklist.items.length) * 100);
    return checklist;
  }

  getReports() {
    const contractRisks = this.getContractRisks();
    return {
      headcountByDepartment: this.departments.map((dept) => ({
        department: dept.name,
        headcount: dept.headcount
      })),
      statusDistribution: [
        { status: "在职" as const, count: this.employees.filter((item) => item.status === "在职").length },
        { status: "试用" as const, count: this.employees.filter((item) => item.status === "试用").length },
        { status: "待入职" as const, count: this.employees.filter((item) => item.status === "待入职").length },
        { status: "离职" as const, count: this.employees.filter((item) => item.status === "离职").length }
      ],
      riskItems: [
        { item: "合同 45 天内到期", count: contractRisks.filter((item) => item.riskLevel === "high" || item.riskLevel === "critical").length, owner: "HR 经理" },
        { item: "审批超过 24 小时", count: this.tasks.filter((item) => item.status === "待审批" && item.priority === "P0").length, owner: "部门主管" },
        { item: "入职清单未完成", count: this.onboardingChecklists.filter((item) => item.progress < 100).length, owner: "HR 专员" }
      ]
    };
  }

  private buildOnboardingChecklist(employee: Employee): OnboardingChecklist {
    const start = new Date(`${employee.hireDate}T00:00:00+08:00`);
    const due = (offset: number) => {
      const date = new Date(start);
      date.setDate(date.getDate() + offset);
      return date.toISOString().slice(0, 10);
    };

    return {
      employeeId: employee.id,
      employeeName: employee.name,
      owner: "HR 专员",
      progress: 20,
      items: [
        { id: "profile", title: "确认员工档案与证件材料", owner: "HR 专员", dueDate: due(-3), status: "done" },
        { id: "contract", title: "签署劳动合同与保密协议", owner: "HR 专员", dueDate: due(-1), status: "pending" },
        { id: "account", title: "开通邮箱、IM、代码仓库账号", owner: "IT 支持", dueDate: due(0), status: "pending" },
        { id: "asset", title: "发放电脑、门禁卡和办公用品", owner: "行政", dueDate: due(0), status: "pending" },
        { id: "mentor", title: "分配导师并安排首周计划", owner: employee.department, dueDate: due(1), status: "pending" }
      ]
    };
  }

  private daysUntil(dateText: string) {
    const today = new Date("2026-06-25T00:00:00+08:00").getTime();
    const target = new Date(`${dateText}T00:00:00+08:00`).getTime();
    return Math.ceil((target - today) / 86_400_000);
  }
}
