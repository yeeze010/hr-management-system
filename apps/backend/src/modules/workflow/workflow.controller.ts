import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { IsIn, IsNotEmpty, IsString } from "class-validator";
import { AuthRequest, AuthService } from "../auth/auth.service";
import { HrDataService } from "../shared/hr-data.service";

class TaskActionDto {
  @IsIn(["approve", "reject"])
  action!: "approve" | "reject";
}

class CreateAttendanceDto {
  @IsIn(["请假", "加班", "补卡"])
  type!: string;

  @IsString()
  @IsNotEmpty()
  start!: string;

  @IsString()
  @IsNotEmpty()
  end!: string;

  @IsString()
  @IsNotEmpty()
  reason!: string;
}

@Controller("workflow-tasks")
export class WorkflowController {
  constructor(private readonly auth: AuthService, private readonly data: HrDataService) {}

  @Get("my")
  myTasks(@Req() request: AuthRequest) {
    return this.data.listTasks(this.auth.authenticateRequest(request));
  }

  @Post()
  create(@Req() request: AuthRequest, @Body() body: CreateAttendanceDto) {
    const user = this.auth.authenticateRequest(request);
    this.auth.requirePermission(user, "workflow:create");
    return this.data.createAttendanceRequest(user, body);
  }

  @Post(":id/action")
  action(@Req() request: AuthRequest, @Param("id") id: string, @Body() body: TaskActionDto) {
    const user = this.auth.authenticateRequest(request);
    this.auth.requirePermission(user, "workflow:approve");
    return this.data.approveTask(id, body.action);
  }
}
