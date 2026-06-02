import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { IsIn } from "class-validator";
import { HrDataService } from "../shared/hr-data.service";

class TaskActionDto {
  @IsIn(["approve", "reject"])
  action!: "approve" | "reject";
}

@Controller("workflow-tasks")
export class WorkflowController {
  constructor(private readonly data: HrDataService) {}

  @Get("my")
  myTasks() {
    return this.data.listTasks();
  }

  @Post(":id/action")
  action(@Param("id") id: string, @Body() body: TaskActionDto) {
    return this.data.approveTask(id, body.action);
  }
}
