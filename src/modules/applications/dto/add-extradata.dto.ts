import { IsJSON, IsNotEmpty } from "class-validator";

export class AddExtraDataDto{
    @IsJSON()
    extraData: string;
}