import { Controller, Get, Req } from "@nestjs/common";
import { AuthRequest, AuthService } from "../auth/auth.service";
import { HrDataService } from "../shared/hr-data.service";

@Controller("dashboard")
export class DashboardController {
  constructor(private readonly auth: AuthService, private readonly data: HrDataService) {}

  @Get("summary")
  summary(@Req() request: AuthRequest) {
    return this.data.getDashboard(this.auth.authenticateRequest(request));
  }
}
