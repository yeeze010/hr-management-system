import { Body, Controller, Post } from "@nestjs/common";
import { IsString, MinLength } from "class-validator";

class LoginDto {
  @IsString()
  username!: string;

  @IsString()
  @MinLength(4)
  password!: string;
}

@Controller("auth")
export class AuthController {
  @Post("login")
  login(@Body() body: LoginDto) {
    return {
      token: "demo-token",
      user: {
        id: "user-001",
        name: body.username === "admin" ? "系统管理员" : "HR 管理员",
        roles: ["系统管理员", "HR 管理员"],
      },
    };
  }
}
