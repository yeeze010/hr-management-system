import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { CreateEmployeeDto } from "./create-employee.dto";
import { HrDataService } from "../shared/hr-data.service";

@Controller()
export class EmployeesController {
  constructor(private readonly data: HrDataService) {}

  @Get("employees")
  employees(@Query("keyword") keyword = "", @Query("department") department = "全部") {
    return this.data.listEmployees(keyword, department);
  }

  @Post("employees")
  create(@Body() body: CreateEmployeeDto) {
    return this.data.createEmployee(body);
  }

  @Get("departments")
  departments() {
    return this.data.listDepartments();
  }
}
