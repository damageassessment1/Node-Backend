import { IsArray, ArrayNotEmpty, IsInt } from "class-validator";

export class AssignPermissionsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  permissionIds: number[];
}
