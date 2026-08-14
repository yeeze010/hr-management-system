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
  applicantId?: string;
  period?: string;
  duration?: string;
  reason?: string;
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
let authToken = "";

export function setAuthToken(token: string) {
  authToken = token;
}

export function clearAuthToken() {
  authToken = "";
}

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  headers.set("Content-Type", "application/json");
  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  const response = await fetch(`${API_BASE}/api${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
    const message = Array.isArray(payload?.message) ? payload.message.join("；") : payload?.message;
    throw new Error(message || `请求失败：${response.status}`);
  }

  return response.json() as Promise<T>;
}
