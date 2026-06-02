import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  @Get()
  health() {
    return {
      status: "UP",
      service: "hr-management-backend",
      checkedAt: new Date().toISOString(),
    };
  }
}
