export type EmployeeStatus = "在职" | "试用" | "待入职" | "离职";

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

export interface DashboardSummary {
  metrics: Array<{ label: string; value: number; trend: string }>;
  departments: Array<{ id: string; name: string; manager: string; headcount: number }>;
  recentEmployees: Employee[];
  pendingTasks: WorkflowTask[];
}

export interface ReportOverview {
  headcountByDepartment: Array<{ department: string; headcount: number }>;
  statusDistribution: Array<{ status: EmployeeStatus; count: number }>;
  riskItems: Array<{ item: string; count: number; owner: string }>;
}

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}/api${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`请求失败：${response.status}`);
  }

  return response.json() as Promise<T>;
}
