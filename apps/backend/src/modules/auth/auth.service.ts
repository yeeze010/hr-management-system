import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";

export type RoleCode = "admin" | "hr" | "manager" | "employee" | "finance" | "auditor";

export interface AuthUser {
  id: string;
  role: RoleCode;
  username: string;
  name: string;
  roleName: string;
  permissions: string[];
}

export interface AuthRequest {
  headers: Record<string, string | string[] | undefined>;
}

type StoredUser = AuthUser & { password: string };

const users: StoredUser[] = [
  { id: "u-admin", role: "admin", username: "admin", password: "admin123", name: "系统管理员", roleName: "系统管理员", permissions: ["system:manage", "employee:manage", "workflow:approve", "report:view", "audit:view"] },
  { id: "u-hr", role: "hr", username: "hr", password: "hr123", name: "林青", roleName: "HR 管理员", permissions: ["employee:manage", "workflow:approve", "contract:renewal", "onboarding:manage", "report:view"] },
  { id: "u-manager", role: "manager", username: "manager", password: "manager123", name: "周远", roleName: "部门主管", permissions: ["employee:view", "workflow:approve", "onboarding:view", "report:view"] },
  { id: "u-employee", role: "employee", username: "employee", password: "employee123", name: "李安", roleName: "普通员工", permissions: ["self:view", "workflow:create", "service:create"] },
  { id: "u-finance", role: "finance", username: "finance", password: "finance123", name: "许晴", roleName: "财务角色", permissions: ["employee:view", "report:view"] },
  { id: "u-auditor", role: "auditor", username: "auditor", password: "auditor123", name: "审计员", roleName: "只读审计员", permissions: ["audit:view", "report:view"] },
];

@Injectable()
export class AuthService {
  login(input: { role: RoleCode; username: string; password: string }) {
    const user = users.find((item) => item.role === input.role && item.username === input.username && item.password === input.password);
    if (!user) {
      throw new UnauthorizedException("角色、用户名或密码不匹配");
    }

    const { password: _password, ...safeUser } = user;
    return {
      token: Buffer.from(`${safeUser.id}:${safeUser.role}:${Date.now()}`).toString("base64url"),
      user: safeUser,
    };
  }

  authenticateRequest(request: AuthRequest): AuthUser {
    const authorization = request.headers.authorization;
    const header = Array.isArray(authorization) ? authorization[0] : authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedException("请先登录");
    }

    const token = header.slice("Bearer ".length);
    let decoded = "";
    try {
      decoded = Buffer.from(token, "base64url").toString("utf8");
    } catch {
      throw new UnauthorizedException("登录已失效，请重新登录");
    }

    const [userId, role] = decoded.split(":");
    const user = users.find((item) => item.id === userId && item.role === role);
    if (!user) {
      throw new UnauthorizedException("登录已失效，请重新登录");
    }

    const { password: _password, ...safeUser } = user;
    return safeUser;
  }

  hasPermission(user: AuthUser, permission: string) {
    return user.permissions.includes(permission);
  }

  requirePermission(user: AuthUser, permission: string) {
    if (!this.hasPermission(user, permission)) {
      throw new ForbiddenException("当前角色没有执行此操作的权限");
    }
  }
}
