import { Body, Controller, UnauthorizedException, Post } from "@nestjs/common";
import { IsIn, IsString, MinLength } from "class-validator";

type RoleCode = "admin" | "hr" | "manager" | "employee" | "finance" | "auditor";

class LoginDto {
  @IsIn(["admin", "hr", "manager", "employee", "finance", "auditor"])
  role!: RoleCode;

  @IsString()
  username!: string;

  @IsString()
  @MinLength(4)
  password!: string;
}

const users: Array<{
  id: string;
  role: RoleCode;
  username: string;
  password: string;
  name: string;
  roleName: string;
  permissions: string[];
}> = [
  { id: "u-admin", role: "admin", username: "admin", password: "admin123", name: "系统管理员", roleName: "系统管理员", permissions: ["system:manage", "employee:manage", "workflow:approve", "report:view", "audit:view"] },
  { id: "u-hr", role: "hr", username: "hr", password: "hr123", name: "林青", roleName: "HR 管理员", permissions: ["employee:manage", "workflow:approve", "contract:renewal", "onboarding:manage", "report:view"] },
  { id: "u-manager", role: "manager", username: "manager", password: "manager123", name: "周远", roleName: "部门主管", permissions: ["employee:view", "workflow:approve", "onboarding:view", "report:view"] },
  { id: "u-employee", role: "employee", username: "employee", password: "employee123", name: "李安", roleName: "普通员工", permissions: ["self:view", "workflow:create", "service:create"] },
  { id: "u-finance", role: "finance", username: "finance", password: "finance123", name: "许晴", roleName: "财务角色", permissions: ["employee:view", "report:view"] },
  { id: "u-auditor", role: "auditor", username: "auditor", password: "auditor123", name: "审计员", roleName: "只读审计员", permissions: ["audit:view", "report:view"] }
];

@Controller("auth")
export class AuthController {
  @Post("login")
  login(@Body() body: LoginDto) {
    const user = users.find((item) => item.role === body.role && item.username === body.username && item.password === body.password);
    if (!user) {
      throw new UnauthorizedException("角色、用户名或密码不匹配");
    }

    const { password: _password, ...safeUser } = user;
    return {
      token: Buffer.from(`${safeUser.id}:${safeUser.role}:${Date.now()}`).toString("base64url"),
      user: safeUser
    };
  }
}
