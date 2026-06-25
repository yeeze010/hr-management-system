import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { HrDataService } from "../shared/hr-data.service";

@Controller("workforce-intelligence")
export class WorkforceIntelligenceController {
  constructor(private readonly data: HrDataService) {}

  @Get("contract-renewal-risks")
  contractRenewalRisks() {
    return this.data.getContractRisks();
  }

  @Get("onboarding-checklists")
  onboardingChecklists() {
    return this.data.listOnboardingChecklists();
  }

  @Patch("onboarding-checklists/:employeeId/items/:itemId")
  completeOnboardingItem(
    @Param("employeeId") employeeId: string,
    @Param("itemId") itemId: string,
    @Body() body: { status?: "done" }
  ) {
    return this.data.completeOnboardingItem(employeeId, itemId);
  }
}
