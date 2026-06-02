import { Controller, Get } from "@nestjs/common";
import { HrDataService } from "../shared/hr-data.service";

@Controller("reports")
export class ReportsController {
  constructor(private readonly data: HrDataService) {}

  @Get("overview")
  overview() {
    return this.data.getReports();
  }
}
