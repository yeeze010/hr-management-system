import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateEmployeeDto } from "../employees/create-employee.dto";

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
}

@Injectable()
export class HrDataService {
  private departments: Department[] = [
    { id: "dept-hr", name: "人力资源部", parentId: null, manager: "林青", headcount: 8 },
    { id: "dept-tech", name: "技术中心", parentId: null, manager: "周远", headcount: 34 },
    { id: "dept-fin", name: "财务部", parentId: null, manager: "许晴", headcount: 10 },
    { id: "dept-sales", name: "销售运营部", parentId: null, manager: "陈卓", headcount: 23 },
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
      contractEndDate: "2027-03-11",
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
      contractEndDate: "2026-08-31",
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
      contractEndDate: "2029-05-19",
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
      contractEndDate: "2026-11-17",
    },
  ];

  private tasks: WorkflowTask[] = [
    {
      id: "wf-001",
      title: "李安试用期转正审批",
      applicant: "林青",
      bizType: "转正",
      priority: "P0",
      submittedAt: "2026-06-01 09:30",
      status: "待审批",
    },
    {
      id: "wf-002",
      title: "技术中心新增前端岗位申请",
      applicant: "周远",
      bizType: "岗位编制",
      priority: "P1",
      submittedAt: "2026-06-01 14:20",
      status: "待审批",
    },
    {
      id: "wf-003",
      title: "许晴年假申请",
      applicant: "许晴",
      bizType: "请假",
      priority: "P2",
      submittedAt: "2026-06-02 10:05",
      status: "待审批",
    },
  ];

  getDashboard() {
    const activeEmployees = this.employees.filter((item) => item.status !== "离职").length;
    return {
      metrics: [
        { label: "在册员工", value: activeEmployees, trend: "+3 本月" },
        { label: "待审批", value: this.tasks.filter((item) => item.status === "待审批").length, trend: "需处理" },
        { label: "合同 90 天内到期", value: 2, trend: "需跟进" },
        { label: "本月入职", value: 4, trend: "+1 较上月" },
      ],
      departments: this.departments,
      recentEmployees: this.employees.slice(0, 5),
      pendingTasks: this.tasks.filter((item) => item.status === "待审批"),
    };
  }

  listEmployees(keyword = "", department = "全部") {
    const normalized = keyword.trim().toLowerCase();
    return this.employees.filter((item) => {
      const matchesKeyword =
        !normalized ||
        item.name.toLowerCase().includes(normalized) ||
        item.employeeNo.toLowerCase().includes(normalized) ||
        item.position.toLowerCase().includes(normalized);
      const matchesDepartment = department === "全部" || item.department === department;
      return matchesKeyword && matchesDepartment;
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
      contractEndDate: input.contractEndDate,
    };
    this.employees.unshift(employee);
    return employee;
  }

  listDepartments() {
    return this.departments;
  }

  listTasks() {
    return this.tasks;
  }

  approveTask(id: string, action: "approve" | "reject") {
    const task = this.tasks.find((item) => item.id === id);
    if (!task) {
      throw new NotFoundException("审批任务不存在");
    }
    task.status = action === "approve" ? "已通过" : "已驳回";
    return task;
  }

  getReports() {
    return {
      headcountByDepartment: this.departments.map((dept) => ({
        department: dept.name,
        headcount: dept.headcount,
      })),
      statusDistribution: [
        { status: "在职", count: this.employees.filter((item) => item.status === "在职").length },
        { status: "试用", count: this.employees.filter((item) => item.status === "试用").length },
        { status: "待入职", count: this.employees.filter((item) => item.status === "待入职").length },
        { status: "离职", count: this.employees.filter((item) => item.status === "离职").length },
      ],
      riskItems: [
        { item: "合同临期", count: 2, owner: "HR 管理员" },
        { item: "待审批超 24 小时", count: 1, owner: "部门主管" },
        { item: "员工档案缺附件", count: 3, owner: "HR 专员" },
      ],
    };
  }
}
