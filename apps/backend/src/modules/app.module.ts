import { Module } from "@nestjs/common";
import { AuthController } from "./auth/auth.controller";
import { DashboardController } from "./dashboard/dashboard.controller";
import { EmployeesController } from "./employees/employees.controller";
import { HealthController } from "./health/health.controller";
import { ReportsController } from "./reports/reports.controller";
import { WorkflowController } from "./workflow/workflow.controller";
import { HrDataService } from "./shared/hr-data.service";

@Module({
  controllers: [
    AuthController,
    DashboardController,
    EmployeesController,
    HealthController,
    ReportsController,
    WorkflowController,
  ],
  providers: [HrDataService],
})
export class AppModule {}
