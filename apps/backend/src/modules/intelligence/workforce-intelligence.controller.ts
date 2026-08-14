import { Body, Controller, Get, Param, Patch, Req } from "@nestjs/common";
import { AuthRequest, AuthService } from "../auth/auth.service";
import { HrDataService } from "../shared/hr-data.service";

@Controller("workforce-intelligence")
export class WorkforceIntelligenceController {
  constructor(private readonly auth: AuthService, private readonly data: HrDataService) {}

  @Get("contract-renewal-risks")
  contractRenewalRisks(@Req() request: AuthRequest) {
    const user = this.auth.authenticateRequest(request);
    if (!this.auth.hasPermission(user, "report:view") && !this.auth.hasPermission(user, "employee:manage")) {
      this.auth.requirePermission(user, "report:view");
    }
    return this.data.getContractRisks();
  }

  @Get("onboarding-checklists")
  onboardingChecklists(@Req() request: AuthRequest) {
    const user = this.auth.authenticateRequest(request);
    if (!this.auth.hasPermission(user, "onboarding:view") && !this.auth.hasPermission(user, "onboarding:manage") && !this.auth.hasPermission(user, "employee:manage")) {
      this.auth.requirePermission(user, "onboarding:view");
    }
    return this.data.listOnboardingChecklists();
  }

  @Patch("onboarding-checklists/:employeeId/items/:itemId")
  completeOnboardingItem(
    @Req() request: AuthRequest,
    @Param("employeeId") employeeId: string,
    @Param("itemId") itemId: string,
    @Body() body: { status?: "done" }
  ) {
    const user = this.auth.authenticateRequest(request);
    if (!this.auth.hasPermission(user, "onboarding:manage") && !this.auth.hasPermission(user, "employee:manage")) {
      this.auth.requirePermission(user, "onboarding:manage");
    }
    return this.data.completeOnboardingItem(employeeId, itemId);
  }
}
