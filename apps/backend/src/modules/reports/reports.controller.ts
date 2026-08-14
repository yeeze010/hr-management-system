import { Controller, Get, Req } from "@nestjs/common";
import { AuthRequest, AuthService } from "../auth/auth.service";
import { HrDataService } from "../shared/hr-data.service";

@Controller("reports")
export class ReportsController {
  constructor(private readonly auth: AuthService, private readonly data: HrDataService) {}

  @Get("overview")
  overview(@Req() request: AuthRequest) {
    const user = this.auth.authenticateRequest(request);
    if (!this.auth.hasPermission(user, "report:view") && !this.auth.hasPermission(user, "audit:view")) {
      this.auth.requirePermission(user, "report:view");
    }
    return this.data.getReports();
  }
}
