import { Body, Controller, Post } from "@nestjs/common";
import { IsIn, IsString, MinLength } from "class-validator";
import { AuthService, RoleCode } from "./auth.service";

class LoginDto {
  @IsIn(["admin", "hr", "manager", "employee", "finance", "auditor"])
  role!: RoleCode;

  @IsString()
  username!: string;

  @IsString()
  @MinLength(4)
  password!: string;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("login")
  login(@Body() body: LoginDto) {
    return this.auth.login(body);
  }
}
