import { IsNotEmpty } from "class-validator";

export class AddExtraDataDto{
    @IsNotEmpty()
    extraData: string;
}