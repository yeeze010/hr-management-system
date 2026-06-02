import { Controller, Get } from "@nestjs/common";
import { HrDataService } from "../shared/hr-data.service";

@Controller("dashboard")
export class DashboardController {
  constructor(private readonly data: HrDataService) {}

  @Get("summary")
  summary() {
    return this.data.getDashboard();
  }
}
