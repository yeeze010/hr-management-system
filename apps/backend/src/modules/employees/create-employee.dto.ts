import { IsIn, IsNotEmpty, IsString } from "class-validator";
import { EmployeeStatus } from "../shared/hr-data.service";

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  department!: string;

  @IsString()
  @IsNotEmpty()
  position!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  hireDate!: string;

  @IsIn(["在职", "试用", "待入职", "离职"])
  status!: EmployeeStatus;

  @IsString()
  @IsNotEmpty()
  contractEndDate!: string;
}
