import { Body, Controller, Get, Post, Query, Req } from "@nestjs/common";
import { AuthRequest, AuthService } from "../auth/auth.service";
import { CreateEmployeeDto } from "./create-employee.dto";
import { HrDataService } from "../shared/hr-data.service";

@Controller()
export class EmployeesController {
  constructor(private readonly auth: AuthService, private readonly data: HrDataService) {}

  @Get("employees")
  employees(@Req() request: AuthRequest, @Query("keyword") keyword = "", @Query("department") department = "全部") {
    const user = this.auth.authenticateRequest(request);
    const canViewDirectory = this.auth.hasPermission(user, "employee:view") || this.auth.hasPermission(user, "employee:manage");
    if (!canViewDirectory && !this.auth.hasPermission(user, "self:view")) {
      this.auth.requirePermission(user, "employee:view");
    }
    return this.data.listEmployees(keyword, department, canViewDirectory ? undefined : user.name);
  }

  @Post("employees")
  create(@Req() request: AuthRequest, @Body() body: CreateEmployeeDto) {
    const user = this.auth.authenticateRequest(request);
    this.auth.requirePermission(user, "employee:manage");
    return this.data.createEmployee(body);
  }

  @Get("departments")
  departments(@Req() request: AuthRequest) {
    const user = this.auth.authenticateRequest(request);
    if (!this.auth.hasPermission(user, "employee:view") && !this.auth.hasPermission(user, "employee:manage")) {
      this.auth.requirePermission(user, "employee:view");
    }
    return this.data.listDepartments();
  }
}
