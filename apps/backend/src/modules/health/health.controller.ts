import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  @Get()
  health() {
    return {
      status: "UP",
      service: "人事全流程与组织效能管理系统",
      checkedAt: new Date().toISOString(),
    };
  }
}
